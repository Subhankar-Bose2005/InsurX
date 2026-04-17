import React, { useEffect, useCallback, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import useStore from '../../store/useStore';
import { getPolicies, updatePolicy, createPolicy } from '../../services/api';
import PlanCard from '../../components/PlanCard';
import { formatCurrency, formatDate, formatPolicyExpiry } from '../../utils/formatters';

const T = {
  paper: '#F8F7F4',
  ink: '#0f0f0e',
  inkFaint: '#9ca3af',
  inkMid: '#4b5563',
  column: '#e5e3de',
  emerald: '#166534',
  emeraldBg: '#f0fdf4',
  steel: '#1e3a5f',
  steelBg: '#eff6ff',
  amber: '#92400e',
  amberBg: '#fffbeb',
  amberRule: '#fbbf24',
  white: '#FFFFFF',
  danger: '#DC2626',
};

// ✅ FIXED (description added)
const PLANS = [
  {
    id: 'basic',
    name: 'Basic',
    weeklyPremium: 29,
    coveragePercent: 50,
    maxPayoutPerWeek: 400,
    description: 'Essential protection for part-time delivery partners',
  },
  {
    id: 'shield',
    name: 'Shield',
    weeklyPremium: 59,
    coveragePercent: 70,
    maxPayoutPerWeek: 800,
    description: 'Balanced coverage for regular delivery workers',
  },
  {
    id: 'shield+',
    name: 'Shield+',
    weeklyPremium: 99,
    coveragePercent: 90,
    maxPayoutPerWeek: 1500,
    description: 'Maximum income protection for full-time workers',
  },
];

const COVERAGE_TRIGGERS = [
  { emoji: '🌧️', label: 'Heavy Rainfall' },
  { emoji: '🌡️', label: 'Extreme Heat' },
  { emoji: '😷', label: 'Severe AQI' },
  { emoji: '🌊', label: 'Flooding' },
  { emoji: '🚫', label: 'Curfew / Bandh' },
];

export default function PolicyScreen() {
  const {
    worker, activePolicy, policies = [],
    isLoadingPolicy, setLoading, setError, setPolicies, setActivePolicy,
  } = useStore();

  const [changing, setChanging] = useState<string | null>(null);
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);

  const loadPolicies = useCallback(async () => {
    if (!worker?.uid) return;
    setLoading('policy', true);
    try {
      const data = await getPolicies(worker.uid);
      setPolicies(data.policies || []);
    } catch (err: any) {
      setError('policy', err.message);
    } finally {
      setLoading('policy', false);
    }
  }, [worker?.uid]);

  useEffect(() => {
    loadPolicies();
  }, [loadPolicies]);

  useEffect(() => {
    setSelectedPlan(activePolicy?.plan || 'shield');
  }, [activePolicy]);

  const handleChangePlan = async (newPlan: string) => {
    if (!activePolicy || newPlan === activePolicy.plan) return;
    setChanging(newPlan);
    try {
      const result = await updatePolicy(activePolicy.id, { plan: newPlan });
      setActivePolicy(result.policy);
      Alert.alert('Plan Updated', `Switched to ${result.policy.planName}`);
    } catch (err: any) {
      Alert.alert('Error', err.message);
    } finally {
      setChanging(null);
    }
  };

  const handleCancel = () => {
    Alert.alert('Cancel Policy', 'Are you sure?', [
      { text: 'Keep', style: 'cancel' },
      {
        text: 'Cancel',
        style: 'destructive',
        onPress: async () => {
          if (!activePolicy) return;
          setChanging('cancel');
          try {
            await updatePolicy(activePolicy.id, { action: 'cancel' });
            await loadPolicies();
          } catch (err: any) {
            Alert.alert('Error', err.message);
          } finally {
            setChanging(null);
          }
        },
      },
    ]);
  };

  const handleGetCoverage = async (planId: string) => {
    setChanging(planId);
    try {
      const result = await createPolicy(planId, `mock_${Date.now()}`);
      setActivePolicy(result.policy);
    } catch (err: any) {
      Alert.alert('Error', err.message);
    } finally {
      setChanging(null);
    }
  };

  if (isLoadingPolicy) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <ActivityIndicator size="large" color={T.ink} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.pageHeader}>
        <SectionHead label="POLICY" />
        <Text style={styles.pageTitle}>My Policy</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {activePolicy ? (
          <>
            <View style={styles.heroCard}>
              <View style={styles.heroRow}>
                <Text style={styles.badge}>{activePolicy.planName}</Text>
                <Text style={styles.active}>ACTIVE</Text>
              </View>

              <Text style={styles.amount}>₹{activePolicy.maxPayout}</Text>
              <Text style={styles.sub}>max weekly payout</Text>

              <Text style={styles.meta}>
                {activePolicy.coveragePercent}% • Expires {formatPolicyExpiry(activePolicy.endDate)}
              </Text>
            </View>

            <SectionHead label="WHAT'S COVERED" />

            <View style={styles.card}>
              {COVERAGE_TRIGGERS.map((item, i) => (
                <View key={i} style={styles.row}>
                  <Text>{item.emoji}</Text>
                  <Text style={styles.flex}>{item.label}</Text>
                  <Text>✓</Text>
                </View>
              ))}
            </View>

            <SectionHead label="CHANGE PLAN" />

            {PLANS.map((plan) => (
              <View key={plan.id}>
                <PlanCard
                  plan={plan}
                  selected={selectedPlan === plan.id}
                  onSelect={setSelectedPlan}
                />
                {selectedPlan === plan.id && plan.id !== activePolicy.plan && (
                  <TouchableOpacity
                    style={styles.button}
                    onPress={() => handleChangePlan(plan.id)}
                  >
                    <Text style={styles.btnText}>
                      SWITCH — {formatCurrency(plan.weeklyPremium)}
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            ))}

            <TouchableOpacity style={styles.cancel} onPress={handleCancel}>
              <Text style={{ color: T.danger }}>Cancel Policy</Text>
            </TouchableOpacity>
          </>
        ) : (
          <>
            <View style={styles.center}>
              <Text style={styles.big}>◈</Text>
              <Text>Start your protection</Text>
            </View>

            {PLANS.map((plan) => (
              <View key={plan.id}>
                <PlanCard
                  plan={plan}
                  selected={selectedPlan === plan.id}
                  onSelect={setSelectedPlan}
                />
                {selectedPlan === plan.id && (
                  <TouchableOpacity
                    style={styles.button}
                    onPress={() => handleGetCoverage(plan.id)}
                  >
                    <Text style={styles.btnText}>
                      Get Protected — {formatCurrency(plan.weeklyPremium)}
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            ))}
          </>
        )}

        {policies.filter(p => p.status !== 'active').length > 0 && (
          <>
            <SectionHead label="PAST POLICIES" />
            {policies.map((p) => (
              <View key={p.id} style={styles.card}>
                <Text>{p.planName}</Text>
                <Text>{formatDate(p.startDate)} - {formatDate(p.endDate)}</Text>
              </View>
            ))}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function SectionHead({ label }: { label: string }) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionText}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: T.paper },

  pageHeader: { padding: 16 },
  pageTitle: { fontSize: 28, fontWeight: '900' },

  content: { paddingBottom: 40 },

  section: { marginHorizontal: 16, marginTop: 20 },
  sectionText: { fontSize: 12, color: T.inkMid },

  heroCard: { backgroundColor: '#fff', margin: 16, padding: 16 },
  heroRow: { flexDirection: 'row', justifyContent: 'space-between' },

  badge: { color: T.steel },
  active: { color: T.emerald },

  amount: { fontSize: 32, color: T.emerald },
  sub: { color: T.inkFaint },

  meta: { marginTop: 8 },

  card: { backgroundColor: '#fff', margin: 16, padding: 12 },

  row: { flexDirection: 'row', justifyContent: 'space-between', marginVertical: 6 },
  flex: { flex: 1, marginLeft: 10 },

  button: { backgroundColor: 'black', padding: 14, margin: 16 },
  btnText: { color: '#fff', textAlign: 'center' },

  cancel: { margin: 16, alignItems: 'center' },

  center: { alignItems: 'center', marginTop: 40 },
  big: { fontSize: 40 },
});