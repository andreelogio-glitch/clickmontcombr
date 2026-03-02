
-- Fix 1: Drop broad "Profiles viewable by everyone" policy
DROP POLICY IF EXISTS "Profiles viewable by everyone" ON public.profiles;

-- Fix 2: Drop client INSERT policy on wallet_transactions
DROP POLICY IF EXISTS "Client inserts auditoria transactions" ON public.wallet_transactions;

-- Fix 3: Create server-side release_payment RPC
CREATE OR REPLACE FUNCTION public.release_payment(_order_id uuid, _stage text)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_order record;
  v_bid record;
  v_montador_amount numeric;
  v_release_amount numeric;
  v_bonus numeric := 0;
  v_label text;
  v_existing int;
  v_platform_fee numeric := 0.25;
  v_desmontagem_first numeric := 0.40;
  v_desmontagem_second numeric := 0.60;
  v_same_day_bonus numeric := 0.10;
BEGIN
  -- Validate stage parameter
  IF _stage NOT IN ('desmontagem', 'complete') THEN
    RETURN json_build_object('success', false, 'error', 'Estágio inválido');
  END IF;

  -- Verify caller owns the order
  SELECT * INTO v_order FROM orders WHERE id = _order_id AND client_id = auth.uid();
  IF NOT FOUND THEN
    RETURN json_build_object('success', false, 'error', 'Pedido não encontrado');
  END IF;

  -- Get accepted bid
  SELECT * INTO v_bid FROM bids WHERE order_id = _order_id AND accepted = true;
  IF NOT FOUND THEN
    RETURN json_build_object('success', false, 'error', 'Nenhum lance aceito encontrado');
  END IF;

  -- Server-side fee calculation
  IF v_order.is_urgent THEN
    v_montador_amount := ROUND(v_bid.amount * 100) / 100;
  ELSE
    v_montador_amount := ROUND(v_bid.amount * (1 - v_platform_fee) * 100) / 100;
  END IF;

  IF _stage = 'desmontagem' THEN
    -- Validate order is in correct status
    IF v_order.status NOT IN ('pago', 'em_andamento') THEN
      RETURN json_build_object('success', false, 'error', 'Status do pedido inválido para esta ação');
    END IF;

    -- Prevent duplicate desmontagem release
    SELECT COUNT(*) INTO v_existing FROM wallet_transactions
    WHERE order_id = _order_id AND description LIKE 'Desmontagem 40%%';
    IF v_existing > 0 THEN
      RETURN json_build_object('success', false, 'error', 'Pagamento de desmontagem já liberado');
    END IF;

    v_release_amount := ROUND(v_montador_amount * v_desmontagem_first * 100) / 100;
    v_label := 'Desmontagem 40%';

    -- Update order status
    UPDATE orders SET status = 'desmontagem_confirmada' WHERE id = _order_id;

  ELSIF _stage = 'complete' THEN
    -- Validate order status
    IF v_order.status NOT IN ('pago', 'em_andamento', 'desmontagem_confirmada') THEN
      RETURN json_build_object('success', false, 'error', 'Status do pedido inválido para esta ação');
    END IF;

    -- Prevent duplicate completion release
    SELECT COUNT(*) INTO v_existing FROM wallet_transactions
    WHERE order_id = _order_id AND (description LIKE 'Montagem 60%%' OR description LIKE 'Serviço completo%%');
    IF v_existing > 0 THEN
      RETURN json_build_object('success', false, 'error', 'Pagamento de conclusão já liberado');
    END IF;

    IF v_order.service_type = 'desmontagem' THEN
      v_release_amount := ROUND(v_montador_amount * v_desmontagem_second * 100) / 100;
      v_label := 'Montagem 60%';
    ELSE
      v_release_amount := v_montador_amount;
      v_label := 'Serviço completo';
    END IF;

    -- Same-day bonus (server-side check)
    IF v_bid.created_at::date = NOW()::date THEN
      v_bonus := ROUND(v_release_amount * v_same_day_bonus * 100) / 100;
    END IF;

    -- Update order status
    UPDATE orders SET status = 'aguardando_liberacao' WHERE id = _order_id;
  END IF;

  -- Append urgent label
  IF v_order.is_urgent THEN
    v_label := v_label || ' (Urgente - Taxa Zero)';
  END IF;
  v_label := v_label || ' - Pedido confirmado pelo cliente';

  -- Insert main transaction
  INSERT INTO wallet_transactions (montador_id, order_id, type, status, amount, description)
  VALUES (v_bid.montador_id, _order_id, 'credit', 'auditoria', v_release_amount, v_label);

  -- Insert bonus transaction if applicable
  IF v_bonus > 0 THEN
    INSERT INTO wallet_transactions (montador_id, order_id, type, status, amount, description)
    VALUES (v_bid.montador_id, _order_id, 'credit', 'auditoria', v_bonus, 'Bônus de Produtividade (+10%) - Conclusão no mesmo dia');
  END IF;

  RETURN json_build_object('success', true);
END;
$$;

-- Fix 4: Restrict clients from updating verification_code and status to 'pago'
-- We need a trigger to prevent clients from setting status='pago' or verification_code via direct UPDATE
CREATE OR REPLACE FUNCTION public.prevent_client_payment_bypass()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Allow service role (webhook) and admins to do anything
  -- For regular users, prevent setting status to 'pago' or changing verification_code
  IF NOT has_role(auth.uid(), 'admin') THEN
    IF NEW.status = 'pago' AND OLD.status != 'pago' THEN
      RAISE EXCEPTION 'Cannot set status to pago directly';
    END IF;
    IF NEW.verification_code IS DISTINCT FROM OLD.verification_code AND OLD.verification_code IS NOT NULL THEN
      RAISE EXCEPTION 'Cannot modify verification code';
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS prevent_payment_bypass ON public.orders;
CREATE TRIGGER prevent_payment_bypass
  BEFORE UPDATE ON public.orders
  FOR EACH ROW
  EXECUTE FUNCTION public.prevent_client_payment_bypass();
