'use strict';

const { getAuth } = require('../config/firebase');

/**
 * Firebase token verification middleware.
 * Expects: Authorization: Bearer <firebase-id-token>
 */
async function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      error: 'Unauthorized: Missing or malformed Authorization header.',
    });
  }

  const idToken = authHeader.split('Bearer ')[1].trim();

  if (!idToken) {
    return res.status(401).json({ success: false, error: 'Unauthorized: Empty token.' });
  }

  try {
    const auth = getAuth();
    const decodedToken = await auth.verifyIdToken(idToken);
    req.user = decodedToken; // { uid, phone_number, ... }
    next();
  } catch (err) {
    console.error('[Auth] Token verification failed:', err.message);
    return res.status(401).json({
      success: false,
      error: 'Unauthorized: Invalid or expired token.',
    });
  }
}

/**
 * Admin-only middleware — checks custom claim or UID whitelist.
 * For demo purposes we check a custom claim `admin: true`.
 */
async function adminMiddleware(req, res, next) {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, error: 'Not authenticated.' });
    }
    if (!req.user.admin) {
      return res.status(403).json({ success: false, error: 'Forbidden: Admin access required.' });
    }
    next();
  } catch (err) {
    next(err);
  }
}

module.exports = { authMiddleware, adminMiddleware };
