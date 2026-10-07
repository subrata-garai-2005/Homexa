import express from 'express';
import { generateDescription, generateTripPlan, getPropertySuggestions, chatWithNexis } from '../controllers/aiController.js';
import { protect, optionalAuth } from '../middleware/auth.js';

const router = express.Router();

router.post('/chat', optionalAuth, chatWithNexis);
router.post('/generate-description', protect, generateDescription);
router.post('/trip-planner', optionalAuth, generateTripPlan);
router.get('/suggestions', optionalAuth, getPropertySuggestions);

export default router;
