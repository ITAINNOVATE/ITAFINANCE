-- Script de correction de la table PAYMENTS
-- Ajoute le support des chèques et des détails de transaction (banque, ID, etc.)

-- 1. Mise à jour de la contrainte sur la méthode de paiement
ALTER TABLE public.payments DROP CONSTRAINT IF EXISTS payments_payment_method_check;
ALTER TABLE public.payments ADD CONSTRAINT payments_payment_method_check 
  CHECK (payment_method IN ('Espèces', 'Mobile Money', 'Virement', 'Chèque'));

-- 2. Ajout des colonnes de détails de transaction si elles n'existent pas
ALTER TABLE public.payments 
  ADD COLUMN IF NOT EXISTS transaction_id TEXT,
  ADD COLUMN IF NOT EXISTS bank_name TEXT,
  ADD COLUMN IF NOT EXISTS reference_number TEXT;

-- 3. (Optionnel) Mise à jour de la table expenses pour la cohérence
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='expenses' AND column_name='payment_method') THEN
        ALTER TABLE public.expenses ADD COLUMN payment_method TEXT CHECK (payment_method IN ('Espèces', 'Mobile Money', 'Virement', 'Chèque'));
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='expenses' AND column_name='transaction_id') THEN
        ALTER TABLE public.expenses ADD COLUMN transaction_id TEXT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='expenses' AND column_name='bank_name') THEN
        ALTER TABLE public.expenses ADD COLUMN bank_name TEXT;
    END IF;
END $$;
