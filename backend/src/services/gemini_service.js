/*
 * Carbon & Crimson IMS
 * File: src/services/gemini_service.js
 * Version: 2.5.1
 * Purpose: Gemini AI parts suggestions BASED ONLY on DB inventory (whitelist) + fail-safe.
 *
 * Key behavior:
 * - Fetch candidate items from inventory
 * - Ask Gemini to choose ONLY from provided list
 * - Server-side enforcement: return only items existing in DB list
 */

'use strict';

const axios = require('axios');
const { env } = require('../config/env');
const {
  findCandidateInventoryItems,
  buildWhitelist,
  norm,
} = require('../repositories/inventory_repo');

const API_ROOT = 'https://generativelanguage.googleapis.com/v1beta';
const TIMEOUT_MS = 20000;

let cachedModelId = null;
let cachedModelLogged = false;

function enabled() {
  return Boolean(env.GEMINI_API_KEY && String(env.GEMINI_API_KEY).trim());
}

function apiKey() {
  return String(env.GEMINI_API_KEY || '').trim();
}

function modelFromEnv() {
  return String(env.GEMINI_MODEL || '').trim();
}

function extractText(resp) {
  const parts = resp?.data?.candidates?.[0]?.content?.parts;
  if (!Array.isArray(parts)) return '';
  return parts.map((p) => p?.text).filter(Boolean).join('\n');
}

function safeJsonParse(text) {
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

function pickJsonBlock(text) {
  const t = String(text || '').trim();
  const obj = t.match(/\{[\s\S]*\}/);
  if (obj) return obj[0];
  const arr = t.match(/\[[\s\S]*\]/);
  if (arr) return arr[0];
  return null;
}

function normalizeParts(parsed) {
  // Expect { parts: [ { inventory_id, name, note } ] }
  const raw = Array.isArray(parsed?.parts) ? parsed.parts : [];
  return raw
    .map((p) => ({
      inventory_id: String(p?.inventory_id || '').trim(),
      name: String(p?.name || '').trim(),
      note: p?.note == null ? null : String(p.note),
    }))
    .filter((p) => p.inventory_id || p.name)
    .slice(0, 12);
}

function stripModelsPrefix(name) {
  const s = String(name || '').trim();
  if (!s) return null;
  return s.startsWith('models/') ? s.slice('models/'.length) : s;
}

function scoreModel(id) {
  const s = String(id || '').toLowerCase();
  let score = 0;
  if (s.includes('flash')) score += 100;
  if (s.includes('lite')) score += 10;
  if (s.includes('pro')) score += 60;
  if (s.includes('2.5')) score += 25;
  if (s.includes('2.0')) score += 15;
  if (s.includes('1.5')) score += 5;
  return score;
}

async function listModels() {
  const url = `${API_ROOT}/models?key=${encodeURIComponent(apiKey())}`;
  const resp = await axios.get(url, { timeout: TIMEOUT_MS });
  return Array.isArray(resp?.data?.models) ? resp.data.models : [];
}

async function detectModelId() {
  if (cachedModelId) return cachedModelId;

  const envModel = modelFromEnv();
  if (envModel) {
    cachedModelId = envModel;
    return cachedModelId;
  }

  try {
    const models = await listModels();
    const candidates = models
      .map((m) => {
        const id = stripModelsPrefix(m?.name);
        const methods = Array.isArray(m?.supportedGenerationMethods)
          ? m.supportedGenerationMethods
          : [];
        return { id, methods };
      })
      .filter((m) => m.id && m.methods.includes('generateContent'))
      .sort((a, b) => scoreModel(b.id) - scoreModel(a.id));

    if (candidates.length === 0) {
      console.error('[gemini_service] No available models support generateContent for this API key.');
      return null;
    }

    cachedModelId = candidates[0].id;

    if (!cachedModelLogged) {
      cachedModelLogged = true;
      console.log(`[INFO] Gemini model auto-detected: ${cachedModelId}`);
      console.log(`[INFO] (Optional) Put this in backend .env for faster startup: GEMINI_MODEL=${cachedModelId}`);
    }

    return cachedModelId;
  } catch (e) {
    console.error('[gemini_service] ListModels failed:', e?.response?.data || e?.message || e);
    return null;
  }
}

async function generateContent(modelId, prompt) {
  const url = `${API_ROOT}/models/${modelId}:generateContent?key=${encodeURIComponent(apiKey())}`;

  const resp = await axios.post(
    url,
    {
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: { temperature: 0.2, maxOutputTokens: 512 },
    },
    { timeout: TIMEOUT_MS }
  );

  const text = extractText(resp);
  if (!text) return [];

  const direct = safeJsonParse(text);
  if (direct) return normalizeParts(direct);

  const block = pickJsonBlock(text);
  const parsed = safeJsonParse(block || '');
  if (parsed) return normalizeParts(parsed);

  return [];
}

/**
 * Enforce "DB-only" output:
 * - Prefer match by inventory_id
 * - Fallback match by normalized name
 */
function enforceWhitelist(aiParts, whitelist) {
  const out = [];

  for (const p of aiParts) {
    let item = null;

    if (p.inventory_id) item = whitelist.byId.get(String(p.inventory_id));
    if (!item && p.name) item = whitelist.byName.get(norm(p.name));

    if (!item) continue;

    out.push({
      inventory_id: String(item._id),
      name: item.name,
      note: p.note || null,
      sku: item.sku || null,
      brand: item.brand || null,
      category: item.category || null,
      available_qty: typeof item.quantity === 'number' ? item.quantity : null,
    });

    if (out.length >= 12) break;
  }

  return out;
}

async function suggestParts({ make, model, year }) {
  if (!enabled()) return [];

  const modelId = await detectModelId();
  if (!modelId) return [];

  // 1) Load inventory candidates from DB
  let candidates = [];
  try {
    candidates = await findCandidateInventoryItems({ make, model, year });
  } catch (e) {
    console.error('[gemini_service] inventory fetch failed:', e?.message || e);
    return [];
  }

  if (!Array.isArray(candidates) || candidates.length === 0) return [];

  const whitelist = buildWhitelist(candidates);

  // 2) Build an "available items list" for Gemini
  const availableList = candidates
    .slice(0, 120)
    .map((it) => {
      const id = String(it._id);
      const name = String(it.name || '').trim();
      const brand = String(it.brand || '').trim();
      const cat = String(it.category || '').trim();
      const sku = String(it.sku || '').trim();
      return `- id: ${id} | name: ${name}${brand ? ` | brand: ${brand}` : ''}${cat ? ` | category: ${cat}` : ''}${sku ? ` | sku: ${sku}` : ''}`;
    })
    .join('\n');

  // 3) Prompt: pick ONLY from whitelist
  const prompt = [
    'Return ONLY valid JSON. No markdown. No explanation.',
    '',
    'Task:',
    'Select up to 12 suggested motorcycle parts ONLY from the AVAILABLE INVENTORY LIST below.',
    'Do not invent items. Do not output anything not listed.',
    '',
    'Bike:',
    `make: ${make || '(unknown)'}`,
    `model: ${model || '(unknown)'}`,
    `year: ${year || '(unknown)'}`,
    '',
    'AVAILABLE INVENTORY LIST:',
    availableList,
    '',
    'Output JSON schema (strict):',
    '{ "parts": [ { "inventory_id": string, "name": string, "note": string|null } ] }',
    '',
    'Rules:',
    '- Every part MUST match an item from the AVAILABLE INVENTORY LIST.',
    '- Use the exact id in inventory_id from the list.',
    '- name should match the listed name (minor formatting ok).',
    '- note is short reason / fitment note.',
    '- Max 12.',
  ].join('\n');

  try {
    const aiRaw = await generateContent(modelId, prompt);

    // 4) Hard enforce: keep only DB items
    return enforceWhitelist(aiRaw, whitelist);
  } catch (e) {
    console.error('[gemini_service] suggestParts failed:', e?.response?.data || e?.message || e);
    return [];
  }
}

module.exports = { enabled, suggestParts };