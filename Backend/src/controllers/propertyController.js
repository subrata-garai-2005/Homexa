import Property from '../models/Property.js';
import Booking from '../models/Booking.js';
import { uploadToImageKit } from '../config/imagekit.js';

const escapeRegex = (str) => String(str || '').replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

export const getProperties = async (req, res) => {
  try {
    const {
      search,
      city,
      propertyType,
      minPrice,
      maxPrice,
      bedrooms,
      bathrooms,
      maxGuests,
      amenities,
      sort = 'newest',
      page = 1,
      limit = 12,
      lat,
      lng,
      radius = 50
    } = req.query;

    const query = { isAvailable: true };

    // Text search or keyword
    if (search && search.trim()) {
      const escaped = escapeRegex(search.trim());
      query.$or = [
        { title: { $regex: escaped, $options: 'i' } },
        { description: { $regex: escaped, $options: 'i' } },
        { 'location.city': { $regex: escaped, $options: 'i' } },
        { 'location.address': { $regex: escaped, $options: 'i' } }
      ];
    }

    if (city && city.trim()) {
      query['location.city'] = { $regex: escapeRegex(city.trim()), $options: 'i' };
    }

    if (propertyType && propertyType !== 'all') {
      query.propertyType = propertyType;
    }

    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }

    if (bedrooms) query.bedrooms = { $gte: Number(bedrooms) };
    if (bathrooms) query.bathrooms = { $gte: Number(bathrooms) };
    if (maxGuests) query.maxGuests = { $gte: Number(maxGuests) };

    // Amenities: handles both string and array (e.g. amenities[]=wifi)
    if (amenities) {
      let amenityList = [];
      if (Array.isArray(amenities)) {
        amenityList = amenities.filter(Boolean);
      } else if (typeof amenities === 'string') {
        amenityList = amenities.split(',').map(a => a.trim()).filter(Boolean);
      }
      if (amenityList.length > 0) {
        query.amenities = { $all: amenityList };
      }
    }

    // Geo search using $geoWithin $centerSphere (compatible with countDocuments)
    if (lat && lng) {
      const parsedLat = parseFloat(lat);
      const parsedLng = parseFloat(lng);
      if (!isNaN(parsedLat) && !isNaN(parsedLng)) {
        const radiusInKm = parseFloat(radius) || 50;
        const radiusInRadians = radiusInKm / 6378.1;
        query['location.geo'] = {
          $geoWithin: {
            $centerSphere: [[parsedLng, parsedLat], radiusInRadians]
          }
        };
      }
    }

    let sortOption = { createdAt: -1 };
    if (sort === 'price_low') sortOption = { price: 1 };
    if (sort === 'price_high') sortOption = { price: -1 };
    if (sort === 'rating') sortOption = { 'rating.average': -1 };

    const pageNum = Math.max(1, parseInt(page) || 1);
    const limitNum = Math.min(50, Math.max(1, parseInt(limit) || 12));
    const skip = (pageNum - 1) * limitNum;

    const [properties, total] = await Promise.all([
      Property.find(query)
        .populate('host', 'name avatar')
        .sort(sortOption)
        .skip(skip)
        .limit(limitNum)
        .lean(),
      Property.countDocuments(query)
    ]);

    res.json({
      success: true,
      properties,
      pagination: {
        total,
        page: pageNum,
        pages: Math.ceil(total / limitNum) || 1,
        limit: limitNum
      }
    });
  } catch (error) {
    console.error('Get properties error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch properties' });
  }
};

export const getPropertyById = async (req, res) => {
  try {
    const property = await Property.findById(req.params.id)
      .populate('host', 'name avatar email bio isHost')
      .populate('reviews.user', 'name avatar');

    if (!property) {
      return res.status(404).json({ success: false, message: 'Property not found' });
    }

    res.json({ success: true, property });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch property' });
  }
};

export const createProperty = async (req, res) => {
  try {
    const {
      title, description, address, city, state, country, zipCode,
      lat, lng, price, propertyType, amenities, bedrooms, beds, bathrooms,
      maxGuests, houseRules, cancellationPolicy, priceUnit
    } = req.body;

    // Parse amenities
    let parsedAmenities = amenities;
    if (typeof amenities === 'string') {
      try {
        parsedAmenities = JSON.parse(amenities);
      } catch {
        parsedAmenities = amenities.split(',').map(a => a.trim()).filter(Boolean);
      }
    }

    // Handle image uploads
    let images = [];
    if (req.files && req.files.length > 0) {
      const uploadPromises = req.files.map(async (file, idx) => {
        const result = await uploadToImageKit(file, `${req.user._id}_${Date.now()}_${idx}`, '/homexa/properties');
        return {
          url: result.url,
          fileId: result.fileId,
          thumbnailUrl: result.thumbnailUrl || result.url
        };
      });
      images = await Promise.all(uploadPromises);
    } else if (req.body.images) {
      try {
        const imgData = typeof req.body.images === 'string' ? JSON.parse(req.body.images) : req.body.images;
        if (Array.isArray(imgData)) {
          images = imgData.map(url => typeof url === 'string' ? { url } : url);
        }
      } catch {}
    }

    if (images.length === 0) {
      images = [{ url: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=800' }];
    }

    const parsedLat = parseFloat(lat) || 20.5937;
    const parsedLng = parseFloat(lng) || 78.9629;

    const property = await Property.create({
      title,
      description,
      location: {
        address,
        city,
        state,
        country: country || 'India',
        zipCode: zipCode || '',
        coordinates: { lat: parsedLat, lng: parsedLng },
        geo: { type: 'Point', coordinates: [parsedLng, parsedLat] }
      },
      price: Number(price),
      priceUnit: priceUnit || 'night',
      propertyType,
      amenities: parsedAmenities || [],
      bedrooms: Number(bedrooms) || 1,
      beds: Number(beds) || 1,
      bathrooms: Number(bathrooms) || 1,
      maxGuests: Number(maxGuests) || 2,
      images,
      host: req.user._id,
      houseRules: houseRules || 'No smoking, No parties, Check-in after 2PM',
      cancellationPolicy: cancellationPolicy || 'flexible'
    });

    if (!req.user.isHost) {
      req.user.isHost = true;
      req.user.role = 'host';
      await req.user.save();
    }

    const populated = await property.populate('host', 'name avatar');
    res.status(201).json({ success: true, message: 'Property created', property: populated });
  } catch (error) {
    console.error('Create property error:', error);
    res.status(500).json({ success: false, message: error.message || 'Failed to create property' });
  }
};

export const updateProperty = async (req, res) => {
  try {
    const property = await Property.findById(req.params.id);
    if (!property) {
      return res.status(404).json({ success: false, message: 'Property not found' });
    }

    if (property.host.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    const updatableFields = [
      'title', 'description', 'price', 'propertyType', 'bedrooms',
      'beds', 'bathrooms', 'maxGuests', 'houseRules', 'cancellationPolicy',
      'isAvailable', 'priceUnit'
    ];
    
    updatableFields.forEach(field => {
      if (req.body[field] !== undefined) {
        property[field] = req.body[field];
      }
    });

    if (req.body.amenities) {
      try {
        property.amenities = typeof req.body.amenities === 'string' ? JSON.parse(req.body.amenities) : req.body.amenities;
      } catch {
        property.amenities = req.body.amenities;
      }
    }

    // Update location fields including country and zipCode
    if (req.body.address) property.location.address = req.body.address;
    if (req.body.city) property.location.city = req.body.city;
    if (req.body.state) property.location.state = req.body.state;
    if (req.body.country) property.location.country = req.body.country;
    if (req.body.zipCode) property.location.zipCode = req.body.zipCode;

    if (req.body.lat !== undefined && req.body.lng !== undefined) {
      const pLat = parseFloat(req.body.lat);
      const pLng = parseFloat(req.body.lng);
      if (!isNaN(pLat) && !isNaN(pLng)) {
        property.location.coordinates = { lat: pLat, lng: pLng };
        property.location.geo = { type: 'Point', coordinates: [pLng, pLat] };
      }
    }

    // Retain existing images if specified
    if (req.body.existingImages) {
      try {
        const retained = typeof req.body.existingImages === 'string' ? JSON.parse(req.body.existingImages) : req.body.existingImages;
        if (Array.isArray(retained)) {
          property.images = property.images.filter(img => retained.includes(img.url || img));
        }
      } catch {}
    }

    // Add newly uploaded images
    if (req.files && req.files.length > 0) {
      const uploadPromises = req.files.map(async (file, idx) => {
        const result = await uploadToImageKit(file, `${req.user._id}_${Date.now()}_${idx}`, '/homexa/properties');
        return { url: result.url, fileId: result.fileId, thumbnailUrl: result.thumbnailUrl || result.url };
      });
      const newImages = await Promise.all(uploadPromises);
      property.images = [...property.images, ...newImages];
    }

    await property.save();
    const updated = await property.populate('host', 'name avatar');

    res.json({ success: true, message: 'Property updated', property: updated });
  } catch (error) {
    console.error('Update error:', error);
    res.status(500).json({ success: false, message: 'Failed to update property' });
  }
};

export const deleteProperty = async (req, res) => {
  try {
    const property = await Property.findById(req.params.id);
    if (!property) {
      return res.status(404).json({ success: false, message: 'Property not found' });
    }

    if (property.host.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    // Check for active or upcoming bookings
    const activeBookings = await Booking.find({
      property: property._id,
      status: { $in: ['confirmed', 'pending'] },
      checkOut: { $gt: new Date() }
    });

    if (activeBookings.length > 0) {
      return res.status(409).json({
        success: false,
        message: 'Cannot delete property with active or upcoming bookings'
      });
    }

    await property.deleteOne();
    res.json({ success: true, message: 'Property deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to delete property' });
  }
};

export const getHostProperties = async (req, res) => {
  try {
    const properties = await Property.find({ host: req.user._id }).sort({ createdAt: -1 });
    res.json({ success: true, properties });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch host properties' });
  }
};

export const createPropertyReview = async (req, res) => {
  try {
    const { rating, comment } = req.body;
    const propertyId = req.params.id;

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ success: false, message: 'Please provide a rating between 1 and 5' });
    }

    if (!comment || !comment.trim()) {
      return res.status(400).json({ success: false, message: 'Please provide a review comment' });
    }

    const property = await Property.findById(propertyId);
    if (!property) {
      return res.status(404).json({ success: false, message: 'Property not found' });
    }

    const hostId = property.host?._id ? property.host._id.toString() : property.host.toString();
    const isHost = hostId === req.user._id.toString();
    const isDev = process.env.NODE_ENV !== 'production' || process.env.ALLOW_DEV_REVIEWS === 'true';

    // Hosts cannot review their own property (allowed in dev/admin for testing)
    if (isHost && !isDev && req.user.role !== 'admin') {
      return res.status(400).json({ success: false, message: 'Hosts cannot review their own property' });
    }

    // Check verified stay: guest must have booked and commenced stay (allowed in dev/admin for testing)
    const verifiedStay = await Booking.findOne({
      property: property._id,
      guest: req.user._id,
      status: { $in: ['confirmed', 'completed'] },
      checkIn: { $lte: new Date() }
    });

    if (!verifiedStay && req.user.role !== 'admin' && !isDev) {
      return res.status(403).json({
        success: false,
        message: 'You can only leave a review for stays that you have booked and completed'
      });
    }

    // Check if user already reviewed
    const existingIndex = property.reviews.findIndex(
      r => r.user && r.user.toString() === req.user._id.toString()
    );

    if (existingIndex !== -1) {
      property.reviews[existingIndex].rating = Number(rating);
      property.reviews[existingIndex].comment = comment.trim();
      property.reviews[existingIndex].createdAt = new Date();
    } else {
      property.reviews.push({
        user: req.user._id,
        rating: Number(rating),
        comment: comment.trim(),
        createdAt: new Date()
      });
    }

    // Recalculate average rating & count
    const totalReviews = property.reviews.length;
    const avgRating = totalReviews > 0
      ? Number((property.reviews.reduce((acc, item) => item.rating + acc, 0) / totalReviews).toFixed(1))
      : 5;

    property.rating = {
      average: avgRating,
      count: totalReviews
    };

    await property.save();

    const updated = await Property.findById(propertyId)
      .populate('host', 'name avatar email bio isHost')
      .populate('reviews.user', 'name avatar');

    res.status(201).json({
      success: true,
      message: existingIndex !== -1 ? 'Review updated successfully' : 'Review posted successfully',
      property: updated
    });
  } catch (error) {
    console.error('Review error:', error);
    res.status(500).json({ success: false, message: 'Failed to submit review' });
  }
};
