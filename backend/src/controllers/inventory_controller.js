/*
 * MotoMart IMS
 * File: src/controllers/inventory_controller.js
 * Version: 2.0.0
 * Purpose: Inventory CRUD + stock movement + archive (Supabase PostgreSQL).
 */

'use strict';

const { getDb } = require('../config/db');
const { AppError } = require('../utils/app_error');
const { toSku } = require('../utils/sku');

function pick(obj, keys) {
  const out = {};
  for (const k of keys) {
    if (obj[k] !== undefined) out[k] = obj[k];
  }
  return out;
}

async function listItems(req, res) {
  const q = String(req.query.q || '').trim();
  const category = String(req.query.category || '').trim();
  const status = String(req.query.status || 'active').trim().toLowerCase();

  const supabase = getDb();
  let query = supabase.from('inventory_items').select('*').order('updated_at', { ascending: false }).limit(800);

  if (category) query = query.eq('category', category);

  if (status === 'archived') query = query.eq('is_archived', true);
  else if (status === 'active') query = query.eq('is_archived', false);

  if (q) {
    query = query.or(`name.ilike.%${q}%,sku.ilike.%${q}%,bin_location.ilike.%${q}%`);
  }

  const { data: items, error } = await query;
  if (error) return res.status(500).json({ ok: false, message: error.message });

  // Add _id backward compatibility for frontend
  const mappedItems = items.map(item => ({ ...item, _id: item.id }));
  return res.status(200).json({ ok: true, data: mappedItems });
}

async function getById(req, res, next) {
  const supabase = getDb();
  const { data: item, error } = await supabase.from('inventory_items').select('*, compatibility:item_compatibilities(*), audit_log:inventory_audit_logs(*)').eq('id', req.params.id).single();
  if (error || !item) return next(new AppError('Item not found.', 404, 'NOT_FOUND'));
  item._id = item.id;
  return res.status(200).json({ ok: true, data: item });
}

async function getBySku(req, res, next) {
  const sku = toSku(req.params.sku);
  const supabase = getDb();
  const { data: item, error } = await supabase.from('inventory_items').select('*, compatibility:item_compatibilities(*), audit_log:inventory_audit_logs(*)').eq('sku', sku).single();
  if (error || !item) return next(new AppError('Item not found.', 404, 'NOT_FOUND'));
  item._id = item.id;
  return res.status(200).json({ ok: true, data: item });
}

async function createItem(req, res, next) {
  const body = req.body || {};
  const supabase = getDb();

  const sku = toSku(body.sku);
  const name = String(body.name || '').trim();
  const category = String(body.category || '').trim();
  const bin = String(body.bin_location || '').trim();

  if (!sku || !name || !category || !bin) return next(new AppError('Missing required fields.', 400, 'VALIDATION_ERROR'));
  if (category.length > 40) return next(new AppError('Category too long (max 40 chars).', 400, 'VALIDATION_ERROR'));

  const qty = Math.max(0, Number(body.quantity_on_hand || 0));

  const { data: existing } = await supabase.from('inventory_items').select('id').eq('sku', sku).single();
  if (existing) return next(new AppError('SKU already exists.', 409, 'CONFLICT'));

  const { data: doc, error } = await supabase.from('inventory_items').insert({
    sku, name, category, bin_location: bin,
    price_php: Number(body.price_php || 0),
    cost_php: Number(body.cost_php || 0),
    quantity_on_hand: qty,
    low_stock_threshold: Math.max(0, Number(body.low_stock_threshold ?? 5))
  }).select().single();

  if (error) {
    console.error('Create item error:', error);
    return next(new AppError(`Failed to create item: ${error.message}`, 500, 'SERVER_ERROR'));
  }

  if (Array.isArray(body.compatibility) && body.compatibility.length > 0) {
    const comps = body.compatibility.map(c => ({
      item_id: doc.id,
      make: c.make, model: c.model, year_from: c.year_from, year_to: c.year_to
    }));
    await supabase.from('item_compatibilities').insert(comps);
  }

  await supabase.from('inventory_audit_logs').insert({
    item_id: doc.id, actor_user_id: req.user.id, action: 'CREATE', note: 'Initial create',
    quantity_before: 0, quantity_after: qty, delta: qty
  });

  doc._id = doc.id;
  return res.status(201).json({ ok: true, data: doc });
}

async function updateItem(req, res, next) {
  const update = pick(req.body || {}, ['name', 'category', 'bin_location', 'price_php', 'cost_php', 'low_stock_threshold']);
  const supabase = getDb();

  if (update.bin_location) update.bin_location = String(update.bin_location).trim();
  if (update.name) update.name = String(update.name).trim();
  if (update.category) update.category = String(update.category).trim();
  if (update.low_stock_threshold !== undefined) update.low_stock_threshold = Math.max(0, Number(update.low_stock_threshold));
  if (update.category && update.category.length > 40) return next(new AppError('Category too long.', 400, 'VALIDATION_ERROR'));

  const { data: doc, error } = await supabase.from('inventory_items').update(update).eq('id', req.params.id).select().single();
  if (error || !doc) return next(new AppError('Item not found.', 404, 'NOT_FOUND'));

  if (req.body.compatibility && Array.isArray(req.body.compatibility)) {
    await supabase.from('item_compatibilities').delete().eq('item_id', doc.id);
    const comps = req.body.compatibility.map(c => ({
      item_id: doc.id, make: c.make, model: c.model, year_from: c.year_from, year_to: c.year_to
    }));
    if (comps.length > 0) await supabase.from('item_compatibilities').insert(comps);
  }

  await supabase.from('inventory_audit_logs').insert({
    item_id: doc.id, actor_user_id: req.user.id, action: 'UPDATE', note: 'Metadata update',
    quantity_before: doc.quantity_on_hand, quantity_after: doc.quantity_on_hand, delta: 0
  });

  doc._id = doc.id;
  return res.status(200).json({ ok: true, data: doc });
}

async function archiveItem(req, res, next) {
  const supabase = getDb();
  const { data: item } = await supabase.from('inventory_items').select('id, is_archived, quantity_on_hand').eq('id', req.params.id).single();
  if (!item) return next(new AppError('Item not found.', 404, 'NOT_FOUND'));
  if (item.is_archived) return res.status(200).json({ ok: true, data: item });

  const { data: doc, error } = await supabase.from('inventory_items').update({
    is_archived: true, archived_at: new Date(), archived_by_user_id: req.user.id
  }).eq('id', item.id).select().single();

  await supabase.from('inventory_audit_logs').insert({
    item_id: doc.id, actor_user_id: req.user.id, action: 'ARCHIVE', note: String((req.body || {}).note || 'Archived').slice(0, 200),
    quantity_before: doc.quantity_on_hand, quantity_after: doc.quantity_on_hand, delta: 0
  });

  doc._id = doc.id;
  return res.status(200).json({ ok: true, data: doc });
}

async function restoreItem(req, res, next) {
  const supabase = getDb();
  const { data: item } = await supabase.from('inventory_items').select('id, is_archived, quantity_on_hand').eq('id', req.params.id).single();
  if (!item) return next(new AppError('Item not found.', 404, 'NOT_FOUND'));
  if (!item.is_archived) return res.status(200).json({ ok: true, data: item });

  const { data: doc, error } = await supabase.from('inventory_items').update({
    is_archived: false, archived_at: null, archived_by_user_id: null
  }).eq('id', item.id).select().single();

  await supabase.from('inventory_audit_logs').insert({
    item_id: doc.id, actor_user_id: req.user.id, action: 'RESTORE', note: String((req.body || {}).note || 'Restored').slice(0, 200),
    quantity_before: doc.quantity_on_hand, quantity_after: doc.quantity_on_hand, delta: 0
  });

  doc._id = doc.id;
  return res.status(200).json({ ok: true, data: doc });
}

async function deleteItemPermanently(req, res, next) {
  const supabase = getDb();
  const { data: item } = await supabase.from('inventory_items').select('id').eq('id', req.params.id).single();
  if (!item) return next(new AppError('Item not found.', 404, 'NOT_FOUND'));

  await supabase.from('inventory_items').delete().eq('id', item.id);
  return res.status(200).json({ ok: true, data: { deleted: true } });
}

async function moveStock(req, res, next) {
  const { direction, quantity, note } = req.body || {};
  const qty = Number(quantity);

  if (!direction || !Number.isFinite(qty) || qty <= 0 || !Number.isInteger(qty)) {
    return next(new AppError('direction and integer quantity (>0) are required.', 400, 'VALIDATION_ERROR'));
  }

  const supabase = getDb();
  const { data: doc } = await supabase.from('inventory_items').select('*').eq('id', req.params.id).single();
  if (!doc) return next(new AppError('Item not found.', 404, 'NOT_FOUND'));
  if (doc.is_archived) return next(new AppError('Item is archived. Restore it before stock moves.', 409, 'ARCHIVED'));

  const before = doc.quantity_on_hand;
  let after = before;
  let sold_units = doc.sold_units;

  if (direction === 'IN') {
    after = before + qty;
  } else if (direction === 'OUT' || direction === 'SALE') {
    after = before - qty;
    if (after < 0) return next(new AppError('Insufficient stock.', 409, 'INSUFFICIENT_STOCK'));
    if (direction === 'SALE') sold_units += qty;
  } else {
    return next(new AppError('Invalid direction. Use IN, OUT, or SALE.', 400, 'VALIDATION_ERROR'));
  }

  const { data: updatedDoc, error } = await supabase.from('inventory_items').update({
    quantity_on_hand: after, sold_units
  }).eq('id', doc.id).select().single();

  await supabase.from('inventory_audit_logs').insert({
    item_id: doc.id, actor_user_id: req.user.id, action: 'STOCK_MOVE',
    note: String(note || '').slice(0, 200), quantity_before: before, quantity_after: after, delta: after - before
  });

  updatedDoc._id = updatedDoc.id;
  return res.status(200).json({
    ok: true,
    data: { item: updatedDoc, low_stock: updatedDoc.quantity_on_hand <= updatedDoc.low_stock_threshold }
  });
}

module.exports = { listItems, getById, getBySku, createItem, updateItem, archiveItem, restoreItem, deleteItemPermanently, moveStock };
