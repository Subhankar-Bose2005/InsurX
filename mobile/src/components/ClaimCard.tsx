import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Claim } from '../store/useStore';
import StatusBadge from './StatusBadge';
import { formatCurrency, formatDate, formatTriggerType, formatRelativeDate } from '../utils/formatters';

interface Props {
  claim: Claim;
}

export default function ClaimCard({ claim }: Props) {
  const [expanded, setExpanded] = useState(false);
  const trigger = formatTriggerType(claim.triggerType);

  const fraudColor =
    claim.fraudScore < 0.3 ? '#16A34A' :
    claim.fraudScore < 0.7 ? '#D97706' : '#DC2626';

  const fraudLabel =
    claim.fraudScore < 0.3 ? 'Clean' :
    claim.fraudScore < 0.7 ? 'Review' : 'High Risk';

  return (
    <TouchableOpacity
      style={[styles.card, { borderLeftColor: trigger.color }]}
      onPress={() => setExpanded(!expanded)}
      activeOpacity={0.85}
    >
      {/* Top Row */}
      <View style={styles.row}>
        <View style={[styles.iconBg, { backgroundColor: trigger.color + '18' }]}>
          <Text style={styles.emoji}>{trigger.emoji}</Text>
        </View>
        <View style={styles.content}>
          <View style={styles.topRow}>
            <Text style={styles.triggerLabel}>{claim.triggerLabel || trigger.label}</Text>
            <Text style={[styles.amount, { color: trigger.color }]}>
              {formatCurrency(claim.finalPayout)}
            </Text>
          </View>
          <View style={styles.midRow}>
            <Text style={styles.meta}>
              {claim.disruptedHours ? `${claim.disruptedHours}h` : ''}
              {claim.shiftLabel ? ` · ${claim.shiftLabel}` : ''}
              {claim.shiftMultiplier && claim.shiftMultiplier !== 1 ? ` ×${claim.shiftMultiplier}` : ''}
            </Text>
            <StatusBadge status={claim.status} size="sm" />
          </View>
          <View style={styles.bottomRow}>
            <Text style={styles.date}>{formatRelativeDate(claim.createdAt)}</Text>
            {claim.paidAt && (
              <Text style={styles.paidDate}>Paid {formatDate(claim.paidAt)}</Text>
            )}
          </View>
        </View>
      </View>

      {/* Expand/collapse indicator */}
      <Text style={styles.expandHint}>{expanded ? '▲ less' : '▼ details'}</Text>

      {/* Expanded breakdown */}
      {expanded && (
        <View style={styles.breakdown}>
          <View style={styles.breakdownDivider} />

          <View style={styles.breakdownGrid}>
            <BreakdownRow label="Base Payout" value={formatCurrency(claim.basePayout || 0)} />
            <BreakdownRow
              label="Shift Multiplier"
              value={`×${claim.shiftMultiplier || 1} (${claim.shiftLabel || 'Normal'})`}
            />
            <BreakdownRow
              label="Final Payout"
              value={formatCurrency(claim.finalPayout)}
              bold
            />
            <BreakdownRow
              label="Fraud Score"
              value={
                <Text style={{ color: fraudColor, fontWeight: '700' }}>
                  {claim.fraudScore !== undefined
                    ? `${(claim.fraudScore * 100).toFixed(0)}% — ${fraudLabel}`
                    : '—'}
                </Text>
              }
            />
            {claim.razorpayPayoutId && (
              <BreakdownRow label="Payout ID" value={claim.razorpayPayoutId.slice(0, 24) + '...'} />
            )}
            {claim.weekBatchDate && (
              <BreakdownRow label="Batch Date" value={formatDate(claim.weekBatchDate)} />
            )}
          </View>

          <View style={styles.parametricNote}>
            <Text style={styles.parametricText}>
              Automatically triggered by parametric sensor data. No claim filed by worker.
            </Text>
          </View>
        </View>
      )}
    </TouchableOpacity>
  );
}

function BreakdownRow({ label, value, bold }: { label: string; value: any; bold?: boolean }) {
  return (
    <View style={styles.breakdownRow}>
      <Text style={styles.breakdownLabel}>{label}</Text>
      {typeof value === 'string' ? (
        <Text style={[styles.breakdownValue, bold && styles.breakdownValueBold]}>{value}</Text>
      ) : (
        <View>{value}</View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 14,
    marginVertical: 5,
    borderWidth: 1,
    borderColor: '#BBDEFB',
    borderLeftWidth: 4,
    elevation: 1,
    shadowColor: '#1565C0',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
  },
  row: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  iconBg: {
    width: 44, height: 44, borderRadius: 22,
    alignItems: 'center', justifyContent: 'center',
  },
  emoji: { fontSize: 22 },
  content: { flex: 1, gap: 4 },
  topRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  triggerLabel: { fontSize: 15, fontWeight: '700', color: '#212121', flex: 1 },
  amount: { fontSize: 16, fontWeight: '800' },
  midRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  meta: { fontSize: 12, color: '#546E7A', flex: 1 },
  bottomRow: { flexDirection: 'row', justifyContent: 'space-between' },
  date: { fontSize: 11, color: '#90A4AE' },
  paidDate: { fontSize: 11, color: '#0369A1', fontWeight: '600' },
  expandHint: { fontSize: 11, color: '#90CAF9', textAlign: 'right', marginTop: 6 },
  breakdown: { marginTop: 4 },
  breakdownDivider: { height: 1, backgroundColor: '#EBF5FF', marginVertical: 10 },
  breakdownGrid: { gap: 6 },
  breakdownRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  breakdownLabel: { fontSize: 12, color: '#546E7A' },
  breakdownValue: { fontSize: 12, color: '#212121', fontWeight: '500' },
  breakdownValueBold: { fontWeight: '800', color: '#1565C0', fontSize: 14 },
  parametricNote: {
    backgroundColor: '#EBF5FF',
    borderRadius: 8,
    padding: 10,
    marginTop: 10,
  },
  parametricText: { fontSize: 11, color: '#546E7A', lineHeight: 16 },
});
