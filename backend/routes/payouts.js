'use strict';

const express = require('express');
const { param, validationResult } = require('express-validator');
const { getDb } = require('../config/firebase');
const { authMiddleware, adminMiddleware } = require('../middleware/auth');
const { getPayoutStatus } = require('../services/razorpayService');
const { runWeeklyPayout } = require('../jobs/weeklyPayout');
const { CLAIM_STATUS } = require('../utils/constants');

const router = express.Router();

router.use(authMiddleware);

/**
 * GET /api/payouts/:workerId
 * Get payout history for a worker — all paid claims grouped by batch.
 */
router.get(
  '/:workerId',
  [param('workerId').notEmpty()],
  async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    try {
      const { workerId } = req.params;

      if (workerId !== req.user.uid && !req.user.admin) {
        return res.status(403).json({ success: false, error: 'Access denied.' });
      }

      const db = getDb();
      const snap = await db
        .collection('claims')
        .where('workerId', '==', workerId)
        .where('status', '==', CLAIM_STATUS.PAID)
        .orderBy('paidAt', 'desc')
        .limit(100)
        .get();

      const payouts = snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

      // Group by weekBatchDate
      const byBatch = {};
      for (const payout of payouts) {
        const key = payout.weekBatchDate || 'unknown';
        if (!byBatch[key]) {
          byBatch[key] = { batchDate: key, claims: [], totalAmount: 0, razorpayPayoutId: payout.razorpayPayoutId };
        }
        byBatch[key].claims.push(payout);
        byBatch[key].totalAmount += payout.finalPayout || 0;
      }

      const batches = Object.values(byBatch).sort((a, b) =>
        b.batchDate.localeCompare(a.batchDate)
      );

      const totalLifetime = payouts.reduce((sum, p) => sum + (p.finalPayout || 0), 0);

      return res.json({
        success: true,
        batches,
        totalLifetime,
        payoutCount: payouts.length,
      });
    } catch (err) {
      next(err);
    }
  }
);

/**
 * GET /api/payouts/status/:payoutId
 * Check real-time status of a Razorpay payout.
 */
router.get('/status/:payoutId', async (req, res, next) => {
  try {
    const result = await getPayoutStatus(req.params.payoutId);
    return res.json({ success: true, payout: result });
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/payouts/admin/run-batch
 * Admin: manually trigger the weekly payout batch job.
 */
router.post('/admin/run-batch', adminMiddleware, async (req, res, next) => {
  try {
    // Run async — respond immediately
    runWeeklyPayout().catch((err) =>
      console.error('[Payouts] Manual batch run failed:', err.message)
    );
    return res.json({ success: true, message: 'Weekly payout batch job triggered.' });
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/payouts/demo/seed
 * Demo only: seed realistic paid claims for the authenticated worker so judges
 * can see the full payout flow without waiting for the Monday cron or real Razorpay.
 *
 * Creates 3 paid claims (heavy_rainfall, extreme_heat, severe_aqi) with
 * mock Razorpay payout IDs and returns them grouped as a payout batch.
 */
router.post('/demo/seed', async (req, res, next) => {
  try {
    const db = getDb();
    const workerId = req.user.uid;

    // Fetch worker to get their plan/weekly earnings
    const workerSnap = await db.collection('workers').doc(workerId).get();
    if (!workerSnap.exists) {
      return res.status(404).json({ success: false, error: 'Complete onboarding first.' });
    }
    const worker = workerSnap.data();

    // Determine base payout from worker's weekly earnings
    const weeklyEarnings = worker.weeklyEarnings || 3000;
    const planCoverage = { basic: 0.5, shield: 0.7, 'shield+': 0.9 };
    const planCaps = { basic: 400, shield: 800, 'shield+': 1500 };
    const plan = worker.activePlan || 'shield';
    const coverage = planCoverage[plan] || 0.7;
    const cap = planCaps[plan] || 800;

    const dailyEarnings = weeklyEarnings / 6;
    const clampPayout = (raw) => Math.min(Math.round(raw * coverage), cap);

    // 3 realistic disruption events from the past 2 weeks
    const now = new Date();
    const events = [
      {
        triggerType: 'heavy_rainfall',
        label: 'Heavy Rainfall (38mm/hr)',
        daysAgo: 12,
        lostHours: 5,
        finalPayout: clampPayout(dailyEarnings * 0.7),
      },
      {
        triggerType: 'extreme_heat',
        label: 'Extreme Heat (47°C)',
        daysAgo: 7,
        lostHours: 6,
        finalPayout: clampPayout(dailyEarnings * 0.85),
      },
      {
        triggerType: 'severe_aqi',
        label: 'Severe AQI (430)',
        daysAgo: 3,
        lostHours: 8,
        finalPayout: clampPayout(dailyEarnings),
      },
    ];

    const batchDate = new Date(now);
    batchDate.setDate(batchDate.getDate() - 1); // "paid yesterday"
    const batchDateStr = batchDate.toISOString().split('T')[0];
    const mockPayoutId = `mock_payout_demo_${Date.now()}`;

    const batch = db.batch();
    const createdClaims = [];

    for (const ev of events) {
      const triggeredAt = new Date(now);
      triggeredAt.setDate(triggeredAt.getDate() - ev.daysAgo);

      const claimData = {
        workerId,
        triggerType: ev.triggerType,
        triggerLabel: ev.label,
        zone: worker.zone || worker.pincode || 'demo-zone',
        pincode: worker.pincode || '400001',
        status: CLAIM_STATUS.PAID,
        finalPayout: ev.finalPayout,
        lostHours: ev.lostHours,
        weeklyEarnings,
        plan,
        fraudScore: 0.08, // clean demo worker
        fraudLabel: 'clean',
        razorpayPayoutId: mockPayoutId,
        weekBatchDate: batchDateStr,
        triggeredAt: triggeredAt.toISOString(),
        createdAt: triggeredAt.toISOString(),
        paidAt: new Date(batchDate).toISOString(),
        demo: true,
      };

      const claimRef = db.collection('claims').doc();
      batch.set(claimRef, claimData);
      createdClaims.push({ id: claimRef.id, ...claimData });
    }

    await batch.commit();

    const totalAmount = createdClaims.reduce((s, c) => s + c.finalPayout, 0);

    return res.json({
      success: true,
      message: `Demo payout seeded — ₹${totalAmount} across ${createdClaims.length} claims.`,
      batch: {
        batchDate: batchDateStr,
        razorpayPayoutId: mockPayoutId,
        totalAmount,
        claims: createdClaims,
      },
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
