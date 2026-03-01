/*
 * Carbon & Crimson IMS
 * File: src/services/mailer_service.js
 * Version: 1.1.0
 * Purpose: Send transactional emails (password reset/change) via SMTP.
 *
 * Notes:
 * - Uses Nodemailer.
 * - If SMTP is not configured, emails are NOT sent; instead the payload is logged.
 */

'use strict';

const nodemailer = require('nodemailer');
const { env } = require('../config/env');
const { logger } = require('../utils/logger');

function isSmtpConfigured() {
  return Boolean(env.SMTP_HOST && env.SMTP_PORT && env.SMTP_USER && env.SMTP_PASS && env.MAIL_FROM);
}

function createTransport() {
  return nodemailer.createTransport({
    host: env.SMTP_HOST,
    port: Number(env.SMTP_PORT),
    secure: Boolean(env.SMTP_SECURE),
    auth: {
      user: env.SMTP_USER,
      pass: env.SMTP_PASS,
    },
  });
}

async function sendMail({ to, subject, text, html }) {
  if (!isSmtpConfigured()) {
    logger.warn('SMTP not configured. Email not sent. Logging payload instead.');
    logger.info({ to, subject, textPreview: String(text || '').slice(0, 120) });
    return { ok: true, skipped: true };
  }

  const transporter = createTransport();

  await transporter.sendMail({
    from: env.MAIL_FROM,
    to,
    subject,
    text,
    html,
  });

  return { ok: true, skipped: false };
}

module.exports = { sendMail };
