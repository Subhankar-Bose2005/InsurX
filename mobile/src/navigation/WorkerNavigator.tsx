// FILE: WorkerNavigator.tsx
// Editorial Expanded design system — text-symbol tab icons, paper/ink palette

import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text, View, StyleSheet } from 'react-native';
import HomeScreen from '../screens/worker/HomeScreen';
import EarningsScreen from '../screens/worker/EarningsScreen';
import ClaimsScreen from '../screens/worker/ClaimsScreen';
import PolicyScreen from '../screens/worker/PolicyScreen';
import ProfileScreen from '../screens/worker/ProfileScreen';

const Tab = createBottomTabNavigator();

// ─── Design Tokens ────────────────────────────────────────────────────────────
const PAPER  = '#F8F7F4';
const INK    = '#0f0f0e';
const FAINT  = '#9ca3af';
const COLUMN = '#e5e3de';

// Text-symbol icons — editorial, no emoji
const TAB_SYMBOLS: Record<string, string> = {
  Home:     '⌂',
  Earnings: '₹',
  Claims:   '≡',
  Policy:   '◈',
  Profile:  '○',
};

export default function WorkerNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused }) => (
          <View style={[tabStyles.iconWrap, focused && tabStyles.iconWrapActive]}>
            <Text style={[tabStyles.iconSymbol, focused && tabStyles.iconSymbolActive]}>
              {TAB_SYMBOLS[route.name] || '·'}
            </Text>
          </View>
        ),
        tabBarLabel: ({ children, focused }) => (
          <Text style={[tabStyles.label, focused && tabStyles.labelActive]}>
            {children}
          </Text>
        ),
        tabBarStyle: tabStyles.bar,
        tabBarItemStyle: tabStyles.tabItem,
        headerShown: false,
      })}
    >
      <Tab.Screen name="Home"     component={HomeScreen} />
      <Tab.Screen name="Earnings" component={EarningsScreen} />
      <Tab.Screen name="Claims"   component={ClaimsScreen} />
      <Tab.Screen name="Policy"   component={PolicyScreen} />
      <Tab.Screen name="Profile"  component={ProfileScreen} />
    </Tab.Navigator>
  );
}

const tabStyles = StyleSheet.create({
  bar: {
    backgroundColor: PAPER,
    borderTopWidth: 1,
    borderTopColor: COLUMN,
    elevation: 0,
    shadowOpacity: 0,
    height: 68,
    paddingBottom: 10,
    paddingTop: 8,
  },
  tabItem: {
    borderRadius: 4,
    marginHorizontal: 1,
  },
  iconWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 44,
    height: 26,
    borderRadius: 4,
  },
  iconWrapActive: {
    backgroundColor: INK,
  },
  iconSymbol: {
    fontSize: 16,
    color: FAINT,
    fontWeight: '700',
    lineHeight: 20,
  },
  iconSymbolActive: {
    color: PAPER,
  },
  label: {
    fontSize: 9,
    fontWeight: '700',
    color: FAINT,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginTop: 2,
  },
  labelActive: {
    color: INK,
  },
});
