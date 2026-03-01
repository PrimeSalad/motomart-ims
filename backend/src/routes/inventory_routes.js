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

router.post('/', requireRole(['admin', 'staff']), c.createItem);
router.put('/:id', requireRole(['admin', 'staff']), c.updateItem);

// Soft-delete
router.patch('/:id/archive', requireRole(['admin', 'staff']), c.archiveItem);
router.patch('/:id/restore', requireRole(['admin', 'staff']), c.restoreItem);

// Hard delete (admin)
router.delete('/:id/permanent', requireRole(['admin']), c.deleteItemPermanently);

router.patch('/:id/stock', requireRole(['admin', 'staff']), c.moveStock);

module.exports = router;
