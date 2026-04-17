import React from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';

const C = {
  primary: '#000666',
  primaryContainer: '#1A237E',
  secondary: '#1b6d24',
  success: '#16a34a',
  bg: '#f9f9f9',
  surfaceLow: '#f3f3f3',
  surfaceLowest: '#FFFFFF',
  surfaceHighest: '#e2e2e2',
  onSurface: '#1a1c1c',
  onSurfaceVariant: '#454652',
};

const PLANS = [
  {
    id: 'basic',
    name: 'BASIC',
    weeklyPremium: 29,
    coveragePercent: 50,
    maxPayoutPerWeek: 400,
    badge: null,
    features: [
      { emoji: '💰', text: '50% income coverage', bold: true },
      { emoji: '💳', text: 'Max payout ₹400', bold: false },
    ],
  },
  {
    id: 'shield',
    name: 'SHIELD',
    weeklyPremium: 59,
    coveragePercent: 70,
    maxPayoutPerWeek: 800,
    badge: 'MOST POPULAR',
    features: [
      { emoji: '✅', text: '70% income coverage', bold: true },
      { emoji: '💳', text: 'Max payout ₹800', bold: false },
      { emoji: '🌧', text: 'Weather Protection', bold: false },
    ],
  },
  {
    id: 'shield+',
    name: 'SHIELD+',
    weeklyPremium: 99,
    coveragePercent: 90,
    maxPayoutPerWeek: 1500,
    badge: null,
    features: [
      { emoji: '🛡', text: '90% income coverage', bold: true },
      { emoji: '💳', text: 'Max payout ₹1,500', bold: false },
      { emoji: '📦', text: 'Order Drop Cover', bold: false },
      { emoji: '⚡', text: 'Instant UPI Payout', bold: true },
    ],
  },
];

interface Props {
  data: { selectedPlan: string; weeklyEarnings?: number };
  onChange: (partial: any) => void;
}

export default function PlanStep({ data, onChange }: Props) {
  const selectedPlanConfig = PLANS.find((p) => p.id === data.selectedPlan);
  const baseEarnings = data.weeklyEarnings ?? 3000;

  const estimatedPayout = selectedPlanConfig
    ? Math.round((selectedPlanConfig.coveragePercent / 100) * baseEarnings)
    : 0;

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ paddingBottom: 120, paddingHorizontal: 16, paddingTop: 16 }}
      showsVerticalScrollIndicator={false}
    >
      <Text style={styles.heading}>Protect your earnings.</Text>
      <Text style={styles.subtitle}>Select a weekly plan for gig partners.</Text>

      <View style={styles.planList}>
        {PLANS.map((plan) => {
          const isShield = plan.id === 'shield';
          const isSelected = data.selectedPlan === plan.id;

          return (
            <View
              key={plan.id}
              style={[
                styles.planCard,
                isShield && styles.planCardShield,
                isSelected && styles.selectedCard,
              ]}
            >
              {plan.badge && (
                <View style={styles.popularBadge}>
                  <Text style={styles.popularBadgeText}>{plan.badge}</Text>
                </View>
              )}

              <Text style={[styles.planLabel, isShield && styles.planLabelShield]}>
                {plan.name}
              </Text>

              <View style={styles.priceRow}>
                <Text style={styles.planPrice}>₹{plan.weeklyPremium}</Text>
                <Text style={styles.planPriceUnit}>/week</Text>
              </View>

              <View style={styles.featureList}>
                {plan.features.map((f, idx) => (
                  <View key={idx} style={styles.featureRow}>
                    <Text style={styles.featureEmoji}>{f.emoji}</Text>
                    <Text style={[styles.featureText, f.bold && styles.featureTextBold]}>
                      {f.text}
                    </Text>
                  </View>
                ))}
              </View>

              <TouchableOpacity
                style={[
                  styles.selectBtn,
                  isShield && styles.selectBtnShield,
                  isSelected && styles.selectedBtn,
                ]}
                onPress={() => onChange({ selectedPlan: plan.id })}
              >
                <Text
                  style={[
                    styles.selectBtnText,
                    isShield && styles.selectBtnTextShield,
                    isSelected && styles.selectedBtnText,
                  ]}
                >
                  {isSelected ? 'Selected ✓' : 'Select'}
                </Text>
              </TouchableOpacity>
            </View>
          );
        })}
      </View>

      {selectedPlanConfig && (
        <View style={styles.quoteBox}>
          <Text style={{ fontWeight: '600' }}>
            ₹{estimatedPayout} per disruption
          </Text>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg },

  heading: { fontSize: 28, fontWeight: '800', marginBottom: 6 },
  subtitle: { fontSize: 14, marginBottom: 20, color: C.onSurfaceVariant },

  planList: { gap: 12 },

  planCard: {
    backgroundColor: C.surfaceLow,
    borderRadius: 10,
    padding: 20,
  },

  planCardShield: {
    backgroundColor: C.surfaceLowest,
    borderWidth: 2,
    borderColor: C.primaryContainer,
  },

  selectedCard: {
    borderWidth: 2,
    borderColor: C.success,
    backgroundColor: '#ecfdf5',
  },

  popularBadge: {
    position: 'absolute',
    top: -10,
    left: 20,
    backgroundColor: C.secondary,
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 10,
  },

  popularBadgeText: { color: '#fff', fontSize: 10, fontWeight: '700' },

  planLabel: { fontSize: 12, marginBottom: 8 },
  planLabelShield: { color: C.primary },

  priceRow: { flexDirection: 'row', alignItems: 'baseline', marginBottom: 16 },
  planPrice: { fontSize: 32, fontWeight: '800' },
  planPriceUnit: { fontSize: 14 },

  featureList: { marginBottom: 20 },
  featureRow: { flexDirection: 'row', marginBottom: 6 },
  featureEmoji: { marginRight: 6 },
  featureText: { fontSize: 13 },
  featureTextBold: { fontWeight: '700' },

  selectBtn: {
    backgroundColor: C.surfaceHighest,
    borderRadius: 6,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
  },

  selectBtnShield: {
    backgroundColor: C.primaryContainer,
  },

  selectedBtn: {
    backgroundColor: C.success,
  },

  selectBtnText: {
    fontWeight: '700',
    color: C.primary,
  },

  selectBtnTextShield: {
    color: '#fff',
  },

  selectedBtnText: {
    color: '#fff',
  },

  quoteBox: {
    marginTop: 20,
    padding: 16,
    backgroundColor: '#fff',
    borderRadius: 8,
  },
});