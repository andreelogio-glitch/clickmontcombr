
-- Drop the overly permissive policy
DROP POLICY IF EXISTS "Profiles viewable by everyone" ON public.profiles;

-- Users can view their own profile
CREATE POLICY "Users view own profile"
ON public.profiles FOR SELECT
USING (auth.uid() = user_id);

-- Admins can view all profiles
CREATE POLICY "Admins view all profiles"
ON public.profiles FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

-- Order participants can see each other's profiles (client sees montador, montador sees client)
CREATE POLICY "Order participants view profiles"
ON public.profiles FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM orders o
    JOIN bids b ON b.order_id = o.id AND b.accepted = true
    WHERE
      (o.client_id = auth.uid() AND profiles.user_id = b.montador_id)
      OR
      (b.montador_id = auth.uid() AND profiles.user_id = o.client_id)
  )
);

-- Montadores can see limited profile of clients on pending orders they're bidding on
CREATE POLICY "Montadores see order client profiles"
ON public.profiles FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM orders o
    JOIN bids b ON b.order_id = o.id
    WHERE b.montador_id = auth.uid()
      AND profiles.user_id = o.client_id
  )
);
