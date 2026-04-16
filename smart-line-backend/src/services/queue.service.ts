import { QueueRepository } from '../repositories/queue.repository';
import {getIO} from "../config/socket";
import {Queue} from "../models/queue.model";
import {BookingRepository} from "../repositories/booking.repository";

export const QueueService = {
    async getAllQueues() {
        return await QueueRepository.findAll();
    },

    async getQueuesByService(serviceId: string) {
        return await QueueRepository.findByServiceId(serviceId);
    },

    async moveQueue(queueId: string) {
        const updated = await QueueRepository.incrementQueue(queueId);
        if (updated) {
            const io = getIO();
            io.to(queueId).emit('queueUpdated', updated);
        }
        return updated;
    },

    async getQueueById(queueId: string) {
        return await QueueRepository.findById(queueId);
    },

    async createQueue(param: Queue) {
        const queue: Queue = {
            id: param.id,
            name: '',
            serviceId: param.serviceId,
            currentNumber: param.currentNumber,
            lastPosition: param.lastPosition,
            estimatedWaitTime: param.estimatedWaitTime,
            locationId: param.locationId,
            departmentId: param.departmentId
        };
        return await QueueRepository.create(queue);

    },

    async getQueuesByIds(filters: {
        locationId?: string;
        departmentId?: string;
        serviceId?: string;
    }) {
        return QueueRepository.findByFilters(filters);
    },


    async getMyPosition(userId: string, queueId: string) {
        // 1. Get active booking
        const booking = await BookingRepository.findActiveByUserAndQueue(userId, queueId);

        if (!booking) {
            throw new Error('No active booking found');
        }

        // 2. Get queue
        const queue = await QueueRepository.findById(queueId);

        if (!queue) {
            throw new Error('Queue not found');
        }

        // 3. Compute metrics
        const peopleAhead = Math.max(queue.currentNumber < booking.position
            ? booking.position - queue.currentNumber
            : 0, 0);

        const estimatedWaitTime =
            queue.estimatedWaitTime || (peopleAhead * (queue.avgServiceTime || 5));

        return {
            bookingId: booking.id,
            queueId,
            position: booking.position,
            currentNumber: queue.currentNumber,
            peopleAhead,
            estimatedWaitTime,
            status: booking.status
        };
    }
};