import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_VITE_SUPABASE_ANON_KEY;

if (typeof window !== 'undefined') {
  console.log('--- SUPABASE CLIENT DIAGNOSTICS ---');
  console.log('URL:', supabaseUrl || 'MISSING');
  console.log('Key Start:', supabaseAnonKey ? supabaseAnonKey.substring(0, 10) + '...' : 'MISSING');
  console.log('------------------------------------');
}

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Supabase environment variables are missing!');
}

export const PLATFORM_ID = (process.env.NEXT_PUBLIC_VITE_PLATFORM_ID || process.env.NEXT_PUBLIC_PLATFORM_ID || '99ff8e98-b9b4-452c-a41e-35254e188472') as string;

export const supabase = createClient(supabaseUrl!, supabaseAnonKey!);
