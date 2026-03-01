/*
 * Carbon & Crimson IMS
 * File: src/config/db.js
 * Version: 1.0.0
 * Purpose: MongoDB connection helper.
 */

'use strict';

const mongoose = require('mongoose');
const { logger } = require('../utils/logger');

async function connectMongo(mongoUri) {
  if (!mongoUri) {
    throw new Error('MONGO_URI is required');
  }

  mongoose.set('strictQuery', true);

  await mongoose.connect(mongoUri, {
    autoIndex: true,
  });

  logger.info('MongoDB connected');
}

module.exports = { connectMongo };
