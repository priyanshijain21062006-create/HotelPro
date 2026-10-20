import { Router } from 'express';
import { login, signup } from '../controllers/authController.js';
import { cancelBooking, createBooking, listBookings } from '../controllers/bookingController.js';
import { createRoom, deleteRoom, listRooms } from '../controllers/roomController.js';
import { listUsers } from '../controllers/userController.js';
import { adminOnly, authenticate } from '../middleware/auth.js';

const router = Router();
router.post('/auth/signup', signup);
router.post('/auth/login', login);
router.get('/rooms', listRooms);
router.get('/bookings', authenticate, listBookings);
router.post('/bookings', authenticate, createBooking);
router.patch('/bookings/:id/cancel', authenticate, cancelBooking);
router.post('/admin/rooms', authenticate, adminOnly, createRoom);
router.delete('/admin/rooms/:id', authenticate, adminOnly, deleteRoom);
router.get('/admin/users', authenticate, adminOnly, listUsers);
export default router;
