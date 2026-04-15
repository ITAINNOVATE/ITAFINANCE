import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Supabase environment variables are missing!');
}

export const PLATFORM_ID = process.env.NEXT_PUBLIC_VITE_PLATFORM_ID || process.env.NEXT_PUBLIC_PLATFORM_ID;

export const supabase = createClient(supabaseUrl!, supabaseAnonKey!);

// Debug Log
console.log('Supabase Initialized for Platform:', PLATFORM_ID);
