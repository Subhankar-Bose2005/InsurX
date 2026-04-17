'use strict';

const cron = require('node-cron');
const { getDb } = require('../config/firebase');
const { getZoneWeatherData } = require('../services/weatherService');
const { getFraudScore } = require('../services/mlService');
const { calculatePayout } = require('../services/premiumService');
const {
  TRIGGER_TYPES,
  TRIGGER_THRESHOLDS,
  TRIGGER_STATUS,
  CLAIM_STATUS,
  POLICY_STATUS,
  PLANS,
} = require('../utils/constants');

let isRunning = false;

/**
 * Check weather data against all trigger thresholds.
 * Returns list of triggered types with severity info.
 */
function evaluateTriggers(weatherData) {
  const triggered = [];

  // T1: Heavy Rainfall
  if (weatherData.rainfall_mm_per_hr > TRIGGER_THRESHOLDS[TRIGGER_TYPES.T1_HEAVY_RAINFALL].rainfall_mm_per_hr) {
    triggered.push({
      type: TRIGGER_TYPES.T1_HEAVY_RAINFALL,
      severity: weatherData.rainfall_mm_per_hr,
      label: 'Heavy Rainfall',
    });
  }

  // T2: Extreme Heat
  if (weatherData.temp > TRIGGER_THRESHOLDS[TRIGGER_TYPES.T2_EXTREME_HEAT].temp_celsius) {
    triggered.push({
      type: TRIGGER_TYPES.T2_EXTREME_HEAT,
      severity: weatherData.temp,
      label: 'Extreme Heat',
    });
  }

  // T3: Severe AQI
  if (weatherData.aqi > TRIGGER_THRESHOLDS[TRIGGER_TYPES.T3_SEVERE_AQI].aqi) {
    triggered.push({
      type: TRIGGER_TYPES.T3_SEVERE_AQI,
      severity: weatherData.aqi,
      label: 'Severe AQI',
    });
  }

  return triggered;
}

/**
 * Create a claim for a policy given a trigger event.
 */
async function createClaimForPolicy(db, policy, policyId, workerId, triggerEvent, triggerId) {
  const worker = await db.collection('workers').doc(workerId).get();
  if (!worker.exists) return;
  const workerData = worker.data();

  const planConfig = PLANS[policy.plan];
  if (!planConfig) return;

  // Disrupted hours = 1 per automated trigger check (hourly cron)
  // In production this would be the actual event duration
  const disruptedHours = 1;

  const payoutCalc = calculatePayout({
    weeklyEarnings: workerData.weeklyEarnings || 2000,
    workingHoursPerWeek: workerData.workingHours || 40,
    coveragePercent: planConfig.coveragePercent,
    maxPayoutPerWeek: planConfig.maxPayoutPerWeek,
    disruptedHours,
    disruptionStartTime: new Date().toISOString(),
  });

  // Fetch real GPS waypoints for LSTM sequence model
  let gpsHistory = [];
  try {
    const gpsSnap = await db
      .collection('workers').doc(workerId)
      .collection('gpsWaypoints')
      .orderBy('timestamp', 'desc')
      .limit(9)
      .get();
    gpsHistory = gpsSnap.docs
      .map((d) => d.data())
      .reverse() // oldest → newest
      .map((p) => ({ lat: p.lat, lon: p.lon, speed: p.speed || 0, timestamp: p.timestamp }));
  } catch (gpsErr) {
    console.warn('[TriggerMonitor] GPS history fetch failed:', gpsErr.message);
  }

  // Compute real claim frequency (claims in last 7 days)
  let claimFrequency = 0;
  try {
    const since = new Date();
    since.setDate(since.getDate() - 7);
    const recentClaimsSnap = await db
      .collection('claims')
      .where('workerId', '==', workerId)
      .get();
    claimFrequency = recentClaimsSnap.docs.filter(
      (d) => (d.data().createdAt || '') >= since.toISOString()
    ).length;
  } catch (freqErr) {
    console.warn('[TriggerMonitor] Claim frequency fetch failed:', freqErr.message);
  }

  // Fraud check with real GPS + real claim frequency
  const fraudResult = await getFraudScore({
    workerId,
    claimData: {
      finalPayout: payoutCalc.finalPayout,
      disruptedHours,
      triggerType: triggerEvent.type,
      claimFrequency,
    },
    gpsHistory,
  });

  const claimStatus =
    fraudResult.risk_level === 'high' ? CLAIM_STATUS.FLAGGED : CLAIM_STATUS.APPROVED;

  const claimData = {
    workerId,
    policyId,
    triggerId,
    triggerType: triggerEvent.type,
    triggerLabel: triggerEvent.label,
    disruptedHours,
    shiftMultiplier: payoutCalc.shiftMultiplier,
    shiftLabel: payoutCalc.shiftLabel,
    basePayout: payoutCalc.basePayout,
    finalPayout: payoutCalc.finalPayout,
    status: claimStatus,
    fraudScore: fraudResult.fraud_score,
    fraudRiskLevel: fraudResult.risk_level,
    fraudBreakdown: {
      sequenceScore: fraudResult.sequence_score,
      tabularScore: fraudResult.tabular_score,
      graphScore: fraudResult.graph_score,
    },
    razorpayPayoutId: null,
    weekBatchDate: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  await db.collection('claims').add(claimData);
  console.info(
    `[TriggerMonitor] Claim created for worker ${workerId} — ₹${payoutCalc.finalPayout} — status: ${claimStatus}`
  );
}

/**
 * Main trigger monitoring job.
 * Runs every hour via node-cron.
 */
async function runTriggerMonitor() {
  if (isRunning) {
    console.info('[TriggerMonitor] Already running, skipping this tick.');
    return;
  }
  isRunning = true;
  console.info('[TriggerMonitor] Starting hourly check —', new Date().toISOString());

  try {
    const db = getDb();

    // Fetch all active zones
    const zonesSnap = await db.collection('zones').get();
    if (zonesSnap.empty) {
      console.info('[TriggerMonitor] No active zones found.');
      return;
    }

    for (const zoneDoc of zonesSnap.docs) {
      const zone = zoneDoc.data();
      const zoneId = zoneDoc.id;

      try {
        const weatherData = await getZoneWeatherData(zone.lat, zone.lon);
        const triggeredEvents = evaluateTriggers(weatherData);

        if (triggeredEvents.length === 0) {
          // Resolve any active triggers for this zone if conditions normalized
          await resolveZoneTriggers(db, zone.pincode, weatherData);
          // Reset all hysteresis counters for this zone
          const resetUpdate = {};
          for (const type of Object.values(TRIGGER_TYPES)) {
            resetUpdate[`pending_${type}`] = 0;
          }
          await db.collection('zones').doc(zoneId).update(resetUpdate).catch(() => {});
          continue;
        }

        for (const triggerInfo of triggeredEvents) {
          // Check if trigger already active for this zone
          const existingTriggerSnap = await db
            .collection('triggerEvents')
            .where('pincode', '==', zone.pincode)
            .where('type', '==', triggerInfo.type)
            .where('status', '==', TRIGGER_STATUS.ACTIVE)
            .limit(1)
            .get();

          let triggerId;

          if (existingTriggerSnap.empty) {
            // ── Hysteresis check (README §6) ──────────────────────────────────
            // Do not fire immediately — record a "pending" observation first.
            // Only fire if the same trigger type has been observed for
            // min_duration_hrs consecutive hourly checks.
            const minDurationHrs = TRIGGER_THRESHOLDS[triggerInfo.type]?.min_duration_hrs || 1;
            const pendingKey = `pending_${triggerInfo.type}`;

            const zoneData = zoneDoc.data();
            const pendingCount = (zoneData[pendingKey] || 0) + 1;

            if (pendingCount < minDurationHrs) {
              // Not yet sustained long enough — increment counter, skip claim creation
              await db.collection('zones').doc(zoneId).update({ [pendingKey]: pendingCount });
              console.info(
                `[TriggerMonitor] Hysteresis: ${triggerInfo.type} in ${zone.pincode} — ${pendingCount}/${minDurationHrs} hrs sustained`
              );
              continue;
            }

            // Threshold sustained — reset counter and fire the trigger
            await db.collection('zones').doc(zoneId).update({ [pendingKey]: 0 });

            // Create new trigger event
            const triggerEventData = {
              type: triggerInfo.type,
              zone: zone.city || zoneId,
              pincode: zone.pincode,
              severity: triggerInfo.severity,
              startTime: new Date().toISOString(),
              endTime: null,
              status: TRIGGER_STATUS.ACTIVE,
              weatherData,
              createdAt: new Date().toISOString(),
            };

            const triggerRef = await db.collection('triggerEvents').add(triggerEventData);
            triggerId = triggerRef.id;

            // Update zone activeDisruption flag
            await db.collection('zones').doc(zoneId).update({ activeDisruption: true });

            console.info(
              `[TriggerMonitor] New trigger [${triggerInfo.type}] for zone ${zone.pincode}`
            );

            // Find all active policies in this zone and create claims
            const policiesSnap = await db
              .collection('policies')
              .where('pincode', '==', zone.pincode)
              .where('status', '==', POLICY_STATUS.ACTIVE)
              .get();

            for (const policyDoc of policiesSnap.docs) {
              const policy = policyDoc.data();
              await createClaimForPolicy(
                db,
                policy,
                policyDoc.id,
                policy.workerId,
                triggerInfo,
                triggerId
              ).catch((err) =>
                console.error(
                  `[TriggerMonitor] Failed to create claim for policy ${policyDoc.id}:`,
                  err.message
                )
              );
            }
          } else {
            // Update existing trigger severity/timestamp
            triggerId = existingTriggerSnap.docs[0].id;
            await db.collection('triggerEvents').doc(triggerId).update({
              severity: triggerInfo.severity,
              weatherData,
              updatedAt: new Date().toISOString(),
            });
          }
        }
      } catch (zoneErr) {
        console.error(`[TriggerMonitor] Error processing zone ${zone.pincode}:`, zoneErr.message);
      }
    }
  } catch (err) {
    console.error('[TriggerMonitor] Fatal error:', err.message);
  } finally {
    isRunning = false;
    console.info('[TriggerMonitor] Check complete —', new Date().toISOString());
  }
}

async function resolveZoneTriggers(db, pincode, weatherData) {
  const activeTriggersSnap = await db
    .collection('triggerEvents')
    .where('pincode', '==', pincode)
    .where('status', '==', TRIGGER_STATUS.ACTIVE)
    .get();

  if (activeTriggersSnap.empty) return;

  const batch = db.batch();
  for (const doc of activeTriggersSnap.docs) {
    batch.update(doc.ref, {
      status: TRIGGER_STATUS.RESOLVED,
      endTime: new Date().toISOString(),
      resolvedWeatherData: weatherData,
    });
  }
  await batch.commit();

  // Clear zone activeDisruption flag
  const zonesSnap = await db.collection('zones').where('pincode', '==', pincode).limit(1).get();
  if (!zonesSnap.empty) {
    await zonesSnap.docs[0].ref.update({ activeDisruption: false });
  }

  console.info(`[TriggerMonitor] Resolved ${activeTriggersSnap.size} trigger(s) for zone ${pincode}`);

  // ── Disruption Dividend ──────────────────────────────────────────────────
  // Workers who had an active policy AND GPS movement during the disruption
  // window but filed NO claim showed up anyway. Reward them with a 10%
  // premium credit on their next billing cycle.
  try {
    const resolvedTriggerIds = activeTriggersSnap.docs.map((d) => d.id);
    const disruptionStart = activeTriggersSnap.docs[0]?.data()?.startTime;
    const disruptionEnd   = new Date().toISOString();

    // Find all active policies in this zone
    const policiesSnap = await db
      .collection('policies')
      .where('pincode', '==', pincode)
      .where('status', '==', POLICY_STATUS.ACTIVE)
      .get();

    for (const policyDoc of policiesSnap.docs) {
      const workerId = policyDoc.data().workerId;

      // Check if worker already filed a claim for any of these trigger events
      const claimSnap = await db
        .collection('claims')
        .where('workerId', '==', workerId)
        .where('triggerId', 'in', resolvedTriggerIds.slice(0, 10))
        .limit(1)
        .get();

      if (!claimSnap.empty) continue; // claimed — no dividend

      // Check if worker had GPS activity during disruption window (was actually working)
      let wasActive = false;
      if (disruptionStart) {
        const gpsSnap = await db
          .collection('workers').doc(workerId)
          .collection('gpsWaypoints')
          .orderBy('timestamp', 'desc')
          .limit(20)
          .get();

        wasActive = gpsSnap.docs.some((d) => {
          const ts = d.data().timestamp;
          return ts >= disruptionStart && ts <= disruptionEnd && (d.data().speed || 0) > 0.5;
        });
      }

      if (!wasActive) continue; // no GPS movement — no dividend

      // Grant 10% loyalty credit
      const weeklyPremium = PLANS[policyDoc.data().plan]?.weeklyPremium || 0;
      const creditAmount  = Math.round(weeklyPremium * 0.1);

      await db.collection('workers').doc(workerId).update({
        loyaltyCredit:      (db.FieldValue?.increment(creditAmount) || creditAmount),
        lastDividendReason: `Worked through ${pincode} disruption on ${disruptionEnd.slice(0, 10)}`,
        lastDividendAt:     disruptionEnd,
      });

      console.info(`[TriggerMonitor] Disruption Dividend — ₹${creditAmount} credit for worker ${workerId} (worked through disruption)`);
    }
  } catch (dividendErr) {
    console.warn('[TriggerMonitor] Disruption Dividend calculation failed:', dividendErr.message);
  }
}

/**
 * Register the cron job.
 * Runs at minute 0 of every hour: "0 * * * *"
 */
function startTriggerMonitor() {
  console.info('[TriggerMonitor] Scheduling hourly trigger monitor (0 * * * *)');

  cron.schedule('0 * * * *', runTriggerMonitor, {
    timezone: 'Asia/Kolkata',
  });

  // Run immediately on startup for demo purposes
  if (process.env.NODE_ENV !== 'test') {
    setTimeout(() => runTriggerMonitor(), 5000);
  }
}

module.exports = { startTriggerMonitor, runTriggerMonitor };
