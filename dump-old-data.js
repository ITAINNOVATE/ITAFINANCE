const { createClient } = require('@supabase/supabase-js');

const OLD_URL = 'https://mfturgsjkjexqsbrsohq.supabase.co';
const OLD_KEY = 'sb_publishable_llVwifFtZGGlOYJwK_Qtgw_PhlCRWEr';

const supabase = createClient(OLD_URL, OLD_KEY);

async function dump() {
  const tables = ['clients', 'projects', 'payments', 'schedules', 'expenses'];
  const results = {};

  for (const table of tables) {
    console.log(`Fetching ${table}...`);
    const { data, error } = await supabase.from(table).select('*');
    if (error) {
      console.error(`Error fetching ${table}:`, error.message);
    } else {
      results[table] = data;
      console.log(`Fetched ${data.length} rows from ${table}`);
    }
  }

  console.log('--- DUMP START ---');
  console.log(JSON.stringify(results, null, 2));
  console.log('--- DUMP END ---');
}

dump().catch(console.error);
