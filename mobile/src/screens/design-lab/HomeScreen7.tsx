// DESIGN LAB - HomeScreen7
// CONCEPT: "MONSOON ZONE" — Weather is the product. The rain IS the trigger.
// Deeply immersive, oceanic, alive. You feel the monsoon.

import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  Animated,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import useStore from '../../store/useStore';
import { formatCurrency } from '../../utils/formatters';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// ─── Design tokens ────────────────────────────────────────────────────────────
const C = {
  bg:       '#0b1929',
  card:     '#0f2237',
  sky:      '#38bdf8',
  skyLow:   'rgba(56,189,248,0.45)',
  skyBdr:   'rgba(56,189,248,0.12)',
  skyBdr3:  'rgba(56,189,248,0.30)',
  orange:   '#fb923c',
  orangeLow:'rgba(251,146,60,0.12)',
  orangeBdr:'rgba(251,146,60,0.30)',
  green:    '#34d399',
  greenLow: 'rgba(52,211,153,0.15)',
  white:    '#f0f9ff',
  muted:    'rgba(240,249,255,0.45)',
  rain:     'rgba(56,189,248,0.60)',
};

// Rain drop x positions
const RAIN_X = [30, 80, 140, 200, 260, 300, 340, 380];
const RAIN_DURATIONS = [1400, 1100, 1700, 1250, 1550, 1050, 1800, 1300];

interface Props {
  navigation: any;
}

// ─── Rain Drop component ──────────────────────────────────────────────────────
function RainDrop({ x, duration }: { x: number; duration: number }) {
  const translateY = useRef(new Animated.Value(-20)).current;

  useEffect(() => {
    // Start each drop at a random offset so they don't all fall together
    const initialOffset = Math.random() * SCREEN_HEIGHT;
    translateY.setValue(-20 - initialOffset);

    Animated.loop(
      Animated.timing(translateY, {
        toValue: SCREEN_HEIGHT + 20,
        duration,
        useNativeDriver: true,
      })
    ).start();
  }, []);

  return (
    <Animated.View
      style={[
        rainStyles.drop,
        {
          left: x,
          transform: [{ translateY }],
        },
      ]}
    />
  );
}

const rainStyles = StyleSheet.create({
  drop: {
    position: 'absolute',
    width: 2,
    height: 12,
    backgroundColor: 'rgba(56,189,248,0.60)',
    borderRadius: 1,
    top: 0,
  },
});

// ─── Main Screen ──────────────────────────────────────────────────────────────
export default function HomeScreen7({ navigation }: Props) {
  const { worker, activePolicy, claimSummary, weather, activeTriggers } = useStore();

  // ── Derived values ───────────────────────────────────────────────────────────
  const totalProtected  = claimSummary?.totalProtected ?? 0;
  const claimsThisWeek  = claimSummary?.claimsThisWeek ?? 0;
  const maxPayout       = activePolicy?.maxPayout ?? 0;
  const coveragePercent = activePolicy
    ? Math.min(Math.round((totalProtected / (maxPayout || 1)) * 100), 100)
    : 0;

  const rainfall  = weather?.rainfall_mm_per_hr ?? 0;
  const temp      = weather ? Math.round(weather.temp) : 0;
  const humidity  = weather?.humidity ?? 0;
  const windSpeed = weather ? Math.round(weather.windSpeed) : 0;
  const zone      = worker?.zone ?? worker?.pincode ?? 'Delhi-NCR';
  const city      = worker?.city ?? weather?.city ?? 'Delhi-NCR';
  const firstName = worker?.name?.split(' ')[0]?.charAt(0)?.toUpperCase() ?? 'R';
  const plan      = activePolicy?.plan ?? null;
  const planName  = activePolicy?.planName ?? (plan ? `${plan.charAt(0).toUpperCase()}${plan.slice(1)}` : 'No Plan');

  // ── Weather condition logic ──────────────────────────────────────────────────
  let weatherEmoji = '☀️';
  let weatherLabel = 'CLEAR';
  let weatherAccent = C.green;
  let payoutStatus = 'standby';
  if (rainfall > 20) {
    weatherEmoji = '⛈';
    weatherLabel = 'HEAVY RAIN';
    weatherAccent = C.orange;
    payoutStatus = 'ACTIVE';
  } else if (rainfall > 5) {
    weatherEmoji = '🌧';
    weatherLabel = 'RAIN';
    weatherAccent = C.sky;
    payoutStatus = 'standby';
  }

  // ── Rain overlay: show when raining or disruption active ────────────────────
  const showRain = rainfall > 5 || (activeTriggers && activeTriggers.length > 0);

  // ── Pulsing green dot ────────────────────────────────────────────────────────
  const dotOpacity = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(dotOpacity, { toValue: 0.2, duration: 900, useNativeDriver: true }),
        Animated.timing(dotOpacity, { toValue: 1, duration: 900, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  return (
    <SafeAreaView style={s.safe} edges={['top']}>
      <StatusBar barStyle="light-content" backgroundColor={C.bg} />

      {/* ── RAIN LAYER (absolutely positioned behind content) ───────────────── */}
      {showRain && (
        <View style={s.rainLayer} pointerEvents="none">
          {RAIN_X.map((x, i) => (
            <RainDrop key={i} x={x} duration={RAIN_DURATIONS[i]} />
          ))}
        </View>
      )}

      {/* ── SCROLLABLE CONTENT ───────────────────────────────────────────────── */}
      <ScrollView
        style={s.scroll}
        contentContainerStyle={s.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* ── HEADER ─────────────────────────────────────────────────────────── */}
        <View style={s.header}>
          <View style={s.headerLeft}>
            <Text style={s.headerBrand}>InsurX</Text>
            <Animated.View style={[s.headerDot, { opacity: dotOpacity }]} />
            <Text style={s.headerSub}>Protected</Text>
          </View>
          <View style={s.avatarCircle}>
            <Text style={s.avatarLetter}>{firstName}</Text>
          </View>
        </View>

        {/* ── WEATHER HERO CARD ──────────────────────────────────────────────── */}
        <View style={s.weatherCard}>
          <View style={s.weatherCardBody}>
            {/* Left: emoji + condition */}
            <View style={s.weatherLeft}>
              <Text style={s.weatherEmoji}>{weatherEmoji}</Text>
              <Text style={[s.weatherCondition, { color: weatherAccent }]}>
                {weatherLabel}
              </Text>
              <Text style={s.weatherPayoutStatus}>
                Automatic payout{' '}
                <Text style={{ color: rainfall > 20 ? C.orange : C.muted }}>
                  {payoutStatus}
                </Text>
              </Text>
            </View>
            {/* Right: zone label */}
            <View style={s.weatherRight}>
              <Text style={s.weatherZone}>{zone}</Text>
              <Text style={s.weatherCity}>{city}</Text>
            </View>
          </View>

          {/* Bottom stats strip */}
          <View style={s.weatherStats}>
            <Text style={s.weatherStatItem}>💧 {humidity}%</Text>
            <Text style={[s.weatherStatSep, { color: C.sky }]}>·</Text>
            <Text style={s.weatherStatItem}>💨 {windSpeed}m/s</Text>
            <Text style={[s.weatherStatSep, { color: C.sky }]}>·</Text>
            <Text style={s.weatherStatItem}>🌡 {temp}°C</Text>
          </View>
        </View>

        {/* ── EARNINGS CARD ──────────────────────────────────────────────────── */}
        <View style={s.earningsCard}>
          <View style={s.earningsRow}>
            {/* Left column */}
            <View style={s.earningsLeft}>
              <Text style={s.earningsLabel}>PROTECTED</Text>
              <Text style={s.earningsValue}>
                ₹{totalProtected.toLocaleString('en-IN')}
              </Text>
            </View>
            {/* Right: payout count */}
            <View style={s.earningsRight}>
              <Text style={s.payoutCount}>{claimsThisWeek}</Text>
              <Text style={s.payoutLabel}>payouts</Text>
            </View>
          </View>
          {/* Progress bar */}
          <View style={s.progressTrack}>
            <View
              style={[
                s.progressFill,
                { width: `${Math.min(coveragePercent, 100)}%` as any },
              ]}
            />
          </View>
        </View>

        {/* ── POLICY STRIP ───────────────────────────────────────────────────── */}
        <View style={s.policyStrip}>
          <View style={s.policyLeft}>
            <Text style={s.policyEmoji}>🛡</Text>
            <Text style={s.policyPlanName}>{planName}</Text>
            {activePolicy && (
              <View style={s.activeBadge}>
                <Text style={s.activeBadgeText}>Active</Text>
              </View>
            )}
          </View>
          <Text style={s.policyCoverage}>{coveragePercent}% coverage</Text>
        </View>

        {/* ── ZONE ALERT (conditional) ───────────────────────────────────────── */}
        {activeTriggers && activeTriggers.length > 0 && (
          <View style={s.zoneAlert}>
            <Text style={s.zoneAlertText}>
              ⚠ Disruption detected — your payout is being processed
            </Text>
          </View>
        )}

        {/* ── ACTION BUTTONS ─────────────────────────────────────────────────── */}
        <View style={s.actionRow}>
          <TouchableOpacity
            style={s.btnPrimary}
            onPress={() => navigation.navigate('Policy')}
            activeOpacity={0.85}
          >
            <Text style={s.btnPrimaryText}>View Policy</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={s.btnSecondary}
            onPress={() => navigation.navigate('Claims')}
            activeOpacity={0.85}
          >
            <Text style={s.btnSecondaryText}>History</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#0b1929',
  },
  rainLayer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1,
    pointerEvents: 'none',
  } as any,
  scroll: {
    flex: 1,
    zIndex: 2,
  },
  scrollContent: {
    paddingBottom: 48,
  },

  // ── HEADER ──────────────────────────────────────────────────────────────────
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  headerBrand: {
    fontSize: 18,
    fontWeight: '700',
    color: '#f0f9ff',
  },
  headerDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: '#34d399',
  },
  headerSub: {
    fontSize: 12,
    color: '#38bdf8',
    fontWeight: '500',
  },
  avatarCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(56,189,248,0.15)',
    borderWidth: 1,
    borderColor: 'rgba(56,189,248,0.30)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarLetter: {
    fontSize: 14,
    fontWeight: '700',
    color: '#f0f9ff',
  },

  // ── WEATHER HERO CARD ────────────────────────────────────────────────────────
  weatherCard: {
    marginHorizontal: 16,
    marginBottom: 12,
    backgroundColor: '#0f2237',
    borderRadius: 20,
    padding: 24,
    borderWidth: 1,
    borderColor: 'rgba(56,189,248,0.15)',
  },
  weatherCardBody: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  weatherLeft: {
    flex: 1,
  },
  weatherEmoji: {
    fontSize: 56,
    lineHeight: 66,
    marginBottom: 4,
  },
  weatherCondition: {
    fontSize: 22,
    fontWeight: '700',
    color: '#f0f9ff',
    marginBottom: 4,
  },
  weatherPayoutStatus: {
    fontSize: 12,
    color: 'rgba(240,249,255,0.45)',
    fontWeight: '400',
  },
  weatherRight: {
    alignItems: 'flex-end',
  },
  weatherZone: {
    fontSize: 18,
    fontWeight: '700',
    color: '#38bdf8',
  },
  weatherCity: {
    fontSize: 13,
    color: 'rgba(240,249,255,0.45)',
    marginTop: 2,
  },
  weatherStats: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(56,189,248,0.10)',
    gap: 8,
  },
  weatherStatItem: {
    fontSize: 13,
    fontWeight: '700',
    color: '#f0f9ff',
  },
  weatherStatSep: {
    fontSize: 16,
    fontWeight: '300',
  },

  // ── EARNINGS CARD ────────────────────────────────────────────────────────────
  earningsCard: {
    marginHorizontal: 16,
    marginBottom: 12,
    backgroundColor: '#0f2237',
    borderRadius: 20,
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderWidth: 1,
    borderColor: 'rgba(56,189,248,0.12)',
  },
  earningsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: 14,
  },
  earningsLeft: {
    flex: 1,
  },
  earningsLabel: {
    fontSize: 10,
    color: '#38bdf8',
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 2,
    marginBottom: 4,
  },
  earningsValue: {
    fontSize: 40,
    fontWeight: '700',
    color: '#f0f9ff',
    letterSpacing: -1,
    lineHeight: 48,
  },
  earningsRight: {
    alignItems: 'flex-end',
  },
  payoutCount: {
    fontSize: 32,
    fontWeight: '700',
    color: '#34d399',
    lineHeight: 38,
  },
  payoutLabel: {
    fontSize: 11,
    color: 'rgba(240,249,255,0.45)',
    marginTop: 2,
  },
  progressTrack: {
    height: 3,
    backgroundColor: 'rgba(56,189,248,0.15)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: 3,
    backgroundColor: '#38bdf8',
    borderRadius: 2,
  },

  // ── POLICY STRIP ─────────────────────────────────────────────────────────────
  policyStrip: {
    marginHorizontal: 16,
    marginBottom: 12,
    backgroundColor: '#0f2237',
    borderRadius: 16,
    paddingHorizontal: 18,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: 'rgba(56,189,248,0.12)',
  },
  policyLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  policyEmoji: {
    fontSize: 20,
  },
  policyPlanName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#f0f9ff',
  },
  activeBadge: {
    backgroundColor: 'rgba(52,211,153,0.15)',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  activeBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#34d399',
  },
  policyCoverage: {
    fontSize: 16,
    fontWeight: '700',
    color: '#38bdf8',
  },

  // ── ZONE ALERT ───────────────────────────────────────────────────────────────
  zoneAlert: {
    marginHorizontal: 16,
    marginBottom: 12,
    backgroundColor: 'rgba(251,146,60,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(251,146,60,0.30)',
    borderRadius: 16,
    padding: 16,
  },
  zoneAlertText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#fb923c',
  },

  // ── ACTIONS ──────────────────────────────────────────────────────────────────
  actionRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginBottom: 24,
    gap: 12,
  },
  btnPrimary: {
    flex: 1,
    height: 52,
    backgroundColor: '#38bdf8',
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnPrimaryText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0b1929',
  },
  btnSecondary: {
    flex: 1,
    height: 52,
    backgroundColor: '#0f2237',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(56,189,248,0.20)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnSecondaryText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#38bdf8',
  },
});
