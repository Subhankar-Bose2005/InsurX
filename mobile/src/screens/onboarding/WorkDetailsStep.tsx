import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';

interface WorkData {
  partnerId: string;
  experienceYears: string;
  primaryShift: string;
  avgOrdersPerWeek: number;
}

interface Props {
  data: WorkData;
  onChange: (partial: Partial<WorkData>) => void;
}

const EXPERIENCE_OPTIONS = [
  { id: '<6m',   label: '<1 year' },
  { id: '6m-1y', label: '1\u20133 years' },
  { id: '1-2y',  label: '3+ years' },
];

const SHIFT_OPTIONS = [
  { id: 'morning',   label: 'Morning',   sub: '6\u201310am' },
  { id: 'afternoon', label: 'Afternoon', sub: '11am\u20133pm' },
  { id: 'evening',   label: 'Evening',   sub: '4\u20138pm' },
  { id: 'night',     label: 'Night',     sub: '8pm\u201312am' },
];

export default function WorkDetailsStep({ data, onChange }: Props) {
  const [focusedField, setFocusedField] = useState<string | null>(null);

  const incrementOrders = () => {
    const next = Math.min((data.avgOrdersPerWeek || 0) + 5, 200);
    onChange({ avgOrdersPerWeek: next });
  };

  const decrementOrders = () => {
    const next = Math.max((data.avgOrdersPerWeek || 0) - 5, 1);
    onChange({ avgOrdersPerWeek: next });
  };

  const handleOrdersText = (val: string) => {
    const num = parseInt(val.replace(/\D/g, ''), 10);
    if (!isNaN(num)) {
      onChange({ avgOrdersPerWeek: Math.min(Math.max(num, 1), 200) });
    } else if (val === '') {
      onChange({ avgOrdersPerWeek: 0 });
    }
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
    >
      {/* Heading — no large hero emoji */}
      <Text style={styles.heading}>Work Details</Text>
      <Text style={styles.subtitle}>Help us understand your schedule</Text>

      {/* Partner ID — Optional */}
      <View style={styles.fieldGroup}>
        <Text style={styles.label}>
          Partner ID <Text style={styles.optionalTag}>(Optional)</Text>
        </Text>
        <TextInput
          style={[styles.input, focusedField === 'partnerId' && styles.inputFocused]}
          value={data.partnerId}
          onChangeText={(val) => onChange({ partnerId: val.trim() })}
          placeholder="e.g. ZOM123456 or SWG789012"
          placeholderTextColor="#90A4AE"
          autoCapitalize="characters"
          autoCorrect={false}
          onFocus={() => setFocusedField('partnerId')}
          onBlur={() => setFocusedField(null)}
        />
        <Text style={styles.hint}>Find it in your delivery app under Profile &gt; Partner Details</Text>
      </View>

      {/* Experience — 3 equal pills in a row */}
      <View style={styles.fieldGroup}>
        <Text style={styles.label}>Delivery Experience</Text>
        <View style={styles.pillRow}>
          {EXPERIENCE_OPTIONS.map((opt) => {
            const selected = data.experienceYears === opt.id;
            return (
              <TouchableOpacity
                key={opt.id}
                style={[styles.pill, selected && styles.pillSelected]}
                onPress={() => onChange({ experienceYears: opt.id })}
                activeOpacity={0.8}
              >
                <Text style={[styles.pillText, selected && styles.pillTextSelected]}>
                  {opt.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* Primary Shift — 4 options in 2x2 grid */}
      <View style={styles.fieldGroup}>
        <Text style={styles.label}>Primary Shift</Text>
        <View style={styles.shiftGrid}>
          {SHIFT_OPTIONS.map((opt) => {
            const selected = data.primaryShift === opt.id;
            return (
              <TouchableOpacity
                key={opt.id}
                style={[styles.shiftCard, selected && styles.shiftCardSelected]}
                onPress={() => onChange({ primaryShift: opt.id })}
                activeOpacity={0.8}
              >
                <Text style={[styles.shiftLabel, selected && styles.shiftLabelSelected]}>
                  {opt.label}
                </Text>
                <Text style={[styles.shiftSub, selected && styles.shiftSubSelected]}>
                  {opt.sub}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* Avg Orders/Week counter */}
      <View style={styles.fieldGroup}>
        <Text style={styles.label}>
          Avg Orders/Week <Text style={styles.optionalTag}>(Optional)</Text>
        </Text>
        <View style={styles.counterRow}>
          {/* Minus button */}
          <TouchableOpacity
            style={[
              styles.counterCircleBtn,
              (data.avgOrdersPerWeek || 0) <= 1 && styles.counterCircleBtnDisabled,
            ]}
            onPress={decrementOrders}
            disabled={(data.avgOrdersPerWeek || 0) <= 1}
            activeOpacity={0.8}
          >
            <Text style={[
              styles.counterCircleBtnText,
              (data.avgOrdersPerWeek || 0) <= 1 && styles.counterCircleBtnTextDisabled,
            ]}>{'\u2212'}</Text>
          </TouchableOpacity>

          {/* Large centered number display */}
          <TextInput
            style={[styles.counterInput, focusedField === 'orders' && styles.counterInputFocused]}
            value={data.avgOrdersPerWeek ? String(data.avgOrdersPerWeek) : ''}
            onChangeText={handleOrdersText}
            keyboardType="number-pad"
            maxLength={3}
            textAlign="center"
            placeholder="0"
            placeholderTextColor="#90A4AE"
            onFocus={() => setFocusedField('orders')}
            onBlur={() => setFocusedField(null)}
          />

          {/* Plus button */}
          <TouchableOpacity
            style={[
              styles.counterCircleBtn,
              (data.avgOrdersPerWeek || 0) >= 200 && styles.counterCircleBtnDisabled,
            ]}
            onPress={incrementOrders}
            disabled={(data.avgOrdersPerWeek || 0) >= 200}
            activeOpacity={0.8}
          >
            <Text style={[
              styles.counterCircleBtnText,
              (data.avgOrdersPerWeek || 0) >= 200 && styles.counterCircleBtnTextDisabled,
            ]}>+</Text>
          </TouchableOpacity>
        </View>
        <Text style={styles.hint}>Active partners: 30\u2013120 orders/week</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F0F4F9',
  },
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

  // Field groups
  fieldGroup: {
    marginBottom: 16,
  },

  // Labels
  label: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1A2233',
    letterSpacing: 0.1,
    marginBottom: 5,
  },
  optionalTag: {
    fontSize: 11,
    fontWeight: '400',
    color: '#90A4AE',
  },

  // Standard text input
  input: {
    height: 48,
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#D5E3F5',
    paddingHorizontal: 14,
    color: '#1A2233',
    fontSize: 15,
  },
  inputFocused: {
    borderColor: '#1565C0',
    backgroundColor: '#FFFFFF',
  },

  // Hint text
  hint: {
    fontSize: 11,
    color: '#90A4AE',
    marginTop: 5,
  },

  // Experience pills — 3 equal width in a row
  pillRow: {
    flexDirection: 'row',
    gap: 10,
  },
  pill: {
    flex: 1,
    height: 40,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#D5E3F5',
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
  },
  pillSelected: {
    backgroundColor: '#E8EFF8',
    borderColor: '#1565C0',
  },
  pillText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#546E7A',
  },
  pillTextSelected: {
    color: '#1565C0',
  },

  // Shift 2x2 grid
  shiftGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  shiftCard: {
    width: '47.5%',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#D5E3F5',
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    minHeight: 60,
    justifyContent: 'center',
  },
  shiftCardSelected: {
    backgroundColor: '#E8EFF8',
    borderColor: '#1565C0',
  },
  shiftLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1A2233',
    marginBottom: 2,
  },
  shiftLabelSelected: {
    color: '#1565C0',
  },
  shiftSub: {
    fontSize: 11,
    color: '#90A4AE',
  },
  shiftSubSelected: {
    color: 'rgba(21,101,192,0.7)',
  },

  // Counter row: circle-btn [large input] circle-btn
  counterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  // 40px circle button
  counterCircleBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#D5E3F5',
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  counterCircleBtnDisabled: {
    opacity: 0.35,
  },
  counterCircleBtnText: {
    color: '#E87722',
    fontSize: 20,
    fontWeight: '600',
    lineHeight: 24,
  },
  counterCircleBtnTextDisabled: {
    color: '#90A4AE',
  },
  // Large centered counter display
  counterInput: {
    flex: 1,
    height: 52,
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#D5E3F5',
    color: '#1A2233',
    fontSize: 28,
    fontWeight: '700',
    textAlign: 'center',
  },
  counterInputFocused: {
    borderColor: '#1565C0',
    backgroundColor: '#FFFFFF',
  },
});
