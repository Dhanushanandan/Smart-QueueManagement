import { View, Text, StyleSheet } from 'react-native';
import { THEME } from '../constants/theme';

export default function StatusCard({ status }: any) {
    const isYourTurn = status.isYourTurn;
    return (
        <View style={[s.card, isYourTurn ? s.green : s.blue]}>
            <Text style={[s.text, isYourTurn ? s.greenText : s.blueText]}>
                {isYourTurn ? '🎉 Your Turn!' : `Waiting… ${status.peopleAhead} ahead`}
            </Text>
        </View>
    );
}

const s = StyleSheet.create({
    card: { borderRadius: 16, padding: 18, alignItems: 'center', marginBottom: 14, borderWidth: 1 },
    text: { fontSize: 16, fontWeight: '600', textAlign: 'center' },
    green: { backgroundColor: THEME.green.bg, borderColor: THEME.green.border },
    greenText: { color: THEME.green.text },
    blue: { backgroundColor: THEME.blue.bg, borderColor: THEME.blue.border },
    blueText: { color: THEME.blue.text },
});