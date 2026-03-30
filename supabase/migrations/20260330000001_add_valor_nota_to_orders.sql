-- Add invoice fields to orders table
ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS valor_da_nota numeric NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS foto_da_nota text;

-- Update create_order_safe RPC to accept invoice fields
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
  _needs_wall_mount boolean,
  _valor_da_nota numeric DEFAULT 0,
  _foto_da_nota text DEFAULT NULL
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
    needs_wall_mount,
    valor_da_nota,
    foto_da_nota
  ) VALUES (
    auth.uid(),
    'aguardando',
    _title,
    _description,
    _furniture_type,
    NULLIF(_brand, ''),
    _address,
    NULLIF(_city, ''),
    COALESCE(NULLIF(_service_type, ''), 'montagem'),
    NULLIF(_photo_url, ''),
    COALESCE(_is_urgent, false),
    COALESCE(_needs_wall_mount, false),
    COALESCE(_valor_da_nota, 0),
    NULLIF(_foto_da_nota, '')
  )
  RETURNING id INTO v_order_id;

  RETURN v_order_id;
END;
$$;

REVOKE ALL ON FUNCTION public.create_order_safe(text, text, text, text, text, text, text, text, boolean, boolean, numeric, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.create_order_safe(text, text, text, text, text, text, text, text, boolean, boolean, numeric, text) TO authenticated;
