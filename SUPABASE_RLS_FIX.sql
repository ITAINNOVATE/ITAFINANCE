-- ============================================================
-- ITA FINANCE MANAGER - Supabase RLS Fix
-- ============================================================
-- 
-- ACTION: Copy all the SQL below and run it in your Supabase 
-- SQL Editor at:
-- https://supabase.com/dashboard/project/mfturgsjkjexqsbrsohq/sql/new
-- 
-- This fixes the "Une erreur est survenue" error when creating
-- clients. It gives the app permission to write to the database.
-- ============================================================

-- Step 1: Remove old blocking policies
DROP POLICY IF EXISTS "Enable all for authenticated users" ON public.clients;
DROP POLICY IF EXISTS "Public access for demo" ON public.clients;
DROP POLICY IF EXISTS "anon_full_access" ON public.clients;
DROP POLICY IF EXISTS "auth_full_access" ON public.clients;

-- Step 2: Allow anonymous users (app without login) to read/write
CREATE POLICY "anon_full_access" ON public.clients
  FOR ALL
  TO anon
  USING (true)
  WITH CHECK (true);

-- Step 3: Allow authenticated users to read/write
CREATE POLICY "auth_full_access" ON public.clients
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- ============================================================
-- After running this SQL, reload the page and try again!
-- ============================================================
