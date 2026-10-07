import crypto from 'crypto';
import { getRazorpay } from '../config/razorpay.js';
import Booking from '../models/Booking.js';
import PaymentWebhookLog from '../models/PaymentWebhookLog.js';

/**
 * Check if mock payments are allowed in the current environment
 */
export const isMockPaymentsAllowed = () => {
  return process.env.NODE_ENV !== 'production' && process.env.ALLOW_MOCK_PAYMENTS === 'true';
};

// Safe timing comparison to prevent timing attacks
const safeTimingCompare = (a, b) => {
  try {
    const bufA = Buffer.from(String(a || ''), 'utf8');
    const bufB = Buffer.from(String(b || ''), 'utf8');
    if (bufA.length !== bufB.length) return false;
    return crypto.timingSafeEqual(bufA, bufB);
  } catch {
    return false;
  }
};

/**
 * Shared Payment Confirmation Service
 * Used by verifyPayment and webhook handler to ensure atomic, idempotent confirmation
 */
export const confirmBookingPayment = async (booking, { razorpayPaymentId, razorpaySignature, method = 'razorpay', webhookVerified = false }) => {
  if (booking.payment?.status === 'paid' && booking.status === 'confirmed') {
    return booking; // already confirmed & paid
  }

  booking.payment.status = 'paid';
  if (razorpayPaymentId) booking.payment.razorpayPaymentId = razorpayPaymentId;
  if (razorpaySignature) booking.payment.razorpaySignature = razorpaySignature;
  booking.payment.method = method;
  booking.payment.paidAt = new Date();
  if (webhookVerified) {
    booking.payment.webhookVerified = true;
    booking.payment.webhookReceivedAt = new Date();
  }
  booking.status = 'confirmed';
  await booking.save();

  const populated = await booking.populate([
    { path: 'property', select: 'title location images' },
    { path: 'guest', select: 'name email' },
    { path: 'host', select: 'name email' }
  ]);

  try {
    const { sendBookingConfirmation, sendHostBookingNotification } = await import('../utils/mailTemplates.js');
    if (populated.guest && populated.property) {
      sendBookingConfirmation(populated, populated.guest, populated.property).catch(() => {});
    }
    if (populated.host && populated.property && populated.guest) {
      sendHostBookingNotification(populated, populated.host, populated.property, populated.guest).catch(() => {});
    }
  } catch (err) {
    console.error('Email dispatch error on payment confirmation:', err);
  }

  return populated;
};

/**
 * Create a Razorpay Order with Idempotency Support
 * Prevents duplicate orders and verifies booking validity
 */
export const createRazorpayOrder = async (req, res) => {
  try {
    const { bookingId, idempotencyKey } = req.body;
    const clientKey = idempotencyKey || req.headers['x-idempotency-key'];

    const booking = await Booking.findById(bookingId).populate('property');

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    if (booking.guest.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized for this booking' });
    }

    // 1. Booking Status Guard
    if (booking.status === 'cancelled') {
      return res.status(409).json({ success: false, message: 'This booking has been cancelled and cannot be paid' });
    }
    if (booking.status === 'confirmed' || booking.payment?.status === 'paid') {
      return res.status(400).json({ success: false, message: 'This booking is already paid and confirmed' });
    }

    // 2. Expiry Guard (30 minutes)
    const PENDING_EXPIRY_MS = 30 * 60 * 1000;
    if (Date.now() - new Date(booking.createdAt).getTime() > PENDING_EXPIRY_MS) {
      booking.status = 'cancelled';
      booking.cancellation = {
        cancelledAt: new Date(),
        reason: 'Auto-expired: payment not completed within 30 minutes'
      };
      await booking.save();
      return res.status(409).json({ success: false, message: 'Booking session has expired. Please create a new booking.' });
    }

    // 3. Overlap check against newly confirmed bookings
    const overlapping = await Booking.find({
      property: booking.property._id,
      status: 'confirmed',
      _id: { $ne: booking._id },
      $or: [
        { checkIn: { $lt: booking.checkOut }, checkOut: { $gt: booking.checkIn } }
      ]
    });

    if (overlapping.length > 0) {
      booking.status = 'cancelled';
      booking.cancellation = {
        cancelledAt: new Date(),
        reason: 'Dates became unavailable before payment'
      };
      await booking.save();
      return res.status(409).json({ success: false, message: 'Selected dates are no longer available. Please select different dates.' });
    }

    // 4. Idempotency check: if an order exists with this key for this booking, return it
    if (clientKey && booking.payment?.idempotencyKey === clientKey && booking.payment?.razorpayOrderId) {
      return res.json({
        success: true,
        order: {
          id: booking.payment.razorpayOrderId,
          amount: Math.round(booking.pricing.totalAmount * 100),
          currency: 'INR'
        },
        key: process.env.RAZORPAY_KEY_ID || 'rzp_test_mock_key',
        idempotentReused: true,
        booking
      });
    }

    const razorpay = getRazorpay();

    if (!razorpay) {
      if (!isMockPaymentsAllowed()) {
        return res.status(500).json({ success: false, message: 'Payment gateway is not configured on the server.' });
      }

      // Mock order strictly for allowed dev/demo environments
      const mockOrder = {
        id: `order_mock_${Date.now()}`,
        amount: Math.round(booking.pricing.totalAmount * 100),
        currency: 'INR',
        receipt: `receipt_${booking._id}`,
        status: 'created'
      };
      booking.payment.razorpayOrderId = mockOrder.id;
      if (clientKey) booking.payment.idempotencyKey = clientKey;
      await booking.save();

      return res.json({
        success: true,
        order: mockOrder,
        key: 'rzp_test_mock_key',
        mocked: true,
        booking
      });
    }

    const options = {
      amount: Math.round(booking.pricing.totalAmount * 100), // in paise
      currency: 'INR',
      receipt: `receipt_${booking._id}_${Date.now()}`,
      notes: {
        bookingId: booking._id.toString(),
        propertyTitle: booking.property?.title || 'Homexa Stay'
      }
    };

    const order = await razorpay.orders.create(options);

    booking.payment.razorpayOrderId = order.id;
    if (clientKey) booking.payment.idempotencyKey = clientKey;
    await booking.save();

    res.json({
      success: true,
      order,
      key: process.env.RAZORPAY_KEY_ID,
      booking
    });
  } catch (error) {
    console.error('Razorpay order error:', error);
    res.status(500).json({ success: false, message: 'Failed to create payment order' });
  }
};

/**
 * Standard Client-side Verification (Fallback / Immediate redirect)
 * Validates HMAC SHA-256 signature, booking ownership, and prevents signature reuse
 */
export const verifyPayment = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, bookingId } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !bookingId) {
      return res.status(400).json({ success: false, message: 'Missing payment details' });
    }

    const booking = await Booking.findById(bookingId).populate('property');
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    // 1. Authorization: Only the guest who booked or admin can verify payment
    if (booking.guest.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to verify payment for this booking' });
    }

    // 2. Prevent signature replay: Ensure razorpay_order_id matches the order generated for this specific booking
    if (!booking.payment?.razorpayOrderId || booking.payment.razorpayOrderId !== razorpay_order_id) {
      return res.status(400).json({ success: false, message: 'Payment order ID does not match this booking record' });
    }

    // 3. Status checks
    if (booking.status === 'cancelled') {
      return res.status(409).json({ success: false, message: 'Cannot verify payment for a cancelled booking' });
    }

    if (booking.payment?.status === 'paid') {
      // Already paid (e.g. verified by webhook earlier)
      return res.json({
        success: true,
        message: 'Payment already verified and confirmed',
        booking
      });
    }

    // 4. Cryptographic Signature Validation
    const isMockOrder = razorpay_order_id.startsWith('order_mock_');
    let isValid = false;

    if (isMockOrder) {
      if (!isMockPaymentsAllowed()) {
        return res.status(400).json({ success: false, message: 'Mock payments are disabled in this environment' });
      }
      isValid = (razorpay_signature === 'mock_signature');
    } else {
      const keySecret = process.env.RAZORPAY_KEY_SECRET;
      if (!keySecret) {
        return res.status(500).json({ success: false, message: 'Server payment configuration missing' });
      }

      const body = razorpay_order_id + '|' + razorpay_payment_id;
      const expectedSignature = crypto
        .createHmac('sha256', keySecret)
        .update(body.toString())
        .digest('hex');

      isValid = safeTimingCompare(expectedSignature, razorpay_signature);
    }

    if (!isValid) {
      return res.status(400).json({ success: false, message: 'Invalid payment signature' });
    }

    // 5. Atomic confirmation and notifications
    const confirmedBooking = await confirmBookingPayment(booking, {
      razorpayPaymentId: razorpay_payment_id,
      razorpaySignature: razorpay_signature,
      method: 'razorpay'
    });

    res.json({
      success: true,
      message: 'Payment verified and booking confirmed',
      booking: confirmedBooking
    });
  } catch (error) {
    console.error('Payment verify error:', error);
    res.status(500).json({ success: false, message: 'Payment verification failed' });
  }
};

/**
 * Production-Grade Razorpay Webhook Handler
 * - HMAC SHA-256 cryptographic signature validation
 * - Idempotency enforcement to eliminate duplicate transactions
 * - Handles payment.captured, order.paid, payment.failed, and refund.processed
 */
export const handleRazorpayWebhook = async (req, res) => {
  try {
    const signature = req.headers['x-razorpay-signature'];
    const secret = process.env.RAZORPAY_WEBHOOK_SECRET;

    if (!secret && !isMockPaymentsAllowed()) {
      console.error('⚠️ Razorpay Webhook Error: RAZORPAY_WEBHOOK_SECRET is not configured!');
      return res.status(500).json({ success: false, message: 'Webhook secret is not configured on server' });
    }

    const effectiveSecret = secret || 'homexa_dev_secret';

    // 1. Verify Cryptographic Signature
    const rawPayload = req.rawBody ? req.rawBody.toString('utf8') : JSON.stringify(req.body);
    const expectedSignature = crypto
      .createHmac('sha256', effectiveSecret)
      .update(rawPayload)
      .digest('hex');

    const isMock = isMockPaymentsAllowed() && (req.body?.isMockWebhook || signature === 'mock_webhook_signature');
    const isSignatureValid = isMock || (signature && safeTimingCompare(expectedSignature, signature));

    if (!isSignatureValid) {
      console.warn('⚠️ Razorpay Webhook: Invalid HMAC Signature received!');
      return res.status(400).json({ success: false, message: 'Invalid webhook signature' });
    }

    const event = req.body;
    // Razorpay standard header provides x-razorpay-event-id
    const eventId = req.headers['x-razorpay-event-id'] || event.id || `evt_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
    const eventType = event.event;

    // 2. Idempotency Check: Prevent duplicate event processing
    const existingLog = await PaymentWebhookLog.findOne({ eventId });
    if (existingLog && existingLog.status === 'processed') {
      return res.status(200).json({
        success: true,
        duplicate: true,
        message: 'Event already processed'
      });
    }

    // Create or update log entry
    let log = existingLog || new PaymentWebhookLog({
      eventId,
      event: eventType,
      signatureVerified: true,
      payload: event,
      status: 'received'
    });

    // 3. Process event according to Razorpay specification
    const paymentEntity = event.payload?.payment?.entity || {};
    const orderEntity = event.payload?.order?.entity || {};
    const refundEntity = event.payload?.refund?.entity || {};

    const orderId = paymentEntity.order_id || orderEntity.id;
    const paymentId = paymentEntity.id;
    const notes = paymentEntity.notes || orderEntity.notes || {};
    const bookingId = notes.bookingId;

    log.orderId = orderId;
    log.paymentId = paymentId;

    // Find the associated booking
    let booking = null;
    if (bookingId) {
      booking = await Booking.findById(bookingId);
    } else if (orderId) {
      booking = await Booking.findOne({ 'payment.razorpayOrderId': orderId });
    }

    if (booking) {
      log.bookingId = booking._id;
    }

    switch (eventType) {
      case 'payment.captured':
      case 'order.paid': {
        if (booking) {
          // Verify captured amount matches
          const expectedAmount = Math.round(booking.pricing.totalAmount * 100);
          if (paymentEntity.amount && paymentEntity.amount < expectedAmount) {
            console.warn(`Webhook amount mismatch for booking ${booking._id}: expected ${expectedAmount}, received ${paymentEntity.amount}`);
            log.error = `Amount mismatch: expected ${expectedAmount}, received ${paymentEntity.amount}`;
            log.status = 'failed';
            await log.save();
            return res.status(400).json({ success: false, message: 'Payment amount mismatch' });
          }

          await confirmBookingPayment(booking, {
            razorpayPaymentId: paymentId,
            method: paymentEntity.method || 'razorpay',
            webhookVerified: true
          });
        }
        break;
      }

      case 'payment.failed': {
        if (booking) {
          booking.payment.status = 'failed';
          booking.payment.failureReason = paymentEntity.error_description || paymentEntity.error_reason || 'Payment failed';
          await booking.save();
        }
        break;
      }

      case 'refund.processed':
      case 'refund.created': {
        if (booking) {
          booking.payment.status = 'refunded';
          booking.payment.refundId = refundEntity.id || paymentEntity.refund_id;
          booking.status = 'cancelled';
          await booking.save();
        }
        break;
      }

      default:
        console.log(`Razorpay Webhook: Unhandled event type ${eventType}`);
    }

    log.status = 'processed';
    log.processedAt = new Date();
    await log.save();

    res.status(200).json({
      success: true,
      message: `Webhook ${eventType} processed successfully`,
      eventId,
      bookingId: booking?._id
    });
  } catch (error) {
    console.error('Razorpay Webhook Error:', error);
    res.status(500).json({ success: false, message: 'Internal webhook processing error' });
  }
};

/**
 * Developer & Demo Webhook Simulator
 * Strictly permitted when ALLOW_MOCK_PAYMENTS is true and user is authorized
 */
export const simulateWebhook = async (req, res) => {
  try {
    if (!isMockPaymentsAllowed()) {
      return res.status(403).json({ success: false, message: 'Webhook simulation is disabled in this environment' });
    }

    const { bookingId, eventType = 'payment.captured' } = req.body;
    const booking = await Booking.findById(bookingId).populate('property');

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    // Must be the guest or admin
    if (booking.guest.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized for this booking' });
    }

    const mockEventId = `sim_evt_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
    const mockPaymentId = `pay_webhook_${Date.now()}`;
    const orderId = booking.payment?.razorpayOrderId || `order_sim_${Date.now()}`;

    const simulatedPayload = {
      id: mockEventId,
      entity: 'event',
      event: eventType,
      contains: ['payment'],
      isMockWebhook: true,
      payload: {
        payment: {
          entity: {
            id: mockPaymentId,
            order_id: orderId,
            amount: Math.round(booking.pricing.totalAmount * 100),
            currency: 'INR',
            status: eventType === 'payment.failed' ? 'failed' : 'captured',
            method: 'upi',
            notes: {
              bookingId: booking._id.toString(),
              propertyTitle: booking.property?.title
            }
          }
        }
      }
    };

    req.body = simulatedPayload;
    req.headers['x-razorpay-signature'] = 'mock_webhook_signature';

    return handleRazorpayWebhook(req, res);
  } catch (error) {
    console.error('Webhook simulation error:', error);
    res.status(500).json({ success: false, message: 'Webhook simulation failed' });
  }
};

/**
 * Get Webhook Audit Logs for a Booking
 * Enforces authorization checks
 */
export const getWebhookAuditLogs = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const booking = await Booking.findById(bookingId);

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    if (booking.guest.toString() !== req.user._id.toString() && booking.host.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to view webhook audit logs for this booking' });
    }

    const logs = await PaymentWebhookLog.find({ bookingId })
      .sort({ createdAt: -1 })
      .limit(10);

    res.json({ success: true, logs });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch webhook audit logs' });
  }
};

export const getPaymentStatus = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.bookingId);
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }
    if (booking.guest.toString() !== req.user._id.toString() && booking.host.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }
    res.json({ success: true, payment: booking.payment, status: booking.status });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to get payment status' });
  }
};
