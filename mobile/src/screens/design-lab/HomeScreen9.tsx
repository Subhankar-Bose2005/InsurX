/**
 * HomeScreen9 — AURORA GLASS
 * Deep space background with colorful aurora orbs glowing behind frosted glass cards.
 * Ultra-premium luxury insurance — Northern Lights through a glass window.
 */

import React, { useEffect, useRef } from 'react';
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

// ─── Design tokens ────────────────────────────────────────────────────────────
const C = {
  bg:      '#03060f',
  white:   '#f8fafc',
  muted:   'rgba(248,250,252,0.45)',
  teal:    '#2dd4bf',
  purple:  '#a78bfa',
  green:   '#4ade80',
  red:     '#f87171',
  // Glass
  glassBg:     'rgba(255,255,255,0.06)',
  glassBorder: 'rgba(255,255,255,0.10)',
};

interface Props {
  navigation: any;
}

// ─── Component ────────────────────────────────────────────────────────────────
export default function HomeScreen9({ navigation }: Props) {
  const { worker, activePolicy, claimSummary, weather, activeTriggers } = useStore();

  // ── Aurora pulse animation on orb 1
  const auroraScale = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(auroraScale, {
          toValue: 1.15,
          duration: 2000,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(auroraScale, {
          toValue: 1,
          duration: 2000,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ])
    );
    pulse.start();
    return () => pulse.stop();
  }, []);

  // ── Derived data
  const totalProtected  = claimSummary?.totalProtected ?? 0;
  const claimsThisWeek  = claimSummary?.claimsThisWeek ?? 0;
  const maxPayout       = activePolicy?.maxPayout ?? null;
  const coveragePercent = activePolicy
    ? Math.min(Math.round((totalProtected / (maxPayout || 1)) * 100), 100)
    : 0;

  const temp     = weather ? Math.round(weather.temp) : null;
  const aqi      = weather ? weather.aqi : null;
  const rain     = weather ? Math.round(weather.rainfall_mm_per_hr) : null;
  const hasAlert = activeTriggers && activeTriggers.length > 0;

  // Weather condition label + pill color
  const weatherCondition = weather
    ? weather.rainfall_mm_per_hr > 20
      ? 'Heavy Rain'
      : weather.temp > 43
      ? 'Extreme Heat'
      : weather.weatherMain || 'Clear'
    : 'Loading';
  const conditionColor = weather?.rainfall_mm_per_hr > 20 || weather?.temp > 43
    ? 'rgba(239,68,68,0.15)'
    : 'rgba(74,222,128,0.15)';
  const conditionTextColor = weather?.rainfall_mm_per_hr > 20 || weather?.temp > 43
    ? C.red
    : C.green;

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor={C.bg} translucent />

      {/* ── Aurora orbs — rendered first, behind everything ──────────────── */}
      <View style={StyleSheet.absoluteFill}>
        <View style={{ ...StyleSheet.absoluteFillObject, overflow: 'hidden' }}>
          {/* Orb 1 — indigo/purple — animated */}
          <Animated.View
            style={[
              styles.orb1,
              { transform: [{ scale: auroraScale }] },
            ]}
          />
          {/* Orb 2 — teal */}
          <View style={styles.orb2} />
          {/* Orb 3 — violet */}
          <View style={styles.orb3} />
          {/* Orb 4 — cyan */}
          <View style={styles.orb4} />
        </View>
      </View>

      {/* ── Content on top of orbs ────────────────────────────────────────── */}
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >

          {/* ── Header ──────────────────────────────────────────────────────── */}
          <View style={styles.header}>
            <Text style={styles.headerBrand}>✦ InsurX</Text>
            <View style={styles.shieldPill}>
              <Text style={styles.shieldPillText}>● Shielded</Text>
            </View>
          </View>

          {/* ── Hero earnings ───────────────────────────────────────────────── */}
          <View style={styles.heroSection}>
            {/* Subtle glow behind the number */}
            <View style={styles.heroGlow} />
            <Text style={styles.heroLabel}>EARNINGS PROTECTED</Text>
            <Text style={styles.heroValue}>
              ₹{totalProtected.toLocaleString('en-IN')}
            </Text>
            <Text style={styles.heroSub}>
              {claimsThisWeek} event{claimsThisWeek !== 1 ? 's' : ''} triggered
            </Text>
          </View>

          {/* ── Policy glass card ───────────────────────────────────────────── */}
          <View style={[styles.glassCard, styles.mx16, styles.mb12]}>
            <Text style={styles.cardLabel}>COVERAGE</Text>

            {/* Plan row */}
            <View style={styles.policyRow}>
              <View style={styles.policyLeft}>
                <Text style={styles.planName}>
                  {activePolicy?.planName || (activePolicy?.plan
                    ? `${activePolicy.plan.charAt(0).toUpperCase()}${activePolicy.plan.slice(1)} Plan`
                    : 'No Active Plan')}
                </Text>
                {activePolicy && (
                  <View style={styles.activeBadge}>
                    <Text style={styles.activeBadgeText}>Active ✦</Text>
                  </View>
                )}
              </View>
              <Text style={styles.coveragePercent}>{coveragePercent}%</Text>
            </View>

            {/* Divider */}
            <View style={styles.divider} />

            {/* Max payout row */}
            <View style={styles.payoutRow}>
              <Text style={styles.payoutLabel}>Max Payout</Text>
              <Text style={styles.payoutValue}>
                {maxPayout != null ? `₹${maxPayout.toLocaleString('en-IN')}` : '—'}
              </Text>
            </View>
          </View>

          {/* ── Zone glass card ─────────────────────────────────────────────── */}
          <View style={[styles.glassCard, styles.mx16, styles.mb12]}>
            {/* Header row */}
            <View style={styles.zoneHeader}>
              <Text style={styles.zoneName}>
                {(worker?.zone || 'Delhi-NCR')}
              </Text>
              <View style={[styles.conditionPill, { backgroundColor: conditionColor }]}>
                <Text style={[styles.conditionText, { color: conditionTextColor }]}>
                  {weatherCondition}
                </Text>
              </View>
            </View>

            {/* Stats pills */}
            <View style={styles.statsPillRow}>
              <View style={styles.statPill}>
                <Text style={styles.statPillValue}>🌡 {temp != null ? `${temp}°C` : '--'}</Text>
                <Text style={styles.statPillLabel}>Temp</Text>
              </View>
              <View style={styles.statPill}>
                <Text style={styles.statPillValue}>💨 {aqi != null ? `AQI ${aqi}` : '--'}</Text>
                <Text style={styles.statPillLabel}>Air Quality</Text>
              </View>
              <View style={styles.statPill}>
                <Text style={styles.statPillValue}>🌧 {rain != null ? `${rain}mm` : '--'}</Text>
                <Text style={styles.statPillLabel}>Rainfall</Text>
              </View>
            </View>
          </View>

          {/* ── Disruption glass card ───────────────────────────────────────── */}
          {hasAlert && (
            <View style={[styles.glassCard, styles.mx16, styles.mb12, styles.disruptionCard]}>
              <Text style={styles.disruptionText}>
                ⚡ Active disruption — payout triggered
              </Text>
            </View>
          )}

          {/* ── Action row ──────────────────────────────────────────────────── */}
          <View style={[styles.actionRow, styles.mx16, styles.mb24]}>
            <TouchableOpacity
              style={[styles.actionBtn, styles.actionBtnTeal]}
              onPress={() => navigation.navigate('Policy')}
              activeOpacity={0.75}
            >
              <Text style={styles.actionBtnWhiteText}>View Policy</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionBtn, styles.actionBtnPurple]}
              onPress={() => console.log('demo')}
              activeOpacity={0.75}
            >
              <Text style={styles.actionBtnPurpleText}>Fire Demo</Text>
            </TouchableOpacity>
          </View>

          {/* ── Bottom spacer ───────────────────────────────────────────────── */}
          <View style={{ height: 16 }} />

        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: C.bg,
  },
  safeArea: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 0,
  },

  // ── Aurora orbs
  orb1: {
    position: 'absolute',
    width: 280,
    height: 280,
    borderRadius: 140,
    backgroundColor: 'rgba(99,102,241,0.35)',
    top: -80,
    left: -60,
  },
  orb2: {
    position: 'absolute',
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: 'rgba(20,184,166,0.25)',
    top: 160,
    right: -40,
  },
  orb3: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: 'rgba(168,85,247,0.20)',
    top: 300,
    left: 80,
  },
  orb4: {
    position: 'absolute',
    width: 240,
    height: 240,
    borderRadius: 120,
    backgroundColor: 'rgba(6,182,212,0.20)',
    bottom: 200,
    right: -60,
  },

  // ── Header
  header: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerBrand: {
    fontSize: 16,
    fontWeight: '700',
    color: C.white,
    letterSpacing: -0.3,
  },
  shieldPill: {
    backgroundColor: 'rgba(45,212,191,0.15)',
    borderWidth: 1,
    borderColor: 'rgba(45,212,191,0.30)',
    borderRadius: 28,
    paddingHorizontal: 12,
    paddingVertical: 5,
  },
  shieldPillText: {
    fontSize: 12,
    fontWeight: '700',
    color: C.teal,
  },

  // ── Hero earnings
  heroSection: {
    paddingHorizontal: 20,
    paddingBottom: 16,
    position: 'relative',
  },
  heroGlow: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 80,
    backgroundColor: 'rgba(45,212,191,0.08)',
  },
  heroLabel: {
    fontSize: 10,
    color: 'rgba(248,250,252,0.40)',
    letterSpacing: 2.5,
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  heroValue: {
    fontSize: 52,
    fontWeight: '800',
    color: C.white,
    letterSpacing: -2,
    includeFontPadding: false,
  },
  heroSub: {
    fontSize: 13,
    color: C.teal,
    marginTop: 4,
  },

  // ── Glass card base
  glassCard: {
    backgroundColor: C.glassBg,
    borderWidth: 1,
    borderColor: C.glassBorder,
    borderRadius: 20,
    padding: 16,
  },
  mx16: {
    marginHorizontal: 16,
  },
  mb12: {
    marginBottom: 12,
  },
  mb24: {
    marginBottom: 24,
  },

  // ── Card section label
  cardLabel: {
    fontSize: 10,
    color: 'rgba(248,250,252,0.35)',
    letterSpacing: 2,
    textTransform: 'uppercase',
    marginBottom: 10,
  },

  // ── Policy card
  policyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  policyLeft: {
    flex: 1,
    gap: 6,
  },
  planName: {
    fontSize: 18,
    fontWeight: '700',
    color: C.white,
  },
  activeBadge: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(45,212,191,0.15)',
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 3,
  },
  activeBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: C.teal,
  },
  coveragePercent: {
    fontSize: 36,
    fontWeight: '800',
    color: C.purple,
    letterSpacing: -1,
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.06)',
    marginVertical: 12,
  },
  payoutRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  payoutLabel: {
    fontSize: 12,
    color: C.muted,
  },
  payoutValue: {
    fontSize: 18,
    fontWeight: '700',
    color: C.white,
  },

  // ── Zone card
  zoneHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  zoneName: {
    fontSize: 16,
    fontWeight: '700',
    color: C.white,
  },
  conditionPill: {
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  conditionText: {
    fontSize: 12,
    fontWeight: '600',
  },
  statsPillRow: {
    flexDirection: 'row',
    gap: 8,
  },
  statPill: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 8,
    alignItems: 'center',
    gap: 4,
  },
  statPillValue: {
    fontSize: 13,
    fontWeight: '700',
    color: C.white,
  },
  statPillLabel: {
    fontSize: 10,
    color: C.muted,
  },

  // ── Disruption card
  disruptionCard: {
    backgroundColor: 'rgba(239,68,68,0.10)',
    borderColor: 'rgba(239,68,68,0.25)',
  },
  disruptionText: {
    fontSize: 13,
    fontWeight: '700',
    color: C.white,
  },

  // ── Action row
  actionRow: {
    flexDirection: 'row',
    gap: 12,
  },
  actionBtn: {
    flex: 1,
    height: 52,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: C.glassBg,
    borderWidth: 1,
  },
  actionBtnTeal: {
    borderColor: 'rgba(45,212,191,0.30)',
  },
  actionBtnPurple: {
    borderColor: 'rgba(167,139,250,0.30)',
  },
  actionBtnWhiteText: {
    fontSize: 14,
    fontWeight: '700',
    color: C.white,
  },
  actionBtnPurpleText: {
    fontSize: 14,
    fontWeight: '700',
    color: C.purple,
  },
});
