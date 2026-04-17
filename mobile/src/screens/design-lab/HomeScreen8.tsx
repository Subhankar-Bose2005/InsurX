/**
 * HomeScreen8 — CONSTRUCTIVIST POSTER
 * Russian Constructivist art meets Indian street poster.
 * Hard angles. Political urgency. Zero border radius. Every element commands attention.
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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import useStore from '../../store/useStore';
import { formatCurrency } from '../../utils/formatters';

// ─── Design tokens ────────────────────────────────────────────────────────────
const C = {
  paper:  '#f2ede4',
  black:  '#0f0f0f',
  red:    '#d42b2b',
  yellow: '#f5c518',
  green:  '#1a7a1a',
  white:  '#ffffff',
};

interface Props {
  navigation: any;
}

// ─── Scrolling ticker ─────────────────────────────────────────────────────────
function TickerBand({ text }: { text: string }) {
  const translateX = useRef(new Animated.Value(0)).current;
  const TICKER_WIDTH = 1200; // wide enough for one full pass

  useEffect(() => {
    translateX.setValue(0);
    const anim = Animated.loop(
      Animated.timing(translateX, {
        toValue: -TICKER_WIDTH / 2,
        duration: 14000,
        useNativeDriver: true,
      })
    );
    anim.start();
    return () => anim.stop();
  }, []);

  // Duplicate text so loop is seamless
  const repeated = `${text}   ★   ${text}   ★   ${text}   ★   ${text}   ★   `;

  return (
    <View style={styles.tickerWrapper}>
      <Animated.Text
        style={[styles.tickerText, { transform: [{ translateX }] }]}
        numberOfLines={1}
      >
        {repeated}
      </Animated.Text>
    </View>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────
export default function HomeScreen8({ navigation }: Props) {
  const { worker, activePolicy, claimSummary, weather, activeTriggers } = useStore();

  // Derived
  const totalProtected  = claimSummary?.totalProtected ?? 0;
  const claimsThisWeek  = claimSummary?.claimsThisWeek ?? 0;
  const maxPayout       = activePolicy?.maxPayout ?? null;
  const coveragePercent = activePolicy
    ? Math.min(Math.round((totalProtected / (maxPayout || 1)) * 100), 100)
    : 0;

  const temp     = weather ? Math.round(weather.temp) : null;
  const rainfall = weather ? Math.round(weather.rainfall_mm_per_hr) : 0;
  const hasAlert = activeTriggers && activeTriggers.length > 0;

  // Month label for the announcement band
  const monthLabel = new Date().toLocaleDateString('en-IN', {
    month: 'short',
    year: 'numeric',
  }).toUpperCase(); // e.g. "APR 2026"

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <StatusBar barStyle="light-content" backgroundColor={C.black} />

      {/* ── Header ──────────────────────────────────────────────────────────── */}
      <View style={styles.header}>
        <Text style={styles.headerBrand}>INSURX</Text>
        <Text style={styles.headerRight}>★ PROTECTED ★</Text>
      </View>

      {/* ── Red announcement band ───────────────────────────────────────────── */}
      <View style={styles.redBand}>
        <Text style={styles.redBandLeft}>EARNINGS SECURED</Text>
        <Text style={styles.redBandRight}>{monthLabel}</Text>
      </View>

      {/* ── Scrollable content ──────────────────────────────────────────────── */}
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >

        {/* ── Giant earnings block ──────────────────────────────────────────── */}
        <View style={styles.earningsBlock}>
          <Text style={styles.earningsLabel}>YOUR PROTECTION</Text>
          <Text style={styles.earningsValue}>
            ₹{totalProtected.toLocaleString('en-IN')}
          </Text>
          <View style={styles.earningsDivider} />
          <View style={styles.earningsRow}>
            <Text style={styles.earningsRowLeft}>
              {claimsThisWeek} TRIGGERS ACTIVATED
            </Text>
            <Text style={styles.earningsRowRight}>
              {coveragePercent}% COVERAGE
            </Text>
          </View>
        </View>

        {/* ── Black info band ───────────────────────────────────────────────── */}
        <View style={styles.blackBand}>
          <Text style={styles.blackBandTitle}>ACTIVE SHIELD</Text>
          <Text style={styles.blackBandPlan}>
            {activePolicy?.planName?.toUpperCase() || 'NO ACTIVE PLAN'}
          </Text>
          <Text style={styles.blackBandMeta}>
            MAX PAYOUT: {maxPayout != null ? `₹${maxPayout.toLocaleString('en-IN')}` : '—'}
          </Text>
        </View>

        {/* ── 2×2 data grid ─────────────────────────────────────────────────── */}
        <View style={styles.dataGrid}>
          {/* Row 1 */}
          <View style={styles.gridRow}>
            <View style={[styles.gridCell, styles.gridCellLeft]}>
              <Text style={styles.gridLabel}>ZONE</Text>
              <Text style={styles.gridValue}>
                {(worker?.zone || 'DELHI-NCR').toUpperCase()}
              </Text>
            </View>
            <View style={styles.gridCell}>
              <Text style={styles.gridLabel}>TEMPERATURE</Text>
              <Text
                style={[
                  styles.gridValue,
                  temp != null && temp > 43 && { color: C.red },
                ]}
              >
                {temp != null ? `${temp}°C` : '--°C'}
              </Text>
            </View>
          </View>
          {/* Row 2 */}
          <View style={styles.gridRow}>
            <View style={[styles.gridCell, styles.gridCellLeft, styles.gridCellTop]}>
              <Text style={styles.gridLabel}>RAINFALL</Text>
              <Text
                style={[
                  styles.gridValue,
                  rainfall > 20 && { color: C.red },
                ]}
              >
                {rainfall}MM/HR
              </Text>
            </View>
            <View style={[styles.gridCell, styles.gridCellTop]}>
              <Text style={styles.gridLabel}>RISK STATUS</Text>
              <Text
                style={[
                  styles.gridValue,
                  { color: hasAlert ? C.red : C.green },
                ]}
              >
                {hasAlert ? 'ALERT' : 'SAFE'}
              </Text>
            </View>
          </View>
        </View>

        {/* ── Scrolling ticker ──────────────────────────────────────────────── */}
        <TickerBand
          text={
            hasAlert
              ? 'DISRUPTION DETECTED — PAYOUT PROCESSING — STAY INDOORS'
              : 'ALL SYSTEMS OPERATIONAL — YOUR EARNINGS ARE PROTECTED — INSURX'
          }
        />

        {/* ── Alert stripe ──────────────────────────────────────────────────── */}
        {hasAlert && (
          <View style={styles.alertStripe}>
            <Text style={styles.alertStripeText}>
              !!! DISRUPTION — PAYOUT PROCESSING !!!
            </Text>
          </View>
        )}

        {/* ── Yellow CTA block ──────────────────────────────────────────────── */}
        <TouchableOpacity
          style={styles.ctaBlock}
          onPress={() => console.log('demo')}
          activeOpacity={0.85}
        >
          <Text style={styles.ctaText}>FIRE TEST TRIGGER</Text>
        </TouchableOpacity>

        {/* ── Secondary actions ─────────────────────────────────────────────── */}
        <View style={styles.secondaryRow}>
          <TouchableOpacity
            style={styles.secondaryBtn}
            onPress={() => navigation.navigate('Policy')}
            activeOpacity={0.85}
          >
            <Text style={styles.secondaryBtnText}>VIEW POLICY</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.secondaryBtn, styles.secondaryBtnRight]}
            onPress={() => navigation.navigate('Claims')}
            activeOpacity={0.85}
          >
            <Text style={styles.secondaryBtnText}>CLAIM HISTORY</Text>
          </TouchableOpacity>
        </View>

      </ScrollView>

      {/* ── Footer ──────────────────────────────────────────────────────────── */}
      <View style={styles.footer}>
        <Text style={styles.footerLeft}>INSURX © 2026</Text>
        <Text style={styles.footerRight}>ALL WORKERS PROTECTED</Text>
      </View>
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: C.black,
  },

  // ── Header
  header: {
    backgroundColor: C.black,
    paddingHorizontal: 16,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerBrand: {
    fontSize: 28,
    fontWeight: '900',
    color: C.paper,
    letterSpacing: 6,
    textTransform: 'uppercase',
  },
  headerRight: {
    fontSize: 11,
    fontWeight: '700',
    color: C.yellow,
    letterSpacing: 2,
  },

  // ── Red band
  redBand: {
    backgroundColor: C.red,
    paddingHorizontal: 16,
    paddingVertical: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  redBandLeft: {
    fontSize: 11,
    fontWeight: '700',
    color: C.white,
    letterSpacing: 3,
    textTransform: 'uppercase',
  },
  redBandRight: {
    fontSize: 11,
    fontWeight: '700',
    color: 'rgba(255,255,255,0.70)',
    letterSpacing: 1,
  },

  // ── Scroll
  scroll: {
    flex: 1,
    backgroundColor: C.paper,
  },
  scrollContent: {
    paddingBottom: 0,
  },

  // ── Giant earnings block
  earningsBlock: {
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 16,
    backgroundColor: C.paper,
    borderBottomWidth: 4,
    borderBottomColor: C.black,
  },
  earningsLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: C.black,
    letterSpacing: 4,
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  earningsValue: {
    fontSize: 56,
    fontWeight: '900',
    color: C.red,
    letterSpacing: -2,
    includeFontPadding: false,
  },
  earningsDivider: {
    height: 4,
    backgroundColor: C.black,
    marginVertical: 12,
  },
  earningsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  earningsRowLeft: {
    fontSize: 14,
    fontWeight: '700',
    color: C.black,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  earningsRowRight: {
    fontSize: 14,
    fontWeight: '700',
    color: C.red,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },

  // ── Black info band
  blackBand: {
    backgroundColor: C.black,
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  blackBandTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: C.paper,
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  blackBandPlan: {
    fontSize: 14,
    fontWeight: '700',
    color: C.yellow,
    marginTop: 4,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  blackBandMeta: {
    fontSize: 12,
    color: 'rgba(242,237,228,0.70)',
    marginTop: 8,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },

  // ── 2×2 data grid (shared borders)
  dataGrid: {
    backgroundColor: C.paper,
    borderWidth: 2,
    borderColor: C.black,
    marginHorizontal: 0,
  },
  gridRow: {
    flexDirection: 'row',
  },
  gridCell: {
    flex: 1,
    backgroundColor: C.paper,
    padding: 14,
    // outer border comes from dataGrid; inner borders added via gridCellLeft / gridCellTop
  },
  gridCellLeft: {
    borderRightWidth: 2,
    borderRightColor: C.black,
  },
  gridCellTop: {
    borderTopWidth: 2,
    borderTopColor: C.black,
  },
  gridLabel: {
    fontSize: 9,
    fontWeight: '700',
    color: C.black,
    letterSpacing: 2,
    textTransform: 'uppercase',
    marginBottom: 6,
  },
  gridValue: {
    fontSize: 20,
    fontWeight: '900',
    color: C.black,
    textTransform: 'uppercase',
  },

  // ── Ticker
  tickerWrapper: {
    backgroundColor: C.black,
    paddingVertical: 8,
    overflow: 'hidden',
  },
  tickerText: {
    fontSize: 11,
    fontWeight: '700',
    color: C.yellow,
    letterSpacing: 2,
    textTransform: 'uppercase',
    whiteSpace: 'nowrap',
  } as any,

  // ── Alert stripe
  alertStripe: {
    backgroundColor: C.red,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  alertStripeText: {
    fontSize: 13,
    fontWeight: '700',
    color: C.white,
    textAlign: 'center',
    letterSpacing: 2,
    textTransform: 'uppercase',
  },

  // ── Yellow CTA
  ctaBlock: {
    backgroundColor: C.yellow,
    paddingHorizontal: 16,
    paddingVertical: 20,
    borderTopWidth: 4,
    borderBottomWidth: 4,
    borderTopColor: C.black,
    borderBottomColor: C.black,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ctaText: {
    fontSize: 16,
    fontWeight: '900',
    color: C.black,
    letterSpacing: 2,
    textTransform: 'uppercase',
    textAlign: 'center',
  },

  // ── Secondary action row
  secondaryRow: {
    flexDirection: 'row',
    borderTopWidth: 3,
    borderTopColor: C.black,
  },
  secondaryBtn: {
    flex: 1,
    paddingVertical: 16,
    backgroundColor: C.paper,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryBtnRight: {
    borderLeftWidth: 3,
    borderLeftColor: C.black,
  },
  secondaryBtnText: {
    fontSize: 12,
    fontWeight: '900',
    color: C.black,
    letterSpacing: 2,
    textTransform: 'uppercase',
  },

  // ── Footer
  footer: {
    backgroundColor: C.black,
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  footerLeft: {
    fontSize: 10,
    color: 'rgba(242,237,228,0.40)',
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  footerRight: {
    fontSize: 10,
    fontWeight: '700',
    color: C.yellow,
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
});
