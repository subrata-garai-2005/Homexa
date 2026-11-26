import express from 'express';
import { register, login, getProfile, updateProfile, toggleWishlist, becomeHost, getWishlist } from '../controllers/authController.js';
import { protect } from '../middleware/auth.js';
import { validateObjectId } from '../middleware/validateObjectId.js';
import { authLimiter } from '../middleware/rateLimiter.js';

const router = express.Router();

// Strict brute-force rate limiter only on registration & login
router.post('/register', authLimiter, register);
router.post('/login', authLimiter, login);

// Profile and Wishlist routes (exempt from auth brute-force limiter)
router.get('/profile', protect, getProfile);
router.put('/profile', protect, updateProfile);
router.post('/become-host', protect, becomeHost);
router.get('/wishlist', protect, getWishlist);
router.post('/wishlist/:propertyId', protect, validateObjectId('propertyId'), toggleWishlist);

export default router;
