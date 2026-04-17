import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { formatCurrency } from '../utils/formatters';

interface Plan {
  id: string;
  name: string;
  weeklyPremium: number;
  coveragePercent: number;
  maxPayoutPerWeek: number;
  description: string;
}

interface Props {
  plan: Plan;
  selected: boolean;
  onSelect: (planId: string) => void;
  recommended?: boolean;
  disabled?: boolean;
}

const PLAN_COLORS: Record<string, { border: string; accent: string; bg: string }> = {
  basic:    { border: '#90A4AE', accent: '#546E7A', bg: '#F5F5F5' },
  shield:   { border: '#1565C0', accent: '#1565C0', bg: '#E3F2FD' },
  'shield+': { border: '#1976D2', accent: '#1976D2', bg: '#E3F2FD' },
};

export default function PlanCard({ plan, selected, onSelect, recommended, disabled }: Props) {
  const colors = PLAN_COLORS[plan.id] || PLAN_COLORS.basic;

  return (
    <TouchableOpacity
      style={[
        styles.card,
        selected && { borderColor: colors.border, borderWidth: 2, backgroundColor: colors.bg },
        disabled && styles.disabled,
      ]}
      onPress={() => !disabled && onSelect(plan.id)}
      activeOpacity={0.8}
    >
      {recommended && (
        <View style={[styles.recommendedBadge, { backgroundColor: colors.accent }]}>
          <Text style={styles.recommendedText}>Most Popular</Text>
        </View>
      )}

      <View style={styles.header}>
        <Text style={[styles.planName, { color: selected ? colors.accent : '#212121' }]}>
          {plan.name}
        </Text>
        <View>
          <Text style={[styles.price, { color: selected ? colors.accent : '#212121' }]}>
            {formatCurrency(plan.weeklyPremium)}
          </Text>
          <Text style={styles.priceLabel}>/week</Text>
        </View>
      </View>

      <Text style={styles.description}>{plan.description}</Text>

      <View style={styles.featureRow}>
        <FeatureItem
          label="Coverage"
          value={`${plan.coveragePercent}%`}
          accent={selected ? colors.accent : '#546E7A'}
        />
        <FeatureItem
          label="Max Payout"
          value={formatCurrency(plan.maxPayoutPerWeek)}
          accent={selected ? colors.accent : '#546E7A'}
        />
      </View>

      {selected && (
        <View style={[styles.selectedIndicator, { backgroundColor: colors.accent }]}>
          <Text style={styles.selectedText}>Selected ✓</Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

function FeatureItem({ label, value, accent }: { label: string; value: string; accent: string }) {
  return (
    <View style={styles.feature}>
      <Text style={styles.featureLabel}>{label}</Text>
      <Text style={[styles.featureValue, { color: accent }]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#BBDEFB',
    padding: 16,
    marginVertical: 6,
    marginHorizontal: 16,
    position: 'relative',
    overflow: 'hidden',
    elevation: 1,
    shadowColor: '#1565C0',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
  },
  disabled: { opacity: 0.5 },
  recommendedBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  recommendedText: { color: '#FFFFFF', fontSize: 11, fontWeight: '700' },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 6,
  },
  planName: {
    fontSize: 20,
    fontWeight: '700',
  },
  price: {
    fontSize: 24,
    fontWeight: '800',
    textAlign: 'right',
  },
  priceLabel: {
    fontSize: 12,
    color: '#90A4AE',
    textAlign: 'right',
  },
  description: {
    fontSize: 13,
    color: '#546E7A',
    marginBottom: 12,
    lineHeight: 18,
  },
  featureRow: { flexDirection: 'row', gap: 12 },
  feature: {
    flex: 1,
    backgroundColor: '#EBF5FF',
    borderRadius: 8,
    padding: 8,
    alignItems: 'center',
  },
  featureLabel: { fontSize: 11, color: '#90A4AE', marginBottom: 2 },
  featureValue: { fontSize: 16, fontWeight: '700' },
  selectedIndicator: {
    marginTop: 12,
    paddingVertical: 6,
    borderRadius: 8,
    alignItems: 'center',
  },
  selectedText: { color: '#FFFFFF', fontWeight: '700', fontSize: 14 },
});
