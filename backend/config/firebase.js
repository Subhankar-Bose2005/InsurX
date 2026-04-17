'use strict';

const admin = require('firebase-admin');

let db;
let auth;
let storage;
let isInitialized = false;

function initializeFirebase() {
  if (isInitialized) return { db, auth, storage };

  let credential;
  let storageBucket;

  // ✅ RENDER ENV VARIABLES (MAIN FIX)
  if (
    process.env.FIREBASE_PROJECT_ID &&
    process.env.FIREBASE_CLIENT_EMAIL &&
    process.env.FIREBASE_PRIVATE_KEY
  ) {
    credential = admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
    });
  }

  // ✅ LOCAL DEVELOPMENT FALLBACK
  else if (process.env.NODE_ENV === 'development') {
    console.warn('[Firebase] Using default credentials (dev only)');
    credential = admin.credential.applicationDefault();
  }

  // ❌ THROW ERROR IF NOTHING PROVIDED
  else {
    throw new Error('Firebase credentials not configured properly.');
  }

  storageBucket =
    process.env.FIREBASE_STORAGE_BUCKET ||
    process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET ||
    undefined;

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
  } catch (err) {
    console.warn('[Firebase] Storage init skipped:', err.message);
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
    throw new Error('Firebase Storage not initialized.');
  }
  return storage;
}

module.exports = { initializeFirebase, getDb, getAuth, getStorage };
