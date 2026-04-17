'use strict';

const express = require('express');
const { body, validationResult } = require('express-validator');
const { getAuth, getDb } = require('../config/firebase');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

// ✅ Firebase OTP verification ONLY
router.post(
  '/verify-otp',
  [body('idToken').notEmpty().withMessage('idToken is required')],
  async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    try {
      const { idToken } = req.body;

      const auth = getAuth();
      const db = getDb();

      // ✅ verify Firebase token
      const decodedToken = await auth.verifyIdToken(idToken);
      const uid = decodedToken.uid;
      const phone = decodedToken.phone_number || null;

      const workerRef = db.collection('workers').doc(uid);
      const workerSnap = await workerRef.get();

      let worker;
      let isNewUser = false;

      if (workerSnap.exists) {
        worker = { uid, ...workerSnap.data() };
      } else {
        const newWorker = {
          uid,
          phone,
          onboardingComplete: false,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        await workerRef.set(newWorker);
        worker = newWorker;
        isNewUser = true;
      }

      return res.json({
        success: true,
        worker,
        isNewUser,
      });

    } catch (err) {
      console.error('[VERIFY OTP ERROR]', err);
      next(err);
    }
  }
);

// ✅ Firebase handles OTP sending
router.post('/send-otp', (req, res) => {
  return res.json({ success: true });
});

// ✅ Get logged-in user
router.get('/me', authMiddleware, async (req, res, next) => {
  try {
    const db = getDb();

    const workerSnap = await db.collection('workers').doc(req.user.uid).get();

    if (!workerSnap.exists) {
      return res.status(404).json({
        success: false,
        error: 'Worker profile not found.',
      });
    }

    return res.json({
      success: true,
      worker: { uid: req.user.uid, ...workerSnap.data() },
    });

  } catch (err) {
    next(err);
  }
});

module.exports = router;