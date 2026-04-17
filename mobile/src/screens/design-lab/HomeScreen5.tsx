import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import useStore from '../../store/useStore';
import { formatCurrency } from '../../utils/formatters';

// ─── Design tokens ────────────────────────────────────────────────────────────
const C = {
  bg:        '#eef2ff',
  headerBg:  '#1e1b4b',
  card:      '#FFFFFF',
  primary:   '#4f46e5',
  green:     '#059669',
  amber:     '#d97706',
  red:       '#dc2626',
  text:      '#111827',
  muted:     '#6b7280',
  border:    '#e5e7eb',
  surfaceLow:'#f9fafb',
  indigo100: '#e0e7ff',
};

interface Props {
  navigation: any;
}

export default function HomeScreen5({ navigation }: Props) {
  const { worker, activePolicy, claimSummary, weather, activeTriggers } = useStore();

  // Derived values
  const totalProtected    = claimSummary?.totalProtected ?? 0;
  const claimsThisWeek   = claimSummary?.claimsThisWeek ?? claimSummary?.totalClaims ?? 0;
  const maxPayout        = activePolicy?.maxPayout ?? 0;
  const coveragePercent  = activePolicy ? Math.min(Math.round((totalProtected / (maxPayout || 1)) * 100), 100) : 0;

  const temp = weather ? Math.round(weather.temp) : 0;
  const aqi  = weather ? weather.aqi : 0;
  const rain = weather ? weather.rainfall_mm_per_hr : 0;
  const isHighRisk = activeTriggers && activeTriggers.length > 0;

  // Weekly premium lookup by plan
  const premiumMap: Record<string, string> = {
    basic:    '₹29/wk',
    standard: '₹59/wk',
    premium:  '₹99/wk',
  };
  const weeklyPremium = activePolicy?.plan
    ? premiumMap[activePolicy.plan.toLowerCase()] ?? '—'
    : '—';

  // Policy expiry display
  const expiryStr = activePolicy?.endDate
    ? new Date(activePolicy.endDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })
    : '—';

  // Bar chart heights (Mon-Sun, last 7 days, hardcoded for design)
  const barHeights = [28, 42, 18, 55, 38, 60, 45];
  const dayLabels  = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
  const todayIndex = new Date().getDay(); // 0=Sun..6=Sat => map to Mon=0 via (day+6)%7
  const todayMon   = (new Date().getDay() + 6) % 7;

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <StatusBar barStyle="light-content" backgroundColor={C.headerBg} />

      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.headerBrand}>InsurX</Text>
          <Text style={styles.headerSep}>|</Text>
          <Text style={styles.headerName}>
            {worker?.name?.split(' ')[0] ?? 'Rider'}
          </Text>
        </View>
        <View style={styles.livePill}>
          <View style={styles.liveDot} />
          <Text style={styles.liveText}>LIVE</Text>
        </View>
      </View>

      {/* ── Summary bar ───────────────────────────────────────────────────── */}
      <View style={styles.summaryBar}>
        <Text style={styles.summaryItem}>
          PROTECTED: ₹{totalProtected.toLocaleString('en-IN')}
        </Text>
        <View style={styles.summaryDivider} />
        <Text style={styles.summaryItem}>
          CLAIMS: {claimsThisWeek}
        </Text>
        <View style={styles.summaryDivider} />
        <Text style={[styles.summaryItem, { color: C.primary }]}>
          PLAN: {activePolicy?.plan?.toUpperCase() || 'NONE'}
        </Text>
      </View>

      {/* ── Scrollable content ────────────────────────────────────────────── */}
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >

        {/* ── a) Policy card ──────────────────────────────────────────────── */}
        <View style={styles.card}>
          {/* Header row */}
          <View style={styles.cardHeaderRow}>
            <Text style={styles.cardSectionLabel}>ACTIVE POLICY</Text>
            <View style={styles.activeBadge}>
              <Text style={styles.activeBadgeText}>Active</Text>
            </View>
          </View>

          {/* Plan name */}
          <Text style={styles.planName}>
            {activePolicy?.planName || (activePolicy?.plan
              ? `${activePolicy.plan.charAt(0).toUpperCase() + activePolicy.plan.slice(1)} Plan`
              : 'No Active Plan')}
          </Text>

          {/* Coverage progress */}
          <View style={styles.progressRow}>
            <Text style={styles.progressLabel}>{coveragePercent}% COVERED</Text>
            <View style={styles.progressTrack}>
              <View style={[styles.progressFill, { width: `${coveragePercent}%` as any }]} />
            </View>
          </View>

          {/* 2x2 grid */}
          <View style={styles.policyGrid}>
            <View style={styles.policyGridCell}>
              <Text style={styles.gridCellLabel}>Max Payout</Text>
              <Text style={styles.gridCellValue}>₹{maxPayout.toLocaleString('en-IN')}</Text>
            </View>
            <View style={styles.policyGridCell}>
              <Text style={styles.gridCellLabel}>Weekly Premium</Text>
              <Text style={styles.gridCellValue}>{weeklyPremium}</Text>
            </View>
            <View style={styles.policyGridCell}>
              <Text style={styles.gridCellLabel}>Status</Text>
              <Text style={[styles.gridCellValue, { color: C.green }]}>Active ●</Text>
            </View>
            <View style={styles.policyGridCell}>
              <Text style={styles.gridCellLabel}>Expires</Text>
              <Text style={styles.gridCellValue}>{expiryStr}</Text>
            </View>
          </View>
        </View>

        {/* ── b) Earnings mini chart ──────────────────────────────────────── */}
        <View style={styles.card}>
          <Text style={styles.cardSectionLabel}>EARNINGS BREAKDOWN</Text>

          <View style={styles.barChartContainer}>
            {barHeights.map((h, i) => (
              <View key={i} style={styles.barColumn}>
                <View
                  style={[
                    styles.bar,
                    {
                      height: h,
                      backgroundColor: i <= todayMon ? C.primary : C.indigo100,
                    },
                  ]}
                />
                <Text style={styles.barLabel}>{dayLabels[i]}</Text>
              </View>
            ))}
          </View>

          <Text style={styles.chartTotal}>
            ₹{totalProtected.toLocaleString('en-IN')} protected
          </Text>
        </View>

        {/* ── c) Zone & Weather ────────────────────────────────────────────── */}
        <View style={styles.card}>
          <View style={styles.zoneHeaderRow}>
            <Text style={styles.zoneTitle}>
              ZONE: {worker?.zone || worker?.city || 'Delhi-NCR'}
            </Text>
            <Text style={styles.zoneMuted}>
              {weather
                ? (weather.rainfall_mm_per_hr > 20
                    ? 'Heavy Rain'
                    : weather.temp > 43
                    ? 'Extreme Heat'
                    : 'Clear')
                : 'Loading...'}
            </Text>
          </View>

          <View style={styles.weatherGrid}>
            {/* TEMP */}
            <View style={styles.weatherCell}>
              <Text style={styles.weatherCellLabel}>TEMP</Text>
              <Text style={[styles.weatherCellValue, temp > 43 && { color: C.red }]}>
                {temp}°C
              </Text>
            </View>
            {/* AQI */}
            <View style={styles.weatherCell}>
              <Text style={styles.weatherCellLabel}>AQI</Text>
              <Text style={[styles.weatherCellValue, aqi > 300 && { color: C.red }]}>
                {aqi}
              </Text>
            </View>
            {/* RAIN */}
            <View style={styles.weatherCell}>
              <Text style={styles.weatherCellLabel}>RAIN</Text>
              <Text style={[styles.weatherCellValue, rain > 20 && { color: C.red }]}>
                {rain}mm/hr
              </Text>
            </View>
            {/* RISK */}
            <View style={styles.weatherCell}>
              <Text style={styles.weatherCellLabel}>RISK</Text>
              <Text
                style={[
                  styles.weatherCellValue,
                  { color: isHighRisk ? C.red : C.green },
                ]}
              >
                {isHighRisk ? 'High' : 'Low'}
              </Text>
            </View>
          </View>
        </View>

        {/* ── d) Disruption alert (only if triggers active) ────────────────── */}
        {activeTriggers && activeTriggers.length > 0 && (
          <View style={styles.alertCard}>
            <Text style={styles.alertTitle}>⚠ ACTIVE DISRUPTION</Text>
            <Text style={styles.alertBody}>
              {activeTriggers.map((t: any) => t.type || t.triggerType || 'Weather Event').join(' • ')}
            </Text>
          </View>
        )}

        {/* ── e) Action strip ──────────────────────────────────────────────── */}
        <View style={styles.actionStrip}>
          <TouchableOpacity
            style={styles.actionBtnPrimary}
            onPress={() => navigation.navigate('Policy')}
            activeOpacity={0.8}
          >
            <Text style={styles.actionBtnPrimaryText}>Policy</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionBtnSecondary}
            onPress={() => navigation.navigate('Claims')}
            activeOpacity={0.8}
          >
            <Text style={styles.actionBtnSecondaryText}>History</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionBtnDashed}
            onPress={() => navigation.navigate('DesignLab')}
            activeOpacity={0.8}
          >
            <Text style={styles.actionBtnDashedText}>⚙ Demo</Text>
          </TouchableOpacity>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#1e1b4b',
  },

  // Header
  header: {
    height: 56,
    backgroundColor: '#1e1b4b',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerBrand: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  headerSep: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.20)',
  },
  headerName: {
    fontSize: 14,
    fontWeight: '400',
    color: 'rgba(255,255,255,0.60)',
  },
  livePill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(16,185,129,0.20)',
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 5,
    gap: 5,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#34d399',
  },
  liveText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#34d399',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },

  // Summary bar
  summaryBar: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  summaryItem: {
    fontSize: 13,
    fontWeight: '700',
    color: '#111827',
    flex: 1,
    textAlign: 'center',
  },
  summaryDivider: {
    width: 1,
    height: 16,
    backgroundColor: '#e5e7eb',
  },

  // Scroll
  scroll: {
    flex: 1,
    backgroundColor: '#eef2ff',
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 40,
  },

  // Shared card
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },

  // Card section label (uppercase muted)
  cardSectionLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#6b7280',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },

  // Policy card
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  activeBadge: {
    backgroundColor: '#d1fae5',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  activeBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#059669',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  planName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    marginTop: 6,
  },
  progressRow: {
    marginTop: 12,
    gap: 6,
  },
  progressLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#6b7280',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  progressTrack: {
    height: 4,
    backgroundColor: '#e5e7eb',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: 4,
    backgroundColor: '#4f46e5',
    borderRadius: 2,
  },
  policyGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 12,
    gap: 8,
  },
  policyGridCell: {
    width: '47%',
    backgroundColor: '#f9fafb',
    borderRadius: 8,
    padding: 10,
    gap: 3,
  },
  gridCellLabel: {
    fontSize: 11,
    color: '#6b7280',
    fontWeight: '500',
  },
  gridCellValue: {
    fontSize: 15,
    fontWeight: '700',
    color: '#111827',
  },

  // Bar chart
  barChartContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    marginTop: 12,
    marginBottom: 4,
    height: 70,
  },
  barColumn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 4,
    marginHorizontal: 2,
  },
  bar: {
    width: '100%',
    borderTopLeftRadius: 3,
    borderTopRightRadius: 3,
  },
  barLabel: {
    fontSize: 10,
    color: '#6b7280',
    fontWeight: '500',
  },
  chartTotal: {
    fontSize: 13,
    fontWeight: '700',
    color: '#4f46e5',
    marginTop: 8,
  },

  // Zone & weather
  zoneHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  zoneTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#111827',
  },
  zoneMuted: {
    fontSize: 13,
    color: '#6b7280',
    fontWeight: '400',
  },
  weatherGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 10,
    gap: 6,
  },
  weatherCell: {
    width: '47%',
    backgroundColor: '#f9fafb',
    borderRadius: 8,
    padding: 10,
    gap: 3,
  },
  weatherCellLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#6b7280',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  weatherCellValue: {
    fontSize: 14,
    fontWeight: '700',
    color: '#111827',
  },

  // Disruption alert
  alertCard: {
    backgroundColor: '#fef2f2',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: '#fecaca',
    marginBottom: 10,
    gap: 4,
  },
  alertTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#dc2626',
  },
  alertBody: {
    fontSize: 12,
    color: '#6b7280',
    fontWeight: '400',
  },

  // Action strip
  actionStrip: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 10,
  },
  actionBtnPrimary: {
    flex: 1,
    height: 44,
    backgroundColor: '#4f46e5',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionBtnPrimaryText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  actionBtnSecondary: {
    flex: 1,
    height: 44,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  actionBtnSecondaryText: {
    color: '#111827',
    fontSize: 13,
    fontWeight: '500',
  },
  actionBtnDashed: {
    flex: 1,
    height: 44,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderStyle: 'dashed',
  },
  actionBtnDashedText: {
    color: '#4f46e5',
    fontSize: 13,
    fontWeight: '600',
  },
});
