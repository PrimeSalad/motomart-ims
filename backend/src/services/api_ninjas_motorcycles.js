/*
 * Carbon & Crimson IMS
 * File: src/services/api_ninjas_motorcycles.js
 * Version: 1.1.0
 * Purpose: API Ninjas Motorcycles API wrapper.
 *
 * Notes:
 * - This service is optional. If API_NINJAS_KEY is missing, returns empty results.
 */

'use strict';

const axios = require('axios');
const { geminiSearchMotorcycles } = require('./gemini_service');
const { env } = require('../config/env');

const BASE_URL = 'https://api.api-ninjas.com/v1/motorcycles';

async function searchMotorcycles({ make, model, year }) {
  const params = {};
  if (make) params.make = make;
  if (model) params.model = model;
  if (year) params.year = year;

  let ninjas = [];
  if (env.API_NINJAS_KEY) {
    try {
      const res = await axios.get(BASE_URL, {
        params,
        headers: { 'X-Api-Key': env.API_NINJAS_KEY },
        timeout: 10000,
      });
      ninjas = Array.isArray(res.data) ? res.data.map((b) => ({ ...b, source: 'api_ninjas' })) : [];
    } catch (_e) {
      ninjas = [];
    }
  }

  // Gemini fallback / enrichment (optional)
  const gemini = await geminiSearchMotorcycles({ make, model, year });

  // Merge uniques by make+model+year_from+year_to (case-insensitive)
  const out = [];
  const seen = new Set();

  const push = (b) => {
    const mk = String(b.make || '').toLowerCase();
    const md = String(b.model || '').toLowerCase();
    const yf = b.year_from == null ? '' : String(b.year_from);
    const yt = b.year_to == null ? '' : String(b.year_to);
    const key = `${mk}::${md}::${yf}::${yt}`;
    if (!mk || !md || seen.has(key)) return;
    seen.add(key);
    out.push(b);
  };

  for (const b of ninjas) push(b);
  for (const b of gemini) push(b);

  return out;
}


module.exports = { searchMotorcycles };
