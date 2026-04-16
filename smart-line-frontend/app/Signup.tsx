import { useState } from 'react';
import { ScrollView, Text, TouchableOpacity, Alert, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { api } from '@/api/client';
import { THEME } from '@/constants/theme';
import FormInput from '../components/FormInput';
import PrimaryButton from '../components/PrimaryButton';
import { getFirebaseAuth } from '@/auth';
import ScreenHeader from "@/components/DashboardHeader";
import { createUserWithEmailAndPassword, sendEmailVerification } from "firebase/auth";

export default function Signup() {
    const auth = getFirebaseAuth();
    const [fields, setFields] = useState({ nic: '', name: '', dob: '', email: '', mobile: '', password: '', confirmPassword: '' });
    const [loading, setLoading] = useState(false);

    const set = (key: keyof typeof fields) => (val: string) => setFields(f => ({ ...f, [key]: val }));

    const handleSignup = async () => {
        const { nic, name, dob, email, mobile, password, confirmPassword } = fields;
        if (!nic || !name || !dob || !email || !mobile || !password || !confirmPassword) {
            Alert.alert('Error', 'Please fill all fields');
            return;
        }
        if (password !== confirmPassword) {
            Alert.alert('Error', 'Passwords do not match');
            return;
        }
        try {
            setLoading(true);

            const cred = await createUserWithEmailAndPassword(auth, email.trim(), password);
            console.log("USER CREATED");

            await sendEmailVerification(cred.user);
            console.log("VERIFICATION SENT");

            const token = await cred.user.getIdToken(true);
            console.log("TOKEN:", token);

            await api.savePendingUser(token, {
                nic: nic.trim(),
                role: 'CITIZEN',
                name: name.trim(),
                dob: dob.trim(),
                email: email.trim(),
                mobile: mobile.trim()
            });
            console.log("SAVED TO BACKEND");

            Alert.alert('Success', 'Account created. Now upload your birth certificate.');

            router.push('/UploadCertificateScreen');

        } catch (error: any) {
            Alert.alert('Signup Error', error.message || 'Something went wrong');
        } finally {
            setLoading(false);
        }
    };

    return (
        <ScrollView testID="signupScreen" contentContainerStyle={s.container}>
            <ScreenHeader title="Register" subtitle="Create your account" />

            <FormInput testID="nicInput"             placeholder="NIC number"       value={fields.nic}             onChangeText={set('nic')} />
            <FormInput testID="nameInput"            placeholder="Full name"         value={fields.name}            onChangeText={set('name')} />
            <FormInput testID="dobInput"             placeholder="Date of birth"     value={fields.dob}             onChangeText={set('dob')} />
            <FormInput testID="emailInput"           placeholder="Email address"     value={fields.email}           onChangeText={set('email')} autoCapitalize="none" keyboardType="email-address" />
            <FormInput testID="mobileInput"          placeholder="Mobile number"     value={fields.mobile}          onChangeText={set('mobile')} keyboardType="phone-pad" />
            <FormInput testID="passwordInput"        placeholder="Password"          value={fields.password}        onChangeText={set('password')} secureTextEntry />
            <FormInput testID="confirmPasswordInput" placeholder="Confirm password"  value={fields.confirmPassword} onChangeText={set('confirmPassword')} secureTextEntry />

            <PrimaryButton testID="registerButton" label="Register" onPress={handleSignup} loading={loading} />

            <TouchableOpacity testID="backToLoginButton" onPress={() => router.push('/LoginScreen')}>
                <Text style={s.link}>Already have an account? Login</Text>
            </TouchableOpacity>
        </ScrollView>
    );
}

const s = StyleSheet.create({
    container: { flexGrow: 1, backgroundColor: THEME.background, alignItems: 'center', padding: 24, paddingTop: 48 },
    link: { marginTop: 20, color: THEME.secondary, fontSize: 14, textAlign: 'center' },
});