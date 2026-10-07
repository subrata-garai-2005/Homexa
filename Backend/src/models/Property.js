import mongoose from 'mongoose';

const propertySchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
    maxlength: [100, 'Title cannot exceed 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    maxlength: [2000, 'Description cannot exceed 2000 characters']
  },
  location: {
    address: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    country: { type: String, default: 'India' },
    zipCode: { type: String },
    coordinates: {
      lat: { type: Number, required: true },
      lng: { type: Number, required: true }
    },
    geo: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point'
      },
      coordinates: {
        type: [Number],
        default: [0, 0]
      }
    }
  },
  price: {
    type: Number,
    required: [true, 'Price is required'],
    min: [100, 'Price must be at least ₹100']
  },
  priceUnit: {
    type: String,
    enum: ['night', 'month'],
    default: 'night'
  },
  propertyType: {
    type: String,
    enum: ['apartment', 'house', 'villa', 'cabin', 'beachfront', 'countryside', 'luxury', 'budget', 'unique'],
    required: true
  },
  amenities: [{
    type: String,
    enum: ['wifi', 'kitchen', 'washer', 'dryer', 'ac', 'heating', 'tv', 'pool', 'gym', 'parking', 'elevator', 'workspace', 'pets', 'smoking', 'breakfast', 'beach_access', 'fireplace', 'bbq']
  }],
  bedrooms: {
    type: Number,
    required: true,
    min: 0
  },
  beds: {
    type: Number,
    required: true,
    min: 1
  },
  bathrooms: {
    type: Number,
    required: true,
    min: 1
  },
  maxGuests: {
    type: Number,
    required: true,
    min: 1,
    max: 20
  },
  images: [{
    url: { type: String, required: true },
    fileId: { type: String },
    thumbnailUrl: { type: String }
  }],
  host: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  rating: {
    average: { type: Number, default: 4.8, min: 0, max: 5 },
    count: { type: Number, default: 0 }
  },
  reviews: [{
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    rating: { type: Number, min: 1, max: 5 },
    comment: { type: String },
    createdAt: { type: Date, default: Date.now }
  }],
  isAvailable: {
    type: Boolean,
    default: true
  },
  instantBook: {
    type: Boolean,
    default: true
  },
  houseRules: {
    type: String,
    default: 'No smoking, No parties, Check-in after 2PM'
  },
  cancellationPolicy: {
    type: String,
    enum: ['flexible', 'moderate', 'strict'],
    default: 'flexible'
  }
}, {
  timestamps: true
});

propertySchema.pre('save', function(next) {
  if (this.location && this.location.coordinates) {
    const lat = Number(this.location.coordinates.lat);
    const lng = Number(this.location.coordinates.lng);
    if (!isNaN(lat) && !isNaN(lng)) {
      this.location.geo = {
        type: 'Point',
        coordinates: [lng, lat]
      };
    }
  }
  next();
});

// Indexes for search
propertySchema.index({ 'location.city': 'text', 'location.address': 'text', title: 'text', description: 'text' });
propertySchema.index({ price: 1 });
propertySchema.index({ propertyType: 1 });
propertySchema.index({ 'location.geo': '2dsphere' });
propertySchema.index({ host: 1 });

const Property = mongoose.model('Property', propertySchema);
export default Property;
