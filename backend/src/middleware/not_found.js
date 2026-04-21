/*
 * MotoMart IMS
 * File: src/middleware/not_found.js
 * Version: 1.0.0
 * Purpose: 404 handler.
 */

'use strict';

function notFoundHandler(_req, res) {
  res.status(404).json({
    ok: false,
    error: { code: 'NOT_FOUND', message: 'Route not found.' },
  });
}

module.exports = { notFoundHandler };
