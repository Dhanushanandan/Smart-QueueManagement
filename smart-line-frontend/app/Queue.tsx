import { useEffect, useState } from 'react';
import { View, ScrollView, StyleSheet, Alert } from 'react-native';
import { Text, ActivityIndicator } from 'react-native-paper';
import { router, useLocalSearchParams, Redirect } from 'expo-router';
import { api } from '@/api/client';
import { useAuth } from '@/store/AuthContext';
import DashboardHeader from '@/components/DashboardHeader';
import PrimaryButton from '@/components/PrimaryButton';
import { THEME } from '@/constants/theme';
import type { Queue as QueueType, Service } from '@/types/types';

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

function SectionTitle({ children }: { children: string }) {
    return (
        <View style={st.row}>
            <View style={st.line} />
            <Text style={st.text}>{children}</Text>
        </View>
    );
}
const st = StyleSheet.create({
    row:  { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12, marginTop: 20 },
    line: { width: 3, height: 14, backgroundColor: THEME.primary, borderRadius: 2 },
    text: { fontSize: 12, fontWeight: '700', color: THEME.text, textTransform: 'uppercase', letterSpacing: 0.8 },
});

export default function Queue() {
    const { user } = useAuth();
    const { queueId, serviceId } = useLocalSearchParams<{ queueId: string; serviceId: string }>();

    const [queue, setQueue]     = useState<QueueType | null>(null);
    const [service, setService] = useState<Service | null>(null);
    const [loading, setLoading] = useState(true);
    const [joining, setJoining] = useState(false);

    useEffect(() => {
        if (!queueId) { setLoading(false); return; }
        (async () => {
            try {
                const q = await api.getQueueById(queueId);
                setQueue(q);
                const sid = serviceId ?? q.serviceId;
                if (sid) {
                    const svc = await api.getServicesById(sid);
                    setService(svc);
                }
            } catch (err) {
                console.error('Error loading queue', err);
            } finally {
                setLoading(false);
            }
        })();
    }, [queueId]);

    //if (!user) return <Redirect href="/Login" />;

    if (!user){
        return(
            <View style={s.center}>
                <Text style={s.loadText}>User Not Found</Text>
                <Text style={s.loadText}>Please log in again</Text>
            </View>
        );
    };

    if (loading) {
        return (
            <View style={s.center}>
                <ActivityIndicator color={THEME.primary} size="large" />
                <Text style={s.loadText}>Loading queue…</Text>
            </View>
        );
    }

    if (!queue) {
        return (
            <View style={s.center}>
                <Text style={{ fontSize: 32, marginBottom: 12 }}>😕</Text>
                <Text style={s.notFound}>Queue not found</Text>
            </View>
        );
    }

    const queueStatus = queue.status ?? 'active';
    const statusColor = queueStatus === 'active' ? THEME.green : queueStatus === 'paused' ? THEME.amber : { bg: '#f3f4f6', border: '#d1d5db', text: '#6b7280' };
    const canJoin = queueStatus === 'active';

    const handleJoin = async () => {
        if (!user?.uid) return;
        try {
            setJoining(true);
            const res: any = await api.joinQueue(user.uid, queue.id);
            if (res?.id || res?.bookingId) {
                const bookingId = res.id ?? res.bookingId;
                router.replace({ pathname: '/BookingDetail', params: { bookingId } });
            } else if (res?.message === 'User already in queue') {
                Alert.alert('Already joined', 'You are already in this queue.', [
                    { text: 'View booking', onPress: () => router.push('/Bookings') },
                    { text: 'OK' },
                ]);
            } else {
                Alert.alert('Error', res?.message || 'Failed to join queue');
            }
        } catch (err: any) {
            Alert.alert('Error', err.message || 'Something went wrong');
        } finally {
            setJoining(false);
        }
    };

    const formatTs = (ts: { _seconds: number }) => {
        try { return new Date(ts._seconds * 1000).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }); }
        catch { return '—'; }
    };

    return (
        <ScrollView style={s.root} contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>
            <DashboardHeader
                title={queue.name}
                subtitle={service ? `${service.department?.name} · ${service.location?.name}` : 'Queue details'}
            />

            {/* ── live stats hero ── */}
            <View style={[s.heroCard, { borderTopColor: statusColor.text }]}>
                <View style={s.heroTopRow}>
                    <View style={[s.statusBadge, { backgroundColor: statusColor.bg, borderColor: statusColor.border }]}>
                        <View style={[s.statusDot, { backgroundColor: statusColor.text }]} />
                        <Text style={[s.statusText, { color: statusColor.text }]}>
                            {queueStatus.charAt(0).toUpperCase() + queueStatus.slice(1)}
                        </Text>
                    </View>
                    {!canJoin && (
                        <Text style={s.closedNote}>
                            {queueStatus === 'paused' ? 'Queue is temporarily paused' : 'Queue is closed'}
                        </Text>
                    )}
                </View>

                <View style={s.heroStats}>
                    <View style={s.heroStat}>
                        <Text style={[s.heroStatVal, { color: THEME.primary }]}>{queue.currentNumber}</Text>
                        <Text style={s.heroStatLabel}>Now serving</Text>
                    </View>
                    <View style={[s.heroStat, s.heroStatBorder]}>
                        <Text style={[s.heroStatVal, { color: '#d97706' }]}>{queue.queueLength ?? '—'}</Text>
                        <Text style={s.heroStatLabel}>In queue</Text>
                    </View>
                    <View style={[s.heroStat, s.heroStatBorder]}>
                        <Text style={[s.heroStatVal, { color: THEME.secondary }]}>{queue.estimatedWaitTime}</Text>
                        <Text style={s.heroStatLabel}>Est. wait (min)</Text>
                    </View>
                    {queue.avgServiceTime && (
                        <View style={[s.heroStat, s.heroStatBorder]}>
                            <Text style={s.heroStatVal}>{queue.avgServiceTime}</Text>
                            <Text style={s.heroStatLabel}>Avg. (min)</Text>
                        </View>
                    )}
                </View>
            </View>

            {/* ── service details ── */}
            {service && (
                <>
                    <SectionTitle>Service details</SectionTitle>
                    <View style={s.infoCard}>
                        <InfoRow label="Service name" value={service.name} />
                        <InfoRow label="Category"     value={service.category} />
                        <InfoRow label="Department"   value={service.department?.name ?? '—'} />
                        <InfoRow label="Location"     value={service.location?.name ?? '—'} />
                        {service.estimatedTime && (
                            <InfoRow label="Est. service time" value={`${service.estimatedTime} min`} />
                        )}
                        {service.payment?.required && (
                            <InfoRow
                                label="Payment"
                                value={`${service.payment.currency ?? 'LKR'} ${service.payment.amount ?? '—'}`}
                                accent={THEME.secondary}
                            />
                        )}
                    </View>

                    {service.description && (
                        <>
                            <SectionTitle>Description</SectionTitle>
                            <View style={s.descCard}>
                                <Text style={s.descText}>{service.description}</Text>
                            </View>
                        </>
                    )}

                    {service.requirements && service.requirements.length > 0 && (
                        <>
                            <SectionTitle>Requirements</SectionTitle>
                            <View style={s.infoCard}>
                                {service.requirements.map((r, i) => (
                                    <View key={i} style={[s.reqRow, i < service.requirements!.length - 1 && s.reqBorder]}>
                                        <View style={s.reqDot} />
                                        <Text style={s.reqText}>{r}</Text>
                                    </View>
                                ))}
                            </View>
                        </>
                    )}
                </>
            )}

            {/* ── queue config ── */}
            {service?.queueConfig?.enabled && (
                <>
                    <SectionTitle>Queue config</SectionTitle>
                    <View style={s.infoCard}>
                        {service.queueConfig.maxDailySlots && (
                            <InfoRow label="Max daily slots" value={service.queueConfig.maxDailySlots} />
                        )}
                        {service.queueConfig.slotDuration && (
                            <InfoRow label="Slot duration" value={`${service.queueConfig.slotDuration} min`} />
                        )}
                    </View>
                </>
            )}

            {/* ── queue info ── */}
            <SectionTitle>Queue info</SectionTitle>
            <View style={s.infoCard}>
                <InfoRow label="Last position" value={queue.lastPosition} />
                <InfoRow label="Last updated"  value={formatTs(queue.updatedAt)} />
            </View>

            {/* ── join button ── */}
            <View style={s.joinWrap}>
                {canJoin ? (
                    <PrimaryButton
                        label="Join queue"
                        onPress={handleJoin}
                        loading={joining}
                    />
                ) : (
                    <View style={s.disabledBtn}>
                        <Text style={s.disabledBtnText}>
                            {queueStatus === 'paused' ? 'Queue is paused — check back soon' : 'Queue is closed'}
                        </Text>
                    </View>
                )}
            </View>

            <View style={{ height: 32 }} />
        </ScrollView>
    );
}

const s = StyleSheet.create({
    root:    { flex: 1, backgroundColor: THEME.background },
    content: { padding: 24, paddingTop: 56, paddingBottom: 48 },
    center:  { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: THEME.background, gap: 12 },
    loadText: { fontSize: 13, color: THEME.gray },
    notFound: { fontSize: 16, fontWeight: '700', color: THEME.text },

    heroCard:     { backgroundColor: THEME.card, borderWidth: 1, borderColor: THEME.border, borderTopWidth: 3, borderRadius: 18, marginBottom: 4, overflow: 'hidden' },
    heroTopRow:   { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 14, paddingBottom: 10 },
    statusBadge:  { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20, borderWidth: 1 },
    statusDot:    { width: 7, height: 7, borderRadius: 4 },
    statusText:   { fontSize: 12, fontWeight: '600', textTransform: 'capitalize' },
    closedNote:   { fontSize: 12, color: THEME.grayLight, flex: 1, textAlign: 'right' },

    heroStats:      { flexDirection: 'row', borderTopWidth: 1, borderTopColor: THEME.border },
    heroStat:       { flex: 1, padding: 16, alignItems: 'center' },
    heroStatBorder: { borderLeftWidth: 1, borderLeftColor: THEME.border },
    heroStatVal:    { fontSize: 26, fontWeight: '800', color: THEME.text, lineHeight: 30 },
    heroStatLabel:  { fontSize: 10, color: THEME.grayLight, textTransform: 'uppercase', letterSpacing: 0.5, marginTop: 2 },

    infoCard: { backgroundColor: THEME.card, borderWidth: 1, borderColor: THEME.border, borderRadius: 14, paddingHorizontal: 18, marginBottom: 4 },
    descCard: { backgroundColor: THEME.cardSurface, borderWidth: 1, borderColor: THEME.border, borderRadius: 14, padding: 16, marginBottom: 4 },
    descText: { fontSize: 14, color: THEME.text, lineHeight: 22 },

    reqRow:    { flexDirection: 'row', alignItems: 'flex-start', gap: 10, paddingVertical: 12 },
    reqBorder: { borderBottomWidth: 1, borderBottomColor: THEME.borderLight },
    reqDot:    { width: 6, height: 6, borderRadius: 3, backgroundColor: THEME.primary, marginTop: 5 },
    reqText:   { fontSize: 13, color: THEME.text, flex: 1, lineHeight: 20 },

    joinWrap:      { marginTop: 24 },
    disabledBtn:   { backgroundColor: THEME.cardSurface, borderWidth: 1, borderColor: THEME.border, borderRadius: 14, paddingVertical: 16, alignItems: 'center' },
    disabledBtnText: { fontSize: 14, color: THEME.grayLight, fontWeight: '500' },
});