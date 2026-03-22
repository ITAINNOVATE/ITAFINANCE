-- Script de correction de la structure de la base de données
-- Ce script ajuste les tables pour correspondre exactement aux besoins du code

-- 1. Correction de la table PROFILES
-- On ajoute les colonnes manquantes si elles n'existent pas
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='email') THEN
        ALTER TABLE public.profiles ADD COLUMN email TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='permissions') THEN
        ALTER TABLE public.profiles ADD COLUMN permissions TEXT[] DEFAULT '{}';
    END IF;

    -- Mise à jour du rôle par défaut si besoin
    ALTER TABLE public.profiles ALTER COLUMN role SET DEFAULT 'user';
END $$;

-- 2. Recréation de la table EXPENSES (Dépenses) pour avoir le bon format
-- On la supprime et on la recrée car la structure actuelle est incorrecte
DROP TABLE IF EXISTS public.expenses CASCADE;

CREATE TABLE public.expenses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    label TEXT NOT NULL,
    amount NUMERIC NOT NULL,
    category TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'paid')),
    planned_date DATE NOT NULL DEFAULT CURRENT_DATE,
    payment_date DATE,
    project_id UUID REFERENCES public.projects(id) ON DELETE SET NULL,
    reference TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Active RLS sur la nouvelle table expenses
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;

-- Polices RLS simples (accès total pour l'instant pour faciliter les tests)
CREATE POLICY "Tout le monde peut tout faire sur expenses" 
ON public.expenses FOR ALL 
USING (true) 
WITH CHECK (true);

-- 3. Mise à jour automatique de l'email dans profiles lors de la création d'un utilisateur
-- Trigger pour créer/mettre à jour le profil
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, role, permissions)
  VALUES (new.id, new.email, 'user', '{}')
  ON CONFLICT (id) DO UPDATE 
  SET email = EXCLUDED.email;
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- On s'assure que le trigger est bien en place
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 4. Initialisation du Super Admin (groupita25@gmail.com)
-- On s'assure qu'il a son profil avec les droits admin
-- Note: L'ID doit être récupéré de auth.users si possible, mais on peut le faire par email via une sous-requête
DO $$
DECLARE
    admin_id UUID;
BEGIN
    SELECT id INTO admin_id FROM auth.users WHERE email = 'groupita25@gmail.com' LIMIT 1;
    IF admin_id IS NOT NULL THEN
        INSERT INTO public.profiles (id, email, role, permissions)
        VALUES (admin_id, 'groupita25@gmail.com', 'admin', '{"clients","projects","paiements","echeanciers","depenses","rapports","admin"}')
        ON CONFLICT (id) DO UPDATE 
        SET role = 'admin', permissions = '{"clients","projects","paiements","echeanciers","depenses","rapports","admin"}', email = 'groupita25@gmail.com';
    END IF;
END $$;
