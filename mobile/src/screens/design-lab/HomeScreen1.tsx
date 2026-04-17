// DESIGN LAB - HomeScreen1
// "DARK PREMIUM" — Robinhood / Binance aesthetic. Dark, confident, glowing.

import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  Animated,
  Easing,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import useStore from '../../store/useStore';
import { formatCurrency } from '../../utils/formatters';

// ─── Design Tokens ────────────────────────────────────────────────────────────
const C = {
  bg:            '#080c14',
  cardBg:        '#111827',
  border:        'rgba(255,255,255,0.06)',
  green:         '#22c55e',
  blue:          '#6366f1',
  textPrimary:   '#f8fafc',
  textMuted:     'rgba(255,255,255,0.45)',
  textFaint:     'rgba(255,255,255,0.25)',
  danger:        '#ef4444',
  greenBg:       'rgba(34,197,94,0.12)',
  greenBorder:   'rgba(34,197,94,0.25)',
  blueBg:        'rgba(99,102,241,0.15)',
  blueBorder:    'rgba(99,102,241,0.3)',
  dangerBg:      'rgba(239,68,68,0.1)',
  dangerBorder:  'rgba(239,68,68,0.25)',
};

interface Props {
  navigation: any;
}

// ─── Pulsing Dot Component ────────────────────────────────────────────────────
function PulsingDot({ color }: { color: string }) {
  const scale = useRef(new Animated.Value(1)).current;
  const opacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.parallel([
          Animated.timing(scale, {
            toValue: 1.8,
            duration: 900,
            easing: Easing.out(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(opacity, {
            toValue: 0,
            duration: 900,
            easing: Easing.out(Easing.ease),
            useNativeDriver: true,
          }),
        ]),
        Animated.parallel([
          Animated.timing(scale, {
            toValue: 1,
            duration: 0,
            useNativeDriver: true,
          }),
          Animated.timing(opacity, {
            toValue: 1,
            duration: 0,
            useNativeDriver: true,
          }),
        ]),
        Animated.delay(300),
      ])
    );
    pulse.start();
    return () => pulse.stop();
  }, []);

  return (
    <View style={{ width: 12, height: 12, alignItems: 'center', justifyContent: 'center' }}>
      <Animated.View
        style={{
          position: 'absolute',
          width: 12,
          height: 12,
          borderRadius: 6,
          backgroundColor: color,
          transform: [{ scale }],
          opacity,
        }}
      />
      <View style={{ width: 7, height: 7, borderRadius: 4, backgroundColor: color }} />
    </View>
  );
}

// ─── Main Screen ──────────────────────────────────────────────────────────────
export default function HomeScreen1({ navigation }: Props) {
  const {
    worker,
    activePolicy,
    claimSummary,
    weather,
    activeTriggers,
    isLoadingPolicy,
  } = useStore();

  const isZoneSafe = activeTriggers.length === 0;
  const firstName = worker?.name?.split(' ')[0] ?? 'Partner';
  const zone = worker?.zone ?? 'Delhi-NCR';

  const aqiValue = weather?.aqi ?? 0;
  const rainValue = weather?.rainfall_mm_per_hr ?? 0;

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <StatusBar barStyle="light-content" backgroundColor={C.bg} />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >

        {/* ── 1. Header ────────────────────────────────────────────── */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={styles.headerShield}>🛡</Text>
            <Text style={styles.headerBrand}>InsurX</Text>
          </View>
          <View style={styles.headerRight}>
            <View style={styles.namePill}>
              <View style={styles.liveIndicatorDot} />
              <Text style={styles.namePillText}>{firstName}</Text>
            </View>
          </View>
        </View>

        {/* ── 2. Hero Earnings Block ───────────────────────────────── */}
        <View style={styles.heroBlock}>
          <Text style={styles.heroLabel}>TOTAL PROTECTED</Text>
          <Text style={styles.heroAmount}>
            {formatCurrency(claimSummary.totalProtected)}
          </Text>
          <Text style={styles.heroSub}>
            {claimSummary.claimsThisWeek} payouts triggered this week
          </Text>
          <View style={styles.heroDivider} />
        </View>

        {/* ── 3. Policy Card ──────────────────────────────────────── */}
        <View style={styles.section}>
          {isLoadingPolicy ? (
            <View style={[styles.policyCard, styles.policyCardLoading]}>
              <Text style={styles.loadingText}>Loading policy…</Text>
            </View>
          ) : activePolicy ? (
            <View style={styles.policyCard}>
              {/* Top row */}
              <View style={styles.policyTopRow}>
                <Text style={styles.policyTopLabel}>COVERAGE</Text>
                <View style={styles.activeStatusPill}>
                  <Text style={styles.activeStatusText}>● Active</Text>
                </View>
              </View>

              {/* Plan name */}
              <Text style={styles.planName}>{activePolicy.planName}</Text>

              {/* Stats row */}
              <View style={styles.policyStatsRow}>
                <View style={styles.policyStatBox}>
                  <Text style={[styles.policyStatValue, { color: C.blue }]}>
                    {activePolicy.coveragePercent}%
                  </Text>
                  <Text style={styles.policyStatLabel}>Coverage</Text>
                </View>
                <View style={styles.policyStatDivider} />
                <View style={styles.policyStatBox}>
                  <Text style={styles.policyStatValue}>
                    {formatCurrency(activePolicy.maxPayout)}
                  </Text>
                  <Text style={styles.policyStatLabel}>Max Payout</Text>
                </View>
              </View>
            </View>
          ) : (
            <View style={[styles.policyCard, styles.noPolicyCard]}>
              <Text style={styles.noPolicyIcon}>🛡</Text>
              <Text style={styles.noPolicyTitle}>No active plan</Text>
              <Text style={styles.noPolicySubtext}>
                Get protected from ₹29/week
              </Text>
              <TouchableOpacity
                style={styles.noPolicyCTA}
                onPress={() => navigation.navigate('Policy')}
                activeOpacity={0.8}
              >
                <Text style={styles.noPolicyCTAText}>Get Covered →</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* ── 4. Stats Row (Weather) ───────────────────────────────── */}
        <View style={styles.statsRow}>
          {/* Temp */}
          <View style={styles.statCard}>
            <Text style={styles.statValue}>
              {weather?.temp != null ? `${Math.round(weather.temp)}°C` : '--'}
            </Text>
            <Text style={styles.statLabel}>TEMP</Text>
          </View>

          {/* AQI */}
          <View style={styles.statCard}>
            <Text style={[
              styles.statValue,
              aqiValue > 300 ? { color: C.danger } : null,
            ]}>
              {weather?.aqi ?? '--'}
            </Text>
            <Text style={styles.statLabel}>AQI</Text>
          </View>

          {/* Rain/hr */}
          <View style={styles.statCard}>
            <Text style={[
              styles.statValue,
              rainValue > 20 ? { color: C.danger } : null,
            ]}>
              {rainValue}mm
            </Text>
            <Text style={styles.statLabel}>RAIN/HR</Text>
          </View>
        </View>

        {/* ── 5. Disruption Banner (conditional) ──────────────────── */}
        {activeTriggers.length > 0 && (
          <View style={styles.section}>
            <View style={styles.disruptionBanner}>
              <View style={styles.disruptionLeft}>
                <PulsingDot color={C.danger} />
                <Text style={styles.disruptionText}>
                  Disruption Active — Payout Processing
                </Text>
              </View>
              <Text style={styles.disruptionCount}>
                {activeTriggers.length}
              </Text>
            </View>
          </View>
        )}

        {/* ── 6. Zone Status ──────────────────────────────────────── */}
        <View style={styles.section}>
          <View style={styles.zoneCard}>
            <Text style={styles.zoneSectionLabel}>ZONE STATUS</Text>
            <Text style={styles.zoneName}>{zone}</Text>

            <View style={styles.zoneConditionRow}>
              <View style={[
                styles.conditionPill,
                isZoneSafe ? styles.conditionPillSafe : styles.conditionPillAlert,
              ]}>
                <Text style={[
                  styles.conditionPillText,
                  isZoneSafe ? { color: C.green } : { color: C.danger },
                ]}>
                  {isZoneSafe ? '✓ Safe Conditions' : '⚠ Alert Active'}
                </Text>
              </View>
            </View>

            <View style={styles.zoneBottomRow}>
              <View style={styles.zoneBottomItem}>
                <Text style={styles.zoneBottomLabel}>Shift Hours</Text>
                <Text style={styles.zoneBottomValue}>06:42</Text>
              </View>
              <View style={styles.zoneBottomDivider} />
              <View style={styles.zoneBottomItem}>
                <Text style={styles.zoneBottomLabel}>Risk</Text>
                <Text style={[
                  styles.zoneBottomValue,
                  isZoneSafe ? { color: C.green } : { color: C.danger },
                ]}>
                  {isZoneSafe ? 'Low' : 'High'}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* ── 7. Quick Actions ────────────────────────────────────── */}
        <View style={[styles.section, styles.actionsRow]}>
          <TouchableOpacity
            style={styles.actionBtnBlue}
            onPress={() => navigation.navigate('Policy')}
            activeOpacity={0.8}
          >
            <Text style={styles.actionBtnBlueText}>View Policy</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionBtnGreen}
            onPress={() => navigation.navigate('FireDemo')}
            activeOpacity={0.8}
          >
            <Text style={styles.actionBtnGreenText}>Fire Demo</Text>
          </TouchableOpacity>
        </View>

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
    paddingBottom: 40,
  },

  // ── Header ──────────────────────────────────────────────────────────────────
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 20,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
  },
  headerShield: {
    fontSize: 17,
  },
  headerBrand: {
    fontSize: 18,
    fontWeight: '700',
    color: C.textPrimary,
    letterSpacing: 0.4,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  namePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  liveIndicatorDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: C.green,
  },
  namePillText: {
    fontSize: 13,
    fontWeight: '500',
    color: C.textPrimary,
  },

  // ── Hero Earnings ────────────────────────────────────────────────────────────
  heroBlock: {
    paddingHorizontal: 20,
    marginTop: 8,
    marginBottom: 4,
  },
  heroLabel: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.4)',
    textTransform: 'uppercase',
    letterSpacing: 2,
    fontWeight: '600',
  },
  heroAmount: {
    fontSize: 52,
    fontWeight: '800',
    color: C.green,
    letterSpacing: -2,
    includeFontPadding: false,
    marginTop: 6,
    lineHeight: 60,
  },
  heroSub: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.4)',
    marginTop: 4,
    fontWeight: '400',
  },
  heroDivider: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.06)',
    marginTop: 20,
  },

  // ── Section wrapper ──────────────────────────────────────────────────────────
  section: {
    paddingHorizontal: 20,
    marginBottom: 12,
    marginTop: 12,
  },

  // ── Policy Card ──────────────────────────────────────────────────────────────
  policyCard: {
    backgroundColor: C.cardBg,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: C.border,
    padding: 20,
  },
  policyCardLoading: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 36,
  },
  loadingText: {
    color: C.textMuted,
    fontSize: 14,
  },
  policyTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  policyTopLabel: {
    fontSize: 10,
    color: 'rgba(255,255,255,0.35)',
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    fontWeight: '700',
  },
  activeStatusPill: {
    backgroundColor: 'rgba(34,197,94,0.15)',
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  activeStatusText: {
    fontSize: 12,
    color: C.green,
    fontWeight: '700',
  },
  planName: {
    fontSize: 20,
    fontWeight: '700',
    color: C.textPrimary,
    marginTop: 8,
  },
  policyStatsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
  },
  policyStatBox: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
  },
  policyStatValue: {
    fontSize: 32,
    fontWeight: '700',
    color: C.textPrimary,
    includeFontPadding: false,
  },
  policyStatLabel: {
    fontSize: 11,
    color: C.textMuted,
    fontWeight: '500',
  },
  policyStatDivider: {
    width: 1,
    height: 40,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },

  // No policy state
  noPolicyCard: {
    alignItems: 'center',
    paddingVertical: 28,
    gap: 6,
  },
  noPolicyIcon: {
    fontSize: 32,
    marginBottom: 4,
  },
  noPolicyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: C.textPrimary,
  },
  noPolicySubtext: {
    fontSize: 13,
    color: C.textMuted,
    fontWeight: '400',
  },
  noPolicyCTA: {
    marginTop: 12,
    backgroundColor: C.blueBg,
    borderWidth: 1,
    borderColor: C.blueBorder,
    borderRadius: 10,
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  noPolicyCTAText: {
    fontSize: 14,
    fontWeight: '700',
    color: C.blue,
  },

  // ── Stats Row ────────────────────────────────────────────────────────────────
  statsRow: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 10,
    marginBottom: 0,
  },
  statCard: {
    flex: 1,
    backgroundColor: C.cardBg,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: C.border,
    paddingVertical: 14,
    paddingHorizontal: 8,
    alignItems: 'center',
    gap: 5,
  },
  statValue: {
    fontSize: 22,
    fontWeight: '700',
    color: C.textPrimary,
    includeFontPadding: false,
  },
  statLabel: {
    fontSize: 10,
    color: C.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 1,
    fontWeight: '600',
  },

  // ── Disruption Banner ────────────────────────────────────────────────────────
  disruptionBanner: {
    backgroundColor: 'rgba(239,68,68,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(239,68,68,0.25)',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  disruptionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  disruptionText: {
    fontSize: 13,
    color: C.danger,
    fontWeight: '600',
    flex: 1,
  },
  disruptionCount: {
    fontSize: 22,
    fontWeight: '800',
    color: C.danger,
    marginLeft: 8,
  },

  // ── Zone Card ────────────────────────────────────────────────────────────────
  zoneCard: {
    backgroundColor: C.cardBg,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: C.border,
    padding: 18,
  },
  zoneSectionLabel: {
    fontSize: 10,
    color: C.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    fontWeight: '700',
  },
  zoneName: {
    fontSize: 18,
    fontWeight: '700',
    color: C.textPrimary,
    marginTop: 4,
  },
  zoneConditionRow: {
    marginTop: 10,
    flexDirection: 'row',
  },
  conditionPill: {
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 5,
  },
  conditionPillSafe: {
    backgroundColor: 'rgba(34,197,94,0.12)',
  },
  conditionPillAlert: {
    backgroundColor: 'rgba(239,68,68,0.12)',
  },
  conditionPillText: {
    fontSize: 13,
    fontWeight: '700',
  },
  zoneBottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 14,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: C.border,
  },
  zoneBottomItem: {
    flex: 1,
    alignItems: 'center',
    gap: 3,
  },
  zoneBottomLabel: {
    fontSize: 11,
    color: C.textMuted,
    fontWeight: '500',
  },
  zoneBottomValue: {
    fontSize: 16,
    fontWeight: '700',
    color: C.textPrimary,
  },
  zoneBottomDivider: {
    width: 1,
    height: 30,
    backgroundColor: C.border,
  },

  // ── Quick Actions ────────────────────────────────────────────────────────────
  actionsRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 4,
    marginBottom: 24,
  },
  actionBtnBlue: {
    flex: 1,
    height: 48,
    backgroundColor: C.blueBg,
    borderWidth: 1,
    borderColor: C.blueBorder,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionBtnBlueText: {
    fontSize: 14,
    fontWeight: '700',
    color: C.blue,
  },
  actionBtnGreen: {
    flex: 1,
    height: 48,
    backgroundColor: 'rgba(34,197,94,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(34,197,94,0.25)',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionBtnGreenText: {
    fontSize: 14,
    fontWeight: '700',
    color: C.green,
  },
});
