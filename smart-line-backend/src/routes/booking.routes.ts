import { Router } from 'express';
import {
    cancelBooking, createBooking,
    getActiveBookingsCount,
    getMyBookings,
    getMyQueueStatus,
    joinQueue
} from "../controllers/booking.controller";

const router = Router();

router.post('/create', createBooking)
router.post('/join', joinQueue);
router.get('/my/:userId', getMyBookings);
router.get('/status/:userId', getMyQueueStatus);
router.get('/active/count/:userId', getActiveBookingsCount)
router.patch('/:id/cancel', cancelBooking);

export default router;