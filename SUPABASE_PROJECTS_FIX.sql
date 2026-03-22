-- ITA Finance Manager - Projects Table RLS Fix
-- Run this AFTER the SUPABASE_RLS_FIX.sql (clients fix)
-- URL: https://supabase.com/dashboard/project/mfturgsjkjexqsbrsohq/sql/new

-- Create projects table if not exists
CREATE TABLE IF NOT EXISTS projects (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id UUID REFERENCES clients(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  description TEXT,
  total_budget NUMERIC NOT NULL DEFAULT 0,
  start_date DATE,
  end_date DATE,
  status TEXT DEFAULT 'En cours' CHECK (status IN ('En cours', 'Terminé', 'Suspendu')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

-- Drop old policies
DROP POLICY IF EXISTS "Enable all for authenticated users" ON public.projects;
DROP POLICY IF EXISTS "anon_full_access" ON public.projects;
DROP POLICY IF EXISTS "auth_full_access" ON public.projects;

-- Allow full access for anon key (demo app)
CREATE POLICY "anon_full_access" ON public.projects
  FOR ALL TO anon USING (true) WITH CHECK (true);

CREATE POLICY "auth_full_access" ON public.projects
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Also create payments table if not exists (needed for project progress)
CREATE TABLE IF NOT EXISTS payments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
  amount NUMERIC NOT NULL,
  payment_method TEXT CHECK (payment_method IN ('Espèces', 'Mobile Money', 'Virement')),
  payment_date TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Enable all for authenticated users" ON public.payments;
DROP POLICY IF EXISTS "anon_full_access" ON public.payments;
DROP POLICY IF EXISTS "auth_full_access" ON public.payments;
CREATE POLICY "anon_full_access" ON public.payments FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "auth_full_access" ON public.payments FOR ALL TO authenticated USING (true) WITH CHECK (true);
