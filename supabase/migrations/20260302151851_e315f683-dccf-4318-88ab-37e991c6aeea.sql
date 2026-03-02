-- 1. Drop the overly-permissive montador profile policy (shows client profiles to ANY bidder)
DROP POLICY IF EXISTS "Montadores see order client profiles" ON public.profiles;

-- 2. Recreate it requiring ACCEPTED bids only
CREATE POLICY "Montadores see accepted-order client profiles"
ON public.profiles
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM orders o
    JOIN bids b ON b.order_id = o.id
    WHERE b.montador_id = auth.uid()
      AND b.accepted = true
      AND profiles.user_id = o.client_id
  )
);

-- 3. Create a secure view that hides sensitive columns for non-owners
CREATE OR REPLACE VIEW public.profiles_safe AS
SELECT
  id,
  user_id,
  full_name,
  phone,
  role,
  city,
  is_approved,
  is_verified,
  created_at,
  CASE WHEN auth.uid() = user_id OR has_role(auth.uid(), 'admin'::app_role)
       THEN pix_key ELSE NULL END AS pix_key,
  CASE WHEN auth.uid() = user_id OR has_role(auth.uid(), 'admin'::app_role)
       THEN document_url ELSE NULL END AS document_url,
  CASE WHEN auth.uid() = user_id OR has_role(auth.uid(), 'admin'::app_role)
       THEN selfie_url ELSE NULL END AS selfie_url,
  CASE WHEN auth.uid() = user_id OR has_role(auth.uid(), 'admin'::app_role)
       THEN experience_proof_url ELSE NULL END AS experience_proof_url,
  CASE WHEN auth.uid() = user_id OR has_role(auth.uid(), 'admin'::app_role)
       THEN lgpd_accepted_at ELSE NULL END AS lgpd_accepted_at
FROM public.profiles;

-- 4. Tighten wallet_transactions: montadores can only insert debits for orders where they have accepted bids
DROP POLICY IF EXISTS "Montador inserts debit requests" ON public.wallet_transactions;
CREATE POLICY "Montador inserts debit requests"
ON public.wallet_transactions
FOR INSERT
WITH CHECK (
  auth.uid() = montador_id
  AND type = 'debit'
  AND status = 'pendente'
  AND (
    order_id IS NULL
    OR EXISTS (
      SELECT 1 FROM bids
      WHERE bids.order_id = wallet_transactions.order_id
        AND bids.montador_id = auth.uid()
        AND bids.accepted = true
    )
  )
);

-- 5. Tighten support_tickets: users can only create tickets for their own orders
DROP POLICY IF EXISTS "Users create own tickets" ON public.support_tickets;
CREATE POLICY "Users create own tickets"
ON public.support_tickets
FOR INSERT
WITH CHECK (
  auth.uid() = opened_by
  AND EXISTS (
    SELECT 1 FROM orders
    WHERE orders.id = support_tickets.order_id
      AND (orders.client_id = auth.uid() OR EXISTS (
        SELECT 1 FROM bids
        WHERE bids.order_id = orders.id
          AND bids.montador_id = auth.uid()
          AND bids.accepted = true
      ))
  )
);

-- 6. Restrict montador bid updates to unaccepted bids only
DROP POLICY IF EXISTS "Montadores update own bids" ON public.bids;
CREATE POLICY "Montadores update own unaccepted bids"
ON public.bids
FOR UPDATE
USING (auth.uid() = montador_id AND accepted = false);