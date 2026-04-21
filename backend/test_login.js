// Test script para i-verify ang login
require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const bcrypt = require('bcryptjs');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function testLogin() {
  console.log('=== TESTING LOGIN ===\n');
  
  // 1. Check connection
  console.log('1. Supabase URL:', process.env.SUPABASE_URL);
  console.log('2. Service Key:', process.env.SUPABASE_SERVICE_ROLE_KEY?.substring(0, 20) + '...\n');
  
  // 2. Try to fetch user
  const email = 'matiningmj850@gmail.com';
  console.log('3. Searching for user:', email);
  
  const { data: user, error } = await supabase
    .from('users')
    .select('*')
    .eq('email', email)
    .single();
  
  if (error) {
    console.error('❌ ERROR fetching user:', error.message);
    return;
  }
  
  if (!user) {
    console.error('❌ User not found in database!');
    return;
  }
  
  console.log('✅ User found!');
  console.log('   - Email:', user.email);
  console.log('   - Name:', user.full_name);
  console.log('   - Role:', user.role);
  console.log('   - Active:', user.is_active);
  console.log('   - Password hash:', user.password_hash?.substring(0, 30) + '...\n');
  
  // 3. Test password
  const testPassword = 'Admin#1234';
  console.log('4. Testing password:', testPassword);
  
  const isMatch = await bcrypt.compare(testPassword, user.password_hash);
  
  if (isMatch) {
    console.log('✅ Password MATCH! Login should work!\n');
  } else {
    console.log('❌ Password DOES NOT MATCH!');
    console.log('   The password hash in database is incorrect.\n');
    
    // Generate correct hash
    console.log('5. Generating correct password hash...');
    const correctHash = await bcrypt.hash(testPassword, 12);
    console.log('   Correct hash:', correctHash);
    console.log('\n6. Run this SQL to fix:');
    console.log(`   UPDATE users SET password_hash = '${correctHash}' WHERE email = '${email}';\n`);
  }
}

testLogin().catch(console.error);
