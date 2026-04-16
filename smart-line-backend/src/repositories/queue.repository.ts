import { Queue } from '../models/queue.model';
import { db } from "../config/firebase";
import {getPredictionWithService} from "../ai-client/aiClient";
import {ServiceRepository} from "./service.repository";

const COLLECTION = 'queues';

export const QueueRepository = {
    async findAll(): Promise<any[]> {
        const snapshot = await db.collection(COLLECTION).get();

        return snapshot.docs.map(doc => {
            const queue = {
                id: doc.id,
                ...doc.data()
            } as Queue;

            return enrichQueue(queue);
        });
    },

    async findByServiceId(serviceId: string): Promise<any[]> {
        const snapshot = await db
            .collection(COLLECTION)
            .where('serviceId', '==', serviceId)
            .get();

        return snapshot.docs.map(doc => {
            const queue = {
                id: doc.id,
                ...doc.data()
            } as Queue;

            return enrichQueue(queue);
        });
    },

    async findById(queueId: string): Promise<any | null> {
        const doc = await db.collection(COLLECTION).doc(queueId).get();

        if (!doc.exists) return null;

        const queue = {
            id: doc.id,
            ...doc.data()
        } as Queue;

        return enrichQueue(queue);
    },

    async incrementQueue(queueId: string): Promise<any | null> {

        const ref = db.collection(COLLECTION).doc(queueId);

        // 🔥 1. Get queue FIRST (outside transaction)
        const snapshot = await ref.get();
        if (!snapshot.exists) return null;

        const queue = snapshot.data() as Queue;

        // 2. Fetch service ONCE (outside transaction)
        let service;
        try {
            service = await ServiceRepository.findById(queue.serviceId);
        } catch (e) {
            service = null;
        }

        return await db.runTransaction(async (transaction) => {
            const doc = await transaction.get(ref);
            if (!doc.exists) return null;

            const freshQueue = doc.data() as Queue;

            const currentNumber = freshQueue.currentNumber + 1;
            const queueLength = Math.max(freshQueue.lastPosition - currentNumber, 0);

            let estimatedWaitTime = freshQueue.estimatedWaitTime;

            try {
                if (service) {
                    estimatedWaitTime = await getPredictionWithService(
                        queueLength,
                        service
                    );
                } else {
                    throw new Error('Service missing');
                }
            } catch (e) {
                // 🔁 fallback logic
                estimatedWaitTime = queueLength * (freshQueue.avgServiceTime || 5);
            }

            const updated: Partial<Queue> = {
                currentNumber,
                estimatedWaitTime
            };

            transaction.update(ref, updated);

            return enrichQueue({
                ...(freshQueue as Queue),
                ...updated,
                id: queueId
            });
        });
    },

    async create(queue: Queue) {
        await db.collection(COLLECTION).doc(queue.id).set(queue);
        return enrichQueue(queue);
    },

    async findByLocation(locationId: string): Promise<Queue[]> {
        const snapshot = await db
            .collection(COLLECTION)
            .where('locationId', '==', locationId)
            .get();

        return snapshot.docs.map(doc =>
            enrichQueue({
                id: doc.id,
                ...doc.data()
            } as Queue)
        );
    },

    async findByDepartment(departmentId: string): Promise<Queue[]> {
        const snapshot = await db
            .collection(COLLECTION)
            .where('departmentId', '==', departmentId)
            .get();

        return snapshot.docs.map(doc =>
            enrichQueue({
                id: doc.id,
                ...doc.data()
            } as Queue)
        );
    },

    async findByFilters(filters: {
        locationId?: string;
        departmentId?: string;
        serviceId?: string;
    }): Promise<any[]> {

        let query: FirebaseFirestore.Query = db.collection(COLLECTION);

        if (filters.locationId) {
            query = query.where('locationId', '==', filters.locationId);
        }

        if (filters.departmentId) {
            query = query.where('departmentId', '==', filters.departmentId);
        }

        if (filters.serviceId) {
            query = query.where('serviceId', '==', filters.serviceId);
        }

        const snapshot = await query.get();

        return snapshot.docs.map(doc => {
            const queue = {
                id: doc.id,
                ...doc.data()
            } as Queue;

            return enrichQueue(queue);
        });
    }
};

// util
export function enrichQueue(queue: Queue) {
    const queueLength = Math.max(queue.lastPosition - queue.currentNumber, 0);

    return {
        ...queue,
        queueLength,
        estimatedWaitTime:
            queue.estimatedWaitTime ??
            queueLength * (queue.avgServiceTime || 5)
    };
}