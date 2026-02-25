
-- Allow montador to insert debit (withdrawal) requests
CREATE POLICY "Montador inserts debit requests" ON public.wallet_transactions
FOR INSERT TO authenticated
WITH CHECK (
  auth.uid() = montador_id 
  AND type = 'debit' 
  AND status = 'pendente'
);
