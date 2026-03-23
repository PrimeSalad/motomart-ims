/*
 * Carbon & Crimson IMS
 * File: src/routes/activity_routes.js
 * Version: 1.0.0
 * Purpose: Audit log routes (Admin only).
 */

'use strict';

const router = require('express').Router();
const { requireAuth, requireRole } = require('../middleware/auth');
const { getLogs, getInventoryLogs } = require('../controllers/activity_controller');

router.use(requireAuth);

router.get('/logs', requireRole('admin'), getLogs);
router.get('/inventory-logs', requireRole('staff'), getInventoryLogs);

module.exports = router;
