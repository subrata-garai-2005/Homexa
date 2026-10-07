import express from 'express';
import { register, login, getProfile, updateProfile, toggleWishlist, becomeHost, getWishlist } from '../controllers/authController.js';
import { protect } from '../middleware/auth.js';
import { validateObjectId } from '../middleware/validateObjectId.js';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.get('/profile', protect, getProfile);
router.put('/profile', protect, updateProfile);
router.post('/become-host', protect, becomeHost);
router.get('/wishlist', protect, getWishlist);
router.post('/wishlist/:propertyId', protect, validateObjectId('propertyId'), toggleWishlist);

export default router;
