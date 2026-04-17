import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { ActiveTrigger } from '../store/useStore';
import { formatTriggerType } from '../utils/formatters';

interface Props {
  triggers: ActiveTrigger[];
  pincode?: string;
}

export default function WeatherAlert({ triggers, pincode }: Props) {
  if (!triggers || triggers.length === 0) return null;

  // Show the most severe / first active trigger
  const primary = triggers[0];
  const trigger = formatTriggerType(primary.type);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.emoji}>{trigger.emoji}</Text>
        <View style={styles.headerText}>
          <Text style={styles.alertTitle}>ACTIVE DISRUPTION ALERT</Text>
          <Text style={styles.alertType}>{trigger.label}</Text>
        </View>
        {triggers.length > 1 && (
          <View style={styles.countBadge}>
            <Text style={styles.countText}>+{triggers.length - 1}</Text>
          </View>
        )}
      </View>

      <Text style={styles.description}>
        {pincode ? `Zone ${pincode}: ` : ''}Your area is experiencing a weather disruption.
        Coverage is active and claims will be processed automatically.
      </Text>

      <View style={styles.footer}>
        <View style={styles.dot} />
        <Text style={styles.footerText}>Auto-claim in progress</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFF3E0',
    borderLeftWidth: 4,
    borderLeftColor: '#E65100',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FFCC80',
    padding: 14,
    marginVertical: 8,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 8,
  },
  emoji: { fontSize: 28 },
  headerText: { flex: 1 },
  alertTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: '#E65100',
    letterSpacing: 0.5,
  },
  alertType: {
    fontSize: 16,
    fontWeight: '800',
    color: '#212121',
  },
  countBadge: {
    backgroundColor: '#E65100',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  countText: { color: '#FFFFFF', fontSize: 12, fontWeight: '700' },
  description: {
    fontSize: 13,
    color: '#546E7A',
    lineHeight: 18,
    marginBottom: 10,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#4CAF50',
  },
  footerText: {
    fontSize: 12,
    color: '#4CAF50',
    fontWeight: '600',
  },
});
