-- Enable RLS on profiles and orders tables (policies already exist but RLS was never enabled)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;