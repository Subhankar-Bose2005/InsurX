import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, ScrollView } from 'react-native';

interface Props {
  data: { name: string; pincode: string; upiId?: string };
  onChange: (partial: any) => void;
}

export default function ZoneStep({ data, onChange }: Props) {
  const [focusedField, setFocusedField] = useState<string | null>(null);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      {/* Name Card */}
      <View style={styles.fieldCard}>
        <View style={styles.cardIconRow}>
          <Text style={styles.cardIcon}>👤</Text>
          <View style={styles.cardMeta}>
            <Text style={styles.cardTitle}>Your Name</Text>
            <Text style={styles.cardDesc}>Enter your full name</Text>
          </View>
        </View>
        <Text style={styles.inputLabel}>Full Name</Text>
        <TextInput
          style={[styles.input, focusedField === 'name' && styles.inputFocused]}
          value={data.name}
          onChangeText={(val) => onChange({ name: val })}
          placeholder="e.g. Rahul Kumar"
          placeholderTextColor="#90A4AE"
          autoCapitalize="words"
          autoCorrect={false}
          onFocus={() => setFocusedField('name')}
          onBlur={() => setFocusedField(null)}
        />
      </View>

      {/* Pincode Card */}
      <View style={styles.fieldCard}>
        <View style={styles.cardIconRow}>
          <Text style={styles.cardIcon}>📍</Text>
          <View style={styles.cardMeta}>
            <Text style={styles.cardTitle}>Delivery Zone</Text>
            <Text style={styles.cardDesc}>Enter your primary delivery pincode</Text>
          </View>
        </View>
        <Text style={styles.inputLabel}>Pincode</Text>
        <TextInput
          style={[styles.input, focusedField === 'pincode' && styles.inputFocused]}
          value={data.pincode}
          onChangeText={(val) => onChange({ pincode: val.replace(/\D/g, '').slice(0, 6) })}
          placeholder="e.g. 110001"
          placeholderTextColor="#90A4AE"
          keyboardType="number-pad"
          maxLength={6}
          onFocus={() => setFocusedField('pincode')}
          onBlur={() => setFocusedField(null)}
        />
        <Text style={styles.hint}>Your area pincode — used for weather & disruption tracking.</Text>
      </View>

      {/* UPI Card */}
      <View style={styles.fieldCard}>
        <View style={styles.cardIconRow}>
          <Text style={styles.cardIcon}>💳</Text>
          <View style={styles.cardMeta}>
            <Text style={styles.cardTitle}>UPI ID <Text style={styles.optional}>(Optional)</Text></Text>
            <Text style={styles.cardDesc}>For receiving payouts</Text>
          </View>
        </View>
        <Text style={styles.inputLabel}>UPI ID</Text>
        <TextInput
          style={[styles.input, focusedField === 'upi' && styles.inputFocused]}
          value={data.upiId || ''}
          onChangeText={(val) => onChange({ upiId: val.trim() })}
          placeholder="e.g. rahul@upi"
          placeholderTextColor="#90A4AE"
          autoCapitalize="none"
          autoCorrect={false}
          keyboardType="email-address"
          onFocus={() => setFocusedField('upi')}
          onBlur={() => setFocusedField(null)}
        />
        <Text style={styles.hint}>Required for receiving payouts. You can add this later.</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  content: { padding: 20, gap: 16 },
  fieldCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#BBDEFB',
    padding: 16,
    gap: 10,
    elevation: 1,
    shadowColor: '#1565C0',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
  },
  cardIconRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  cardIcon: { fontSize: 28 },
  cardMeta: { flex: 1 },
  cardTitle: { fontSize: 15, fontWeight: '700', color: '#212121' },
  cardDesc: { fontSize: 12, color: '#546E7A', marginTop: 2 },
  optional: { color: '#90A4AE', fontWeight: '400' },
  inputLabel: { fontSize: 12, fontWeight: '600', color: '#1565C0' },
  input: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: '#90CAF9',
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: '#212121',
    fontSize: 15,
  },
  inputFocused: { borderColor: '#1565C0' },
  hint: { fontSize: 11, color: '#90A4AE' },
});
