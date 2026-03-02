/*
 * Carbon & Crimson IMS
 * File: src/routes/compat_routes.js
 * Version: 1.1.0
 * Purpose: Compatibility / Suggestions routes.
 *
 * Notes:
 * - /motorcycles is PUBLIC for easy testing in browser
 */

'use strict';

const express = require('express');
const { motorcycles } = require('../controllers/compat_controller');


const router = express.Router();

// PUBLIC endpoint (no token required)
router.get('/motorcycles', motorcycles);

module.exports = router;