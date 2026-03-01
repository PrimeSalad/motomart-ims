/*
 * Carbon & Crimson IMS
 * File: src/middleware/global_error_handler.js
 * Version: 1.0.0
 * Purpose: Global error handler (single response shape).
 */

'use strict';

const { AppError } = require('../utils/app_error');
const { logger } = require('../utils/logger');

function globalErrorHandler(err, _req, res, _next) {
  const safeError = err instanceof AppError
    ? err
    : new AppError('Something broke in the machine.', 500, 'INTERNAL_ERROR');

  // Avoid leaking stack traces in production
  if (process.env.NODE_ENV !== 'production') {
    logger.error(err.stack || err.message || String(err));
  }

  res.status(safeError.statusCode).json({
    ok: false,
    error: {
      code: safeError.code,
      message: safeError.message,
    },
  });
}

module.exports = { globalErrorHandler };
