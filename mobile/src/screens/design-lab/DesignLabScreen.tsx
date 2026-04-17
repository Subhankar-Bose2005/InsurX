import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// ─── Variant metadata ─────────────────────────────────────────────────────────
const VARIANTS = [
  {
    num:         '01',
    name:        'Dark Premium',
    description: 'Glowing earnings, glass cards, trading app aesthetic',
    accent:      '#080c14',
    route:       'Home1',
  },
  {
    num:         '02',
    name:        'Editorial Clean',
    description: 'Massive typography, radical white space, minimal chrome',
    accent:      '#0a0a0a',
    route:       'Home2',
  },
  {
    num:         '03',
    name:        'Warm Bento',
    description: 'Asymmetric grid, cream background, tactile blocks',
    accent:      '#000666',
    route:       'Home3',
  },
  {
    num:         '04',
    name:        'Gradient Immersive',
    description: 'Rich hero gradient, floating cards, Revolut-style',
    accent:      '#00096e',
    route:       'Home4',
  },
  {
    num:         '05',
    name:        'Utility Dashboard',
    description: 'Dense data, mini charts, professional dashboard',
    accent:      '#1e1b4b',
    route:       'Home5',
  },
  {
    num:         '06',
    name:        'Amber Terminal',
    description: 'Bloomberg terminal meets trading floor — amber on black, monospaced ticker',
    accent:      '#fbbf24',
    route:       'Home6',
  },
  {
    num:         '07',
    name:        'Monsoon Zone',
    description: 'Weather-first design, ocean dark, animated rain, live zone status',
    accent:      '#38bdf8',
    route:       'Home7',
  },
  {
    num:         '08',
    name:        'Constructivist Poster',
    description: 'Zero border radius, thick borders, propaganda poster art — bold declaration',
    accent:      '#d42b2b',
    route:       'Home8',
  },
  {
    num:         '09',
    name:        'Aurora Glass',
    description: 'Space-black bg, colorful aurora orbs, frosted glass cards — ultra premium',
    accent:      '#6366f1',
    route:       'Home9',
  },
  {
    num:         '10',
    name:        'Live Match',
    description: 'Cricket scoreboard aesthetic, gold on pitch-green, live indicator blinking',
    accent:      '#f5c518',
    route:       'Home10',
  },
  {
    num:         '11',
    name:        'Editorial Expanded',
    description: 'Newspaper grid meets fintech — column rules, weekly micro-bars, staggered reveal',
    accent:      '#0f0f0e',
    route:       'Home11',
  },
];

interface Props {
  navigation: any;
}

export default function DesignLabScreen({ navigation }: Props) {
  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>

      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>🧪 Design Lab</Text>
        <Text style={styles.headerCount}>11 variants</Text>
      </View>

      {/* ── Scroll body ──────────────────────────────────────────────────────── */}
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.pageTitle}>Choose a Design</Text>
        <Text style={styles.pageSubtitle}>
          11 variants — tap any to preview it as the home screen.
        </Text>

        {VARIANTS.map((v) => (
          <TouchableOpacity
            key={v.route}
            style={styles.variantCard}
            onPress={() => navigation.navigate(v.route)}
            activeOpacity={0.75}
          >
            {/* Left accent strip */}
            <View style={[styles.accentStrip, { backgroundColor: v.accent }]} />

            {/* Card body */}
            <View style={styles.cardBody}>
              <Text style={styles.variantName}>
                {v.num} {v.name}
              </Text>
              <Text style={styles.variantDesc}>{v.description}</Text>
              <Text style={styles.previewLink}>→ Preview</Text>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#000666',
  },

  // Header
  header: {
    backgroundColor: '#000666',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 14,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  headerCount: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.50)',
    fontWeight: '500',
  },

  // Scroll
  scroll: {
    flex: 1,
    backgroundColor: '#f9f9f9',
  },
  scrollContent: {
    paddingTop: 16,
    paddingHorizontal: 16,
    paddingBottom: 40,
  },

  // Headings
  pageTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#000666',
    marginBottom: 4,
  },
  pageSubtitle: {
    fontSize: 14,
    color: '#454652',
    fontWeight: '400',
    marginBottom: 20,
    lineHeight: 20,
  },

  // Variant card
  variantCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginBottom: 12,
    overflow: 'hidden',
    flexDirection: 'row',
    // subtle shadow
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  accentStrip: {
    width: 4,
  },
  cardBody: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  variantName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#000666',
  },
  variantDesc: {
    fontSize: 13,
    color: '#454652',
    fontWeight: '400',
    marginTop: 3,
    lineHeight: 18,
  },
  previewLink: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1A237E',
    marginTop: 8,
  },
});
