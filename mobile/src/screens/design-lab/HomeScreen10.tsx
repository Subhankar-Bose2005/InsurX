import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import useStore from '../../store/useStore';
import { formatCurrency } from '../../utils/formatters';

// ─── Design tokens ────────────────────────────────────────────────────────────
const C = {
  bg:         '#0a1f0e',
  headerBg:   '#061309',
  card:       '#0f2813',
  gold:       '#f5c518',
  green:      '#22c55e',
  white:      '#f5f5f0',
  muted:      'rgba(245,245,240,0.45)',
  danger:     '#ef4444',
  border:     'rgba(245,197,24,0.15)',
  goldBorder: 'rgba(245,197,24,0.20)',
  goldTint08: 'rgba(245,197,24,0.08)',
  goldTint30: 'rgba(245,197,24,0.30)',
  goldTint50: 'rgba(245,197,24,0.50)',
  goldTint60: 'rgba(245,197,24,0.60)',
  green15:    'rgba(34,197,94,0.15)',
  danger10:   'rgba(239,68,68,0.10)',
};

// ─── Live blinking dot ────────────────────────────────────────────────────────
function LiveDot() {
  const opacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 0.2, duration: 600, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 1,   duration: 600, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  return (
    <Animated.View
      style={{
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: C.danger,
        opacity,
      }}
    />
  );
}

// ─── Section divider (1px gold/20) ────────────────────────────────────────────
function GoldDivider() {
  return <View style={styles.goldDivider} />;
}

// ─── Vertical rule between scoreboard bottom cells ────────────────────────────
function VRule() {
  return <View style={styles.vRule} />;
}

interface Props {
  navigation: any;
}

export default function HomeScreen10({ navigation }: Props) {
  const { worker, activePolicy, claimSummary, weather, activeTriggers } = useStore();

  // ── Derived values ──────────────────────────────────────────────────────────
  const totalProtected   = claimSummary?.totalProtected ?? 0;
  const claimsThisWeek   = claimSummary?.claimsThisWeek ?? claimSummary?.totalClaims ?? 0;
  const maxPayout        = activePolicy?.maxPayout ?? 0;
  const coveragePercent  = activePolicy
    ? Math.min(Math.round((totalProtected / (maxPayout || 1)) * 100), 100)
    : 0;

  const temp        = weather ? Math.round(weather.temp) : 0;
  const aqi         = weather ? weather.aqi : 0;
  const rain        = weather ? (weather.rainfall_mm_per_hr ?? 0) : 0;
  const city        = worker?.city || worker?.zone || 'Delhi-NCR';
  const weatherMain = weather
    ? rain > 30
      ? 'Heavy Rain'
      : temp > 43
      ? 'Extreme Heat'
      : aqi > 300
      ? 'Poor AQI'
      : 'Clear'
    : 'Clear';

  const weatherEmoji = rain > 30
    ? '🌧'
    : temp > 43
    ? '🔥'
    : aqi > 300
    ? '😷'
    : '☀️';

  const hasAlerts = activeTriggers && activeTriggers.length > 0;
  const isActive  = !!activePolicy;
  const planName  = activePolicy?.planName
    || (activePolicy?.plan
      ? `${activePolicy.plan.charAt(0).toUpperCase() + activePolicy.plan.slice(1)} Plan`
      : 'No Active Plan');

  // Wall-clock for the scoreboard header
  const now     = new Date();
  const clockHH = now.getHours();
  const clockMM = String(now.getMinutes()).padStart(2, '0');

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <StatusBar barStyle="light-content" backgroundColor={C.headerBg} />

      {/* ── HEADER: scoreboard broadcast bar ──────────────────────────────── */}
      <View style={styles.header}>
        {/* Left: brand + tag */}
        <View style={styles.headerLeft}>
          <Text style={styles.headerBrand}>InsurX</Text>
          <Text style={styles.headerSep}> · </Text>
          <Text style={styles.headerTag}>LIVE COVERAGE</Text>
        </View>

        {/* Center: animated live indicator */}
        <View style={styles.headerLive}>
          <LiveDot />
          <Text style={styles.headerLiveText}>LIVE</Text>
        </View>

        {/* Right: clock */}
        <Text style={styles.headerClock}>{clockHH}:{clockMM}</Text>
      </View>

      {/* ── TITLE BAND: gold tint ─────────────────────────────────────────── */}
      <View style={styles.titleBand}>
        <Text style={styles.titleBandLeft}>EARNINGS PROTECTED</Text>
        <Text style={styles.titleBandRight}>
          ZONE: {worker?.zone || 'DELHI-NCR'}
        </Text>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >

        {/* ── SCOREBOARD HERO ───────────────────────────────────────────────── */}
        <View style={styles.heroCard}>
          {/* Top section — big number */}
          <View style={styles.heroTop}>
            <Text style={styles.heroLabel}>TOTAL PROTECTED</Text>
            <Text style={styles.heroAmount}>
              ₹{totalProtected.toLocaleString('en-IN')}
            </Text>
            <Text style={styles.heroSub}>
              ({claimsThisWeek} automatic payout{claimsThisWeek !== 1 ? 's' : ''})
            </Text>
          </View>

          <GoldDivider />

          {/* Bottom section — 3-column scoreboard row */}
          <View style={styles.heroBottom}>
            <View style={styles.heroCell}>
              <Text style={styles.heroCellLabel}>COVERAGE</Text>
              <Text style={styles.heroCellValueWhite}>{coveragePercent}%</Text>
            </View>

            <VRule />

            <View style={styles.heroCell}>
              <Text style={styles.heroCellLabel}>MAX PAYOUT</Text>
              <Text style={styles.heroCellValueGreen}>
                ₹{maxPayout ? `${(maxPayout / 1000).toFixed(0)}K` : '0K'}
              </Text>
            </View>

            <VRule />

            <View style={styles.heroCell}>
              <Text style={styles.heroCellLabel}>CLAIMS</Text>
              <Text style={styles.heroCellValueWhite}>{claimsThisWeek}</Text>
            </View>
          </View>
        </View>

        {/* ── BATTING / IN PLAY section heading ─────────────────────────────── */}
        <View style={styles.sectionHeadRow}>
          <View style={styles.sectionHeadBorder}>
            <Text style={styles.sectionHeadText}>POLICY STATUS</Text>
          </View>
        </View>

        {/* ── POLICY CARD ───────────────────────────────────────────────────── */}
        <View style={styles.card}>
          {/* Row 1: plan + status badge */}
          <View style={styles.policyRow}>
            <Text style={styles.policyShield}>🛡</Text>
            <Text style={styles.policyPlanName}>{planName}</Text>
            <View
              style={[
                styles.statusPill,
                isActive ? styles.statusPillActive : styles.statusPillInactive,
              ]}
            >
              <Text
                style={[
                  styles.statusPillText,
                  isActive ? styles.statusPillTextActive : styles.statusPillTextInactive,
                ]}
              >
                {isActive ? 'ACTIVE' : 'INACTIVE'}
              </Text>
            </View>
          </View>

          {/* Row 2: next payout */}
          <View style={styles.payoutRow}>
            <Text style={styles.payoutLabel}>Next payout</Text>
            <Text style={styles.payoutValue}>Monday 6:00 AM</Text>
          </View>
        </View>

        {/* ── PITCH REPORT (weather) ────────────────────────────────────────── */}
        <View style={styles.pitchSection}>
          <Text style={styles.pitchSectionLabel}>◆ PITCH REPORT</Text>

          <View style={styles.card}>
            {/* Main weather row */}
            <View style={styles.pitchMainRow}>
              <Text style={styles.pitchEmoji}>{weatherEmoji}</Text>
              <View style={styles.pitchTextStack}>
                <Text style={styles.pitchCity}>{city}</Text>
                <Text style={styles.pitchCondition}>{weatherMain}</Text>
                <Text
                  style={[
                    styles.pitchTriggerLine,
                    hasAlerts ? styles.pitchTriggerAlert : styles.pitchTriggerSafe,
                  ]}
                >
                  {hasAlerts
                    ? '⚡ ALERT — Payout triggered'
                    : '✓ Playing conditions normal'}
                </Text>
              </View>
            </View>

            {/* Stats row */}
            <View style={styles.pitchStatsRow}>
              <Text style={styles.pitchStat}>🌡 {temp}°C</Text>
              <View style={styles.pitchStatDivider} />
              <Text style={styles.pitchStat}>💧 {aqi} AQI</Text>
              <View style={styles.pitchStatDivider} />
              <Text style={styles.pitchStat}>🌧 {rain}mm</Text>
            </View>
          </View>
        </View>

        {/* ── SCORE TICKER: disruption alert ───────────────────────────────── */}
        {hasAlerts && (
          <View style={styles.ticker}>
            <Text style={styles.tickerText}>
              ⚡ WICKET! DISRUPTION DETECTED — AUTOMATIC PAYOUT PROCESSING
            </Text>
          </View>
        )}

        {/* ── ACTION ROW ───────────────────────────────────────────────────── */}
        <View style={styles.actionRow}>
          <TouchableOpacity
            style={styles.actionPrimary}
            onPress={() => navigation.navigate('Policy')}
            activeOpacity={0.8}
          >
            <Text style={styles.actionPrimaryText}>VIEW SCORECARD</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionSecondary}
            onPress={() => navigation.navigate('DesignLab')}
            activeOpacity={0.8}
          >
            <Text style={styles.actionSecondaryText}>FIRE TRIGGER</Text>
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
    backgroundColor: C.bg,
  },

  // ── Header ─────────────────────────────────────────────────────────────────
  header: {
    backgroundColor: C.headerBg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerBrand: {
    fontSize: 16,
    fontWeight: '700',
    color: C.gold,
    letterSpacing: 1,
  },
  headerSep: {
    fontSize: 14,
    color: 'rgba(245,197,24,0.40)',
    fontWeight: '400',
  },
  headerTag: {
    fontSize: 12,
    fontWeight: '700',
    color: C.gold,
    letterSpacing: 1,
  },
  headerLive: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  headerLiveText: {
    fontSize: 11,
    fontWeight: '700',
    color: C.danger,
    letterSpacing: 2,
  },
  headerClock: {
    fontSize: 14,
    fontWeight: '700',
    color: C.gold,
    fontVariant: ['tabular-nums'],
  },

  // ── Title band ─────────────────────────────────────────────────────────────
  titleBand: {
    backgroundColor: C.goldTint08,
    borderTopWidth: 1,
    borderTopColor: C.goldTint30,
    borderBottomWidth: 1,
    borderBottomColor: C.goldTint30,
    paddingHorizontal: 16,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  titleBandLeft: {
    flex: 1,
    fontSize: 10,
    fontWeight: '700',
    color: C.goldTint60,
    textTransform: 'uppercase',
    letterSpacing: 2,
  },
  titleBandRight: {
    fontSize: 10,
    fontWeight: '600',
    color: C.goldTint60,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },

  // ── Scroll ─────────────────────────────────────────────────────────────────
  scroll: {
    flex: 1,
    backgroundColor: C.bg,
  },
  scrollContent: {
    paddingBottom: 40,
  },

  // ── Shared card ────────────────────────────────────────────────────────────
  card: {
    marginHorizontal: 12,
    marginBottom: 10,
    backgroundColor: C.card,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: C.goldBorder,
    overflow: 'hidden',
  },

  // ── Gold divider ───────────────────────────────────────────────────────────
  goldDivider: {
    height: 1,
    backgroundColor: 'rgba(245,197,24,0.20)',
  },

  // ── Vertical rule ──────────────────────────────────────────────────────────
  vRule: {
    width: 1,
    backgroundColor: 'rgba(245,197,24,0.20)',
    alignSelf: 'stretch',
  },

  // ── Hero scoreboard card ───────────────────────────────────────────────────
  heroCard: {
    marginHorizontal: 12,
    marginTop: 10,
    marginBottom: 10,
    backgroundColor: C.card,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: C.goldBorder,
    overflow: 'hidden',
  },
  heroTop: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
  },
  heroLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: C.goldTint50,
    textTransform: 'uppercase',
    letterSpacing: 2,
    marginBottom: 4,
  },
  heroAmount: {
    fontSize: 50,
    fontWeight: '900',
    color: C.gold,
    letterSpacing: -2,
    lineHeight: 56,
  },
  heroSub: {
    fontSize: 12,
    color: 'rgba(245,245,240,0.50)',
    fontWeight: '400',
    marginTop: 2,
  },
  heroBottom: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  heroCell: {
    flex: 1,
    alignItems: 'center',
  },
  heroCellLabel: {
    fontSize: 9,
    fontWeight: '700',
    color: C.goldTint50,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 4,
  },
  heroCellValueWhite: {
    fontSize: 22,
    fontWeight: '700',
    color: C.white,
  },
  heroCellValueGreen: {
    fontSize: 22,
    fontWeight: '700',
    color: C.green,
  },

  // ── Section heading (batting strip) ────────────────────────────────────────
  sectionHeadRow: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 6,
  },
  sectionHeadBorder: {
    borderLeftWidth: 3,
    borderLeftColor: C.gold,
    paddingLeft: 10,
  },
  sectionHeadText: {
    fontSize: 11,
    fontWeight: '700',
    color: C.gold,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },

  // ── Policy card internals ──────────────────────────────────────────────────
  policyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 14,
    gap: 10,
  },
  policyShield: {
    fontSize: 20,
  },
  policyPlanName: {
    flex: 1,
    fontSize: 16,
    fontWeight: '700',
    color: C.white,
  },
  statusPill: {
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  statusPillActive: {
    backgroundColor: 'rgba(34,197,94,0.15)',
  },
  statusPillInactive: {
    backgroundColor: 'rgba(239,68,68,0.10)',
  },
  statusPillText: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  statusPillTextActive: {
    color: C.green,
  },
  statusPillTextInactive: {
    color: C.danger,
  },
  payoutRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 14,
  },
  payoutLabel: {
    fontSize: 12,
    color: C.muted,
    fontWeight: '400',
  },
  payoutValue: {
    fontSize: 12,
    fontWeight: '700',
    color: C.gold,
  },

  // ── Pitch report ───────────────────────────────────────────────────────────
  pitchSection: {
    paddingHorizontal: 12,
    marginBottom: 0,
  },
  pitchSectionLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: C.gold,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginLeft: 4,
    marginBottom: 8,
    paddingTop: 4,
  },
  pitchMainRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 16,
    gap: 14,
  },
  pitchEmoji: {
    fontSize: 36,
    lineHeight: 42,
  },
  pitchTextStack: {
    flex: 1,
    gap: 2,
  },
  pitchCity: {
    fontSize: 15,
    fontWeight: '700',
    color: C.white,
  },
  pitchCondition: {
    fontSize: 12,
    color: C.muted,
    fontWeight: '400',
  },
  pitchTriggerLine: {
    fontSize: 12,
    fontWeight: '700',
    marginTop: 4,
  },
  pitchTriggerAlert: {
    color: C.danger,
  },
  pitchTriggerSafe: {
    color: C.green,
  },
  pitchStatsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: 'rgba(245,197,24,0.15)',
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 0,
  },
  pitchStat: {
    flex: 1,
    fontSize: 12,
    fontWeight: '700',
    color: C.white,
    textAlign: 'center',
  },
  pitchStatDivider: {
    width: 1,
    height: 14,
    backgroundColor: 'rgba(245,197,24,0.30)',
  },

  // ── Score ticker (disruption) ──────────────────────────────────────────────
  ticker: {
    backgroundColor: '#d42b2b',
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginBottom: 10,
  },
  tickerText: {
    fontSize: 12,
    fontWeight: '700',
    color: C.white,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },

  // ── Action row ─────────────────────────────────────────────────────────────
  actionRow: {
    flexDirection: 'row',
    gap: 10,
    paddingHorizontal: 12,
    marginBottom: 24,
    marginTop: 4,
  },
  actionPrimary: {
    flex: 1,
    height: 52,
    backgroundColor: C.gold,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionPrimaryText: {
    fontSize: 14,
    fontWeight: '700',
    color: C.headerBg,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  actionSecondary: {
    flex: 1,
    height: 52,
    backgroundColor: C.card,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: C.goldTint30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionSecondaryText: {
    fontSize: 14,
    fontWeight: '700',
    color: C.gold,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
});
