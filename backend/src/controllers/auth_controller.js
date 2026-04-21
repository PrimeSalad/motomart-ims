/*
 * Carbon & Crimson IMS
 * File: src/controllers/auth_controller.js
 * Version: 2.0.0
 * Purpose: Auth endpoints (JWT) using Supabase PostgreSQL.
 */

'use strict';

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { AppError } = require('../utils/app_error');
const { getDb } = require('../config/db');
const { signToken } = require('../services/jwt_service');
const { sendMail } = require('../services/mailer_service');
const { env } = require('../config/env');
const { ROLE_WEIGHTS } = require('../middleware/auth');

function safeLowerEmail(email) {
  return String(email || '').toLowerCase().trim();
}

function validatePassword(password) {
  if (!password || password.length < 8) {
    throw new AppError('Password must be at least 8 characters long.', 400, 'VALIDATION_ERROR');
  }
  if (!/[A-Z]/.test(password)) {
    throw new AppError('Password must contain at least one uppercase letter.', 400, 'VALIDATION_ERROR');
  }
  if (!/[a-z]/.test(password)) {
    throw new AppError('Password must contain at least one lowercase letter.', 400, 'VALIDATION_ERROR');
  }
  if (!/[0-9]/.test(password)) {
    throw new AppError('Password must contain at least one number.', 400, 'VALIDATION_ERROR');
  }
  return true;
}

async function login(req, res, next) {
  try {
    const { email, password } = req.body || {};

    if (!email || !password) {
      return next(new AppError('Email and password are required.', 400, 'VALIDATION_ERROR'));
    }

    const supabase = getDb();
    const { data: user, error } = await supabase
      .from('users')
      .select('id, email, full_name, role, password_hash, is_active')
      .eq('email', safeLowerEmail(email))
      .single();

    if (error || !user) {
      return next(new AppError('Invalid credentials.', 401, 'UNAUTHORIZED'));
    }

    if (user.is_active === false) {
      return next(new AppError('Your account has been deactivated.', 403, 'DEACTIVATED'));
    }

    const ok = await bcrypt.compare(String(password), user.password_hash);
    if (!ok) {
      return next(new AppError('Invalid credentials.', 401, 'UNAUTHORIZED'));
    }

    const token = signToken(user.id);
    const userEmail = String(user.email || '').toLowerCase().trim();
    const isSystemOwner = env.SYSTEM_OWNER_EMAILS.includes(userEmail);

    return res.status(200).json({
      ok: true,
      data: {
        token,
        user: {
          id: user.id,
          email: user.email,
          name: user.full_name,
          role: user.role,
          isSystemOwner,
          roleWeight: ROLE_WEIGHTS[user.role] || 0
        },
      },
    });
  } catch (e) {
    console.error('[auth_controller] login failed:', e);
    return next(new AppError('Server error.', 500, 'SERVER_ERROR'));
  }
}

async function changePassword(req, res, next) {
  try {
    const { current_password, new_password } = req.body || {};

    if (!current_password || !new_password) {
      return next(new AppError('Current and new passwords required.', 400, 'VALIDATION_ERROR'));
    }

    validatePassword(new_password);

    const supabase = getDb();
    const { data: user, error } = await supabase
      .from('users')
      .select('password_hash, email, full_name')
      .eq('id', req.user.id)
      .single();

    if (error || !user) return next(new AppError('User not found.', 404, 'NOT_FOUND'));

    const ok = await bcrypt.compare(String(current_password), user.password_hash);
    if (!ok) return next(new AppError('Current password incorrect.', 401, 'UNAUTHORIZED'));

    const hash = await bcrypt.hash(String(new_password), env.BCRYPT_SALT_ROUNDS);
    
    await supabase.from('users').update({ password_hash: hash }).eq('id', req.user.id);

    try {
      await sendMail({
        to: user.email,
        subject: 'Password Changed',
        text: `Hello ${user.full_name},\nYour password was changed successfully.`,
      });
    } catch (e) {}

    return res.status(200).json({ ok: true });
  } catch (e) {
    console.error('[auth_controller] changePassword failed:', e);
    return next(new AppError('Server error.', 500, 'SERVER_ERROR'));
  }
}

async function forgotPassword(req, res, next) {
  try {
    const { email } = req.body || {};
    if (!email) return next(new AppError('Email is required.', 400, 'VALIDATION_ERROR'));

    const supabase = getDb();
    const { data: user } = await supabase
      .from('users')
      .select('id, email, full_name')
      .eq('email', safeLowerEmail(email))
      .single();

    if (!user) return res.status(200).json({ ok: true });

    // Stateless JWT for reset token
    const token = jwt.sign({ sub: user.id, reset: true }, env.JWT_SECRET, { expiresIn: '30m' });
    const resetUrl = `${env.APP_PUBLIC_URL}/reset-password?token=${encodeURIComponent(token)}`;

    await sendMail({
      to: user.email,
      subject: 'Reset Password',
      text: `Click to reset: ${resetUrl}`,
      html: `<p><a href="${resetUrl}">Reset Password</a></p>`,
    });

    return res.status(200).json({ ok: true });
  } catch (e) {
    console.error('[auth_controller] forgotPassword failed:', e);
    return next(new AppError('Server error.', 500, 'SERVER_ERROR'));
  }
}

async function resetPassword(req, res, next) {
  try {
    const { token, new_password } = req.body || {};
    if (!token || !new_password) return next(new AppError('Token and password required.', 400, 'VALIDATION_ERROR'));

    validatePassword(new_password);

    let payload;
    try {
      payload = jwt.verify(token, env.JWT_SECRET);
      if (!payload.reset) throw new Error('Invalid token type');
    } catch (e) {
      return next(new AppError('Invalid or expired reset token.', 400, 'INVALID_TOKEN'));
    }

    const hash = await bcrypt.hash(String(new_password), env.BCRYPT_SALT_ROUNDS);
    
    const supabase = getDb();
    const { data: user, error } = await supabase
      .from('users')
      .update({ password_hash: hash })
      .eq('id', payload.sub)
      .select('email, full_name')
      .single();

    if (error || !user) return next(new AppError('User not found.', 404, 'NOT_FOUND'));

    try {
      await sendMail({
        to: user.email,
        subject: 'Password Reset Successful',
        text: `Your password was reset successfully.`,
      });
    } catch (e) {}

    return res.status(200).json({ ok: true });
  } catch (e) {
    console.error('[auth_controller] resetPassword failed:', e);
    return next(new AppError('Server error.', 500, 'SERVER_ERROR'));
  }
}

module.exports = { login, changePassword, forgotPassword, resetPassword };