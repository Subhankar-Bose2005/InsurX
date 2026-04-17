'use strict';

const axios = require('axios');

const OWM_BASE = 'https://api.openweathermap.org/data/2.5';
const WAQI_BASE = 'https://api.waqi.info';

/**
 * Fetch current weather data from OpenWeatherMap for a lat/lon.
 * Returns normalized object with temperature (°C) and rainfall (mm/hr).
 */
async function getCurrentWeather(lat, lon) {
  const apiKey = process.env.OPENWEATHER_API_KEY;
  if (!apiKey) {
    console.warn('[Weather] OPENWEATHER_API_KEY not set. Returning mock data.');
    return getMockWeather();
  }

  try {
    const response = await axios.get(`${OWM_BASE}/weather`, {
      params: { lat, lon, appid: apiKey, units: 'metric' },
      timeout: 8000,
    });

    const data = response.data;
    const rainfall1h = data.rain ? (data.rain['1h'] || 0) : 0;

    return {
      temp: data.main.temp,
      feelsLike: data.main.feels_like,
      humidity: data.main.humidity,
      rainfall_mm_per_hr: rainfall1h,
      weatherMain: data.weather[0]?.main || '',
      weatherDescription: data.weather[0]?.description || '',
      windSpeed: data.wind?.speed || 0,
      city: data.name,
      timestamp: new Date().toISOString(),
    };
  } catch (err) {
    console.error('[Weather] OWM fetch failed:', err.message);
    throw new Error(`Weather fetch failed: ${err.message}`);
  }
}

/**
 * Fetch current AQI from WAQI API for a lat/lon.
 * Returns the AQI value (integer).
 */
async function getCurrentAQI(lat, lon) {
  const apiKey = process.env.WAQI_API_KEY;
  if (!apiKey) {
    console.warn('[Weather] WAQI_API_KEY not set. Returning mock AQI.');
    return { aqi: 85, dominantPollutant: 'pm25', stationName: 'Mock Station' };
  }

  try {
    const response = await axios.get(`${WAQI_BASE}/feed/geo:${lat};${lon}/`, {
      params: { token: apiKey },
      timeout: 8000,
    });

    const data = response.data;
    if (data.status !== 'ok') {
      throw new Error(`WAQI returned status: ${data.status}`);
    }

    return {
      aqi: data.data.aqi,
      dominantPollutant: data.data.dominantpol,
      stationName: data.data.city?.name || 'Unknown',
      timestamp: new Date().toISOString(),
    };
  } catch (err) {
    console.error('[Weather] WAQI fetch failed:', err.message);
    throw new Error(`AQI fetch failed: ${err.message}`);
  }
}

/**
 * Fetch comprehensive weather + AQI for a zone (by lat/lon).
 * Single aggregated call used by the trigger monitor and weather route.
 */
async function getZoneWeatherData(lat, lon) {
  const [weather, aqiData] = await Promise.allSettled([
    getCurrentWeather(lat, lon),
    getCurrentAQI(lat, lon),
  ]);

  const weatherResult = weather.status === 'fulfilled' ? weather.value : getMockWeather();
  const aqiResult = aqiData.status === 'fulfilled' ? aqiData.value : { aqi: 0 };

  if (weather.status === 'rejected') {
    console.error('[Weather] Weather fetch rejected:', weather.reason?.message);
  }
  if (aqiData.status === 'rejected') {
    console.error('[Weather] AQI fetch rejected:', aqiData.reason?.message);
  }

  return {
    ...weatherResult,
    aqi: aqiResult.aqi,
    aqiStation: aqiResult.stationName,
    dominantPollutant: aqiResult.dominantPollutant,
  };
}

function getMockWeather() {
  return {
    temp: 32,
    feelsLike: 35,
    humidity: 65,
    rainfall_mm_per_hr: 0,
    weatherMain: 'Clear',
    weatherDescription: 'clear sky',
    windSpeed: 10,
    city: 'Demo City',
    timestamp: new Date().toISOString(),
  };
}

module.exports = { getCurrentWeather, getCurrentAQI, getZoneWeatherData };
