/*
 * MotoMart IMS
 * File: src/config/db.js
 * Version: 2.0.0
 * Purpose: Supabase connection helper.
 */

'use strict';

const { createClient } = require('@supabase/supabase-js');
const { logger } = require('../utils/logger');

let supabase = null;

async function connectDb() {
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    throw new Error('SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required');
  }

  supabase = createClient(supabaseUrl, supabaseKey);
  logger.info('Supabase client initialized');
}

function getDb() {
  if (!supabase) {
    throw new Error('Supabase client not initialized');
  }
  return supabase;
}

module.exports = { connectDb, getDb };
