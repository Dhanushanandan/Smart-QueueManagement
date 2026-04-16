import admin from 'firebase-admin';
import path from 'path';

const serviceAccount = require(path.join(
    __dirname,
    '../../smartline-d94b4-firebase-adminsdk-fbsvc-820ad2c09d.json'
));

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});

export const db = admin.firestore();