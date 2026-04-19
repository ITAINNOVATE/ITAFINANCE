const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://eqqdjqdbbwmshllqesdt.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVxcWRqcWRiYndtc2hsbHFlc2R0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzYyMDEwMjcsImV4cCI6MjA5MTc3NzAyN30._DzQtFyU5Hz8trB1b86cxxHarmy5t35kZHdg2_2a4_o'
);

async function verify() {
  const tables = ['clients', 'projects', 'schedules', 'payments', 'expenses'];
  console.log('--- VÉRIFICATION DE LA STRUCTURE DE LA BASE ---');
  
  for (const table of tables) {
    const { data, error } = await supabase.from(table).select('count', { count: 'exact' }).limit(0);
    if (error) {
      console.log(`❌ Table "${table}" : ERREUR - ${error.message}`);
    } else {
      console.log(`✅ Table "${table}" : OK`);
    }
  }
  console.log('----------------------------------------------');
}

verify();
