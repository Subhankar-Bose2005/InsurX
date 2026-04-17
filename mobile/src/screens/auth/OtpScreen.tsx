import React, { useState, useRef } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ActivityIndicator, SafeAreaView, KeyboardAvoidingView, Platform, StatusBar,
} from 'react-native';
import { verifyOtp } from '../../services/api';
import { saveSession } from '../../services/session';
import useStore from '../../store/useStore';

interface Props {
  route: {
    params: {
      phone: string;
      digits: string;
      confirmation: any;
    };
  };
  navigation: any;
}

const DIGIT_COUNT = 6;

const C = {
  paper: '#F8F7F4',
  ink: '#0f0f0e',
  inkFaint: '#9ca3af',
  column: '#e5e3de',
  emerald: '#166534',
  emeraldBg: '#f0fdf4',
  steel: '#1e3a5f',
};

export default function OtpScreen({ route, navigation }: Props) {
  const { phone, digits, confirmation } = route.params;

  const [otp, setOtp] = useState<string[]>(Array(DIGIT_COUNT).fill(''));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const inputRefs = useRef<(TextInput | null)[]>([]);
  const setWorker = useStore((s) => s.setWorker);

  const otpString = otp.join('');

  const handleVerify = async () => {
    setError(null);
    setLoading(true);

    try {
      if (!confirmation) throw new Error('Confirmation missing');
      if (otpString.length !== 6) throw new Error('Enter valid OTP');

      const result = await confirmation.confirm(otpString);
      const idToken = await result.user.getIdToken();

      const res = await verifyOtp(idToken);
      const worker = res.worker;
      const isNewUser = res.isNewUser;

      const forceOnboarding =
        __DEV__ || isNewUser || !worker?.onboardingComplete;

      await saveSession({
        userId: worker.uid,
        phone: worker.phone || phone,
        idToken,
        onboardingComplete: !forceOnboarding,
      });

      setWorker(
        forceOnboarding
          ? { ...worker, onboardingComplete: false }
          : worker
      );

      navigation.replace(forceOnboarding ? 'Onboarding' : 'Worker');

    } catch (err: any) {
      console.error('[OtpScreen]', err);
      setError(err.message || 'Verification failed');
      setOtp(Array(DIGIT_COUNT).fill(''));
      inputRefs.current[0]?.focus();
    } finally {
      setLoading(false);
    }
  };

  const handleChangeDigit = (text: string, index: number) => {
    const cleaned = text.replace(/\D/g, '');
    if (!cleaned) return;

    if (error) setError(null);

    const newOtp = [...otp];
    newOtp[index] = cleaned.slice(-1);
    setOtp(newOtp);

    if (index < DIGIT_COUNT - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === 'Backspace') {
      const newOtp = [...otp];

      if (otp[index]) {
        newOtp[index] = '';
      } else if (index > 0) {
        newOtp[index - 1] = '';
        inputRefs.current[index - 1]?.focus();
      }

      setOtp(newOtp);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={C.paper} />

      {/* Header */}
      <View style={styles.masthead}>
        <View style={styles.mastheadLeft}>
          <View style={styles.rule} />
          <Text style={styles.brand}>INSURX</Text>
        </View>
        <Text style={styles.right}>Verify</Text>
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={styles.content}>

          {/* Title */}
          <View style={{ gap: 6 }}>
            <Text style={styles.title}>Enter OTP</Text>
            <Text style={styles.subtitle}>
              Sent to +91{digits}
            </Text>
          </View>

          {/* OTP Boxes */}
          <View style={styles.row}>
            {otp.map((d, i) => (
              <TextInput
                key={i}
                ref={(ref) => (inputRefs.current[i] = ref)}
                style={styles.box}
                value={d}
                onChangeText={(t) => handleChangeDigit(t, i)}
                onKeyPress={(e) => handleKeyPress(e, i)}
                keyboardType="number-pad"
                maxLength={1}
              />
            ))}
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
              (loading || otpString.length < 6) && styles.disabled,
            ]}
            onPress={handleVerify}
            disabled={loading || otpString.length < 6}
          >
            {loading
              ? <ActivityIndicator color="#fff" />
              : <Text style={styles.btnText}>Verify →</Text>
            }
          </TouchableOpacity>

        </View>
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

  content: {
    padding: 20,
    gap: 25,
  },

  title: { fontSize: 32, fontWeight: '900', color: '#000' },

  subtitle: { fontSize: 14, color: '#9ca3af' },

  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },

  box: {
    width: 50,
    height: 60,
    borderWidth: 1,
    borderColor: '#e5e3de',
    textAlign: 'center',
    fontSize: 22,
    borderRadius: 6,
    backgroundColor: '#fff',
  },

  errorBox: {
    backgroundColor: '#fffbeb',
    padding: 12,
    borderLeftWidth: 4,
    borderColor: '#fbbf24',
  },

  errorText: { color: '#92400e', fontSize: 13 },

  button: {
    backgroundColor: '#000',
    height: 60,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 6,
  },

  disabled: { opacity: 0.4 },

  btnText: { color: '#fff', fontWeight: '700', fontSize: 16 },
});