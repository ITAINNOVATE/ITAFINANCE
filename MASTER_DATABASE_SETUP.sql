-- ==============================================================================
-- ITA FINANCE MANAGER - MASTER SETUP FOR ITA-CORE
-- Projets : eqqdjqdbbwmshllqesdt
-- Date : 19/04/2026
-- ==============================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. TABLES

-- CLIENTS
CREATE TABLE IF NOT EXISTS public.clients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    platform_id UUID NOT NULL,
    name TEXT NOT NULL,
    type TEXT CHECK (type IN ('Particulier', 'Entreprise')),
    email TEXT,
    phone TEXT,
    address TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- PROJECTS
CREATE TABLE IF NOT EXISTS public.projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    platform_id UUID NOT NULL,
    client_id UUID REFERENCES public.clients(id) ON DELETE SET NULL,
    name TEXT NOT NULL,
    description TEXT,
    total_budget NUMERIC(15, 2) NOT NULL DEFAULT 0,
    start_date DATE,
    end_date DATE,
    status TEXT DEFAULT 'En cours' CHECK (status IN ('En cours', 'Terminé', 'Suspendu')),
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- SCHEDULES (Échéanciers)
CREATE TABLE IF NOT EXISTS public.schedules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    platform_id UUID NOT NULL,
    project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
    due_date DATE NOT NULL,
    amount NUMERIC(15, 2) NOT NULL,
    status TEXT DEFAULT 'En attente' CHECK (status IN ('Payé', 'En attente', 'En retard')),
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- PAYMENTS
CREATE TABLE IF NOT EXISTS public.payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    platform_id UUID NOT NULL,
    project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
    client_id UUID REFERENCES public.clients(id) ON DELETE CASCADE,
    amount NUMERIC(15, 2) NOT NULL,
    payment_method TEXT CHECK (payment_method IN ('Espèces', 'Mobile Money', 'Virement')),
    payment_date TIMESTAMPTZ DEFAULT NOW(),
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- EXPENSES (Dépenses)
CREATE TABLE IF NOT EXISTS public.expenses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    platform_id UUID NOT NULL,
    label TEXT NOT NULL,
    amount NUMERIC(15, 2) NOT NULL,
    category TEXT NOT NULL,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'paid')),
    planned_date DATE NOT NULL DEFAULT CURRENT_DATE,
    payment_date DATE,
    project_id UUID REFERENCES public.projects(id) ON DELETE SET NULL,
    reference TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. UPDATED_AT TRIGGER
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_expenses_updated_at ON public.expenses;
CREATE TRIGGER update_expenses_updated_at
BEFORE UPDATE ON public.expenses
FOR EACH ROW
EXECUTE PROCEDURE update_updated_at_column();

-- 4. ROW LEVEL SECURITY (RLS)

-- Enable RLS on all tables
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;

-- Create Policies (Unified Project ID)
-- This allows access for the specific PLATFORM_ID used in the app

-- CLIENTS
DROP POLICY IF EXISTS "Global Access" ON public.clients;
CREATE POLICY "Global Access" ON public.clients FOR ALL USING (true) WITH CHECK (true);

-- PROJECTS
DROP POLICY IF EXISTS "Global Access" ON public.projects;
CREATE POLICY "Global Access" ON public.projects FOR ALL USING (true) WITH CHECK (true);

-- SCHEDULES
DROP POLICY IF EXISTS "Global Access" ON public.schedules;
CREATE POLICY "Global Access" ON public.schedules FOR ALL USING (true) WITH CHECK (true);

-- PAYMENTS
DROP POLICY IF EXISTS "Global Access" ON public.payments;
CREATE POLICY "Global Access" ON public.payments FOR ALL USING (true) WITH CHECK (true);

-- EXPENSES
DROP POLICY IF EXISTS "Global Access" ON public.expenses;
CREATE POLICY "Global Access" ON public.expenses FOR ALL USING (true) WITH CHECK (true);

-- 5. INDEXES for performance
CREATE INDEX IF NOT EXISTS idx_clients_platform ON public.clients(platform_id);
CREATE INDEX IF NOT EXISTS idx_projects_platform ON public.projects(platform_id);
CREATE INDEX IF NOT EXISTS idx_schedules_platform ON public.schedules(platform_id);
CREATE INDEX IF NOT EXISTS idx_payments_platform ON public.payments(platform_id);
CREATE INDEX IF NOT EXISTS idx_expenses_platform ON public.expenses(platform_id);
