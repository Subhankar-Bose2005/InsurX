'use strict';

const { getDb } = require('../config/firebase');
const { initiatePayout, createContact, createFundAccount } = require('./razorpayService');
const { CLAIM_STATUS } = require('../utils/constants');

/**
 * Process all approved claims for a single worker in a given week.
 * Aggregates claims → one consolidated Razorpay payout.
 *
 * Returns summary of what was processed.
 */
async function processWorkerPayout(workerId, claimIds, batchDate) {
  const db = getDb();

  // Fetch worker data
  const workerSnap = await db.collection('workers').doc(workerId).get();
  if (!workerSnap.exists) {
    throw new Error(`Worker ${workerId} not found`);
  }
  const worker = { uid: workerId, ...workerSnap.data() };

  // Fetch the approved claims
  const claims = [];
  for (const claimId of claimIds) {
    const snap = await db.collection('claims').doc(claimId).get();
    if (snap.exists && snap.data().status === CLAIM_STATUS.APPROVED) {
      claims.push({ id: claimId, ...snap.data() });
    }
  }

  if (claims.length === 0) {
    return { workerId, claimsProcessed: 0, totalAmount: 0, skipped: true };
  }

  const totalAmount = claims.reduce((sum, c) => sum + (c.finalPayout || 0), 0);

  // Ensure worker has Razorpay contact + fund account
  let { razorpayContactId, razorpayFundAccountId } = worker;

  if (!razorpayContactId) {
    const contactResult = await createContact(worker);
    razorpayContactId = contactResult.contactId;
    await db.collection('workers').doc(workerId).update({ razorpayContactId });
  }

  if (!razorpayFundAccountId && worker.upiId) {
    const faResult = await createFundAccount(razorpayContactId, worker.upiId);
    razorpayFundAccountId = faResult.fundAccountId;
    await db.collection('workers').doc(workerId).update({ razorpayFundAccountId });
  }

  if (!razorpayFundAccountId) {
    throw new Error(`Worker ${workerId} has no UPI ID configured. Cannot process payout.`);
  }

  // Initiate consolidated payout
  const payoutResult = await initiatePayout(razorpayFundAccountId, totalAmount, {
    workerId,
    batchDate,
    claimCount: claims.length,
  });

  const razorpayPayoutId = payoutResult.payoutId;

  // Mark all claims as paid in a batch
  const batch = db.batch();
  for (const claim of claims) {
    const claimRef = db.collection('claims').doc(claim.id);
    batch.update(claimRef, {
      status: CLAIM_STATUS.PAID,
      razorpayPayoutId,
      weekBatchDate: batchDate,
      paidAt: new Date().toISOString(),
    });
  }
  await batch.commit();

  return {
    workerId,
    worker: { name: worker.name, phone: worker.phone, upiId: worker.upiId },
    claimsProcessed: claims.length,
    totalAmount,
    razorpayPayoutId,
    payoutStatus: payoutResult.status,
  };
}

module.exports = { processWorkerPayout };
