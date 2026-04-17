'use strict';

const cron = require('node-cron');
const { getDb } = require('../config/firebase');
const { processWorkerPayout } = require('../services/payoutService');
const { CLAIM_STATUS } = require('../utils/constants');

/**
 * Run the weekly batch payout job.
 *
 * Logic:
 * 1. Find all claims with status = 'approved' from the past 7 days.
 * 2. Group by workerId.
 * 3. For each worker, consolidate into one Razorpay payout.
 * 4. Mark all processed claims as 'paid' with razorpayPayoutId.
 * 5. Store a payoutBatch document summarising the run.
 */
async function runWeeklyPayout() {
  console.info('[WeeklyPayout] Starting weekly batch —', new Date().toISOString());

  const db = getDb();
  const batchDate = new Date().toISOString().split('T')[0]; // YYYY-MM-DD

  // Check if batch already ran today
  const existingBatch = await db
    .collection('payoutBatches')
    .where('batchDate', '==', batchDate)
    .limit(1)
    .get();

  if (!existingBatch.empty) {
    console.info(`[WeeklyPayout] Batch for ${batchDate} already processed. Skipping.`);
    return;
  }

  // Fetch approved claims from the past 7 days
  const since = new Date();
  since.setDate(since.getDate() - 7);
  const sinceISO = since.toISOString();

  const claimsSnap = await db
    .collection('claims')
    .where('status', '==', CLAIM_STATUS.APPROVED)
    .where('createdAt', '>=', sinceISO)
    .get();

  if (claimsSnap.empty) {
    console.info('[WeeklyPayout] No approved claims to process.');
    // Still write an empty batch record
    await db.collection('payoutBatches').add({
      batchDate,
      totalWorkers: 0,
      totalAmount: 0,
      status: 'completed',
      claims: [],
      createdAt: new Date().toISOString(),
    });
    return;
  }

  // Group claims by workerId
  const claimsByWorker = {};
  for (const doc of claimsSnap.docs) {
    const claim = doc.data();
    const wid = claim.workerId;
    if (!claimsByWorker[wid]) claimsByWorker[wid] = [];
    claimsByWorker[wid].push(doc.id);
  }

  const results = [];
  let totalAmount = 0;
  let successCount = 0;
  let failCount = 0;

  // Process each worker's payout
  for (const [workerId, claimIds] of Object.entries(claimsByWorker)) {
    try {
      const result = await processWorkerPayout(workerId, claimIds, batchDate);
      results.push({ workerId, ...result, success: true });
      totalAmount += result.totalAmount || 0;
      successCount++;
    } catch (err) {
      console.error(`[WeeklyPayout] Failed payout for worker ${workerId}:`, err.message);
      results.push({ workerId, success: false, error: err.message });
      failCount++;
    }
  }

  // Store batch summary
  const batchDoc = {
    batchDate,
    totalWorkers: Object.keys(claimsByWorker).length,
    successfulPayouts: successCount,
    failedPayouts: failCount,
    totalAmount,
    status: failCount === 0 ? 'completed' : 'partial',
    claimCount: claimsSnap.size,
    results,
    createdAt: new Date().toISOString(),
  };

  await db.collection('payoutBatches').add(batchDoc);

  console.info(
    `[WeeklyPayout] Batch complete — Workers: ${successCount}/${Object.keys(claimsByWorker).length}, Total: ₹${totalAmount}`
  );
}

/**
 * Register the cron job.
 * Runs every Monday at 06:00 AM IST: "0 6 * * 1"
 */
function startWeeklyPayout() {
  console.info('[WeeklyPayout] Scheduling Monday 6AM IST payout job (0 6 * * 1)');

  cron.schedule('0 6 * * 1', runWeeklyPayout, {
    timezone: 'Asia/Kolkata',
  });
}

module.exports = { startWeeklyPayout, runWeeklyPayout };
