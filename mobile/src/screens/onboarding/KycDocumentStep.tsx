import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Image,
  Alert,
  Platform,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';

interface DocumentData {
  documentType: 'aadhaar' | 'pan' | 'dl' | '';
  documentFrontUri: string | null;
  documentBackUri: string | null;
}

interface Props {
  data: DocumentData;
  onChange: (partial: Partial<DocumentData>) => void;
}

const DOCUMENT_TYPES: { id: 'aadhaar' | 'pan' | 'dl'; label: string; icon: string }[] = [
  { id: 'aadhaar', label: 'Aadhaar Card',     icon: '🪪' },
  { id: 'pan',     label: 'PAN Card',         icon: '🔖' },
  { id: 'dl',      label: 'Driving Licence',  icon: '🚗' },
];

async function pickImage(): Promise<string | null> {
  if (Platform.OS === 'web') {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Required', 'Please allow gallery access to upload documents.');
      return null;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.8,
    });
    if (!result.canceled && result.assets.length > 0) return result.assets[0].uri;
    return null;
  }

  // Native: offer camera or gallery
  return new Promise((resolve) => {
    Alert.alert('Upload Document', 'Choose how to upload', [
      {
        text: 'Take Photo',
        onPress: async () => {
          const { status } = await ImagePicker.requestCameraPermissionsAsync();
          if (status !== 'granted') { resolve(null); return; }
          const result = await ImagePicker.launchCameraAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            quality: 0.8,
          });
          resolve(!result.canceled && result.assets.length > 0 ? result.assets[0].uri : null);
        },
      },
      {
        text: 'Choose from Gallery',
        onPress: async () => {
          const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
          if (status !== 'granted') { resolve(null); return; }
          const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            quality: 0.8,
          });
          resolve(!result.canceled && result.assets.length > 0 ? result.assets[0].uri : null);
        },
      },
      { text: 'Cancel', style: 'cancel', onPress: () => resolve(null) },
    ]);
  });
}

export default function KycDocumentStep({ data, onChange }: Props) {
  const handleFrontUpload = async () => {
    const uri = await pickImage();
    if (uri) onChange({ documentFrontUri: uri });
  };

  const handleBackUpload = async () => {
    const uri = await pickImage();
    if (uri) onChange({ documentBackUri: uri });
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      {/* Heading */}
      <Text style={styles.heading}>Upload Document</Text>
      <Text style={styles.subtitle}>A clear photo of your ID document</Text>

      {/* Document Type Pills */}
      <View style={styles.section}>
        <Text style={styles.label}>Select document type</Text>
        <View style={styles.pillRow}>
          {DOCUMENT_TYPES.map((dt) => {
            const selected = data.documentType === dt.id;
            return (
              <TouchableOpacity
                key={dt.id}
                style={[styles.pill, selected && styles.pillSelected]}
                onPress={() => onChange({ documentType: dt.id })}
                activeOpacity={0.8}
              >
                <Text style={styles.pillIcon}>{dt.icon}</Text>
                <Text style={[styles.pillText, selected && styles.pillTextSelected]}>
                  {dt.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* Front + Back upload zones side by side */}
      <View style={styles.uploadRow}>
        {/* Front */}
        <View style={styles.uploadCol}>
          <Text style={styles.uploadSideLabel}>Front</Text>
          <TouchableOpacity
            style={[styles.uploadBox, data.documentFrontUri && styles.uploadBoxFilled]}
            onPress={handleFrontUpload}
            activeOpacity={0.8}
          >
            {data.documentFrontUri ? (
              <>
                <Image source={{ uri: data.documentFrontUri }} style={styles.uploadThumbnail} />
                <View style={styles.uploadedOverlay}>
                  <Text style={styles.uploadedOverlayText}>✓ Uploaded</Text>
                </View>
              </>
            ) : (
              <View style={styles.uploadPlaceholder}>
                <Text style={styles.uploadIcon}>📤</Text>
                <Text style={styles.uploadPrimaryText}>Tap to upload</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        {/* Back */}
        <View style={styles.uploadCol}>
          <Text style={styles.uploadSideLabel}>Back</Text>
          <TouchableOpacity
            style={[styles.uploadBox, data.documentBackUri && styles.uploadBoxFilled]}
            onPress={handleBackUpload}
            activeOpacity={0.8}
          >
            {data.documentBackUri ? (
              <>
                <Image source={{ uri: data.documentBackUri }} style={styles.uploadThumbnail} />
                <View style={styles.uploadedOverlay}>
                  <Text style={styles.uploadedOverlayText}>✓ Uploaded</Text>
                </View>
              </>
            ) : (
              <View style={styles.uploadPlaceholder}>
                <Text style={styles.uploadIcon}>📤</Text>
                <Text style={styles.uploadPrimaryText}>Tap to upload</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
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

  // Heading
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

  section: { marginBottom: 20 },

  label: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1A2233',
    letterSpacing: 0.1,
    marginBottom: 8,
  },

  // Document type pills
  pillRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#D5E3F5',
    backgroundColor: '#FFFFFF',
  },
  pillSelected: {
    backgroundColor: '#E8EFF8',
    borderColor: '#1565C0',
  },
  pillIcon: { fontSize: 14 },
  pillText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#546E7A',
  },
  pillTextSelected: { color: '#1565C0' },

  // Front + Back side by side
  uploadRow: {
    flexDirection: 'row',
    gap: 12,
  },
  uploadCol: {
    flex: 1,
    gap: 6,
  },
  uploadSideLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1A2233',
    marginBottom: 4,
  },

  // Upload zone: dashed border
  uploadBox: {
    borderWidth: 1.5,
    borderColor: '#D5E3F5',
    borderStyle: 'dashed',
    borderRadius: 10,
    height: 130,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    overflow: 'hidden',
    position: 'relative',
  },
  uploadBoxFilled: {
    borderStyle: 'solid',
    borderColor: '#16A34A',
  },
  uploadThumbnail: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  uploadedOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(22,163,74,0.85)',
    paddingVertical: 5,
    alignItems: 'center',
  },
  uploadedOverlayText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  uploadPlaceholder: {
    alignItems: 'center',
    gap: 5,
  },
  uploadIcon: { fontSize: 22 },
  uploadPrimaryText: {
    fontSize: 11,
    fontWeight: '500',
    color: '#546E7A',
    textAlign: 'center',
  },
});
