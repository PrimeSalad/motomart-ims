/*
 * MotoMart IMS
 * File: src/models/inventory_item_model.js
 * Version: 1.1.0
 * Purpose: Inventory item with compatibility + audit log + archive support.
 */

'use strict';

const mongoose = require('mongoose');

const compatibilitySchema = new mongoose.Schema({
  make: { type: String, required: true, trim: true },
  model: { type: String, required: true, trim: true },
  year_from: { type: Number, required: true },
  year_to: { type: Number, required: true },
}, { _id: false });

const auditLogSchema = new mongoose.Schema({
  actor_user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  action: {
    type: String,
    required: true,
    enum: ['CREATE', 'UPDATE', 'ARCHIVE', 'RESTORE', 'DELETE', 'STOCK_MOVE']
  },
  note: { type: String, default: '' },

  quantity_before: { type: Number, default: 0 },
  quantity_after: { type: Number, default: 0 },
  delta: { type: Number, default: 0 },

  ts: { type: Date, default: () => new Date() },
}, { _id: false });

const inventoryItemSchema = new mongoose.Schema({
  sku: { type: String, required: true, unique: true, uppercase: true, trim: true },
  name: { type: String, required: true, trim: true },

  /**
   * Category is user-defined (string). We keep it flexible so operators can add categories anytime.
   * Examples: "Engine", "Helmet", "Electrical", "Accessories", etc.
   */
  category: { type: String, required: true, trim: true, maxlength: 40 },

  bin_location: { type: String, required: true, trim: true }, // e.g., A-03-12
  compatibility: { type: [compatibilitySchema], default: [] },

  price_php: { type: Number, required: true, min: 0 },
  cost_php: { type: Number, required: true, min: 0 },

  quantity_on_hand: { type: Number, required: true, min: 0, default: 0 },
  low_stock_threshold: { type: Number, required: true, min: 0, default: 5 },

  // simple sales counter for analytics (increment when "sale" stock move occurs)
  sold_units: { type: Number, required: true, min: 0, default: 0 },

  // Soft-delete / archive
  is_archived: { type: Boolean, required: true, default: false, index: true },
  archived_at: { type: Date, default: null },
  archived_by_user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },

  audit_log: { type: [auditLogSchema], default: [] },
}, { timestamps: true });

inventoryItemSchema.index({ is_archived: 1, category: 1, sku: 1 });
inventoryItemSchema.index({ name: 'text', sku: 'text', bin_location: 'text' });

const InventoryItem = mongoose.model('InventoryItem', inventoryItemSchema);

module.exports = { InventoryItem };
