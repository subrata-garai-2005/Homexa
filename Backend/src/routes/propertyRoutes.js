import express from 'express';
import {
  getProperties,
  getPropertyById,
  createProperty,
  updateProperty,
  deleteProperty,
  getHostProperties,
  createPropertyReview,
  deletePropertyReview,
  toggleReviewHelpful
} from '../controllers/propertyController.js';
import { protect, optionalAuth, authorizeHost } from '../middleware/auth.js';
import { upload } from '../middleware/upload.js';
import { validateObjectId } from '../middleware/validateObjectId.js';

const router = express.Router();

router.get('/', optionalAuth, getProperties);
router.get('/host/my-properties', protect, getHostProperties);
router.get('/:id', optionalAuth, validateObjectId('id'), getPropertyById);

router.post('/', protect, authorizeHost, upload.array('images', 10), createProperty);
router.post('/:id/reviews', protect, validateObjectId('id'), createPropertyReview);
router.delete('/:id/reviews/:reviewId', protect, validateObjectId('id'), deletePropertyReview);
router.post('/:id/reviews/:reviewId/helpful', protect, validateObjectId('id'), toggleReviewHelpful);
router.put('/:id', protect, authorizeHost, validateObjectId('id'), upload.array('images', 10), updateProperty);
router.delete('/:id', protect, authorizeHost, validateObjectId('id'), deleteProperty);

export default router;
