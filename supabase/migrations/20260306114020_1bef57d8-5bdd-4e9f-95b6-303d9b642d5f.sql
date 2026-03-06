-- Harden and stabilize RLS for auth/profile/order flow
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles FORCE ROW LEVEL SECURITY;
ALTER TABLE public.orders FORCE ROW LEVEL SECURITY;

-- Remove recursive/overlapping policies
DROP POLICY IF EXISTS "Order participants view counterpart profile" ON public.profiles;
DROP POLICY IF EXISTS "Users view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users insert own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users delete own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admin full access profiles" ON public.profiles;

DROP POLICY IF EXISTS "Admin full access orders" ON public.orders;
DROP POLICY IF EXISTS "Clients create orders" ON public.orders;
DROP POLICY IF EXISTS "Clients delete pending orders" ON public.orders;
DROP POLICY IF EXISTS "Clients see own orders" ON public.orders;
DROP POLICY IF EXISTS "Clients update own orders" ON public.orders;
DROP POLICY IF EXISTS "Montadores see assigned orders" ON public.orders;
DROP POLICY IF EXISTS "Montadores see available orders" ON public.orders;
DROP POLICY IF EXISTS "Montadores update assigned orders" ON public.orders;

-- Profiles: secure + immediate access for new users
CREATE POLICY "Admin full access profiles"
ON public.profiles
FOR ALL
TO authenticated
USING (
  auth.uid() = 'e0dfa500-9d5e-408e-aa82-4de9168332dd'::uuid
  OR public.has_role(auth.uid(), 'admin'::public.app_role)
)
WITH CHECK (
  auth.uid() = 'e0dfa500-9d5e-408e-aa82-4de9168332dd'::uuid
  OR public.has_role(auth.uid(), 'admin'::public.app_role)
);

CREATE POLICY "Users select own profile"
ON public.profiles
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users insert own profile"
ON public.profiles
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users update own profile"
ON public.profiles
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users delete own profile"
ON public.profiles
FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- Orders: keep secure access with admin bypass
CREATE POLICY "Admin full access orders"
ON public.orders
FOR ALL
TO authenticated
USING (
  auth.uid() = 'e0dfa500-9d5e-408e-aa82-4de9168332dd'::uuid
  OR public.has_role(auth.uid(), 'admin'::public.app_role)
)
WITH CHECK (
  auth.uid() = 'e0dfa500-9d5e-408e-aa82-4de9168332dd'::uuid
  OR public.has_role(auth.uid(), 'admin'::public.app_role)
);

CREATE POLICY "Clients create orders"
ON public.orders
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = client_id);

CREATE POLICY "Clients see own orders"
ON public.orders
FOR SELECT
TO authenticated
USING (auth.uid() = client_id);

CREATE POLICY "Clients update own orders"
ON public.orders
FOR UPDATE
TO authenticated
USING (auth.uid() = client_id)
WITH CHECK (auth.uid() = client_id);

CREATE POLICY "Clients delete pending orders"
ON public.orders
FOR DELETE
TO authenticated
USING (auth.uid() = client_id AND status = 'pendente');

CREATE POLICY "Montadores see available orders"
ON public.orders
FOR SELECT
TO authenticated
USING (
  status = 'pendente'
  AND EXISTS (
    SELECT 1
    FROM public.profiles p
    WHERE p.user_id = auth.uid()
      AND p.role = 'montador'
      AND p.is_approved = true
  )
);

CREATE POLICY "Montadores see assigned orders"
ON public.orders
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM public.bids b
    WHERE b.order_id = orders.id
      AND b.montador_id = auth.uid()
      AND b.accepted = true
  )
);

CREATE POLICY "Montadores update assigned orders"
ON public.orders
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM public.bids b
    WHERE b.order_id = orders.id
      AND b.montador_id = auth.uid()
      AND b.accepted = true
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM public.bids b
    WHERE b.order_id = orders.id
      AND b.montador_id = auth.uid()
      AND b.accepted = true
  )
);

-- Keep profile creation function as SECURITY DEFINER and idempotent
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  IF NEW.id IS NULL THEN
    RETURN NEW;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM public.profiles p WHERE p.user_id = NEW.id
  ) THEN
    INSERT INTO public.profiles (user_id, full_name, role)
    VALUES (
      NEW.id,
      COALESCE(NEW.raw_user_meta_data->>'full_name', 'Usuario'),
      COALESCE(NEW.raw_user_meta_data->>'role', 'cliente')
    );
  END IF;

  RETURN NEW;
END;
$$;