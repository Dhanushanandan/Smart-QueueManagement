import admin from 'firebase-admin';
import { AuthRepository } from './auth.repository';
import {extractCertificateData} from "./ocr.utils";

export const AuthService = {

    async verifyToken(token: string) {
        return await admin.auth().verifyIdToken(token);
    },

    async savePendingUser(uid: string, body: any) {
        const { nic, name, dob, email, mobile } = body;

        if (!nic || !name || !dob || !email || !mobile) {
            throw new Error('Missing fields');
        }

        await AuthRepository.savePendingUser(uid, {
            uid,
            ...body,
            createdAt: Date.now(),
            step: 'basic_details_saved'
        });
    },

    async checkUserNode(uid: string) {
        const pending = await AuthRepository.getPendingUser(uid);

        const userDoc = await admin.firestore().collection('users').doc(uid).get();

        return {
            inUsers: userDoc.exists,
            inPendingUsers: !!pending
        };
    },

    async checkPendingEmail(email: string) {
        return await AuthRepository.checkEmailExists(email);
    },

    async finalizeUser(uid: string) {
        const userRecord = await admin.auth().getUser(uid);

        if (!userRecord.emailVerified) {
            throw new Error('Email not verified');
        }

        const pending = await AuthRepository.getPendingUser(uid);

        if (!pending) {
            throw new Error('No pending user');
        }

        await AuthRepository.finalizeUser(uid, pending);
    },

    async processCertificate(imageBase64: string) {
        return await extractCertificateData(imageBase64);
    },

    async saveCertificate(uid: string, data: any) {
        await AuthRepository.updatePending(uid, {
            certificateDetails: data,
            step: 'certificate_saved',
            certificateSavedAt: Date.now()
        });
    }
};