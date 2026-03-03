/*
 * MotoMart IMS
 * File: src/lib/format.js
 * Version: 1.1.0
 * Purpose: Formatting helpers (PDF-safe).
 *
 * Notes:
 * - We intentionally avoid the "₱" symbol because jsPDF's built-in fonts are not Unicode-safe.
 * - Use plain ASCII text so PDF exports don't show garbled characters.
 */
const NF_MONEY = new Intl.NumberFormat('en-US', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

/**
 * Format a numeric value as plain text money in Philippine pesos.
 * Example: 1234.5 -> "1,234.50 pesos"
 */
export function formatPhp(value) {
  const n = Number(value || 0);
  const safe = Number.isFinite(n) ? n : 0;
  return `${NF_MONEY.format(safe)}`;
}