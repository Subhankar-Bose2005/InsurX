'use strict';

const express = require('express');
const { body, param, validationResult } = require('express-validator');
const { getDb } = require('../config/firebase');
const { authMiddleware } = require('../middleware/auth');
const { pincodeToCoords } = require('../services/geocodingService');
const { PLATFORMS } = require('../utils/constants');

const router = express.Router();

// All worker routes require authentication
router.use(authMiddleware);

/**
 * GET /api/workers
 * Return the authenticated worker's profile.
 */
router.get('/', async (req, res, next) => {
  try {
    const db = getDb();
    const workerSnap = await db.collection('workers').doc(req.user.uid).get();

    if (!workerSnap.exists) {
      return res.status(404).json({ success: false, error: 'Worker profile not found.' });
    }

    return res.json({ success: true, worker: { uid: req.user.uid, ...workerSnap.data() } });
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/workers
 * Create or fully update worker profile (used during onboarding).
 */
router.post(
  '/',
  [
    body('name').trim().notEmpty().withMessage('Name is required').isLength({ max: 100 }),
    body('pincode')
      .notEmpty()
      .withMessage('Pincode is required')
      .matches(/^\d{6}$/)
      .withMessage('Pincode must be 6 digits'),
    body('platform')
      .notEmpty()
      .withMessage('Platform is required')
      .isIn(PLATFORMS)
      .withMessage(`Platform must be one of: ${PLATFORMS.join(', ')}`),
    body('weeklyEarnings')
      .isFloat({ min: 100, max: 100000 })
      .withMessage('Weekly earnings must be between ₹100 and ₹1,00,000'),
    body('workingHours')
      .isFloat({ min: 1, max: 84 })
      .withMessage('Working hours must be between 1 and 84 per week'),
    body('upiId').optional().trim().isLength({ max: 100 }),
  ],
  async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    try {
      const db = getDb();
      const uid = req.user.uid;

      const {
        name, pincode, platform, weeklyEarnings, workingHours, upiId,
        // Fraud-detection signals from KYC
        partnerId, aadhaarLast4, primaryShift, avgOrdersPerWeek,
        experienceYears, dob, gender, bankAccount, ifscCode, documentType,
        selfieUrl, documentFrontUrl, documentBackUrl,
        registrationTimestamp, deviceId,
        // GPS from device (may override geocoded coords)
        gpsLat, gpsLon,
      } = req.body;

      // Geocode the pincode to get lat/lon + city
      let geoData = {};
      try {
        geoData = await pincodeToCoords(pincode);
      } catch (geoErr) {
        console.warn('[Workers] Geocoding failed, continuing without coords:', geoErr.message);
      }

      // Ensure zone document exists
      const resolvedLat = geoData.lat || gpsLat || null;
      const resolvedLon = geoData.lon || gpsLon || null;
      if (resolvedLat && resolvedLon) {
        const zoneRef = db.collection('zones').doc(pincode);
        const zoneSnap = await zoneRef.get();
        if (!zoneSnap.exists) {
          await zoneRef.set({
            pincode,
            city: geoData.city || 'Unknown',
            state: geoData.state || 'Unknown',
            lat: resolvedLat,
            lon: resolvedLon,
            ifiScore: 0.5,
            activeDisruption: false,
            createdAt: new Date().toISOString(),
          });
        }
      }

      const workerData = {
        uid,
        name,
        phone: req.user.phone_number || null,
        pincode,
        zone: geoData.city || null,
        state: geoData.state || null,
        lat: resolvedLat,
        lon: resolvedLon,
        platform,
        weeklyEarnings: parseFloat(weeklyEarnings),
        workingHours: parseFloat(workingHours),
        upiId: upiId || null,
        onboardingComplete: true,
        updatedAt: new Date().toISOString(),
        // ── KYC & fraud-detection fields ──────────────────────────────────────
        ...(partnerId         && { partnerId }),
        ...(aadhaarLast4      && { aadhaarLast4 }),
        ...(primaryShift      && { primaryShift }),
        ...(avgOrdersPerWeek  && { avgOrdersPerWeek: parseInt(avgOrdersPerWeek) }),
        ...(experienceYears   && { experienceYears }),
        ...(dob               && { dob }),
        ...(gender            && { gender }),
        ...(bankAccount       && { bankAccount }),
        ...(ifscCode          && { ifscCode }),
        ...(documentType      && { documentType }),
        ...(selfieUrl         && { selfieUrl }),
        ...(documentFrontUrl  && { documentFrontUrl }),
        ...(documentBackUrl   && { documentBackUrl }),
        ...(registrationTimestamp && { registrationTimestamp }),
        ...(deviceId          && { deviceId }),
        ...(gpsLat != null    && { gpsLat: parseFloat(gpsLat) }),
        ...(gpsLon != null    && { gpsLon: parseFloat(gpsLon) }),
      };

      await db.collection('workers').doc(uid).set(workerData, { merge: true });

      return res.status(201).json({ success: true, worker: workerData });
    } catch (err) {
      next(err);
    }
  }
);

/**
 * GET /api/workers/:id
 * Get a specific worker by ID (self only unless admin).
 */
router.get(
  '/:id',
  [param('id').notEmpty()],
  async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    try {
      const { id } = req.params;

      // Workers can only fetch their own profile
      if (id !== req.user.uid && !req.user.admin) {
        return res.status(403).json({ success: false, error: 'Access denied.' });
      }

      const db = getDb();
      const workerSnap = await db.collection('workers').doc(id).get();

      if (!workerSnap.exists) {
        return res.status(404).json({ success: false, error: 'Worker not found.' });
      }

      return res.json({ success: true, worker: { uid: id, ...workerSnap.data() } });
    } catch (err) {
      next(err);
    }
  }
);

/**
 * PATCH /api/workers/:id
 * Partial update of worker profile.
 */
router.patch(
  '/:id',
  [
    param('id').notEmpty(),
    body('name').optional().trim().notEmpty().isLength({ max: 100 }),
    body('pincode').optional().matches(/^\d{6}$/).withMessage('Pincode must be 6 digits'),
    body('platform').optional().isIn(PLATFORMS),
    body('weeklyEarnings').optional().isFloat({ min: 100, max: 100000 }),
    body('workingHours').optional().isFloat({ min: 1, max: 84 }),
    body('upiId').optional().trim().isLength({ max: 100 }),
  ],
  async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    try {
      const { id } = req.params;

      if (id !== req.user.uid && !req.user.admin) {
        return res.status(403).json({ success: false, error: 'Access denied.' });
      }

      const db = getDb();
      const allowedFields = ['name', 'platform', 'weeklyEarnings', 'workingHours', 'upiId'];
      const updates = {};

      for (const field of allowedFields) {
        if (req.body[field] !== undefined) {
          updates[field] = req.body[field];
        }
      }

      // Handle pincode change — re-geocode
      if (req.body.pincode) {
        updates.pincode = req.body.pincode;
        try {
          const geoData = await pincodeToCoords(req.body.pincode);
          updates.zone = geoData.city;
          updates.state = geoData.state;
          updates.lat = geoData.lat;
          updates.lon = geoData.lon;
        } catch (geoErr) {
          console.warn('[Workers] Geocoding failed on update:', geoErr.message);
        }
      }

      updates.updatedAt = new Date().toISOString();

      await db.collection('workers').doc(id).update(updates);

      const updatedSnap = await db.collection('workers').doc(id).get();
      return res.json({ success: true, worker: { uid: id, ...updatedSnap.data() } });
    } catch (err) {
      next(err);
    }
  }
);

/**
 * POST /api/workers/:id/gps
 * Store a GPS waypoint for fraud detection (feeds LSTM model).
 * Keeps last 50 points per worker; older points are pruned.
 */
router.post(
  '/:id/gps',
  [
    param('id').notEmpty(),
    body('lat').isFloat({ min: -90, max: 90 }).withMessage('lat must be a valid latitude'),
    body('lon').isFloat({ min: -180, max: 180 }).withMessage('lon must be a valid longitude'),
    body('timestamp').isInt({ min: 0 }).withMessage('timestamp must be a Unix epoch integer'),
  ],
  async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    try {
      const { id } = req.params;

      if (id !== req.user.uid && !req.user.admin) {
        return res.status(403).json({ success: false, error: 'Access denied.' });
      }

      const db = getDb();
      const { lat, lon, accuracy, speed, altitude, timestamp } = req.body;

      const waypointRef = db
        .collection('workers').doc(id)
        .collection('gpsWaypoints');

      await waypointRef.add({
        lat: parseFloat(lat),
        lon: parseFloat(lon),
        accuracy: accuracy ? parseFloat(accuracy) : null,
        speed: speed != null ? parseFloat(speed) : 0,
        altitude: altitude ? parseFloat(altitude) : null,
        timestamp: parseInt(timestamp),
        recordedAt: new Date().toISOString(),
      });

      // Prune: keep only the 50 most recent waypoints
      const allSnap = await waypointRef.orderBy('timestamp', 'asc').get();
      if (allSnap.size > 50) {
        const toDelete = allSnap.docs.slice(0, allSnap.size - 50);
        const batch = db.batch();
        toDelete.forEach((doc) => batch.delete(doc.ref));
        await batch.commit();
      }

      return res.json({ success: true });
    } catch (err) {
      next(err);
    }
  }
);

/**
 * GET /api/workers/:id/gps
 * Fetch last N GPS waypoints for a worker (used internally by fraud engine).
 */
router.get('/:id/gps', async (req, res, next) => {
  try {
    const { id } = req.params;

    if (id !== req.user.uid && !req.user.admin) {
      return res.status(403).json({ success: false, error: 'Access denied.' });
    }

    const db = getDb();
    const limit = Math.min(parseInt(req.query.limit) || 9, 50);

    const snap = await db
      .collection('workers').doc(id)
      .collection('gpsWaypoints')
      .orderBy('timestamp', 'desc')
      .limit(limit)
      .get();

    const waypoints = snap.docs
      .map((doc) => doc.data())
      .reverse(); // oldest → newest for LSTM sequence

    return res.json({ success: true, waypoints, count: waypoints.length });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
