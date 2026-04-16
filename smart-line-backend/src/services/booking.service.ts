import {Booking} from "../models/booking.model";
import {QueueRepository} from "../repositories/queue.repository";
import {BookingRepository} from "../repositories/booking.repository";
import {UserRepository} from "../repositories/user.repository";
import {getIO} from "../config/socket";

export const BookingService = {
    async joinQueue(userId: string, queueId: string) {
        const user = UserRepository.findById(userId);
        if (!user) throw new Error('User not found');

        const queue = await QueueRepository.findById(queueId);
        if (!queue) throw new Error('Queue not found');

        const existing =
            await BookingRepository.findActiveByUserAndQueue(userId, queueId);

        if (existing) {
            throw new Error('User already in queue');
        }

        const booking = await BookingRepository.joinQueueAtomic(userId, queueId);

        const io = getIO();
        io.to(queueId).emit('bookingJoined', booking);

        return booking;
    },

    async getUserQueueStatus(userId: string) {
        const bookings = await BookingRepository.findByUser(userId);

        const queues = await QueueRepository.findAll();

        return bookings.map((booking: Booking) => {
            const queue = queues.find(q => q.id === booking.queueId);

            if (!queue) return null;

            const remaining = booking.position - queue.currentNumber;

            if (remaining <= 0 && booking.status === 'WAITING') {
                booking.status = 'SERVED';
            }

            return {
                bookingId: booking.id,
                queueId: booking.queueId,
                position: booking.position,
                currentNumber: queue.currentNumber,
                peopleAhead: remaining > 0 ? remaining : 0,
                isYourTurn: remaining <= 0,
                estimatedWaitTime: queue.estimatedWaitTime,
                status: booking.status
            };
        });
    },

    async getUserBookings(userId: string) {
        return await BookingRepository.findByUser(userId);
    },

    async getActiveBookingsCount(userId: string) {
       return await BookingRepository.countActiveByQueue(userId);
    },

    async createBooking(booking: Booking) {
        return await BookingRepository.create(booking);
    },

    async cancelBooking(bookingId: string) {
        const booking = await BookingRepository.updateStatus(bookingId, 'CANCELLED');

        if (!booking) {
            throw new Error('Booking not found');
        }

        return booking;
    }
};