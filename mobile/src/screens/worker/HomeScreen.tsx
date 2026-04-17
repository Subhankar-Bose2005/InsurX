import React, { useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  RefreshControl,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import useStore from '../../store/useStore';
import {
  getPolicies,
  getZoneWeather,
  getActiveTriggers,
  getClaims,
  fireDemoTrigger,
} from '../../services/api';
import { formatCurrency } from '../../utils/formatters';
import { logGpsWaypoint } from '../../services/gpsTracker';
import { useFocusEffect } from '@react-navigation/native';
import * as Location from 'expo-location';

const T = {
  paper: '#F8F7F4',
  ink: '#0f0f0e',
  faint: '#9ca3af',
  surface: '#F1F0EC',
  green: '#166534',
  red: '#b91c1c',
  amber: '#92400e',
  blue: '#1d4ed8',
};

export default function HomeScreen({ navigation }: any) {
  const {
    worker,
    activePolicy,
    weather,
    activeTriggers,
    claimSummary,
    setWeather,
    setActiveTriggers,
    setPolicies,
    setClaims,
  } = useStore();

  const [refreshing, setRefreshing] = React.useState(false);
  const [city, setCity] = React.useState('');
  const [firingTrigger, setFiringTrigger] = React.useState(false);

  useFocusEffect(
    useCallback(() => {
      if (worker?.uid) logGpsWaypoint();
    }, [worker?.uid])
  );

  const loadData = useCallback(async () => {
    try {
      if (!worker?.uid) return;

      const policyData = await getPolicies(worker.uid);
      setPolicies(policyData.policies);

      if (worker.pincode) {
        const [weatherData, triggersData] = await Promise.allSettled([
          getZoneWeather(worker.pincode),
          getActiveTriggers(worker.pincode),
        ]);

        if (weatherData.status === 'fulfilled') {
          setWeather(weatherData.value.weather);
        }

        if (triggersData.status === 'fulfilled') {
          setActiveTriggers(triggersData.value.triggers);
        }
      }

      const claimsData = await getClaims(worker.uid);
      setClaims(claimsData.claims, claimsData.summary);
    } catch (err: any) {
      console.log('Load error:', err);
    }
  }, [worker?.uid, worker?.pincode]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    (async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') return;

        const loc = await Location.getCurrentPositionAsync({});
        const geo = await Location.reverseGeocodeAsync(loc.coords);

        if (geo.length > 0) {
          setCity(geo[0].city || geo[0].region || '');
        }
      } catch {}
    })();
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const handleFireTrigger = async () => {
    setFiringTrigger(true);
    try {
      const res = await fireDemoTrigger();
      Alert.alert('Success', res.message);
      loadData();
    } catch (err: any) {
      Alert.alert('Error', err.message);
    } finally {
      setFiringTrigger(false);
    }
  };

  const isSafe = !activeTriggers || activeTriggers.length === 0;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      >
        {/* HERO */}
        <View style={styles.hero}>
          <Text style={styles.label}>Earnings Protected</Text>
          <Text style={styles.amount}>
            {formatCurrency(claimSummary?.totalProtected ?? 0)}
          </Text>
        </View>

        {/* ZONE CARD */}
        <View style={styles.card}>
          <Text style={styles.label}>Live Zone</Text>
          <Text style={styles.city}>{city || worker?.pincode}</Text>

          <Text
            style={{
              color: isSafe ? T.green : T.red,
              fontWeight: '700',
              marginTop: 4,
            }}
          >
            {isSafe ? 'Safe Zone ☀️' : 'Risk Detected ⚠️'}
          </Text>
        </View>

        {/* WEATHER */}
        {weather && (
          <View style={styles.card}>
            <Text style={styles.label}>Weather Insights</Text>

            <View style={styles.row}>
              <View style={styles.box}>
                <Text style={styles.big}>{weather.temp}°C</Text>
                <Text style={styles.small}>Temp</Text>
              </View>

              <View style={styles.box}>
                <Text style={styles.big}>{weather.aqi}</Text>
                <Text style={styles.small}>AQI</Text>
              </View>

              <View style={styles.box}>
                <Text style={styles.big}>
                  {weather.rainfall_mm_per_hr}mm
                </Text>
                <Text style={styles.small}>Rain</Text>
              </View>

              <View style={styles.box}>
                <Text style={styles.big}>{weather.humidity}%</Text>
                <Text style={styles.small}>Humidity</Text>
              </View>
            </View>
          </View>
        )}

        {/* QUICK STATS */}
        <View style={styles.card}>
          <Text style={styles.label}>Quick Stats</Text>

          <View style={styles.row}>
            <View style={styles.box}>
              <Text style={styles.big}>
                {formatCurrency(claimSummary?.lastPayout?.amount ?? 0)}
              </Text>
              <Text style={styles.small}>Last Payout</Text>
            </View>

            <View style={styles.box}>
              <Text style={styles.big}>
                {worker?.workingHours || 0}h
              </Text>
              <Text style={styles.small}>Weekly Hours</Text>
            </View>

            <View style={styles.box}>
              <Text style={styles.big}>
                {isSafe ? 'Low' : 'High'}
              </Text>
              <Text style={styles.small}>Risk</Text>
            </View>
          </View>
        </View>

        {/* POLICY */}
        <View style={styles.card}>
          <Text style={styles.label}>Policy</Text>
          <Text style={styles.city}>
            {activePolicy?.planName || 'No Active Plan'}
          </Text>

          <Text
            style={{
              color: activePolicy ? T.green : T.red,
              fontWeight: '600',
            }}
          >
            {activePolicy ? 'Active' : 'Inactive'}
          </Text>

          {!activePolicy && (
            <TouchableOpacity
              style={styles.buyBtn}
              onPress={() => navigation.navigate('Policy')}
            >
              <Text style={{ color: '#fff' }}>Buy Plan</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* BUTTON */}
        <TouchableOpacity style={styles.btn} onPress={handleFireTrigger}>
          {firingTrigger ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.btnText}>Fire Demo Trigger</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: T.paper },
  content: { padding: 20 },

  hero: { marginBottom: 20 },

  label: { fontSize: 12, color: T.faint, marginBottom: 6 },

  amount: { fontSize: 48, fontWeight: '900' },

  card: {
    backgroundColor: T.surface,
    padding: 16,
    borderRadius: 10,
    marginBottom: 15,
  },

  city: { fontSize: 20, fontWeight: '700' },

  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },

  box: { alignItems: 'center' },

  big: { fontSize: 16, fontWeight: '800' },

  small: { fontSize: 10, color: T.faint },

  btn: {
    backgroundColor: '#000',
    padding: 16,
    borderRadius: 10,
    marginTop: 20,
  },

  btnText: {
    color: '#fff',
    textAlign: 'center',
    fontWeight: '700',
  },

  buyBtn: {
    marginTop: 10,
    backgroundColor: '#000',
    padding: 10,
    borderRadius: 6,
    alignItems: 'center',
  },
});