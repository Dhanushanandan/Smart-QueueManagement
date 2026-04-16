import { Text, StyleSheet, TextStyle } from 'react-native';
import { THEME } from '@/constants/theme';

export default function SectionLabel({ children, style }: { children: string; style?: TextStyle }) {
    return <Text style={[s.label, style]}>{children}</Text>;
}

const s = StyleSheet.create({
    label: {
        fontSize: 11,
        color: THEME.gray,
        letterSpacing: 1.1,
        textTransform: 'uppercase',
        fontWeight: '500',
        marginBottom: 10,
    },
});