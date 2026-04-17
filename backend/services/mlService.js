'use strict';

const axios = require('axios');
const { FRAUD_SCORE_WEIGHTS, FRAUD_THRESHOLDS } = require('../utils/constants');

// Fallback scores used when ML service is unavailable or not configured
const FALLBACK_RISK = {
  risk_score: 0.5,
  temp_risk: 0.5,
  rain_risk: 0.5,
  activity_risk: 0.5,
  ifi: 0.5,
  source: 'fallback',
};

const FALLBACK_FRAUD = {
  fraud_score: 0.1,
  sequence_score: 0.1,
  tabular_score: 0.1,
  graph_score: 0.1,
  risk_level: 'low',
  source: 'fallback',
};

function getMLClient() {
  const baseURL = process.env.ML_SERVICE_URL;
  if (!baseURL) return null;
  return axios.create({ baseURL, timeout: 10000 });
}

/**
 * Get risk score for a zone from the ML service.
 * Input: { pincode, lat, lon, temp, rainfall, aqi }
 * Output: { risk_score, temp_risk, rain_risk, activity_risk, ifi }
 */
async function getRiskScore({ pincode, lat, lon, weatherData = {} }) {
  try {
    // Flask model is fraud-focused; derive risk scores from weather thresholds
    const temp = weatherData.temp || 30;
    const rainfall = weatherData.rainfall_mm_per_hr || 0;
    const aqi = weatherData.aqi || 100;

    const tempRisk = Math.min(Math.max((temp - 25) / 25, 0), 1);
    const rainRisk = Math.min(rainfall / 50, 1);
    const aqiRisk = Math.min(Math.max((aqi - 100) / 400, 0), 1);
    const activityRisk = (tempRisk + rainRisk) / 2;

    // Fetch IFI from Firestore zones collection if available
    const { getDb } = require('../config/firebase');
    let ifi = 0.5;
    try {
      const db = getDb();
      const zoneSnap = await db.collection('zones').where('pincode', '==', String(pincode)).limit(1).get();
      if (!zoneSnap.empty) ifi = zoneSnap.docs[0].data().ifiScore || 0.5;
    } catch (_) {}

    const riskScore = tempRisk * 0.3 + rainRisk * 0.3 + activityRisk * 0.2 + ifi * 0.2;

    return {
      risk_score: parseFloat(riskScore.toFixed(4)),
      temp_risk: parseFloat(tempRisk.toFixed(4)),
      rain_risk: parseFloat(rainRisk.toFixed(4)),
      activity_risk: parseFloat(activityRisk.toFixed(4)),
      ifi: parseFloat(ifi.toFixed(4)),
      source: 'computed',
    };
  } catch (err) {
    console.error('[ML] getRiskScore failed:', err.message, '— using fallback.');
    return FALLBACK_RISK;
  }
}

/**
 * Compute real GPS-derived features for the XGBoost tabular model.
 * Uses Haversine distance, speed variance, and location spread.
 */
function computeGpsFeatures(gpsHistory, claimData) {
  const n = gpsHistory.length;

  // avg_speed in m/s from device GPS (already m/s from expo-location)
  let avgSpeed = 0;
  if (n > 0) {
    const speeds = gpsHistory.map((p) => Math.abs(p.speed || 0));
    avgSpeed = speeds.reduce((a, b) => a + b, 0) / n;
  }

  // total_distance via Haversine (km)
  let totalDistance = 0;
  for (let i = 1; i < n; i++) {
    totalDistance += haversineKm(gpsHistory[i - 1], gpsHistory[i]);
  }
  if (n <= 1) totalDistance = 0.1; // prevent zero for single-point history

  // location_variance: stddev of lat + lon combined
  let locationVariance = 0;
  if (n > 1) {
    const lats = gpsHistory.map((p) => p.lat);
    const lons = gpsHistory.map((p) => p.lon);
    const latMean = lats.reduce((a, b) => a + b, 0) / n;
    const lonMean = lons.reduce((a, b) => a + b, 0) / n;
    const latVar = lats.reduce((s, v) => s + (v - latMean) ** 2, 0) / n;
    const lonVar = lons.reduce((s, v) => s + (v - lonMean) ** 2, 0) / n;
    locationVariance = parseFloat((Math.sqrt(latVar + lonVar)).toFixed(6));
  }

  return {
    avg_speed: parseFloat(avgSpeed.toFixed(4)),
    total_distance: parseFloat(totalDistance.toFixed(4)),
    location_variance: locationVariance,
    update_frequency: n || 1,
    is_heavy_rain: claimData.triggerType === 'heavy_rainfall' ? 1 : 0,
    is_extreme_temp: claimData.triggerType === 'extreme_heat' ? 1 : 0,
    is_hazardous_aqi: claimData.triggerType === 'severe_aqi' ? 1 : 0,
    rain_intensity: claimData.triggerType === 'heavy_rainfall' ? (claimData.severity || 35) : 0,
  };
}

function haversineKm(p1, p2) {
  const R = 6371;
  const dLat = ((p2.lat - p1.lat) * Math.PI) / 180;
  const dLon = ((p2.lon - p1.lon) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((p1.lat * Math.PI) / 180) *
      Math.cos((p2.lat * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

/**
 * Get fraud score for a claim from the ML service.
 * Input: { workerId, claimData, gpsHistory }
 * Output: { fraud_score, sequence_score, tabular_score, graph_score, risk_level }
 *
 * Final fraud_score = (0.4 × sequence) + (0.4 × tabular) + (0.2 × graph)
 * < 0.3: low risk → auto-approve
 * 0.3–0.7: medium risk → manual review
 * > 0.7: high risk → flag/reject
 */
async function getFraudScore({ workerId, claimData, gpsHistory = [] }) {
  const client = getMLClient();
  if (!client) {
    console.info('[ML] ML_SERVICE_URL not set. Using fallback fraud score.');
    return FALLBACK_FRAUD;
  }

  try {
    const features = computeGpsFeatures(gpsHistory, claimData);
    const payload = {
      features,
      sequence: gpsHistory.length >= 9
        ? gpsHistory.slice(-9).map((p) => [p.lat || 0, p.lon || 0, p.speed || 0, p.timestamp || 0])
        : null,
    };

    const response = await client.post('/predict', payload);
    const data = response.data;

    const finalScore = clamp(data.final_score, 0, 1);
    const xgbScore = clamp(data.xgb_score, 0, 1);
    const lstmScore = data.lstm_score !== null ? clamp(data.lstm_score, 0, 1) : xgbScore;
    const riskLevel = getRiskLevel(finalScore);

    return {
      fraud_score: finalScore,
      sequence_score: lstmScore,
      tabular_score: xgbScore,
      graph_score: xgbScore * 0.5, // GNN not in Flask model, derive from XGB
      risk_level: riskLevel,
      source: 'ml_service',
    };
  } catch (err) {
    console.error('[ML] getFraudScore failed:', err.message, '— using fallback.');
    return FALLBACK_FRAUD;
  }
}

function getRiskLevel(score) {
  if (score < FRAUD_THRESHOLDS.LOW_RISK) return 'low';
  if (score <= FRAUD_THRESHOLDS.HIGH_RISK) return 'medium';
  return 'high';
}

function clamp(val, min, max) {
  const n = parseFloat(val);
  if (isNaN(n)) return min;
  return Math.min(Math.max(n, min), max);
}

module.exports = { getRiskScore, getFraudScore };
