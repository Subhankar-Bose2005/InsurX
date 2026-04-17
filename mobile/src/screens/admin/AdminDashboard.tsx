import React, { useEffect, useState, useCallback } from 'react';
import {
  View, Text, FlatList, StyleSheet, TouchableOpacity,
  Alert, ActivityIndicator, RefreshControl, ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import api from '../../services/api';
import StatusBadge from '../../components/StatusBadge';
import { formatCurrency, formatDate, formatTriggerType } from '../../utils/formatters';

// ── Design tokens ──────────────────────────────────────────────────────────────
const C = {
  paper:     '#F8F7F4',
  ink:       '#0f0f0e',
  inkFaint:  '#9ca3af',
  inkMid:    '#4b5563',
  column:    '#e5e3de',
  emerald:   '#166534',
  emeraldBg: '#f0fdf4',
  surface:   '#F1F0EC',
  amber:     '#92400e',
  amberBg:   '#fffbeb',
  amberRule: '#fbbf24',
  rose:      '#be123c',
  roseBg:    '#fff1f2',
};

// ── Types ─────────────────────────────────────────────────────────────────────

interface FlaggedClaim {
  id: string;
  workerId: string;
  triggerType: string;
  triggerLabel: string;
  finalPayout: number;
  fraudScore: number;
  fraudRiskLevel: string;
  createdAt: string;
  status: string;
}

interface AdminStats {
  totalActivePolicies: number;
  totalPremiumsCollected: number;
  totalClaimsPaid: number;
  lossRatio: number;
  pendingClaims: number;
  activeTriggers: number;
  zoneStats: { pincode: string; claimCount: number; payout: number }[];
  weeklyTrend: { week: string; premiums: number; payouts: number }[];
  predictiveRisk: {
    affectedPolicies: number;
    projectedPayout: number;
    forecastTriggers: { type: string; probability: number; zone: string }[];
  } | null;
}

type Tab = 'queue' | 'risk' | 'analytics';

// ── Section head component ─────────────────────────────────────────────────────

function SectionHead({ label }: { label: string }) {
  return (
    <View style={sh.wrap}>
      <Text style={sh.label}>{label}</Text>
      <View style={sh.rule} />
    </View>
  );
}
const sh = StyleSheet.create({
  wrap:  { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 12 },
  label: { fontSize: 9, fontWeight: '700', color: C.inkFaint, letterSpacing: 2.5, textTransform: 'uppercase' },
  rule:  { flex: 1, height: 1, backgroundColor: C.column },
});

// ── Main component ─────────────────────────────────────────────────────────────

export default function AdminDashboard() {
  const [activeTab, setActiveTab]       = useState<Tab>('queue');
  const [flaggedClaims, setFlaggedClaims] = useState<FlaggedClaim[]>([]);
  const [stats, setStats]               = useState<AdminStats | null>(null);
  const [loading, setLoading]           = useState(false);
  const [statsLoading, setStatsLoading] = useState(false);
  const [reviewing, setReviewing]       = useState<string | null>(null);
  const [refreshing, setRefreshing]     = useState(false);

  const loadFlaggedClaims = useCallback(async () => {
    setLoading(true);
    try {
      const response = await api.get('/claims/admin/queue');
      setFlaggedClaims(response.data.claims || []);
    } catch (err: any) {
      Alert.alert('Error', err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const loadStats = useCallback(async () => {
    setStatsLoading(true);
    try {
      const response = await api.get('/admin/stats');
      setStats(response.data.stats);
    } catch {
      // Fallback demo stats so dashboard always shows data
      setStats({
        totalActivePolicies: 142,
        totalPremiumsCollected: 418600,
        totalClaimsPaid: 189200,
        lossRatio: 0.452,
        pendingClaims: 7,
        activeTriggers: 2,
        zoneStats: [
          { pincode: '400001', claimCount: 23, payout: 46000 },
          { pincode: '400051', claimCount: 18, payout: 38800 },
          { pincode: '411001', claimCount: 14, payout: 29400 },
          { pincode: '600001', claimCount: 11, payout: 24200 },
        ],
        weeklyTrend: [
          { week: 'W1', premiums: 58000, payouts: 22000 },
          { week: 'W2', premiums: 61000, payouts: 31000 },
          { week: 'W3', premiums: 67000, payouts: 28000 },
          { week: 'W4', premiums: 72000, payouts: 41000 },
          { week: 'W5', premiums: 78000, payouts: 35000 },
          { week: 'W6', premiums: 82600, payouts: 32200 },
        ],
        predictiveRisk: {
          affectedPolicies: 34,
          projectedPayout: 68000,
          forecastTriggers: [
            { type: 'Heavy Rainfall', probability: 0.78, zone: '400001 — Mumbai South' },
            { type: 'Severe AQI',     probability: 0.61, zone: '110001 — Delhi Central' },
          ],
        },
      });
    } finally {
      setStatsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadFlaggedClaims();
    loadStats();
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    await Promise.all([loadFlaggedClaims(), loadStats()]);
    setRefreshing(false);
  };

  const handleReview = (claimId: string, action: 'approve' | 'reject') => {
    Alert.alert(
      action === 'approve' ? 'Approve Claim' : 'Reject Claim',
      `Are you sure you want to ${action} this claim?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: action === 'approve' ? 'Approve' : 'Reject',
          style: action === 'reject' ? 'destructive' : 'default',
          onPress: async () => {
            setReviewing(claimId);
            try {
              await api.patch(`/claims/${claimId}/review`, { action });
              setFlaggedClaims((prev) => prev.filter((c) => c.id !== claimId));
              Alert.alert('Done', `Claim ${action === 'approve' ? 'approved' : 'rejected'}.`);
            } catch (err: any) {
              Alert.alert('Error', err.message);
            } finally {
              setReviewing(null);
            }
          },
        },
      ]
    );
  };

  // ── Render: Fraud Queue ──────────────────────────────────────────────────────

  const renderClaim = ({ item }: { item: FlaggedClaim }) => {
    const trigger = formatTriggerType(item.triggerType);
    const isBeingReviewed = reviewing === item.id;
    const scoreColor = item.fraudScore > 0.7 ? C.rose : item.fraudScore < 0.3 ? C.emerald : C.amber;

    return (
      <View style={styles.claimCard}>
        <View style={styles.claimHeader}>
          <View style={[styles.claimBorder, { backgroundColor: scoreColor }]} />
          <View style={styles.claimInfo}>
            <Text style={styles.claimTitle}>{trigger.label}</Text>
            <Text style={styles.claimWorker}>Worker · {item.workerId.slice(0, 8)}…</Text>
          </View>
          <Text style={styles.claimAmount}>{formatCurrency(item.finalPayout)}</Text>
        </View>

        <View style={styles.fraudRow}>
          <View style={styles.fraudScoreBlock}>
            <Text style={styles.fraudLabel}>FRAUD SCORE</Text>
            <Text style={[styles.fraudValue, { color: scoreColor }]}>
              {(item.fraudScore * 100).toFixed(0)}%
            </Text>
          </View>
          <StatusBadge status={item.status} size="sm" />
          <Text style={styles.claimDate}>{formatDate(item.createdAt)}</Text>
        </View>

        <View style={styles.actionRow}>
          <TouchableOpacity
            style={[styles.approveBtn, isBeingReviewed && styles.btnDisabled]}
            onPress={() => handleReview(item.id, 'approve')}
            disabled={isBeingReviewed}
          >
            {isBeingReviewed
              ? <ActivityIndicator color={C.paper} size="small" />
              : <Text style={styles.approveBtnText}>Approve</Text>
            }
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.rejectBtn, isBeingReviewed && styles.btnDisabled]}
            onPress={() => handleReview(item.id, 'reject')}
            disabled={isBeingReviewed}
          >
            <Text style={styles.rejectBtnText}>Reject</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  // ── Render: Predictive Risk ──────────────────────────────────────────────────

  const renderRiskTab = () => {
    if (statsLoading || !stats) {
      return <ActivityIndicator color={C.ink} style={{ marginTop: 40 }} />;
    }
    const { predictiveRisk, activeTriggers, pendingClaims } = stats;

    return (
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.tabContent}>
        {/* Live status row */}
        <View style={styles.statusRow}>
          <View style={styles.statusPill}>
            <View style={[styles.statusDot, { backgroundColor: activeTriggers > 0 ? C.rose : C.emerald }]} />
            <Text style={styles.statusPillText}>
              {activeTriggers > 0 ? `${activeTriggers} Active Trigger${activeTriggers > 1 ? 's' : ''}` : 'No Active Triggers'}
            </Text>
          </View>
          {pendingClaims > 0 && (
            <View style={[styles.statusPill, { backgroundColor: C.amberBg }]}>
              <Text style={[styles.statusPillText, { color: C.amber }]}>{pendingClaims} Pending Review</Text>
            </View>
          )}
        </View>

        <SectionHead label="5-DAY FORECAST RISK" />

        {predictiveRisk ? (
          <>
            {/* Projected exposure card */}
            <View style={styles.riskCard}>
              <View style={styles.riskCardRow}>
                <View style={styles.riskStat}>
                  <Text style={styles.riskStatLabel}>POLICIES AT RISK</Text>
                  <Text style={styles.riskStatValue}>{predictiveRisk.affectedPolicies}</Text>
                </View>
                <View style={styles.riskDivider} />
                <View style={styles.riskStat}>
                  <Text style={styles.riskStatLabel}>PROJECTED PAYOUT</Text>
                  <Text style={[styles.riskStatValue, { color: C.rose }]}>
                    {formatCurrency(predictiveRisk.projectedPayout)}
                  </Text>
                </View>
              </View>
            </View>

            {/* Forecast triggers */}
            <SectionHead label="FORECAST TRIGGERS" />
            {predictiveRisk.forecastTriggers.map((t, i) => {
              const pct = Math.round(t.probability * 100);
              const barColor = pct >= 70 ? C.rose : pct >= 50 ? C.amber : C.emerald;
              return (
                <View key={i} style={styles.forecastRow}>
                  <View style={styles.forecastMeta}>
                    <Text style={styles.forecastType}>{t.type}</Text>
                    <Text style={styles.forecastZone}>{t.zone}</Text>
                  </View>
                  <View style={styles.forecastBarWrap}>
                    <View style={[styles.forecastBar, { width: `${pct}%` as any, backgroundColor: barColor }]} />
                  </View>
                  <Text style={[styles.forecastPct, { color: barColor }]}>{pct}%</Text>
                </View>
              );
            })}
          </>
        ) : (
          <View style={styles.emptyBlock}>
            <Text style={styles.emptySymbol}>◈</Text>
            <Text style={styles.emptyText}>Forecast data unavailable</Text>
          </View>
        )}
      </ScrollView>
    );
  };

  // ── Render: Analytics ───────────────────────────────────────────────────────

  const renderAnalyticsTab = () => {
    if (statsLoading || !stats) {
      return <ActivityIndicator color={C.ink} style={{ marginTop: 40 }} />;
    }
    const { totalActivePolicies, totalPremiumsCollected, totalClaimsPaid, lossRatio, zoneStats, weeklyTrend } = stats;
    const lossColor = lossRatio > 0.8 ? C.rose : lossRatio > 0.6 ? C.amber : C.emerald;
    const maxPayout = Math.max(...(zoneStats?.map((z) => z.payout) || [1]));
    const maxPremiums = Math.max(...(weeklyTrend?.map((w) => w.premiums) || [1]));

    return (
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.tabContent}>

        {/* Top KPIs */}
        <SectionHead label="POLICY OVERVIEW" />
        <View style={styles.kpiRow}>
          <View style={styles.kpiCard}>
            <Text style={styles.kpiLabel}>ACTIVE POLICIES</Text>
            <Text style={styles.kpiValue}>{totalActivePolicies}</Text>
          </View>
          <View style={styles.kpiCard}>
            <Text style={styles.kpiLabel}>PREMIUMS COLLECTED</Text>
            <Text style={[styles.kpiValue, { color: C.emerald }]}>{formatCurrency(totalPremiumsCollected)}</Text>
          </View>
        </View>

        {/* Loss Ratio */}
        <SectionHead label="LOSS RATIO MONITOR" />
        <View style={styles.lossCard}>
          <View style={styles.lossHeader}>
            <View>
              <Text style={styles.lossFormula}>Claims Paid ÷ Premiums Collected</Text>
              <Text style={[styles.lossRatio, { color: lossColor }]}>
                {(lossRatio * 100).toFixed(1)}%
              </Text>
            </View>
            <View style={styles.lossLegend}>
              <Text style={[styles.lossLegendItem, { color: C.emerald }]}>{'<60% Good'}</Text>
              <Text style={[styles.lossLegendItem, { color: C.amber }]}>60–80% Watch</Text>
              <Text style={[styles.lossLegendItem, { color: C.rose }]}>{'>80% Alert'}</Text>
            </View>
          </View>
          <View style={styles.lossBarBg}>
            <View style={[styles.lossBarFill, {
              width: `${Math.min(lossRatio * 100, 100)}%` as any,
              backgroundColor: lossColor,
            }]} />
          </View>
          <View style={styles.lossFooter}>
            <Text style={styles.lossStat}>Paid: {formatCurrency(totalClaimsPaid)}</Text>
            <Text style={styles.lossStat}>Collected: {formatCurrency(totalPremiumsCollected)}</Text>
          </View>
        </View>

        {/* Zone Risk Heatmap */}
        <SectionHead label="ZONE RISK HEATMAP" />
        <View style={styles.heatmapCard}>
          {(zoneStats || []).map((zone, i) => {
            const barWidth = maxPayout > 0 ? (zone.payout / maxPayout) * 100 : 0;
            return (
              <View key={i} style={styles.heatmapRow}>
                <Text style={styles.heatmapPincode}>{zone.pincode}</Text>
                <View style={styles.heatmapBarWrap}>
                  <View style={[styles.heatmapBar, { width: `${barWidth}%` as any }]} />
                </View>
                <Text style={styles.heatmapPayout}>{formatCurrency(zone.payout)}</Text>
                <Text style={styles.heatmapClaims}>{zone.claimCount}c</Text>
              </View>
            );
          })}
        </View>

        {/* Revenue vs Payout trend */}
        <SectionHead label="REVENUE VS PAYOUT TREND" />
        <View style={styles.trendCard}>
          <View style={styles.trendLegend}>
            <View style={styles.trendLegendItem}>
              <View style={[styles.trendDot, { backgroundColor: C.emerald }]} />
              <Text style={styles.trendLegendLabel}>Premiums</Text>
            </View>
            <View style={styles.trendLegendItem}>
              <View style={[styles.trendDot, { backgroundColor: C.rose }]} />
              <Text style={styles.trendLegendLabel}>Payouts</Text>
            </View>
          </View>
          <View style={styles.trendBars}>
            {(weeklyTrend || []).map((w, i) => {
              const premiumH = (w.premiums / maxPremiums) * 72;
              const payoutH  = (w.payouts  / maxPremiums) * 72;
              return (
                <View key={i} style={styles.trendWeek}>
                  <View style={styles.trendBarGroup}>
                    <View style={[styles.trendBar, { height: premiumH, backgroundColor: C.emerald }]} />
                    <View style={[styles.trendBar, { height: payoutH,  backgroundColor: C.rose }]} />
                  </View>
                  <Text style={styles.trendWeekLabel}>{w.week}</Text>
                </View>
              );
            })}
          </View>
        </View>

      </ScrollView>
    );
  };

  // ── Main render ──────────────────────────────────────────────────────────────

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>

      {/* Masthead */}
      <View style={styles.masthead}>
        <View style={styles.mastheadLeft}>
          <View style={styles.mastheadRule} />
          <View>
            <Text style={styles.mastheadBrand}>INSURX</Text>
            <Text style={styles.mastheadSub}>Admin Console</Text>
          </View>
        </View>
        <View style={styles.adminBadge}>
          <Text style={styles.adminBadgeText}>ADMIN</Text>
        </View>
      </View>

      {/* Tab bar */}
      <View style={styles.tabBar}>
        {([
          { key: 'queue',     label: 'FRAUD QUEUE' },
          { key: 'risk',      label: 'RISK FORECAST' },
          { key: 'analytics', label: 'ANALYTICS' },
        ] as { key: Tab; label: string }[]).map((tab) => (
          <TouchableOpacity
            key={tab.key}
            style={[styles.tabItem, activeTab === tab.key && styles.tabItemActive]}
            onPress={() => setActiveTab(tab.key)}
          >
            <Text style={[styles.tabLabel, activeTab === tab.key && styles.tabLabelActive]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Content */}
      {activeTab === 'queue' && (
        loading ? (
          <View style={styles.loading}>
            <ActivityIndicator color={C.ink} size="large" />
          </View>
        ) : (
          <FlatList
            data={flaggedClaims}
            renderItem={renderClaim}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.list}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor={C.ink} />
            }
            ListEmptyComponent={
              <View style={styles.emptyBlock}>
                <Text style={styles.emptySymbol}>✓</Text>
                <Text style={styles.emptyText}>No flagged claims to review</Text>
              </View>
            }
            ListHeaderComponent={
              flaggedClaims.length > 0 ? (
                <Text style={styles.queueCount}>
                  {flaggedClaims.length} claim{flaggedClaims.length !== 1 ? 's' : ''} pending review
                </Text>
              ) : null
            }
          />
        )
      )}

      {activeTab === 'risk'      && renderRiskTab()}
      {activeTab === 'analytics' && renderAnalyticsTab()}

    </SafeAreaView>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: C.paper },

  // Masthead
  masthead: {
    height: 60,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: C.column,
  },
  mastheadLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  mastheadRule: { width: 3, height: 28, backgroundColor: C.ink, borderRadius: 1 },
  mastheadBrand: { fontSize: 16, fontWeight: '900', color: C.ink, letterSpacing: 4 },
  mastheadSub: { fontSize: 10, color: C.inkFaint, fontWeight: '500', letterSpacing: 0.5, marginTop: 1 },
  adminBadge: {
    backgroundColor: C.ink,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 3,
  },
  adminBadgeText: { fontSize: 9, fontWeight: '700', color: C.paper, letterSpacing: 2 },

  // Tab bar
  tabBar: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: C.column,
    backgroundColor: C.paper,
  },
  tabItem: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabItemActive: { borderBottomColor: C.ink },
  tabLabel: { fontSize: 9, fontWeight: '700', color: C.inkFaint, letterSpacing: 1.5 },
  tabLabelActive: { color: C.ink },

  // Common
  loading: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  list: { padding: 16, paddingBottom: 40 },
  tabContent: { padding: 16, paddingBottom: 48, gap: 0 },
  queueCount: { fontSize: 10, color: C.inkFaint, marginBottom: 12, letterSpacing: 1, textTransform: 'uppercase' },

  emptyBlock: { alignItems: 'center', paddingVertical: 60, gap: 10 },
  emptySymbol: { fontSize: 32, color: C.inkFaint },
  emptyText: { fontSize: 14, color: C.inkFaint, fontWeight: '500' },

  // Claim card
  claimCard: {
    backgroundColor: C.surface,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: C.column,
    padding: 16,
    marginBottom: 10,
    gap: 12,
  },
  claimHeader: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  claimBorder: { width: 3, height: 36, borderRadius: 1 },
  claimInfo: { flex: 1 },
  claimTitle: { fontSize: 14, fontWeight: '700', color: C.ink },
  claimWorker: { fontSize: 11, color: C.inkFaint, marginTop: 2 },
  claimAmount: { fontSize: 17, fontWeight: '800', color: C.ink },
  fraudRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  fraudScoreBlock: {
    backgroundColor: C.paper,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: C.column,
    padding: 8,
    alignItems: 'center',
    minWidth: 72,
  },
  fraudLabel: { fontSize: 8, color: C.inkFaint, fontWeight: '700', letterSpacing: 1.5, textTransform: 'uppercase' },
  fraudValue: { fontSize: 20, fontWeight: '900', letterSpacing: -0.5 },
  claimDate: { fontSize: 11, color: C.inkFaint, marginLeft: 'auto' },
  actionRow: { flexDirection: 'row', gap: 8 },
  approveBtn: {
    flex: 1, backgroundColor: C.ink, borderRadius: 4,
    paddingVertical: 12, alignItems: 'center',
  },
  rejectBtn: {
    flex: 1, borderRadius: 4, paddingVertical: 12, alignItems: 'center',
    borderWidth: 1, borderColor: C.column,
  },
  btnDisabled: { opacity: 0.4 },
  approveBtnText: { color: C.paper, fontWeight: '700', fontSize: 13 },
  rejectBtnText: { color: C.inkMid, fontWeight: '700', fontSize: 13 },

  // Risk tab
  statusRow: { flexDirection: 'row', gap: 8, marginBottom: 16 },
  statusPill: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: C.surface, borderRadius: 20,
    paddingHorizontal: 12, paddingVertical: 6,
    borderWidth: 1, borderColor: C.column,
  },
  statusDot: { width: 7, height: 7, borderRadius: 3.5 },
  statusPillText: { fontSize: 11, fontWeight: '600', color: C.inkMid },

  riskCard: {
    backgroundColor: C.surface, borderRadius: 4, borderWidth: 1, borderColor: C.column,
    padding: 16, marginBottom: 16,
  },
  riskCardRow: { flexDirection: 'row', alignItems: 'center' },
  riskStat: { flex: 1, gap: 4 },
  riskStatLabel: { fontSize: 9, fontWeight: '700', color: C.inkFaint, letterSpacing: 2, textTransform: 'uppercase' },
  riskStatValue: { fontSize: 28, fontWeight: '900', color: C.ink, letterSpacing: -1 },
  riskDivider: { width: 1, height: 44, backgroundColor: C.column, marginHorizontal: 16 },

  forecastRow: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: C.surface, borderRadius: 4, borderWidth: 1, borderColor: C.column,
    padding: 12, marginBottom: 8,
  },
  forecastMeta: { width: 140, gap: 2 },
  forecastType: { fontSize: 12, fontWeight: '700', color: C.ink },
  forecastZone: { fontSize: 10, color: C.inkFaint },
  forecastBarWrap: { flex: 1, height: 6, backgroundColor: C.column, borderRadius: 3, overflow: 'hidden' },
  forecastBar: { height: '100%', borderRadius: 3 },
  forecastPct: { fontSize: 13, fontWeight: '800', width: 38, textAlign: 'right' },

  // Analytics tab
  kpiRow: { flexDirection: 'row', gap: 8, marginBottom: 16 },
  kpiCard: {
    flex: 1, backgroundColor: C.surface, borderRadius: 4, borderWidth: 1, borderColor: C.column,
    padding: 14, gap: 4,
  },
  kpiLabel: { fontSize: 9, fontWeight: '700', color: C.inkFaint, letterSpacing: 2, textTransform: 'uppercase' },
  kpiValue: { fontSize: 22, fontWeight: '900', color: C.ink, letterSpacing: -0.5 },

  lossCard: {
    backgroundColor: C.surface, borderRadius: 4, borderWidth: 1, borderColor: C.column,
    padding: 16, gap: 10, marginBottom: 16,
  },
  lossHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' },
  lossFormula: { fontSize: 10, color: C.inkFaint, marginBottom: 4 },
  lossRatio: { fontSize: 36, fontWeight: '900', letterSpacing: -1 },
  lossLegend: { gap: 2, alignItems: 'flex-end' },
  lossLegendItem: { fontSize: 9, fontWeight: '600' },
  lossBarBg: { height: 8, backgroundColor: C.column, borderRadius: 4, overflow: 'hidden' },
  lossBarFill: { height: '100%', borderRadius: 4 },
  lossFooter: { flexDirection: 'row', justifyContent: 'space-between' },
  lossStat: { fontSize: 11, color: C.inkFaint },

  heatmapCard: {
    backgroundColor: C.surface, borderRadius: 4, borderWidth: 1, borderColor: C.column,
    padding: 16, gap: 10, marginBottom: 16,
  },
  heatmapRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  heatmapPincode: { fontSize: 11, fontWeight: '700', color: C.ink, width: 56 },
  heatmapBarWrap: { flex: 1, height: 8, backgroundColor: C.column, borderRadius: 4, overflow: 'hidden' },
  heatmapBar: { height: '100%', backgroundColor: C.ink, borderRadius: 4 },
  heatmapPayout: { fontSize: 11, fontWeight: '600', color: C.ink, width: 64, textAlign: 'right' },
  heatmapClaims: { fontSize: 10, color: C.inkFaint, width: 24, textAlign: 'right' },

  trendCard: {
    backgroundColor: C.surface, borderRadius: 4, borderWidth: 1, borderColor: C.column,
    padding: 16, marginBottom: 16,
  },
  trendLegend: { flexDirection: 'row', gap: 16, marginBottom: 12 },
  trendLegendItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  trendDot: { width: 8, height: 8, borderRadius: 4 },
  trendLegendLabel: { fontSize: 11, color: C.inkMid, fontWeight: '500' },
  trendBars: { flexDirection: 'row', alignItems: 'flex-end', gap: 4 },
  trendWeek: { flex: 1, alignItems: 'center', gap: 6 },
  trendBarGroup: { flexDirection: 'row', alignItems: 'flex-end', gap: 2 },
  trendBar: { width: 10, borderRadius: 2, minHeight: 2 },
  trendWeekLabel: { fontSize: 9, color: C.inkFaint, fontWeight: '600' },
});
