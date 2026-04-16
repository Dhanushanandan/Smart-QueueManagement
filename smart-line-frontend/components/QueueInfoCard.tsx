import { View, Text, StyleSheet } from 'react-native';
import { THEME } from '@/constants/theme';

interface Props {
    queue: {
        currentNumber: string | number;
        estimatedWaitTime: number;
        totalInQueue?: number;
        avgServiceTime?: number;
    };
}

export default function QueueInfoCard({ queue }: Props) {
    const stats = [
        { label: 'Now serving',    value: queue.currentNumber,         unit: '',    accent: THEME.primary },
        { label: 'Wait time',      value: queue.estimatedWaitTime,     unit: 'min', accent: THEME.secondary },
        { label: 'Total in queue', value: queue.totalInQueue ?? '—',   unit: '',    accent: THEME.primary },
        { label: 'Avg. service',   value: queue.avgServiceTime ?? '—', unit: 'min', accent: THEME.secondary },
    ];

    return (
        <View style={s.card}>
            <View style={s.grid}>
                {stats.map((stat) => (
                    <View key={stat.label} style={s.cell}>
                        <Text style={s.cellLabel}>{stat.label}</Text>
                        <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 3 }}>
                            <Text style={[s.cellVal, { color: stat.accent }]}>{stat.value}</Text>
                            {!!stat.unit && <Text style={s.cellUnit}>{stat.unit}</Text>}
                        </View>
                    </View>
                ))}
            </View>
        </View>
    );
}

const s = StyleSheet.create({
    card: { backgroundColor: THEME.card, borderWidth: 1, borderColor: THEME.border, borderRadius: 16, padding: 18, marginBottom: 14 },
    grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
    cell: { backgroundColor: THEME.cardSurface, borderWidth: 1, borderColor: THEME.border, borderRadius: 10, padding: 14, flexBasis: '47%', flexGrow: 1 },
    cellLabel: { fontSize: 11, color: THEME.gray, textTransform: 'uppercase', letterSpacing: 0.8, fontWeight: '500', marginBottom: 6 },
    cellVal: { fontSize: 26, fontWeight: '800', lineHeight: 30 },
    cellUnit: { fontSize: 12, color: THEME.grayLight },
});