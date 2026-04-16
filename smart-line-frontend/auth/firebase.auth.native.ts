import AsyncStorage from '@react-native-async-storage/async-storage';
import { initializeApp, getApps, getApp } from 'firebase/app';
import { initializeAuth, getReactNativePersistence, getAuth, Auth } from 'firebase/auth';
import { firebaseConfig } from '@/auth/firebaseConfig';

export function getFirebaseAuth(): Auth {
    if (getApps().length > 0) {
        return getAuth(getApp());
    }
    const app = initializeApp(firebaseConfig);
    return initializeAuth(app, {
        persistence: getReactNativePersistence(AsyncStorage),
    });
}