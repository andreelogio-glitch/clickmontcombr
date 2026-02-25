
-- Admin can see all orders
CREATE POLICY "Admins see all orders"
ON public.orders FOR SELECT
USING (public.has_role(auth.uid(), 'admin'::app_role));

-- Admin can see all bids
CREATE POLICY "Admins see all bids"
ON public.bids FOR SELECT
USING (public.has_role(auth.uid(), 'admin'::app_role));

-- Admin can update orders
CREATE POLICY "Admins update all orders"
ON public.orders FOR UPDATE
USING (public.has_role(auth.uid(), 'admin'::app_role));
