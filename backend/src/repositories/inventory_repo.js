/*
 * MotoMart IMS
 * File: src/repositories/inventory_repo.js
 * Version: 3.0.0
 * Purpose: Inventory read helpers for AI suggestions (Supabase PostgreSQL).
 */

'use strict';
const { getDb } = require('../config/db');

const MAX_AI_CANDIDATES = 200;

function norm(s) {
  return String(s || '').trim().toLowerCase();
}

async function findCandidateInventoryItems({ make, model, year }) {
  const supabase = getDb();
  // Using an inner join to simulate the old text-based query on array documents
  let query = supabase
    .from('inventory_items')
    .select('id, name, sku, category, quantity_on_hand, item_compatibilities!inner(make, model, year_from, year_to)')
    .eq('is_archived', false)
    .limit(MAX_AI_CANDIDATES);

  if (make) query = query.ilike('item_compatibilities.make', `%${make}%`);
  if (model) query = query.ilike('item_compatibilities.model', `%${model}%`);
  if (year) {
    const y = Number(year);
    query = query.lte('item_compatibilities.year_from', y).gte('item_compatibilities.year_to', y);
  }

  const { data: rows, error } = await query;
  
  // Fallback if strict filters yield nothing: return common unarchived items
  if (error || !rows || rows.length === 0) {
    const { data: fallback } = await supabase
      .from('inventory_items')
      .select('id, name, sku, category, quantity_on_hand')
      .eq('is_archived', false)
      .order('quantity_on_hand', { ascending: false })
      .limit(80);
    return fallback || [];
  }
  return rows;
}

function buildWhitelist(items) {
  const byId = new Map();
  const byName = new Map();

  for (const it of items) {
    const id = String(it.id);
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