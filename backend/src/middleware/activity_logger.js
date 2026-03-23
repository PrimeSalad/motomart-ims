/*
 * Carbon & Crimson IMS
 * File: src/middleware/activity_logger.js
 * Version: 1.0.0
 * Purpose: Global mutation interceptor for audit logging.
 */

'use strict';

const { getDb } = require('../config/db');
const { logger } = require('../utils/logger');

/**
 * Middleware to log all POST, PUT, PATCH, and DELETE requests.
 */
async function activityLogger(req, res, next) {
  res.on('finish', () => {
    // Only log mutations (POST, PUT, PATCH, DELETE)
    const mutations = ['POST', 'PUT', 'PATCH', 'DELETE'];
    if (!mutations.includes(req.method)) return;

    // Skip if user is not authenticated
    if (!req.user) return;

    // Optional: Skip login endpoint to avoid unnecessary noise
    if (req.originalUrl.includes('/auth/login')) return;

    // Define what we want to log
    const logEntry = {
      user_id: req.user.id,
      user_name: req.user.name,
      user_email: req.user.email,
      action: req.method,
      resource: req.originalUrl,
      status_code: res.statusCode,
      ip_address: req.ip || req.headers['x-forwarded-for'] || req.socket?.remoteAddress || 'unknown',
      details: JSON.stringify({
        params: req.params,
        query: req.query,
        body: maskSensitiveData(req.body)
      }),
      created_at: new Date()
    };

    // Save to database
    saveLog(logEntry).catch(err => {
      logger.error('Failed to save activity log:', err);
    });
  });

  next();
}

/**
 * Persist log to Supabase.
 */
async function saveLog(entry) {
  const supabase = getDb();
  const { error } = await supabase.from('system_activity_logs').insert(entry);
  if (error) throw error;
}

/**
 * Remove sensitive fields like passwords from the log.
 */
function maskSensitiveData(body) {
  if (!body) return {};
  const masked = { ...body };
  const sensitiveKeys = ['password', 'current_password', 'new_password', 'token', 'password_hash'];
  
  sensitiveKeys.forEach(key => {
    if (masked[key]) masked[key] = '********';
  });
  
  return masked;
}

module.exports = { activityLogger };
