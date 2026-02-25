
-- Allow clients to insert credit transactions with status 'auditoria' for orders they own
CREATE POLICY "Client inserts auditoria transactions" ON public.wallet_transactions
FOR INSERT TO authenticated
WITH CHECK (
  type = 'credit'
  AND status = 'auditoria'
  AND EXISTS (
    SELECT 1 FROM public.orders 
    WHERE orders.id = wallet_transactions.order_id 
    AND orders.client_id = auth.uid()
  )
);
