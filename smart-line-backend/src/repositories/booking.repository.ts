import {Booking} from "../models/booking.model";

import {db} from "../config/firebase";
import {getPredictionWithService} from "../ai-client/aiClient";
import {ServiceRepository} from "./service.repository";

const COLLECTION = 'bookings';

export const BookingRepository = {
    async create(booking: Booking) {
        await db.collection(COLLECTION).doc(booking.id).set(booking);
        return booking;
    },

    async findByUser(userId: string): Promise<Booking[]> {
        const snapshot = await db
            .collection(COLLECTION)
            .where('userId', '==', userId)
            .get();

        return snapshot.docs.map(doc => doc.data() as Booking);
    },

    async countActiveByQueue(userId: string): Promise<number> {
        const snapshot = await db
            .collection(COLLECTION)
            .where('userId', '==', userId)
            .where('status', '==', 'WAITING')
            .get();

        return snapshot.size;
    },

    async findActiveByUserAndQueue(userId: string, queueId: string) {
        const snapshot = await db
            .collection(COLLECTION)
            .where('userId', '==', userId)
            .where('queueId', '==', queueId)
            .where('status', '==', 'WAITING')
            .get();

        return snapshot.empty ? null : (snapshot.docs[0].data() as Booking);
    },

    async updateStatus(bookingId: string, status: string) {
        const ref = db.collection(COLLECTION).doc(bookingId);

        await ref.update({ status });

        const updated = await ref.get();
        return updated.data() as Booking;
    },

    async joinQueueAtomic(userId: string, queueId: string): Promise<Booking> {

        const queueRef = db.collection('queues').doc(queueId);
        const bookingRef = db.collection('bookings').doc();

        // 🔥 1. Fetch queue + service OUTSIDE transaction
        const queueSnap = await queueRef.get();
        if (!queueSnap.exists) {
            throw new Error('Queue not found');
        }

        const queueData = queueSnap.data();

        let service = null;
        try {
            service = await ServiceRepository.findById(queueData?.serviceId);
        } catch {
            service = null;
        }

        return await db.runTransaction(async (transaction) => {

            const queueDoc = await transaction.get(queueRef);
            if (!queueDoc.exists) {
                throw new Error('Queue not found');
            }

            const freshQueue = queueDoc.data();

            const currentNumber = freshQueue?.currentNumber || 0;
            const lastPosition = freshQueue?.lastPosition || 0;

            const newPosition = lastPosition + 1;

            // ✅ Prevent overbooking
            const maxSlots = freshQueue?.queueConfig?.maxDailySlots;
            if (maxSlots && newPosition > maxSlots) {
                throw new Error('Queue is full');
            }

            // ✅ FIX: Duplicate check INSIDE transaction
            const existingSnap = await transaction.get(
                db.collection('bookings')
                    .where('userId', '==', userId)
                    .where('queueId', '==', queueId)
                    .where('status', '==', 'WAITING')
            );

            if (!existingSnap.empty) {
                throw new Error('User already in queue');
            }

            // 📊 Queue length
            const queueLength = newPosition - currentNumber;

            let estimatedWaitTime;

            try {
                if (service) {
                    estimatedWaitTime = await getPredictionWithService(
                        queueLength,
                        service
                    );
                } else {
                    throw new Error('Service missing');
                }
            } catch {
                estimatedWaitTime = queueLength * (freshQueue?.avgServiceTime || 5);
            }

            // ✅ Update queue
            transaction.update(queueRef, {
                lastPosition: newPosition,
                estimatedWaitTime
            });

            const booking: Booking = {
                id: bookingRef.id,
                userId,
                queueId,
                position: newPosition,
                status: 'WAITING',
                createdAt: new Date()
            };

            // ✅ Save booking
            transaction.set(bookingRef, booking);

            return booking;
        });
    }
};