-- Reset completo das políticas de RLS da tabela orders
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admin full access orders" ON public.orders;
DROP POLICY IF EXISTS "Clients create orders" ON public.orders;
DROP POLICY IF EXISTS "Clients delete pending orders" ON public.orders;
DROP POLICY IF EXISTS "Clients see own orders" ON public.orders;
DROP POLICY IF EXISTS "Clients update own orders" ON public.orders;
DROP POLICY IF EXISTS "Montadores see assigned orders" ON public.orders;
DROP POLICY IF EXISTS "Montadores see available orders" ON public.orders;
DROP POLICY IF EXISTS "Montadores update assigned orders" ON public.orders;

-- Preenchimento automático do client_id no INSERT
ALTER TABLE public.orders
  ALTER COLUMN client_id SET DEFAULT auth.uid();

CREATE OR REPLACE FUNCTION public.set_order_client_id()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.client_id IS NULL THEN
    NEW.client_id := auth.uid();
  END IF;

  IF NEW.client_id IS DISTINCT FROM auth.uid() THEN
    RAISE EXCEPTION 'client_id deve ser o usuário autenticado';
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_set_order_client_id ON public.orders;
CREATE TRIGGER trg_set_order_client_id
BEFORE INSERT ON public.orders
FOR EACH ROW
EXECUTE FUNCTION public.set_order_client_id();

-- Admin
CREATE POLICY "Admin full access orders"
ON public.orders
FOR ALL
TO authenticated
USING ((auth.uid() = 'e0dfa500-9d5e-408e-aa82-4de9168332dd'::uuid) OR public.has_role(auth.uid(), 'admin'::public.app_role))
WITH CHECK ((auth.uid() = 'e0dfa500-9d5e-408e-aa82-4de9168332dd'::uuid) OR public.has_role(auth.uid(), 'admin'::public.app_role));

-- Cliente: INSERT conforme solicitado
CREATE POLICY "Clients create orders"
ON public.orders
FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() IN (SELECT p.user_id FROM public.profiles p WHERE p.role = 'cliente')
  AND client_id = auth.uid()
  AND description IS NOT NULL
);

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

-- Montador: apenas visualização/atualização de pedidos permitidos
CREATE POLICY "Montadores see available orders"
ON public.orders
FOR SELECT
TO authenticated
USING (
  status IN ('pendente', 'pending', 'bidding')
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