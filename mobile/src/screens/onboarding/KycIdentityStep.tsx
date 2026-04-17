import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Image,
  Alert,
  Platform,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';

interface IdentityData {
  aadhaarLast4: string;
  aadhaarFull: string;
  selfieUri: string | null;
}

interface Props {
  data: IdentityData;
  onChange: (partial: Partial<IdentityData>) => void;
}

export default function KycIdentityStep({ data, onChange }: Props) {
  const [focusedField, setFocusedField] = useState<string | null>(null);

  // Format Aadhaar as XXXX XXXX XXXX while typing
  const handleAadhaarChange = (val: string) => {
    const digits = val.replace(/\D/g, '').slice(0, 12);
    let formatted = digits;
    if (digits.length > 4 && digits.length <= 8) {
      formatted = digits.slice(0, 4) + ' ' + digits.slice(4);
    } else if (digits.length > 8) {
      formatted = digits.slice(0, 4) + ' ' + digits.slice(4, 8) + ' ' + digits.slice(8);
    }
    const last4 = digits.length >= 4 ? digits.slice(-4) : '';
    onChange({ aadhaarFull: formatted, aadhaarLast4: last4 });
  };

  const handleTakeSelfie = async () => {
    try {
      if (Platform.OS === 'web') {
        const libResult = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          allowsEditing: true,
          aspect: [1, 1],
          quality: 0.7,
        });
        if (!libResult.canceled && libResult.assets.length > 0) {
          onChange({ selfieUri: libResult.assets[0].uri });
        }
        return;
      }

      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Camera Permission Required',
          'Please allow camera access to take your selfie.',
          [
            { text: 'Cancel', style: 'cancel' },
            {
              text: 'Use Gallery Instead',
              onPress: async () => {
                const { status: libStatus } =
                  await ImagePicker.requestMediaLibraryPermissionsAsync();
                if (libStatus !== 'granted') return;
                const libResult = await ImagePicker.launchImageLibraryAsync({
                  mediaTypes: ImagePicker.MediaTypeOptions.Images,
                  allowsEditing: true,
                  aspect: [1, 1],
                  quality: 0.7,
                });
                if (!libResult.canceled && libResult.assets.length > 0) {
                  onChange({ selfieUri: libResult.assets[0].uri });
                }
              },
            },
          ]
        );
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        cameraType: ImagePicker.CameraType.front,
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.7,
      });

      if (!result.canceled && result.assets.length > 0) {
        onChange({ selfieUri: result.assets[0].uri });
      }
    } catch (err) {
      try {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') return;
        const libResult = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          allowsEditing: true,
          aspect: [1, 1],
          quality: 0.7,
        });
        if (!libResult.canceled && libResult.assets.length > 0) {
          onChange({ selfieUri: libResult.assets[0].uri });
        }
      } catch {
        Alert.alert('Error', 'Could not open camera or gallery. Please try again.');
      }
    }
  };

  const aadhaarDigits = data.aadhaarFull.replace(/\D/g, '');
  const aadhaarValid = aadhaarDigits.length === 12;

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
    >
      {/* Heading area */}
      <Text style={styles.heading}>Aadhaar Verification</Text>
      <Text style={styles.subtitle}>Your identity is kept safe and encrypted</Text>

      {/* Aadhaar Number */}
      <View style={styles.fieldGroup}>
        <Text style={styles.label}>Aadhaar Number</Text>
        <View style={styles.inputWrapper}>
          <TextInput
            style={[
              styles.aadhaarInput,
              focusedField === 'aadhaar' && styles.inputFocused,
              aadhaarValid && styles.inputValid,
            ]}
            value={data.aadhaarFull}
            onChangeText={handleAadhaarChange}
            placeholder="XXXX XXXX XXXX"
            placeholderTextColor="#90A4AE"
            keyboardType="number-pad"
            maxLength={14}
            onFocus={() => setFocusedField('aadhaar')}
            onBlur={() => setFocusedField(null)}
          />
          {aadhaarValid && (
            <View style={styles.validBadge}>
              <Text style={styles.validBadgeText}>{'\u2713'}</Text>
            </View>
          )}
        </View>
        <Text style={styles.hint}>12-digit Aadhaar number — used only for KYC verification</Text>
      </View>

      {/* Selfie Section */}
      <View style={styles.fieldGroup}>
        <Text style={styles.selfieHeading}>Take a Selfie</Text>
        <Text style={styles.selfieSubtitle}>Clear front-facing photo for identity match</Text>

        {/* 110px circle — dashed placeholder or captured image */}
        <View style={styles.selfieCenter}>
          {data.selfieUri ? (
            <Image
              source={{ uri: data.selfieUri }}
              style={styles.selfiePreview}
            />
          ) : (
            <View style={styles.selfiePlaceholder}>
              <Text style={styles.selfiePlaceholderText}>Your face</Text>
            </View>
          )}
        </View>

        {/* Take Selfie — blue outline, full width */}
        <TouchableOpacity
          style={styles.selfieBtn}
          onPress={handleTakeSelfie}
          activeOpacity={0.8}
        >
          <Text style={styles.selfieBtnText}>
            {data.selfieUri ? 'Retake Selfie' : 'Take Selfie'}
          </Text>
        </TouchableOpacity>
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
    marginBottom: 24,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1A2233',
    letterSpacing: 0.1,
    marginBottom: 6,
  },
  hint: {
    fontSize: 11,
    color: '#90A4AE',
    marginTop: 5,
  },

  // Aadhaar input wrapper
  inputWrapper: {
    position: 'relative',
  },
  aadhaarInput: {
    height: 48,
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#D5E3F5',
    paddingHorizontal: 14,
    paddingRight: 48,
    color: '#1A2233',
    fontSize: 18,
    letterSpacing: 3,
    fontWeight: '500',
  },
  inputFocused: {
    borderColor: '#1565C0',
    backgroundColor: '#FFFFFF',
  },
  inputValid: {
    borderColor: '#16A34A',
    backgroundColor: '#FFFFFF',
  },

  // Green checkmark overlay badge
  validBadge: {
    position: 'absolute',
    right: 14,
    top: 0,
    bottom: 0,
    justifyContent: 'center',
  },
  validBadgeText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#16A34A',
  },

  // Selfie section headings
  selfieHeading: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1A2233',
    marginBottom: 3,
  },
  selfieSubtitle: {
    fontSize: 12,
    color: '#546E7A',
    marginBottom: 16,
  },

  // Selfie circle area — centered
  selfieCenter: {
    alignItems: 'center',
    marginBottom: 16,
  },

  // Dashed placeholder
  selfiePlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 1.5,
    borderColor: '#D5E3F5',
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F0F4F9',
  },
  selfiePlaceholderText: {
    fontSize: 12,
    color: '#90A4AE',
    fontWeight: '400',
  },

  // Captured image — green border
  selfiePreview: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 2,
    borderColor: '#16A34A',
  },

  // Take Selfie — orange outline (action), full width
  selfieBtn: {
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E87722',
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
  },
  selfieBtnText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#E87722',
  },
});
