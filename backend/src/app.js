/*
 * MotoMart IMS
 * File: src/app.js
 * Version: 2.0.0
 * Purpose: Express app (SAFE routers + HARD CORS).
 */

'use strict';

const express = require('express');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

const { env } = require('./config/env');
const { logger } = require('./utils/logger');
const { activityLogger } = require('./middleware/activity_logger');
const { requireAuth } = require('./middleware/auth');

const { globalErrorHandler } = require('./middleware/global_error_handler');

/*
 SAFE ROUTER IMPORTS
 Works whether exported as:
 module.exports = router
 OR
 module.exports = { routerName }
*/

const authRoutes = require('./routes/auth_routes');
const inventoryRoutes = require('./routes/inventory_routes');
const analyticsRoutes = require('./routes/analytics_routes');
const compatRoutes = require('./routes/compat_routes');
const userRoutes = require('./routes/user_routes');
const activityRoutes = require('./routes/activity_routes');

const authRouter =
  authRoutes.authRouter || authRoutes;

const inventoryRouter =
  inventoryRoutes.inventoryRouter || inventoryRoutes;

const analyticsRouter =
  analyticsRoutes.analyticsRouter || analyticsRoutes;

const compatRouter =
  compatRoutes.compatRouter || compatRoutes;

const userRouter = userRoutes;
const activityRouter = activityRoutes;


const app = express();

/* Security Headers */
app.use(helmet({
  contentSecurityPolicy: false, // Allow frontend to load resources
  crossOriginEmbedderPolicy: false
}));

/* Rate Limiting */
const limiter = rateLimit({
  windowMs: Number(env.RATE_LIMIT_WINDOW_MS) || 60000,
  max: Number(env.RATE_LIMIT_MAX) || 120,
  message: { ok: false, error: { code: 'RATE_LIMIT', message: 'Too many requests' } },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api/', limiter);

/* JSON with size limit */
app.use(express.json({ limit: '10mb' }));

/* Activity Logging (Global) */
app.use(activityLogger);

/* CORS - Use environment variable */
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', env.CORS_ORIGIN);
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  
  next();
});


/* HEALTH */
app.get('/api/health',(req,res)=>{
  res.json({ok:true})
});


/* ROUTES */

app.use('/api/auth', authRouter);

app.use('/api/inventory', inventoryRouter);

app.use('/api/analytics', analyticsRouter);

app.use('/api/compat', compatRouter);

app.use('/api/users', userRouter);

app.use('/api/system', activityRouter);


/* ERROR */
app.use(globalErrorHandler);

module.exports = app;