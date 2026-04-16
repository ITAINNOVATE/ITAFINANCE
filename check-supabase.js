const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://eqqdjqdbbwmshllqesdt.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVxcWRqcWRiYndtc2hsbHFlc2R0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzYyMDEwMjcsImV4cCI6MjA5MTc3NzAyN30._DzQtFyU5Hz8trB1b86cxxHarmy5t35kZHdg2_2a4_o'
);

async function main() {
  console.log('Checking Supabase connection...');
  const { data, error } = await supabase.from('clients').select('id').limit(1);
  
  if (error) {
    console.log('Error code:', error.code);
    console.log('Error message:', error.message);
    console.log('Error details:', error.details);
    console.log('\nThe table may not exist or RLS is blocking access.');
    console.log('Please create the table manually in the Supabase Dashboard:');
    console.log('https://supabase.com/dashboard/project/mfturgsjkjexqsbrsohq/sql/new');
    console.log('\nSQL to run:');
    console.log(`
CREATE TABLE IF NOT EXISTS clients (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT CHECK (type IN ('Particulier', 'Entreprise')),
  email TEXT,
  phone TEXT,
  address TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE clients ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Enable all for authenticated users" ON clients;
DROP POLICY IF EXISTS "Public access for demo" ON clients;

CREATE POLICY "Public access for demo" ON clients FOR ALL USING (true) WITH CHECK (true);
    `);
  } else {
    console.log('SUCCESS! Supabase clients table is accessible.');
    console.log('Current rows:', data.length);
  }
}

main().catch(console.error);
