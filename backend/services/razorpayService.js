'use strict';

const Razorpay = require('razorpay');

let razorpayInstance = null;

function getRazorpay() {
  if (razorpayInstance) return razorpayInstance;

  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;

  if (!keyId || !keySecret) {
    console.warn('[Razorpay] Credentials not set. Payout calls will be mocked.');
    return null;
  }

  razorpayInstance = new Razorpay({ key_id: keyId, key_secret: keySecret });
  return razorpayInstance;
}

/**
 * Create a Razorpay Contact for a worker.
 * https://razorpay.com/docs/api/route/contacts/create
 */
async function createContact(worker) {
  const rzp = getRazorpay();
  if (!rzp) return mockResponse('contact', `mock_contact_${worker.uid}`);

  try {
    const contact = await rzp.contacts.create({
      name: worker.name,
      contact: worker.phone,
      type: 'employee',
      reference_id: worker.uid,
      notes: {
        platform: worker.platform,
        pincode: worker.pincode,
      },
    });
    return { success: true, contactId: contact.id, data: contact };
  } catch (err) {
    console.error('[Razorpay] createContact failed:', err.error || err.message);
    throw new Error(`Razorpay createContact failed: ${err.error?.description || err.message}`);
  }
}

/**
 * Create a Fund Account (UPI VPA) linked to a contact.
 * https://razorpay.com/docs/api/route/fund-accounts/create
 */
async function createFundAccount(contactId, upiId) {
  const rzp = getRazorpay();
  if (!rzp) return mockResponse('fund_account', `mock_fa_${contactId}`);

  try {
    const fundAccount = await rzp.fundAccount.create({
      contact_id: contactId,
      account_type: 'vpa',
      vpa: { address: upiId },
    });
    return { success: true, fundAccountId: fundAccount.id, data: fundAccount };
  } catch (err) {
    console.error('[Razorpay] createFundAccount failed:', err.error || err.message);
    throw new Error(`Razorpay createFundAccount failed: ${err.error?.description || err.message}`);
  }
}

/**
 * Initiate a payout to a fund account.
 * Amount must be in PAISE (1 INR = 100 paise).
 * https://razorpay.com/docs/api/route/payouts/create
 */
async function initiatePayout(fundAccountId, amountInRupees, notes = {}) {
  const rzp = getRazorpay();
  const amountInPaise = Math.round(amountInRupees * 100);

  if (!rzp) {
    return mockResponse('payout', `mock_payout_${Date.now()}`, { amount: amountInPaise });
  }

  try {
    const payout = await rzp.payouts.create({
      account_number: process.env.RAZORPAY_ACCOUNT_NUMBER,
      fund_account_id: fundAccountId,
      amount: amountInPaise,
      currency: 'INR',
      mode: 'UPI',
      purpose: 'payout',
      queue_if_low_balance: true,
      reference_id: `insurx_${Date.now()}`,
      narration: 'InsurX Parametric Insurance Payout',
      notes,
    });

    return {
      success: true,
      payoutId: payout.id,
      status: payout.status,
      amountInPaise: payout.amount,
      amountInRupees: payout.amount / 100,
      utr: payout.utr || null,
      data: payout,
    };
  } catch (err) {
    console.error('[Razorpay] initiatePayout failed:', err.error || err.message);
    throw new Error(`Razorpay initiatePayout failed: ${err.error?.description || err.message}`);
  }
}

/**
 * Get payout status by payout ID.
 * https://razorpay.com/docs/api/route/payouts/fetch-by-id
 */
async function getPayoutStatus(payoutId) {
  const rzp = getRazorpay();

  if (!rzp || payoutId.startsWith('mock_')) {
    return {
      success: true,
      payoutId,
      status: 'processed',
      source: 'mock',
    };
  }

  try {
    const payout = await rzp.payouts.fetch(payoutId);
    return {
      success: true,
      payoutId: payout.id,
      status: payout.status,
      amountInPaise: payout.amount,
      amountInRupees: payout.amount / 100,
      utr: payout.utr || null,
      data: payout,
    };
  } catch (err) {
    console.error('[Razorpay] getPayoutStatus failed:', err.error || err.message);
    throw new Error(`Razorpay getPayoutStatus failed: ${err.error?.description || err.message}`);
  }
}

function mockResponse(type, id, extra = {}) {
  console.info(`[Razorpay] Mock ${type} created: ${id}`);
  return {
    success: true,
    [`${type}Id`]: id,
    status: type === 'payout' ? 'processed' : 'active',
    source: 'mock',
    ...extra,
  };
}

module.exports = { createContact, createFundAccount, initiatePayout, getPayoutStatus };
