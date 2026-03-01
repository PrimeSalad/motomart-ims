/*
 * Carbon & Crimson IMS
 * File: src/utils/logger.js
 * Version: 1.0.0
 * Purpose: Minimal logger wrapper (stdout friendly for Render/Docker).
 */

'use strict';

const logger = {
  info: (msg) => console.log(`[INFO] ${msg}`),
  warn: (msg) => console.warn(`[WARN] ${msg}`),
  error: (msg) => console.error(`[ERROR] ${msg}`),
};

module.exports = { logger };
