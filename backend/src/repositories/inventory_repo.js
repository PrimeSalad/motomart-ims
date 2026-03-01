/*
 * Carbon & Crimson IMS
 * File: src/repositories/inventory_repo.js
 * Version: 2.5.0
 * Purpose: Inventory read helpers for AI suggestions (whitelist source).
 */

'use strict';

const { InventoryItem } = require('../models/inventory_item_model'); // <- adjust path/model name

const MAX_AI_CANDIDATES = 200;

function norm(s) {
  return String(s || '').trim().toLowerCase();
}

/**
 * Returns a list of inventory items that can be suggested by AI.
 * You can tune matching rules here.
 */
async function findCandidateInventoryItems({ make, model, year }) {
  // NOTE: adapt fields based on your schema:
  // e.g. item.make, item.model, item.year_compatibility[], item.tags, etc.
  const query = { is_archived: { $ne: true } };

  // If you store compatibility as text fields:
  if (make) query.compat_make = new RegExp(`^${escapeRegex(make)}$`, 'i');
  if (model) query.compat_model = new RegExp(`^${escapeRegex(model)}$`, 'i');

  // If year is stored as number or range, adapt accordingly.
  if (year) query.compat_year = Number(year);

  const rows = await InventoryItem.find(query)
    .select('_id name sku brand category compat_make compat_model compat_year quantity')
    .limit(MAX_AI_CANDIDATES)
    .lean();

  // fallback if strict filters yield nothing: return common maintenance items in inventory
  if (!rows || rows.length === 0) {
    const fallbackRows = await InventoryItem.find({ is_archived: { $ne: true } })
      .select('_id name sku brand category quantity')
      .sort({ quantity: -1 })
      .limit(80)
      .lean();
    return fallbackRows || [];
  }

  return rows;
}

function escapeRegex(str) {
  return String(str).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Build a whitelist map for enforcement.
 */
function buildWhitelist(items) {
  const byId = new Map();
  const byName = new Map();

  for (const it of items) {
    const id = String(it._id);
    const nameKey = norm(it.name);

    byId.set(id, it);
    if (nameKey) byName.set(nameKey, it);
  }

  return { byId, byName };
}

module.exports = {
  findCandidateInventoryItems,
  buildWhitelist,
  norm,
};