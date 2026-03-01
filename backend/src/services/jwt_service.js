/*
 * Carbon & Crimson IMS
 * File: src/services/jwt_service.js
 * Version: 1.0.0
 * Purpose: JWT token issuance and verification helpers.
 */

'use strict';

const jwt = require('jsonwebtoken');
const { env } = require('../config/env');

function signToken(userId) {
  return jwt.sign(
    { sub: userId },
    env.JWT_SECRET,
    { expiresIn: env.JWT_EXPIRES_IN },
  );
}

module.exports = { signToken };
