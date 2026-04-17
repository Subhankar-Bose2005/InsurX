'use strict';

const express = require('express');
const { param, body, validationResult } = require('express-validator');
const { getDb } = require('../config/firebase');
const { authMiddleware, adminMiddleware } = require('../middleware/auth');
const { CLAIM_STATUS } = require('../utils/constants');

const router = express.Router();

router.use(authMiddleware);

/**
 * GET /api/claims/admin/queue
 * Admin: get all flagged claims pending review.
 * IMPORTANT: This must be registered before /:workerId to avoid route collision.
 */
router.get('/admin/queue', adminMiddleware, async (req, res, next) => {
  try {
    const db = getDb();
    const snap = await db
      .collection('claims')
      .where('status', '==', CLAIM_STATUS.FLAGGED)
      .limit(100)
      .get();

    const claims = snap.docs
      .map((doc) => ({ id: doc.id, ...doc.data() }))
      .sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''));
    return res.json({ success: true, claims, count: claims.length });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/claims/:workerId
 * Get all claims for a worker (most recent first).
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
        .limit(200)
        .get();

      const claims = snap.docs
        .map((doc) => ({ id: doc.id, ...doc.data() }))
        .sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''));

      // Compute total protected earnings
      const totalProtected = claims
        .filter((c) => [CLAIM_STATUS.APPROVED, CLAIM_STATUS.PAID].includes(c.status))
        .reduce((sum, c) => sum + (c.finalPayout || 0), 0);

      const lastPaidClaim = claims.find((c) => c.status === CLAIM_STATUS.PAID);

      return res.json({
        success: true,
        claims,
        count: claims.length,
        summary: {
          totalProtected,
          lastPayout: lastPaidClaim
            ? { amount: lastPaidClaim.finalPayout, date: lastPaidClaim.paidAt }
            : null,
        },
      });
    } catch (err) {
      next(err);
    }
  }
);

/**
 * PATCH /api/claims/:id/review
 * Admin: approve or reject a flagged claim.
 */
router.patch(
  '/:id/review',
  adminMiddleware,
  [
    param('id').notEmpty(),
    body('action')
      .notEmpty()
      .isIn(['approve', 'reject'])
      .withMessage('action must be "approve" or "reject"'),
    body('note').optional().trim().isLength({ max: 500 }),
  ],
  async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    try {
      const db = getDb();
      const { id } = req.params;
      const { action, note } = req.body;

      const claimSnap = await db.collection('claims').doc(id).get();
      if (!claimSnap.exists) {
        return res.status(404).json({ success: false, error: 'Claim not found.' });
      }

      const claim = claimSnap.data();
      if (claim.status !== CLAIM_STATUS.FLAGGED) {
        return res.status(400).json({
          success: false,
          error: `Claim is already ${claim.status}. Only flagged claims can be reviewed.`,
        });
      }

      const newStatus = action === 'approve' ? CLAIM_STATUS.APPROVED : CLAIM_STATUS.REJECTED;

      await db.collection('claims').doc(id).update({
        status: newStatus,
        reviewedBy: req.user.uid,
        reviewNote: note || null,
        reviewedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });

      return res.json({
        success: true,
        message: `Claim ${action === 'approve' ? 'approved' : 'rejected'} successfully.`,
        claimId: id,
        newStatus,
      });
    } catch (err) {
      next(err);
    }
  }
);

module.exports = router;
