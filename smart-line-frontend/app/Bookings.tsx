import { useEffect, useState } from 'react';
import {
    ScrollView, View, Text, StyleSheet,
    TouchableOpacity, ActivityIndicator, RefreshControl,
} from 'react-native';
import { router } from 'expo-router';
import { THEME } from '@/constants/theme';
import ScreenHeader from '@/components/DashboardHeader';
import { useAuth } from '@/store/AuthContext';
import { api } from '@/api/client';
import type {Bookings, BookingsStat, BookingStat, Queue} from '@/types/types';

type FilterTab = 'WAITING' | 'SERVED' | 'CANCELLED' | 'ALL';

interface EnrichedRow {
    id: string;
    queueId: string;
    status: string;
    createdAt: string;
    position?: number;
    queue: Queue | null;
}

function StatusPill({ status }: { status: string }) {
    const map: Record<string, { bg: string; border: string; color: string; label: string }> = {
        WAITING:   { bg: THEME.blue.bg,   border: THEME.blue.border,   color: THEME.blue.text,   label: 'Waiting' },
        SERVED:    { bg: THEME.green.bg,  border: THEME.green.border,  color: THEME.green.text,  label: 'Served' },
        CANCELLED: { bg: THEME.amber.bg,  border: THEME.amber.border,  color: THEME.amber.text,  label: 'Cancelled' },
    };
    const c = map[status] ?? map.WAITING;
    return (
        <View style={[pill.wrap, { backgroundColor: c.bg, borderColor: c.border }]}>
    <View style={[pill.dot, { backgroundColor: c.color }]} />
    <Text style={[pill.label, { color: c.color }]}>{c.label}</Text>
    </View>
);
}
const pill = StyleSheet.create({
    wrap:  { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20, borderWidth: 1 },
    dot:   { width: 6, height: 6, borderRadius: 3 },
    label: { fontSize: 11, fontWeight: '600' },
});

export default function Bookings() {
    const { user } = useAuth();
    const [rows, setRows]       = useState<EnrichedRow[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [tab, setTab]         = useState<FilterTab>('ALL');

    const TABS: FilterTab[] = ['ALL', 'WAITING', 'SERVED', 'CANCELLED'];

    const load = async () => {
        if (!user?.uid) { setLoading(false); return; }
        try {
            // merge active (BookingStat) + past (Booking) into one unified list
            const [statusRaw, bookingsRaw] = await Promise.allSettled([
                api.getStatus(user.uid),
                api.getMyBookings(user.uid),
            ]);

            const waiting: EnrichedRow[] = [];
            if (statusRaw.status === 'fulfilled') {
                const flat: BookingStat[] = Array.isArray(statusRaw.value[0])
                    ? (statusRaw.value as any).flat()
                    : (statusRaw.value as BookingsStat);
                flat.filter(b => b.status === 'WAITING').forEach(b => {
                    waiting.push({ id: b.bookingId, queueId: b.queueId, status: b.status, createdAt: '', position: b.position, queue: null });
                });
            }

            const done: EnrichedRow[] = [];
            if (bookingsRaw.status === 'fulfilled') {
                const flat: Bookings = Array.isArray(bookingsRaw.value[0])
                    ? (bookingsRaw.value as any).flat()
                    : (bookingsRaw.value as Bookings);
                flat.filter(b => b.status !== 'WAITING').forEach(b => {
                    done.push({ id: b.id, queueId: b.queueId, status: b.status, createdAt: b.createdAt, position: b.position, queue: null });
                });
            }

            const all = [...waiting, ...done];

            // enrich with queue names in parallel
            const enriched = await Promise.all(
                all.map(async row => {
                    let queue: Queue | null = null;
                    try { queue = await api.getQueueById(row.queueId); } catch {}
                    return { ...row, queue };
                })
            );

            setRows(enriched);
        } catch { /* non-fatal */ }
        finally { setLoading(false); }
    };

    useEffect(() => { load(); }, [user?.uid]);

    const onRefresh = async () => { setRefreshing(true); await load(); setRefreshing(false); };

    const filtered = tab === 'ALL' ? rows : rows.filter(r => r.status === tab);

    const formatDate = (iso: string) => {
        if (!iso) return '—';
        try { return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }); }
        catch { return iso; }
    };

    const counts = {
        ALL:       rows.length,
        WAITING:   rows.filter(r => r.status === 'WAITING').length,
        SERVED:    rows.filter(r => r.status === 'SERVED').length,
        CANCELLED: rows.filter(r => r.status === 'CANCELLED').length,
    };

    return (
        <ScrollView
            style={s.root}
    contentContainerStyle={s.content}
    showsVerticalScrollIndicator={false}
    refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={THEME.primary} />}
    >
    <ScreenHeader title="My Bookings" subtitle="All your queue history in one place." />

        {/* filter tabs */}
        <View style={s.tabs}>
        {TABS.map(t => (
                <TouchableOpacity
                    key={t}
            style={[s.tab, tab === t && s.tabActive]}
    onPress={() => setTab(t)}
    activeOpacity={0.75}
    >
    <Text style={[s.tabText, tab === t && s.tabTextActive]}>
    {t === 'ALL' ? 'All' : t.charAt(0) + t.slice(1).toLowerCase()}
    </Text>
    <View style={[s.tabBadge, tab === t && s.tabBadgeActive]}>
    <Text style={[s.tabBadgeText, tab === t && s.tabBadgeTextActive]}>{counts[t]}</Text>
    </View>
    </TouchableOpacity>
))}
    </View>

    {loading ? (
        <ActivityIndicator color={THEME.primary} style={{ marginTop: 40 }} />
    ) : filtered.length === 0 ? (
        <View style={s.emptyCard}>
        <Text style={s.emptyIcon}>📋</Text>
    <Text style={s.emptyTitle}>No bookings found</Text>
    <Text style={s.emptyBody}>Nothing here for the selected filter.</Text>
    </View>
    ) : (
        <View style={s.listCard}>
            {filtered.map((row, i) => (
                    <TouchableOpacity
                        key={row.id}
                        style={[s.row, i < filtered.length - 1 && s.rowBorder]}
                        onPress={() => router.push({
                            pathname: '/BookingDetail',
                            params: { bookingId: row.id  }
                        })}
        activeOpacity={0.75}
        >
        <View style={s.rowLeft}>
        <Text style={s.rowQueue}>{row.queue?.name ?? `Queue ${row.queueId.slice(0, 6)}`}</Text>
            <Text style={s.rowMeta}>
        {row.position ? `#${row.position}` : ''}
        {row.position && row.createdAt ? '  ·  ' : ''}
        {formatDate(row.createdAt)}
        </Text>
        </View>
        <View style={s.rowRight}>
    <StatusPill status={row.status} />
    <Text style={s.chevron}>›</Text>
    </View>
    </TouchableOpacity>
    ))}
        </View>
    )}

    <View style={{ height: 32 }} />
    </ScrollView>
);
}

    const s = StyleSheet.create({
        root:    { flex: 1, backgroundColor: THEME.background },
        content: { padding: 24, paddingTop: 56, paddingBottom: 48 },

        tabs:          { flexDirection: 'row', gap: 8, marginBottom: 20 },
        tab:           { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 5, paddingVertical: 9, borderRadius: 10, borderWidth: 1, borderColor: THEME.border, backgroundColor: THEME.card },
        tabActive:     { backgroundColor: THEME.primary, borderColor: THEME.primary },
        tabText:       { fontSize: 11, fontWeight: '600', color: THEME.gray },
        tabTextActive: { color: '#fff' },
        tabBadge:      { backgroundColor: THEME.border, borderRadius: 10, minWidth: 18, paddingHorizontal: 4, paddingVertical: 1, alignItems: 'center' },
        tabBadgeActive:    { backgroundColor: 'rgba(255,255,255,0.25)' },
        tabBadgeText:      { fontSize: 10, fontWeight: '700', color: THEME.gray },
        tabBadgeTextActive:{ color: '#fff' },

        listCard:   { backgroundColor: THEME.card, borderWidth: 1, borderColor: THEME.border, borderRadius: 16, paddingHorizontal: 18 },
        row:        { flexDirection: 'row', alignItems: 'center', paddingVertical: 16, gap: 12 },
        rowBorder:  { borderBottomWidth: 1, borderBottomColor: THEME.borderLight },
        rowLeft:    { flex: 1, gap: 3 },
        rowQueue:   { fontSize: 14, fontWeight: '700', color: THEME.text },
        rowMeta:    { fontSize: 11, color: THEME.grayLight },
        rowRight:   { alignItems: 'flex-end', gap: 4 },
        chevron:    { fontSize: 16, color: THEME.grayLight },

        emptyCard:  { backgroundColor: '#f9fafb', borderWidth: 1, borderColor: THEME.border, borderRadius: 16, padding: 40, alignItems: 'center' },
        emptyIcon:  { fontSize: 32, marginBottom: 10 },
        emptyTitle: { fontSize: 15, fontWeight: '700', color: THEME.text, marginBottom: 4 },
        emptyBody:  { fontSize: 13, color: THEME.gray, textAlign: 'center' },
    });