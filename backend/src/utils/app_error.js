/*
 * Carbon & Crimson IMS
 * File: src/utils/app_error.js
 * Version: 1.0.0
 * Purpose: Typed application errors for consistent HTTP responses.
 */

'use strict';

class AppError extends Error {
  /**
   * @param {string} message
   * @param {number} statusCode
   * @param {string} code - stable machine-readable code
   */
  constructor(message, statusCode = 500, code = 'INTERNAL_ERROR') {
    super(message);
    this.name = 'AppError';
    this.statusCode = statusCode;
    this.code = code;
  }
}

module.exports = { AppError };
