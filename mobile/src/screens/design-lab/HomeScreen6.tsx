// DESIGN LAB - HomeScreen6
// CONCEPT: "AMBER TERMINAL" — Bloomberg terminal meets Indian trading floor.
// Dense, purposeful, electric amber on near-black.

import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  Animated,
  Platform,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import useStore from '../../store/useStore';
import { formatCurrency } from '../../utils/formatters';

const MONO: any =
  Platform.OS === 'ios' ? 'Courier New' : 'monospace';

// ─── Design tokens ────────────────────────────────────────────────────────────
const C = {
  bg:        '#080900',
  cardBg:    '#0f1200',
  amber:     '#fbbf24',
  amberMid:  'rgba(251,191,36,0.70)',
  amberDim:  'rgba(251,191,36,0.45)',
  amberLow:  'rgba(251,191,36,0.30)',
  amberBdr:  'rgba(251,191,36,0.12)',
  green:     '#22c55e',
  red:       '#ef4444',
};

interface Props {
  navigation: any;
}

export default function HomeScreen6({ navigation }: Props) {
  const { worker, activePolicy, claimSummary, weather, activeTriggers } = useStore();

  // ── Derived values ───────────────────────────────────────────────────────────
  const totalProtected  = claimSummary?.totalProtected ?? 0;
  const claimsThisWeek  = claimSummary?.claimsThisWeek ?? 0;
  const maxPayout       = activePolicy?.maxPayout ?? 0;
  const coveragePercent = activePolicy
    ? Math.min(Math.round((totalProtected / (maxPayout || 1)) * 100), 100)
    : 0;
  const plan      = activePolicy?.plan ?? null;
  const status    = activePolicy?.status ?? null;
  const zone      = worker?.zone ?? worker?.pincode ?? null;
  const temp      = weather ? Math.round(weather.temp) : 0;
  const aqi       = weather?.aqi ?? 0;
  const humidity  = weather?.humidity ?? 0;
  const windSpeed = weather ? Math.round(weather.windSpeed) : 0;
  const weatherMain = weather?.weatherMain ?? null;
  const payoutK   = maxPayout > 0 ? `₹${Math.round(maxPayout / 100)}k` : '--';

  // ── Ticker animation ─────────────────────────────────────────────────────────
  const tickerX = useRef(new Animated.Value(0)).current;
  const tickerContent =
    `INSURX LIVE  ●  ₹${totalProtected.toLocaleString('en-IN')} PROTECTED  ●  ` +
    `${coveragePercent}% COVERAGE  ●  PLAN: ${plan?.toUpperCase() ?? 'NONE'}  ●  ` +
    `ZONE: ${zone ?? 'DELHI-NCR'}  ●  AQI: ${aqi || '--'}  ●  `;

  useEffect(() => {
    tickerX.setValue(0);
    Animated.loop(
      Animated.timing(tickerX, {
        toValue: -800,
        duration: 8000,
        useNativeDriver: true,
      })
    ).start();
  }, []);

  // ── Blinking LIVE dot ────────────────────────────────────────────────────────
  const liveDotOpacity = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(liveDotOpacity, { toValue: 0, duration: 300, useNativeDriver: true }),
        Animated.timing(liveDotOpacity, { toValue: 1, duration: 300, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  // ── Helper: status indicator ■ ───────────────────────────────────────────────
  const statusColor = (good: boolean) => ({ color: good ? C.green : C.red });

  return (
    <SafeAreaView style={s.safe} edges={['top']}>
      <StatusBar barStyle="light-content" backgroundColor={C.bg} />

      {/* ── TICKER BAND ──────────────────────────────────────────────────────── */}
      <View style={s.tickerBand}>
        <Animated.View
          style={[s.tickerInner, { transform: [{ translateX: tickerX }] }]}
        >
          <Text style={s.tickerText} numberOfLines={1}>{tickerContent}</Text>
          <Text style={s.tickerText} numberOfLines={1}>{tickerContent}</Text>
        </Animated.View>
      </View>

      {/* ── HEADER ───────────────────────────────────────────────────────────── */}
      <View style={s.header}>
        <View>
          <Text style={s.headerBrand}>[INSURX]</Text>
          <Text style={s.headerVersion}>v2.4.1</Text>
        </View>
        <View style={s.headerRight}>
          <Text style={s.liveLabel}>[LIVE]</Text>
          <Animated.View style={[s.liveDot, { opacity: liveDotOpacity }]} />
        </View>
      </View>
      <View style={s.headerRule} />

      {/* ── SCROLLABLE BODY ──────────────────────────────────────────────────── */}
      <ScrollView
        style={s.scroll}
        contentContainerStyle={s.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* ── HERO DATA BLOCK ────────────────────────────────────────────────── */}
        <View style={s.heroBlock}>
          <Text style={s.heroLabel}>&gt; EARNINGS_PROTECTED</Text>
          <Text style={s.heroValue}>
            ₹{totalProtected.toLocaleString('en-IN')}
          </Text>
          <Text style={s.heroSub}>
            {claimsThisWeek} TRIGGERS_FIRED  |  SHIFT: ACTIVE
          </Text>
          <Text style={s.heroSep}>{'────────────────────────────'}</Text>
        </View>

        {/* ── 6-CELL DATA GRID ───────────────────────────────────────────────── */}
        <View style={s.gridWrap}>
          {/* Row 1 */}
          <View style={s.gridRow}>
            <View style={s.cell}>
              <Text style={s.cellLabel}>PLAN</Text>
              <Text style={s.cellValue}>{plan?.toUpperCase() || 'NONE'}</Text>
            </View>
            <View style={s.cell}>
              <Text style={s.cellLabel}>COVER</Text>
              <Text style={s.cellValue}>{coveragePercent}%</Text>
            </View>
            <View style={s.cell}>
              <Text style={s.cellLabel}>PAYOUT</Text>
              <Text style={s.cellValue}>{payoutK}</Text>
            </View>
          </View>
          {/* Row 2 */}
          <View style={s.gridRow}>
            <View style={s.cell}>
              <Text style={s.cellLabel}>CLAIMS</Text>
              <Text style={s.cellValue}>{claimsThisWeek}</Text>
            </View>
            <View style={s.cell}>
              <Text style={s.cellLabel}>TEMP</Text>
              <Text style={[s.cellValue, temp > 43 && { color: C.red }]}>
                {temp}°C
              </Text>
            </View>
            <View style={s.cell}>
              <Text style={s.cellLabel}>AQI</Text>
              <Text style={[s.cellValue, aqi > 300 && { color: C.red }]}>
                {aqi || '--'}
              </Text>
            </View>
          </View>
        </View>

        {/* ── TERMINAL STATUS BLOCK ──────────────────────────────────────────── */}
        <View style={s.terminalBlock}>
          <Text style={s.terminalHeader}>&gt; STATUS_REPORT</Text>
          <Text style={s.termLine}>
            {'POLICY: '}
            <Text style={statusColor(status === 'active')}>
              {status?.toUpperCase() || 'INACTIVE'}
            </Text>
            {'  '}
            <Text style={statusColor(status === 'active')}>{'■'}</Text>
          </Text>
          <Text style={s.termLine}>
            {'ZONE: '}
            <Text style={statusColor(!!zone)}>
              {zone || 'DELHI-NCR'}
            </Text>
            {'  '}
            <Text style={statusColor(!!zone)}>{'■'}</Text>
          </Text>
          <Text style={s.termLine}>
            {'WEATHER: '}
            <Text style={statusColor(!activeTriggers?.length)}>
              {weatherMain || 'CLEAR'}
            </Text>
            {'  '}
            <Text style={statusColor(!activeTriggers?.length)}>{'■'}</Text>
          </Text>
          <Text style={s.termLine}>
            {'PROTECTION: '}
            <Text style={statusColor(!!activePolicy)}>
              {activePolicy ? 'ENABLED' : 'DISABLED'}
            </Text>
            {'  '}
            <Text style={statusColor(!!activePolicy)}>{'■'}</Text>
          </Text>
        </View>

        {/* ── ALERT BAND (conditional) ───────────────────────────────────────── */}
        {activeTriggers && activeTriggers.length > 0 && (
          <View style={s.alertBand}>
            <Text style={s.alertText}>
              {'!!! DISRUPTION_ACTIVE — PAYOUT_PROCESSING !!!'}
            </Text>
          </View>
        )}

        {/* ── ACTION ROW ─────────────────────────────────────────────────────── */}
        <View style={s.actionRow}>
          <TouchableOpacity
            style={s.btnOutline}
            onPress={() => navigation.navigate('Policy')}
            activeOpacity={0.75}
          >
            <Text style={s.btnOutlineText}>POLICY.VIEW</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={s.btnSolid}
            onPress={() => navigation.navigate('DesignLab')}
            activeOpacity={0.75}
          >
            <Text style={s.btnSolidText}>DEMO.TRIGGER</Text>
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
    backgroundColor: '#080900',
  },

  // ── TICKER ──────────────────────────────────────────────────────────────────
  tickerBand: {
    height: 32,
    backgroundColor: '#fbbf24',
    overflow: 'hidden',
    justifyContent: 'center',
  },
  tickerInner: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  tickerText: {
    fontFamily: MONO,
    fontSize: 11,
    fontWeight: '700',
    color: '#080900',
    letterSpacing: 0.5,
    marginRight: 0,
    width: 800,
  },

  // ── HEADER ──────────────────────────────────────────────────────────────────
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#080900',
  },
  headerBrand: {
    fontFamily: MONO,
    fontSize: 13,
    fontWeight: '700',
    color: '#fbbf24',
    letterSpacing: 0.5,
  },
  headerVersion: {
    fontFamily: MONO,
    fontSize: 10,
    color: 'rgba(251,191,36,0.30)',
    marginTop: 1,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  liveLabel: {
    fontFamily: MONO,
    fontSize: 11,
    fontWeight: '700',
    color: '#22c55e',
    letterSpacing: 1,
  },
  liveDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: '#22c55e',
  },
  headerRule: {
    height: 1,
    backgroundColor: 'rgba(251,191,36,0.20)',
    marginHorizontal: 0,
  },

  // ── SCROLL ──────────────────────────────────────────────────────────────────
  scroll: {
    flex: 1,
    backgroundColor: '#080900',
  },
  scrollContent: {
    paddingBottom: 40,
  },

  // ── HERO ────────────────────────────────────────────────────────────────────
  heroBlock: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
  },
  heroLabel: {
    fontFamily: MONO,
    fontSize: 10,
    color: 'rgba(251,191,36,0.50)',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  heroValue: {
    fontFamily: MONO,
    fontSize: 44,
    fontWeight: '900',
    color: '#fbbf24',
    letterSpacing: -1,
    lineHeight: 52,
  },
  heroSub: {
    fontFamily: MONO,
    fontSize: 11,
    color: 'rgba(251,191,36,0.50)',
    marginTop: 4,
    letterSpacing: 0.3,
  },
  heroSep: {
    fontFamily: MONO,
    fontSize: 12,
    color: 'rgba(251,191,36,0.15)',
    paddingVertical: 8,
  },

  // ── 6-CELL GRID ─────────────────────────────────────────────────────────────
  gridWrap: {
    paddingHorizontal: 12,
    paddingBottom: 12,
    gap: 0,
  },
  gridRow: {
    flexDirection: 'row',
    gap: 0,
  },
  cell: {
    flex: 1,
    backgroundColor: '#0f1200',
    borderWidth: 1,
    borderColor: 'rgba(251,191,36,0.12)',
    padding: 12,
  },
  cellLabel: {
    fontFamily: MONO,
    fontSize: 9,
    color: 'rgba(251,191,36,0.40)',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  cellValue: {
    fontFamily: MONO,
    fontSize: 18,
    fontWeight: '700',
    color: '#fbbf24',
  },

  // ── TERMINAL BLOCK ──────────────────────────────────────────────────────────
  terminalBlock: {
    marginHorizontal: 12,
    marginBottom: 10,
    padding: 14,
    backgroundColor: '#0f1200',
    borderWidth: 1,
    borderColor: 'rgba(251,191,36,0.12)',
  },
  terminalHeader: {
    fontFamily: MONO,
    fontSize: 10,
    color: 'rgba(251,191,36,0.50)',
    marginBottom: 10,
    letterSpacing: 0.5,
  },
  termLine: {
    fontFamily: MONO,
    fontSize: 12,
    color: 'rgba(251,191,36,0.70)',
    lineHeight: 20,
  },

  // ── ALERT BAND ──────────────────────────────────────────────────────────────
  alertBand: {
    marginHorizontal: 12,
    marginBottom: 10,
    padding: 12,
    backgroundColor: 'rgba(239,68,68,0.15)',
    borderWidth: 1,
    borderColor: 'rgba(239,68,68,0.50)',
  },
  alertText: {
    fontFamily: MONO,
    fontSize: 11,
    fontWeight: '700',
    color: '#ef4444',
    letterSpacing: 0.5,
  },

  // ── ACTIONS ─────────────────────────────────────────────────────────────────
  actionRow: {
    flexDirection: 'row',
    paddingHorizontal: 12,
    marginBottom: 24,
    gap: 10,
  },
  btnOutline: {
    flex: 1,
    height: 44,
    borderWidth: 1,
    borderColor: '#fbbf24',
    backgroundColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnOutlineText: {
    fontFamily: MONO,
    fontSize: 12,
    fontWeight: '700',
    color: '#fbbf24',
    letterSpacing: 0.5,
  },
  btnSolid: {
    flex: 1,
    height: 44,
    backgroundColor: '#fbbf24',
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnSolidText: {
    fontFamily: MONO,
    fontSize: 12,
    fontWeight: '700',
    color: '#080900',
    letterSpacing: 0.5,
  },
});
