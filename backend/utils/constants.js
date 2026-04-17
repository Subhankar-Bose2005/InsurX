'use strict';

// ─── Trigger Thresholds ───────────────────────────────────────────────────────
const TRIGGER_TYPES = {
  T1_HEAVY_RAINFALL: 'heavy_rainfall',
  T2_EXTREME_HEAT: 'extreme_heat',
  T3_SEVERE_AQI: 'severe_aqi',
  T4_FLOODING: 'flooding',
  T5_CURFEW_BANDH: 'curfew_bandh',
};

const TRIGGER_THRESHOLDS = {
  [TRIGGER_TYPES.T1_HEAVY_RAINFALL]: {
    rainfall_mm_per_hr: 30,  // > 30mm/hr
    min_duration_hrs: 2,
    label: 'Heavy Rainfall',
    description: 'Rainfall exceeding 30mm/hr for 2+ consecutive hours',
  },
  [TRIGGER_TYPES.T2_EXTREME_HEAT]: {
    temp_celsius: 45,         // > 45°C
    min_duration_hrs: 3,
    label: 'Extreme Heat',
    description: 'Temperature exceeding 45°C for 3+ consecutive hours',
  },
  [TRIGGER_TYPES.T3_SEVERE_AQI]: {
    aqi: 400,                 // > 400
    min_duration_hrs: 4,
    label: 'Severe AQI',
    description: 'AQI exceeding 400 for 4+ consecutive hours',
  },
  [TRIGGER_TYPES.T4_FLOODING]: {
    manual: true,
    label: 'Flooding',
    description: 'Official NDMA flooding warning',
  },
  [TRIGGER_TYPES.T5_CURFEW_BANDH]: {
    manual: true,
    label: 'Curfew / Bandh',
    description: 'Verified government curfew or bandh order',
  },
};

// ─── Insurance Plans ──────────────────────────────────────────────────────────
const PLANS = {
  basic: {
    id: 'basic',
    name: 'Basic',
    weeklyPremium: 29,       // ₹29/week
    coveragePercent: 50,     // 50%
    maxPayoutPerWeek: 400,   // ₹400 cap
    description: 'Essential income protection for delivery partners',
  },
  shield: {
    id: 'shield',
    name: 'Shield',
    weeklyPremium: 59,       // ₹59/week
    coveragePercent: 70,     // 70%
    maxPayoutPerWeek: 800,   // ₹800 cap
    description: 'Enhanced coverage for regular delivery partners',
  },
  'shield+': {
    id: 'shield+',
    name: 'Shield+',
    weeklyPremium: 99,       // ₹99/week
    coveragePercent: 90,     // 90%
    maxPayoutPerWeek: 1500,  // ₹1,500 cap
    description: 'Maximum protection for full-time delivery partners',
  },
};

// ─── Shift Density Multipliers ────────────────────────────────────────────────
const SHIFT_MULTIPLIERS = {
  PEAK_LUNCH: { start: 12, end: 14, multiplier: 1.8, label: 'Lunch Peak' },     // 12–2pm
  PEAK_DINNER: { start: 19, end: 22, multiplier: 2.0, label: 'Dinner Peak' },   // 7–10pm
  NORMAL: { multiplier: 1.0, label: 'Normal Hours' },
  OFF_PEAK_LOW: { multiplier: 0.5, label: 'Off-peak (Low)' },
  OFF_PEAK: { multiplier: 0.8, label: 'Off-peak' },
};

// ─── Premium Calculation Weights ─────────────────────────────────────────────
const PREMIUM_WEIGHTS = {
  TEMP_RISK: 0.3,
  RAIN_RISK: 0.3,
  ACTIVITY_RISK: 0.2,
  IFI: 0.2,                  // Income Fragility Index
};

const PREMIUM_BASE = 50;     // ₹50 base premium
const PREMIUM_MULTIPLIER = 20; // Risk score × 20

// ─── Fraud Score Weights ──────────────────────────────────────────────────────
const FRAUD_SCORE_WEIGHTS = {
  SEQUENCE: 0.4,
  TABULAR: 0.4,
  GRAPH: 0.2,
};

const FRAUD_THRESHOLDS = {
  LOW_RISK: 0.3,
  HIGH_RISK: 0.7,
};

// ─── Delivery Platforms ───────────────────────────────────────────────────────
const PLATFORMS = ['zomato', 'swiggy', 'zepto', 'other'];

// ─── Working Hours Defaults ───────────────────────────────────────────────────
const DEFAULT_WORKING_HOURS_PER_WEEK = 40;

// ─── Policy Status ────────────────────────────────────────────────────────────
const POLICY_STATUS = {
  ACTIVE: 'active',
  EXPIRED: 'expired',
  CANCELLED: 'cancelled',
};

// ─── Claim Status ─────────────────────────────────────────────────────────────
const CLAIM_STATUS = {
  APPROVED: 'approved',
  FLAGGED: 'flagged',
  PAID: 'paid',
  REJECTED: 'rejected',
};

// ─── Trigger Event Status ─────────────────────────────────────────────────────
const TRIGGER_STATUS = {
  ACTIVE: 'active',
  RESOLVED: 'resolved',
};

// ─── Policy Exclusions (README §6) ───────────────────────────────────────────
// These events void all parametric claims — systemic risk, no measurable trigger.
const EXCLUSION_TYPES = {
  WAR_CONFLICT:    'war_conflict',
  CIVIL_UNREST:    'civil_unrest',
  PANDEMIC:        'pandemic',
  STATE_EMERGENCY: 'state_emergency',
  NATIONAL_LOCKDOWN:'national_lockdown',
};

const EXCLUSION_LABELS = {
  [EXCLUSION_TYPES.WAR_CONFLICT]:     'War / Armed Conflict',
  [EXCLUSION_TYPES.CIVIL_UNREST]:     'Civil Unrest',
  [EXCLUSION_TYPES.PANDEMIC]:         'Pandemic / Health Emergency',
  [EXCLUSION_TYPES.STATE_EMERGENCY]:  'State of Emergency',
  [EXCLUSION_TYPES.NATIONAL_LOCKDOWN]:'National / City Lockdown',
};

const EXCLUSION_STATUS = {
  ACTIVE:   'active',
  LIFTED:   'lifted',
};

module.exports = {
  TRIGGER_TYPES,
  TRIGGER_THRESHOLDS,
  PLANS,
  SHIFT_MULTIPLIERS,
  PREMIUM_WEIGHTS,
  PREMIUM_BASE,
  PREMIUM_MULTIPLIER,
  FRAUD_SCORE_WEIGHTS,
  FRAUD_THRESHOLDS,
  PLATFORMS,
  DEFAULT_WORKING_HOURS_PER_WEEK,
  POLICY_STATUS,
  CLAIM_STATUS,
  TRIGGER_STATUS,
  EXCLUSION_TYPES,
  EXCLUSION_LABELS,
  EXCLUSION_STATUS,
};
