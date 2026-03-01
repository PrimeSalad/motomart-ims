/*
 * Carbon & Crimson IMS
 * File: src/routes/analytics_routes.js
 * Version: 1.0.0
 * Purpose: Analytics routes.
 */

'use strict';

const router = require('express').Router();
const { requireAuth } = require('../middleware/auth');
const { summary } = require('../controllers/analytics_controller');

router.use(requireAuth);
router.get('/summary', summary);

module.exports = router;
