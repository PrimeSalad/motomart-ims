/*
 * Carbon & Crimson IMS
 * File: scripts/reset_admin.js
 * Version: 1.0.0
 * Purpose: Force-reset admin password.
 */

'use strict';

require('dotenv').config();
const mongoose = require('mongoose');
const {
    User
} = require('../src/models/user_model');

async function main() {

    const mongoUri = process.env.MONGO_URI || "mongodb://localhost:27017/ims_db";

    await mongoose.connect(mongoUri);

    const password_hash = await User.hashPassword("Admin#1234");

    await User.updateOne({
        email: "admin@ims.local"
    }, {
        $set: {
            name: "Admin",
            role: "admin",
            password_hash
        }
    }, {
        upsert: true
    });

    console.log("✅ Admin reset successful");
    console.log("Email: admin@ims.local");
    console.log("Password: Admin#1234");

    await mongoose.disconnect();
}

main().catch(err => {
    console.error(err);
    process.exit(1);
});