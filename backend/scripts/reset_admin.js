/*
 * MotoMart IMS
 * File: scripts/reset_admin.js
 * Version: 2.0.0
 * Purpose: Force-reset admin password (Supabase).
 */

'use strict';
require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const bcrypt = require('bcryptjs');

async function main() {
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseKey) {
      throw new Error('SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required in .env');
    }

    const supabase = createClient(supabaseUrl, supabaseKey);
    const password_hash = await bcrypt.hash("Admin#1234", 10);
    const email = "admin@ims.local";

    const { data: existing } = await supabase.from('users').select('id').eq('email', email).single();

    if (existing) {
      await supabase.from('users').update({ full_name: "Admin", role: "super_admin", password_hash }).eq('id', existing.id);
    } else {
      await supabase.from('users').insert({ email, full_name: "Admin", role: "super_admin", password_hash });
    }

    console.log("✅ Admin reset successful");
    console.log("Email: admin@ims.local");
    console.log("Password: Admin#1234");
    console.log("Role: super_admin");
}

main().catch(err => {
    console.error(err);
    process.exit(1);
});