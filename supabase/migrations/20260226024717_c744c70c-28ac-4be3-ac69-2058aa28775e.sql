ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS verification_code text DEFAULT NULL;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS code_validated boolean DEFAULT false;