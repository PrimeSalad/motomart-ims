/*
 * MotoMart IMS
 * File: src/utils/sku.js
 * Version: 1.0.0
 * Purpose: SKU normalization + generator.
 */

'use strict';

function toSku(raw) {
  return String(raw || '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^A-Za-z0-9\-]/g, '')
    .toUpperCase();
}

function generateSku(prefix = 'IMS', randLen = 6) {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let buf = '';
  for (let i = 0; i < randLen; i += 1) {
    buf += alphabet[Math.floor(Math.random() * alphabet.length)];
  }
  return toSku(`${prefix}-${buf}`);
}

module.exports = { toSku, generateSku };
