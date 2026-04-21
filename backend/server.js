/*
 * MotoMart IMS
 * File: server.js
 * Version: 1.0.1
 * Purpose: Express server entry point (Render/Docker ready).
 *
 * Fixes:
 * - Loads .env early via dotenv so GEMINI_API_KEY and others work.
 */

'use strict';

// IMPORTANT: Load environment variables FIRST
require('dotenv').config();

const http = require('http');
const app = require('./src/app');
const { connectDb } = require('./src/config/db');
const { env } = require('./src/config/env');
const { seedDefaultUsers } = require('./src/seed/seed_users');
const { logger } = require('./src/utils/logger');

async function bootstrap() {
  await connectDb();

  const server = http.createServer(app);

  server.listen(env.PORT, () => {
    logger.info(`IMS API listening on :${env.PORT} (${env.NODE_ENV})`);
    logger.info(`CORS: ${env.CORS_ORIGIN}`);
    logger.info(`Gemini key loaded: ${Boolean(env.GEMINI_API_KEY && String(env.GEMINI_API_KEY).trim())}`);
  });

  const shutdown = async (signal) => {
    logger.warn(`Received ${signal}. Shutting down...`);
    server.close(() => process.exit(0));
  };

  process.on('SIGINT', () => shutdown('SIGINT'));
  process.on('SIGTERM', () => shutdown('SIGTERM'));
}

bootstrap().catch((err) => {
  // eslint-disable-next-line no-console
  console.error(err);
  process.exit(1);
});