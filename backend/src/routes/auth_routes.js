/*
 * Carbon & Crimson IMS
 * File: src/routes/auth_routes.js
 * Version: 1.0.0
 * Purpose: Auth routes.
 */

'use strict';

const router = require('express').Router();
const { login, changePassword, forgotPassword, resetPassword } = require('../controllers/auth_controller');
const { requireAuth } = require('../middleware/auth');

router.post('/login', login);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);
router.post('/change-password', requireAuth, changePassword);

module.exports = router;
