/*
 * Carbon & Crimson IMS
 * File: src/controllers/activity_controller.js
 * Version: 1.1.0
 * Purpose: System Activity Log retrieval.
 */

'use strict';

const { getDb } = require('../config/db');
const { ROLE_WEIGHTS } = require('../middleware/auth');

/**
 * Fetch system activity logs (Admins only).
 */
async function getLogs(req, res, next) {
  try {
    const supabase = getDb();
    const limit = Number(req.query.limit || 50);
    const offset = Number(req.query.offset || 0);
    const targetUserId = req.query.user_id;

    const reqWeight = req.user.roleWeight || 0;

    // Determine which roles this user is allowed to monitor
    let allowedRoles = [];
    if (reqWeight >= ROLE_WEIGHTS.super_admin) {
      allowedRoles = ['admin', 'staff'];
    } else if (reqWeight >= ROLE_WEIGHTS.admin) {
      allowedRoles = ['staff'];
    }

    if (allowedRoles.length === 0) {
      return res.status(403).json({ ok: false, error: { message: 'Insufficient permissions to view logs.' } });
    }

    // Get IDs of users in those roles
    const { data: allowedUsers, error: usersErr } = await supabase
      .from('users')
      .select('id')
      .in('role', allowedRoles);

    if (usersErr) throw usersErr;

    const allowedUserIds = allowedUsers.map(u => u.id);

    // If a specific user is requested, ensure they are in the allowed list
    if (targetUserId && !allowedUserIds.includes(targetUserId)) {
       return res.status(403).json({ ok: false, error: { message: 'Cannot view logs for this user.' } });
    }

    let query = supabase
      .from('system_activity_logs')
      .select('*', { count: 'exact' });

    if (targetUserId) {
      query = query.eq('user_id', targetUserId);
    } else if (allowedUserIds.length > 0) {
      query = query.in('user_id', allowedUserIds);
    } else {
      // If no users exist in the allowed roles, return empty
      return res.status(200).json({ ok: true, data: [], pagination: { total: 0, limit, offset } });
    }

    const { data, error, count } = await query
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw error;

    return res.status(200).json({
      ok: true,
      data,
      pagination: {
        total: count,
        limit,
        offset
      }
    });
  } catch (e) {
    next(e);
  }
}

module.exports = { getLogs };
