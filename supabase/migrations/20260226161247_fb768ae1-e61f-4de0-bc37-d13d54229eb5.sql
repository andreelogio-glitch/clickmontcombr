-- Remove the public profiles policy if it exists
DROP POLICY IF EXISTS "Profiles viewable by everyone" ON public.profiles;

-- Restrict is_approved updates to admin only
-- First drop existing update policy and recreate with restriction
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;

CREATE POLICY "Users can update own profile (no is_approved)"
ON public.profiles FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (
  auth.uid() = user_id
  AND (
    -- If is_approved is being changed, block it (only admin can)
    is_approved = (SELECT p.is_approved FROM public.profiles p WHERE p.user_id = auth.uid())
  )
);

-- Admin can update any profile including is_approved
DROP POLICY IF EXISTS "Admins update all profiles" ON public.profiles;
CREATE POLICY "Admins update all profiles"
ON public.profiles FOR UPDATE
USING (has_role(auth.uid(), 'admin'::app_role));