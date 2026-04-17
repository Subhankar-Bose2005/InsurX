'use strict';

/**
 * Central error-handling middleware.
 * Must be registered LAST in the Express app.
 */
function errorHandler(err, req, res, next) { // eslint-disable-line no-unused-vars
  console.error('[Error]', err.stack || err.message);

  // express-validator ValidationError
  if (err.type === 'validation') {
    return res.status(400).json({ success: false, error: err.message, details: err.details });
  }

  // Firestore / Firebase errors (code can be string like 'firestore/...' or numeric)
  if (err.code && typeof err.code === 'string' && err.code.startsWith('firestore/')) {
    return res.status(503).json({ success: false, error: 'Database error. Please try again.' });
  }
  if (err.code && typeof err.code === 'string' && err.code.startsWith('auth/')) {
    return res.status(401).json({ success: false, error: err.message || 'Authentication error.' });
  }

  // Razorpay API errors
  if (err.statusCode && err.error) {
    return res.status(err.statusCode).json({ success: false, error: err.error.description || 'Payment service error.' });
  }

  const statusCode = err.statusCode || err.status || 500;
  const message = err.message || 'Internal server error.';

  res.status(statusCode).json({ success: false, error: message });
}

module.exports = errorHandler;
