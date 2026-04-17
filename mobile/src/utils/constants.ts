export const CLAIM_STATUS = {
  APPROVED: 'approved',
  FLAGGED: 'flagged',
  PAID: 'paid',
  REJECTED: 'rejected',
} as const;

export const TRIGGER_TYPES = {
  T1_HEAVY_RAINFALL: 'heavy_rainfall',
  T2_EXTREME_HEAT: 'extreme_heat',
  T3_SEVERE_AQI: 'severe_aqi',
  T4_FLOODING: 'flooding',
  T5_CURFEW_BANDH: 'curfew_bandh',
} as const;

export const PLANS = {
  basic: { id: 'basic', name: 'Basic', weeklyPremium: 29, coveragePercent: 50, maxPayoutPerWeek: 400 },
  shield: { id: 'shield', name: 'Shield', weeklyPremium: 59, coveragePercent: 70, maxPayoutPerWeek: 800 },
  'shield+': { id: 'shield+', name: 'Shield+', weeklyPremium: 99, coveragePercent: 90, maxPayoutPerWeek: 1500 },
} as const;
