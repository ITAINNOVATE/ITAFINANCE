-- Fix RLS to allow anon key access for ITA Finance Manager demo app
-- Run this in: https://supabase.com/dashboard/project/mfturgsjkjexqsbrsohq/sql/new

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
