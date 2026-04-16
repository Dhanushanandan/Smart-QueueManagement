import React, { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { api } from '@/api/client';
import { User } from '@/types/types';

interface AuthContextType {
    user: User | null;
    loading: boolean;
    login: (userId: string) => Promise<void>;
    logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    // 🔥 Load user from storage on app start
    useEffect(() => {
        const loadStoredUser = async () => {
            try {
                const stored = await AsyncStorage.getItem('user');

                if (stored) {
                    setUser(JSON.parse(stored));
                }
            } catch (err) {
                console.log('Storage load error', err);
            } finally {
                setLoading(false);
            }
        };

        loadStoredUser();
    }, []);

    const login = async (userId: string) => {
        setLoading(true);
        try {
            const user = await api.getUser(userId);

            setUser(user);
            await AsyncStorage.setItem('user', JSON.stringify(user));

        } catch (err) {
            console.log('Login failed', err);
        } finally {
            setLoading(false);
        }
    };

    const logout = async () => {
        setUser(null);
        await AsyncStorage.removeItem('user');
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
    return ctx;
};