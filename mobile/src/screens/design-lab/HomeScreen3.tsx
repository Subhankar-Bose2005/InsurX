// DESIGN LAB - HomeScreen3
// Variant: "WARM BENTO"
// Aesthetic: Asymmetric editorial grid, warm cream background, no gradients,
// bold typographic blocks, tactile card surfaces. Inspired by Linear's web layout.

import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  Alert,
} from 'react-native';
import useStore from '../../store/useStore';
import { formatCurrency, formatDate } from '../../utils/formatters';

// ─── Palette ──────────────────────────────────────────────────────────────────
const C = {
  bg: '#faf9f7',
  cardWhite: '#FFFFFF',
  cardNavy: '#000666',
  cardGreen: '#1b6d24',
  cardAmber: '#ffdcc6',
  cardLight: '#f3f0eb',
  textDark: '#1a1a1a',
  textMuted: '#6b6b6b',
  border: 'rgba(0,0,0,0.06)',
  borderMid: 'rgba(0,0,0,0.08)',
};

// ─── Types ────────────────────────────────────────────────────────────────────
interface Props {
  navigation: any;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function getWeatherEmoji(rainfall: number, weatherMain?: string): string {
  if (rainfall > 20) return '⛈';
  if (rainfall > 5) return '🌧';
  const main = (weatherMain || '').toLowerCase();
  if (main.includes('cloud')) return '☁';
  if (main.includes('rain')) return '🌧';
  if (main.includes('thunder')) return '⛈';
  if (main.includes('haze') || main.includes('mist') || main.includes('fog')) return '🌫';
  return '☀';
}

function getInitial(name: string | null | undefined): string {
  if (!name) return '?';
  return name.trim().charAt(0).toUpperCase();
}

function getTodayLabel(): string {
  return new Date().toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
  });
}

// ─── Component ────────────────────────────────────────────────────────────────
export default function HomeScreen3({ navigation }: Props) {
  const { worker, activePolicy, claimSummary, weather, activeTriggers } = useStore();

  const isActive = activePolicy?.status === 'active';
  const coveragePercent = activePolicy?.coveragePercent ?? 0;
  const maxPayout = activePolicy?.maxPayout;
  const rainfall = weather?.rainfall_mm_per_hr ?? 0;
  const weatherEmoji = getWeatherEmoji(rainfall, weather?.weatherMain);
  const hasDisruption = activeTriggers.length > 0;

  function handleFireDemo() {
    Alert.alert(
      'Demo Trigger',
      'This will simulate a heavy rainfall event in your zone and fire an automatic payout.',
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
      <StatusBar barStyle="dark-content" backgroundColor={C.bg} />

      {/* ── Brand Bar ──────────────────────────────────────────────────────── */}
      <View style={styles.brandBar}>
        <View style={styles.brandLeft}>
          <Text style={styles.brandShield}>🛡</Text>
          <Text style={styles.brandName}>InsurX</Text>
        </View>
        <View style={styles.avatar}>
          <Text style={styles.avatarLetter}>{getInitial(worker?.name)}</Text>
        </View>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Hero Earnings Card ─────────────────────────────────────────── */}
        <View style={styles.heroCard}>
          {/* Top meta row */}
          <View style={styles.heroTopRow}>
            <Text style={styles.heroLabel}>EARNINGS PROTECTED</Text>
            <Text style={styles.heroDate}>{getTodayLabel()}</Text>
          </View>

          {/* Big amount */}
          <Text style={styles.heroAmount}>
            ₹{claimSummary.totalProtected.toLocaleString('en-IN')}
          </Text>

          {/* Sub-label */}
          <Text style={styles.heroSub}>
            {claimSummary.claimsThisWeek > 0
              ? `${claimSummary.claimsThisWeek} event${claimSummary.claimsThisWeek > 1 ? 's' : ''} triggered automatic payouts`
              : 'No events triggered this week'}
          </Text>

          {/* Divider + status row */}
          <View style={styles.heroDivider} />
          <View style={styles.heroStatusRow}>
            <Text style={styles.heroPolicyName}>
              Policy: {activePolicy?.planName || 'None'}
            </Text>
            <View style={styles.heroStatusPill}>
              <View
                style={[
                  styles.heroStatusDot,
                  { backgroundColor: isActive ? '#1b6d24' : '#9ca3af' },
                ]}
              />
              <Text
                style={[
                  styles.heroStatusText,
                  { color: isActive ? '#1b6d24' : '#9ca3af' },
                ]}
              >
                {isActive ? 'Active' : 'Inactive'}
              </Text>
            </View>
          </View>
        </View>

        {/* ── 2-Column Bento Row ─────────────────────────────────────────── */}
        <View style={styles.bentoRow}>
          {/* LEFT — navy coverage card */}
          <View style={[styles.bentoCard, styles.bentoNavy, { flex: 1.2 }]}>
            <Text style={styles.bentoNavyEyebrow}>SHIELD</Text>
            <Text style={styles.bentoNavyBig}>{coveragePercent}%</Text>
            <Text style={styles.bentoNavyCaption}>Coverage</Text>
          </View>

          {/* RIGHT — max payout card */}
          <View style={[styles.bentoCard, styles.bentoLight, { flex: 0.8 }]}>
            <Text style={styles.bentoLightEyebrow}>MAX PAYOUT</Text>
            <Text style={styles.bentoLightBig}>
              {maxPayout ? `₹${maxPayout.toLocaleString('en-IN')}` : '—'}
            </Text>
            <Text style={styles.bentoLightCaption}>/week</Text>
          </View>
        </View>

        {/* ── Weather Band ───────────────────────────────────────────────── */}
        <View style={styles.weatherBand}>
          {/* Zone + status row */}
          <View style={styles.weatherTopRow}>
            <View style={styles.weatherLeft}>
              <Text style={styles.weatherEmoji}>{weatherEmoji}</Text>
              <Text style={styles.weatherZone}>
                {weather?.city || worker?.zone || 'Your Zone'}
              </Text>
            </View>
            <View
              style={[
                styles.weatherPill,
                {
                  backgroundColor: hasDisruption ? '#ffdcc6' : '#dcfce7',
                },
              ]}
            >
              <Text
                style={[
                  styles.weatherPillText,
                  { color: hasDisruption ? '#7c2d12' : '#166534' },
                ]}
              >
                {hasDisruption ? '⚠ Alert' : '✓ Safe'}
              </Text>
            </View>
          </View>

          {/* 3 stats */}
          <View style={styles.weatherStats}>
            <View style={styles.weatherStatItem}>
              <Text style={styles.weatherStatText}>
                🌡 {weather?.temp != null ? `${Math.round(weather.temp)}°C` : '--'}
              </Text>
            </View>
            <View style={styles.weatherStatDivider} />
            <View style={styles.weatherStatItem}>
              <Text style={styles.weatherStatText}>
                💨 AQI {weather?.aqi ?? '--'}
              </Text>
            </View>
            <View style={styles.weatherStatDivider} />
            <View style={styles.weatherStatItem}>
              <Text style={styles.weatherStatText}>
                🌧 {rainfall > 0 ? `${rainfall}mm` : '0mm'}
              </Text>
            </View>
          </View>

          {/* Disruption strip */}
          {hasDisruption && (
            <View style={styles.disruptionStrip}>
              <Text style={styles.disruptionText}>
                ⚠ Active disruption — payout triggered
              </Text>
            </View>
          )}
        </View>

        {/* ── 2-Column Action Row ────────────────────────────────────────── */}
        <View style={styles.actionRow}>
          {/* Max payout CTA */}
          <TouchableOpacity
            style={[styles.actionCard, styles.actionGreen]}
            onPress={() => navigation.navigate('Policy')}
            activeOpacity={0.82}
          >
            <Text style={styles.actionGreenAmount}>
              {maxPayout ? `₹${maxPayout.toLocaleString('en-IN')}` : '₹0'}
            </Text>
            <Text style={styles.actionGreenCaption}>Max Payout</Text>
          </TouchableOpacity>

          {/* Claims card */}
          <TouchableOpacity
            style={[styles.actionCard, styles.actionLightCard]}
            onPress={() => navigation.navigate('Claims')}
            activeOpacity={0.82}
          >
            <Text style={styles.actionClaimsIcon}>📋</Text>
            <Text style={styles.actionClaimsLabel}>
              {claimSummary.claimsThisWeek} Claims
            </Text>
          </TouchableOpacity>
        </View>

        {/* ── Demo Card ──────────────────────────────────────────────────── */}
        <View style={styles.demoCard}>
          <View style={styles.demoBadge}>
            <Text style={styles.demoBadgeText}>DEMO MODE</Text>
          </View>
          <Text style={styles.demoDesc}>
            Fire a simulated weather trigger to test automatic payout flow.
          </Text>
          <TouchableOpacity
            style={styles.demoButton}
            onPress={handleFireDemo}
            activeOpacity={0.85}
          >
            <Text style={styles.demoButtonText}>Fire Demo Trigger →</Text>
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
    backgroundColor: C.bg,
  },

  // ── Brand Bar
  brandBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 52, // account for status bar on most devices
    paddingBottom: 16,
    backgroundColor: C.bg,
  },
  brandLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  brandShield: {
    fontSize: 16,
  },
  brandName: {
    fontSize: 15,
    fontWeight: '700',
    color: C.cardNavy,
    letterSpacing: 0.3,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: C.cardNavy,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarLetter: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
  },

  // ── Scroll
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },

  // ── Hero Card
  heroCard: {
    marginHorizontal: 16,
    marginBottom: 10,
    backgroundColor: C.cardWhite,
    borderRadius: 16,
    padding: 24,
    borderWidth: 1,
    borderColor: C.border,
  },
  heroTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  heroLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: C.textMuted,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },
  heroDate: {
    fontSize: 12,
    color: C.textMuted,
  },
  heroAmount: {
    fontSize: 48,
    fontWeight: '900',
    color: C.cardNavy,
    letterSpacing: -1.5,
    marginTop: 8,
    includeFontPadding: false,
  },
  heroSub: {
    fontSize: 13,
    color: C.textMuted,
    marginTop: 4,
    lineHeight: 18,
  },
  heroDivider: {
    height: 1,
    backgroundColor: C.border,
    marginVertical: 16,
  },
  heroStatusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  heroPolicyName: {
    fontSize: 13,
    color: C.textMuted,
    fontWeight: '500',
  },
  heroStatusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  heroStatusDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
  },
  heroStatusText: {
    fontSize: 13,
    fontWeight: '600',
  },

  // ── Bento Row
  bentoRow: {
    marginHorizontal: 16,
    flexDirection: 'row',
    gap: 10,
    marginBottom: 10,
    height: 160,
  },
  bentoCard: {
    borderRadius: 14,
    padding: 18,
    justifyContent: 'space-between',
  },
  bentoNavy: {
    backgroundColor: C.cardNavy,
  },
  bentoNavyEyebrow: {
    fontSize: 10,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.5)',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },
  bentoNavyBig: {
    fontSize: 44,
    fontWeight: '700',
    color: '#FFFFFF',
    includeFontPadding: false,
    letterSpacing: -1,
  },
  bentoNavyCaption: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.5)',
  },
  bentoLight: {
    backgroundColor: C.bg,
    borderWidth: 1,
    borderColor: C.borderMid,
  },
  bentoLightEyebrow: {
    fontSize: 10,
    fontWeight: '600',
    color: C.textMuted,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
  bentoLightBig: {
    fontSize: 24,
    fontWeight: '700',
    color: C.textDark,
    includeFontPadding: false,
  },
  bentoLightCaption: {
    fontSize: 12,
    color: C.textMuted,
  },

  // ── Weather Band
  weatherBand: {
    marginHorizontal: 16,
    marginBottom: 10,
    backgroundColor: C.cardLight,
    borderRadius: 14,
    paddingHorizontal: 18,
    paddingVertical: 16,
  },
  weatherTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  weatherLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  weatherEmoji: {
    fontSize: 22,
  },
  weatherZone: {
    fontSize: 16,
    fontWeight: '700',
    color: C.textDark,
  },
  weatherPill: {
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 5,
  },
  weatherPillText: {
    fontSize: 12,
    fontWeight: '600',
  },
  weatherStats: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  weatherStatItem: {
    flex: 1,
    alignItems: 'center',
  },
  weatherStatText: {
    fontSize: 13,
    fontWeight: '700',
    color: C.textDark,
  },
  weatherStatDivider: {
    width: 1,
    height: 20,
    backgroundColor: C.borderMid,
  },
  disruptionStrip: {
    marginTop: 12,
    backgroundColor: C.cardAmber,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 9,
  },
  disruptionText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#311300',
  },

  // ── Action Row
  actionRow: {
    marginHorizontal: 16,
    flexDirection: 'row',
    gap: 10,
    marginBottom: 10,
  },
  actionCard: {
    flex: 1,
    height: 80,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionGreen: {
    backgroundColor: C.cardGreen,
  },
  actionGreenAmount: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
    includeFontPadding: false,
  },
  actionGreenCaption: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.6)',
    marginTop: 3,
  },
  actionLightCard: {
    backgroundColor: C.cardLight,
    borderWidth: 1,
    borderColor: C.borderMid,
  },
  actionClaimsIcon: {
    fontSize: 20,
  },
  actionClaimsLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: C.textDark,
    marginTop: 4,
  },

  // ── Demo Card
  demoCard: {
    marginHorizontal: 16,
    marginBottom: 24,
    backgroundColor: C.cardWhite,
    borderRadius: 14,
    padding: 18,
    borderWidth: 1,
    borderColor: C.border,
  },
  demoBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#e0e0ff',
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  demoBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: C.cardNavy,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  demoDesc: {
    fontSize: 13,
    color: C.textMuted,
    marginTop: 6,
    lineHeight: 18,
  },
  demoButton: {
    backgroundColor: C.cardNavy,
    borderRadius: 8,
    height: 46,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
  },
  demoButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.2,
  },
});
