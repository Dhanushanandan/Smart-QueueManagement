import { useState } from 'react';
import { ScrollView, Text, TouchableOpacity, Alert, Image, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { api } from '@/api/client';
import { THEME } from '@/constants/theme';
import FormInput from '../components/FormInput';
import PrimaryButton from '../components/PrimaryButton';
import ScreenHeader from "@/components/DashboardHeader";
import { signInWithEmailAndPassword } from "firebase/auth";
import { getFirebaseAuth } from '@/auth';
// import {useUserStore} from "@/store/useUserStore";
import {useAuth} from "@/store/AuthContext";

export default function Login() {
    const auth = getFirebaseAuth();

    const { login } = useAuth();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);

    //const setUserId = useUserStore((s) => s.setUserIdAndLoadUser);

    const handleLogin = async () => {
        if (!email || !password) {
            Alert.alert('Error', 'Please enter email and password');
            return;
        }

        try {
            setLoading(true);

            const cred = await signInWithEmailAndPassword(auth, email.trim(), password);

            await cred.user.reload();

            const isVerified = cred.user.emailVerified;

            if (!isVerified) {
                Alert.alert('Verify Email', 'Please verify your email.');
                return;
            }

            const userId = cred.user.uid;

            const token = await cred.user.getIdToken(true);
            const check: any = await api.checkUserNode(token);

            if (check.inUsers || check.inPendingUsers) {
                if (check.inPendingUsers) {
                    await api.finalizeUser(token);
                }
                login(userId);
                //setUserId(userId);
                router.push('/Dashboard');
            } else {
                Alert.alert('Error', 'User not found');
            }

        } catch (err) {
            console.log("LOGIN ERROR:", err);

            try {
                const pending: any = await api.checkPendingEmail(email.trim());

                if (pending.exists) {
                    Alert.alert('Verify Email', 'Please verify your email first.');
                } else {
                    Alert.alert('Login Error', 'Invalid email or password');
                }
            } catch {
                Alert.alert('Login Error', 'Invalid email or password');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <ScrollView testID="loginScreen" contentContainerStyle={s.container}>
            <Image testID="loginLogoImage" source={require('@/assets/Logo.png')} style={s.logo} />
            <ScreenHeader title="Login" subtitle="Sign in to your account" />

            <FormInput
                testID="loginEmailInput"
                placeholder="Email address"
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
            />
            <FormInput
                testID="loginPasswordInput"
                placeholder="Password"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
            />

            <PrimaryButton testID="loginButton" label="Login" onPress={handleLogin} loading={loading} />

            <TouchableOpacity testID="goToRegisterButton" onPress={() => router.push('/Signup')}>
                <Text style={s.link}>Don&#39;t have an account? Register</Text>
            </TouchableOpacity>
        </ScrollView>
    );
}

const s = StyleSheet.create({
    container: { flexGrow: 1, backgroundColor: THEME.background, alignItems: 'center', justifyContent: 'center', padding: 24 },
    logo: { width: 200, height: 120, borderRadius: 12, marginBottom: 20 },
    link: { marginTop: 20, color: THEME.secondary, fontSize: 14, textAlign: 'center' },
});