'use strict';

const express = require('express');
const { param, validationResult } = require('express-validator');
const { getDb } = require('../config/firebase');
const { getZoneWeatherData } = require('../services/weatherService');
const { pincodeToCoords } = require('../services/geocodingService');
const { TRIGGER_STATUS } = require('../utils/constants');

const router = express.Router();

/**
 * GET /api/weather/zone/:pincode
 * Return current weather + AQI + active disruption status for a pincode zone.
 * No auth required — workers need this on the home screen.
 */
router.get(
  '/zone/:pincode',
  [
    param('pincode')
      .matches(/^\d{6}$/)
      .withMessage('Pincode must be 6 digits'),
  ],
  async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    try {
      const { pincode } = req.params;
      const db = getDb();

      // Get zone coordinates
      let lat, lon, city;
      const zoneSnap = await db
        .collection('zones')
        .where('pincode', '==', pincode)
        .limit(1)
        .get();

      if (!zoneSnap.empty) {
        const zone = zoneSnap.docs[0].data();
        lat = zone.lat;
        lon = zone.lon;
        city = zone.city;
      } else {
        // Geocode on the fly
        try {
          const geoData = await pincodeToCoords(pincode);
          lat = geoData.lat;
          lon = geoData.lon;
          city = geoData.city;
        } catch (geoErr) {
          return res.status(400).json({
            success: false,
            error: `Cannot resolve coordinates for pincode ${pincode}.`,
          });
        }
      }

      // Fetch weather data
      const weatherData = await getZoneWeatherData(lat, lon);

      // Get active triggers for this zone
      const activeTriggersSnap = await db
        .collection('triggerEvents')
        .where('pincode', '==', pincode)
        .where('status', '==', TRIGGER_STATUS.ACTIVE)
        .get();

      const activeTriggers = activeTriggersSnap.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      return res.json({
        success: true,
        pincode,
        city,
        weather: weatherData,
        activeTriggers,
        hasActiveDisruption: activeTriggers.length > 0,
      });
    } catch (err) {
      next(err);
    }
  }
);

module.exports = router;
