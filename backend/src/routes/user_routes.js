/*
 * MotoMart IMS
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

// Allow staff to list users (limited fields enforced in controller)
router.get('/', requireRole('staff'), c.listUsers);

// Management routes restricted to Admin+
router.post('/', requireRole('admin'), c.createUser);
router.patch('/:id/status', requireRole('admin'), c.toggleStatus);
router.delete('/:id', requireRole('admin'), c.deleteUser);

module.exports = router;
