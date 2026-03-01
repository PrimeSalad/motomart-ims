/*
 * Carbon & Crimson IMS
 * File: src/seed/seed_users.js
 * Version: 1.1.0
 * Purpose: Seed default users safely (no crash if env missing).
 */

'use strict';

const { env } = require('../config/env');
const { User } = require('../models/user_model');
const { logger } = require('../utils/logger');

const DEFAULT_ADMIN_EMAIL = 'admin@ims.local';
const DEFAULT_STAFF_EMAIL = 'staff@ims.local';

// Safe defaults (dev only)
const DEFAULT_ADMIN_PASSWORD = 'Admin12345!';
const DEFAULT_STAFF_PASSWORD = 'Staff12345!';

function safeEmail(value, fallback) {
  const v = String(value || '').trim();
  return v ? v : fallback;
}

function safePassword(value, fallback) {
  const v = String(value || '').trim();
  return v ? v : fallback;
}

async function ensureUser({ email, full_name, role, password }) {
  const existing = await User.findOne({ email });
  if (existing) return;

  const password_hash = await User.hashPassword(password);

  await User.create({
    email,
    full_name,
    role,
    password_hash,
  });

  logger.info(`Seeded user: ${email} (${role})`);
}

async function seedDefaultUsers() {
  // Use env if present, else fallback
  const adminEmail = safeEmail(env.SEED_ADMIN_EMAIL, DEFAULT_ADMIN_EMAIL);
  const staffEmail = safeEmail(env.SEED_STAFF_EMAIL, DEFAULT_STAFF_EMAIL);

  const adminPassword = safePassword(env.SEED_ADMIN_PASSWORD, DEFAULT_ADMIN_PASSWORD);
  const staffPassword = safePassword(env.SEED_STAFF_PASSWORD, DEFAULT_STAFF_PASSWORD);

  // IMPORTANT: full_name should never be empty
  await ensureUser({
    email: adminEmail,
    full_name: 'System Admin',
    role: 'admin',
    password: adminPassword,
  });

  await ensureUser({
    email: staffEmail,
    full_name: 'Staff User',
    role: 'staff',
    password: staffPassword,
  });
}

module.exports = { seedDefaultUsers };