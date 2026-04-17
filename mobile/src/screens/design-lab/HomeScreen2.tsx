// DESIGN LAB - HomeScreen2
// "EDITORIAL CLEAN" — Fi Money / N26 / Monzo aesthetic. Pure white, massive type, radical negative space.

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

// ─── Design Tokens ────────────────────────────────────────────────────────────
const C = {
  bg:           '#FFFFFF',
  surface:      '#F7F7F7',
  textPrimary:  '#0a0a0a',
  textSecondary:'#6b7280',
  green:        '#16a34a',
  blue:         '#1d4ed8',
  divider:      '#f0f0f0',
  danger:       '#dc2626',
  dangerBg:     '#fef2f2',
  dangerBorder: '#fecaca',
  greenBg:      '#dcfce7',
  blueSurface:  '#f0f7ff',
  alertOrange:  '#d97706',
  alertOrangeBg:'#fffbeb',
};

interface Props {
  navigation: any;
}

// ─── Avatar Initials Helper ────────────────────────────────────────────────────
function getInitials(name: string | null | undefined): string {
  if (!name) return '?';
  const parts = name.trim().split(' ').filter(Boolean);
  if (parts.length === 1) return parts[0][0].toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

// ─── Two-column grid cell ──────────────────────────────────────────────────────
function GridCell({
  label,
  value,
  valueColor,
}: {
  label: string;
  value: string;
  valueColor?: string;
}) {
  return (
    <View style={gridStyles.cell}>
      <Text style={gridStyles.label}>{label}</Text>
      <Text style={[gridStyles.value, valueColor ? { color: valueColor } : null]}>
        {value}
      </Text>
    </View>
  );
}

const gridStyles = StyleSheet.create({
  cell: {
    flex: 1,
    backgroundColor: C.surface,
    borderRadius: 12,
    padding: 16,
    gap: 6,
  },
  label: {
    fontSize: 11,
    color: C.textSecondary,
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  value: {
    fontSize: 24,
    fontWeight: '700',
    color: C.textPrimary,
    includeFontPadding: false,
  },
});

// ─── Zone Row ──────────────────────────────────────────────────────────────────
function ZoneRow({
  label,
  right,
}: {
  label: string;
  right: React.ReactNode;
}) {
  return (
    <View style={zoneRowStyles.row}>
      <Text style={zoneRowStyles.label}>{label}</Text>
      {right}
    </View>
  );
}

const zoneRowStyles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
  },
  label: {
    fontSize: 13,
    color: C.textSecondary,
    fontWeight: '400',
  },
});

// ─── Main Screen ──────────────────────────────────────────────────────────────
export default function HomeScreen2({ navigation }: Props) {
  const {
    worker,
    activePolicy,
    claimSummary,
    weather,
    activeTriggers,
  } = useStore();

  const firstName = worker?.name?.split(' ')[0] ?? 'Partner';
  const initials = getInitials(worker?.name);
  const zone = worker?.zone ?? 'Delhi-NCR';
  const isZoneSafe = activeTriggers.length === 0;
  const aqiValue = weather?.aqi ?? 0;

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={C.bg} />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >

        {/* ── 1. Header ────────────────────────────────────────────── */}
        <View style={styles.header}>
          <Text style={styles.headerBrand}>INSURX</Text>
          <View style={styles.avatarCircle}>
            <Text style={styles.avatarInitials}>{initials}</Text>
          </View>
        </View>

        {/* ── 2. Hero Section ─────────────────────────────────────── */}
        <View style={styles.heroSection}>
          <Text style={styles.heroSubheading}>Your Protection</Text>
          <Text style={styles.heroAmount}>
            {formatCurrency(claimSummary.totalProtected)}
          </Text>
          <Text style={styles.heroPayoutsLine}>
            {claimSummary.claimsThisWeek} payouts this week
          </Text>
          <View style={styles.heroRule} />
        </View>

        {/* ── 3. Plan Banner ──────────────────────────────────────── */}
        <View style={styles.sectionH}>
          <View style={styles.planBanner}>
            <View style={styles.planBannerLeft}>
              <Text style={styles.planShieldEmoji}>🛡</Text>
              <View style={styles.planBannerTextGroup}>
                <Text style={styles.planName}>
                  {activePolicy?.planName ?? 'No Plan'}
                </Text>
                {activePolicy ? (
                  <View style={styles.activeBadge}>
                    <Text style={styles.activeBadgeText}>Active</Text>
                  </View>
                ) : (
                  <View style={styles.inactiveBadge}>
                    <Text style={styles.inactiveBadgeText}>Inactive</Text>
                  </View>
                )}
              </View>
            </View>
            <Text style={styles.planCoverageRight}>
              {activePolicy?.coveragePercent ?? 0}%{'\n'}
              <Text style={styles.planCoverageSubRight}>coverage</Text>
            </Text>
          </View>
        </View>

        {/* ── 4. Stats Grid (2×2) ─────────────────────────────────── */}
        <View style={styles.sectionH}>
          <View style={styles.gridRow}>
            <GridCell
              label="Max Payout"
              value={
                activePolicy?.maxPayout != null
                  ? formatCurrency(activePolicy.maxPayout)
                  : '—'
              }
            />
            <View style={styles.gridGap} />
            <GridCell
              label="Claims"
              value={String(claimSummary.claimsThisWeek)}
            />
          </View>
          <View style={styles.gridRowGap} />
          <View style={styles.gridRow}>
            <GridCell
              label="Temperature"
              value={
                weather?.temp != null
                  ? `${Math.round(weather.temp)}°C`
                  : '--'
              }
            />
            <View style={styles.gridGap} />
            <GridCell
              label="AQI"
              value={weather?.aqi != null ? String(weather.aqi) : '--'}
              valueColor={aqiValue > 300 ? C.danger : undefined}
            />
          </View>
        </View>

        {/* ── 5. Zone Card ────────────────────────────────────────── */}
        <View style={styles.sectionH}>
          <View style={styles.zoneCard}>
            <ZoneRow
              label="Zone"
              right={
                <Text style={styles.zoneValueRight}>{zone}</Text>
              }
            />
            <View style={styles.zoneInternalDivider} />
            <ZoneRow
              label="Conditions"
              right={
                isZoneSafe ? (
                  <View style={styles.conditionPillGreen}>
                    <Text style={styles.conditionPillGreenText}>Clear</Text>
                  </View>
                ) : (
                  <View style={styles.conditionPillOrange}>
                    <Text style={styles.conditionPillOrangeText}>Alert</Text>
                  </View>
                )
              }
            />
            <View style={styles.zoneInternalDivider} />
            <ZoneRow
              label="Rainfall"
              right={
                <Text style={styles.zoneValueRight}>
                  {weather?.rainfall_mm_per_hr ?? 0} mm/hr
                </Text>
              }
            />
          </View>
        </View>

        {/* ── 6. Action Button ────────────────────────────────────── */}
        <View style={styles.sectionH}>
          <TouchableOpacity
            style={styles.ctaButton}
            onPress={() => navigation.navigate('Policy')}
            activeOpacity={0.88}
          >
            <Text style={styles.ctaButtonText}>View Full Policy →</Text>
          </TouchableOpacity>
        </View>

        {/* ── 7. Disruption Banner (conditional) ──────────────────── */}
        {activeTriggers.length > 0 && (
          <View style={[styles.sectionH, styles.sectionBottom]}>
            <View style={styles.disruptionBanner}>
              <Text style={styles.disruptionText}>
                ⚠ Active disruption in your zone — payout processing
              </Text>
            </View>
          </View>
        )}

        <View style={styles.footerSpacer} />

      </ScrollView>
    </SafeAreaView>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: C.bg,
  },
  scroll: {
    flex: 1,
    backgroundColor: C.bg,
  },
  scrollContent: {
    paddingBottom: 0,
  },

  // ── Header ──────────────────────────────────────────────────────────────────
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
  },
  headerBrand: {
    fontSize: 11,
    fontWeight: '700',
    color: C.textSecondary,
    letterSpacing: 3,
    textTransform: 'uppercase',
  },
  avatarCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: C.divider,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitials: {
    fontSize: 14,
    fontWeight: '700',
    color: C.textPrimary,
  },

  // ── Hero Section ─────────────────────────────────────────────────────────────
  heroSection: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 24,
  },
  heroSubheading: {
    fontSize: 14,
    color: C.textSecondary,
    fontWeight: '400',
    marginBottom: 4,
  },
  heroAmount: {
    fontSize: 56,
    fontWeight: '800',
    color: C.textPrimary,
    letterSpacing: -2,
    includeFontPadding: false,
    lineHeight: 64,
  },
  heroPayoutsLine: {
    fontSize: 14,
    fontWeight: '700',
    color: C.green,
    marginTop: 4,
  },
  heroRule: {
    height: 1,
    backgroundColor: C.divider,
    marginTop: 24,
  },

  // ── Section horizontal padding ────────────────────────────────────────────────
  sectionH: {
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  sectionBottom: {
    marginBottom: 8,
  },

  // ── Plan Banner ──────────────────────────────────────────────────────────────
  planBanner: {
    backgroundColor: C.blueSurface,
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  planBannerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  planShieldEmoji: {
    fontSize: 24,
  },
  planBannerTextGroup: {
    gap: 5,
  },
  planName: {
    fontSize: 16,
    fontWeight: '700',
    color: C.textPrimary,
  },
  activeBadge: {
    alignSelf: 'flex-start',
    backgroundColor: C.greenBg,
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  activeBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: C.green,
  },
  inactiveBadge: {
    alignSelf: 'flex-start',
    backgroundColor: C.surface,
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  inactiveBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: C.textSecondary,
  },
  planCoverageRight: {
    fontSize: 20,
    fontWeight: '700',
    color: C.blue,
    textAlign: 'right',
    lineHeight: 24,
  },
  planCoverageSubRight: {
    fontSize: 12,
    fontWeight: '400',
    color: C.textSecondary,
  },

  // ── Stats Grid ───────────────────────────────────────────────────────────────
  gridRow: {
    flexDirection: 'row',
  },
  gridGap: {
    width: 10,
  },
  gridRowGap: {
    height: 10,
  },

  // ── Zone Card ────────────────────────────────────────────────────────────────
  zoneCard: {
    backgroundColor: C.bg,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: C.divider,
    paddingHorizontal: 16,
  },
  zoneInternalDivider: {
    height: 1,
    backgroundColor: C.divider,
  },
  zoneValueRight: {
    fontSize: 16,
    fontWeight: '700',
    color: C.textPrimary,
  },
  conditionPillGreen: {
    backgroundColor: C.greenBg,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  conditionPillGreenText: {
    fontSize: 13,
    fontWeight: '700',
    color: C.green,
  },
  conditionPillOrange: {
    backgroundColor: C.alertOrangeBg,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  conditionPillOrangeText: {
    fontSize: 13,
    fontWeight: '700',
    color: C.alertOrange,
  },

  // ── CTA Button ───────────────────────────────────────────────────────────────
  ctaButton: {
    height: 56,
    backgroundColor: C.textPrimary,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ctaButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },

  // ── Disruption Banner ────────────────────────────────────────────────────────
  disruptionBanner: {
    backgroundColor: C.dangerBg,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: C.dangerBorder,
    padding: 14,
  },
  disruptionText: {
    fontSize: 13,
    fontWeight: '600',
    color: C.danger,
    lineHeight: 19,
  },

  // ── Footer ───────────────────────────────────────────────────────────────────
  footerSpacer: {
    height: 32,
  },
});
