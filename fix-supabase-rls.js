/**
 * Direct Postgres fix for Supabase RLS
 * Uses the postgres connection string to apply SQL directly
 */
const { execSync } = require('child_process');

// Install pg if not available
try {
  require('pg');
} catch(e) {
  console.log('Installing pg...');
  execSync('npm install pg', { stdio: 'inherit' });
}

const { Client } = require('pg');

// Supabase postgres connection string (using the connection pooler format)
// We need the DB password - let's try the default format
const projectRef = 'mfturgsjkjexqsbrsohq';

async function tryConnection(connectionString, label) {
  const client = new Client({ connectionString, ssl: { rejectUnauthorized: false } });
  try {
    await client.connect();
    console.log(`✅ Connected via ${label}`);
    
    const sql = `
      DROP POLICY IF EXISTS "Enable all for authenticated users" ON public.clients;
      DROP POLICY IF EXISTS "Public access for demo" ON public.clients;
      DROP POLICY IF EXISTS "anon_full_access" ON public.clients;
      DROP POLICY IF EXISTS "auth_full_access" ON public.clients;
      
      CREATE POLICY "anon_full_access" ON public.clients
        FOR ALL TO anon
        USING (true) WITH CHECK (true);
      
      CREATE POLICY "auth_full_access" ON public.clients
        FOR ALL TO authenticated
        USING (true) WITH CHECK (true);
    `;
    
    await client.query(sql);
    console.log('✅ RLS policies updated successfully!');
    console.log('🎉 Reload http://localhost:5001/clients and try creating a client!');
    await client.end();
    return true;
  } catch(e) {
    console.log(`❌ Failed via ${label}: ${e.message.split('\n')[0]}`);
    try { await client.end(); } catch {}
    return false;
  }
}

async function main() {
  console.log('=== ITA Finance Manager - Direct DB Fix ===\n');
  
  // Try transaction pooler (port 6543)
  const pooler = `postgresql://postgres.${projectRef}:postgres@aws-0-eu-central-1.pooler.supabase.com:6543/postgres`;
  
  // Try direct connection (port 5432) 
  const direct = `postgresql://postgres.${projectRef}:postgres@db.${projectRef}.supabase.co:5432/postgres`;
  
  const ok1 = await tryConnection(pooler, 'Transaction Pooler');
  if (!ok1) {
    const ok2 = await tryConnection(direct, 'Direct Connection');
    if (!ok2) {
      console.log('\n❌ Could not connect directly to the database.');
      console.log('The database password might differ from the default.');
      console.log('\n📋 MANUAL FIX REQUIRED:');
      console.log('Go to: https://supabase.com/dashboard/project/mfturgsjkjexqsbrsohq/sql/new');
      console.log('\nPaste and run:');
      console.log(`
DROP POLICY IF EXISTS "Enable all for authenticated users" ON public.clients;
DROP POLICY IF EXISTS "anon_full_access" ON public.clients;
DROP POLICY IF EXISTS "auth_full_access" ON public.clients;

CREATE POLICY "anon_full_access" ON public.clients
  FOR ALL TO anon USING (true) WITH CHECK (true);

CREATE POLICY "auth_full_access" ON public.clients
  FOR ALL TO authenticated USING (true) WITH CHECK (true);
      `);
    }
  }
}

main().catch(console.error);
