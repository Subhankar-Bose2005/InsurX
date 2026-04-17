import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { formatClaimStatus } from '../utils/formatters';

interface Props {
  status: string;
  size?: 'sm' | 'md';
}

export default function StatusBadge({ status, size = 'md' }: Props) {
  const { label, color, bg } = formatClaimStatus(status);

  return (
    <View style={[styles.badge, { backgroundColor: bg }, size === 'sm' && styles.badgeSm]}>
      <Text style={[styles.text, { color }, size === 'sm' && styles.textSm]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    alignSelf: 'flex-start',
  },
  badgeSm: {
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  text: {
    fontSize: 13,
    fontWeight: '600',
  },
  textSm: {
    fontSize: 11,
  },
});
