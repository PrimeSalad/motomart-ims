/*
 * MotoMart IMS
 * File: src/seed/seed_users.js
 * Version: 2.0.0
 * Purpose: Seed default users safely (Supabase).
 */

'use strict';

const { env } = require('../config/env');
const { getDb } = require('../config/db');
const { logger } = require('../utils/logger');
const bcrypt = require('bcryptjs');

const DEFAULT_ADMIN_EMAIL = 'admin@ims.local';
const DEFAULT_STAFF_EMAIL = 'staff@ims.local';

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
  const supabase = getDb();
  const { data: existing } = await supabase.from('users').select('id').eq('email', email).single();
  if (existing) return;

  const password_hash = await bcrypt.hash(password, 10);

  const { error } = await supabase.from('users').insert({
    email,
    full_name,
    role,
    password_hash,
  });

  if (error) {
    logger.error(`Failed to seed user ${email}: ${error.message}`);
  } else {
    logger.info(`Seeded user: ${email} (${role})`);
  }
}

async function seedDefaultUsers() {
  const adminEmail = safeEmail(env.SEED_ADMIN_EMAIL, DEFAULT_ADMIN_EMAIL);
  const staffEmail = safeEmail(env.SEED_STAFF_EMAIL, DEFAULT_STAFF_EMAIL);

  const adminPassword = safePassword(env.SEED_ADMIN_PASSWORD, DEFAULT_ADMIN_PASSWORD);
  const staffPassword = safePassword(env.SEED_STAFF_PASSWORD, DEFAULT_STAFF_PASSWORD);

  // System Owner
  if (env.SYSTEM_OWNER_EMAILS && env.SYSTEM_OWNER_EMAILS.length > 0) {
    await ensureUser({
      email: env.SYSTEM_OWNER_EMAILS[0],
      full_name: 'System Owner',
      role: 'super_admin',
      password: adminPassword,
    });
  }

  // Super Admin
  await ensureUser({
    email: 'superadmin@ims.local',
    full_name: 'Super Admin',
    role: 'super_admin',
    password: adminPassword,
  });

  // Regular Admin
  await ensureUser({
    email: adminEmail,
    full_name: 'System Admin',
    role: 'admin',
    password: adminPassword,
  });

  // Staff
  await ensureUser({
    email: staffEmail,
    full_name: 'Staff User',
    role: 'staff',
    password: staffPassword,
  });
}

module.exports = { seedDefaultUsers };