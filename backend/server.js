'use strict';

require('dotenv').config();

const express = require('express');
const cors = require('cors');
const { initializeFirebase } = require('./config/firebase');
const errorHandler = require('./middleware/errorHandler');

// ─── Routes ───────────────────────────────────────────────────────────────────
const authRoutes = require('./routes/auth');
const workerRoutes = require('./routes/workers');
const policyRoutes = require('./routes/policies');
const premiumRoutes = require('./routes/premium');
const triggerRoutes = require('./routes/triggers');
const claimRoutes = require('./routes/claims');
const payoutRoutes = require('./routes/payouts');
const weatherRoutes = require('./routes/weather');
const uploadRoutes = require('./routes/upload');

// ─── Cron Jobs ────────────────────────────────────────────────────────────────
const { startTriggerMonitor } = require('./jobs/triggerMonitor');
const { startWeeklyPayout } = require('./jobs/weeklyPayout');

const app = express();
const PORT = process.env.PORT || 5000;

// ─── CORS ─────────────────────────────────────────────────────────────────────
const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',').map((o) => o.trim())
  : ['http://localhost:3000', 'http://localhost:19006', 'exp://localhost:19000'];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (mobile apps, Postman, curl)
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) return callback(null, true);
      callback(new Error(`CORS: Origin ${origin} not allowed.`));
    },
    credentials: true,
  })
);

// ─── Body Parsing ─────────────────────────────────────────────────────────────
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));

// ─── Health Check ─────────────────────────────────────────────────────────────
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'InsurX Backend',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    env: process.env.NODE_ENV || 'development',
  });
});

// ─── API Routes ───────────────────────────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/workers', workerRoutes);
app.use('/api/policies', policyRoutes);
app.use('/api/premium', premiumRoutes);
app.use('/api/triggers', triggerRoutes);
app.use('/api/claims', claimRoutes);
app.use('/api/payouts', payoutRoutes);
app.use('/api/weather', weatherRoutes);
app.use('/api/upload', uploadRoutes);

// ─── 404 Handler ─────────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ success: false, error: `Route ${req.method} ${req.path} not found.` });
});

// ─── Error Handler (must be last) ────────────────────────────────────────────
app.use(errorHandler);

// ─── Start Server ─────────────────────────────────────────────────────────────
async function start() {
  try {
    // Initialize Firebase Admin SDK
    initializeFirebase();

    // Start background cron jobs
    startTriggerMonitor();
    startWeeklyPayout();

    app.listen(PORT, () => {
      console.info(`\n🚀 InsurX Backend running on port ${PORT}`);
      console.info(`   Health: http://localhost:${PORT}/health`);
      console.info(`   API:    http://localhost:${PORT}/api`);
      console.info(`   Env:    ${process.env.NODE_ENV || 'development'}\n`);
    });
  } catch (err) {
    console.error('[Startup] Fatal error:', err.message);
    process.exit(1);
  }
}

start();

module.exports = app; // for testing
