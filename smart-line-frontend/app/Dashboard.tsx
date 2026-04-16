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
import type {BookingStat, DashboardStats, Booking, Queue, Service, BookingsStat, Bookings} from '@/types/types';

// ─── helpers ──────────────────────────────────────────────────────────────────

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

function SectionTitle({ children, action, onAction }: { children: string; action?: string; onAction?: () => void }) {
    return (
        <View style={stt.row}>
            <View style={stt.left}>
                <View style={stt.line} />
                <Text style={stt.text}>{children}</Text>
            </View>
            {action && (
                <TouchableOpacity onPress={onAction} activeOpacity={0.7}>
                    <Text style={stt.action}>{action}</Text>
                </TouchableOpacity>
            )}
        </View>
    );
}
const stt = StyleSheet.create({
    row:    { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12, marginTop: 24 },
    left:   { flexDirection: 'row', alignItems: 'center', gap: 8 },
    line:   { width: 3, height: 14, backgroundColor: THEME.primary, borderRadius: 2 },
    text:   { fontSize: 13, fontWeight: '700', color: THEME.text, textTransform: 'uppercase', letterSpacing: 0.8 },
    action: { fontSize: 12, color: THEME.secondary, fontWeight: '600' },
});

// enriched booking combines stat + queue + service
interface EnrichedBooking {
    stat: BookingStat;
    queue: Queue | null;
    service: Service | null;
}

interface EnrichedPast {
    booking: Booking;
    queue: Queue | null;
}

// ─── main screen ──────────────────────────────────────────────────────────────

export default function Dashboard() {
    const { user } = useAuth();

    const [stats, setStats]           = useState<DashboardStats | null>(null);
    const [upcoming, setUpcoming]     = useState<EnrichedBooking[]>([]);
    const [past, setPast]             = useState<EnrichedPast[]>([]);
    const [loadingStats, setLoadingStats]       = useState(true);
    const [loadingUpcoming, setLoadingUpcoming] = useState(true);
    const [loadingPast, setLoadingPast]         = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const load = async () => {
        // stats
        try {
            setStats(await api.getDashboardStats());
        } catch { /* non-fatal */ }
        finally { setLoadingStats(false); }

        if (!user?.uid) {
            setLoadingUpcoming(false);
            setLoadingPast(false);
            return;
        }

        // active bookings → enrich with queue + service
        try {
            const raw = await api.getStatus(user.uid);
            const flat: BookingsStat = Array.isArray(raw[0]) ? (raw as any).flat() : (raw as BookingsStat);
            const waiting = flat.filter(b => b.status === 'WAITING');

            const enriched: EnrichedBooking[] = await Promise.all(
                waiting.map(async (stat) => {
                    let queue: Queue | null = null;
                    let service: Service | null = null;
                    try { queue = await api.getQueueById(stat.queueId); } catch {}
                    try { if (queue?.serviceId) service = await api.getServicesById(queue.serviceId); } catch {}
                    return { stat, queue, service };
                })
            );
            setUpcoming(enriched);
        } catch { /* non-fatal */ }
        finally { setLoadingUpcoming(false); }

        // past bookings → enrich with queue
        try {
            const raw = await api.getMyBookings(user.uid);
            const flat: Bookings = Array.isArray(raw[0]) ? (raw as any).flat() : (raw as Bookings);
            const done = flat.filter(b => b.status !== 'WAITING').slice(0, 5);

            const enriched: EnrichedPast[] = await Promise.all(
                done.map(async (booking) => {
                    let queue: Queue | null = null;
                    try { queue = await api.getQueueById(booking.queueId); } catch {}
                    return { booking, queue };
                })
            );
            setPast(enriched);
        } catch { /* non-fatal */ }
        finally { setLoadingPast(false); }
    };

    useEffect(() => { load(); }, [user?.uid]);

    const onRefresh = async () => {
        setRefreshing(true);
        await load();
        setRefreshing(false);
    };

    const firstName = user?.name?.split(' ')[0] ?? 'there';

    const formatDate = (iso: string) => {
        try { return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }); }
        catch { return iso; }
    };

    return (
        <ScrollView
            style={s.root}
            contentContainerStyle={s.content}
            showsVerticalScrollIndicator={false}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={THEME.primary} />}
        >
            <ScreenHeader title="Dashboard" subtitle="Your queue activity at a glance." showLogout />

            {/* ── Welcome ── */}
            <View style={s.welcomeCard}>
                <View style={s.welcomeAccent} />
                <View style={s.welcomeBody}>
                    <Text style={s.welcomeGreeting}>Welcome back</Text>
                    <Text style={s.welcomeName}>{firstName}</Text>
                    {user?.nic && <Text style={s.welcomeSub}>NIC: {user.nic}</Text>}
                </View>
                <TouchableOpacity style={s.bookBtn} onPress={() => router.push('/Home')} activeOpacity={0.85}>
                    <Text style={s.bookBtnText}>Make a booking</Text>
                    <Text style={s.bookBtnArrow}>›</Text>
                </TouchableOpacity>
            </View>

            {/* ── System stats ── */}
            <SectionTitle>System overview</SectionTitle>
            {loadingStats ? (
                <ActivityIndicator color={THEME.primary} style={{ marginVertical: 16 }} />
            ) : stats ? (
                <View style={s.statsRow}>
                    {[
                        { label: 'Services',    value: stats.totalServices,    accent: THEME.primary },
                        { label: 'Departments', value: stats.totalDepartments, accent: THEME.secondary },
                        { label: 'Locations',   value: stats.totalLocations,   accent: '#d97706' },
                    ].map(item => (
                        <View key={item.label} style={[s.statCard, { borderTopColor: item.accent }]}>
                            <Text style={[s.statValue, { color: item.accent }]}>{item.value}</Text>
                            <Text style={s.statLabel}>{item.label}</Text>
                        </View>
                    ))}
                </View>
            ) : (
                <Text style={s.emptyText}>Could not load stats.</Text>
            )}

            {/* ── Active bookings ── */}
            <SectionTitle
                action="View all"
                onAction={() => router.push('/Bookings') }
            >
                Active bookings
            </SectionTitle>

            {loadingUpcoming ? (
                <ActivityIndicator color={THEME.primary} style={{ marginVertical: 16 }} />
            ) : upcoming.length === 0 ? (
                <View style={s.emptyCard}>
                    <Text style={s.emptyIcon}>🎟</Text>
                    <Text style={s.emptyTitle}>No active bookings</Text>
                    <Text style={s.emptyBody}>You&#39;re not currently waiting in any queue.</Text>
                    <TouchableOpacity style={s.emptyBtn} onPress={() => router.push('/Home')} activeOpacity={0.85}>
                        <Text style={s.emptyBtnText}>Browse services →</Text>
                    </TouchableOpacity>
                </View>
            ) : (
                upcoming.map(({ stat, queue, service }, idx) => (
                    <TouchableOpacity
                        key={stat.bookingId}
                        style={[s.bookingCard, idx === 0 && s.bookingCardFeatured]}
                        onPress={() => router.push({ pathname: '/BookingDetail', params: { bookingId: stat.bookingId } })}
                        activeOpacity={0.85}
                    >
                        {/* featured top card gets extra info */}
                        {idx === 0 && (
                            <View style={s.featuredBanner}>
                                <Text style={s.featuredBannerText}>Most upcoming</Text>
                            </View>
                        )}

                        <View style={s.bookingTopRow}>
                            <View style={{ flex: 1, gap: 3 }}>
                                <Text style={s.bookingQueueName}>{queue?.name ?? 'Loading…'}</Text>
                                {idx === 0 && service && (
                                    <Text style={s.bookingLocation}>
                                        📍 {service.location?.name ?? '—'}
                                    </Text>
                                )}
                            </View>
                            <StatusPill status={stat.status} />
                        </View>

                        <View style={s.bookingStatsRow}>
                            <View style={s.bookingStat}>
                                <Text style={s.bookingStatVal}>{stat.position}</Text>
                                <Text style={s.bookingStatLabel}>Your number</Text>
                            </View>
                            <View style={[s.bookingStat, s.bookingStatBorder]}>
                                <Text style={[s.bookingStatVal, { color: '#d97706' }]}>{stat.peopleAhead}</Text>
                                <Text style={s.bookingStatLabel}>Ahead</Text>
                            </View>
                            <View style={[s.bookingStat, s.bookingStatBorder]}>
                                <Text style={[s.bookingStatVal, { color: THEME.secondary }]}>{stat.estimatedWaitTime}</Text>
                                <Text style={s.bookingStatLabel}>Est. wait (min)</Text>
                            </View>
                            {idx === 0 && service && (
                                <View style={[s.bookingStat, s.bookingStatBorder]}>
                                    <Text style={[s.bookingStatVal, { color: THEME.primary, fontSize: 13 }]}>
                                        {service.location?.name ?? '—'}
                                    </Text>
                                    <Text style={s.bookingStatLabel}>Location</Text>
                                </View>
                            )}
                        </View>

                        {stat.isYourTurn && (
                            <View style={s.turnBanner}>
                                <Text style={s.turnBannerText}>🎉 It&#39;s your turn! Please proceed to the counter.</Text>
                            </View>
                        )}
                    </TouchableOpacity>
                ))
            )}

            {/* ── Past bookings ── */}
            <SectionTitle
                action="See all history"
                onAction={() => router.push('/Bookings')}
            >
                Past bookings
            </SectionTitle>

            {loadingPast ? (
                <ActivityIndicator color={THEME.primary} style={{ marginVertical: 16 }} />
            ) : past.length === 0 ? (
                <Text style={s.emptyText}>No past bookings yet.</Text>
            ) : (
                <View style={s.historyCard}>
                    {past.map(({ booking, queue }, i) => (
                        <TouchableOpacity
                            key={booking.id}
                            style={[s.historyRow, i < past.length - 1 && s.historyBorder]}
                            onPress={() => router.push({ pathname: '/BookingDetail', params: { bookingId: booking.id } })}
                            activeOpacity={0.75}
                        >
                            <View style={{ flex: 1, gap: 2 }}>
                                <Text style={s.historyQueueName}>{queue?.name ?? `Queue #${booking.queueId.slice(0, 6)}`}</Text>
                                <Text style={s.historyDate}>{formatDate(booking.createdAt)}</Text>
                            </View>
                            <View style={{ alignItems: 'flex-end', gap: 4 }}>
                                <StatusPill status={booking.status} />
                                <Text style={s.historyChevron}>›</Text>
                            </View>
                        </TouchableOpacity>
                    ))}
                </View>
            )}

            {/* ── Bottom CTA ── */}
            <TouchableOpacity style={s.ctaCard} onPress={() => router.push('/Home')} activeOpacity={0.85}>
                <View style={{ flex: 1 }}>
                    <Text style={s.ctaTitle}>Need to join a queue?</Text>
                    <Text style={s.ctaSub}>Browse all available government services</Text>
                </View>
                <View style={s.ctaArrowCircle}>
                    <Text style={s.ctaArrow}>›</Text>
                </View>
            </TouchableOpacity>

            <View style={{ height: 32 }} />
        </ScrollView>
    );
}

const s = StyleSheet.create({
    root:    { flex: 1, backgroundColor: THEME.background },
    content: { padding: 24, paddingTop: 56, paddingBottom: 48 },

    // welcome
    welcomeCard:     { backgroundColor: THEME.card, borderWidth: 1, borderColor: THEME.border, borderRadius: 18, marginBottom: 4, overflow: 'hidden' },
    welcomeAccent:   { height: 4, backgroundColor: THEME.primary },
    welcomeBody:     { padding: 20, paddingBottom: 12 },
    welcomeGreeting: { fontSize: 13, color: THEME.gray, marginBottom: 2 },
    welcomeName:     { fontSize: 26, fontWeight: '800', color: THEME.text, letterSpacing: -0.5 },
    welcomeSub:      { fontSize: 12, color: THEME.gray, marginTop: 4 },
    bookBtn:         { margin: 16, marginTop: 0, backgroundColor: THEME.primary, borderRadius: 12, paddingVertical: 14, paddingHorizontal: 20, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    bookBtnText:     { fontSize: 15, fontWeight: '700', color: '#fff' },
    bookBtnArrow:    { fontSize: 22, color: 'rgba(255,255,255,0.7)', lineHeight: 22 },

    // stats
    statsRow: { flexDirection: 'row', gap: 10, marginBottom: 4 },
    statCard:  { flex: 1, backgroundColor: THEME.card, borderWidth: 1, borderColor: THEME.border, borderTopWidth: 3, borderRadius: 14, padding: 14, gap: 4, minWidth: 90 },
    statValue: { fontSize: 28, fontWeight: '800', lineHeight: 32 },
    statLabel: { fontSize: 11, color: THEME.gray, lineHeight: 15 },

    // active bookings
    bookingCard:         { backgroundColor: THEME.card, borderWidth: 1, borderColor: THEME.border, borderRadius: 16, marginBottom: 12, overflow: 'hidden' },
    bookingCardFeatured: { borderColor: THEME.primary, borderWidth: 1.5 },
    featuredBanner:      { backgroundColor: THEME.green.bg, paddingHorizontal: 14, paddingVertical: 6, borderBottomWidth: 1, borderBottomColor: THEME.green.border },
    featuredBannerText:  { fontSize: 11, fontWeight: '700', color: THEME.green.text, textTransform: 'uppercase', letterSpacing: 0.8 },
    bookingTopRow:       { flexDirection: 'row', alignItems: 'flex-start', gap: 8, padding: 14, paddingBottom: 10 },
    bookingQueueName:    { fontSize: 15, fontWeight: '700', color: THEME.text },
    bookingLocation:     { fontSize: 12, color: THEME.gray },
    bookingStatsRow:     { flexDirection: 'row', borderTopWidth: 1, borderTopColor: THEME.border },
    bookingStat:         { flex: 1, padding: 12, alignItems: 'center' },
    bookingStatBorder:   { borderLeftWidth: 1, borderLeftColor: THEME.border },
    bookingStatVal:      { fontSize: 20, fontWeight: '800', color: THEME.text, lineHeight: 24 },
    bookingStatLabel:    { fontSize: 10, color: THEME.gray, textTransform: 'uppercase', letterSpacing: 0.5, marginTop: 2 },
    turnBanner:          { backgroundColor: THEME.green.bg, borderTopWidth: 1, borderTopColor: THEME.green.border, padding: 12 },
    turnBannerText:      { fontSize: 13, fontWeight: '600', color: THEME.green.text, textAlign: 'center' },

    // past bookings
    historyCard:       { backgroundColor: THEME.card, borderWidth: 1, borderColor: THEME.border, borderRadius: 16, paddingHorizontal: 18 },
    historyRow:        { flexDirection: 'row', alignItems: 'center', paddingVertical: 14 },
    historyBorder:     { borderBottomWidth: 1, borderBottomColor: THEME.borderLight },
    historyQueueName:  { fontSize: 14, fontWeight: '700', color: THEME.text },
    historyDate:       { fontSize: 11, color: THEME.grayLight, marginTop: 2 },
    historyChevron:    { fontSize: 16, color: THEME.grayLight },

    // empty states
    emptyCard:    { backgroundColor: '#f9fafb', borderWidth: 1, borderColor: THEME.border, borderRadius: 16, padding: 28, alignItems: 'center', marginBottom: 4 },
    emptyIcon:    { fontSize: 32, marginBottom: 10 },
    emptyTitle:   { fontSize: 15, fontWeight: '700', color: THEME.text, marginBottom: 4 },
    emptyBody:    { fontSize: 13, color: THEME.gray, textAlign: 'center', lineHeight: 18 },
    emptyBtn:     { marginTop: 16, backgroundColor: THEME.primary, borderRadius: 10, paddingVertical: 10, paddingHorizontal: 20 },
    emptyBtnText: { fontSize: 13, fontWeight: '700', color: '#fff' },
    emptyText:    { fontSize: 13, color: THEME.grayLight, marginBottom: 4 },

    // cta
    ctaCard:        { marginTop: 24, backgroundColor: THEME.secondary, borderRadius: 16, padding: 20, flexDirection: 'row', alignItems: 'center', gap: 12 },
    ctaTitle:       { fontSize: 15, fontWeight: '700', color: '#fff', marginBottom: 3 },
    ctaSub:         { fontSize: 12, color: 'rgba(255,255,255,0.75)' },
    ctaArrowCircle: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center' },
    ctaArrow:       { fontSize: 24, color: '#fff', lineHeight: 26 },
});