// DESIGN LAB - HomeScreen4
// Variant: "GRADIENT IMMERSIVE"
// Aesthetic: Rich deep-navy hero header (Revolut / Monzo style), white card body below,
// floating stats row that bridges the gradient into the scroll content.
// Friendly, modern, premium feel with crisp elevation and soft shadows.

import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  Alert,
  SafeAreaView,
} from 'react-native';
import useStore from '../../store/useStore';
import { formatCurrency, formatDate, formatPolicyExpiry } from '../../utils/formatters';

// ─── Palette ──────────────────────────────────────────────────────────────────
const C = {
  heroNav: '#000666',       // solid deep navy (simulates gradient base)
  heroNavDark: '#00096e',   // slightly lighter for depth layering
  bodyBg: '#f8f9fc',
  cardWhite: '#FFFFFF',
  shadow: 'rgba(0,6,102,0.08)',
  green: '#16a34a',
  greenLight: '#dcfce7',
  amber: '#f59e0b',
  amberLight: '#fef3c7',
  red: '#dc2626',
  text: '#111827',
  muted: '#6b7280',
  border: '#e5e7eb',
  pillBg: '#f8f9fc',
};

// ─── Types ────────────────────────────────────────────────────────────────────
interface Props {
  navigation: any;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function getWeatherEmoji(rainfall: number, weatherMain?: string): string {
  if (rainfall > 20) return '⛈️';
  if (rainfall > 5) return '🌧️';
  const main = (weatherMain || '').toLowerCase();
  if (main.includes('cloud')) return '☁️';
  if (main.includes('rain')) return '🌧️';
  if (main.includes('thunder')) return '⛈️';
  if (main.includes('haze') || main.includes('mist') || main.includes('fog')) return '🌫️';
  return '☀️';
}

function getFirstName(fullName: string | null | undefined): string {
  if (!fullName) return 'there';
  return fullName.trim().split(' ')[0];
}

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

// ─── Floating Card shadow style (shared) ─────────────────────────────────────
const floatShadow = {
  elevation: 8,
  shadowColor: C.heroNav,
  shadowOpacity: 0.12,
  shadowRadius: 12,
  shadowOffset: { width: 0, height: 4 },
};

// ─── Component ────────────────────────────────────────────────────────────────
export default function HomeScreen4({ navigation }: Props) {
  const { worker, activePolicy, claimSummary, weather, activeTriggers } = useStore();

  const isActive = activePolicy?.status === 'active';
  const coveragePercent = activePolicy?.coveragePercent ?? 0;
  const maxPayout = activePolicy?.maxPayout;
  const rainfall = weather?.rainfall_mm_per_hr ?? 0;
  const weatherEmoji = getWeatherEmoji(rainfall, weather?.weatherMain);
  const hasDisruption = activeTriggers.length > 0;
  const tempValue = weather?.temp != null ? Math.round(weather.temp) : null;
  const tempColor = tempValue != null && tempValue > 43 ? C.red : C.text;

  function handleFireDemo() {
    Alert.alert(
      'Demo Trigger',
      'Simulate a weather event in your zone to test the automatic payout flow.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Fire Trigger',
          style: 'destructive',
          onPress: () => navigation.navigate('DemoTrigger'),
        },
      ],
    );
  }

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor={C.heroNav} />

      {/* ── SafeAreaView for status bar area matching hero color ─────────── */}
      <SafeAreaView style={styles.safeTop} edges={['top'] as any}>
        {/* ── Hero Gradient Card ──────────────────────────────────────────── */}
        <View style={styles.hero}>
          {/* Subtle inner depth overlay */}
          <View style={styles.heroOverlay} pointerEvents="none" />

          {/* Header row */}
          <View style={styles.heroHeader}>
            <View style={styles.heroHeaderLeft}>
              <Text style={styles.heroShield}>🛡</Text>
              <Text style={styles.heroLogoText}>InsurX</Text>
            </View>
            <View style={styles.heroPillProtected}>
              <View style={styles.heroPillDot} />
              <Text style={styles.heroPillText}>Protected</Text>
            </View>
          </View>

          {/* Greeting */}
          <Text style={styles.heroGreeting}>{getGreeting()}</Text>
          <Text style={styles.heroWorkerName}>{getFirstName(worker?.name)}</Text>

          {/* Earnings block */}
          <Text style={styles.heroEarningsLabel}>Protected this week</Text>
          <Text style={styles.heroEarningsAmount}>
            ₹{claimSummary.totalProtected.toLocaleString('en-IN')}
          </Text>

          {/* Pills row */}
          <View style={styles.heroPillsRow}>
            {/* Payout count pill */}
            <View style={styles.heroPayoutPill}>
              <Text style={styles.heroPayoutPillText}>
                {claimSummary.claimsThisWeek > 0
                  ? `${claimSummary.claimsThisWeek} payout${claimSummary.claimsThisWeek > 1 ? 's' : ''}`
                  : 'No payouts yet'}
              </Text>
            </View>

            {/* Plan pill */}
            {activePolicy && (
              <View style={styles.heroPlanPill}>
                <Text style={styles.heroPlanPillText}>
                  {activePolicy.planName}
                </Text>
              </View>
            )}
          </View>
        </View>
      </SafeAreaView>

      {/* ── Body Scroll ────────────────────────────────────────────────────── */}
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Floating Stats Row (overlaps gradient via negative margin) ──── */}
        <View style={styles.floatingRow}>
          {/* Coverage */}
          <View style={[styles.floatCard, floatShadow]}>
            <Text style={styles.floatCardBig}>{coveragePercent}%</Text>
            <Text style={styles.floatCardSub}>Coverage</Text>
          </View>

          {/* Max Payout */}
          <View style={[styles.floatCard, floatShadow]}>
            <Text style={[styles.floatCardBig, { color: C.green, fontSize: 18 }]}>
              {maxPayout ? `₹${maxPayout.toLocaleString('en-IN')}` : '—'}
            </Text>
            <Text style={styles.floatCardSub}>Max Payout</Text>
          </View>

          {/* Temp */}
          <View style={[styles.floatCard, floatShadow]}>
            <Text style={[styles.floatCardBig, { color: tempColor }]}>
              {tempValue != null ? `${tempValue}°C` : '--'}
            </Text>
            <Text style={styles.floatCardSub}>Temp</Text>
          </View>
        </View>

        {/* ── Policy Status Card ─────────────────────────────────────────── */}
        <View style={[styles.card, styles.cardElevated, { marginBottom: 12 }]}>
          {/* Card top */}
          <View style={styles.cardTopRow}>
            <Text style={styles.cardEyebrow}>YOUR POLICY</Text>
            <View
              style={[
                styles.statusPill,
                {
                  backgroundColor: isActive ? C.greenLight : '#f3f4f6',
                },
              ]}
            >
              <View
                style={[
                  styles.statusDot,
                  { backgroundColor: isActive ? C.green : C.muted },
                ]}
              />
              <Text
                style={[
                  styles.statusPillText,
                  { color: isActive ? C.green : C.muted },
                ]}
              >
                {isActive ? 'Active' : 'Inactive'}
              </Text>
            </View>
          </View>

          {/* Plan name */}
          <Text style={styles.policyPlanName}>
            {activePolicy?.planName || 'No active plan'}
          </Text>

          {/* Progress bar */}
          <View style={styles.progressTrack}>
            <View
              style={[
                styles.progressFill,
                { width: `${Math.min(coveragePercent, 100)}%` },
              ]}
            />
          </View>

          {/* Coverage row */}
          <View style={styles.policyMetaRow}>
            <Text style={styles.policyMetaText}>{coveragePercent}% covered</Text>
            {activePolicy?.endDate ? (
              <Text style={styles.policyMetaText}>
                {formatPolicyExpiry(activePolicy.endDate)}
              </Text>
            ) : null}
          </View>

          {/* Manage button */}
          <TouchableOpacity
            style={styles.managePolicyBtn}
            onPress={() => navigation.navigate('Policy')}
            activeOpacity={0.7}
          >
            <Text style={styles.managePolicyText}>Manage Policy →</Text>
          </TouchableOpacity>
        </View>

        {/* ── Zone & Weather Card ────────────────────────────────────────── */}
        <View style={[styles.card, styles.cardElevated, { marginBottom: 12 }]}>
          <Text style={styles.cardEyebrow}>ZONE CONDITIONS</Text>

          {/* Zone + emoji row */}
          <View style={styles.zoneRow}>
            <Text style={styles.zoneName}>
              {weather?.city || worker?.zone || 'Your Zone'}
            </Text>
            <Text style={styles.zoneEmojiBig}>{weatherEmoji}</Text>
          </View>

          {/* Status bar */}
          <View style={styles.zoneStatusRow}>
            <View
              style={[
                styles.zonePill,
                {
                  backgroundColor: hasDisruption ? C.amberLight : C.greenLight,
                },
              ]}
            >
              <Text
                style={[
                  styles.zonePillText,
                  { color: hasDisruption ? '#d97706' : C.green },
                ]}
              >
                {hasDisruption ? '⚠ Alert' : '✓ Safe'}
              </Text>
            </View>
            {hasDisruption && activeTriggers[0] && (
              <View style={[styles.zonePill, { backgroundColor: '#fff1f2' }]}>
                <Text style={[styles.zonePillText, { color: C.red }]}>
                  {activeTriggers.length} trigger{activeTriggers.length > 1 ? 's' : ''}
                </Text>
              </View>
            )}
          </View>

          {/* Weather chips */}
          <View style={styles.weatherChipsRow}>
            <View style={styles.weatherChip}>
              <Text style={styles.weatherChipEmoji}>🌡</Text>
              <Text style={[styles.weatherChipText, { color: tempColor }]}>
                {tempValue != null ? `${tempValue}°C` : '--'}
              </Text>
            </View>
            <View style={styles.weatherChip}>
              <Text style={styles.weatherChipEmoji}>💨</Text>
              <Text style={styles.weatherChipText}>
                AQI {weather?.aqi ?? '--'}
              </Text>
            </View>
            <View style={styles.weatherChip}>
              <Text style={styles.weatherChipEmoji}>🌧</Text>
              <Text style={styles.weatherChipText}>
                {rainfall > 0 ? `${rainfall}mm` : '0mm'}
              </Text>
            </View>
          </View>
        </View>

        {/* ── Quick Actions Row ──────────────────────────────────────────── */}
        <View style={styles.quickActionsRow}>
          <TouchableOpacity
            style={[styles.quickAction, styles.quickActionPrimary]}
            onPress={() => navigation.navigate('Policy')}
            activeOpacity={0.85}
          >
            <Text style={styles.quickActionPrimaryText}>Shield Plan ›</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.quickAction, styles.quickActionSecondary]}
            onPress={() => navigation.navigate('Claims')}
            activeOpacity={0.85}
          >
            <Text style={styles.quickActionSecondaryText}>
              {claimSummary.claimsThisWeek} Claims ›
            </Text>
          </TouchableOpacity>
        </View>

        {/* ── Demo Banner ────────────────────────────────────────────────── */}
        <View style={styles.demoBanner}>
          <View style={styles.demoBannerTop}>
            <View style={styles.demoBannerBadge}>
              <Text style={styles.demoBannerBadgeText}>⚙ DEMO</Text>
            </View>
            <Text style={styles.demoBannerDesc}>
              Fire a weather trigger to test auto-payout
            </Text>
          </View>
          <TouchableOpacity
            style={styles.demoBannerBtn}
            onPress={handleFireDemo}
            activeOpacity={0.85}
          >
            <Text style={styles.demoBannerBtnText}>Fire Demo Trigger</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: C.heroNav, // top area matches hero before scroll
  },

  // ── SafeArea for hero
  safeTop: {
    backgroundColor: C.heroNav,
  },

  // ── Hero
  hero: {
    backgroundColor: C.heroNav,
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 48,   // extra bottom so floating cards overlap nicely
    overflow: 'hidden',
  },
  heroOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    // Subtle radial-style depth: a bottom-left dark patch
    backgroundColor: 'transparent',
    borderBottomRightRadius: 80,
    // We simulate depth via a second background layer trick:
    // This is a placeholder — on real devices the solid color reads well.
  },
  heroHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 0,
  },
  heroHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  heroShield: {
    fontSize: 18,
  },
  heroLogoText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.3,
  },
  heroPillProtected: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  heroPillDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: '#4ade80',
  },
  heroPillText: {
    fontSize: 13,
    color: '#FFFFFF',
    fontWeight: '500',
  },

  heroGreeting: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.6)',
    marginTop: 24,
  },
  heroWorkerName: {
    fontSize: 26,
    fontWeight: '700',
    color: '#FFFFFF',
    marginTop: 2,
    includeFontPadding: false,
  },

  heroEarningsLabel: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.5)',
    marginTop: 24,
    letterSpacing: 0.3,
  },
  heroEarningsAmount: {
    fontSize: 44,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: -1.5,
    marginTop: 2,
    includeFontPadding: false,
  },

  heroPillsRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 12,
    flexWrap: 'wrap',
  },
  heroPayoutPill: {
    backgroundColor: 'rgba(34,197,94,0.2)',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 5,
  },
  heroPayoutPillText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#4ade80',
  },
  heroPlanPill: {
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 5,
  },
  heroPlanPillText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#FFFFFF',
  },

  // ── Scroll body
  scroll: {
    flex: 1,
    backgroundColor: C.bodyBg,
  },
  scrollContent: {
    paddingBottom: 48,
  },

  // ── Floating Stats Row
  floatingRow: {
    flexDirection: 'row',
    gap: 10,
    marginHorizontal: 16,
    marginTop: -28,         // float over the hero bottom padding
    marginBottom: 12,
  },
  floatCard: {
    flex: 1,
    backgroundColor: C.cardWhite,
    borderRadius: 16,
    padding: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  floatCardBig: {
    fontSize: 24,
    fontWeight: '700',
    color: C.heroNav,
    includeFontPadding: false,
  },
  floatCardSub: {
    fontSize: 11,
    color: C.muted,
    marginTop: 4,
  },

  // ── Generic Card
  card: {
    marginHorizontal: 16,
    backgroundColor: C.cardWhite,
    borderRadius: 16,
    padding: 20,
  },
  cardElevated: {
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
  },
  cardTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  cardEyebrow: {
    fontSize: 10,
    fontWeight: '600',
    color: C.muted,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },

  // ── Status Pill (active/inactive)
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusPillText: {
    fontSize: 12,
    fontWeight: '600',
  },

  // ── Policy Card
  policyPlanName: {
    fontSize: 18,
    fontWeight: '700',
    color: C.text,
    marginTop: 0,
    marginBottom: 14,
  },
  progressTrack: {
    height: 6,
    backgroundColor: '#f0f0f0',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: 6,
    backgroundColor: C.heroNav,
    borderRadius: 3,
  },
  policyMetaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  policyMetaText: {
    fontSize: 12,
    color: C.muted,
  },
  managePolicyBtn: {
    marginTop: 12,
    alignSelf: 'flex-end',
  },
  managePolicyText: {
    fontSize: 13,
    fontWeight: '700',
    color: C.heroNav,
  },

  // ── Zone Card
  zoneRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 10,
  },
  zoneName: {
    fontSize: 16,
    fontWeight: '700',
    color: C.text,
    flex: 1,
  },
  zoneEmojiBig: {
    fontSize: 40,
    lineHeight: 48,
  },
  zoneStatusRow: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
    marginBottom: 12,
  },
  zonePill: {
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 5,
  },
  zonePillText: {
    fontSize: 12,
    fontWeight: '600',
  },
  weatherChipsRow: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  weatherChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: C.pillBg,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  weatherChipEmoji: {
    fontSize: 14,
  },
  weatherChipText: {
    fontSize: 13,
    fontWeight: '700',
    color: C.text,
  },

  // ── Quick Actions
  quickActionsRow: {
    flexDirection: 'row',
    gap: 10,
    marginHorizontal: 16,
    marginBottom: 12,
  },
  quickAction: {
    flex: 1,
    height: 52,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickActionPrimary: {
    backgroundColor: C.heroNav,
  },
  quickActionPrimaryText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  quickActionSecondary: {
    backgroundColor: C.pillBg,
    borderWidth: 1,
    borderColor: C.border,
  },
  quickActionSecondaryText: {
    fontSize: 14,
    fontWeight: '700',
    color: C.text,
  },

  // ── Demo Banner
  demoBanner: {
    marginHorizontal: 16,
    marginBottom: 24,
    backgroundColor: '#f0f4ff',
    borderRadius: 16,
    padding: 16,
    borderLeftWidth: 3,
    borderLeftColor: C.heroNav,
  },
  demoBannerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flexWrap: 'wrap',
  },
  demoBannerBadge: {
    backgroundColor: '#dde3ff',
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  demoBannerBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: C.heroNav,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  demoBannerDesc: {
    fontSize: 13,
    color: C.muted,
    flex: 1,
    flexShrink: 1,
  },
  demoBannerBtn: {
    backgroundColor: C.heroNav,
    borderRadius: 8,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
  },
  demoBannerBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.2,
  },
});
