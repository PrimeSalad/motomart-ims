/*
 * Carbon & Crimson IMS
 * File: src/controllers/compat_controller.js
 * Version: 2.2.0
 * Purpose: Smart Suggestions API (Gemini-only). No DB matching.
 */

'use strict';

const { AppError } = require('../utils/app_error');
const { suggestParts } = require('../services/gemini_service');

async function motorcycles(req, res, next) {
  try {
    const make = String(req.query.make || '').trim();
    const model = String(req.query.model || '').trim();
    const year = req.query.year ? Number(req.query.year) : null;

    if (!make && !model) {
      return next(new AppError('Please enter at least Make or Model.', 400, 'VALIDATION_ERROR'));
    }

    const suggestions = await suggestParts({ make, model, year });

    return res.status(200).json({
      ok: true,
      data: {
        bike: { make, model, year },
        suggestions,
      },
    });
  } catch (e) {
    console.error('[compat_controller] motorcycles failed:', e?.message || e);
    return res.status(200).json({
      ok: true,
      data: {
        bike: {
          make: String(req.query.make || '').trim(),
          model: String(req.query.model || '').trim(),
          year: req.query.year ? Number(req.query.year) : null,
        },
        suggestions: [],
      },
    });
  }
}
module.exports = { motorcycles };