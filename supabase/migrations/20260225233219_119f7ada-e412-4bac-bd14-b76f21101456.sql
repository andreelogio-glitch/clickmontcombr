
-- Add pix_key to profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS pix_key text DEFAULT NULL;

-- Wallet transactions table
CREATE TABLE public.wallet_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  montador_id uuid NOT NULL,
  order_id uuid REFERENCES public.orders(id),
  type text NOT NULL DEFAULT 'credit', -- credit, debit, pending
  description text NOT NULL,
  amount numeric NOT NULL,
  status text NOT NULL DEFAULT 'pendente', -- pendente, disponivel, sacado
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.wallet_transactions ENABLE ROW LEVEL SECURITY;

-- Montador sees own transactions
CREATE POLICY "Montador sees own transactions" ON public.wallet_transactions
FOR SELECT TO authenticated
USING (auth.uid() = montador_id);

-- Admin sees all transactions
CREATE POLICY "Admin sees all transactions" ON public.wallet_transactions
FOR SELECT TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- System inserts transactions (via admin or service role)
CREATE POLICY "Admin inserts transactions" ON public.wallet_transactions
FOR INSERT TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Admin updates transactions
CREATE POLICY "Admin updates transactions" ON public.wallet_transactions
FOR UPDATE TO authenticated
USING (public.has_role(auth.uid(), 'admin'));
