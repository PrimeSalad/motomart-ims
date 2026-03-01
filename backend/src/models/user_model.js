/*
 * Carbon & Crimson IMS
 * File: src/models/user_model.js
 * Version: 2.0.0
 * Purpose: User model utilities.
 *
 * FIXES:
 * - bcrypt crash fixed
 * - always valid salt rounds
 * - safe password hashing
 */

'use strict';

const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
const { env } = require('../config/env');

const UserSchema = new mongoose.Schema({

  email: {
    type: String,
    required: true,
    unique: true
  },

  full_name: {
    type: String,
    required: true
  },

  role: {
    type: String,
    default: 'staff'
  },

  password_hash: {
    type: String,
    required: true
  }

}, {
  timestamps: true
});

UserSchema.statics.hashPassword =
async function (plainPassword) {

  const password =
    String(plainPassword || '').trim();

  if (!password) {
    throw new Error('Password missing');
  }

  const roundsRaw =
    Number(env.BCRYPT_SALT_ROUNDS);

  const rounds =
    Number.isFinite(roundsRaw)
      ? roundsRaw
      : 10;

  return bcrypt.hash(password, rounds);
};

UserSchema.statics.verifyPassword =
async function (password, hash) {

  return bcrypt.compare(password, hash);
};

const User =
mongoose.model('User', UserSchema);

module.exports = {
  User
};