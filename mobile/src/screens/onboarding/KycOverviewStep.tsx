import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';

interface Props {
  data: { kycStarted: boolean };
  onChange: (partial: { kycStarted: boolean }) => void;
}

const KYC_ITEMS = [
  { label: 'Aadhaar Number' },
  { label: 'Selfie Photo' },
  { label: 'Document Upload' },
];

export default function KycOverviewStep({ data, onChange }: Props) {
  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      {/* Heading */}
      <Text style={styles.heading}>Verify Your Identity</Text>
      <Text style={styles.subtitle}>One-time quick verification</Text>

      {/* Checklist items */}
      <View style={styles.itemList}>
        {KYC_ITEMS.map((item, idx) => (
          <View key={idx} style={styles.itemRow}>
            <View style={styles.checkCircle}>
              <Text style={styles.checkMark}>✓</Text>
            </View>
            <Text style={styles.itemLabel}>{item.label}</Text>
          </View>
        ))}
      </View>

      {/* Info box */}
      <View style={styles.infoBox}>
        <Text style={styles.infoText}>
          Your data is encrypted and never shared 🔒
        </Text>
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
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Heading + subtitle
  heading: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1A2233',
    letterSpacing: -0.2,
    textAlign: 'center',
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 13,
    fontWeight: '400',
    color: '#546E7A',
    lineHeight: 18,
    textAlign: 'center',
    marginBottom: 28,
  },

  // Checklist
  itemList: {
    width: '100%',
    gap: 14,
    marginBottom: 28,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  // Blue checkmark circle
  checkCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#1565C0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkMark: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  itemLabel: {
    fontSize: 15,
    fontWeight: '500',
    color: '#1A2233',
  },

  // Info box — blue
  infoBox: {
    width: '100%',
    backgroundColor: '#E8EFF8',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#1565C0',
    paddingVertical: 14,
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  infoText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#0D47A1',
    textAlign: 'center',
  },
});
