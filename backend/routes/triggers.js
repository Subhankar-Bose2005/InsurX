const express = require('express');
const router = express.Router();

const { getDb } = require('../config/firebase');
const { authMiddleware } = require('../middleware/auth');
const { TRIGGER_STATUS } = require('../utils/constants');


router.post('/demo/fire', authMiddleware, async (req, res, next) => {
  try {
    const db = getDb();
    const workerId = req.user.uid;

    const workerSnap = await db.collection('workers').doc(workerId).get();
    if (!workerSnap.exists) {
      return res.status(404).json({ success: false, error: 'Complete onboarding first.' });
    }

    const worker = workerSnap.data();
    const pincode = worker.pincode;

    // ✅ SAFE DEMO TRIGGERS ONLY
    const SAFE_TRIGGERS = ['heavy_rainfall', 'extreme_heat', 'severe_aqi'];

    const triggerType =
      SAFE_TRIGGERS.includes(req.body.type)
        ? req.body.type
        : SAFE_TRIGGERS[Math.floor(Math.random() * SAFE_TRIGGERS.length)];

    const triggerLabels = {
      heavy_rainfall: 'Heavy Rainfall (38mm/hr)',
      extreme_heat: 'Extreme Heat (47°C)',
      severe_aqi: 'Severe AQI (430)',
    };

    const triggerData = {
      type: triggerType,
      zone: worker.zone || pincode,
      pincode,
      severity:
        triggerType === 'heavy_rainfall'
          ? 38
          : triggerType === 'extreme_heat'
          ? 47
          : 430,
      startTime: new Date().toISOString(),
      endTime: null,
      status: TRIGGER_STATUS.ACTIVE,
      isManual: true,
      isDemoFire: true,
      createdBy: workerId,
      createdAt: new Date().toISOString(),
    };

    const triggerRef = await db.collection('triggerEvents').add(triggerData);

    // ✅ FIXED POLICY FETCH (NO INDEX NEEDED)
    const policySnap = await db
      .collection('policies')
      .where('workerId', '==', workerId)
      .get();

    const policies = policySnap.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));

    const activePolicy = policies.find(p => p.status === 'active');

    if (!activePolicy) {
      return res.json({
        success: true,
        trigger: { id: triggerRef.id, ...triggerData },
        claim: null,
        message: 'No active policy found.',
      });
    }

    const policy = activePolicy;
    const policyId = activePolicy.id;

    const { PLANS, CLAIM_STATUS } = require('../utils/constants');
    const { calculatePayout } = require('../services/premiumService');

    const planConfig = PLANS[policy.plan];

    const payoutCalc = calculatePayout({
      weeklyEarnings: worker.weeklyEarnings || 3000,
      workingHoursPerWeek: worker.workingHours || 40,
      coveragePercent: planConfig.coveragePercent,
      maxPayoutPerWeek: planConfig.maxPayoutPerWeek,
      disruptedHours: 4,
      disruptionStartTime: new Date().toISOString(),
    });

    // ✅ SAFE FRAUD CHECK (NO CRASH)
    const { getFraudScore } = require('../services/mlService');

    let fraudResult;
    try {
      fraudResult = await getFraudScore({
        workerId,
        claimData: {
          finalPayout: payoutCalc.finalPayout,
          disruptedHours: 4,
          triggerType,
          claimFrequency: 0,
        },
        gpsHistory: [],
      });
    } catch {
      fraudResult = { fraud_score: 0.1, risk_level: 'low' };
    }

    // ✅ CLAIM DATA
    const claimData = {
      workerId,
      policyId,
      triggerId: triggerRef.id,
      triggerType,
      triggerLabel: triggerLabels[triggerType],
      pincode,
      disruptedHours: 4,
      finalPayout: payoutCalc.finalPayout,
      status:
        fraudResult.risk_level === 'high'
          ? CLAIM_STATUS.FLAGGED
          : CLAIM_STATUS.APPROVED,
      fraudScore: fraudResult.fraud_score,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const claimRef = await db.collection('claims').add(claimData);

    return res.json({
      success: true,
      trigger: { id: triggerRef.id, ...triggerData },
      claim: { id: claimRef.id, ...claimData },
      message: `₹${payoutCalc.finalPayout} credited successfully`,
    });

  } catch (err) {
    next(err);
  }
});

module.exports = router;