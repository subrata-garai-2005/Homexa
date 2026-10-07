import express from 'express';
import {
  createRazorpayOrder,
  verifyPayment,
  getPaymentStatus,
  handleRazorpayWebhook,
  simulateWebhook,
  getWebhookAuditLogs
} from '../controllers/paymentController.js';
import { protect } from '../middleware/auth.js';
import { validateObjectId } from '../middleware/validateObjectId.js';

const router = express.Router();

// Order creation & Client verification
router.post('/create-order', protect, createRazorpayOrder);
router.post('/verify', protect, verifyPayment);
router.get('/status/:bookingId', protect, validateObjectId('bookingId'), getPaymentStatus);

// Production Webhook Endpoint (Verified via HMAC SHA-256 Signature)
router.post('/webhook', handleRazorpayWebhook);

// Dev / Interview Simulation & Audit Logs
router.post('/simulate-webhook', protect, simulateWebhook);
router.get('/webhook-logs/:bookingId', protect, validateObjectId('bookingId'), getWebhookAuditLogs);

export default router;
