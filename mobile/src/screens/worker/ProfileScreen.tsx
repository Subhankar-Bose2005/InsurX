import React from 'react';
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity, Alert, StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import useStore from '../../store/useStore';
import { clearSession } from '../../services/session';
import { formatDate } from '../../utils/formatters';

// ─── Editorial Expanded design tokens ──────────────────────────────────────────
const T = {
  paper:      '#F8F7F4',
  ink:        '#0f0f0e',
  inkFaint:   '#9ca3af',
  inkMid:     '#4b5563',
  column:     '#e5e3de',
  emerald:    '#166534',
  emeraldBg:  '#f0fdf4',
  steel:      '#1e3a5f',
  steelBg:    '#eff6ff',
  amber:      '#92400e',
  amberBg:    '#fffbeb',
  amberRule:  '#fbbf24',
  surface:    '#F1F0EC',
  white:      '#FFFFFF',
  danger:     '#991b1b',
  dangerBg:   '#fef2f2',
};

const PLATFORM_COLORS: Record<string, { bg: string; text: string }> = {
  zomato: { bg: '#E23744', text: '#FFFFFF' },
  swiggy: { bg: '#FC8019', text: '#FFFFFF' },
  zepto:  { bg: '#7C3AED', text: '#FFFFFF' },
  other:  { bg: '#374151', text: '#FFFFFF' },
};
const PLATFORM_LABELS: Record<string, string> = {
  zomato: 'Zomato',
  swiggy: 'Swiggy',
  zepto:  'Zepto',
  other:  'Other',
};

interface Props {
  navigation: any;
}

export default function ProfileScreen({ navigation }: Props) {
  const { worker, activePolicy, claimSummary, reset } = useStore();

  const handleLogout = () => {
    Alert.alert('Log Out', 'Are you sure you want to log out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Log Out',
        style: 'destructive',
        onPress: async () => {
          await clearSession();
          reset();
        },
      },
    ]);
  };

  if (!worker) return null;

  const platformKey    = (worker.platform || 'other').toLowerCase();
  const platformLabel  = PLATFORM_LABELS[platformKey] ?? worker.platform;
  const platformColors = PLATFORM_COLORS[platformKey] ?? PLATFORM_COLORS.other;
  const initial        = worker.name?.charAt(0)?.toUpperCase() || '?';

  const fraudRisk  = worker.fraudScore;
  const fraudColor = !fraudRisk || fraudRisk < 0.3 ? T.emerald : fraudRisk < 0.7 ? T.amber : T.danger;
  const fraudBg    = !fraudRisk || fraudRisk < 0.3 ? T.emeraldBg : fraudRisk < 0.7 ? T.amberBg : T.dangerBg;
  const fraudLabel = !fraudRisk || fraudRisk < 0.3 ? 'Low Risk' : fraudRisk < 0.7 ? 'Medium Risk' : 'High Risk';

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor={T.paper} />

      {/* Masthead */}
      <View style={styles.masthead}>
        <View style={styles.mastheadLeft}>
          <View style={styles.mastheadRule} />
          <View>
            <Text style={styles.mastheadBrand}>INSURX</Text>
            <Text style={styles.mastheadSub}>PROFILE</Text>
          </View>
        </View>
        <View style={styles.mastheadAvatar}>
          <Text style={styles.mastheadAvatarText}>{initial}</Text>
        </View>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Avatar card */}
        <View style={styles.avatarCard}>
          <View style={styles.avatarCircle}>
            <Text style={styles.avatarLetter}>{initial}</Text>
          </View>
          <View style={styles.avatarInfo}>
            <Text style={styles.workerName}>{worker.name || 'Delivery Partner'}</Text>
            <Text style={styles.workerPhone}>{worker.phone || '—'}</Text>
          </View>
          {worker.platform && (
            <View style={[styles.platformBadge, { backgroundColor: platformColors.bg }]}>
              <Text style={[styles.platformText, { color: platformColors.text }]}>
                {platformLabel}
              </Text>
            </View>
          )}
        </View>

        {/* Coverage */}
        <View style={styles.sectionCard}>
          <SectionHead label="COVERAGE" />
          <InfoRow label="Plan"     value={activePolicy?.planName ?? 'No active plan'} />
          <InfoRow label="Coverage" value={activePolicy ? `${activePolicy.coveragePercent}%` : '—'} />
          <InfoRow label="Zone"     value={worker.zone || '—'} />
          <InfoRow label="Pincode"  value={worker.pincode || '—'} />
          <InfoRow
            label="Expires"
            value={activePolicy ? formatDate(activePolicy.endDate) : '—'}
            isLast
          />
        </View>

        {/* Account */}
        <View style={styles.sectionCard}>
          <SectionHead label="ACCOUNT" />
          <InfoRow label="UPI ID" value={worker.upiId || '—'} />
          <InfoRow
            label="Total Payouts"
            value={`₹${claimSummary.totalProtected.toLocaleString('en-IN')}`}
            valueColor={T.emerald}
          />
          <InfoRow
            label="Weekly Earnings"
            value={worker.weeklyEarnings ? `₹${worker.weeklyEarnings.toLocaleString('en-IN')}` : '—'}
          />
          <InfoRow
            label="Working Hours"
            value={worker.workingHours ? `${worker.workingHours} hrs/week` : '—'}
            isLast
          />
        </View>

        {/* KYC */}
        <View style={styles.sectionCard}>
          <SectionHead label="KYC STATUS" />
          <KycRow label="Aadhaar"    detail={(worker as any).aadhaarLast4 ? `•••• ${(worker as any).aadhaarLast4}` : 'Not linked'}    verified={!!(worker as any).aadhaarLast4} />
          <KycRow label="Document"   detail={(worker as any).documentType ? (worker as any).documentType.toUpperCase() : 'Not uploaded'} verified={!!(worker as any).documentType} />
          <KycRow label="Selfie"     detail={(worker as any).selfieUrl ? 'Uploaded' : 'Not uploaded'}                                    verified={!!(worker as any).selfieUrl} />
          <KycRow label="Onboarding" detail={worker.onboardingComplete ? 'Complete' : 'Incomplete'}                                       verified={!!worker.onboardingComplete} isLast />
        </View>

        {/* Risk level */}
        <View style={styles.sectionCard}>
          <SectionHead label="RISK LEVEL" />
          <View style={styles.riskRow}>
            <Text style={styles.infoLabel}>Fraud Risk</Text>
            <View style={[styles.riskBadge, { backgroundColor: fraudBg }]}>
              <Text style={[styles.riskText, { color: fraudColor }]}>{fraudLabel}</Text>
            </View>
          </View>
        </View>

        {/* Logout */}
        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout} activeOpacity={0.8}>
          <Text style={styles.logoutText}>Log Out</Text>
        </TouchableOpacity>

        {/* Dev reset — only shown in __DEV__ mode */}
        {__DEV__ && (
          <TouchableOpacity
            style={styles.devResetBtn}
            onPress={async () => {
              await clearSession();
              reset();
            }}
            activeOpacity={0.8}
          >
            <Text style={styles.devResetText}>⚙ Reset & Redo Onboarding (Dev)</Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

// ─── Sub-components ────────────────────────────────────────────────────────────

function SectionHead({ label }: { label: string }) {
  return (
    <View style={styles.sectionHeadWrap}>
      <Text style={styles.sectionHeadText}>{label}</Text>
      <View style={styles.sectionHeadRule} />
    </View>
  );
}

function InfoRow({
  label, value, valueColor, isLast,
}: {
  label: string; value: string; valueColor?: string; isLast?: boolean;
}) {
  return (
    <View style={[styles.infoRow, !isLast && styles.infoRowBorder]}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={[styles.infoValue, valueColor ? { color: valueColor } : undefined]}>
        {value}
      </Text>
    </View>
  );
}

function KycRow({
  label, detail, verified, isLast,
}: {
  label: string; detail: string; verified: boolean; isLast?: boolean;
}) {
  return (
    <View style={[styles.infoRow, !isLast && styles.infoRowBorder]}>
      <View style={styles.kycLeft}>
        <Text style={[styles.kycIcon, { color: verified ? T.emerald : T.amber }]}>
          {verified ? '✓' : '△'}
        </Text>
        <Text style={styles.infoLabel}>{label}</Text>
      </View>
      <Text style={[styles.infoValue, { color: verified ? T.ink : T.inkMid }]}>
        {detail}
      </Text>
    </View>
  );
}

// ─── Styles ────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: T.paper },
  scroll:   { flex: 1, backgroundColor: T.paper },
  content:  { paddingBottom: 48 },

  // Masthead
  masthead: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: T.paper,
  },
  mastheadLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  mastheadRule: {
    width: 3,
    height: 38,
    backgroundColor: T.ink,
    borderRadius: 2,
  },
  mastheadBrand: {
    fontSize: 18,
    fontWeight: '900',
    color: T.ink,
    letterSpacing: 4,
    lineHeight: 20,
  },
  mastheadSub: {
    fontSize: 11,
    color: T.inkFaint,
    letterSpacing: 1.5,
    lineHeight: 14,
  },
  mastheadAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: T.ink,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mastheadAvatarText: {
    fontSize: 15,
    fontWeight: '700',
    color: T.paper,
  },

  // Avatar card
  avatarCard: {
    backgroundColor: T.surface,
    marginHorizontal: 16,
    borderRadius: 6,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    marginBottom: 12,
  },
  avatarCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: T.ink,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarLetter: { fontSize: 26, fontWeight: '700', color: T.paper },
  avatarInfo:   { flex: 1 },
  workerName:   { fontSize: 18, fontWeight: '700', color: T.ink },
  workerPhone:  { fontSize: 13, color: T.inkFaint, marginTop: 2 },
  platformBadge: {
    borderRadius: 4,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  platformText: { fontSize: 11, fontWeight: '700' },

  // Section card
  sectionCard: {
    backgroundColor: T.surface,
    marginHorizontal: 16,
    borderRadius: 6,
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 4,
    marginBottom: 12,
  },

  // Section head
  sectionHeadWrap: {
    marginBottom: 14,
  },
  sectionHeadText: {
    fontSize: 9,
    fontWeight: '700',
    color: T.inkMid,
    textTransform: 'uppercase',
    letterSpacing: 2.5,
    marginBottom: 6,
  },
  sectionHeadRule: {
    height: 1,
    backgroundColor: T.column,
  },

  // Info row
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  infoRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: T.column,
  },
  infoLabel: { fontSize: 13, color: T.inkFaint, flex: 1 },
  infoValue: {
    fontSize: 14,
    fontWeight: '700',
    color: T.ink,
    textAlign: 'right',
    flex: 1,
    marginLeft: 8,
  },

  // KYC row
  kycLeft: { flexDirection: 'row', alignItems: 'center', gap: 8, flex: 1 },
  kycIcon: { fontSize: 13, fontWeight: '700', width: 16, textAlign: 'center' },

  // Risk row
  riskRow:  {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  riskBadge: { borderRadius: 4, paddingHorizontal: 14, paddingVertical: 5 },
  riskText:  { fontSize: 13, fontWeight: '700' },

  // Logout
  logoutBtn: {
    marginHorizontal: 16,
    marginTop: 4,
    height: 52,
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: T.white,
    borderWidth: 1,
    borderColor: T.column,
  },
  logoutText: { color: T.ink, fontWeight: '700', fontSize: 15 },

  // Dev reset
  devResetBtn: {
    marginHorizontal: 16,
    marginTop: 10,
    height: 48,
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: T.surface,
    borderWidth: 1,
    borderColor: T.steel,
    borderStyle: 'dashed',
  },
  devResetText: { color: T.steel, fontWeight: '600', fontSize: 13 },
});
