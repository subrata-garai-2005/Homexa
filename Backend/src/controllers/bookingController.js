import Booking from '../models/Booking.js';
import Property from '../models/Property.js';
import { sendBookingConfirmation, sendHostBookingNotification } from '../utils/mailTemplates.js';

export const calculatePricing = (rate, checkIn, checkOut, priceUnit = 'night') => {
  const start = new Date(checkIn);
  const end = new Date(checkOut);
  const diffMs = end.getTime() - start.getTime();
  const nights = Math.max(1, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));

  let subtotal = 0;
  if (priceUnit === 'month') {
    const dailyProrated = rate / 30;
    subtotal = Math.round(dailyProrated * nights);
  } else {
    subtotal = rate * nights;
  }

  const cleaningFee = 0;
  const serviceFee = 0;
  const taxes = 0;
  const totalAmount = subtotal + cleaningFee + serviceFee + taxes;
  return { nights, subtotal, cleaningFee, serviceFee, taxes, totalAmount };
};

// Auto-expire stale pending bookings older than 30 minutes
const expireStalePendingBookings = async (propertyId) => {
  const PENDING_EXPIRY_MS = 30 * 60 * 1000; // 30 minutes
  const cutoff = new Date(Date.now() - PENDING_EXPIRY_MS);

  const query = {
    status: 'pending',
    'payment.status': { $ne: 'paid' },
    createdAt: { $lt: cutoff }
  };
  if (propertyId) {
    query.property = propertyId;
  }

  const expired = await Booking.updateMany(query, {
    $set: {
      status: 'cancelled',
      'cancellation.cancelledAt': new Date(),
      'cancellation.reason': 'Auto-expired: payment not completed within 30 minutes'
    }
  });

  if (expired.modifiedCount > 0) {
    console.log(`🧹 Auto-expired ${expired.modifiedCount} stale pending booking(s)`);
  }
};

// Auto-complete confirmed bookings whose checkout date has passed
const markPastBookingsCompleted = async () => {
  await Booking.updateMany(
    {
      status: 'confirmed',
      checkOut: { $lt: new Date() }
    },
    {
      $set: { status: 'completed' }
    }
  );
};

export const checkAvailability = async (req, res) => {
  try {
    const { propertyId, checkIn, checkOut } = req.query;
    if (!propertyId || !checkIn || !checkOut) {
      return res.status(400).json({ success: false, message: 'Missing parameters' });
    }

    const start = new Date(checkIn);
    const end = new Date(checkOut);
    if (isNaN(start.getTime()) || isNaN(end.getTime()) || end <= start) {
      return res.status(400).json({ success: false, message: 'Invalid check-in or check-out date' });
    }

    // Clean up stale pending bookings first
    await expireStalePendingBookings(propertyId);

    const overlapping = await Booking.find({
      property: propertyId,
      status: { $in: ['confirmed', 'pending'] },
      $or: [
        { checkIn: { $lt: end }, checkOut: { $gt: start } }
      ]
    });

    res.json({ success: true, available: overlapping.length === 0, conflictingBookings: overlapping.length });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Availability check failed' });
  }
};

// Public: returns only date ranges (no guest data) of active bookings, for calendar blocking
export const getBookedDates = async (req, res) => {
  try {
    const { propertyId } = req.params;
    await expireStalePendingBookings(propertyId);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const bookings = await Booking.find({
      property: propertyId,
      status: { $in: ['confirmed', 'pending'] },
      checkOut: { $gt: today }
    })
      .select('checkIn checkOut -_id')
      .sort({ checkIn: 1 })
      .lean();

    res.json({
      success: true,
      ranges: bookings.map(b => ({ checkIn: b.checkIn, checkOut: b.checkOut }))
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch booked dates' });
  }
};

export const createBooking = async (req, res) => {
  try {
    const { propertyId, checkIn, checkOut, guests, specialRequests } = req.body;

    if (!propertyId || !checkIn || !checkOut) {
      return res.status(400).json({ success: false, message: 'Property, checkIn and checkOut required' });
    }

    const start = new Date(checkIn);
    const end = new Date(checkOut);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return res.status(400).json({ success: false, message: 'Invalid check-in or check-out date' });
    }
    if (start < today) {
      return res.status(400).json({ success: false, message: 'Check-in date cannot be in the past' });
    }
    if (end <= start) {
      return res.status(400).json({ success: false, message: 'Check-out date must be after check-in' });
    }

    const property = await Property.findById(propertyId);
    if (!property) {
      return res.status(404).json({ success: false, message: 'Property not found' });
    }

    if (!property.isAvailable) {
      return res.status(400).json({ success: false, message: 'Property is currently unavailable for booking' });
    }

    // Clean up stale pending bookings first
    await expireStalePendingBookings(propertyId);

    // Auto-cancel the current user's own unpaid pending bookings for this property so retries don't collide
    await Booking.updateMany(
      {
        property: propertyId,
        guest: req.user._id,
        status: 'pending',
        'payment.status': { $ne: 'paid' }
      },
      {
        $set: {
          status: 'cancelled',
          'cancellation.cancelledAt': new Date(),
          'cancellation.reason': 'Auto-cancelled: replaced by new booking attempt'
        }
      }
    );

    // Check overlapping bookings
    const overlapping = await Booking.find({
      property: propertyId,
      status: { $in: ['confirmed', 'pending'] },
      $or: [
        { checkIn: { $lt: end }, checkOut: { $gt: start } }
      ]
    });

    if (overlapping.length > 0) {
      return res.status(400).json({ success: false, message: 'Property not available for selected dates' });
    }

    const totalGuests = (guests?.adults || 1) + (guests?.children || 0);
    if (totalGuests > property.maxGuests) {
      return res.status(400).json({ success: false, message: `Maximum ${property.maxGuests} guests allowed` });
    }

    const pricing = calculatePricing(property.price, checkIn, checkOut, property.priceUnit);

    const booking = await Booking.create({
      property: propertyId,
      guest: req.user._id,
      host: property.host,
      checkIn: start,
      checkOut: end,
      guests: {
        adults: guests?.adults || 1,
        children: guests?.children || 0,
        infants: guests?.infants || 0,
        pets: guests?.pets || 0
      },
      totalGuests,
      pricing: {
        nightlyRate: property.price,
        ...pricing
      },
      specialRequests: typeof specialRequests === 'string' ? specialRequests.slice(0, 500) : '',
      status: 'pending'
    });

    const populated = await booking.populate([
      { path: 'property', select: 'title location images price priceUnit propertyType' },
      { path: 'guest', select: 'name email avatar' },
      { path: 'host', select: 'name email avatar' }
    ]);

    res.status(201).json({ success: true, message: 'Booking created', booking: populated, pricing });
  } catch (error) {
    console.error('Create booking error:', error);
    res.status(500).json({ success: false, message: error.message || 'Failed to create booking' });
  }
};

export const getMyBookings = async (req, res) => {
  try {
    await markPastBookingsCompleted();
    await expireStalePendingBookings();

    const bookings = await Booking.find({ guest: req.user._id })
      .populate('property', 'title location images price priceUnit propertyType')
      .populate('host', 'name avatar')
      .sort({ createdAt: -1 });

    res.json({ success: true, bookings });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch bookings' });
  }
};

export const getHostBookings = async (req, res) => {
  try {
    await markPastBookingsCompleted();

    const bookings = await Booking.find({ host: req.user._id })
      .populate('property', 'title location images price priceUnit')
      .populate('guest', 'name avatar email')
      .sort({ createdAt: -1 });

    res.json({ success: true, bookings });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch host bookings' });
  }
};

export const getBookingById = async (req, res) => {
  try {
    await markPastBookingsCompleted();

    const booking = await Booking.findById(req.params.id)
      .populate('property')
      .populate('guest', 'name avatar email phone')
      .populate('host', 'name avatar email phone');

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    const guestId = booking.guest?._id?.toString() || booking.guest?.toString();
    const hostId = booking.host?._id?.toString() || booking.host?.toString();
    const userId = req.user._id.toString();

    if (guestId !== userId && hostId !== userId && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to view this booking' });
    }

    res.json({ success: true, booking });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch booking' });
  }
};

export const updateBookingStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    const isHost = booking.host?.toString() === req.user._id.toString();
    const isGuest = booking.guest?.toString() === req.user._id.toString();

    if (!isHost && !isGuest && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    // Security: Only payment gateways/webhook can confirm bookings and mark paid.
    // Host can cancel/decline a pending booking, or complete a confirmed booking after checkOut.
    const allowedStatuses = ['cancelled', 'completed'];
    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status update. Bookings can only be confirmed upon successful payment.'
      });
    }

    if (status === 'completed') {
      if (booking.status !== 'confirmed') {
        return res.status(400).json({ success: false, message: 'Only confirmed bookings can be marked completed' });
      }
      booking.status = 'completed';
    } else if (status === 'cancelled') {
      if (booking.status === 'completed') {
        return res.status(400).json({ success: false, message: 'Cannot cancel a completed stay' });
      }
      booking.status = 'cancelled';
      booking.cancellation = {
        cancelledAt: new Date(),
        cancelledBy: req.user._id,
        reason: req.body.reason || (isHost ? 'Cancelled by host' : 'Cancelled by user'),
        refundAmount: booking.payment?.status === 'paid' ? booking.pricing.totalAmount : 0
      };
    }

    await booking.save();

    const populated = await booking.populate([
      { path: 'property', select: 'title location images price' },
      { path: 'guest', select: 'name email avatar' },
      { path: 'host', select: 'name email avatar' }
    ]);

    res.json({ success: true, message: `Booking updated to ${status}`, booking: populated });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to update booking' });
  }
};

export const cancelBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    const guestId = booking.guest?.toString();
    const hostId = booking.host?.toString();
    const userId = req.user._id.toString();
    const isGuest = guestId === userId;
    const isHost = hostId === userId;

    if (!isGuest && !isHost && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to cancel this booking' });
    }

    if (booking.status === 'cancelled') {
      return res.status(400).json({ success: false, message: 'Booking is already cancelled' });
    }
    if (booking.status === 'completed') {
      return res.status(400).json({ success: false, message: 'Cannot cancel a completed stay' });
    }

    // If booking is confirmed and checkIn has already passed
    if (booking.status === 'confirmed' && new Date(booking.checkIn) < new Date()) {
      return res.status(400).json({ success: false, message: 'Cannot cancel after check-in has started' });
    }

    // Refund logic
    let refundAmount = 0;
    if (booking.payment?.status === 'paid') {
      if (isHost || req.user.role === 'admin') {
        // Host or admin cancellation gives 100% refund
        refundAmount = booking.pricing.totalAmount;
      } else {
        // Guest cancellation
        const daysUntilCheckIn = Math.ceil((new Date(booking.checkIn) - new Date()) / (1000 * 60 * 60 * 24));
        if (daysUntilCheckIn >= 7) {
          refundAmount = Math.round(booking.pricing.totalAmount * 0.9);
        } else if (daysUntilCheckIn >= 2) {
          refundAmount = Math.round(booking.pricing.totalAmount * 0.5);
        } else {
          refundAmount = 0;
        }
      }
    }

    booking.status = 'cancelled';
    booking.cancellation = {
      cancelledAt: new Date(),
      cancelledBy: req.user._id,
      reason: req.body.reason || (isHost ? 'Cancelled by host' : 'Cancelled by user'),
      refundAmount
    };

    await booking.save();

    // Fix Bug 2.8: Populate booking before returning so frontend doesn't lose property/host details!
    const populated = await booking.populate([
      { path: 'property', select: 'title location images price priceUnit propertyType' },
      { path: 'guest', select: 'name email avatar' },
      { path: 'host', select: 'name email avatar' }
    ]);

    res.json({ success: true, message: 'Booking cancelled', booking: populated, refundAmount });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to cancel booking' });
  }
};
