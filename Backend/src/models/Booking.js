import mongoose from 'mongoose';

const bookingSchema = new mongoose.Schema({
  property: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Property',
    required: true
  },
  guest: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  host: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  checkIn: {
    type: Date,
    required: [true, 'Check-in date is required']
  },
  checkOut: {
    type: Date,
    required: [true, 'Check-out date is required']
  },
  guests: {
    adults: { type: Number, required: true, min: 1, default: 1 },
    children: { type: Number, default: 0, min: 0 },
    infants: { type: Number, default: 0, min: 0 },
    pets: { type: Number, default: 0, min: 0 }
  },
  totalGuests: {
    type: Number,
    required: true
  },
  pricing: {
    nightlyRate: { type: Number, required: true },
    nights: { type: Number, required: true },
    subtotal: { type: Number, required: true },
    cleaningFee: { type: Number, default: 0 },
    serviceFee: { type: Number, default: 0 },
    taxes: { type: Number, default: 0 },
    totalAmount: { type: Number, required: true }
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'cancelled', 'completed'],
    default: 'pending'
  },
  payment: {
    razorpayOrderId: { type: String },
    razorpayPaymentId: { type: String },
    razorpaySignature: { type: String },
    status: { type: String, enum: ['pending', 'paid', 'failed', 'refunded'], default: 'pending' },
    method: { type: String },
    paidAt: { type: Date },
    webhookVerified: { type: Boolean, default: false },
    webhookReceivedAt: { type: Date },
    failureReason: { type: String },
    refundId: { type: String },
    idempotencyKey: { type: String }
  },
  specialRequests: {
    type: String,
    maxlength: 500
  },
  cancellation: {
    cancelledAt: { type: Date },
    cancelledBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    reason: { type: String },
    refundAmount: { type: Number }
  }
}, {
  timestamps: true
});

// Validate dates
bookingSchema.pre('validate', function(next) {
  if (this.checkIn && this.checkOut) {
    if (this.checkIn >= this.checkOut) {
      return next(new Error('Check-out must be after check-in'));
    }
    // Calculate nights
    const diffTime = this.checkOut - this.checkIn;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    if (diffDays < 1) {
      return next(new Error('Minimum 1 night stay required'));
    }
  }
  next();
});

// Indexes
bookingSchema.index({ guest: 1, createdAt: -1 });
bookingSchema.index({ host: 1, createdAt: -1 });
bookingSchema.index({ property: 1, checkIn: 1, checkOut: 1 });
bookingSchema.index({ status: 1 });

const Booking = mongoose.model('Booking', bookingSchema);
export default Booking;
