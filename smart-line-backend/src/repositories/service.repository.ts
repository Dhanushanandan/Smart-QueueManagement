import { db } from '../config/firebase';
import { Service } from '../models/service.model';

const collectionRef = db.collection('services');

export const ServiceRepository = {

    async findAll(): Promise<Service[]> {
        const snapshot = await collectionRef.get();

        return snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        } as Service));
    },

    async findById(id: string): Promise<Service | null> {
        const docRef = collectionRef.doc(id);
        const snapshot = await docRef.get();

        if (!snapshot.exists) return null;

        return {
            id: snapshot.id,
            ...snapshot.data()
        } as Service;
    },

    async findByServiceId(serviceId: string): Promise<Service | null> {
        const snapshot = await collectionRef
            .where('serviceId', '==', serviceId)
            .limit(1)
            .get();

        if (snapshot.empty) return null;

        const doc = snapshot.docs[0];

        return {
            id: doc.id,
            ...doc.data()
        } as Service;
    },

    async create(service: Omit<Service, 'id'>): Promise<string> {
        const docRef = await collectionRef.add({
            ...service,
            createdAt: new Date(),
            updatedAt: new Date()
        });

        return docRef.id;
    },

    async update(id: string, data: Partial<Service>): Promise<void> {
        await collectionRef.doc(id).update({
            ...data,
            updatedAt: new Date()
        });
    },

    async delete(id: string): Promise<void> {
        await collectionRef.doc(id).delete();
    },

    async findByFilters(filters: {
        locationId?: string;
        departmentId?: string;
        category?: string;
    }): Promise<Service[]> {

        let query: FirebaseFirestore.Query = collectionRef;

        if (filters.locationId) {
            query = query.where('location.id', '==', filters.locationId);
        }

        if (filters.departmentId) {
            query = query.where('department.id', '==', filters.departmentId);
        }

        if (filters.category) {
            query = query.where('category', '==', filters.category);
        }

        const snapshot = await query.get();

        return snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        } as Service));
    }
};