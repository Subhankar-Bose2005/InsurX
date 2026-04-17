// DESIGN LAB — HomeScreen11
// "EDITORIAL EXPANDED" — newspaper grid meets precision fintech.
// Serif-weight numerics, column rules, staggered reveal, weekly micro-bars.

import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Dimensions,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import useStore from '../../store/useStore';
import { formatCurrency } from '../../utils/formatters';

const { width: SW } = Dimensions.get('window');

// ─── Design Tokens ────────────────────────────────────────────────────────────
const C = {
  paper:        '#F8F7F4',   // warm newsprint
  ink:          '#0f0f0e',   // near-black
  inkFaint:     '#9ca3af',   // light grey
  inkMid:       '#4b5563',   // mid grey
  column:       '#e5e3de',   // column rule / dividers
  emerald:      '#166534',   // deep green — money only
  emeraldBg:    '#f0fdf4',
  steel:        '#1e3a5f',   // steel blue — info
  steelBg:      '#eff6ff',
  amber:        '#92400e',   // amber — alerts
  amberBg:      '#fffbeb',
  amberRule:    '#fbbf24',
  surface:      '#F1F0EC',   // card bg
  white:        '#FFFFFF',
};

// ─── Helpers ──────────────────────────────────────────────────────────────────
function getInitials(name?: string | null) {
  if (!name) return '?';
  const parts = name.trim().split(' ').filter(Boolean);
  if (parts.length === 1) return parts[0][0].toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

// Weekly bar heights (mock) — taller = better earnings day
const WEEK_BARS = [
  { day: 'M', h: 0.55, amt: 620 },
  { day: 'T', h: 0.80, amt: 890 },
  { day: 'W', h: 0.40, amt: 450 },
  { day: 'T', h: 0.70, amt: 780 },
  { day: 'F', h: 1.00, amt: 1120 },
  { day: 'S', h: 0.90, amt: 1010 },
  { day: 'S', h: 0.30, amt: 330 },
];
const BAR_MAX_H = 52;

interface Props { navigation: any }

// ─── Animated section wrapper ─────────────────────────────────────────────────
function FadeSlide({
  children,
  delay = 0,
}: {
  children: React.ReactNode;
  delay?: number;
}) {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(14)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: 420,
        delay,
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: 0,
        duration: 380,
        delay,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <Animated.View style={{ opacity, transform: [{ translateY }] }}>
      {children}
    </Animated.View>
  );
}

// ─── Section Heading (newspaper column style) ─────────────────────────────────
function SectionHead({ label }: { label: string }) {
  return (
    <View style={sh.wrap}>
      <Text style={sh.label}>{label}</Text>
      <View style={sh.rule} />
    </View>
  );
}
const sh = StyleSheet.create({
  wrap: { marginBottom: 14 },
  label: {
    fontSize: 9,
    fontWeight: '700',
    color: C.inkFaint,
    letterSpacing: 2.5,
    textTransform: 'uppercase',
    marginBottom: 6,
  },
  rule: { height: 1, backgroundColor: C.column },
});

// ─── Main Screen ──────────────────────────────────────────────────────────────
export default function HomeScreen11({ navigation }: Props) {
  const { worker, activePolicy, claimSummary, weather, activeTriggers } = useStore();

  const firstName = worker?.name?.split(' ')[0] ?? 'Partner';
  const initials = getInitials(worker?.name);
  const zone = worker?.zone ?? 'Delhi-NCR';
  const isAlert = activeTriggers.length > 0;
  const rainfall = weather?.rainfall_mm_per_hr ?? 0;
  const aqiValue = weather?.aqi ?? 0;
  const tempC = weather?.temp != null ? Math.round(weather.temp) : null;

  // Date header
  const now = new Date();
  const dateStr = now.toLocaleDateString('en-IN', {
    weekday: 'long', day: 'numeric', month: 'long',
  });

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor={C.paper} />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >

        {/* ── MASTHEAD ──────────────────────────────────────────────────── */}
        <FadeSlide delay={0}>
          <View style={styles.masthead}>
            {/* Left rule accent */}
            <View style={styles.mastheadRule} />
            <View style={styles.mastheadInner}>
              <Text style={styles.mastheadBrand}>INSURX</Text>
              <Text style={styles.mastheadDate}>{dateStr}</Text>
            </View>
            <TouchableOpacity style={styles.avatarCircle} onPress={() => navigation.navigate('Profile')}>
              <Text style={styles.avatarText}>{initials}</Text>
            </TouchableOpacity>
          </View>
        </FadeSlide>

        {/* ── HERO NUMERAL ──────────────────────────────────────────────── */}
        <FadeSlide delay={60}>
          <View style={styles.hero}>
            <Text style={styles.heroEyebrow}>TOTAL PROTECTION THIS WEEK</Text>
            <Text style={styles.heroAmount}>
              {formatCurrency(claimSummary.totalProtected)}
            </Text>
            <View style={styles.heroMeta}>
              <Text style={styles.heroMetaItem}>
                <Text style={styles.heroMetaNum}>{claimSummary.claimsThisWeek}</Text>
                {'  '}payouts triggered
              </Text>
              <View style={styles.heroMetaDot} />
              <Text style={styles.heroMetaItem}>
                <Text style={styles.heroMetaNum}>
                  {activePolicy?.coveragePercent ?? 0}%
                </Text>
                {'  '}covered
              </Text>
            </View>
          </View>
        </FadeSlide>

        {/* ── DOUBLE RULE SEPARATOR ────────────────────────────────────── */}
        <FadeSlide delay={100}>
          <View style={styles.doubleRule}>
            <View style={styles.ruleThick} />
            <View style={styles.ruleThin} />
          </View>
        </FadeSlide>

        {/* ── WEEK AT A GLANCE ──────────────────────────────────────────── */}
        <FadeSlide delay={140}>
          <View style={styles.section}>
            <SectionHead label="Week at a Glance" />
            <View style={styles.barsRow}>
              {WEEK_BARS.map((bar, i) => (
                <View key={i} style={styles.barCol}>
                  <Text style={styles.barAmt}>
                    {bar.amt >= 1000 ? `${(bar.amt / 1000).toFixed(1)}k` : bar.amt}
                  </Text>
                  <View style={styles.barTrack}>
                    <View
                      style={[
                        styles.barFill,
                        { height: bar.h * BAR_MAX_H },
                        i === 4 && { backgroundColor: C.emerald }, // best day
                      ]}
                    />
                  </View>
                  <Text style={styles.barDay}>{bar.day}</Text>
                </View>
              ))}
            </View>
          </View>
        </FadeSlide>

        {/* ── TWO-COLUMN LAYOUT: POLICY + WEATHER ──────────────────────── */}
        <FadeSlide delay={200}>
          <View style={styles.section}>
            <View style={styles.twoCol}>

              {/* Policy column */}
              <View style={styles.colLeft}>
                <SectionHead label="Policy" />
                <View style={styles.policyBlock}>
                  <Text style={styles.policyShield}>🛡</Text>
                  <Text style={styles.policyName}>
                    {activePolicy?.planName ?? 'No Plan'}
                  </Text>
                  {activePolicy ? (
                    <View style={styles.badgeGreen}>
                      <Text style={styles.badgeGreenText}>Active</Text>
                    </View>
                  ) : (
                    <View style={styles.badgeGrey}>
                      <Text style={styles.badgeGreyText}>Inactive</Text>
                    </View>
                  )}
                  <Text style={styles.policyMax}>
                    Max{'\n'}
                    <Text style={styles.policyMaxNum}>
                      {activePolicy?.maxPayout != null
                        ? formatCurrency(activePolicy.maxPayout)
                        : '—'}
                    </Text>
                  </Text>
                </View>
              </View>

              {/* Vertical column rule */}
              <View style={styles.colRule} />

              {/* Weather column */}
              <View style={styles.colRight}>
                <SectionHead label="Conditions" />
                <View style={styles.weatherBlock}>
                  <WeatherStat
                    label="Temp"
                    value={tempC != null ? `${tempC}°` : '--'}
                    warn={tempC != null && tempC > 42}
                  />
                  <WeatherStat
                    label="AQI"
                    value={aqiValue > 0 ? String(aqiValue) : '--'}
                    warn={aqiValue > 300}
                  />
                  <WeatherStat
                    label="Rain"
                    value={`${rainfall}mm`}
                    warn={rainfall > 10}
                  />
                  <WeatherStat
                    label="Zone"
                    value={isAlert ? 'ALERT' : 'CLEAR'}
                    warn={isAlert}
                  />
                </View>
              </View>
            </View>
          </View>
        </FadeSlide>

        {/* ── ALERT STRIP (conditional) ─────────────────────────────────── */}
        {isAlert && (
          <FadeSlide delay={240}>
            <View style={styles.section}>
              <View style={styles.alertStrip}>
                <View style={styles.alertRuleBar} />
                <View style={styles.alertContent}>
                  <Text style={styles.alertHead}>ACTIVE DISRUPTION</Text>
                  <Text style={styles.alertBody}>
                    Parametric trigger active in {zone}. Your payout is being processed automatically.
                  </Text>
                </View>
              </View>
            </View>
          </FadeSlide>
        )}

        {/* ── LOCATION ROW ─────────────────────────────────────────────── */}
        <FadeSlide delay={260}>
          <View style={styles.section}>
            <SectionHead label="Delivery Zone" />
            <View style={styles.locationRow}>
              <Text style={styles.locationPin}>◉</Text>
              <Text style={styles.locationZone}>{zone}</Text>
              <View style={[styles.zonePill, isAlert ? styles.zonePillAlert : styles.zonePillClear]}>
                <Text style={[styles.zonePillText, isAlert ? styles.zonePillTextAlert : styles.zonePillTextClear]}>
                  {isAlert ? 'Alert' : 'Clear'}
                </Text>
              </View>
            </View>
          </View>
        </FadeSlide>

        {/* ── PULL QUOTE ────────────────────────────────────────────────── */}
        <FadeSlide delay={300}>
          <View style={styles.pullQuote}>
            <View style={styles.pullQuoteRule} />
            <Text style={styles.pullQuoteText}>
              {claimSummary.claimsThisWeek > 0
                ? `You've already received ${claimSummary.claimsThisWeek} automated payout${claimSummary.claimsThisWeek > 1 ? 's' : ''} this week.`
                : `${firstName}, your income is protected.\nWe'll trigger your payout automatically.`}
            </Text>
          </View>
        </FadeSlide>

        {/* ── CTA ───────────────────────────────────────────────────────── */}
        <FadeSlide delay={340}>
          <View style={styles.section}>
            <TouchableOpacity
              style={styles.cta}
              onPress={() => navigation.navigate('Policy')}
              activeOpacity={0.88}
            >
              <Text style={styles.ctaText}>View Full Policy</Text>
              <Text style={styles.ctaArrow}>→</Text>
            </TouchableOpacity>
          </View>
        </FadeSlide>

        {/* ── FOOTER CREDIT ─────────────────────────────────────────────── */}
        <FadeSlide delay={380}>
          <View style={styles.footer}>
            <View style={styles.footerRule} />
            <Text style={styles.footerText}>
              Powered by parametric AI · Guidewire DEVTrails 2026
            </Text>
          </View>
        </FadeSlide>

      </ScrollView>
    </SafeAreaView>
  );
}

// ─── Mini Weather Stat ────────────────────────────────────────────────────────
function WeatherStat({
  label,
  value,
  warn,
}: {
  label: string;
  value: string;
  warn?: boolean;
}) {
  return (
    <View style={ws.row}>
      <Text style={ws.label}>{label}</Text>
      <Text style={[ws.value, warn && ws.valueWarn]}>{value}</Text>
    </View>
  );
}
const ws = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  label: {
    fontSize: 11,
    color: C.inkFaint,
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  value: {
    fontSize: 15,
    fontWeight: '700',
    color: C.ink,
  },
  valueWarn: {
    color: C.amber,
  },
});

// ─── Styles ──────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: C.paper,
  },
  scroll: {
    flex: 1,
  },
  content: {
    paddingBottom: 40,
  },

  // ── Masthead ─────────────────────────────────────────────────────────────────
  masthead: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
    gap: 12,
  },
  mastheadRule: {
    width: 3,
    height: 36,
    backgroundColor: C.ink,
    borderRadius: 1.5,
  },
  mastheadInner: {
    flex: 1,
    gap: 2,
  },
  mastheadBrand: {
    fontSize: 18,
    fontWeight: '900',
    color: C.ink,
    letterSpacing: 4,
  },
  mastheadDate: {
    fontSize: 11,
    color: C.inkFaint,
    fontWeight: '400',
    letterSpacing: 0.3,
  },
  avatarCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: C.ink,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 13,
    fontWeight: '700',
    color: C.paper,
  },

  // ── Hero ─────────────────────────────────────────────────────────────────────
  hero: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 24,
  },
  heroEyebrow: {
    fontSize: 9,
    fontWeight: '700',
    color: C.inkFaint,
    letterSpacing: 2.5,
    textTransform: 'uppercase',
    marginBottom: 6,
  },
  heroAmount: {
    fontSize: 62,
    fontWeight: '900',
    color: C.ink,
    letterSpacing: -3,
    includeFontPadding: false,
    lineHeight: 68,
  },
  heroMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
    gap: 10,
  },
  heroMetaItem: {
    fontSize: 12,
    color: C.inkMid,
    fontWeight: '400',
  },
  heroMetaNum: {
    fontWeight: '700',
    color: C.emerald,
  },
  heroMetaDot: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: C.column,
  },

  // ── Double Rule ──────────────────────────────────────────────────────────────
  doubleRule: {
    paddingHorizontal: 20,
    marginBottom: 24,
    gap: 2,
  },
  ruleThick: {
    height: 2,
    backgroundColor: C.ink,
  },
  ruleThin: {
    height: 1,
    backgroundColor: C.column,
  },

  // ── Generic section ──────────────────────────────────────────────────────────
  section: {
    paddingHorizontal: 20,
    marginBottom: 28,
  },

  // ── Weekly Bars ──────────────────────────────────────────────────────────────
  barsRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
  },
  barCol: {
    alignItems: 'center',
    flex: 1,
    gap: 4,
  },
  barAmt: {
    fontSize: 9,
    color: C.inkFaint,
    fontWeight: '500',
    textAlign: 'center',
  },
  barTrack: {
    height: BAR_MAX_H,
    width: (SW - 40 - 48) / 7, // distribute evenly
    backgroundColor: C.surface,
    borderRadius: 3,
    justifyContent: 'flex-end',
    overflow: 'hidden',
  },
  barFill: {
    backgroundColor: C.ink,
    width: '100%',
    borderRadius: 3,
  },
  barDay: {
    fontSize: 10,
    color: C.inkFaint,
    fontWeight: '600',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },

  // ── Two-column layout ────────────────────────────────────────────────────────
  twoCol: {
    flexDirection: 'row',
    gap: 0,
  },
  colLeft: {
    flex: 1,
    paddingRight: 16,
  },
  colRule: {
    width: 1,
    backgroundColor: C.column,
    alignSelf: 'stretch',
  },
  colRight: {
    flex: 1,
    paddingLeft: 16,
  },

  // Policy block
  policyBlock: {
    gap: 8,
  },
  policyShield: {
    fontSize: 22,
  },
  policyName: {
    fontSize: 14,
    fontWeight: '700',
    color: C.ink,
    lineHeight: 18,
  },
  badgeGreen: {
    alignSelf: 'flex-start',
    backgroundColor: C.emeraldBg,
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  badgeGreenText: {
    fontSize: 10,
    fontWeight: '700',
    color: C.emerald,
    letterSpacing: 0.5,
  },
  badgeGrey: {
    alignSelf: 'flex-start',
    backgroundColor: C.surface,
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  badgeGreyText: {
    fontSize: 10,
    fontWeight: '700',
    color: C.inkFaint,
    letterSpacing: 0.5,
  },
  policyMax: {
    fontSize: 11,
    color: C.inkFaint,
    fontWeight: '400',
    marginTop: 4,
    lineHeight: 16,
  },
  policyMaxNum: {
    fontSize: 16,
    fontWeight: '800',
    color: C.ink,
  },

  // Weather block
  weatherBlock: {
    gap: 0,
  },

  // ── Alert strip ──────────────────────────────────────────────────────────────
  alertStrip: {
    flexDirection: 'row',
    backgroundColor: C.amberBg,
    borderRadius: 4,
    overflow: 'hidden',
  },
  alertRuleBar: {
    width: 4,
    backgroundColor: C.amberRule,
  },
  alertContent: {
    flex: 1,
    paddingHorizontal: 14,
    paddingVertical: 12,
    gap: 4,
  },
  alertHead: {
    fontSize: 9,
    fontWeight: '700',
    color: C.amber,
    letterSpacing: 2.5,
    textTransform: 'uppercase',
  },
  alertBody: {
    fontSize: 12,
    color: C.amber,
    fontWeight: '400',
    lineHeight: 17,
  },

  // ── Location row ─────────────────────────────────────────────────────────────
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  locationPin: {
    fontSize: 16,
    color: C.inkFaint,
  },
  locationZone: {
    flex: 1,
    fontSize: 16,
    fontWeight: '700',
    color: C.ink,
  },
  zonePill: {
    borderRadius: 4,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  zonePillClear: {
    backgroundColor: C.emeraldBg,
  },
  zonePillAlert: {
    backgroundColor: C.amberBg,
  },
  zonePillText: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  zonePillTextClear: { color: C.emerald },
  zonePillTextAlert: { color: C.amber },

  // ── Pull quote ───────────────────────────────────────────────────────────────
  pullQuote: {
    paddingHorizontal: 20,
    marginBottom: 24,
    flexDirection: 'row',
    gap: 16,
  },
  pullQuoteRule: {
    width: 2,
    backgroundColor: C.ink,
    borderRadius: 1,
    flexShrink: 0,
  },
  pullQuoteText: {
    flex: 1,
    fontSize: 18,
    fontWeight: '700',
    color: C.ink,
    lineHeight: 26,
    letterSpacing: -0.3,
    fontStyle: 'italic',
  },

  // ── CTA ──────────────────────────────────────────────────────────────────────
  cta: {
    height: 56,
    backgroundColor: C.ink,
    borderRadius: 4,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  ctaText: {
    fontSize: 15,
    fontWeight: '700',
    color: C.paper,
    letterSpacing: 0.3,
  },
  ctaArrow: {
    fontSize: 18,
    fontWeight: '700',
    color: C.paper,
  },

  // ── Footer ───────────────────────────────────────────────────────────────────
  footer: {
    paddingHorizontal: 20,
    paddingBottom: 8,
    gap: 10,
  },
  footerRule: {
    height: 1,
    backgroundColor: C.column,
  },
  footerText: {
    fontSize: 10,
    color: C.inkFaint,
    fontWeight: '400',
    letterSpacing: 0.5,
    textAlign: 'center',
  },
});
