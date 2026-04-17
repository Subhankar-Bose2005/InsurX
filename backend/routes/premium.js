'use strict';

const express = require('express');
const { body, validationResult } = require('express-validator');
const { authMiddleware } = require('../middleware/auth');
const { calculatePremium } = require('../services/premiumService');
const { pincodeToCoords } = require('../services/geocodingService');
const { PLANS } = require('../utils/constants');

const router = express.Router();

/**
 * POST /api/premium/calculate
 * Calculate premium quote for a zone/plan combination.
 * Public-ish endpoint — no auth required so users can see quotes before signup.
 * But we apply rate limiting in production.
 */
router.post(
  '/calculate',
  [
    body('pincode')
      .notEmpty()
      .matches(/^\d{6}$/)
      .withMessage('Pincode must be 6 digits'),
    body('plan')
      .notEmpty()
      .isIn(Object.keys(PLANS))
      .withMessage(`Plan must be one of: ${Object.keys(PLANS).join(', ')}`),
  ],
  async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    try {
      const { pincode, plan } = req.body;

      // Geocode pincode to get lat/lon
      let lat, lon;
      try {
        const geoData = await pincodeToCoords(pincode);
        lat = geoData.lat;
        lon = geoData.lon;
      } catch (geoErr) {
        console.warn('[Premium] Geocoding failed:', geoErr.message);
        return res.status(400).json({ success: false, error: `Could not resolve pincode ${pincode}.` });
      }

      const result = await calculatePremium({ pincode, lat, lon, plan });

      return res.json({ success: true, quote: result });
    } catch (err) {
      next(err);
    }
  }
);

/**
 * GET /api/premium/plans
 * Return all plan configurations (prices, coverage, caps).
 */
router.get('/plans', (req, res) => {
  return res.json({
    success: true,
    plans: Object.values(PLANS),
  });
});

/**
 * POST /api/premium/backtest
 * "What would InsurX have paid you?" — replay historical trigger events
 * against a pincode + plan + earnings to show personalised ROI before signup.
 * No auth required — this is a pre-signup discovery feature.
 */
router.post(
  '/backtest',
  [
    body('pincode').notEmpty().matches(/^\d{6}$/).withMessage('Pincode must be 6 digits'),
    body('plan').notEmpty().isIn(Object.keys(PLANS)).withMessage(`Plan must be one of: ${Object.keys(PLANS).join(', ')}`),
    body('weeklyEarnings').notEmpty().isFloat({ min: 500, max: 50000 }).withMessage('Weekly earnings must be between 500 and 50000'),
    body('weeks').optional().isInt({ min: 1, max: 52 }).withMessage('Weeks must be between 1 and 52'),
  ],
  async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    try {
      const { getDb } = require('../config/firebase');
      const { calculatePayout } = require('../services/premiumService');
      const { TRIGGER_STATUS } = require('../utils/constants');

      const { pincode, plan, weeklyEarnings, weeks = 12 } = req.body;
      const planConfig = PLANS[plan];
      const db = getDb();

      // Look back `weeks` weeks from today
      const since = new Date();
      since.setDate(since.getDate() - weeks * 7);

      const triggersSnap = await db
        .collection('triggerEvents')
        .where('pincode', '==', pincode)
        .where('status', '==', TRIGGER_STATUS.RESOLVED)
        .get();

      const pastTriggers = triggersSnap.docs
        .map((d) => ({ id: d.id, ...d.data() }))
        .filter((t) => t.startTime && t.startTime >= since.toISOString())
        .sort((a, b) => a.startTime.localeCompare(b.startTime));

      // Simulate payout for each historical trigger
      const simulatedPayouts = pastTriggers.map((trigger) => {
        const disruptedHours = (() => {
          if (trigger.startTime && trigger.endTime) {
            const diffMs = new Date(trigger.endTime) - new Date(trigger.startTime);
            return Math.min(Math.max(Math.round(diffMs / 3_600_000), 1), 8);
          }
          return 3; // default assumption
        })();

        const calc = calculatePayout({
          weeklyEarnings,
          workingHoursPerWeek: 45,
          coveragePercent: planConfig.coveragePercent,
          maxPayoutPerWeek: planConfig.maxPayoutPerWeek,
          disruptedHours,
          disruptionStartTime: trigger.startTime,
        });

        return {
          date: trigger.startTime.slice(0, 10),
          triggerType: trigger.type,
          triggerLabel: trigger.triggerLabel || trigger.type,
          disruptedHours,
          payout: calc.finalPayout,
          shiftLabel: calc.shiftLabel,
        };
      });

      const totalPayout    = simulatedPayouts.reduce((s, p) => s + p.payout, 0);
      const totalPremiums  = planConfig.weeklyPremium * weeks;
      const netBenefit     = totalPayout - totalPremiums;
      const roi            = totalPremiums > 0 ? ((totalPayout / totalPremiums) * 100).toFixed(1) : '0';

      // If no real historical triggers, generate illustrative demo data
      const events = simulatedPayouts.length > 0 ? simulatedPayouts : [
        { date: 'Demo week 3',  triggerType: 'heavy_rainfall', triggerLabel: 'Heavy Rainfall', disruptedHours: 4, payout: Math.round(planConfig.maxPayoutPerWeek * 0.6), shiftLabel: 'Dinner Peak' },
        { date: 'Demo week 7',  triggerType: 'extreme_heat',   triggerLabel: 'Extreme Heat',   disruptedHours: 3, payout: Math.round(planConfig.maxPayoutPerWeek * 0.45), shiftLabel: 'Lunch Peak' },
        { date: 'Demo week 10', triggerType: 'severe_aqi',     triggerLabel: 'Severe AQI',     disruptedHours: 5, payout: Math.round(planConfig.maxPayoutPerWeek * 0.7), shiftLabel: 'Normal Hours' },
      ];
      const demoTotal    = events.reduce((s, p) => s + p.payout, 0);
      const demoNet      = demoTotal - totalPremiums;
      const demoRoi      = ((demoTotal / totalPremiums) * 100).toFixed(1);

      return res.json({
        success: true,
        backtest: {
          pincode,
          plan: planConfig.name,
          weeklyPremium: planConfig.weeklyPremium,
          weeks,
          weeklyEarnings,
          events:           simulatedPayouts.length > 0 ? simulatedPayouts : events,
          totalPayout:      simulatedPayouts.length > 0 ? totalPayout : demoTotal,
          totalPremiumsPaid: totalPremiums,
          netBenefit:       simulatedPayouts.length > 0 ? netBenefit : demoNet,
          roi:              simulatedPayouts.length > 0 ? roi : demoRoi,
          isDemo:           simulatedPayouts.length === 0,
          message:          simulatedPayouts.length > 0
            ? `Based on ${pastTriggers.length} real trigger event(s) in pincode ${pincode} over the past ${weeks} weeks.`
            : `No historical triggers found for ${pincode}. Showing illustrative scenario based on plan limits.`,
        },
      });
    } catch (err) {
      next(err);
    }
  }
);

module.exports = router;
