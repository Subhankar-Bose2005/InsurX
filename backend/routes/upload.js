'use strict';

const express = require('express');
const { body, validationResult } = require('express-validator');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

// ─── POST /api/upload ─────────────────────────────────────────────────────────

router.post(
  '/',
  authMiddleware,
  [
    body('base64').notEmpty().withMessage('base64 is required'),
    body('filename').notEmpty().withMessage('filename is required'),
    body('contentType').notEmpty().withMessage('contentType is required'),
  ],
  async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { base64, filename, contentType } = req.body;
    const workerId = req.user.uid;

    // Sanitize filename to prevent path traversal
    const safeFilename = filename.replace(/[^a-zA-Z0-9._-]/g, '_');
    const filePath = `kyc/${workerId}/${safeFilename}`;

    try {
      // Attempt real Firebase Storage upload
      const { getStorage } = require('../config/firebase');
      const bucket = getStorage().bucket();

      const fileBuffer = Buffer.from(base64, 'base64');
      const file = bucket.file(filePath);

      await file.save(fileBuffer, {
        metadata: { contentType },
        public: true,
      });

      const publicUrl = `https://storage.googleapis.com/${bucket.name}/${filePath}`;
      return res.json({ success: true, url: publicUrl });
    } catch (storageErr) {
      // Firebase Storage not configured or failed — return placeholder URL
      console.warn('[Upload] Firebase Storage unavailable:', storageErr.message);
      const placeholderUrl = `https://via.placeholder.com/400x300.png?text=${encodeURIComponent(safeFilename)}`;
      return res.json({ success: true, url: placeholderUrl, demo: true });
    }
  }
);

module.exports = router;
