import React, { useEffect, useState, useRef } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import {
  View, Text, StyleSheet, Animated, Dimensions,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { getSession, clearSession } from '../services/session';
import useStore from '../store/useStore';

import PhoneScreen from '../screens/auth/PhoneScreen';
import OtpScreen from '../screens/auth/OtpScreen';
import OnboardingFlow from '../screens/onboarding/OnboardingFlow';
import PaymentSuccessScreen from '../screens/onboarding/PaymentSuccessScreen';
import WorkerNavigator from './WorkerNavigator';
import ProfileScreen from '../screens/worker/ProfileScreen';
import DesignLabScreen from '../screens/design-lab/DesignLabScreen';
import HomeScreen1 from '../screens/design-lab/HomeScreen1';
import HomeScreen2 from '../screens/design-lab/HomeScreen2';
import HomeScreen3 from '../screens/design-lab/HomeScreen3';
import HomeScreen4 from '../screens/design-lab/HomeScreen4';
import HomeScreen5  from '../screens/design-lab/HomeScreen5';
import HomeScreen6  from '../screens/design-lab/HomeScreen6';
import HomeScreen7  from '../screens/design-lab/HomeScreen7';
import HomeScreen8  from '../screens/design-lab/HomeScreen8';
import HomeScreen9  from '../screens/design-lab/HomeScreen9';
import HomeScreen10 from '../screens/design-lab/HomeScreen10';
import HomeScreen11 from '../screens/design-lab/HomeScreen11';

const Stack = createNativeStackNavigator();
const { height } = Dimensions.get('window');

// ─── Animated Splash ──────────────────────────────────────────────────────────

function SplashScreen({ onDone }: { onDone: () => void }) {
  const logoScale   = useRef(new Animated.Value(0.7)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const textOpacity = useRef(new Animated.Value(0)).current;
  const slideUp     = useRef(new Animated.Value(20)).current;
  const screenOpacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // 1. Logo pops in
    Animated.parallel([
      Animated.spring(logoScale, { toValue: 1, tension: 60, friction: 7, useNativeDriver: true }),
      Animated.timing(logoOpacity, { toValue: 1, duration: 300, useNativeDriver: true }),
    ]).start(() => {
      // 2. Text slides up
      Animated.parallel([
        Animated.timing(textOpacity, { toValue: 1, duration: 350, useNativeDriver: true }),
        Animated.timing(slideUp, { toValue: 0, duration: 350, useNativeDriver: true }),
      ]).start(() => {
        // 3. Hold briefly then fade out
        setTimeout(() => {
          Animated.timing(screenOpacity, {
            toValue: 0, duration: 400, useNativeDriver: true,
          }).start(() => onDone());
        }, 900);
      });
    });
  }, []);

  return (
    <Animated.View style={[styles.splash, { opacity: screenOpacity }]}>
      <StatusBar style="dark" backgroundColor="#F8F7F4" />

      {/* Vertical rule + brand mark */}
      <Animated.View style={[styles.splashMasthead, { opacity: logoOpacity, transform: [{ scale: logoScale }] }]}>
        <View style={styles.splashRule} />
        <View style={styles.splashBrandBlock}>
          <Text style={styles.splashBrand}>INSURX</Text>
          <Text style={styles.splashTagline}>Income protection for delivery partners</Text>
        </View>
      </Animated.View>

      {/* Double rule separator */}
      <Animated.View style={[styles.splashDoubleRule, { opacity: textOpacity, transform: [{ translateY: slideUp }] }]}>
        <View style={styles.splashRuleThick} />
        <View style={styles.splashRuleThin} />
      </Animated.View>

      {/* Bottom badge */}
      <Animated.View style={[styles.splashBadge, { opacity: textOpacity }]}>
        <Text style={styles.splashBadgeText}>Powered by AI · Trusted by riders</Text>
      </Animated.View>
    </Animated.View>
  );
}

// ─── Main Navigator ───────────────────────────────────────────────────────────

export default function AppNavigator() {
  const [showSplash, setShowSplash]       = useState(true);
  const [bootstrapping, setBootstrapping] = useState(true);
  const { worker, setWorker } = useStore();

  useEffect(() => {
    (async () => {
      try {
        // DEV: clear session on every reload so you always start from Phone → OTP
        if (__DEV__) {
          await clearSession();
        } else {
          const session = await getSession();
          if (session?.userId) {
            setWorker({
              uid: session.userId,
              phone: session.phone,
              onboardingComplete: session.onboardingComplete,
            } as any);
          }
        }
      } catch (err) {
        console.warn('[AppNavigator] Failed to restore session:', err);
      } finally {
        setBootstrapping(false);
      }
    })();
  }, []);

  // Show splash until animation done AND session restored
  if (showSplash || bootstrapping) {
    return (
      <SplashScreen onDone={() => setShowSplash(false)} />
    );
  }

  const isLoggedIn           = !!worker?.uid;
  const isOnboardingComplete = worker?.onboardingComplete === true;

  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
        contentStyle: { backgroundColor: '#FFFFFF' },
      }}
    >
      {!isLoggedIn ? (
        <>
          <Stack.Screen name="Phone" component={PhoneScreen} />
          <Stack.Screen name="OTP"   component={OtpScreen} />
        </>
      ) : !isOnboardingComplete ? (
        <>
          <Stack.Screen name="Onboarding"      component={OnboardingFlow} />
          <Stack.Screen name="PaymentSuccess"  component={PaymentSuccessScreen} />
        </>
      ) : (
        <>
          <Stack.Screen name="Worker"         component={WorkerNavigator} />
          <Stack.Screen name="PaymentSuccess" component={PaymentSuccessScreen} />
          <Stack.Screen
            name="Profile"
            component={ProfileScreen}
            options={{ animation: 'slide_from_bottom' }}
          />
          <Stack.Screen name="DesignLab" component={DesignLabScreen} />
          <Stack.Screen name="Home1"     component={HomeScreen1} />
          <Stack.Screen name="Home2"     component={HomeScreen2} />
          <Stack.Screen name="Home3"     component={HomeScreen3} />
          <Stack.Screen name="Home4"     component={HomeScreen4} />
          <Stack.Screen name="Home5"  component={HomeScreen5} />
          <Stack.Screen name="Home6"  component={HomeScreen6} />
          <Stack.Screen name="Home7"  component={HomeScreen7} />
          <Stack.Screen name="Home8"  component={HomeScreen8} />
          <Stack.Screen name="Home9"  component={HomeScreen9} />
          <Stack.Screen name="Home10" component={HomeScreen10} />
          <Stack.Screen name="Home11" component={HomeScreen11} />
        </>
      )}
    </Stack.Navigator>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  splash: {
    flex: 1,
    backgroundColor: '#F8F7F4',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 20,
    paddingHorizontal: 32,
  },
  splashMasthead: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  splashRule: {
    width: 3,
    height: 52,
    backgroundColor: '#0f0f0e',
    borderRadius: 1.5,
  },
  splashBrandBlock: {
    gap: 4,
  },
  splashBrand: {
    fontSize: 28,
    fontWeight: '900',
    color: '#0f0f0e',
    letterSpacing: 6,
  },
  splashTagline: {
    fontSize: 12,
    fontWeight: '400',
    color: '#9ca3af',
    letterSpacing: 0.3,
  },
  splashDoubleRule: {
    width: 120,
    gap: 3,
  },
  splashRuleThick: {
    height: 2,
    backgroundColor: '#0f0f0e',
  },
  splashRuleThin: {
    height: 1,
    backgroundColor: '#e5e3de',
  },
  splashBadge: {
    position: 'absolute',
    bottom: 48,
  },
  splashBadgeText: {
    fontSize: 11,
    color: '#9ca3af',
    fontWeight: '400',
    letterSpacing: 0.5,
    textAlign: 'center',
  },
});
