import React, { useState, useRef } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, SafeAreaView,
  Alert, ActivityIndicator, Animated,
} from 'react-native';
import Constants from 'expo-constants';
import useStore from '../../store/useStore';
import { createWorker, calculatePremium, createPolicy, createPaymentOrder, verifyPayment } from '../../services/api';
import { markOnboardingComplete } from '../../services/session';
import { uploadImage } from '../../services/upload';
import RazorpayWebView from '../../components/RazorpayWebView';
import PlatformStep from './PlatformStep';
import PersonalDetailsStep from './PersonalDetailsStep';
import WorkDetailsStep from './WorkDetailsStep';
import KycOverviewStep from './KycOverviewStep';
import KycIdentityStep from './KycIdentityStep';
import BankDetailsStep from './BankDetailsStep';
import KycDocumentStep from './KycDocumentStep';
import EarningsStep from './EarningsStep';
import PlanStep from './PlanStep';

interface Props {
  navigation: any;
}

interface OnboardingData {
  platform: 'zomato' | 'swiggy' | 'zepto' | 'other' | '';
  name: string;
  dob: string;
  gender: 'male' | 'female' | 'other' | '';
  pincode: string;
  gpsLat: number | null;
  gpsLon: number | null;
  partnerId: string;
  experienceYears: string;
  primaryShift: string;
  avgOrdersPerWeek: number;
  kycStarted: boolean;
  aadhaarLast4: string;
  aadhaarFull: string;
  selfieUri: string | null;
  upiId: string;
  bankAccount: string;
  ifscCode: string;
  documentType: 'aadhaar' | 'pan' | 'dl' | '';
  documentFrontUri: string | null;
  documentBackUri: string | null;
  weeklyEarnings: number;
  workingHours: number;
  coverageStartDate: string;
  selectedPlan: string;
  quote: any;
}

const PHASES = [
  { label: 'Platform', steps: [0] },
  { label: 'Profile',  steps: [1, 2] },
  { label: 'KYC',      steps: [3, 4, 5, 6] },
  { label: 'Insurance', steps: [7, 8] },
];

const TOTAL_STEPS = 9;

// Map plan names to weekly premium in paise (x 100)
const PLAN_AMOUNTS: Record<string, number> = {
  basic: 2900,
  shield: 5900,
  'shield+': 9900,
};

function getPhaseForStep(step: number): number {
  for (let i = 0; i < PHASES.length; i++) {
    if (PHASES[i].steps.includes(step)) return i;
  }
  return 0;
}

function isPhaseComplete(phaseIdx: number, currentStep: number): boolean {
  const last = PHASES[phaseIdx].steps.at(-1)!;
  return currentStep > last;
}

export default function OnboardingFlow({ navigation }: Props) {
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [razorpayOrder, setRazorpayOrder] = useState<{
    orderId: string; amount: number; keyId: string;
  } | null>(null);

  const progressAnim = useRef(new Animated.Value((1 / TOTAL_STEPS) * 100)).current;

  const [data, setData] = useState<OnboardingData>({
    platform: '', name: '', dob: '', gender: '', pincode: '',
    gpsLat: null, gpsLon: null, partnerId: '', experienceYears: '',
    primaryShift: '', avgOrdersPerWeek: 0, kycStarted: false,
    aadhaarLast4: '', aadhaarFull: '', selfieUri: null,
    upiId: '', bankAccount: '', ifscCode: '',
    documentType: '', documentFrontUri: null, documentBackUri: null,
    weeklyEarnings: 3000, workingHours: 40, coverageStartDate: '',
    selectedPlan: 'shield', quote: null,
  });

  const worker = useStore((s) => s.worker);
  const setWorker = useStore((s) => s.setWorker);
  const setActivePolicy = useStore((s) => s.setActivePolicy);

  const updateData = (partial: Partial<OnboardingData>) =>
    setData((prev) => ({ ...prev, ...partial }));

  const animateProgress = (toStep: number) => {
    const toPercent = ((toStep + 1) / TOTAL_STEPS) * 100;
    Animated.timing(progressAnim, {
      toValue: toPercent,
      duration: 280,
      useNativeDriver: false,
    }).start();
  };

  const canProceed = (): boolean => {
    switch (step) {
      case 0: return data.platform !== '';
      case 1: return data.name.trim().length >= 2;
      case 2: return true;
      case 3: return true;
      case 4: return data.aadhaarFull.replace(/\D/g, '').length === 12;
      case 5: return true;
      case 6: return data.documentType !== '';
      case 7: return data.weeklyEarnings > 0;
      case 8: return data.selectedPlan !== '';
      default: return false;
    }
  };

  const handleNext = async () => {
    if (step === 3) updateData({ kycStarted: true });

    if (step < TOTAL_STEPS - 1) {
      if (step === 7 && data.pincode && data.selectedPlan) {
        setLoading(true);
        try {
          const result = await calculatePremium(data.pincode, data.selectedPlan);
          updateData({ quote: result.quote });
        } catch { /* offline — continue */ }
        finally { setLoading(false); }
      }
      const nextStep = step + 1;
      animateProgress(nextStep);
      setStep(nextStep);
    } else {
      await handlePayment();
    }
  };

  const handleBack = () => {
    if (step > 0) {
      const prevStep = step - 1;
      animateProgress(prevStep);
      setStep(prevStep);
    }
  };

  const handlePayment = async () => {
    setLoading(true);
    try {
      const amount = PLAN_AMOUNTS[data.selectedPlan] ?? 5900;
      const orderResult = await createPaymentOrder(amount, data.selectedPlan);

      if (orderResult.demo || orderResult.orderId?.startsWith('demo_order')) {
        await finaliseOnboarding(orderResult.orderId, null, null);
        return;
      }

      setRazorpayOrder({
        orderId: orderResult.orderId,
        amount: orderResult.amount,
        keyId: orderResult.keyId,
      });
    } catch (err: any) {
      console.warn('[OnboardingFlow] Payment order failed, skipping:', err.message);
      await finaliseOnboarding('demo_payment_' + Date.now(), null, null);
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentSuccess = async (
    paymentId: string, orderId: string, signature: string,
  ) => {
    setRazorpayOrder(null);
    setLoading(true);
    try {
      await verifyPayment(orderId, paymentId, signature);
    } catch (e) {
      console.warn('[OnboardingFlow] Payment verify failed, continuing:', e);
    }
    await finaliseOnboarding(paymentId, orderId, signature);
  };

  const handlePaymentDismiss = () => {
    setRazorpayOrder(null);
    Alert.alert('Payment Cancelled', 'You can try again when ready.');
  };

  const handlePaymentFailure = (error: string) => {
    setRazorpayOrder(null);
    Alert.alert('Payment Failed', error || 'Please try again.');
  };

  const finaliseOnboarding = async (
    paymentId: string,
    _orderId: string | null,
    _signature: string | null,
  ) => {
    setLoading(true);
    try {
      const uid = worker?.uid || '';

      const [selfieUrl, documentFrontUrl, documentBackUrl] = await Promise.all([
        data.selfieUri ? uploadImage(data.selfieUri, `selfie_${uid}`) : Promise.resolve(null),
        data.documentFrontUri ? uploadImage(data.documentFrontUri, `doc_front_${uid}`) : Promise.resolve(null),
        data.documentBackUri ? uploadImage(data.documentBackUri, `doc_back_${uid}`) : Promise.resolve(null),
      ]);

      const workerResult = await createWorker({
        name: data.name,
        pincode: data.pincode,
        platform: (data.platform || 'zomato') as any,
        weeklyEarnings: data.weeklyEarnings,
        workingHours: data.workingHours,
        upiId: data.upiId || undefined,
        partnerId: data.partnerId || undefined,
        aadhaarLast4: data.aadhaarLast4 || undefined,
        gpsLat: data.gpsLat ?? undefined,
        gpsLon: data.gpsLon ?? undefined,
        primaryShift: data.primaryShift || undefined,
        avgOrdersPerWeek: data.avgOrdersPerWeek || undefined,
        experienceYears: data.experienceYears || undefined,
        dob: data.dob || undefined,
        gender: data.gender || undefined,
        bankAccount: data.bankAccount || undefined,
        ifscCode: data.ifscCode || undefined,
        documentType: data.documentType || undefined,
        selfieUrl: selfieUrl ?? undefined,
        documentFrontUrl: documentFrontUrl ?? undefined,
        documentBackUrl: documentBackUrl ?? undefined,
        registrationTimestamp: new Date().toISOString(),
        deviceId: Constants.deviceName || undefined,
      });
      setWorker(workerResult.worker);

      try {
        const policyResult = await createPolicy(data.selectedPlan, paymentId);
        setActivePolicy(policyResult.policy);
      } catch (e) {
        console.warn('[OnboardingFlow] Policy creation failed:', e);
      }

      await markOnboardingComplete();
      navigation.replace('PaymentSuccess', {
        plan: data.selectedPlan,
        weeklyEarnings: data.weeklyEarnings,
        paymentId,
      });
    } catch (err: any) {
      console.warn('[OnboardingFlow] finalise error:', err.message);
      await markOnboardingComplete();
      setWorker({ ...useStore.getState().worker, onboardingComplete: true, name: data.name, pincode: data.pincode } as any);
      navigation.replace('PaymentSuccess', {
        plan: data.selectedPlan,
        weeklyEarnings: data.weeklyEarnings,
        paymentId,
      });
    } finally {
      setLoading(false);
    }
  };

  const getStepBtnLabel = (): string => {
    if (step === TOTAL_STEPS - 1) return 'Pay & Get Protected';
    if (step === 3) return 'Start KYC';
    return 'Continue \u2192';
  };

  const renderStep = () => {
    switch (step) {
      case 0: return <PlatformStep data={data} onChange={updateData} />;
      case 1: return <PersonalDetailsStep data={data} onChange={updateData} />;
      case 2: return <WorkDetailsStep data={data} onChange={updateData} />;
      case 3: return <KycOverviewStep data={data} onChange={updateData} />;
      case 4: return <KycIdentityStep data={data} onChange={updateData} />;
      case 5: return <BankDetailsStep data={data} onChange={updateData} />;
      case 6: return <KycDocumentStep data={data} onChange={updateData} />;
      case 7: return <EarningsStep data={data} onChange={updateData} />;
      case 8: return <PlanStep data={data} onChange={updateData} />;
      default: return null;
    }
  };

  const progressWidth = progressAnim.interpolate({
    inputRange: [0, 100],
    outputRange: ['0%', '100%'],
  });

  const canGoBack = step > 0;
  const isDisabled = !canProceed() || loading;

  return (
    <SafeAreaView style={styles.container}>
      {/* 4px animated progress bar — full width at very top */}
      <View style={styles.progressTrack}>
        <Animated.View style={[styles.progressFill, { width: progressWidth as any }]} />
      </View>

      {/* Header row: back | Step X of 9 | Skip */}
      <View style={styles.headerRow}>
        <TouchableOpacity
          style={styles.headerTouchable}
          onPress={handleBack}
          disabled={!canGoBack}
          activeOpacity={0.7}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Text style={[styles.headerBackText, !canGoBack && styles.invisible]}>{'\u2190'}</Text>
        </TouchableOpacity>

        <Text style={styles.stepCounter}>Step {step + 1} of {TOTAL_STEPS}</Text>

        <TouchableOpacity
          style={styles.headerTouchable}
          onPress={() => navigation.canGoBack() ? navigation.goBack() : null}
          activeOpacity={0.7}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Text style={styles.headerSkipText}>Skip</Text>
        </TouchableOpacity>
      </View>

      {/* Step content */}
      <View style={styles.stepContent}>{renderStep()}</View>

      {/* Bottom sticky CTA */}
      <View style={styles.bottomBar}>
        <TouchableOpacity
          style={[styles.ctaButton, isDisabled && styles.ctaButtonDisabled]}
          onPress={handleNext}
          disabled={isDisabled}
          activeOpacity={0.85}
        >
          {loading
            ? <ActivityIndicator color="#FFFFFF" size="small" />
            : <Text style={styles.ctaButtonText}>{getStepBtnLabel()}</Text>
          }
        </TouchableOpacity>
      </View>

      {/* Razorpay WebView Modal */}
      {razorpayOrder && (
        <RazorpayWebView
          visible={!!razorpayOrder}
          orderId={razorpayOrder.orderId}
          amount={razorpayOrder.amount}
          keyId={razorpayOrder.keyId}
          workerName={data.name}
          workerPhone={worker?.phone || ''}
          description={`InsurX ${data.selectedPlan} plan — weekly premium`}
          onSuccess={handlePaymentSuccess}
          onFailure={handlePaymentFailure}
          onDismiss={handlePaymentDismiss}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F7F4',
  },

  // 4px animated progress bar
  progressTrack: {
    width: '100%',
    height: 4,
    backgroundColor: '#e5e3de',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#0f0f0e',
  },

  // Header row
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 10,
    minHeight: 48,
    backgroundColor: '#F8F7F4',
  },
  headerTouchable: {
    minWidth: 44,
    minHeight: 44,
    justifyContent: 'center',
  },
  headerBackText: {
    fontSize: 20,
    color: '#0f0f0e',
    fontWeight: '600',
  },
  invisible: {
    opacity: 0,
  },
  stepCounter: {
    fontSize: 11,
    color: '#9ca3af',
    fontWeight: '400',
    textAlign: 'center',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  headerSkipText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#4b5563',
    textAlign: 'right',
  },

  stepContent: {
    flex: 1,
    backgroundColor: '#F8F7F4',
  },

  // Bottom sticky CTA
  bottomBar: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 28,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#e5e3de',
  },
  ctaButton: {
    backgroundColor: '#0f0f0e',
    borderRadius: 4,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ctaButtonDisabled: {
    opacity: 0.35,
  },
  ctaButtonText: {
    color: '#F8F7F4',
    fontSize: 15,
    fontWeight: '700',
  },
});
