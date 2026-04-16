import { View, StyleSheet } from 'react-native';
import {IconButton, Text} from 'react-native-paper';
import MaskedView from '@react-native-masked-view/masked-view';
import { LinearGradient } from 'expo-linear-gradient';
import { THEME } from '@/constants/theme';
import {router} from "expo-router";
import {useAuth} from "@/store/AuthContext";
//import {useUserStore} from "@/store/useUserStore";

interface Props {
    kicker?: string;
    title: string;
    subtitle?: string;
    showLogout?: boolean;
}

export default function ScreenHeader({
                                         kicker = 'SmartQueue',
                                         title,
                                         subtitle,
                                         showLogout = false
}: Props) {

    const { logout } = useAuth();

    const handleLogout = () => {
        logout(); // clear user
        router.push('/Login');
    };

    return (
        <View style={s.wrap}>

            {/* HEADER TOP ROW */}
            <View style={s.topRow}>
                <View style={s.eyebrowRow}>
                    <View style={s.eyebrowLine} />
                    <Text style={s.eyebrow}>{kicker}</Text>
                </View>

                {showLogout && (
                    <IconButton
                        icon="logout"
                        size={22}
                        iconColor={THEME.primary}
                        onPress={handleLogout}
                    />
                )}
            </View>

            {/* TITLE */}
            <MaskedView maskElement={<Text style={s.titleMask}>{title}</Text>}>
                <LinearGradient
                    colors={['#1a7f5a', '#2563eb']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                >
                    <Text style={[s.titleMask, { opacity: 0 }]}>{title}</Text>
                </LinearGradient>
            </MaskedView>

            {subtitle && <Text style={s.subtitle}>{subtitle}</Text>}
            <View style={s.divider} />
        </View>
    );
}

const s = StyleSheet.create({
    wrap: { marginBottom: 28 },
    topRow: {flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center'},
    eyebrowRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
    eyebrowLine: { width: 18, height: 2, backgroundColor: THEME.primary, borderRadius: 2 },
    eyebrow: { fontSize: 11, letterSpacing: 1.4, textTransform: 'uppercase', color: THEME.primary, fontWeight: '600' },
    titleMask: { fontSize: 36, fontWeight: '800', letterSpacing: -0.5, lineHeight: 42 },
    subtitle: { fontSize: 14, color: THEME.gray, marginTop: 6, lineHeight: 20 },
    divider: { marginTop: 18, height: 1, backgroundColor: THEME.border },
});