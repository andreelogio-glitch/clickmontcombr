
-- Add montador stats columns to profiles
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS balance numeric NOT NULL DEFAULT 0,
ADD COLUMN IF NOT EXISTS total_services integer NOT NULL DEFAULT 0,
ADD COLUMN IF NOT EXISTS rating numeric DEFAULT NULL;
