/*
 * Carbon & Crimson IMS
 * File: src/routes/user_routes.js
 * Version: 1.0.0
 * Purpose: User management routes (Admin/Super Admin only).
 */

'use strict';

const router = require('express').Router();
const { requireAuth, requireRole } = require('../middleware/auth');
const c = require('../controllers/user_controller');

router.use(requireAuth);

// Allow any authenticated user to update their own profile
router.patch('/profile', c.updateProfile);

router.use(requireRole('admin'));

router.get('/', c.listUsers);
router.post('/', c.createUser);
router.patch('/:id/status', c.toggleStatus);
router.delete('/:id', c.deleteUser);

module.exports = router;
