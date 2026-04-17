import React, { useEffect, useCallback, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  RefreshControl,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import useStore from '../../store/useStore';
import { getClaims, seedDemoPayout } from '../../services/api';
import { formatCurrency, formatDate } from '../../utils/formatters';

// ─── Design tokens ─────────────────────────────────────────────────────────────
const C = {
  paper:      '#F8F7F4',
  ink:        '#0f0f0e',
  inkFaint:   '#9ca3af',
  inkMid:     '#4b5563',
  column:     '#e5e3de',
  emerald:    '#166534',
  emeraldBg:  '#f0fdf4',
  steel:      '#1e3a5f',
  steelBg:    '#eff6ff',
  amber:      '#92400e',
  amberBg:    '#fffbeb',
  amberRule:  '#fbbf24',
  surface:    '#F1F0EC',
  white:      '#FFFFFF',
  danger:     '#dc2626',
};

// ─── Constants ─────────────────────────────────────────────────────────────────
const TRIGGER_META: Record<string, { symbol: string; label: string }> = {
  rainfall: { symbol: '~', label: 'Heavy Rainfall' },
  heat:     { symbol: '△', label: 'Extreme Heat' },
  aqi:      { symbol: '◎', label: 'Severe AQI' },
  flood:    { symbol: '≈', label: 'Flooding' },
  curfew:   { symbol: '◻', label: 'Curfew / Bandh' },
  default:  { symbol: '◈', label: 'Disruption' },
};

const LEFT_BORDER: Record<string, string> = {
  paid:     C.emerald,
  approved: C.steel,
  flagged:  C.amberRule,
  rejected: C.danger,
  pending:  C.inkFaint,
};

const AMOUNT_COLOR: Record<string, string> = {
  paid:     C.emerald,
  approved: C.steel,
  flagged:  C.amber,
  rejected: C.danger,
  pending:  C.inkFaint,
};

// ─── SectionHead component ─────────────────────────────────────────────────────
function SectionHead({ label }: { label: string }) {
  return (
    <View style={sh.wrap}>
      <Text style={sh.text}>{label}</Text>
      <View style={sh.rule} />
    </View>
  );
}
const sh = StyleSheet.create({
  wrap: { marginBottom: 14 },
  text: {
    fontSize: 9,
    fontWeight: '700',
    color: '#9ca3af',
    textTransform: 'uppercase',
    letterSpacing: 2.5,
    marginBottom: 6,
  },
  rule: { height: 1, backgroundColor: '#e5e3de' },
});

// ─── Screen ────────────────────────────────────────────────────────────────────

export default function EarningsScreen() {
  const { worker, claims, claimSummary, isLoadingClaims, setLoading, setError, setClaims } = useStore();
  const [refreshing, setRefreshing] = React.useState(false);
  const [seeding, setSeeding]       = useState(false);

  const loadClaims = useCallback(async () => {
    if (!worker?.uid) return;
    setLoading('claims', true);
    try {
      const data = await getClaims(worker.uid);
      setClaims(data.claims, data.summary);
    } catch (err: any) {
      setError('claims', err.message);
    } finally {
      setLoading('claims', false);
    }
  }, [worker?.uid]);

  useEffect(() => { loadClaims(); }, [loadClaims]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadClaims();
    setRefreshing(false);
  };

  const handleSeedDemo = () => {
    Alert.alert(
      'Simulate Payout',
      'This seeds 3 realistic disruption claims (rain, heat, AQI) as paid — perfect for the demo.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Seed Demo Data',
          onPress: async () => {
            setSeeding(true);
            try {
              const result = await seedDemoPayout();
              Alert.alert('Done!', result.message || 'Demo payouts seeded.');
              await loadClaims();
            } catch (err: any) {
              Alert.alert('Error', err.message || 'Failed to seed demo data.');
            } finally {
              setSeeding(false);
            }
          },
        },
      ],
    );
  };

  // Sort all claims by date descending
  const sortedClaims  = [...claims].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );
  const paidClaims    = claims.filter((c) => c.status === 'paid');
  const pendingClaims = claims.filter((c) => c.status === 'approved');
  const reviewClaims  = claims.filter((c) => c.status === 'flagged');

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={C.inkFaint}
            colors={[C.ink]}
          />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* ── Header row ─────────────────────────────────────────────────── */}
        <View style={styles.titleRow}>
          <Text style={styles.pageTitle}>Earnings</Text>
          <TouchableOpacity
            style={styles.demoBtn}
            onPress={handleSeedDemo}
            disabled={seeding}
            activeOpacity={0.75}
          >
            {seeding
              ? <ActivityIndicator size="small" color={C.ink} />
              : <Text style={styles.demoBtnText}>Demo Payout</Text>
            }
          </TouchableOpacity>
        </View>

        {/* ── Big money card ─────────────────────────────────────────────── */}
        <View style={styles.moneyCard}>
          <SectionHead label="Total Received" />
          <Text style={styles.moneyAmount}>
            ₹{claimSummary.totalProtected.toLocaleString('en-IN')}
          </Text>
          {claimSummary.lastPayout && claimSummary.lastPayout.amount > 0 && (
            <View style={styles.lastPayoutPill}>
              <Text style={styles.lastPayoutText}>
                Last payout ₹{claimSummary.lastPayout.amount.toLocaleString('en-IN')}
              </Text>
            </View>
          )}
        </View>

        {/* ── Stats row ──────────────────────────────────────────────────── */}
        <View style={styles.statsRow}>
          <StatBox label="Paid"         count={paidClaims.length}    color={C.emerald} />
          <StatBox label="Pending"      count={pendingClaims.length} color={C.steel} />
          <StatBox label="Under Review" count={reviewClaims.length}  color={C.amber} />
        </View>

        {/* ── Claims list ────────────────────────────────────────────────── */}
        {isLoadingClaims ? (
          <View style={styles.loadingBox}>
            <ActivityIndicator color={C.inkMid} size="large" />
          </View>
        ) : sortedClaims.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptySymbol}>◈</Text>
            <Text style={styles.emptyTitle}>No payouts yet</Text>
            <Text style={styles.emptySubtext}>
              When a disruption hits your zone, a claim is auto-created and payment is sent to your UPI
            </Text>
          </View>
        ) : (
          <>
            <SectionHead label="Claim History" />
            {sortedClaims.map((claim) => {
              const key         = (claim.triggerType || '').toLowerCase();
              const meta        = TRIGGER_META[key] ?? TRIGGER_META.default;
              const statusKey   = claim.status?.toLowerCase() ?? 'pending';
              const borderColor = LEFT_BORDER[statusKey] ?? C.inkFaint;
              const amountColor = AMOUNT_COLOR[statusKey] ?? C.inkFaint;
              return (
                <View
                  key={claim.id}
                  style={[styles.claimRow, { borderLeftColor: borderColor }]}
                >
                  <View style={styles.claimLeft}>
                    <Text style={styles.rowSymbol}>{meta.symbol}</Text>
                    <View style={styles.rowInfo}>
                      <Text style={styles.rowLabel}>{meta.label}</Text>
                      <Text style={styles.rowDate}>{formatDate(claim.createdAt)}</Text>
                    </View>
                  </View>
                  <Text style={[styles.rowAmount, { color: amountColor }]}>
                    {formatCurrency(claim.finalPayout)}
                  </Text>
                </View>
              );
            })}
          </>
        )}

        <Text style={styles.footerNote}>
          Payouts are processed every Monday morning
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

// ─── Sub-components ────────────────────────────────────────────────────────────

function StatBox({ label, count, color }: { label: string; count: number; color: string }) {
  return (
    <View style={styles.statBox}>
      <Text style={[styles.statValue, { color }]}>{count}</Text>
      <Text style={styles.statLabel}>{label.toUpperCase()}</Text>
    </View>
  );
}

// ─── Styles ────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F8F7F4' },
  content:  { paddingHorizontal: 16, paddingTop: 20, paddingBottom: 48 },

  // ── Title row
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  pageTitle: {
    fontSize: 32,
    fontWeight: '900',
    color: '#0f0f0e',
    letterSpacing: -0.5,
  },

  // ── Demo button — surface bg, column border
  demoBtn: {
    borderRadius: 4,
    paddingHorizontal: 14,
    height: 36,
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#e5e3de',
    backgroundColor: '#F1F0EC',
    minWidth: 44,
    alignItems: 'center',
  },
  demoBtnText: { color: '#0f0f0e', fontSize: 12, fontWeight: '600' },

  // ── Big money card
  moneyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#e5e3de',
    padding: 20,
    alignItems: 'center',
    marginBottom: 12,
  },
  moneyAmount: {
    fontSize: 48,
    fontWeight: '900',
    color: '#166534',
    letterSpacing: -1,
    marginBottom: 10,
  },
  lastPayoutPill: {
    backgroundColor: '#f0fdf4',
    borderRadius: 4,
    paddingHorizontal: 12,
    paddingVertical: 5,
  },
  lastPayoutText: { fontSize: 12, color: '#166534', fontWeight: '600' },

  // ── Stats row
  statsRow: { flexDirection: 'row', gap: 10, marginBottom: 24 },
  statBox: {
    flex: 1,
    backgroundColor: '#F1F0EC',
    borderRadius: 6,
    padding: 14,
    alignItems: 'center',
    gap: 4,
  },
  statValue: { fontSize: 26, fontWeight: '900', letterSpacing: -0.5 },
  statLabel: {
    fontSize: 9,
    fontWeight: '700',
    color: '#9ca3af',
    textAlign: 'center',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },

  // ── Loading / empty
  loadingBox: { padding: 40, alignItems: 'center' },
  emptyState: { alignItems: 'center', paddingVertical: 56, gap: 12 },
  emptySymbol: { fontSize: 48, color: '#9ca3af' },
  emptyTitle:  { fontSize: 17, fontWeight: '700', color: '#0f0f0e' },
  emptySubtext: {
    fontSize: 13,
    color: '#9ca3af',
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: 16,
  },

  // ── Claim row
  claimRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#e5e3de',
    borderLeftWidth: 3,
    paddingVertical: 14,
    paddingHorizontal: 16,
    marginBottom: 6,
  },
  claimLeft:  { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 },
  rowSymbol:  { fontSize: 18, color: '#4b5563', width: 20, textAlign: 'center' },
  rowInfo:    { flex: 1 },
  rowLabel:   { fontSize: 14, fontWeight: '600', color: '#0f0f0e' },
  rowDate:    { fontSize: 12, color: '#9ca3af', marginTop: 2 },
  rowAmount:  { fontSize: 14, fontWeight: '700' },

  // ── Footer
  footerNote: {
    fontSize: 11,
    color: '#9ca3af',
    textAlign: 'center',
    marginTop: 28,
    lineHeight: 17,
  },
});
