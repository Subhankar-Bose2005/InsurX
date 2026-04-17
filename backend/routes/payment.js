'use strict';

const crypto = require('crypto');
const express = require('express');
const { body, validationResult } = require('express-validator');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

// ─── POST /api/payment/create-order ──────────────────────────────────────────

router.post(
  '/create-order',
  authMiddleware,
  [
    body('amount').isInt({ min: 1 }).withMessage('amount must be a positive integer (paise)'),
    body('plan').notEmpty().withMessage('plan is required'),
  ],
  async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { amount, plan } = req.body;
    const workerId = req.user.uid;

    // Demo mode when Razorpay keys are not configured
    if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
      console.warn('[Payment] Razorpay keys not set — returning demo order.');
      return res.json({
        success: true,
        orderId: `demo_order_${Date.now()}`,
        amount,
        currency: 'INR',
        keyId: 'rzp_test_demo',
        demo: true,
      });
    }

    try {
      const Razorpay = require('razorpay');
      const razorpay = new Razorpay({
        key_id: process.env.RAZORPAY_KEY_ID,
        key_secret: process.env.RAZORPAY_KEY_SECRET,
      });

      const order = await razorpay.orders.create({
        amount, // in paise
        currency: 'INR',
        receipt: `insurx_${plan}_${Date.now()}`,
        notes: { plan, workerId },
      });

      return res.json({
        success: true,
        orderId: order.id,
        amount: order.amount,
        currency: order.currency,
        keyId: process.env.RAZORPAY_KEY_ID,
      });
    } catch (err) {
      next(err);
    }
  }
);

// ─── POST /api/payment/verify ─────────────────────────────────────────────────

router.post(
  '/verify',
  authMiddleware,
  [
    body('razorpayOrderId').notEmpty().withMessage('razorpayOrderId is required'),
    body('razorpayPaymentId').notEmpty().withMessage('razorpayPaymentId is required'),
    body('razorpaySignature').notEmpty().withMessage('razorpaySignature is required'),
  ],
  async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { razorpayOrderId, razorpayPaymentId, razorpaySignature } = req.body;

    // Demo mode
    if (!process.env.RAZORPAY_KEY_SECRET || razorpayOrderId.startsWith('demo_order')) {
      return res.json({ success: true, verified: true, demo: true });
    }

    try {
      const expectedSignature = crypto
        .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
        .update(`${razorpayOrderId}|${razorpayPaymentId}`)
        .digest('hex');

      if (expectedSignature !== razorpaySignature) {
        return res.status(400).json({
          success: false,
          error: 'Payment verification failed: signature mismatch.',
        });
      }

      return res.json({ success: true, verified: true });
    } catch (err) {
      next(err);
    }
  }
);

module.exports = router;
