/*
 * Carbon & Crimson IMS
 * File: src/config/env.js
 * Version: 2.0.0
 * Purpose: Environment configuration (SAFE DEFAULTS).
 */

'use strict';

require('dotenv').config();

const env = {

  NODE_ENV: process.env.NODE_ENV || 'development',

  PORT: Number(process.env.PORT || 8080),

  // MongoDB
  MONGO_URI:
    process.env.MONGO_URI ||
    'mongodb://localhost:27017/ims_db',

  // JWT
  JWT_SECRET:
    process.env.JWT_SECRET ||
    'CHANGE_THIS_SECRET',

  JWT_EXPIRES_IN:
    process.env.JWT_EXPIRES_IN ||
    '7d',

  // CORS
  CORS_ORIGIN:
    process.env.CORS_ORIGIN ||
    'http://localhost:5173',

  APP_PUBLIC_URL:
    process.env.APP_PUBLIC_URL ||
    'http://localhost:5173',

  // GEMINI AI
  GEMINI_API_KEY:
    process.env.GEMINI_API_KEY || '',

  GEMINI_MODEL: process.env.GEMINI_MODEL || '',

  // RBAC Security
  SYSTEM_OWNER_EMAILS: (process.env.SYSTEM_OWNER_EMAILS || '').split(',').map(e => e.trim().toLowerCase()).filter(Boolean),

  // 🔴 IMPORTANT FIX
  // bcrypt salt rounds
  BCRYPT_SALT_ROUNDS:
    Number(process.env.BCRYPT_SALT_ROUNDS || 10),

};

module.exports = { env };