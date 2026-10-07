import express from 'express';
import {
  createBooking,
  getMyBookings,
  getHostBookings,
  getBookingById,
  updateBookingStatus,
  cancelBooking,
  checkAvailability,
  getBookedDates
} from '../controllers/bookingController.js';
import { protect } from '../middleware/auth.js';
import { validateObjectId } from '../middleware/validateObjectId.js';

const router = express.Router();

router.get('/availability', checkAvailability);
router.get('/booked-dates/:propertyId', validateObjectId('propertyId'), getBookedDates);
router.post('/', protect, createBooking);
router.get('/my-bookings', protect, getMyBookings);
router.get('/host-bookings', protect, getHostBookings);
router.get('/:id', protect, validateObjectId('id'), getBookingById);
router.put('/:id/status', protect, validateObjectId('id'), updateBookingStatus);
router.put('/:id/cancel', protect, validateObjectId('id'), cancelBooking);

export default router;
