
-- Table to track code validation attempts for rate limiting
CREATE TABLE public.code_validation_attempts (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id uuid NOT NULL REFERENCES public.orders(id),
  montador_id uuid NOT NULL,
  attempted_code text NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.code_validation_attempts ENABLE ROW LEVEL SECURITY;

-- Only admins can read attempts (audit)
CREATE POLICY "Admins read attempts" ON public.code_validation_attempts
  FOR SELECT USING (has_role(auth.uid(), 'admin'::app_role));

-- Authenticated users can insert (the RPC handles authorization)
CREATE POLICY "Auth insert attempts" ON public.code_validation_attempts
  FOR INSERT WITH CHECK (auth.uid() = montador_id);

CREATE POLICY "Require auth for code_validation_attempts" ON public.code_validation_attempts
  FOR ALL USING (auth.uid() IS NOT NULL) WITH CHECK (auth.uid() IS NOT NULL);

-- Server-side RPC for secure code validation with rate limiting
CREATE OR REPLACE FUNCTION public.validate_verification_code(_order_id uuid, _code text)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_attempt_count int;
  v_order record;
  v_has_bid boolean;
BEGIN
  -- Verify caller is the accepted montador for this order
  SELECT EXISTS (
    SELECT 1 FROM bids
    WHERE order_id = _order_id AND montador_id = auth.uid() AND accepted = true
  ) INTO v_has_bid;

  IF NOT v_has_bid THEN
    RETURN json_build_object('success', false, 'error', 'Não autorizado');
  END IF;

  -- Rate limit: max 5 attempts per order in the last hour
  SELECT COUNT(*) INTO v_attempt_count
  FROM code_validation_attempts
  WHERE order_id = _order_id
    AND created_at > NOW() - INTERVAL '1 hour';

  IF v_attempt_count >= 5 THEN
    RETURN json_build_object('success', false, 'error', 'Muitas tentativas. Aguarde 1 hora.');
  END IF;

  -- Log the attempt
  INSERT INTO code_validation_attempts (order_id, montador_id, attempted_code)
  VALUES (_order_id, auth.uid(), _code);

  -- Fetch order
  SELECT * INTO v_order FROM orders WHERE id = _order_id;

  IF v_order IS NULL THEN
    RETURN json_build_object('success', false, 'error', 'Pedido não encontrado');
  END IF;

  IF v_order.code_validated THEN
    RETURN json_build_object('success', true, 'error', 'Código já validado');
  END IF;

  -- Validate code
  IF v_order.verification_code = _code THEN
    UPDATE orders SET code_validated = true, status = 'em_andamento', started_at = NOW()
    WHERE id = _order_id;
    RETURN json_build_object('success', true);
  END IF;

  RETURN json_build_object('success', false, 'error', 'Código incorreto. Peça ao cliente o código correto.');
END;
$$;
