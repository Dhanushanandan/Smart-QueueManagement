import { View, Text, StyleSheet, ActivityIndicator, Image } from 'react-native';
import { router } from 'expo-router';
import { useEffect } from 'react';
import { THEME } from '@/constants/theme';
// import {useUserStore} from "@/store/useUserStore";
//
export default function Splash() {
//     const loadUser = useUserStore(s => s.loadUser);
//
//     useEffect(() => {
//         loadUser(); // will use default UID if nothing exists
//     }, []);

    useEffect(() => {
        const t = setTimeout(() => router.replace('/Login'), 2000);
        return () => clearTimeout(t);
    }, []);

    return (
        <View testID="splashScreen" style={s.container}>
            <Image
                testID="splashLogoImage"
                source={require('@/assets/Logo.png')}
                style={s.logo}
            />
            <Text testID="splashLogo" style={s.brand}>SmartQueue</Text>
            <ActivityIndicator testID="splashLoader" size="large" color={THEME.primary} />
        </View>
    );
}

const s = StyleSheet.create({
    container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: THEME.background },
    logo: { width: 200, height: 120, borderRadius: 12, marginBottom: 16 },
    brand: { fontSize: 32, fontWeight: '800', color: THEME.primary, marginBottom: 24, letterSpacing: -0.5 },
});