import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';

interface BankData {
  upiId: string;
  bankAccount: string;
  ifscCode: string;
}

interface Props {
  data: BankData;
  onChange: (partial: Partial<BankData>) => void;
}

export default function BankDetailsStep({ data, onChange }: Props) {
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [bankExpanded, setBankExpanded] = useState(false);

  const upiValid = data.upiId.includes('@') && data.upiId.trim().length > 3;

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
    >
      {/* Heading area */}
      <Text style={styles.heading}>Payment Details</Text>
      <Text style={styles.subtitle}>Your payouts land here every Monday</Text>

      {/* UPI ID */}
      <View style={styles.fieldGroup}>
        <Text style={styles.label}>UPI ID</Text>
        <View style={styles.inputWrapper}>
          <TextInput
            style={[
              styles.input,
              focusedField === 'upi' && styles.inputFocused,
              upiValid && styles.inputValid,
            ]}
            value={data.upiId}
            onChangeText={(val) => onChange({ upiId: val.trim() })}
            placeholder="yourname@upi"
            placeholderTextColor="#90A4AE"
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="email-address"
            onFocus={() => setFocusedField('upi')}
            onBlur={() => setFocusedField(null)}
          />
          {upiValid && (
            <View style={styles.validIcon}>
              <Text style={styles.validIconText}>{'\u2713'}</Text>
            </View>
          )}
        </View>
        <Text style={styles.hint}>Format: name@bankname &middot; e.g. 9876543210@ybl &middot; name@okaxis</Text>
      </View>

      {/* Bank account toggle — blue text link */}
      <TouchableOpacity
        style={styles.bankToggle}
        onPress={() => setBankExpanded((v) => !v)}
        activeOpacity={0.8}
      >
        <Text style={styles.bankToggleText}>
          {bankExpanded ? 'Hide bank account' : 'Or add bank account'}
        </Text>
      </TouchableOpacity>

      {bankExpanded && (
        <View style={styles.bankSection}>
          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Account Number</Text>
            <TextInput
              style={[styles.input, focusedField === 'acc' && styles.inputFocused]}
              value={data.bankAccount}
              onChangeText={(val) => onChange({ bankAccount: val.replace(/\D/g, '') })}
              placeholder="e.g. 1234567890"
              placeholderTextColor="#90A4AE"
              keyboardType="number-pad"
              onFocus={() => setFocusedField('acc')}
              onBlur={() => setFocusedField(null)}
            />
          </View>

          <View style={styles.fieldGroup}>
            <Text style={styles.label}>IFSC Code</Text>
            <TextInput
              style={[styles.input, focusedField === 'ifsc' && styles.inputFocused]}
              value={data.ifscCode}
              onChangeText={(val) =>
                onChange({ ifscCode: val.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 11) })
              }
              placeholder="e.g. SBIN0001234"
              placeholderTextColor="#90A4AE"
              autoCapitalize="characters"
              autoCorrect={false}
              maxLength={11}
              onFocus={() => setFocusedField('ifsc')}
              onBlur={() => setFocusedField(null)}
            />
            <Text style={styles.hint}>You can also add this later from your profile.</Text>
          </View>
        </View>
      )}

      {/* Security note */}
      <View style={styles.securityCard}>
        <Text style={styles.securityLockIcon}>{'\uD83D\uDD12'}</Text>
        <Text style={styles.securityText}>
          Used only for payouts. Zero charges.
        </Text>
      </View>
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

  // Field groups
  fieldGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1A2233',
    letterSpacing: 0.1,
    marginBottom: 6,
  },

  // Input wrapper for overlay valid icon
  inputWrapper: { position: 'relative' },

  // Standard input
  input: {
    height: 48,
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#D5E3F5',
    paddingHorizontal: 14,
    paddingRight: 44,
    color: '#1A2233',
    fontSize: 15,
  },
  inputFocused: { borderColor: '#1565C0', backgroundColor: '#FFFFFF' },
  inputValid: { borderColor: '#16A34A', backgroundColor: '#FFFFFF' },

  // Green valid checkmark overlay
  validIcon: {
    position: 'absolute',
    right: 14,
    top: 0,
    bottom: 0,
    justifyContent: 'center',
  },
  validIconText: {
    fontSize: 16,
    color: '#16A34A',
    fontWeight: '700',
  },

  hint: {
    fontSize: 11,
    color: '#90A4AE',
    marginTop: 4,
  },

  // Bank account toggle — blue text link
  bankToggle: {
    paddingVertical: 12,
    marginBottom: 4,
  },
  bankToggleText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#1565C0',
  },

  bankSection: {
    marginTop: 4,
  },

  // Security note card
  securityCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8EFF8',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#D5E3F5',
    paddingVertical: 12,
    paddingHorizontal: 14,
    marginTop: 12,
    gap: 10,
  },
  securityLockIcon: {
    fontSize: 14,
  },
  securityText: {
    flex: 1,
    fontSize: 12,
    fontWeight: '400',
    color: '#546E7A',
  },
});
