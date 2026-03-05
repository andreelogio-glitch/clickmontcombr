
-- Force RLS on profiles and orders (idempotent)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles FORCE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders FORCE ROW LEVEL SECURITY;

-- Recreate profiles_safe view with security_invoker = true
-- This ensures RLS from profiles table is enforced when querying the view
DROP VIEW IF EXISTS public.profiles_safe;
CREATE VIEW public.profiles_safe
WITH (security_invoker = true)
AS
SELECT
  id,
  user_id,
  full_name,
  phone,
  role,
  city,
  is_approved,
  is_verified,
  created_at,
  CASE
    WHEN auth.uid() = user_id OR has_role(auth.uid(), 'admin'::app_role) THEN pix_key
    ELSE NULL
  END AS pix_key,
  CASE
    WHEN auth.uid() = user_id OR has_role(auth.uid(), 'admin'::app_role) THEN document_url
    ELSE NULL
  END AS document_url,
  CASE
    WHEN auth.uid() = user_id OR has_role(auth.uid(), 'admin'::app_role) THEN selfie_url
    ELSE NULL
  END AS selfie_url,
  CASE
    WHEN auth.uid() = user_id OR has_role(auth.uid(), 'admin'::app_role) THEN experience_proof_url
    ELSE NULL
  END AS experience_proof_url,
  CASE
    WHEN auth.uid() = user_id OR has_role(auth.uid(), 'admin'::app_role) THEN lgpd_accepted_at
    ELSE NULL
  END AS lgpd_accepted_at
FROM public.profiles;

-- Grant access to authenticated and anon roles
GRANT SELECT ON public.profiles_safe TO authenticated;
REVOKE ALL ON public.profiles_safe FROM anon;
