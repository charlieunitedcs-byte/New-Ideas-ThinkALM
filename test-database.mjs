#!/usr/bin/env node

/**
 * Database Connection Test
 * Tests if Supabase is properly configured and tables exist
 */

import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));

// Load environment variables
config({ path: join(__dirname, '.env.local') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

console.log('\n🧪 Testing Supabase Database Connection...\n');

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY not found in .env.local');
  console.error('   Please add these values to your .env.local file\n');
  process.exit(1);
}

console.log('✅ Environment variables loaded');
console.log(`   URL: ${supabaseUrl}`);
console.log(`   Key: ${supabaseKey.substring(0, 20)}...`);
console.log('');

// Create Supabase client
const supabase = createClient(supabaseUrl, supabaseKey);

async function testDatabase() {
  try {
    // Test 1: Check users table
    console.log('📋 Test 1: Checking users table...');
    const { data: usersData, error: usersError } = await supabase
      .from('users')
      .select('count')
      .limit(1);

    if (usersError) {
      console.error('   ❌ Users table error:', usersError.message);
      return false;
    }
    console.log('   ✅ Users table exists');

    // Test 2: Check calls table
    console.log('📋 Test 2: Checking calls table...');
    const { data: callsData, error: callsError } = await supabase
      .from('calls')
      .select('count')
      .limit(1);

    if (callsError) {
      console.error('   ❌ Calls table error:', callsError.message);
      return false;
    }
    console.log('   ✅ Calls table exists');

    // Test 3: Check clients table
    console.log('📋 Test 3: Checking clients table...');
    const { data: clientsData, error: clientsError } = await supabase
      .from('clients')
      .select('count')
      .limit(1);

    if (clientsError) {
      console.error('   ❌ Clients table error:', clientsError.message);
      return false;
    }
    console.log('   ✅ Clients table exists');

    // Test 4: Check campaigns table
    console.log('📋 Test 4: Checking campaigns table...');
    const { data: campaignsData, error: campaignsError } = await supabase
      .from('campaigns')
      .select('count')
      .limit(1);

    if (campaignsError) {
      console.error('   ❌ Campaigns table error:', campaignsError.message);
      return false;
    }
    console.log('   ✅ Campaigns table exists');

    // Test 5: Count records
    console.log('\n📊 Current Database Records:');

    const { count: userCount } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true });
    console.log(`   Users: ${userCount || 0}`);

    const { count: callCount } = await supabase
      .from('calls')
      .select('*', { count: 'exact', head: true });
    console.log(`   Calls: ${callCount || 0}`);

    const { count: clientCount } = await supabase
      .from('clients')
      .select('*', { count: 'exact', head: true });
    console.log(`   Clients: ${clientCount || 0}`);

    const { count: campaignCount } = await supabase
      .from('campaigns')
      .select('*', { count: 'exact', head: true });
    console.log(`   Campaigns: ${campaignCount || 0}`);

    console.log('\n✅ All tests passed! Database is working correctly.\n');
    console.log('🎉 You can now:');
    console.log('   1. Open http://localhost:3001 in your browser');
    console.log('   2. Sign up for a new account');
    console.log('   3. Analyze a call');
    console.log('   4. Check Supabase Table Editor to see the data!\n');

    return true;

  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    return false;
  }
}

// Run tests
testDatabase().then(success => {
  process.exit(success ? 0 : 1);
});
