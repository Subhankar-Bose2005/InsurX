'use strict';

const express = require('express');
const { body, param, validationResult } = require('express-validator');
const { getDb } = require('../config/firebase');
const { authMiddleware } = require('../middleware/auth');
const { PLANS, POLICY_STATUS, TRIGGER_STATUS } = require('../utils/constants');

const router = express.Router();

router.use(authMiddleware);

/**
 * POST /api/policies
 * Create a new policy for the authenticated worker.
 *
 * Anti-gaming rule: block if there's an active disruption in the worker's zone.
 */
router.post(
  '/',
  [
    body('plan')
      .notEmpty()
      .isIn(Object.keys(PLANS))
      .withMessage(`Plan must be one of: ${Object.keys(PLANS).join(', ')}`),
    body('razorpayPaymentId').optional().trim(),
  ],
  async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    try {
      const db = getDb();
      const uid = req.user.uid;

      // Fetch worker profile
      const workerSnap = await db.collection('workers').doc(uid).get();
      if (!workerSnap.exists) {
        return res.status(404).json({ success: false, error: 'Worker profile not found. Complete onboarding first.' });
      }
      const worker = workerSnap.data();

      if (!worker.onboardingComplete) {
        return res.status(400).json({ success: false, error: 'Please complete onboarding before purchasing a policy.' });
      }

      // Anti-gaming: check if there's an active disruption in the worker's zone
      if (worker.pincode) {
        const activeDisruptionSnap = await db
          .collection('triggerEvents')
          .where('pincode', '==', worker.pincode)
          .where('status', '==', TRIGGER_STATUS.ACTIVE)
          .limit(1)
          .get();

        if (!activeDisruptionSnap.empty) {
          return res.status(409).json({
            success: false,
            error: 'Policy purchase is blocked during an active disruption in your zone. Please try again once conditions normalize.',
            code: 'ACTIVE_DISRUPTION',
          });
        }
      }

      // Check if worker already has an active policy
      const existingPoliciesSnap = await db
        .collection('policies')
        .where('workerId', '==', uid)
        .where('status', '==', POLICY_STATUS.ACTIVE)
        .limit(1)
        .get();

      if (!existingPoliciesSnap.empty) {
        return res.status(409).json({
          success: false,
          error: 'You already have an active policy. Upgrade or downgrade via PATCH /api/policies/:id.',
          code: 'POLICY_EXISTS',
          existingPolicyId: existingPoliciesSnap.docs[0].id,
        });
      }

      const { plan, razorpayPaymentId } = req.body;
      const planConfig = PLANS[plan];

      const startDate = new Date();
      const endDate = new Date();
      endDate.setDate(endDate.getDate() + 7); // 1-week policy

      const policyData = {
        workerId: uid,
        workerName: worker.name,
        pincode: worker.pincode,
        zone: worker.zone,
        plan: planConfig.id,
        planName: planConfig.name,
        premium: planConfig.weeklyPremium,
        coveragePercent: planConfig.coveragePercent,
        maxPayout: planConfig.maxPayoutPerWeek,
        status: POLICY_STATUS.ACTIVE,
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        razorpayPaymentId: razorpayPaymentId || null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const policyRef = await db.collection('policies').add(policyData);

      return res.status(201).json({
        success: true,
        policy: { id: policyRef.id, ...policyData },
      });
    } catch (err) {
      next(err);
    }
  }
);

/**
 * GET /api/policies/:workerId
 * Get all policies for a worker. Workers can only access their own.
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
      const policiesSnap = await db
        .collection('policies')
        .where('workerId', '==', workerId)
        .orderBy('createdAt', 'desc')
        .get();

      const policies = policiesSnap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

      // Auto-expire policies past their end date
      const now = new Date();
      const batch = db.batch();
      let hasExpired = false;

      for (const policy of policies) {
        if (
          policy.status === POLICY_STATUS.ACTIVE &&
          new Date(policy.endDate) < now
        ) {
          batch.update(db.collection('policies').doc(policy.id), {
            status: POLICY_STATUS.EXPIRED,
            updatedAt: now.toISOString(),
          });
          policy.status = POLICY_STATUS.EXPIRED;
          hasExpired = true;
        }
      }

      if (hasExpired) await batch.commit();

      return res.json({ success: true, policies });
    } catch (err) {
      next(err);
    }
  }
);

/**
 * PATCH /api/policies/:id
 * Upgrade or downgrade plan, or cancel policy.
 */
router.patch(
  '/:id',
  [
    param('id').notEmpty(),
    body('plan')
      .optional()
      .isIn(Object.keys(PLANS))
      .withMessage(`Plan must be one of: ${Object.keys(PLANS).join(', ')}`),
    body('action').optional().isIn(['cancel']).withMessage('action must be "cancel"'),
  ],
  async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    try {
      const db = getDb();
      const { id } = req.params;
      const { plan, action } = req.body;

      const policySnap = await db.collection('policies').doc(id).get();
      if (!policySnap.exists) {
        return res.status(404).json({ success: false, error: 'Policy not found.' });
      }

      const policy = policySnap.data();

      if (policy.workerId !== req.user.uid && !req.user.admin) {
        return res.status(403).json({ success: false, error: 'Access denied.' });
      }

      if (policy.status !== POLICY_STATUS.ACTIVE) {
        return res.status(400).json({ success: false, error: `Cannot modify a ${policy.status} policy.` });
      }

      const updates = { updatedAt: new Date().toISOString() };

      if (action === 'cancel') {
        updates.status = POLICY_STATUS.CANCELLED;
        updates.cancelledAt = new Date().toISOString();
      } else if (plan) {
        if (plan === policy.plan) {
          return res.status(400).json({ success: false, error: 'You are already on this plan.' });
        }
        const planConfig = PLANS[plan];
        updates.plan = planConfig.id;
        updates.planName = planConfig.name;
        updates.premium = planConfig.weeklyPremium;
        updates.coveragePercent = planConfig.coveragePercent;
        updates.maxPayout = planConfig.maxPayoutPerWeek;
      } else {
        return res.status(400).json({ success: false, error: 'Provide "plan" to change tier or "action": "cancel" to cancel.' });
      }

      await db.collection('policies').doc(id).update(updates);

      return res.json({ success: true, policy: { id, ...policy, ...updates } });
    } catch (err) {
      next(err);
    }
  }
);

module.exports = router;
