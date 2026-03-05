
-- =============================================
-- PROFILES: Drop all existing policies
-- =============================================
DROP POLICY IF EXISTS "Admins update all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Montadores see accepted-order client profiles" ON public.profiles;
DROP POLICY IF EXISTS "Order participants view profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can delete own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users view own profile" ON public.profiles;

-- Admin bypass (hardcoded UID + role check)
CREATE POLICY "Admin full access profiles"
  ON public.profiles FOR ALL TO authenticated
  USING (
    auth.uid() = 'e0dfa500-9d5e-408e-aa82-4de9168332dd'::uuid
    OR has_role(auth.uid(), 'admin'::app_role)
  )
  WITH CHECK (
    auth.uid() = 'e0dfa500-9d5e-408e-aa82-4de9168332dd'::uuid
    OR has_role(auth.uid(), 'admin'::app_role)
  );

-- Users read own profile
CREATE POLICY "Users view own profile"
  ON public.profiles FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

-- Users insert own profile
CREATE POLICY "Users insert own profile"
  ON public.profiles FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Users update own profile
CREATE POLICY "Users update own profile"
  ON public.profiles FOR UPDATE TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Users delete own profile
CREATE POLICY "Users delete own profile"
  ON public.profiles FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

-- Order participants can view counterpart profile (only with accepted bid)
CREATE POLICY "Order participants view counterpart profile"
  ON public.profiles FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM orders o
      JOIN bids b ON b.order_id = o.id AND b.accepted = true
      WHERE (
        (o.client_id = auth.uid() AND profiles.user_id = b.montador_id)
        OR
        (b.montador_id = auth.uid() AND profiles.user_id = o.client_id)
      )
    )
  );

-- =============================================
-- ORDERS: Drop all existing policies
-- =============================================
DROP POLICY IF EXISTS "Admins see all orders" ON public.orders;
DROP POLICY IF EXISTS "Admins update all orders" ON public.orders;
DROP POLICY IF EXISTS "Clients can delete pending orders" ON public.orders;
DROP POLICY IF EXISTS "Clients create orders" ON public.orders;
DROP POLICY IF EXISTS "Clients see own orders" ON public.orders;
DROP POLICY IF EXISTS "Clients update own orders" ON public.orders;
DROP POLICY IF EXISTS "Montadores see orders" ON public.orders;
DROP POLICY IF EXISTS "Montadores update orders with accepted bids" ON public.orders;

-- Admin bypass (hardcoded UID + role check)
CREATE POLICY "Admin full access orders"
  ON public.orders FOR ALL TO authenticated
  USING (
    auth.uid() = 'e0dfa500-9d5e-408e-aa82-4de9168332dd'::uuid
    OR has_role(auth.uid(), 'admin'::app_role)
  )
  WITH CHECK (
    auth.uid() = 'e0dfa500-9d5e-408e-aa82-4de9168332dd'::uuid
    OR has_role(auth.uid(), 'admin'::app_role)
  );

-- Clients see own orders
CREATE POLICY "Clients see own orders"
  ON public.orders FOR SELECT TO authenticated
  USING (auth.uid() = client_id);

-- Clients create orders
CREATE POLICY "Clients create orders"
  ON public.orders FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = client_id);

-- Clients update own orders
CREATE POLICY "Clients update own orders"
  ON public.orders FOR UPDATE TO authenticated
  USING (auth.uid() = client_id);

-- Clients delete pending orders
CREATE POLICY "Clients delete pending orders"
  ON public.orders FOR DELETE TO authenticated
  USING (auth.uid() = client_id AND status = 'pendente');

-- Montadores see available orders (pendente only, approved montadores)
CREATE POLICY "Montadores see available orders"
  ON public.orders FOR SELECT TO authenticated
  USING (
    status = 'pendente'
    AND EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.user_id = auth.uid()
        AND profiles.role = 'montador'
        AND profiles.is_approved = true
    )
  );

-- Montadores see assigned orders (accepted bid)
CREATE POLICY "Montadores see assigned orders"
  ON public.orders FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM bids
      WHERE bids.order_id = orders.id
        AND bids.montador_id = auth.uid()
        AND bids.accepted = true
    )
  );

-- Montadores update assigned orders
CREATE POLICY "Montadores update assigned orders"
  ON public.orders FOR UPDATE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM bids
      WHERE bids.order_id = orders.id
        AND bids.montador_id = auth.uid()
        AND bids.accepted = true
    )
  );
