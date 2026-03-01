/*
 * Carbon & Crimson IMS
 * File: src/middleware/auth.js
 * Version: 1.0.0
 * Purpose: JWT auth + RBAC.
 */

'use strict';

const jwt = require('jsonwebtoken');
const { env } = require('../config/env');
const { AppError } = require('../utils/app_error');
const { User } = require('../models/user_model');

async function requireAuth(req, _res, next) {
  const authHeader = req.headers.authorization || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;

  if (!token) {
    return next(new AppError('Missing authorization token.', 401, 'UNAUTHORIZED'));
  }

  try {
    const payload = jwt.verify(token, env.JWT_SECRET);
    const user = await User.findById(payload.sub).lean();
    if (!user) {
      return next(new AppError('Invalid token user.', 401, 'UNAUTHORIZED'));
    }

    req.user = {
      id: String(user._id),
      email: user.email,
      role: user.role,
      name: user.name,
    };

    return next();
  } catch (_e) {
    return next(new AppError('Invalid or expired token.', 401, 'UNAUTHORIZED'));
  }
}

function requireRole(allowedRoles) {
  return (req, _res, next) => {
    const role = req.user?.role;
    if (!role || !allowedRoles.includes(role)) {
      return next(new AppError('Insufficient role permissions.', 403, 'FORBIDDEN'));
    }
    return next();
  };
}

module.exports = { requireAuth, requireRole };
