import {db} from "../config/firebase";


const USERS = 'users';
const PENDING = 'pendingUsers';

export const AuthRepository = {

    async savePendingUser(uid: string, data: any) {
        await db.collection(PENDING).doc(uid).set(data);
    },

    async getPendingUser(uid: string) {
        const doc = await db.collection(PENDING).doc(uid).get();
        return doc.exists ? doc.data() : null;
    },

    async checkEmailExists(email: string) {
        const snapshot = await db
            .collection(PENDING)
            .where('email', '==', email)
            .get();

        return !snapshot.empty;
    },

    async finalizeUser(uid: string, data: any) {
        const batch = db.batch();

        const userRef = db.collection(USERS).doc(uid);
        const pendingRef = db.collection(PENDING).doc(uid);

        batch.set(userRef, {
            ...data,
            status: 'active',
            finalizedAt: Date.now()
        });

        batch.delete(pendingRef);

        await batch.commit();
    },

    async updatePending(uid: string, data: any) {
        await db.collection(PENDING).doc(uid).update(data);
    }
};