/*
 * Carbon & Crimson IMS
 * File: src/controllers/user_controller.js
 * Version: 1.0.0
 * Purpose: User Management (CRUD) with RBAC Safety Locks.
 */

'use strict';

const bcrypt = require('bcryptjs');
const { getDb } = require('../config/db');
const { AppError } = require('../utils/app_error');
const { env } = require('../config/env');
const { ROLE_WEIGHTS } = require('../middleware/auth');

const BCRYPT_ROUNDS = 10;

/**
 * Check if a target user is a protected System Owner.
 */
function isProtected(email) {
  return env.SYSTEM_OWNER_EMAILS.includes(String(email || '').toLowerCase().trim());
}

/**
 * List users based on hierarchy.
 * Admins see Staff. Super Admins see all.
 */
async function listUsers(req, res, next) {
  try {
    const supabase = getDb();
    const reqWeight = req.user.roleWeight || 0;

    // Default: Minimum fields (for log filtering)
    let selectFields = 'id, full_name, role';
    
    // If Admin+ (weight 20+), they can see more sensitive details
    if (reqWeight >= ROLE_WEIGHTS.admin) {
      selectFields = 'id, email, full_name, role, is_active, created_at';
    }

    let query = supabase.from('users').select(selectFields);

    // Visibility Filter:
    // 1. Non-Super Admins (Staff/Admin) can see both Admins and Staff, but NOT Super Admins
    if (reqWeight < ROLE_WEIGHTS.super_admin) {
      query = query.in('role', ['admin', 'staff']);
    }
    // 2. Super Admins (30) see everyone (no filter)

    const { data: users, error } = await query.order('full_name', { ascending: true });
    
    if (error) throw error;

    // Mark protected users if email is available (Admin+)
    const mapped = users.map(u => ({
      ...u,
      is_protected: u.email ? isProtected(u.email) : false
    }));

    return res.status(200).json({ ok: true, data: mapped });
  } catch (e) {
    next(e);
  }
}

/**
 * Create a new user.
 */
async function createUser(req, res, next) {
  try {
    const { email, full_name, role, password } = req.body || {};

    if (!email || !full_name || !role || !password) {
      return next(new AppError('Missing required fields.', 400, 'VALIDATION_ERROR'));
    }

    // Hierarchy Check: Cannot create a role higher than or equal to your own
    // (Exception: Super Admin can create other Super Admins if needed, but here we'll restrict it to only creating roles <= current role)
    if (ROLE_WEIGHTS[role] > req.user.roleWeight) {
      return next(new AppError('Cannot create a user with a higher role than your own.', 403, 'FORBIDDEN'));
    }

    const supabase = getDb();
    
    // Check existing
    const { data: existing } = await supabase.from('users').select('id').eq('email', email.toLowerCase()).single();
    if (existing) return next(new AppError('User already exists.', 409, 'CONFLICT'));

    const password_hash = await bcrypt.hash(String(password), BCRYPT_ROUNDS);

    const { data: newUser, error } = await supabase.from('users').insert({
      email: email.toLowerCase(),
      full_name,
      role,
      password_hash,
      is_active: true
    }).select('id, email, full_name, role').single();

    if (error) throw error;

    return res.status(201).json({ ok: true, data: newUser });
  } catch (e) {
    next(e);
  }
}

/**
 * Deactivate/Activate a user (Safety Lock enforced).
 */
async function toggleStatus(req, res, next) {
  try {
    const { id } = req.params;
    const { is_active } = req.body;

    const supabase = getDb();
    
    // Fetch target
    const { data: target, error: fetchErr } = await supabase.from('users').select('email, role').eq('id', id).single();
    if (fetchErr || !target) return next(new AppError('User not found.', 404, 'NOT_FOUND'));

    // Safety Lock: Cannot deactivate a System Owner
    if (isProtected(target.email)) {
      return next(new AppError('Security Violation: Cannot modify a System Owner account.', 403, 'FORBIDDEN'));
    }

    // Hierarchy Check: Cannot modify someone with a strictly higher role
    if (ROLE_WEIGHTS[target.role] > req.user.roleWeight) {
       return next(new AppError('Insufficient permissions to modify this user.', 403, 'FORBIDDEN'));
    }

    const { error: updateErr } = await supabase.from('users').update({ is_active }).eq('id', id);
    if (updateErr) throw updateErr;

    return res.status(200).json({ ok: true });
  } catch (e) {
    next(e);
  }
}

/**
 * Delete a user (Hard Delete - Safety Lock enforced).
 */
async function deleteUser(req, res, next) {
  try {
    const { id } = req.params;
    const supabase = getDb();

    const { data: target, error: fetchErr } = await supabase.from('users').select('email, role').eq('id', id).single();
    if (fetchErr || !target) return next(new AppError('User not found.', 404, 'NOT_FOUND'));

    // Safety Lock
    if (isProtected(target.email)) {
      return next(new AppError('Security Violation: Cannot delete a System Owner account.', 403, 'FORBIDDEN'));
    }

    // Hierarchy Check
    if (ROLE_WEIGHTS[target.role] > req.user.roleWeight) {
       return next(new AppError('Insufficient permissions to delete this user.', 403, 'FORBIDDEN'));
    }

    const { error: deleteErr } = await supabase.from('users').delete().eq('id', id);
    if (deleteErr) throw deleteErr;

    return res.status(200).json({ ok: true });
  } catch (e) {
    next(e);
  }
}

/**
 * Update current user's profile (Name, Email, Password).
 */
async function updateProfile(req, res, next) {
  try {
    const { full_name, email, password } = req.body || {};
    const userId = req.user.id;
    const supabase = getDb();
    
    const updates = {};
    if (full_name) updates.full_name = full_name;
    if (email) updates.email = email.toLowerCase().trim();
    
    if (password) {
      updates.password_hash = await bcrypt.hash(String(password), BCRYPT_ROUNDS);
    }
    
    if (Object.keys(updates).length > 0) {
      const { error } = await supabase.from('users').update(updates).eq('id', userId);
      if (error) {
        if (error.code === '23505') { // Unique violation
          return next(new AppError('Email is already in use.', 409, 'CONFLICT'));
        }
        throw error;
      }
    }
    
    return res.status(200).json({ ok: true });
  } catch (e) {
    next(e);
  }
}

module.exports = { listUsers, createUser, toggleStatus, deleteUser, updateProfile };
