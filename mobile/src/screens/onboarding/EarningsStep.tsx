import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';

interface Props {
  data: { weeklyEarnings: number; workingHours: number; coverageStartDate?: string };
  onChange: (partial: any) => void;
}

const HOURS_PILLS = [
  { label: '20\u201330 hrs', value: 25 },
  { label: '30\u201340 hrs', value: 35 },
  { label: '40\u201350 hrs', value: 45 },
  { label: '50+ hrs',        value: 55 },
];

export default function EarningsStep({ data, onChange }: Props) {
  const [focusedField, setFocusedField] = useState<string | null>(null);

  const hourlyRate = data.workingHours > 0 ? data.weeklyEarnings / data.workingHours : 0;

  const todayISO = new Date().toLocaleDateString('en-IN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).split('/').join('/');

  React.useEffect(() => {
    if (!data.coverageStartDate) {
      onChange({ coverageStartDate: todayISO });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const activePill = HOURS_PILLS.find((p) => p.value === data.workingHours) ?? null;

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      {/* Heading — no large emoji */}
      <Text style={styles.heading}>Your Earnings</Text>
      <Text style={styles.subtitle}>We use this to calculate your exact payout</Text>

      {/* Weekly Earnings */}
      <View style={styles.section}>
        <Text style={styles.label}>Weekly Earnings</Text>
        {/* Rs prefix + number input */}
        <View
          style={[
            styles.earningsRow,
            focusedField === 'earnings' && styles.earningsRowFocused,
          ]}
        >
          <View style={styles.prefix}>
            <Text style={styles.prefixText}>{'\u20B9'}</Text>
          </View>
          <TextInput
            style={styles.earningsInput}
            value={data.weeklyEarnings ? String(data.weeklyEarnings) : ''}
            onChangeText={(val) => {
              const num = parseInt(val.replace(/\D/g, ''), 10);
              onChange({ weeklyEarnings: isNaN(num) ? 0 : num });
            }}
            placeholder="3000"
            placeholderTextColor="#90A4AE"
            keyboardType="number-pad"
            onFocus={() => setFocusedField('earnings')}
            onBlur={() => setFocusedField(null)}
          />
        </View>
      </View>

      {/* Working Hours */}
      <View style={styles.section}>
        <Text style={styles.label}>Working Hours per Week</Text>

        {/* 4 quick-select pills in 2x2 grid */}
        <View style={styles.pillGrid}>
          {HOURS_PILLS.map((p) => {
            const isActive = activePill?.value === p.value;
            return (
              <TouchableOpacity
                key={p.value}
                style={[styles.pill, isActive && styles.pillActive]}
                onPress={() => onChange({ workingHours: p.value })}
                activeOpacity={0.8}
              >
                <Text style={[styles.pillText, isActive && styles.pillTextActive]}>
                  {p.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Manual hours input */}
        <View
          style={[
            styles.hoursRow,
            focusedField === 'hours' && styles.hoursRowFocused,
          ]}
        >
          <TextInput
            style={styles.hoursInput}
            value={data.workingHours ? String(data.workingHours) : ''}
            onChangeText={(val) => {
              const num = parseInt(val.replace(/\D/g, ''), 10);
              onChange({ workingHours: isNaN(num) ? 0 : Math.min(num, 84) });
            }}
            placeholder="Enter exact hours"
            placeholderTextColor="#90A4AE"
            keyboardType="number-pad"
            onFocus={() => setFocusedField('hours')}
            onBlur={() => setFocusedField(null)}
          />
          <View style={styles.suffix}>
            <Text style={styles.suffixText}>hrs</Text>
          </View>
        </View>
      </View>

      {/* Live Hourly Rate Card — only shows when both fields filled */}
      {data.weeklyEarnings > 0 && data.workingHours > 0 && (
        <View style={styles.rateCard}>
          <View>
            <Text style={styles.rateValue}>{'\u20B9'}{hourlyRate.toFixed(0)}/hr</Text>
            <Text style={styles.rateLabel}>Your hourly rate</Text>
          </View>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F0F4F9' },
  content: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 32,
  },

  // Heading area
  heading: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1A2233',
    letterSpacing: -0.2,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 13,
    fontWeight: '400',
    color: '#546E7A',
    lineHeight: 18,
    marginBottom: 20,
  },

  section: { marginBottom: 20 },

  label: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1A2233',
    letterSpacing: 0.1,
    marginBottom: 8,
  },

  // Weekly earnings — Rs prefix row
  earningsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#D5E3F5',
    overflow: 'hidden',
    height: 48,
  },
  earningsRowFocused: {
    borderColor: '#1565C0',
    backgroundColor: '#FFFFFF',
  },
  prefix: {
    paddingHorizontal: 14,
    height: '100%',
    justifyContent: 'center',
    borderRightWidth: 1,
    borderRightColor: '#D5E3F5',
  },
  prefixText: { color: '#1565C0', fontSize: 18, fontWeight: '600' },
  earningsInput: {
    flex: 1,
    color: '#1A2233',
    fontSize: 15,
    fontWeight: '500',
    paddingHorizontal: 14,
    height: '100%',
  },

  // Hours pills — 2x2 grid
  pillGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 10,
  },
  pill: {
    width: '47.5%',
    height: 40,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#D5E3F5',
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 14,
  },
  pillActive: {
    borderColor: '#1565C0',
    backgroundColor: '#E8EFF8',
  },
  pillText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#546E7A',
  },
  pillTextActive: { color: '#1565C0' },

  // Manual hours input row
  hoursRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#D5E3F5',
    overflow: 'hidden',
    height: 48,
  },
  hoursRowFocused: {
    borderColor: '#1565C0',
    backgroundColor: '#FFFFFF',
  },
  hoursInput: {
    flex: 1,
    color: '#1A2233',
    fontSize: 15,
    fontWeight: '400',
    paddingHorizontal: 14,
    height: '100%',
  },
  suffix: {
    paddingHorizontal: 14,
    height: '100%',
    justifyContent: 'center',
    borderLeftWidth: 1,
    borderLeftColor: '#D5E3F5',
  },
  suffixText: { color: '#546E7A', fontSize: 13, fontWeight: '500' },

  // Live rate card
  rateCard: {
    backgroundColor: '#E8EFF8',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#1565C0',
    padding: 16,
  },
  rateValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1565C0',
    marginBottom: 2,
  },
  rateLabel: {
    fontSize: 12,
    color: '#546E7A',
  },
});
