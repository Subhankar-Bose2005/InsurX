'use strict';

const admin = require('firebase-admin');
const path = require('path');

let db;
let auth;
let storage;
let isInitialized = false;

function initializeFirebase() {
  if (isInitialized) return { db, auth, storage };

  let credential;
  let storageBucket;

  if (process.env.FIREBASE_SERVICE_ACCOUNT_JSON) {
    try {
      const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON);
      credential = admin.credential.cert(serviceAccount);
    } catch (err) {
      throw new Error(`Failed to parse FIREBASE_SERVICE_ACCOUNT_JSON: ${err.message}`);
    }
  } else if (process.env.FIREBASE_SERVICE_ACCOUNT_PATH) {
    const absolutePath = path.resolve(process.env.FIREBASE_SERVICE_ACCOUNT_PATH);
    try {
      const serviceAccount = require(absolutePath);
      credential = admin.credential.cert(serviceAccount);
    } catch (err) {
      throw new Error(`Failed to load Firebase service account from ${absolutePath}: ${err.message}`);
    }
  } else if (process.env.NODE_ENV === 'development' || process.env.FIREBASE_EMULATOR_HOST) {
    console.warn('[Firebase] No service account configured. Using application default credentials.');
    credential = admin.credential.applicationDefault();
  } else {
    throw new Error('Firebase credentials not configured. Set FIREBASE_SERVICE_ACCOUNT_JSON or FIREBASE_SERVICE_ACCOUNT_PATH.');
  }

  storageBucket = process.env.FIREBASE_STORAGE_BUCKET || process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET || undefined;

  if (!admin.apps.length) {
    admin.initializeApp({
      credential,
      ...(storageBucket && { storageBucket }),
    });
  }

db = admin.firestore();
db.settings({ ignoreUndefinedProperties: true });
  auth = admin.auth();

  try {
    const { getStorage: adminGetStorage } = require('firebase-admin/storage');
    storage = adminGetStorage();
    console.log('[Firebase] Storage initialized successfully.');
  } catch (storageErr) {
    console.warn('[Firebase] Storage initialization skipped:', storageErr.message);
    storage = null;
  }

  isInitialized = true;
  console.log('[Firebase] Admin SDK initialized successfully.');
  return { db, auth, storage };
}

function getDb() {
  if (!db) initializeFirebase();
  return db;
}

function getAuth() {
  if (!auth) initializeFirebase();
  return auth;
}

function getStorage() {
  if (!isInitialized) initializeFirebase();
  if (!storage) {
    throw new Error('Firebase Storage not initialized. Set FIREBASE_STORAGE_BUCKET in your environment.');
  }
  return storage;
}

module.exports = { initializeFirebase, getDb, getAuth, getStorage };