-- Table pour les dépenses
CREATE TABLE IF NOT EXISTS public.expenses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    label TEXT NOT NULL,
    amount NUMERIC(15, 2) NOT NULL,
    category TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'paid')),
    planned_date DATE NOT NULL DEFAULT CURRENT_DATE,
    payment_date DATE,
    project_id UUID REFERENCES public.projets(id) ON DELETE SET NULL,
    reference TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Activation de RLS
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;

-- Politiques RLS
-- Les utilisateurs authentifiés peuvent tout lire
CREATE POLICY "Les utilisateurs authentifiés peuvent voir les dépenses" 
ON public.expenses FOR SELECT 
TO authenticated 
USING (true);

-- Seuls les admins (ou les utilisateurs avec permission) peuvent modifier ?
-- Pour l'instant, on permet à tout utilisateur authentifié de modifier, on filtrera au niveau UI si besoin.
CREATE POLICY "Les utilisateurs authentifiés peuvent insérer des dépenses" 
ON public.expenses FOR INSERT 
TO authenticated 
WITH CHECK (true);

CREATE POLICY "Les utilisateurs authentifiés peuvent mettre à jour les dépenses" 
ON public.expenses FOR UPDATE 
TO authenticated 
USING (true)
WITH CHECK (true);

-- Trigger pour updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_expenses_updated_at
BEFORE UPDATE ON public.expenses
FOR EACH ROW
EXECUTE PROCEDURE update_updated_at_column();
