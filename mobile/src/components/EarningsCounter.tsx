import React, { useEffect, useRef } from 'react';
import { View, Text, Animated, StyleSheet, TouchableOpacity } from 'react-native';
import { formatCurrency, formatPayoutDate } from '../utils/formatters';

interface Props {
  totalProtected: number;
  lastPayout: { amount: number; date: string } | null;
  onPress?: () => void;
}

const C = {
  paper:    '#F8F7F4',
  ink:      '#0f0f0e',
  inkFaint: '#9ca3af',
  inkMid:   '#4b5563',
  column:   '#e5e3de',
  emerald:  '#166534',
  emeraldBg:'#f0fdf4',
  surface:  '#F1F0EC',
};

export default function EarningsCounter({ totalProtected, lastPayout, onPress }: Props) {
  const animatedValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(animatedValue, {
      toValue: totalProtected,
      duration: 1400,
      useNativeDriver: false,
    }).start();
  }, [totalProtected]);

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={onPress}
      activeOpacity={onPress ? 0.82 : 1}
    >
      {/* Double rule header */}
      <View style={styles.ruleBlock}>
        <View style={styles.ruleThick} />
        <View style={styles.ruleThin} />
      </View>

      <Text style={styles.label}>TOTAL PROTECTED</Text>

      <Animated.Text style={styles.amount}>
        {formatCurrency(totalProtected)}
      </Animated.Text>

      <Text style={styles.sublabel}>earnings secured by InsurX</Text>

      {/* Column rule divider */}
      <View style={styles.divider} />

      {lastPayout ? (
        <View style={styles.payoutRow}>
          <View style={styles.payoutLeft}>
            <Text style={styles.payoutLabel}>LAST PAYOUT</Text>
            <Text style={styles.payoutAmount}>{formatCurrency(lastPayout.amount)}</Text>
          </View>
          <Text style={styles.payoutDate}>{formatPayoutDate(lastPayout.date)}</Text>
        </View>
      ) : (
        <View style={styles.noPayoutRow}>
          <Text style={styles.noPayoutSymbol}>◈</Text>
          <Text style={styles.noPayoutText}>No payouts yet — stay protected</Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: C.paper,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: C.column,
    padding: 20,
    gap: 6,
  },

  // Double rule
  ruleBlock: { gap: 2, marginBottom: 10 },
  ruleThick: { height: 2, backgroundColor: C.ink, width: 48 },
  ruleThin:  { height: 1, backgroundColor: C.column, width: 48 },

  label: {
    fontSize: 9,
    fontWeight: '700',
    color: C.inkFaint,
    letterSpacing: 2.5,
    textTransform: 'uppercase',
  },
  amount: {
    fontSize: 48,
    fontWeight: '900',
    color: C.emerald,
    letterSpacing: -1,
    lineHeight: 54,
    marginVertical: 2,
  },
  sublabel: {
    fontSize: 12,
    color: C.inkFaint,
    fontWeight: '400',
  },

  divider: {
    height: 1,
    backgroundColor: C.column,
    marginVertical: 10,
  },

  // Last payout row
  payoutRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
  },
  payoutLeft: { gap: 2 },
  payoutLabel: {
    fontSize: 9,
    fontWeight: '700',
    color: C.inkFaint,
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  payoutAmount: {
    fontSize: 20,
    fontWeight: '800',
    color: C.ink,
    letterSpacing: -0.5,
  },
  payoutDate: {
    fontSize: 11,
    color: C.inkFaint,
    fontWeight: '400',
    paddingBottom: 2,
  },

  // No payout
  noPayoutRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  noPayoutSymbol: {
    fontSize: 14,
    color: C.inkFaint,
  },
  noPayoutText: {
    fontSize: 12,
    color: C.inkFaint,
    fontWeight: '400',
  },
});
