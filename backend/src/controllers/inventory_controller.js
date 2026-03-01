/*
 * MotoMart IMS
 * File: src/controllers/inventory_controller.js
 * Version: 1.1.0
 * Purpose: Inventory CRUD + stock movement + archive (soft delete).
 */

'use strict';

const { InventoryItem } = require('../models/inventory_item_model');
const { AppError } = require('../utils/app_error');
const { toSku } = require('../utils/sku');

function pick(obj, keys) {
  const out = {};
  for (const k of keys) {
    if (obj[k] !== undefined) out[k] = obj[k];
  }
  return out;
}

/**
 * GET /inventory
 * Query:
 * - q: full-text search
 * - category: filter
 * - status: "active" | "archived" | "all" (default "active")
 */
async function listItems(req, res) {
  const q = String(req.query.q || '').trim();
  const category = String(req.query.category || '').trim();
  const status = String(req.query.status || 'active').trim().toLowerCase();

  const filter = {};

  if (category) filter.category = category;

  if (status === 'archived') filter.is_archived = true;
  else if (status === 'all') { /* no filter */ }
  else filter.is_archived = false; // default active

  if (q) {
    filter.$text = { $search: q };
  }

  const items = await InventoryItem.find(filter)
    .sort({ updatedAt: -1 })
    .limit(800)
    .lean();

  return res.status(200).json({ ok: true, data: items });
}

async function getById(req, res, next) {
  const item = await InventoryItem.findById(req.params.id).lean();
  if (!item) return next(new AppError('Item not found.', 404, 'NOT_FOUND'));
  return res.status(200).json({ ok: true, data: item });
}

async function getBySku(req, res, next) {
  const sku = toSku(req.params.sku);
  const item = await InventoryItem.findOne({ sku }).lean();
  if (!item) return next(new AppError('Item not found.', 404, 'NOT_FOUND'));
  return res.status(200).json({ ok: true, data: item });
}

async function createItem(req, res, next) {
  const body = req.body || {};

  const sku = toSku(body.sku);
  const name = String(body.name || '').trim();
  const category = String(body.category || '').trim();
  const bin = String(body.bin_location || '').trim();

  if (!sku || !name || !category || !bin) {
    return next(new AppError('Missing required fields.', 400, 'VALIDATION_ERROR'));
  }

  if (category.length > 40) {
    return next(new AppError('Category too long (max 40 chars).', 400, 'VALIDATION_ERROR'));
  }

  const existing = await InventoryItem.findOne({ sku }).lean();
  if (existing) {
    return next(new AppError('SKU already exists.', 409, 'CONFLICT'));
  }

  const qty = Math.max(0, Number(body.quantity_on_hand || 0));

  const doc = await InventoryItem.create({
    sku,
    name,
    category,
    bin_location: bin,
    compatibility: Array.isArray(body.compatibility) ? body.compatibility : [],
    price_php: Number(body.price_php || 0),
    cost_php: Number(body.cost_php || 0),
    quantity_on_hand: qty,
    low_stock_threshold: Math.max(0, Number(body.low_stock_threshold ?? 5)),
    audit_log: [{
      actor_user_id: req.user.id,
      action: 'CREATE',
      note: 'Initial create',
      quantity_before: 0,
      quantity_after: qty,
      delta: qty,
    }],
  });

  return res.status(201).json({ ok: true, data: doc });
}

async function updateItem(req, res, next) {
  const update = pick(req.body || {}, [
    'name', 'category', 'bin_location', 'compatibility',
    'price_php', 'cost_php', 'low_stock_threshold',
  ]);

  if (update.sku) delete update.sku; // SKU immutable via this endpoint
  if (update.bin_location) update.bin_location = String(update.bin_location).trim();
  if (update.name) update.name = String(update.name).trim();
  if (update.category) update.category = String(update.category).trim();
  if (update.low_stock_threshold !== undefined) {
    update.low_stock_threshold = Math.max(0, Number(update.low_stock_threshold));
  }
  if (update.category && update.category.length > 40) {
    return next(new AppError('Category too long (max 40 chars).', 400, 'VALIDATION_ERROR'));
  }

  const doc = await InventoryItem.findById(req.params.id);
  if (!doc) return next(new AppError('Item not found.', 404, 'NOT_FOUND'));

  Object.assign(doc, update);

  doc.audit_log.push({
    actor_user_id: req.user.id,
    action: 'UPDATE',
    note: 'Metadata update',
    quantity_before: doc.quantity_on_hand,
    quantity_after: doc.quantity_on_hand,
    delta: 0,
  });

  await doc.save();
  return res.status(200).json({ ok: true, data: doc });
}

/**
 * PATCH /inventory/:id/archive
 * Soft delete: move item to archive (still retrievable).
 */
async function archiveItem(req, res, next) {
  const doc = await InventoryItem.findById(req.params.id);
  if (!doc) return next(new AppError('Item not found.', 404, 'NOT_FOUND'));
  if (doc.is_archived) return res.status(200).json({ ok: true, data: doc });

  doc.is_archived = true;
  doc.archived_at = new Date();
  doc.archived_by_user_id = req.user.id;

  doc.audit_log.push({
    actor_user_id: req.user.id,
    action: 'ARCHIVE',
    note: String((req.body || {}).note || 'Archived').slice(0, 200),
    quantity_before: doc.quantity_on_hand,
    quantity_after: doc.quantity_on_hand,
    delta: 0,
  });

  await doc.save();
  return res.status(200).json({ ok: true, data: doc });
}

/**
 * PATCH /inventory/:id/restore
 */
async function restoreItem(req, res, next) {
  const doc = await InventoryItem.findById(req.params.id);
  if (!doc) return next(new AppError('Item not found.', 404, 'NOT_FOUND'));
  if (!doc.is_archived) return res.status(200).json({ ok: true, data: doc });

  doc.is_archived = false;
  doc.archived_at = null;
  doc.archived_by_user_id = null;

  doc.audit_log.push({
    actor_user_id: req.user.id,
    action: 'RESTORE',
    note: String((req.body || {}).note || 'Restored').slice(0, 200),
    quantity_before: doc.quantity_on_hand,
    quantity_after: doc.quantity_on_hand,
    delta: 0,
  });

  await doc.save();
  return res.status(200).json({ ok: true, data: doc });
}

/**
 * DELETE /inventory/:id/permanent
 * Hard delete (admin-only).
 * Recommended: archive first, then permanently delete from the archive view.
 */
async function deleteItemPermanently(req, res, next) {
  const doc = await InventoryItem.findById(req.params.id);
  if (!doc) return next(new AppError('Item not found.', 404, 'NOT_FOUND'));

  doc.audit_log.push({
    actor_user_id: req.user.id,
    action: 'DELETE',
    note: 'Item permanently deleted',
    quantity_before: doc.quantity_on_hand,
    quantity_after: doc.quantity_on_hand,
    delta: 0,
  });

  await doc.save();
  await InventoryItem.deleteOne({ _id: doc._id });

  return res.status(200).json({ ok: true, data: { deleted: true } });
}

/**
 * Stock movement endpoint.
 * - direction: "IN" | "OUT" | "SALE"
 * - quantity: positive integer
 * - note: optional
 */
async function moveStock(req, res, next) {
  const { direction, quantity, note } = req.body || {};
  const qty = Number(quantity);

  if (!direction || !Number.isFinite(qty) || qty <= 0 || !Number.isInteger(qty)) {
    return next(new AppError('direction and integer quantity (>0) are required.', 400, 'VALIDATION_ERROR'));
  }

  const doc = await InventoryItem.findById(req.params.id);
  if (!doc) return next(new AppError('Item not found.', 404, 'NOT_FOUND'));
  if (doc.is_archived) return next(new AppError('Item is archived. Restore it before stock moves.', 409, 'ARCHIVED'));

  const before = doc.quantity_on_hand;
  let after = before;

  if (direction === 'IN') {
    after = before + qty;
  } else if (direction === 'OUT' || direction === 'SALE') {
    after = before - qty;
    if (after < 0) {
      return next(new AppError('Insufficient stock.', 409, 'INSUFFICIENT_STOCK'));
    }
  } else {
    return next(new AppError('Invalid direction. Use IN, OUT, or SALE.', 400, 'VALIDATION_ERROR'));
  }

  doc.quantity_on_hand = after;

  if (direction === 'SALE') {
    doc.sold_units += qty;
  }

  doc.audit_log.push({
    actor_user_id: req.user.id,
    action: 'STOCK_MOVE',
    note: String(note || '').slice(0, 200),
    quantity_before: before,
    quantity_after: after,
    delta: after - before,
  });

  await doc.save();

  return res.status(200).json({
    ok: true,
    data: {
      item: doc,
      low_stock: doc.quantity_on_hand <= doc.low_stock_threshold,
    },
  });
}

module.exports = {
  listItems,
  getById,
  getBySku,
  createItem,
  updateItem,
  archiveItem,
  restoreItem,
  deleteItemPermanently,
  moveStock,
};
