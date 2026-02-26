ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS started_at timestamp with time zone DEFAULT NULL;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS montador_arrived boolean DEFAULT false;