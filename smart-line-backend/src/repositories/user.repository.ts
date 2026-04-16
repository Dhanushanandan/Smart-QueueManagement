import { db } from '../config/firebase';
import { User } from '../models/user.model';

const USERS_COLLECTION = 'users';

export const UserRepository = {

    async findAll(): Promise<User[]> {
        const snapshot = await db.collection(USERS_COLLECTION).get();

        return snapshot.docs.map(doc => {
            const data = doc.data();
            return {
                uid: data.uid,
                name: data.name,
                role: data.role,
                email: data.email,
                mobile: data.mobile,
                nic: data.nic,
                dob: data.dob,
                status: data.status,
                step: data.step,
            } as User;
        });
    },

    async findById(uid: string): Promise<User | null> {
        const snapshot = await db
            .collection(USERS_COLLECTION)
            .where('uid', '==', uid)
            .limit(1)
            .get();

        if (snapshot.empty) return null;

        const data = snapshot.docs[0].data();

        return {
            uid: data.uid,
            name: data.name,
            role: data.role,
            email: data.email,
            mobile: data.mobile,
            nic: data.nic,
            dob: data.dob,
            status: data.status,
            step: data.step,
        } as User;
    }
};