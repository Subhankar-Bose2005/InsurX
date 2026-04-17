import React, { useState, useRef } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  KeyboardAvoidingView, Platform, ActivityIndicator, SafeAreaView,
  StatusBar, ScrollView,
} from 'react-native';
import { FirebaseRecaptchaVerifierModal } from 'expo-firebase-recaptcha';
import { signInWithPhoneNumber } from 'firebase/auth';
import { auth } from '../../services/firebase';

interface Props {
  navigation: any;
}

const C = {
  paper: '#F8F7F4',
  ink: '#0f0f0e',
  inkFaint: '#9ca3af',
  column: '#e5e3de',
  emerald: '#166534',
  emeraldBg: '#f0fdf4',
  steel: '#1e3a5f',
};

export default function PhoneScreen({ navigation }: Props) {
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [focused, setFocused] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const recaptchaVerifier = useRef<any>(null);

  const handleSendOTP = async () => {
    const digits = phone.replace(/\D/g, '');

    if (digits.length !== 10) {
      setError('Please enter a valid 10-digit mobile number.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const fullPhone = `+91${digits}`;

      if (!recaptchaVerifier.current) {
        throw new Error('Recaptcha not ready');
      }

      const confirmation = await signInWithPhoneNumber(
        auth,
        fullPhone,
        recaptchaVerifier.current
      );

      navigation.navigate('OTP', {
        phone: fullPhone,
        digits,
        confirmation,
      });

    } catch (err: any) {
      console.error('[PhoneScreen]', err);
      setError(err.message || 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  const isReady = phone.length === 10;

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={C.paper} />

      <FirebaseRecaptchaVerifierModal
        ref={recaptchaVerifier}
        firebaseConfig={auth.app.options}
      />

      {/* Header */}
      <View style={styles.masthead}>
        <View style={styles.mastheadLeft}>
          <View style={styles.rule} />
          <Text style={styles.brand}>INSURX</Text>
        </View>
        <Text style={styles.right}>Sign In</Text>
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView contentContainerStyle={styles.content}>

          {/* Hero */}
          <View style={styles.hero}>
            <Text style={styles.heroTitle}>Secure your{'\n'}earnings.</Text>
            <Text style={styles.heroSub}>
              Weekly income protection for delivery partners
            </Text>
          </View>

          {/* Input */}
          <View>
            <Text style={styles.label}>PHONE NUMBER</Text>

            <View style={[styles.inputRow, focused && styles.inputFocus]}>
              <Text style={styles.prefix}>+91</Text>
              <View style={styles.divider} />

              <TextInput
                style={styles.input}
                value={phone}
                onChangeText={(t) => {
                  setPhone(t.replace(/\D/g, '').slice(0, 10));
                  if (error) setError(null);
                }}
                keyboardType="phone-pad"
                placeholder="Enter 10-digit number"
                placeholderTextColor={C.inkFaint}
                maxLength={10}
                onFocus={() => setFocused(true)}
                onBlur={() => setFocused(false)}
              />

              {isReady && (
                <View style={styles.check}>
                  <Text style={styles.checkText}>✓</Text>
                </View>
              )}
            </View>
          </View>

          {/* Error */}
          {error && (
            <View style={styles.errorBox}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          {/* Button */}
          <TouchableOpacity
            style={[
              styles.button,
              (!isReady || loading) && styles.disabled,
            ]}
            onPress={handleSendOTP}
            disabled={!isReady || loading}
          >
            {loading
              ? <ActivityIndicator color="#fff" />
              : <Text style={styles.btnText}>Send OTP →</Text>
            }
          </TouchableOpacity>

          <Text style={styles.disclaimer}>
            By continuing, you agree to our{' '}
            <Text style={styles.link}>Terms</Text> &{' '}
            <Text style={styles.link}>Privacy Policy</Text>
          </Text>

        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F8F7F4' },

  masthead: {
    height: 56,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderColor: '#e5e3de',
  },

  mastheadLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },

  rule: { width: 3, height: 22, backgroundColor: '#000' },

  brand: { fontWeight: '900', fontSize: 18, letterSpacing: 3 },

  right: { fontSize: 12, color: '#9ca3af' },

  content: { padding: 20, gap: 20 },

  hero: { gap: 6 },

  heroTitle: { fontSize: 36, fontWeight: '900' },

  heroSub: { fontSize: 14, color: '#9ca3af' },

  label: { fontSize: 10, color: '#9ca3af', letterSpacing: 2 },

  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e5e3de',
    borderRadius: 6,
    height: 60,
    backgroundColor: '#fff',
  },

  inputFocus: { borderColor: '#000' },

  prefix: { paddingHorizontal: 16, fontWeight: '700' },

  divider: { width: 1, height: 28, backgroundColor: '#e5e3de' },

  input: { flex: 1, paddingHorizontal: 10, fontSize: 18 },

  check: {
    marginRight: 12,
    backgroundColor: '#f0fdf4',
    borderRadius: 20,
    padding: 6,
  },

  checkText: { color: '#166534', fontWeight: '700' },

  errorBox: {
    backgroundColor: '#fffbeb',
    padding: 10,
    borderLeftWidth: 4,
    borderColor: '#fbbf24',
  },

  errorText: { color: '#92400e' },

  button: {
    backgroundColor: '#000',
    height: 60,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 6,
  },

  disabled: { opacity: 0.4 },

  btnText: { color: '#fff', fontWeight: '700', fontSize: 16 },

  disclaimer: { textAlign: 'center', fontSize: 11, color: '#9ca3af' },

  link: { color: '#1e3a5f', fontWeight: '600' },
});