/*
 * Carbon & Crimson IMS
 * File: src/controllers/auth_controller.js
 * Version: 1.2.0
 * Purpose: Auth endpoints (JWT) - FIX: bcrypt-based password verify/set (no schema methods required).
 */

'use strict';

const bcrypt = require('bcryptjs');

const { AppError } = require('../utils/app_error');
const { User } = require('../models/user_model');
const { signToken } = require('../services/jwt_service');
const { sendMail } = require('../services/mailer_service');
const { env } = require('../config/env');

const BCRYPT_ROUNDS = 10;

function safeLowerEmail(email) {
  return String(email || '').toLowerCase().trim();
}

function getUserPasswordHash(user) {
  // Support common field names
  const a = user?.password_hash;
  if (typeof a === 'string' && a.trim()) return a;

  const b = user?.passwordHash;
  if (typeof b === 'string' && b.trim()) return b;

  const c = user?.password;
  // If someone mistakenly stored a hash in "password"
  if (typeof c === 'string' && c.startsWith('$2')) return c;

  return '';
}

async function verifyPassword(user, plainPassword) {
  const hash = getUserPasswordHash(user);
  if (!hash) return false;
  return bcrypt.compare(String(plainPassword || ''), String(hash));
}

async function setPassword(user, newPlainPassword) {
  const hash = await bcrypt.hash(String(newPlainPassword || ''), BCRYPT_ROUNDS);

  // Write to whichever fields exist in schema.
  // If both exist, set both to keep compatibility.
  if (Object.prototype.hasOwnProperty.call(user, 'password_hash')) user.password_hash = hash;
  if (Object.prototype.hasOwnProperty.call(user, 'passwordHash')) user.passwordHash = hash;

  // Fallback (if schema only has "password_hash" but not detected by hasOwnProperty due to Mongoose getters)
  if (!user.password_hash && !user.passwordHash) {
    user.password_hash = hash; // safest default used across your codebase (reset token query uses snake_case fields)
  }

  // If your schema uses timestamps/flags, keep consistent:
  if (Object.prototype.hasOwnProperty.call(user, 'password_changed_at')) {
    user.password_changed_at = new Date();
  }

  // Invalidate reset token fields if present
  if (Object.prototype.hasOwnProperty.call(user, 'password_reset_token_hash')) {
    user.password_reset_token_hash = null;
  }
  if (Object.prototype.hasOwnProperty.call(user, 'password_reset_expires_at')) {
    user.password_reset_expires_at = null;
  }
}

async function login(req, res, next) {
  try {
    const { email, password } = req.body || {};

    if (!email || !password) {
      return next(new AppError('Email and password are required.', 400, 'VALIDATION_ERROR'));
    }

    const user = await User.findOne({ email: safeLowerEmail(email) })
      // in case password fields are select:false
      .select('+password_hash +passwordHash +password');

    if (!user) {
      return next(new AppError('Invalid credentials.', 401, 'UNAUTHORIZED'));
    }

    const ok = await verifyPassword(user, password);
    if (!ok) {
      return next(new AppError('Invalid credentials.', 401, 'UNAUTHORIZED'));
    }

    const token = signToken(String(user._id));

    return res.status(200).json({
      ok: true,
      data: {
        token,
        user: {
          id: String(user._id),
          email: user.email,
          name: user.name,
          role: user.role,
        },
      },
    });
  } catch (e) {
    console.error('[auth_controller] login failed:', e?.message || e);
    return next(new AppError('Server error.', 500, 'SERVER_ERROR'));
  }
}

async function changePassword(req, res, next) {
  try {
    const { current_password, new_password } = req.body || {};

    if (!current_password || !new_password) {
      return next(new AppError('Current password and new password are required.', 400, 'VALIDATION_ERROR'));
    }
    if (String(new_password).length < 8) {
      return next(new AppError('New password must be at least 8 characters.', 400, 'VALIDATION_ERROR'));
    }

    const user = await User.findById(req.user.id).select('+password_hash +passwordHash +password');
    if (!user) return next(new AppError('User not found.', 404, 'NOT_FOUND'));

    const ok = await verifyPassword(user, current_password);
    if (!ok) return next(new AppError('Current password is incorrect.', 401, 'UNAUTHORIZED'));

    await setPassword(user, new_password);
    await user.save();

    // Notify via email (best-effort)
    try {
      await sendMail({
        to: user.email,
        subject: 'Your MotoMart IMS password was changed',
        text: `Hello ${user.name || ''}\n\nYour password was changed successfully. If this wasn't you, contact your admin immediately.`,
      });
    } catch (mailErr) {
      console.error('[auth_controller] changePassword mail failed:', mailErr?.message || mailErr);
    }

    return res.status(200).json({ ok: true });
  } catch (e) {
    console.error('[auth_controller] changePassword failed:', e?.message || e);
    return next(new AppError('Server error.', 500, 'SERVER_ERROR'));
  }
}

async function forgotPassword(req, res, next) {
  try {
    const { email } = req.body || {};
    if (!email) return next(new AppError('Email is required.', 400, 'VALIDATION_ERROR'));

    const user = await User.findOne({ email: safeLowerEmail(email) });

    // Always return OK to prevent account enumeration
    if (!user) {
      return res.status(200).json({ ok: true });
    }

    // This relies on your model providing createPasswordResetToken()
    if (typeof user.createPasswordResetToken !== 'function') {
      console.error('[auth_controller] User.createPasswordResetToken() missing on model.');
      return res.status(200).json({ ok: true });
    }

    const token = user.createPasswordResetToken();
    await user.save();

    const resetUrl = `${env.APP_PUBLIC_URL}/reset-password?token=${encodeURIComponent(token)}`;

    await sendMail({
      to: user.email,
      subject: 'Reset your MotoMart IMS password',
      text: `Hello ${user.name || ''}\n\nYou requested a password reset.\n\nOpen this link to set a new password (valid for 30 minutes):\n${resetUrl}\n\nIf you did not request this, you can ignore this email.`,
      html: `<p>Hello ${user.name || ''}</p><p>You requested a password reset.</p><p><a href="${resetUrl}">Reset your password</a> (valid for 30 minutes).</p><p>If you did not request this, you can ignore this email.</p>`,
    });

    return res.status(200).json({ ok: true });
  } catch (e) {
    console.error('[auth_controller] forgotPassword failed:', e?.message || e);
    return next(new AppError('Server error.', 500, 'SERVER_ERROR'));
  }
}

async function resetPassword(req, res, next) {
  try {
    const { token, new_password } = req.body || {};
    if (!token || !new_password) {
      return next(new AppError('Token and new password are required.', 400, 'VALIDATION_ERROR'));
    }
    if (String(new_password).length < 8) {
      return next(new AppError('New password must be at least 8 characters.', 400, 'VALIDATION_ERROR'));
    }

    // This relies on your model providing hashResetToken()
    if (typeof User.hashResetToken !== 'function') {
      console.error('[auth_controller] User.hashResetToken() missing on model.');
      return next(new AppError('Server misconfiguration.', 500, 'SERVER_ERROR'));
    }

    const tokenHash = User.hashResetToken(token);

    const user = await User.findOne({
      password_reset_token_hash: tokenHash,
      password_reset_expires_at: { $gt: new Date() },
    }).select('+password_hash +passwordHash +password');

    if (!user) {
      return next(new AppError('Invalid or expired reset token.', 400, 'INVALID_TOKEN'));
    }

    await setPassword(user, new_password);
    await user.save();

    try {
      await sendMail({
        to: user.email,
        subject: 'Your MotoMart IMS password was reset',
        text: `Hello ${user.name || ''}\n\nYour password was reset successfully. If this wasn't you, contact your admin immediately.`,
      });
    } catch (mailErr) {
      console.error('[auth_controller] resetPassword mail failed:', mailErr?.message || mailErr);
    }

    return res.status(200).json({ ok: true });
  } catch (e) {
    console.error('[auth_controller] resetPassword failed:', e?.message || e);
    return next(new AppError('Server error.', 500, 'SERVER_ERROR'));
  }
}

module.exports = { login, changePassword, forgotPassword, resetPassword };