/*
 * MotoMart IMS
 * File: src/routes/inventory_routes.js
 * Version: 1.1.0
 * Purpose: Inventory routes (CRUD + stock movement + archive).
 */

'use strict';

const router = require('express').Router();
const { requireAuth, requireRole } = require('../middleware/auth');
const c = require('../controllers/inventory_controller');

router.use(requireAuth);

router.get('/', c.listItems);
router.get('/sku/:sku', c.getBySku);
router.get('/:id', c.getById);
router.post('/', requireRole('staff'), c.createItem);
router.put('/:id', requireRole('staff'), c.updateItem);

// Archive / Restore
router.patch('/:id/archive', requireRole('staff'), c.archiveItem);
router.patch('/:id/restore', requireRole('staff'), c.restoreItem);

// Hard Delete
router.delete('/:id/permanent', requireRole('admin'), c.deleteItemPermanently);

// Move Stock
router.patch('/:id/stock', requireRole('staff'), c.moveStock);

module.exports = router;
