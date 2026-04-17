'use strict';

const {
  PLANS,
  PREMIUM_BASE,
  PREMIUM_MULTIPLIER,
  PREMIUM_WEIGHTS,
  SHIFT_MULTIPLIERS,
} = require('../utils/constants');
const { getRiskScore } = require('./mlService');
const { getZoneWeatherData } = require('./weatherService');

/**
 * Calculate premium for a given zone and plan.
 *
 * Risk Score = (Temp Risk × 0.3) + (Rain Risk × 0.3) + (Activity Risk × 0.2) + (IFI × 0.2)
 * Weekly Premium = 50 + (Risk Score × 20)
 *
 * The plan-specific premium (₹29/59/99) is fixed; this formula is used for
 * risk-based quoting / comparison, not to override the fixed tiers.
 */
async function calculatePremium({ pincode, lat, lon, plan }) {
  if (!PLANS[plan]) {
    throw new Error(`Invalid plan: ${plan}. Must be one of: ${Object.keys(PLANS).join(', ')}`);
  }

  const planConfig = PLANS[plan];

  // Fetch live weather data for risk scoring
  let weatherData = {};
  try {
    weatherData = await getZoneWeatherData(lat, lon);
  } catch (err) {
    console.warn('[Premium] Weather fetch failed, proceeding with defaults:', err.message);
  }

  // Get ML-based risk score
  const riskData = await getRiskScore({ pincode, lat, lon, weatherData });

  const riskScore =
    riskData.temp_risk * PREMIUM_WEIGHTS.TEMP_RISK +
    riskData.rain_risk * PREMIUM_WEIGHTS.RAIN_RISK +
    riskData.activity_risk * PREMIUM_WEIGHTS.ACTIVITY_RISK +
    riskData.ifi * PREMIUM_WEIGHTS.IFI;

  const dynamicPremium = Math.round(PREMIUM_BASE + riskScore * PREMIUM_MULTIPLIER);

  return {
    plan: planConfig.id,
    planName: planConfig.name,
    fixedPremium: planConfig.weeklyPremium,   // The advertised fixed price
    dynamicPremium,                            // Risk-adjusted quote (for display)
    finalPremium: planConfig.weeklyPremium,   // Charge this (fixed tier pricing)
    coveragePercent: planConfig.coveragePercent,
    maxPayoutPerWeek: planConfig.maxPayoutPerWeek,
    riskScore: parseFloat(riskScore.toFixed(4)),
    riskBreakdown: {
      tempRisk: riskData.temp_risk,
      rainRisk: riskData.rain_risk,
      activityRisk: riskData.activity_risk,
      ifi: riskData.ifi,
    },
    weatherSnapshot: {
      temp: weatherData.temp,
      rainfall: weatherData.rainfall_mm_per_hr,
      aqi: weatherData.aqi,
    },
    riskSource: riskData.source,
  };
}

/**
 * Calculate payout for a disruption event.
 *
 * payout = disrupted_hours × (weekly_earnings / working_hours_per_week) × coverage%
 * Final Payout = Base Payout × Shift Multiplier
 * Weekly cap applies per plan.
 */
function calculatePayout({
  weeklyEarnings,
  workingHoursPerWeek,
  coveragePercent,
  maxPayoutPerWeek,
  disruptedHours,
  disruptionStartTime, // ISO string or Date — used to compute shift multiplier
}) {
  const hourlyRate = weeklyEarnings / (workingHoursPerWeek || 40);
  const basePayout = disruptedHours * hourlyRate * (coveragePercent / 100);

  const shiftMultiplier = getShiftMultiplier(
    disruptionStartTime ? new Date(disruptionStartTime) : new Date()
  );

  const finalPayout = Math.min(
    parseFloat((basePayout * shiftMultiplier.multiplier).toFixed(2)),
    maxPayoutPerWeek
  );

  return {
    hourlyRate: parseFloat(hourlyRate.toFixed(2)),
    basePayout: parseFloat(basePayout.toFixed(2)),
    shiftMultiplier: shiftMultiplier.multiplier,
    shiftLabel: shiftMultiplier.label,
    finalPayout,
    cappedAt: maxPayoutPerWeek,
    wasCapped: basePayout * shiftMultiplier.multiplier > maxPayoutPerWeek,
  };
}

/**
 * Determine the shift density multiplier based on the hour of day.
 */
function getShiftMultiplier(date) {
  const hour = date.getHours();

  if (hour >= SHIFT_MULTIPLIERS.PEAK_DINNER.start && hour < SHIFT_MULTIPLIERS.PEAK_DINNER.end) {
    return SHIFT_MULTIPLIERS.PEAK_DINNER; // 7pm–10pm → 2.0
  }
  if (hour >= SHIFT_MULTIPLIERS.PEAK_LUNCH.start && hour < SHIFT_MULTIPLIERS.PEAK_LUNCH.end) {
    return SHIFT_MULTIPLIERS.PEAK_LUNCH; // 12pm–2pm → 1.8
  }
  if ((hour >= 6 && hour < 12) || (hour >= 14 && hour < 19)) {
    return SHIFT_MULTIPLIERS.NORMAL; // Normal working hours → 1.0
  }
  if (hour >= 22 || hour < 6) {
    return SHIFT_MULTIPLIERS.OFF_PEAK_LOW; // Late night / early morning → 0.5
  }
  return SHIFT_MULTIPLIERS.OFF_PEAK; // Other off-peak → 0.8
}

module.exports = { calculatePremium, calculatePayout, getShiftMultiplier };
