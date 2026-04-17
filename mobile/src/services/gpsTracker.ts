import * as Location from 'expo-location';
import { getSession } from './session';
import api from './api';

/**
 * Log the worker's current GPS position to the backend.
 * Called silently on HomeScreen mount/focus — non-blocking.
 * Feeds the LSTM fraud detection model with real movement sequences.
 */
export async function logGpsWaypoint(): Promise<void> {
  try {
    const session = await getSession();
    if (!session?.userId || !session?.idToken) return;

    const { status } = await Location.getForegroundPermissionsAsync();
    if (status !== 'granted') {
      const req = await Location.requestForegroundPermissionsAsync();
      if (req.status !== 'granted') return;
    }

    const loc = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.Balanced,
    });

    await api.post(`/workers/${session.userId}/gps`, {
      lat: loc.coords.latitude,
      lon: loc.coords.longitude,
      accuracy: loc.coords.accuracy,
      speed: loc.coords.speed ?? 0,         // m/s, null when stationary
      altitude: loc.coords.altitude ?? 0,
      timestamp: Math.floor(loc.timestamp / 1000), // Unix seconds
    });
  } catch {
    // Non-critical — silently fail, never block the UI
  }
}
