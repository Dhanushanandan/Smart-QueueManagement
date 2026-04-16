import { TouchableOpacity, View, ActivityIndicator, StyleSheet, Text } from 'react-native';
import { THEME } from '@/constants/theme';

interface Props {
    label: string;
    onPress: () => void;
    loading?: boolean;
    disabled?: boolean;
    testID?: string;
}

export default function PrimaryButton({ label, onPress, loading, disabled, testID }: Props) {
    return (
        <TouchableOpacity
            testID={testID}
            onPress={onPress}
            disabled={loading || disabled}
            activeOpacity={0.85}
            style={[s.btn, (loading || disabled) && s.btnDisabled]}
        >
            <View style={s.inner}>
                {loading ? (
                    <ActivityIndicator color="#fff" size="small" />
                ) : (
                    <Text style={s.label}>{label}</Text>
                )}
            </View>
        </TouchableOpacity>
    );
}

const s = StyleSheet.create({
    btn: {
        width: '100%',
        height: 52,
        backgroundColor: THEME.primary,
        borderRadius: 14,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 8,
    },
    btnDisabled: { opacity: 0.55 },
    inner: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    label: { fontSize: 16, fontWeight: '700', color: '#ffffff', letterSpacing: -0.2 },
});