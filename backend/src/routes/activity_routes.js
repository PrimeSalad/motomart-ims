/*
 * Carbon & Crimson IMS
 * File: src/routes/activity_routes.js
 * Version: 1.0.0
 * Purpose: Audit log routes (Admin only).
 */

'use strict';

const router = require('express').Router();
const { requireAuth, requireRole } = require('../middleware/auth');
const { getLogs } = require('../controllers/activity_controller');

router.use(requireAuth);
router.use(requireRole('admin'));

router.get('/logs', getLogs);

module.exports = router;
