import mongoose from 'mongoose';

const paymentWebhookLogSchema = new mongoose.Schema({
  eventId: { 
    type: String, 
    required: true, 
    unique: true, 
    index: true 
  },
  event: { 
    type: String, 
    required: true,
    index: true
  },
  orderId: { 
    type: String, 
    index: true 
  },
  paymentId: { 
    type: String, 
    index: true 
  },
  bookingId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Booking', 
    index: true 
  },
  status: { 
    type: String, 
    enum: ['received', 'processed', 'duplicate', 'failed'], 
    default: 'received' 
  },
  signatureVerified: { 
    type: Boolean, 
    default: false 
  },
  payload: { 
    type: mongoose.Schema.Types.Mixed 
  },
  error: { 
    type: String 
  },
  processedAt: { 
    type: Date 
  }
}, {
  timestamps: true
});

export default mongoose.model('PaymentWebhookLog', paymentWebhookLogSchema);
