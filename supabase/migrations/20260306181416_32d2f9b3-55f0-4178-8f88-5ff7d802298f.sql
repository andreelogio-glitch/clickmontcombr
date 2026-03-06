-- 1) Função helper sem recursão para validar montador aceito
CREATE OR REPLACE FUNCTION public.is_accepted_montador_for_order(_order_id uuid, _user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.bids b
    WHERE b.order_id = _order_id
      AND b.montador_id = _user_id
      AND b.accepted = true
  );
$$;

REVOKE ALL ON FUNCTION public.is_accepted_montador_for_order(uuid, uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.is_accepted_montador_for_order(uuid, uuid) TO authenticated;

-- 2) Remover políticas recursivas e recriar sem depender de subquery que volta para orders via bids policies
DROP POLICY IF EXISTS "Montadores see assigned orders" ON public.orders;
DROP POLICY IF EXISTS "Montadores update assigned orders" ON public.orders;

CREATE POLICY "Montadores see assigned orders"
ON public.orders
FOR SELECT
TO authenticated
USING (public.is_accepted_montador_for_order(id, auth.uid()));

CREATE POLICY "Montadores update assigned orders"
ON public.orders
FOR UPDATE
TO authenticated
USING (public.is_accepted_montador_for_order(id, auth.uid()))
WITH CHECK (public.is_accepted_montador_for_order(id, auth.uid()));

-- 3) RPC segura para criação de pedidos (fonte única de verdade)
CREATE OR REPLACE FUNCTION public.create_order_safe(
  _title text,
  _description text,
  _furniture_type text,
  _brand text,
  _address text,
  _city text,
  _service_type text,
  _photo_url text,
  _is_urgent boolean,
  _needs_wall_mount boolean
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_order_id uuid;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Usuário não autenticado';
  END IF;

  INSERT INTO public.orders (
    client_id,
    status,
    title,
    description,
    furniture_type,
    brand,
    address,
    city,
    service_type,
    photo_url,
    is_urgent,
    needs_wall_mount
  ) VALUES (
    auth.uid(),
    'pendente',
    _title,
    _description,
    _furniture_type,
    NULLIF(_brand, ''),
    _address,
    NULLIF(_city, ''),
    COALESCE(NULLIF(_service_type, ''), 'montagem'),
    NULLIF(_photo_url, ''),
    COALESCE(_is_urgent, false),
    COALESCE(_needs_wall_mount, false)
  )
  RETURNING id INTO v_order_id;

  RETURN v_order_id;
END;
$$;

REVOKE ALL ON FUNCTION public.create_order_safe(text, text, text, text, text, text, text, text, boolean, boolean) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.create_order_safe(text, text, text, text, text, text, text, text, boolean, boolean) TO authenticated;