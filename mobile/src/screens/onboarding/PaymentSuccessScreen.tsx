import React from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, ScrollView, SafeAreaView,
} from 'react-native';

interface Props {
  route: { params: { plan?: string; weeklyEarnings?: number; paymentId?: string } };
  navigation: any;
}

const PLAN_PREMIUMS: Record<string, number> = {
  basic: 29,
  shield: 59,
  'shield+': 99,
};

const PLAN_COVERAGE: Record<string, string> = {
  basic: '50% income coverage, up to \u20B9400/week',
  shield: '75% income coverage, up to \u20B9800/week',
  'shield+': '100% income coverage, up to \u20B91,500/week',
};

function generateQuoteId() {
  return 'INS-' + Math.floor(10000000 + Math.random() * 90000000).toString();
}

function formatDate(date: Date) {
  return date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

function capitalize(str: string) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

// Colored dot + label — no emoji in rows
const WHAT_IS_COVERED = [
  { dotColor: '#1565C0', label: 'Heavy Rainfall (>30mm/hr, 2+ hrs)' },
  { dotColor: '#D32F2F', label: 'Extreme Heat (>45\u00B0C, 3+ hrs)' },
  { dotColor: '#7B2FBE', label: 'Severe AQI (>400, 4+ hrs)' },
  { dotColor: '#90A4AE', label: 'Flooding and Curfew orders' },
];

const PAYOUT_STEPS = [
  'A trigger is detected (e.g. heavy rain in your zone)',
  'We automatically verify it \u2014 no claim filing needed',
  'Payout is sent to your UPI every Monday',
];

export default function PaymentSuccessScreen({ route, navigation }: Props) {
  const { plan = 'shield', weeklyEarnings = 3000, paymentId } = route.params || {};
  const premium = PLAN_PREMIUMS[plan] || 59;

  const today = new Date();
  const endDate = new Date(today);
  endDate.setDate(today.getDate() + 7);

  const quoteId = React.useRef(generateQuoteId()).current;

  const handleHome = () => {
    navigation.replace('Worker');
  };

  const displayPaymentId = paymentId || quoteId;

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Top success section */}
        <View style={styles.heroSection}>
          <View style={styles.iconCircle}>
            <Text style={styles.iconSymbol}>&#9672;</Text>
          </View>
          <Text style={styles.heroHeading}>You&apos;re Protected.</Text>
          <Text style={styles.heroSubtext}>
            Your income protection is active. Parametric payouts are fully automatic.
          </Text>
        </View>

        {/* Plan selected label + plan name + price */}
        <View style={styles.planSection}>
          <Text style={styles.sectionHead}>PLAN SELECTED</Text>
          <Text style={styles.planName}>{capitalize(plan)}</Text>
          <Text style={styles.planPrice}>
            <Text style={styles.planPriceAmount}>{'\u20B9'}{premium}</Text>
            <Text style={styles.planPriceFreq}> / week</Text>
          </Text>
        </View>

        {/* Details card — InfoRow layout */}
        <View style={styles.detailsCard}>
          {/* Row: Plan */}
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Plan</Text>
            <Text style={styles.infoValue}>{capitalize(plan)}</Text>
          </View>
          <View style={styles.infoRowDivider} />

          {/* Row: Coverage */}
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Coverage</Text>
            <Text style={[styles.infoValue, styles.infoValueWrap]}>{PLAN_COVERAGE[plan] || PLAN_COVERAGE['shield']}</Text>
          </View>
          <View style={styles.infoRowDivider} />

          {/* Row: Weekly earnings */}
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Weekly Earnings</Text>
            <Text style={styles.infoValue}>{'\u20B9'}{weeklyEarnings.toLocaleString('en-IN')}</Text>
          </View>
          <View style={styles.infoRowDivider} />

          {/* Row: Active from */}
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Active From</Text>
            <Text style={styles.infoValue}>{formatDate(today)}</Text>
          </View>
          <View style={styles.infoRowDivider} />

          {/* Row: Expires */}
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Expires</Text>
            <Text style={styles.infoValue}>{formatDate(endDate)}</Text>
          </View>
          <View style={styles.infoRowDivider} />

          {/* Row: Payment ID */}
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Payment ID</Text>
            <Text style={[styles.infoValue, styles.infoValueMono]} numberOfLines={1} ellipsizeMode="tail">
              {displayPaymentId}
            </Text>
          </View>
        </View>

        {/* CTA */}
        <TouchableOpacity style={styles.ctaBtn} onPress={handleHome} activeOpacity={0.85}>
          <Text style={styles.ctaBtnText}>Go to Dashboard {'\u2192'}</Text>
        </TouchableOpacity>

        {/* Bottom note */}
        <Text style={styles.bottomNote}>Income protection activates immediately</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F8F7F4',
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 32,
    paddingBottom: 48,
    gap: 20,
  },

  // Hero / top success section
  heroSection: {
    alignItems: 'center',
    paddingTop: 12,
    paddingBottom: 8,
    gap: 14,
  },
  iconCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: '#F1F0EC',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconSymbol: {
    fontSize: 72,
    color: '#166534',
    lineHeight: 80,
    includeFontPadding: false,
  },
  heroHeading: {
    fontSize: 32,
    fontWeight: '900',
    color: '#0f0f0e',
    letterSpacing: -1,
    textAlign: 'center',
  },
  heroSubtext: {
    fontSize: 14,
    color: '#9ca3af',
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: 8,
  },

  // Plan selected label + name + price
  planSection: {
    gap: 4,
  },
  sectionHead: {
    fontSize: 11,
    color: '#9ca3af',
    fontWeight: '600',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  planName: {
    fontSize: 20,
    fontWeight: '700',
    color: '#0f0f0e',
  },
  planPrice: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  planPriceAmount: {
    fontSize: 18,
    fontWeight: '700',
    color: '#166534',
  },
  planPriceFreq: {
    fontSize: 13,
    fontWeight: '400',
    color: '#9ca3af',
  },

  // Details card — surface bg, InfoRow format
  detailsCard: {
    backgroundColor: '#F1F0EC',
    borderRadius: 6,
    overflow: 'hidden',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 13,
    gap: 12,
  },
  infoRowDivider: {
    height: 1,
    backgroundColor: '#e5e3de',
    marginHorizontal: 16,
  },
  infoLabel: {
    fontSize: 12,
    color: '#9ca3af',
    fontWeight: '400',
    flexShrink: 0,
  },
  infoValue: {
    fontSize: 13,
    color: '#0f0f0e',
    fontWeight: '500',
    textAlign: 'right',
    flex: 1,
  },
  infoValueWrap: {
    flexWrap: 'wrap',
  },
  infoValueMono: {
    fontVariant: ['tabular-nums'],
    fontSize: 12,
  },

  // CTA — ink bg, paper text, br:4, h:56
  ctaBtn: {
    backgroundColor: '#0f0f0e',
    borderRadius: 4,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ctaBtnText: {
    color: '#F8F7F4',
    fontSize: 15,
    fontWeight: '700',
  },

  // Bottom footnote
  bottomNote: {
    fontSize: 11,
    color: '#9ca3af',
    textAlign: 'center',
    marginTop: -8,
  },
});
