
-- Fix: profiles SELECT policies must be PERMISSIVE to grant access.
-- RESTRICTIVE-only policies always deny. Convert access-granting SELECT policies to PERMISSIVE.

-- Drop existing SELECT policies
DROP POLICY IF EXISTS "Users view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Order participants view profiles" ON public.profiles;
DROP POLICY IF EXISTS "Montadores see accepted-order client profiles" ON public.profiles;

-- Recreate as PERMISSIVE
CREATE POLICY "Users view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins view all profiles" ON public.profiles
  FOR SELECT USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Order participants view profiles" ON public.profiles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM orders o
      JOIN bids b ON b.order_id = o.id AND b.accepted = true
      WHERE (o.client_id = auth.uid() AND profiles.user_id = b.montador_id)
         OR (b.montador_id = auth.uid() AND profiles.user_id = o.client_id)
    )
  );

CREATE POLICY "Montadores see accepted-order client profiles" ON public.profiles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM orders o
      JOIN bids b ON b.order_id = o.id
      WHERE b.montador_id = auth.uid() AND b.accepted = true AND profiles.user_id = o.client_id
    )
  );

-- Also fix INSERT/UPDATE/DELETE to be PERMISSIVE
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
CREATE POLICY "Users can insert own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own profile (no is_approved)" ON public.profiles;
CREATE POLICY "Users can update own profile (no is_approved)" ON public.profiles
  FOR UPDATE USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id AND is_approved = (SELECT p.is_approved FROM profiles p WHERE p.user_id = auth.uid()));

DROP POLICY IF EXISTS "Admins update all profiles" ON public.profiles;
CREATE POLICY "Admins update all profiles" ON public.profiles
  FOR UPDATE USING (has_role(auth.uid(), 'admin'::app_role));

DROP POLICY IF EXISTS "Users can delete own profile" ON public.profiles;
CREATE POLICY "Users can delete own profile" ON public.profiles
  FOR DELETE USING (auth.uid() = user_id);
