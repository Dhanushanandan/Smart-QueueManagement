import { useEffect, useState, useCallback } from 'react';
import { View, ScrollView, TouchableOpacity, StyleSheet, TextInput } from 'react-native';
import { Text, ActivityIndicator } from 'react-native-paper';
import { router } from 'expo-router';
import { api } from '@/api/client';
import DashboardHeader from '@/components/DashboardHeader';
import { THEME } from '@/constants/theme';
import type { Service, Queue, Department, Location } from '@/types/types';

// ─── types ────────────────────────────────────────────────────────────────────

interface EnrichedService {
    service: Service;
    queues: Queue[];
}

// ─── small components ─────────────────────────────────────────────────────────

function FilterChip({
                        label, active, onPress,
                    }: { label: string; active: boolean; onPress: () => void }) {
    return (
        <TouchableOpacity
            style={[fc.chip, active && fc.chipActive]}
            onPress={onPress}
            activeOpacity={0.75}
        >
            <Text style={[fc.label, active && fc.labelActive]}>{label}</Text>
        </TouchableOpacity>
    );
}
const fc = StyleSheet.create({
    chip:        { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20, borderWidth: 1, borderColor: THEME.border, backgroundColor: THEME.card },
    chipActive:  { backgroundColor: THEME.primary, borderColor: THEME.primary },
    label:       { fontSize: 12, fontWeight: '600', color: THEME.gray },
    labelActive: { color: '#fff' },
});

function QueuePill({ queue }: { queue: Queue }) {
    const statusColor = queue.status === 'active'
        ? THEME.green
        : queue.status === 'paused'
            ? THEME.amber
            : { bg: '#f3f4f6', border: '#d1d5db', text: '#6b7280' };

    return (
        <View style={qp.wrap}>
            <View style={[qp.statusDot, { backgroundColor: statusColor.text }]} />
            <View style={qp.body}>
                <Text style={qp.name}>{queue.name}</Text>
                <View style={qp.stats}>
                    <View style={qp.stat}>
                        <Text style={qp.statVal}>{queue.currentNumber}</Text>
                        <Text style={qp.statLabel}>Serving</Text>
                    </View>
                    <View style={[qp.stat, qp.statBorder]}>
                        <Text style={qp.statVal}>{queue.queueLength ?? '—'}</Text>
                        <Text style={qp.statLabel}>In queue</Text>
                    </View>
                    <View style={[qp.stat, qp.statBorder]}>
                        <Text style={[qp.statVal, { color: THEME.secondary }]}>
                            {queue.estimatedWaitTime}
                        </Text>
                        <Text style={qp.statLabel}>Est. wait (min)</Text>
                    </View>
                    {queue.avgServiceTime && (
                        <View style={[qp.stat, qp.statBorder]}>
                            <Text style={qp.statVal}>{queue.avgServiceTime}</Text>
                            <Text style={qp.statLabel}>Avg. (min)</Text>
                        </View>
                    )}
                </View>
            </View>
            <View style={[qp.badge, { backgroundColor: statusColor.bg, borderColor: statusColor.border }]}>
                <Text style={[qp.badgeText, { color: statusColor.text }]}>
                    {queue.status ?? 'active'}
                </Text>
            </View>
        </View>
    );
}
const qp = StyleSheet.create({
    wrap:       { flexDirection: 'row', alignItems: 'flex-start', gap: 10, paddingVertical: 12, paddingHorizontal: 14, borderTopWidth: 1, borderTopColor: THEME.borderLight },
    statusDot:  { width: 8, height: 8, borderRadius: 4, marginTop: 5 },
    body:       { flex: 1, gap: 8 },
    name:       { fontSize: 13, fontWeight: '700', color: THEME.text },
    stats:      { flexDirection: 'row', gap: 0 },
    stat:       { flex: 1, alignItems: 'center' },
    statBorder: { borderLeftWidth: 1, borderLeftColor: THEME.border },
    statVal:    { fontSize: 15, fontWeight: '800', color: THEME.text },
    statLabel:  { fontSize: 9, color: THEME.grayLight, textTransform: 'uppercase', letterSpacing: 0.4, marginTop: 1 },
    badge:      { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 12, borderWidth: 1 },
    badgeText:  { fontSize: 10, fontWeight: '600', textTransform: 'capitalize' },
});

// ─── main screen ──────────────────────────────────────────────────────────────

export default function Home() {
    const [enriched, setEnriched]         = useState<EnrichedService[]>([]);
    const [loading, setLoading]           = useState(true);
    const [search, setSearch]             = useState('');

    // filter options
    const [locations, setLocations]       = useState<Location[]>([]);
    const [departments, setDepartments]   = useState<Department[]>([]);
    const [categories, setCategories]     = useState<string[]>([]);

    // active filters
    const [selLocation, setSelLocation]   = useState<string | null>(null);
    const [selDept, setSelDept]           = useState<string | null>(null);
    const [selCategory, setSelCategory]   = useState<string | null>(null);

    // ── load all services + their queues ──────────────────────────────────────
    const loadAll = useCallback(async () => {
        setLoading(true);
        try {
            const params = {
                ...(selLocation ? { locationId: selLocation } : {}),
                ...(selDept     ? { departmentId: selDept }   : {}),
                ...(selCategory ? { category: selCategory }   : {}),
            };

            const svcs: Service[] = Object.keys(params).length > 0
                ? await api.getFilteredServices(params) as Service[]
                : await api.getServices();

            // build filter option lists from the returned services
            const locMap   = new Map<string, Location>();
            const deptMap  = new Map<string, Department>();
            const catSet   = new Set<string>();

            svcs.forEach(s => {
                if (s.location?.id)   locMap.set(s.location.id, s.location);
                if (s.department?.id) deptMap.set(s.department.id, s.department);
                if (s.category)       catSet.add(s.category);
            });

            setLocations(Array.from(locMap.values()));
            setDepartments(Array.from(deptMap.values()));
            setCategories(Array.from(catSet));

            // enrich each service with its queues
            const rows: EnrichedService[] = await Promise.all(
                svcs.map(async (service) => {
                    let queues: Queue[] = [];
                    try {
                        const q = await api.getQueueByService(service.id);
                        queues = Array.isArray(q) ? q : [q];
                    } catch {}
                    return { service, queues };
                })
            );

            setEnriched(rows);
        } catch (err) {
            console.error('Error loading services', err);
        } finally {
            setLoading(false);
        }
    }, [selLocation, selDept, selCategory]);

    useEffect(() => { loadAll(); }, [loadAll]);

    // ── search filter (client-side) ───────────────────────────────────────────
    const visible = enriched.filter(({ service }) => {
        if (!search.trim()) return true;
        const q = search.toLowerCase();
        return (
            service.name.toLowerCase().includes(q) ||
            service.category?.toLowerCase().includes(q) ||
            service.department?.name?.toLowerCase().includes(q) ||
            service.location?.name?.toLowerCase().includes(q)
        );
    });

    const toggleFilter = <T,>(
        current: T | null,
        value: T,
        setter: (v: T | null) => void,
    ) => setter(current === value ? null : value);

    return (
        <ScrollView style={s.root} contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>
            <DashboardHeader title="Services" subtitle="Browse and join government queues" />

            {/* ── search ── */}
            <View style={s.searchWrap}>
                <Text style={s.searchIcon}>🔍</Text>
                <TextInput
                    style={s.searchInput}
                    placeholder="Search services, departments…"
                    placeholderTextColor={THEME.grayLight}
                    value={search}
                    onChangeText={setSearch}
                />
                {search.length > 0 && (
                    <TouchableOpacity onPress={() => setSearch('')} activeOpacity={0.7}>
                        <Text style={s.searchClear}>✕</Text>
                    </TouchableOpacity>
                )}
            </View>

            {/* ── filters ── */}
            {categories.length > 0 && (
                <>
                    <Text style={s.filterLabel}>Category</Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.chipRow}>
                        {categories.map(cat => (
                            <FilterChip
                                key={cat}
                                label={cat}
                                active={selCategory === cat}
                                onPress={() => toggleFilter(selCategory, cat, setSelCategory)}
                            />
                        ))}
                    </ScrollView>
                </>
            )}

            {locations.length > 0 && (
                <>
                    <Text style={s.filterLabel}>Location</Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.chipRow}>
                        {locations.map(loc => (
                            <FilterChip
                                key={loc.id}
                                label={loc.name}
                                active={selLocation === loc.id}
                                onPress={() => toggleFilter(selLocation, loc.id, setSelLocation)}
                            />
                        ))}
                    </ScrollView>
                </>
            )}

            {departments.length > 0 && (
                <>
                    <Text style={s.filterLabel}>Department</Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.chipRow}>
                        {departments.map(dept => (
                            <FilterChip
                                key={dept.id}
                                label={dept.name}
                                active={selDept === dept.id}
                                onPress={() => toggleFilter(selDept, dept.id, setSelDept)}
                            />
                        ))}
                    </ScrollView>
                </>
            )}

            {(selLocation || selDept || selCategory) && (
                <TouchableOpacity
                    style={s.clearFilters}
                    onPress={() => { setSelLocation(null); setSelDept(null); setSelCategory(null); }}
                    activeOpacity={0.75}
                >
                    <Text style={s.clearFiltersText}>✕ Clear all filters</Text>
                </TouchableOpacity>
            )}

            {/* ── results ── */}
            <Text style={s.sectionLabel}>
                {loading ? 'Loading…' : `${visible.length} service${visible.length !== 1 ? 's' : ''} found`}
            </Text>

            {loading ? (
                <View style={s.loadingWrap}>
                    <ActivityIndicator color={THEME.primary} size="large" />
                    <Text style={s.loadingText}>Loading services…</Text>
                </View>
            ) : visible.length === 0 ? (
                <View style={s.emptyCard}>
                    <Text style={s.emptyIcon}>🔎</Text>
                    <Text style={s.emptyTitle}>No services found</Text>
                    <Text style={s.emptyBody}>Try adjusting your filters or search term.</Text>
                </View>
            ) : (
                visible.map(({ service, queues }) => (
                    <View key={service.id} style={s.card}>
                        {/* service header */}
                        <View style={s.cardHeader}>
                            <View style={s.cardIconWrap}>
                                <Text style={{ fontSize: 20 }}>🏛️</Text>
                            </View>
                            <View style={s.cardBody}>
                                <Text style={s.cardName}>{service.name}</Text>
                                <Text style={s.cardMeta}>
                                    {[service.category, service.department?.name, service.location?.name]
                                        .filter(Boolean).join(' · ')}
                                </Text>
                            </View>
                            {service.payment?.required && (
                                <View style={s.payBadge}>
                                    <Text style={s.payBadgeText}>
                                        {service.payment.currency ?? 'LKR'} {service.payment.amount}
                                    </Text>
                                </View>
                            )}
                        </View>

                        {/* description */}
                        {service.description && (
                            <Text style={s.cardDesc} numberOfLines={2}>{service.description}</Text>
                        )}

                        {/* requirements */}
                        {service.requirements && service.requirements.length > 0 && (
                            <View style={s.reqWrap}>
                                <Text style={s.reqTitle}>Required:</Text>
                                <Text style={s.reqText} numberOfLines={1}>
                                    {service.requirements.slice(0, 3).join(' · ')}
                                    {service.requirements.length > 3 ? ` +${service.requirements.length - 3} more` : ''}
                                </Text>
                            </View>
                        )}

                        {/* queues */}
                        {queues.length === 0 ? (
                            <View style={s.noQueue}>
                                <Text style={s.noQueueText}>No active queues available</Text>
                            </View>
                        ) : (
                            queues.map(queue => (
                                <TouchableOpacity
                                    key={queue.id}
                                    activeOpacity={0.8}
                                    onPress={() => router.push({
                                        pathname: '/Queue',
                                        params: { queueId: queue.id, serviceId: service.id },
                                    })}
                                >
                                    <QueuePill queue={queue} />
                                    <View style={s.joinRow}>
                                        <Text style={s.joinBtn}>View & join queue →</Text>
                                    </View>
                                </TouchableOpacity>
                            ))
                        )}
                    </View>
                ))
            )}

            <View style={{ height: 32 }} />
        </ScrollView>
    );
}

const s = StyleSheet.create({
    root:    { flex: 1, backgroundColor: '#ffffff' },
    content: { padding: 24, paddingBottom: 48 },

    searchWrap:  { flexDirection: 'row', alignItems: 'center', backgroundColor: THEME.cardSurface, borderWidth: 1, borderColor: THEME.border, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 10, marginBottom: 20, gap: 8 },
    searchIcon:  { fontSize: 14 },
    searchInput: { flex: 1, fontSize: 14, color: THEME.text, padding: 0 },
    searchClear: { fontSize: 14, color: THEME.grayLight, paddingHorizontal: 4 },

    filterLabel: { fontSize: 10, fontWeight: '700', color: THEME.grayLight, textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 8 },
    chipRow:     { gap: 8, paddingBottom: 14 },

    clearFilters:     { alignSelf: 'flex-start', marginBottom: 12 },
    clearFiltersText: { fontSize: 12, color: THEME.secondary, fontWeight: '600' },

    sectionLabel: { fontSize: 11, color: THEME.gray, letterSpacing: 1.1, textTransform: 'uppercase', fontWeight: '500', marginBottom: 14 },

    loadingWrap: { alignItems: 'center', paddingVertical: 40, gap: 12 },
    loadingText: { fontSize: 13, color: THEME.gray },

    emptyCard:  { alignItems: 'center', padding: 40, backgroundColor: THEME.cardSurface, borderWidth: 1, borderColor: THEME.border, borderRadius: 16 },
    emptyIcon:  { fontSize: 32, marginBottom: 10 },
    emptyTitle: { fontSize: 15, fontWeight: '700', color: THEME.text, marginBottom: 4 },
    emptyBody:  { fontSize: 13, color: THEME.gray, textAlign: 'center' },

    card:        { backgroundColor: THEME.card, borderWidth: 1, borderColor: THEME.border, borderRadius: 16, marginBottom: 14, overflow: 'hidden', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 3, elevation: 1 },
    cardHeader:  { flexDirection: 'row', alignItems: 'flex-start', gap: 12, padding: 14, paddingBottom: 10 },
    cardIconWrap:{ width: 44, height: 44, borderRadius: 10, backgroundColor: THEME.green.bg, alignItems: 'center', justifyContent: 'center' },
    cardBody:    { flex: 1 },
    cardName:    { fontSize: 15, fontWeight: '700', color: THEME.text, letterSpacing: -0.2, marginBottom: 3 },
    cardMeta:    { fontSize: 11, color: THEME.gray },
    cardDesc:    { fontSize: 12, color: THEME.gray, paddingHorizontal: 14, paddingBottom: 10, lineHeight: 17 },

    payBadge:     { backgroundColor: THEME.blue.bg, borderWidth: 1, borderColor: THEME.blue.border, borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3 },
    payBadgeText: { fontSize: 10, fontWeight: '700', color: THEME.blue.text },

    reqWrap:  { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 14, paddingBottom: 10 },
    reqTitle: { fontSize: 11, fontWeight: '700', color: THEME.gray },
    reqText:  { fontSize: 11, color: THEME.grayLight, flex: 1 },

    noQueue:     { padding: 14, alignItems: 'center', borderTopWidth: 1, borderTopColor: THEME.borderLight },
    noQueueText: { fontSize: 12, color: THEME.grayLight },

    joinRow: { paddingHorizontal: 14, paddingVertical: 10 },
    joinBtn: { fontSize: 12, fontWeight: '700', color: THEME.primary },
});