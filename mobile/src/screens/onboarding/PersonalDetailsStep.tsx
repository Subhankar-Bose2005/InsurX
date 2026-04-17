import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, ScrollView, ActivityIndicator,
} from 'react-native';
import * as Location from 'expo-location';

interface PersonalData {
  name: string;
  dob: string;
  gender: 'male' | 'female' | 'other' | '';
  pincode: string;
  city?: string;
  gpsLat: number | null;
  gpsLon: number | null;
}

interface Props {
  data: PersonalData;
  onChange: (partial: Partial<PersonalData>) => void;
}

const C = {
  primary: '#000666',
  primaryLight: '#e0e0ff',
  bg: '#f9f9f9',
  cardBg: '#FFFFFF',
  border: 'transparent',
  borderFocus: '#1A237E',
  text: '#1a1c1c',
  text2: '#454652',
  muted: '#767683',
  green: '#1b6d24',
  danger: '#ba1a1a',
};

export default function PersonalDetailsStep({ data, onChange }: Props) {
  const [focused, setFocused] = useState<string | null>(null);
  const [locLoading, setLocLoading] = useState(false);
  const [locDone, setLocDone] = useState(false);
  const [locError, setLocError] = useState<string | null>(null);

  // Auto-format DD/MM/YYYY as user types
  const handleDob = (val: string) => {
    const digits = val.replace(/\D/g, '').slice(0, 8);
    let out = digits;
    if (digits.length > 4) out = digits.slice(0, 2) + '/' + digits.slice(2, 4) + '/' + digits.slice(4);
    else if (digits.length > 2) out = digits.slice(0, 2) + '/' + digits.slice(2);
    onChange({ dob: out });
  };

  const handleDetectLocation = async () => {
    setLocLoading(true);
    setLocError(null);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setLocError('Location permission denied. Please enter your pincode manually.');
        return;
      }
      const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      const { latitude: lat, longitude: lon } = loc.coords;
      onChange({ gpsLat: lat, gpsLon: lon });
      setLocDone(true);
      try {
        const [geo] = await Location.reverseGeocodeAsync({ latitude: lat, longitude: lon });
        const updates: Partial<PersonalData> = { gpsLat: lat, gpsLon: lon };
        if (geo?.postalCode && /^\d{6}$/.test(geo.postalCode)) updates.pincode = geo.postalCode;
        if (geo?.city) updates.city = geo.city;
        onChange(updates);
      } catch { /* reverse geocode optional */ }
    } catch {
      setLocError('Could not detect location. Please enter your pincode manually.');
    } finally {
      setLocLoading(false);
    }
  };

  const inp = (field: string) => ({
    onFocus: () => setFocused(field),
    onBlur:  () => setFocused(null),
  });

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
    >
      <Text style={styles.heading}>Personal Details</Text>
      <Text style={styles.subtext}>Tell us a bit about yourself</Text>

      {/* Full Name */}
      <View style={styles.field}>
        <Text style={styles.label}>Full Name</Text>
        <TextInput
          style={[styles.input, focused === 'name' && styles.inputFocused]}
          value={data.name}
          onChangeText={(v) => onChange({ name: v })}
          placeholder="e.g. Rahul Kumar"
          placeholderTextColor={C.muted}
          autoCapitalize="words"
          autoCorrect={false}
          returnKeyType="next"
          {...inp('name')}
        />
      </View>

      {/* Date of Birth */}
      <View style={styles.field}>
        <Text style={styles.label}>Date of Birth</Text>
        <TextInput
          style={[styles.input, focused === 'dob' && styles.inputFocused]}
          value={data.dob}
          onChangeText={handleDob}
          placeholder="DD/MM/YYYY"
          placeholderTextColor={C.muted}
          keyboardType="number-pad"
          maxLength={10}
          returnKeyType="next"
          {...inp('dob')}
        />
        {data.dob.length === 10 && (
          <Text style={styles.hint}>
            ✓ {data.dob}
          </Text>
        )}
      </View>

      {/* Gender */}
      <View style={styles.field}>
        <Text style={styles.label}>Gender</Text>
        <View style={styles.pillRow}>
          {(['male', 'female', 'other'] as const).map((g) => (
            <TouchableOpacity
              key={g}
              style={[styles.pill, data.gender === g && styles.pillSelected]}
              onPress={() => onChange({ gender: g })}
              activeOpacity={0.8}
            >
              <Text style={[styles.pillText, data.gender === g && styles.pillTextSelected]}>
                {g === 'male' ? 'Male' : g === 'female' ? 'Female' : 'Other'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* City */}
      <View style={styles.field}>
        <Text style={styles.label}>City</Text>
        <TextInput
          style={[styles.input, focused === 'city' && styles.inputFocused]}
          value={data.city ?? ''}
          onChangeText={(v) => onChange({ city: v })}
          placeholder="e.g. Mumbai, Delhi, Bangalore"
          placeholderTextColor={C.muted}
          autoCapitalize="words"
          autoCorrect={false}
          returnKeyType="next"
          {...inp('city')}
        />
      </View>

      {/* Pincode + location detect */}
      <View style={styles.field}>
        <Text style={styles.label}>Pincode</Text>
        <TextInput
          style={[styles.input, focused === 'pincode' && styles.inputFocused]}
          value={data.pincode}
          onChangeText={(v) => onChange({ pincode: v.replace(/\D/g, '').slice(0, 6) })}
          placeholder="6-digit pincode"
          placeholderTextColor={C.muted}
          keyboardType="number-pad"
          maxLength={6}
          returnKeyType="done"
          {...inp('pincode')}
        />

        <TouchableOpacity
          style={[styles.detectBtn, locLoading && { opacity: 0.5 }]}
          onPress={handleDetectLocation}
          disabled={locLoading}
          activeOpacity={0.8}
        >
          {locLoading
            ? <ActivityIndicator size="small" color={C.primary} />
            : <Text style={styles.detectIcon}>📍</Text>
          }
          <Text style={styles.detectText}>
            {locLoading ? 'Detecting...' : 'Auto-detect my location'}
          </Text>
        </TouchableOpacity>

        {locDone && (
          <Text style={styles.locSuccess}>✓ Location detected — pincode filled</Text>
        )}
        {locError && (
          <Text style={styles.locError}>⚠ {locError}</Text>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9f9f9' },
  content: { paddingHorizontal: 16, paddingTop: 16, paddingBottom: 32 },

  heading: {
    fontSize: 20,
    fontWeight: '700',
    color: '#000666',
    letterSpacing: -0.2,
    marginBottom: 4,
  },
  subtext: {
    fontSize: 13,
    fontWeight: '400',
    color: '#454652',
    lineHeight: 18,
    marginBottom: 20,
  },

  field: { marginBottom: 16 },
  label: {
    fontSize: 11,
    fontWeight: '700',
    color: '#454652',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    marginBottom: 6,
  },

  input: {
    height: 52,
    backgroundColor: '#e2e2e2',
    borderRadius: 4,
    borderWidth: 0,
    paddingHorizontal: 14,
    color: '#1a1c1c',
    fontSize: 15,
  },
  inputFocused: { backgroundColor: '#e8e8e8' },

  hint: { fontSize: 11, color: '#767683', marginTop: 4 },

  pillRow: { flexDirection: 'row', gap: 8 },
  pill: {
    flex: 1,
    height: 44,
    borderRadius: 4,
    borderWidth: 0,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f3f3f3',
  },
  pillSelected: { backgroundColor: '#e0e0ff' },
  pillText: { fontSize: 14, fontWeight: '500', color: '#454652' },
  pillTextSelected: { color: '#000666', fontWeight: '700' },

  detectBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#1A237E',
    height: 48,
    backgroundColor: '#FFFFFF',
    marginTop: 10,
  },
  detectIcon: { fontSize: 14 },
  detectText: { fontSize: 14, fontWeight: '600', color: '#1A237E' },

  locSuccess: { fontSize: 11, color: '#1b6d24', marginTop: 6 },
  locError: { fontSize: 11, color: '#ba1a1a', marginTop: 6 },
});
