import { createClient } from '@supabase/supabase-js';

// DEBUG: Hardcoding credentials to bypass injection issues
const supabaseUrl = 'https://eqqdjqdbbwmshllqesdt.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVxcWRqcWRiYndtc2hsbHFlc2R0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzYyMDEwMjcsImV4cCI6MjA5MTc3NzAyN30._DzQtFyU5Hz8trB1b86cxxHarmy5t35kZHdg2_2a4_o';

if (typeof window !== 'undefined') {
  console.log('--- SUPABASE CLIENT DIAGNOSTICS (HARDCODED) ---');
  console.log('URL:', supabaseUrl);
  console.log('Key Start:', supabaseAnonKey.substring(0, 10) + '...');
  console.log('------------------------------------');
}

export const PLATFORM_ID = '99ff8e98-b9b4-452c-a41e-35254e188472';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
