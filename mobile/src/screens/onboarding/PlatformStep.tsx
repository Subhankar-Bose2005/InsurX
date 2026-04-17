import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';

interface Props {
  data: { platform: string };
  onChange: (partial: any) => void;
}

const PLATFORMS = [
  { id: 'zomato',   name: 'Zomato',    emoji: '🛵', dotColor: '#E23744' },
  { id: 'swiggy',   name: 'Swiggy',    emoji: '🛵', dotColor: '#FC8019' },
  { id: 'magicpin', name: 'Magicpin',  emoji: '🛵', dotColor: '#E91E8C' },
  { id: 'other',    name: 'Other',     emoji: '➕', dotColor: '#ADADAD' },
];

export default function PlatformStep({ data, onChange }: Props) {
  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      {/* Heading + subtitle — no large hero emoji */}
      <Text style={styles.heading}>Where do you deliver?</Text>
      <Text style={styles.subtitle}>Select your platform to get started</Text>

      {/* Full-width stacked platform cards */}
      <View style={styles.list}>
        {PLATFORMS.map((platform) => {
          const selected = data.platform === platform.id;
          return (
            <TouchableOpacity
              key={platform.id}
              style={[styles.card, selected && styles.cardSelected]}
              onPress={() => onChange({ platform: platform.id })}
              activeOpacity={0.75}
            >
              {/* Left: color dot + emoji + name + "Partner" label */}
              <View style={styles.cardLeft}>
                <View style={[styles.colorDot, { backgroundColor: platform.dotColor }]} />
                <Text style={styles.cardEmoji}>{platform.emoji}</Text>
                <View>
                  <Text style={[styles.cardLabel, selected && styles.cardLabelSelected]}>
                    {platform.name}
                  </Text>
                  <Text style={styles.partnerLabel}>Partner</Text>
                </View>
              </View>

              {/* Right: checkmark circle when selected */}
              {selected && (
                <View style={styles.checkCircle}>
                  <Text style={styles.checkMark}>✓</Text>
                </View>
              )}
            </TouchableOpacity>
          );
        })}
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
    paddingBottom: 24,
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

  // Stacked full-width cards
  list: {
    gap: 10,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#D5E3F5',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  cardSelected: {
    backgroundColor: '#E8EFF8',
    borderColor: '#1565C0',
    borderWidth: 1.5,
  },
  cardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  colorDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  cardEmoji: {
    fontSize: 20,
  },
  cardLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1A2233',
  },
  cardLabelSelected: {
    color: '#1565C0',
  },
  partnerLabel: {
    fontSize: 12,
    color: '#546E7A',
    marginTop: 1,
  },

  // Checkmark circle (right side when selected)
  checkCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#1565C0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkMark: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
});
