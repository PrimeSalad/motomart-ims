/*
 * Carbon & Crimson IMS
 * File: src/app.js
 * Version: 2.0.0
 * Purpose: Express app (SAFE routers + HARD CORS).
 */

'use strict';

const express = require('express');

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

/* JSON */
app.use(express.json());

/* Activity Logging (Global) */
app.use(activityLogger);

/* HARD CORS FIX */
const allowedOrigins = String(env.CORS_ORIGIN || 'http://localhost:5173')
  .split(',')
  .map(x => x.trim());

app.use((req, res, next) => {

  const origin = req.headers.origin;

  res.setHeader(
    'Access-Control-Allow-Headers',
    'Content-Type, Authorization'
  );

  res.setHeader(
    'Access-Control-Allow-Methods',
    'GET,POST,PUT,PATCH,DELETE,OPTIONS'
  );

  if (!origin) {
    if (req.method === 'OPTIONS')
      return res.sendStatus(204);

    return next();
  }

  if (allowedOrigins.includes(origin)) {

    res.setHeader(
      'Access-Control-Allow-Origin',
      origin
    );

    if (req.method === 'OPTIONS')
      return res.sendStatus(204);

    return next();
  }

  if (req.method === 'OPTIONS')
    return res.sendStatus(204);

  return res.status(403).json({
    ok:false
  });

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