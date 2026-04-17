// FILE: C:\Users\sumat\OneDrive\Documents\Project\InsurX\mobile\src\screens\worker\ClaimsScreen.tsx
import React, { useEffect, useCallback, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  RefreshControl,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import useStore, { Claim } from '../../store/useStore';
import { getClaims } from '../../services/api';
import { formatCurrency, formatDate } from '../../utils/formatters';

// ─── Design tokens — Editorial Expanded ───────────────────────────────────────
const T = {
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
  danger:     '#991b1b',
  dangerBg:   '#fef2f2',
  dangerRule: '#fca5a5',
};

// ─── Constants ─────────────────────────────────────────────────────────────────
const FILTER_OPTIONS = ['All', 'Paid', 'Approved', 'Flagged', 'Rejected'];

const TRIGGER_META: Record<string, { emoji: string; label: string }> = {
  rainfall: { emoji: '🌧️', label: 'Heavy Rainfall' },
  heat:     { emoji: '🌡️', label: 'Extreme Heat' },
  aqi:      { emoji: '😷', label: 'Severe AQI' },
  flood:    { emoji: '🌊', label: 'Flooding' },
  curfew:   { emoji: '🚫', label: 'Curfew / Bandh' },
  default:  { emoji: '⚡', label: 'Disruption' },
};

const STATUS_CONFIG: Record<string, {
  borderColor: string;
  badgeBg: string;
  badgeText: string;
  label: string;
}> = {
  paid:     { borderColor: T.emerald,    badgeBg: T.emeraldBg, badgeText: T.emerald,  label: 'Paid'     },
  approved: { borderColor: T.steel,      badgeBg: T.steelBg,   badgeText: T.steel,    label: 'Approved' },
  flagged:  { borderColor: T.amberRule,  badgeBg: T.amberBg,   badgeText: T.amber,    label: 'Flagged'  },
  rejected: { borderColor: '#fca5a5',    badgeBg: '#fef2f2',   badgeText: '#991b1b',  label: 'Rejected' },
  pending:  { borderColor: T.column,     badgeBg: T.surface,   badgeText: T.inkMid,   label: 'Pending'  },
};

// ─── Section head component ────────────────────────────────────────────────────
function SectionHead({ label }: { label: string }) {
  return (
    <View style={sh.wrap}>
      <Text style={sh.label}>{label}</Text>
      <View style={sh.rule} />
    </View>
  );
}
const sh = StyleSheet.create({
  wrap:  { marginBottom: 8 },
  label: {
    fontSize: 9,
    fontWeight: '700',
    color: T.inkFaint,
    textTransform: 'uppercase',
    letterSpacing: 2.5,
    marginBottom: 6,
  },
  rule:  { height: 1, backgroundColor: T.column },
});

// ─── Expandable Claim Card ─────────────────────────────────────────────────────

function ClaimCardRow({ claim }: { claim: Claim }) {
  const [expanded, setExpanded] = useState(false);

  const triggerKey = (claim.triggerType || '').toLowerCase();
  const meta       = TRIGGER_META[triggerKey] ?? TRIGGER_META.default;
  const statusKey  = (claim.status || 'pending').toLowerCase();
  const status     = STATUS_CONFIG[statusKey] ?? STATUS_CONFIG.pending;
  const isPaid     = statusKey === 'paid';

  const fraudColor =
    claim.fraudScore == null  ? T.inkFaint
    : claim.fraudScore < 0.3  ? T.emerald
    : claim.fraudScore < 0.7  ? T.amber
    : '#991b1b';

  return (
    <TouchableOpacity
      style={[styles.claimCard, { borderLeftColor: status.borderColor }]}
      onPress={() => setExpanded((v) => !v)}
      activeOpacity={0.75}
    >
      {/* Top row */}
      <View style={styles.claimRow}>
        {/* Left: date + event name */}
        <View style={styles.claimLeft}>
          <Text style={styles.claimDate}>{formatDate(claim.createdAt)}</Text>
          <Text style={styles.claimLabel}>{meta.emoji} {meta.label}</Text>
        </View>
        {/* Right: amount */}
        <Text style={[
          styles.claimAmount,
          { color: isPaid ? T.emerald : T.ink },
        ]}>
          {formatCurrency(claim.finalPayout)}
        </Text>
      </View>

      {/* Bottom row */}
      <View style={styles.claimBottomRow}>
        <View style={[styles.statusBadge, { backgroundColor: status.badgeBg }]}>
          {isPaid && <Text style={[styles.statusBadgeText, { color: status.badgeText }]}>✓ </Text>}
          <Text style={[styles.statusBadgeText, { color: status.badgeText }]}>
            {status.label}
          </Text>
        </View>
        <TouchableOpacity activeOpacity={0.7} onPress={() => {}}>
          <Text style={styles.receiptLink}>Receipt →</Text>
        </TouchableOpacity>
      </View>

      {/* Expand indicator */}
      <Text style={styles.expandIndicator}>{expanded ? '×' : '→'}</Text>

      {/* Expanded details */}
      {expanded && (
        <View style={styles.claimDetails}>
          <View style={styles.detailDivider} />
          <DetailLine
            label="Disrupted Hours"
            value={claim.disruptedHours != null ? `${claim.disruptedHours} hrs` : '—'}
          />
          <DetailLine
            label="Shift Multiplier"
            value={claim.shiftMultiplier != null ? `×${claim.shiftMultiplier}` : '—'}
          />
          <DetailLine
            label="Fraud Score"
            value={claim.fraudScore != null ? `${(claim.fraudScore * 100).toFixed(0)}%` : '—'}
            valueColor={fraudColor}
          />
          {claim.shiftLabel ? <DetailLine label="Shift" value={claim.shiftLabel} /> : null}
        </View>
      )}
    </TouchableOpacity>
  );
}

function DetailLine({
  label, value, valueColor,
}: { label: string; value: string; valueColor?: string }) {
  return (
    <View style={styles.detailLine}>
      <Text style={styles.detailLineLabel}>{label}</Text>
      <Text style={[styles.detailLineValue, valueColor ? { color: valueColor } : undefined]}>
        {value}
      </Text>
    </View>
  );
}

// ─── Amber Monsoon Banner ──────────────────────────────────────────────────────

function AmberBanner() {
  return (
    <View style={styles.amberBanner}>
      <View style={styles.amberBannerRule} />
      <View style={styles.amberBannerContent}>
        <Text style={styles.amberBannerTitle}>Monsoon Protection Active</Text>
        <Text style={styles.amberBannerSubtext}>
          Automatic payouts triggered if rainfall exceeds 15mm/hr
        </Text>
      </View>
    </View>
  );
}

// ─── Screen ────────────────────────────────────────────────────────────────────

export default function ClaimsScreen() {
  const { worker, claims, claimSummary, isLoadingClaims, setLoading, setError, setClaims } =
    useStore();
  const [filter, setFilter]         = useState('All');
  const [refreshing, setRefreshing] = useState(false);

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

  const filteredClaims = claims.filter((c) => {
    if (filter === 'All') return true;
    return c.status === filter.toLowerCase();
  });

  const renderClaim  = ({ item, index }: { item: Claim; index: number }) => (
    <>
      {/* Insert amber banner after index 1 (between 2nd and 3rd items) */}
      {index === 2 && <AmberBanner />}
      <ClaimCardRow claim={item} />
    </>
  );
  const keyExtractor = (item: Claim) => item.id;

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>

      {/* ── Masthead ────────────────────────────────────────────────────────── */}
      <View style={styles.masthead}>
        <View style={styles.mastheadLeft}>
          <View style={styles.mastheadRule} />
          <View style={styles.mastheadText}>
            <Text style={styles.mastheadBrand}>INSURX</Text>
            <Text style={styles.mastheadSub}>PAYOUTS</Text>
          </View>
        </View>
        <View style={styles.avatarCircle}>
          <Text style={styles.avatarInitial}>
            {(worker?.name?.[0] || 'W').toUpperCase()}
          </Text>
        </View>
      </View>

      {/* 1px column rule under masthead */}
      <View style={styles.mastheadDivider} />

      {/* ── Scrollable Content ──────────────────────────────────────────────── */}
      {isLoadingClaims && claims.length === 0 ? (
        <View style={styles.loading}>
          <ActivityIndicator color={T.ink} size="large" />
        </View>
      ) : (
        <FlatList
          data={filteredClaims}
          renderItem={renderClaim}
          keyExtractor={keyExtractor}
          contentContainerStyle={styles.list}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              tintColor={T.ink}
              colors={[T.ink]}
            />
          }
          ListHeaderComponent={
            <>
              {/* Page title */}
              <View style={styles.pageTitleBlock}>
                <Text style={styles.pageTitle}>History</Text>
                <View style={styles.pageTitleRule} />
              </View>

              {/* Summary 2-column */}
              <View style={styles.summaryRow}>
                {/* Left: total received */}
                <View style={styles.summaryCol}>
                  <SectionHead label="Total Received" />
                  <Text style={styles.summaryAmountEmerald}>
                    {claimSummary?.totalProtected
                      ? formatCurrency(claimSummary.totalProtected)
                      : '₹0'}
                  </Text>
                </View>

                {/* Vertical rule */}
                <View style={styles.summaryColumnRule} />

                {/* Right: settled */}
                <View style={styles.summaryCol}>
                  <SectionHead label="Settled" />
                  <Text style={styles.summaryCountInk}>
                    {claimSummary?.claimsSettled ?? 0}
                  </Text>
                </View>
              </View>

              {/* 1px divider */}
              <View style={styles.sectionDivider} />

              {/* Filter chips */}
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.filterRow}
                style={styles.filterScroll}
              >
                {FILTER_OPTIONS.map((opt) => (
                  <TouchableOpacity
                    key={opt}
                    style={[styles.filterChip, filter === opt && styles.filterChipActive]}
                    onPress={() => setFilter(opt)}
                    activeOpacity={0.75}
                  >
                    <Text
                      style={[
                        styles.filterChipText,
                        filter === opt && styles.filterChipTextActive,
                      ]}
                    >
                      {opt}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </>
          }
          ListEmptyComponent={
            <View style={styles.empty}>
              <Text style={styles.emptySymbol}>◈</Text>
              <Text style={styles.emptyTitle}>No claims yet</Text>
              <Text style={styles.emptySubtext}>
                Claims are auto-created when disruptions hit your zone
              </Text>
            </View>
          }
          ListFooterComponent={
            <View style={styles.supportSection}>
              <View style={styles.supportDivider} />
              <Text style={styles.supportText}>
                Didn't receive a payout for an event?
              </Text>
              <TouchableOpacity style={styles.supportButton} activeOpacity={0.75}>
                <Text style={styles.supportButtonText}>Contact Support</Text>
              </TouchableOpacity>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}

// ─── Styles ────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: T.paper },

  // ── Masthead
  masthead: {
    backgroundColor: T.paper,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 14,
    paddingBottom: 14,
  },
  mastheadLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  mastheadRule: {
    width: 3,
    height: 36,
    backgroundColor: T.ink,
    borderRadius: 1,
  },
  mastheadText: {
    gap: 2,
  },
  mastheadBrand: {
    fontSize: 18,
    fontWeight: '900',
    color: T.ink,
    letterSpacing: 4,
    includeFontPadding: false,
  },
  mastheadSub: {
    fontSize: 11,
    color: T.inkFaint,
    fontWeight: '600',
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  avatarCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: T.ink,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitial: {
    fontSize: 14,
    fontWeight: '700',
    color: T.paper,
    includeFontPadding: false,
  },
  mastheadDivider: {
    height: 1,
    backgroundColor: T.column,
  },

  // ── Page title
  pageTitleBlock: {
    paddingTop: 24,
    marginBottom: 24,
  },
  pageTitle: {
    fontSize: 32,
    fontWeight: '900',
    color: T.ink,
    letterSpacing: -1,
    includeFontPadding: false,
    marginBottom: 10,
  },
  pageTitleRule: {
    height: 1,
    backgroundColor: T.column,
  },

  // ── Summary row
  summaryRow: {
    flexDirection: 'row',
    marginBottom: 20,
    backgroundColor: T.surface,
    borderRadius: 6,
    overflow: 'hidden',
  },
  summaryCol: {
    flex: 1,
    padding: 18,
  },
  summaryColumnRule: {
    width: 1,
    backgroundColor: T.column,
    marginVertical: 14,
  },
  summaryAmountEmerald: {
    fontSize: 28,
    fontWeight: '900',
    color: T.emerald,
    letterSpacing: -1,
    includeFontPadding: false,
  },
  summaryCountInk: {
    fontSize: 28,
    fontWeight: '900',
    color: T.ink,
    letterSpacing: -1,
    includeFontPadding: false,
  },

  sectionDivider: {
    height: 1,
    backgroundColor: T.column,
    marginBottom: 16,
  },

  // ── Filter chips
  filterScroll: { marginBottom: 20 },
  filterRow: {
    gap: 8,
    flexDirection: 'row',
    paddingBottom: 4,
  },
  filterChip: {
    height: 32,
    paddingHorizontal: 14,
    borderRadius: 4,
    backgroundColor: T.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterChipActive:     { backgroundColor: T.ink },
  filterChipText:       { fontSize: 13, color: T.inkFaint, fontWeight: '500' },
  filterChipTextActive: { color: T.paper, fontWeight: '600' },

  loading: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  list:    { paddingHorizontal: 20, paddingTop: 0, paddingBottom: 40 },

  // ── Claim card
  claimCard: {
    backgroundColor: T.white,
    borderRadius: 6,
    marginBottom: 8,
    padding: 16,
    borderLeftWidth: 3,
    position: 'relative',
  },
  claimRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  claimLeft: { flex: 1, paddingRight: 12 },
  claimDate: {
    fontSize: 11,
    color: T.inkFaint,
    marginBottom: 3,
    letterSpacing: 0.2,
  },
  claimLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: T.ink,
    letterSpacing: -0.2,
  },
  claimAmount: {
    fontSize: 20,
    fontWeight: '900',
    letterSpacing: -0.5,
    includeFontPadding: false,
  },
  expandIndicator: {
    position: 'absolute',
    top: 16,
    right: 16,
    fontSize: 14,
    color: T.inkFaint,
    fontWeight: '400',
  },

  // Bottom row
  claimBottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: T.column,
  },
  statusBadge: {
    flexDirection: 'row',
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    alignItems: 'center',
  },
  statusBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  receiptLink: {
    fontSize: 12,
    fontWeight: '700',
    color: T.inkMid,
    letterSpacing: 0.2,
  },

  // ── Expanded details
  claimDetails: { marginTop: 10 },
  detailDivider: {
    height: 1,
    backgroundColor: T.column,
    marginBottom: 10,
  },
  detailLine: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 5,
    borderBottomWidth: 1,
    borderBottomColor: T.column,
  },
  detailLineLabel: { fontSize: 12, color: T.inkFaint, fontWeight: '400' },
  detailLineValue: { fontSize: 12, fontWeight: '700', color: T.ink },

  // ── Amber monsoon banner
  amberBanner: {
    backgroundColor: T.amberBg,
    borderRadius: 6,
    marginBottom: 8,
    flexDirection: 'row',
    overflow: 'hidden',
  },
  amberBannerRule: {
    width: 4,
    backgroundColor: T.amberRule,
  },
  amberBannerContent: {
    flex: 1,
    padding: 14,
    gap: 4,
  },
  amberBannerTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: T.amber,
    letterSpacing: 0.1,
  },
  amberBannerSubtext: {
    fontSize: 12,
    color: T.amber,
    lineHeight: 17,
    fontWeight: '400',
    opacity: 0.85,
  },

  // ── Empty state
  empty: {
    alignItems: 'center',
    paddingVertical: 64,
    paddingHorizontal: 32,
    gap: 12,
  },
  emptySymbol: {
    fontSize: 48,
    color: T.column,
    includeFontPadding: false,
    fontWeight: '300',
  },
  emptyTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: T.ink,
    textAlign: 'center',
    letterSpacing: -0.3,
  },
  emptySubtext: {
    fontSize: 13,
    color: T.inkFaint,
    textAlign: 'center',
    lineHeight: 20,
  },

  // ── Support section
  supportSection: {
    alignItems: 'center',
    paddingVertical: 24,
    gap: 14,
  },
  supportDivider: {
    width: '100%',
    height: 1,
    backgroundColor: T.column,
    marginBottom: 4,
  },
  supportText: {
    fontSize: 13,
    color: T.inkFaint,
    textAlign: 'center',
  },
  supportButton: {
    backgroundColor: T.surface,
    borderRadius: 4,
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  supportButtonText: {
    fontSize: 13,
    fontWeight: '700',
    color: T.ink,
    letterSpacing: 0.2,
  },
});
