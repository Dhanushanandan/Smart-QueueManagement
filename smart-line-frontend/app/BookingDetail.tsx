import { useEffect, useState } from 'react';
import {
    ScrollView, View, Text, StyleSheet,
    ActivityIndicator, TouchableOpacity,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { THEME } from '@/constants/theme';
import ScreenHeader from '@/components/DashboardHeader';
import { useAuth } from '@/store/AuthContext';
import { api } from '@/api/client';
import type { BookingStat, Booking, Queue, Service } from '@/types/types';

function InfoRow({ label, value, accent }: { label: string; value: string | number; accent?: string }) {
    return (
        <View style={ir.row}>
            <Text style={ir.label}>{label}</Text>
            <Text style={[ir.value, accent ? { color: accent } : undefined]}>{value}</Text>
        </View>
    );
}
const ir = StyleSheet.create({
    row:   { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: THEME.borderLight },
    label: { fontSize: 13, color: THEME.gray },
    value: { fontSize: 13, fontWeight: '600', color: THEME.text, maxWidth: '60%', textAlign: 'right' },
});

function Card({ title, accent, children }: { title: string; accent?: string; children: React.ReactNode }) {
    return (
        <View style={[card.wrap, accent ? { borderTopColor: accent, borderTopWidth: 3 } : undefined]}>
            <Text style={card.title}>{title}</Text>
            {children}
        </View>
    );
}
const card = StyleSheet.create({
    wrap:  { backgroundColor: THEME.card, borderWidth: 1, borderColor: THEME.border, borderRadius: 16, padding: 18, marginBottom: 14 },
    title: { fontSize: 12, fontWeight: '700', color: THEME.gray, textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 4 },
});

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
    wrap:  { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 12, paddingVertical: 5, borderRadius: 20, borderWidth: 1 },
    dot:   { width: 7, height: 7, borderRadius: 4 },
    label: { fontSize: 12, fontWeight: '600' },
});

export default function BookingDetail() {
    const { bookingId } = useLocalSearchParams<{ bookingId: string }>();
    const { user } = useAuth();

    const [stat, setStat]       = useState<BookingStat | null>(null);
    const [booking, setBooking] = useState<Booking | null>(null);
    const [queue, setQueue]     = useState<Queue | null>(null);
    const [service, setService] = useState<Service | null>(null);
    const [loading, setLoading] = useState(true);
    const [notFound, setNotFound] = useState(false);

    const formatTs = (ts: { _seconds: number; _nanoseconds: number }) => {
        try { return new Date(ts._seconds * 1000).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' }); }
        catch { return '—'; }
    };
    const formatDate = (iso: string) => {
        if (!iso) return '—';
        try { return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }); }
        catch { return iso; }
    };


    const uid = user?.uid;


    useEffect(() => {
        if (!bookingId || !uid) { setLoading(false); 
            return; 
        }

        (async () => {
            try {
                // try active status first
                const raw = await api.getStatus(uid);
                const flat: BookingStat[] = Array.isArray(raw[0]) ? (raw as any).flat() : (raw as BookingStat[]);
                const found = flat.find(b => b.bookingId === bookingId);
                if (found) setStat(found);

                // also try past bookings for full Booking record
                const bRaw = await api.getMyBookings(uid);
                const bFlat: Booking[] = Array.isArray(bRaw[0]) ? (bRaw as any).flat() : (bRaw as Booking[]);
                const bFound = bFlat.find(b => b.id === bookingId);
                if (bFound) setBooking(bFound);

                const queueId = found?.queueId ?? bFound?.queueId;
                if (!queueId) { setNotFound(true); return; }

                const q = await api.getQueueById(queueId);
                setQueue(q);

                if (q.serviceId) {
                    const svc = await api.getServicesById(q.serviceId);
                    setService(svc);
                }
            } catch {
                setNotFound(true);
            } finally {
                setLoading(false);
            }
        })();
    }, [bookingId, uid]);

    const status = stat?.status ?? booking?.status ?? 'WAITING';
    const isWaiting = status === 'WAITING';

    if (loading) {
        return (
            <View style={s.center}>
                <ActivityIndicator color={THEME.primary} size="large" />
                <Text style={s.loadText}>Loading booking…</Text>
            </View>
        );
    }

    if (notFound || (!stat && !booking)) {
        return (
            <View style={s.center}>
                <Text style={{ fontSize: 32, marginBottom: 12 }}>🔍</Text>
                <Text style={s.notFoundTitle}>Booking not found</Text>
                <TouchableOpacity style={s.backBtn} onPress={() => router.back()} activeOpacity={0.85}>
                    <Text style={s.backBtnText}>Go back</Text>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <ScrollView style={s.root} contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>
            <ScreenHeader title="Booking detail" subtitle={queue?.name ?? 'Queue details'} />

            {/* ── Status hero ── */}
            <View style={[s.heroCard, isWaiting && s.heroCardWaiting]}>
                <View style={s.heroTop}>
                    <View>
                        <Text style={s.heroLabel}>Status</Text>
                        <StatusPill status={status} />
                    </View>
                    {stat && (
                        <View style={{ alignItems: 'flex-end' }}>
                            <Text style={s.heroLabel}>Your number</Text>
                            <Text style={s.heroNumber}>{stat.position}</Text>
                        </View>
                    )}
                </View>

                {isWaiting && stat && (
                    <View style={s.heroStats}>
                        <View style={s.heroStat}>
                            <Text style={[s.heroStatVal, { color: '#d97706' }]}>{stat.peopleAhead}</Text>
                            <Text style={s.heroStatLabel}>People ahead</Text>
                        </View>
                        <View style={[s.heroStat, s.heroStatBorder]}>
                            <Text style={[s.heroStatVal, { color: THEME.secondary }]}>{stat.estimatedWaitTime}</Text>
                            <Text style={s.heroStatLabel}>Est. wait (min)</Text>
                        </View>
                        <View style={[s.heroStat, s.heroStatBorder]}>
                            <Text style={[s.heroStatVal, { color: THEME.primary }]}>{stat.currentNumber}</Text>
                            <Text style={s.heroStatLabel}>Now serving</Text>
                        </View>
                    </View>
                )}

                {stat?.isYourTurn && (
                    <View style={s.turnBanner}>
                        <Text style={s.turnBannerText}>🎉 It&#39;s your turn — please proceed to the counter!</Text>
                    </View>
                )}
            </View>

            {/* ── Booking info ── */}
            <Card title="Booking" accent={THEME.primary}>
                <InfoRow
                    label="Booking ID"
                    value={
                        bookingId
                            ? bookingId.slice(0, 12).toUpperCase() + '…'
                            : '—'
                    }
                />
                <InfoRow label="Queue"       value={queue?.name ?? '—'} />
                {booking && <InfoRow label="Date"  value={formatDate(booking.createdAt)} />}
                {booking && <InfoRow label="Position" value={`#${booking.position}`} />}
                <View style={[ir.row, { borderBottomWidth: 0 }]}>
                    <Text style={ir.label}>Status</Text>
                    <StatusPill status={status} />
                </View>
            </Card>

            {/* ── Queue info ── */}
            {queue && (
                <Card title="Queue" accent={THEME.secondary}>
                    <InfoRow label="Queue name"   value={queue.name} />
                    <InfoRow label="Now serving"  value={queue.currentNumber} />
                    <InfoRow label="Queue length" value={queue.queueLength ?? '—'} />
                    <InfoRow label="Avg. service" value={queue.avgServiceTime ? `${queue.avgServiceTime} min` : '—'} />
                    <InfoRow label="Est. wait"    value={`${queue.estimatedWaitTime} min`} />
                    <InfoRow label="Status"       value={queue.status ?? 'active'} accent={queue.status === 'active' ? THEME.green.text : THEME.amber.text} />
                    <InfoRow label="Last updated" value={formatTs(queue.updatedAt)} />
                </Card>
            )}

            {/* ── Service info ── */}
            {service && (
                <Card title="Service" accent="#d97706">
                    <InfoRow label="Service"     value={service.name} />
                    <InfoRow label="Category"    value={service.category} />
                    <InfoRow label="Department"  value={service.department?.name ?? '—'} />
                    <InfoRow label="Location"    value={service.location?.name ?? '—'} />
                    {service.estimatedTime && <InfoRow label="Est. time"  value={`${service.estimatedTime} min`} />}
                    {service.description && (
                        <View style={{ paddingVertical: 12 }}>
                            <Text style={[ir.label, { marginBottom: 6 }]}>Description</Text>
                            <Text style={{ fontSize: 13, color: THEME.text, lineHeight: 20 }}>{service.description}</Text>
                        </View>
                    )}
                    {service.requirements && service.requirements.length > 0 && (
                        <View style={{ paddingVertical: 12 }}>
                            <Text style={[ir.label, { marginBottom: 8 }]}>Requirements</Text>
                            {service.requirements.map((r, i) => (
                                <View key={i} style={{ flexDirection: 'row', gap: 8, marginBottom: 4 }}>
                                    <Text style={{ color: THEME.primary, fontWeight: '700' }}>·</Text>
                                    <Text style={{ fontSize: 13, color: THEME.text, flex: 1 }}>{r}</Text>
                                </View>
                            ))}
                        </View>
                    )}
                    {service.payment?.required && (
                        <InfoRow
                            label="Payment required"
                            value={`${service.payment.currency ?? 'LKR'} ${service.payment.amount ?? '—'}`}
                            accent={THEME.secondary}
                        />
                    )}
                </Card>
            )}

            {/* ── Back button ── */}
            <TouchableOpacity
                style={s.backBtn}
                onPress={() => {
                    if (router.canGoBack()) {
                        router.back();
                    } else {
                        router.replace('/Dashboard');
                    }
                }}
                activeOpacity={0.85}>
                <Text style={s.backBtnText}>← Back</Text>
            </TouchableOpacity>


            <View style={{ height: 32 }} />
        </ScrollView>
    );
}

const s = StyleSheet.create({
    root:    { flex: 1, backgroundColor: THEME.background },
    content: { padding: 24, paddingTop: 56, paddingBottom: 48 },
    center:  { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: THEME.background, gap: 12 },
    loadText:      { fontSize: 13, color: THEME.gray },
    notFoundTitle: { fontSize: 17, fontWeight: '700', color: THEME.text },
    
    loadWrap: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: THEME.background, gap: 12 },

    // hero
    heroCard:        { backgroundColor: THEME.card, borderWidth: 1, borderColor: THEME.border, borderRadius: 18, marginBottom: 14, overflow: 'hidden' },
    heroCardWaiting: { borderColor: THEME.primary },
    heroTop:         { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', padding: 18, paddingBottom: 14 },
    heroLabel:       { fontSize: 11, color: THEME.gray, textTransform: 'uppercase', letterSpacing: 0.7, marginBottom: 6 },
    heroNumber:      { fontSize: 42, fontWeight: '800', color: THEME.text, lineHeight: 46 },
    heroStats:       { flexDirection: 'row', borderTopWidth: 1, borderTopColor: THEME.border },
    heroStat:        { flex: 1, padding: 16, alignItems: 'center' },
    heroStatBorder:  { borderLeftWidth: 1, borderLeftColor: THEME.border },
    heroStatVal:     { fontSize: 24, fontWeight: '800', lineHeight: 28 },
    heroStatLabel:   { fontSize: 10, color: THEME.gray, textTransform: 'uppercase', letterSpacing: 0.5, marginTop: 2 },
    turnBanner:      { backgroundColor: THEME.green.bg, borderTopWidth: 1, borderTopColor: THEME.green.border, padding: 14 },
    turnBannerText:  { fontSize: 13, fontWeight: '600', color: THEME.green.text, textAlign: 'center' },

    backBtn:     { backgroundColor: THEME.cardSurface, borderWidth: 1, borderColor: THEME.border, borderRadius: 12, paddingVertical: 14, alignItems: 'center', marginTop: 8 },
    backBtnText: { fontSize: 14, fontWeight: '600', color: THEME.text },
});