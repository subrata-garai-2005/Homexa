import express from 'express';
import {
  getProperties,
  getPropertyById,
  createProperty,
  updateProperty,
  deleteProperty,
  getHostProperties,
  createPropertyReview
} from '../controllers/propertyController.js';
import { protect, optionalAuth } from '../middleware/auth.js';
import { upload } from '../middleware/upload.js';
import { validateObjectId } from '../middleware/validateObjectId.js';

const router = express.Router();

router.get('/', optionalAuth, getProperties);
router.get('/host/my-properties', protect, getHostProperties);
router.get('/:id', optionalAuth, validateObjectId('id'), getPropertyById);

router.post('/', protect, upload.array('images', 10), createProperty);
router.post('/:id/reviews', protect, validateObjectId('id'), createPropertyReview);
router.put('/:id', protect, validateObjectId('id'), upload.array('images', 10), updateProperty);
router.delete('/:id', protect, validateObjectId('id'), deleteProperty);

export default router;
