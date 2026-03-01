/*
 * Carbon & Crimson IMS
 * File: src/controllers/analytics_controller.js
 * Version: 1.1.1
 * Purpose: Dashboard analytics endpoints.
 *
 * Changelog:
 * - Added "todaySales" aggregation (units + revenue + per-item breakdown) based on SALE stock moves.
 */

'use strict';

const { InventoryItem } = require('../models/inventory_item_model');

function isoDateKey(d) {
  return new Date(d).toISOString().slice(0, 10);
}

async function summary(_req, res) {
  const items = await InventoryItem.find({ is_archived: false }).lean();

  const topSelling = items
    .map((i) => ({
      name: i.name,
      sku: i.sku,
      sold_units: i.sold_units || 0,
      revenue_php: (i.sold_units || 0) * (i.price_php || 0),
    }))
    .sort((a, b) => b.sold_units - a.sold_units)
    .slice(0, 8);

  // Revenue trend: last 7 days from audit_log SALE moves
  const buckets = new Map(); // yyyy-mm-dd -> revenue
  const now = new Date();
  for (let d = 0; d < 7; d += 1) {
    const day = new Date(now);
    day.setDate(now.getDate() - d);
    const key = isoDateKey(day);
    buckets.set(key, 0);
  }

  // Today's sales breakdown (same SALE detection as trend)
  const todayKey = isoDateKey(now);
  const todaySalesBySku = new Map(); // sku -> { sku, name, units, revenue_php }
  let todayUnits = 0;
  let todayRevenue = 0;

  for (const item of items) {
    const audit = Array.isArray(item.audit_log) ? item.audit_log : [];
    for (const entry of audit) {
      if (entry.action !== 'STOCK_MOVE') continue;

      const key = isoDateKey(entry.ts);
      const note = String(entry.note || '').toLowerCase();
      const wasSale = note.includes('sale');
      if (!wasSale) continue;

      const units = Math.abs(Number(entry.delta || 0));
      if (!Number.isFinite(units) || units <= 0) continue;

      const revenue = units * Number(item.price_php || 0);

      if (buckets.has(key)) {
        buckets.set(key, (buckets.get(key) || 0) + revenue);
      }

      if (key === todayKey) {
        todayUnits += units;
        todayRevenue += revenue;

        const sku = String(item.sku || '');
        const cur = todaySalesBySku.get(sku) || {
          sku,
          name: item.name,
          units: 0,
          revenue_php: 0,
        };
        cur.units += units;
        cur.revenue_php += revenue;
        todaySalesBySku.set(sku, cur);
      }
    }
  }

  const revenueTrends = Array.from(buckets.entries())
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([date, revenue_php]) => ({ date, revenue_php }));

  // Stock-to-sales ratio (per category)
  const byCategory = new Map();
  for (const item of items) {
    const cat = item.category || 'Unknown';
    const cur = byCategory.get(cat) || { category: cat, stock: 0, sold: 0 };
    cur.stock += Number(item.quantity_on_hand || 0);
    cur.sold += Number(item.sold_units || 0);
    byCategory.set(cat, cur);
  }

  const stockToSalesRatio = Array.from(byCategory.values()).map((x) => ({
    category: x.category,
    ratio: x.sold > 0 ? Number((x.stock / x.sold).toFixed(2)) : x.stock,
  }));

  // Low stock list
  const lowStock = items
    .filter((i) => (i.quantity_on_hand || 0) <= (i.low_stock_threshold || 0))
    .sort((a, b) => (a.quantity_on_hand || 0) - (b.quantity_on_hand || 0))
    .slice(0, 12)
    .map((i) => ({
      id: String(i._id),
      sku: i.sku,
      name: i.name,
      category: i.category,
      quantity_on_hand: i.quantity_on_hand,
      low_stock_threshold: i.low_stock_threshold,
    }));

  const todaySalesItems = Array.from(todaySalesBySku.values())
    .sort((a, b) => b.units - a.units)
    .slice(0, 20);

  return res.status(200).json({
    ok: true,
    data: {
      topSelling,
      revenueTrends,
      stockToSalesRatio,
      lowStock,
      todaySales: {
        date: todayKey,
        units: todayUnits,
        revenue_php: todayRevenue,
        items: todaySalesItems,
      },
      totals: {
        items: items.length,
        onHand: items.reduce((sum, i) => sum + Number(i.quantity_on_hand || 0), 0),
      },
    },
  });
}

module.exports = { summary };
