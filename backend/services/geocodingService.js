'use strict';

const axios = require('axios');

const NOMINATIM_BASE = 'https://nominatim.openstreetmap.org';

async function pincodeToCoords(pincode) {
  try {
    const response = await axios.get(`${NOMINATIM_BASE}/search`, {
      params: {
        q: `${pincode}, India`,
        format: 'json',
        limit: 1,
        addressdetails: 1,
      },
      headers: { 'User-Agent': 'InsurX-App/1.0 (hackathon project)' },
      timeout: 8000,
    });

    const results = response.data;
    if (!results || results.length === 0) {
      throw new Error(`No results for pincode ${pincode}`);
    }

    const r = results[0];
    const addr = r.address || {};
    const city = addr.city || addr.town || addr.village || addr.county || 'Unknown';
    const state = addr.state || 'Unknown';

    return {
      lat: parseFloat(r.lat),
      lon: parseFloat(r.lon),
      city,
      state,
      pincode,
      formattedAddress: r.display_name,
    };
  } catch (err) {
    console.warn('[Geocoding] Nominatim failed, using fallback:', err.message);
    return fallbackPincodeLookup(pincode);
  }
}

function fallbackPincodeLookup(pincode) {
  const pin = String(pincode);
  const cityMap = [
    { prefixes: ['110'], city: 'Delhi', state: 'Delhi', lat: 28.6139, lon: 77.2090 },
    { prefixes: ['400'], city: 'Mumbai', state: 'Maharashtra', lat: 19.0760, lon: 72.8777 },
    { prefixes: ['560'], city: 'Bengaluru', state: 'Karnataka', lat: 12.9716, lon: 77.5946 },
    { prefixes: ['600'], city: 'Chennai', state: 'Tamil Nadu', lat: 13.0827, lon: 80.2707 },
    { prefixes: ['500'], city: 'Hyderabad', state: 'Telangana', lat: 17.3850, lon: 78.4867 },
    { prefixes: ['700'], city: 'Kolkata', state: 'West Bengal', lat: 22.5726, lon: 88.3639 },
    { prefixes: ['411'], city: 'Pune', state: 'Maharashtra', lat: 18.5204, lon: 73.8567 },
    { prefixes: ['380', '382', '390'], city: 'Ahmedabad', state: 'Gujarat', lat: 23.0225, lon: 72.5714 },
    { prefixes: ['302'], city: 'Jaipur', state: 'Rajasthan', lat: 26.9124, lon: 75.7873 },
    { prefixes: ['226'], city: 'Lucknow', state: 'Uttar Pradesh', lat: 26.8467, lon: 80.9462 },
    { prefixes: ['201', '202', '203'], city: 'Noida', state: 'Uttar Pradesh', lat: 28.5355, lon: 77.3910 },
    { prefixes: ['122'], city: 'Gurugram', state: 'Haryana', lat: 28.4595, lon: 77.0266 },
  ];

  for (const entry of cityMap) {
    if (entry.prefixes.some((p) => pin.startsWith(p))) {
      return {
        lat: entry.lat + (Math.random() * 0.02 - 0.01),
        lon: entry.lon + (Math.random() * 0.02 - 0.01),
        city: entry.city,
        state: entry.state,
        pincode,
        formattedAddress: `${pincode}, ${entry.city}, ${entry.state}, India`,
      };
    }
  }

  return {
    lat: 20.5937 + (Math.random() * 0.02 - 0.01),
    lon: 78.9629 + (Math.random() * 0.02 - 0.01),
    city: 'Unknown',
    state: 'Unknown',
    pincode,
    formattedAddress: `${pincode}, India`,
  };
}

module.exports = { pincodeToCoords };
