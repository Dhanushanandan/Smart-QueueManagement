import { useEffect, useState } from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { Text, ActivityIndicator } from 'react-native-paper';
import { Redirect } from 'expo-router';
import { api } from '@/api/client';
import socket from '@/api/socket';
import { useAuth } from '@/store/AuthContext';
import DashboardHeader from '@/components/DashboardHeader';
import StatusCard from '@/components/StatusCard';
import { THEME } from '@/constants/theme';
import type { BookingStat, Queue, Service } from '@/types/types';

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
        <View style={stt.row}>
            <View style={stt.line} />
            <Text style={stt.text}>{children}</Text>
        </View>
    );
}
const stt = StyleSheet.create({
    row:  { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12, marginTop: 20 },
    line: { width: 3, height: 14, backgroundColor: THEME.primary, borderRadius: 2 },
    text: { fontSize: 12, fontWeight: '700', color: THEME.text, textTransform: 'uppercase', letterSpacing: 0.8 },
});

export default function Status() {
    const { user } = useAuth();

    const [statuses, setStatuses] = useState<BookingStat[]>([]);
    const [queues, setQueues]     = useState<Map<string, Queue>>(new Map());
    const [services, setServices] = useState<Map<string, Service>>(new Map());
    const [loading, setLoading]   = useState(true);

    const loadStatus = async () => {
        if (!user) return; // ✅ guard inside, not outside

        try {
            const raw = await api.getStatus(user.uid!);
            const flat: BookingStat[] = Array.isArray(raw[0]) ? (raw as any).flat() : (raw as BookingStat[]);
            const waiting = flat.filter(b => b.status === 'WAITING');
            setStatuses(waiting);

            waiting.forEach(b => socket.emit('joinQueueRoom', b.queueId));

            const qMap = new Map<string, Queue>();
            const sMap = new Map<string, Service>();

            await Promise.all(waiting.map(async b => {
                try {
                    const q = await api.getQueueById(b.queueId);
                    qMap.set(b.queueId, q);
                    if (q.serviceId) {
                        const svc = await api.getServicesById(q.serviceId);
                        sMap.set(q.serviceId, svc);
                    }
                } catch {}
            }));

            setQueues(qMap);
            setServices(sMap);
        } catch (err) {
            console.error('Error loading status', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!user) return; // ✅ guard here
        loadStatus();

        return () => {
            socket.off('queueUpdated');
            socket.off('bookingJoined');
        };
    }, [user]);

    useEffect(() => {
        if (!user) return; // ✅ guard here

        socket.on('queueUpdated', (updated) => {
            if (statuses.some(b => b.queueId === updated.id)) loadStatus();
        });

        socket.on('bookingJoined', (data) => {
            if (statuses.some(b => b.queueId === data.queueId)) loadStatus();
        });
    }, [statuses, user]);

    if (!user) return <Redirect href="/Login" />;

    if (loading) {
        return (
            <View style={s.center}>
                <ActivityIndicator color={THEME.primary} size="large" />
                <Text style={s.loadText}>Loading your queues…</Text>
            </View>
        );
    }

    if (statuses.length === 0) {
        return (
            <View style={s.center}>
                <Text style={{ fontSize: 32, marginBottom: 12 }}>🎟</Text>
                <Text style={s.notFoundTitle}>No active queues</Text>
                <Text style={s.notFoundBody}>You are not currently waiting in any queue.</Text>
            </View>
        );
    }

    return (
        <ScrollView style={s.root} contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>
            <DashboardHeader title="Live Queue" subtitle="Real-time position updates" />

            {statuses.map((status) => {
                const queue   = queues.get(status.queueId);
                const service = queue?.serviceId ? services.get(queue.serviceId) : null;

                return (
                    <View key={status.bookingId} style={s.bookingBlock}>

                        {/* queue name header */}
                        <View style={s.blockHeader}>
                            <Text style={s.blockHeaderName}>{queue?.name ?? 'Queue'}</Text>
                            {service && (
                                <Text style={s.blockHeaderSub}>
                                    {service.location?.name} · {service.department?.name}
                                </Text>
                            )}
                        </View>

                        {/* position hero */}
                        <View style={s.heroCard}>
                            <View style={s.accentBar} />
                            <View style={s.statGrid}>
                                <View style={s.statCell}>
                                    <Text style={s.statLabel}>Your number</Text>
                                    <Text style={s.statValLg}>{status.position}</Text>
                                </View>
                                <View style={[s.statCell, s.statCellRight]}>
                                    <Text style={s.statLabel}>Now serving</Text>
                                    <Text style={[s.statValMd, { color: THEME.primary }]}>{status.currentNumber}</Text>
                                </View>
                                <View style={[s.statCell, s.statCellBottom]}>
                                    <Text style={s.statLabel}>People ahead</Text>
                                    <Text style={[s.statValSm, { color: '#d97706' }]}>{status.peopleAhead}</Text>
                                </View>
                                <View style={[s.statCell, s.statCellBottom, s.statCellRight]}>
                                    <Text style={s.statLabel}>Est. wait</Text>
                                    <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 3 }}>
                                        <Text style={[s.statValSm, { color: THEME.secondary }]}>{status.estimatedWaitTime}</Text>
                                        <Text style={s.statUnit}>min</Text>
                                    </View>
                                </View>
                            </View>
                        </View>

                        {/* turn status */}
                        <StatusCard status={status} />

                        {/* queue live stats */}
                        {queue && (
                            <>
                                <SectionTitle>Queue status</SectionTitle>
                                <View style={s.infoCard}>
                                    <InfoRow label="Queue length"  value={queue.queueLength ?? '—'} />
                                    <InfoRow label="Avg. service"  value={queue.avgServiceTime ? `${queue.avgServiceTime} min` : '—'} />
                                    <InfoRow
                                        label="Queue status"
                                        value={queue.status ?? 'active'}
                                        accent={queue.status === 'active' ? THEME.green.text : THEME.amber.text}
                                    />
                                </View>
                            </>
                        )}

                        {/* service details */}
                        {service && (
                            <>
                                <SectionTitle>Service</SectionTitle>
                                <View style={s.infoCard}>
                                    <InfoRow label="Service"    value={service.name} />
                                    <InfoRow label="Category"   value={service.category} />
                                    <InfoRow label="Department" value={service.department?.name ?? '—'} />
                                    <InfoRow label="Location"   value={service.location?.name ?? '—'} />
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
                            </>
                        )}

                        {/* requirements */}
                        {service?.requirements && service.requirements.length > 0 && (
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

                        {status.message ? (
                            <View style={s.msgCard}>
                                <Text style={s.msgText}>{status.message}</Text>
                            </View>
                        ) : null}

                    </View>
                );
            })}

            <View style={{ height: 32 }} />
        </ScrollView>
    );
}

const s = StyleSheet.create({
    root:    { flex: 1, backgroundColor: THEME.background },
    content: { padding: 24, paddingTop: 56, paddingBottom: 48 },
    center:  { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: THEME.background, gap: 10, padding: 40 },
    loadText:      { fontSize: 13, color: THEME.gray },
    notFoundTitle: { fontSize: 17, fontWeight: '700', color: THEME.text },
    notFoundBody:  { fontSize: 13, color: THEME.gray, textAlign: 'center' },

    bookingBlock: { marginBottom: 32 },

    blockHeader:    { marginBottom: 14 },
    blockHeaderName:{ fontSize: 20, fontWeight: '800', color: THEME.text, letterSpacing: -0.3 },
    blockHeaderSub: { fontSize: 12, color: THEME.gray, marginTop: 2 },

    heroCard:       { backgroundColor: THEME.card, borderWidth: 1, borderColor: THEME.border, borderRadius: 16, marginBottom: 12, overflow: 'hidden' },
    accentBar:      { height: 4, backgroundColor: THEME.primary },
    statGrid:       { flexDirection: 'row', flexWrap: 'wrap' },
    statCell:       { flex: 1, padding: 16, minWidth: '48%' },
    statCellRight:  { borderLeftWidth: 1, borderLeftColor: THEME.border },
    statCellBottom: { borderTopWidth: 1, borderTopColor: THEME.border },
    statLabel:      { fontSize: 10, color: THEME.gray, textTransform: 'uppercase', letterSpacing: 0.8, fontWeight: '500', marginBottom: 4 },
    statValLg:      { fontSize: 36, fontWeight: '800', color: THEME.text, lineHeight: 40 },
    statValMd:      { fontSize: 28, fontWeight: '800', lineHeight: 32 },
    statValSm:      { fontSize: 22, fontWeight: '700' },
    statUnit:       { fontSize: 12, color: THEME.gray },

    infoCard: { backgroundColor: THEME.card, borderWidth: 1, borderColor: THEME.border, borderRadius: 14, paddingHorizontal: 18, marginBottom: 4 },

    reqRow:    { flexDirection: 'row', alignItems: 'flex-start', gap: 10, paddingVertical: 12 },
    reqBorder: { borderBottomWidth: 1, borderBottomColor: THEME.borderLight },
    reqDot:    { width: 6, height: 6, borderRadius: 3, backgroundColor: THEME.primary, marginTop: 5 },
    reqText:   { fontSize: 13, color: THEME.text, flex: 1, lineHeight: 20 },

    msgCard: { backgroundColor: THEME.blue.bg, borderWidth: 1, borderColor: THEME.blue.border, borderRadius: 12, padding: 14, marginTop: 8 },
    msgText: { fontSize: 13, color: THEME.blue.text, textAlign: 'center', fontWeight: '500' },
});