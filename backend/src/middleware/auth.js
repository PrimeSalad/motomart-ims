/*
 * Carbon & Crimson IMS
 * File: src/middleware/auth.js
 * Version: 2.1.0
 * Purpose: JWT auth + Hierarchical RBAC + System Owner identification.
 */

'use strict';

const jwt = require('jsonwebtoken');
const { env } = require('../config/env');
const { AppError } = require('../utils/app_error');
const { getDb } = require('../config/db');

// Role Weighting
const ROLE_WEIGHTS = {
  staff: 10,
  admin: 20,
  super_admin: 30
};

async function requireAuth(req, _res, next) {
  const authHeader = req.headers.authorization || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;

  if (!token) {
    return next(new AppError('Missing authorization token.', 401, 'UNAUTHORIZED'));
  }

  try {
    const payload = jwt.verify(token, env.JWT_SECRET);
    const supabase = getDb();
    
    const { data: user, error } = await supabase
      .from('users')
      .select('id, email, role, full_name, is_active')
      .eq('id', payload.sub)
      .single();

    if (error || !user) {
      return next(new AppError('Invalid token user.', 401, 'UNAUTHORIZED'));
    }

    if (user.is_active === false) {
      return next(new AppError('Your account has been deactivated. Please contact an administrator.', 403, 'DEACTIVATED'));
    }

    // Determine if the user is a protected System Owner
    const email = String(user.email || '').toLowerCase().trim();
    const isSystemOwner = env.SYSTEM_OWNER_EMAILS.includes(email);

    req.user = {
      id: user.id,
      email: user.email,
      role: user.role,
      name: user.full_name,
      isSystemOwner,
      roleWeight: ROLE_WEIGHTS[user.role] || 0
    };

    return next();
  } catch (_e) {
    return next(new AppError('Invalid or expired token.', 401, 'UNAUTHORIZED'));
  }
}

/**
 * Enforce a minimum role weight for an endpoint.
 * @param {string} minRole 'staff', 'admin', or 'super_admin'
 */
function requireRole(minRole) {
  const minWeight = ROLE_WEIGHTS[minRole] || 0;
  
  return (req, _res, next) => {
    const userWeight = req.user?.roleWeight || 0;
    
    if (userWeight < minWeight) {
      return next(new AppError('Insufficient role permissions.', 403, 'FORBIDDEN'));
    }
    
    return next();
  };
}

module.exports = { requireAuth, requireRole, ROLE_WEIGHTS };
