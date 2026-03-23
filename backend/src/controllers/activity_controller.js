/*
 * Carbon & Crimson IMS
 * File: src/controllers/activity_controller.js
 * Version: 1.2.0
 * Purpose: System & Inventory Activity Log retrieval.
 */

'use strict';

const { getDb } = require('../config/db');
const { ROLE_WEIGHTS } = require('../middleware/auth');

/**
 * Fetch system activity logs (Admins only).
 * Excludes inventory-related logs.
 * Admins cannot see Super Admin activities.
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
      // Super Admins see all activity in the system
      allowedRoles = ['super_admin', 'admin', 'staff'];
    } else if (reqWeight >= ROLE_WEIGHTS.admin) {
      // Admins see their own level (other admins) and staff activity
      // BUT specifically NO Super Admins
      allowedRoles = ['admin', 'staff'];
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

    const allowedUserIds = (allowedUsers || []).map(u => u.id);

    // If a specific user is requested, ensure they are in the allowed list
    if (targetUserId && !allowedUserIds.includes(targetUserId)) {
       return res.status(403).json({ ok: false, error: { message: 'Cannot view logs for this user.' } });
    }

    let query = supabase
      .from('system_activity_logs')
      .select('*', { count: 'exact' });

    // FILTER: Exclude inventory activities from System Logs
    query = query.not('resource', 'ilike', '%/api/inventory%');

    if (targetUserId) {
      query = query.eq('user_id', targetUserId);
    } else if (allowedUserIds.length > 0) {
      query = query.in('user_id', allowedUserIds);
    } else {
      // Always allow seeing their own logs
      query = query.eq('user_id', req.user.id);
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

/**
 * Retrieve Inventory-specific Audit Logs.
 * Joins with inventory_items to get part names.
 */
async function getInventoryLogs(req, res, next) {
  try {
    const limit = Number(req.query.limit || 50);
    const offset = Number(req.query.offset || 0);
    const supabase = getDb();

    // Query inventory_audit_logs and join with inventory_items
    const { data, error, count } = await supabase
      .from('inventory_audit_logs')
      .select('*, inventory_items:item_id(name, sku)', { count: 'exact' })
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

module.exports = { getLogs, getInventoryLogs };
