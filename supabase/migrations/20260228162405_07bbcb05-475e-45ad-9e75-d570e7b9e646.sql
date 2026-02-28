
-- 1. Make storage buckets private
UPDATE storage.buckets SET public = false WHERE id IN ('user-documents', 'ticket-media');

-- 2. Add RLS policy for clients to accept bids on their own orders
CREATE POLICY "Clients accept bids on own orders"
ON public.bids FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM orders
    WHERE orders.id = bids.order_id
    AND orders.client_id = auth.uid()
  )
)
WITH CHECK (
  accepted = true
  AND EXISTS (
    SELECT 1 FROM orders
    WHERE orders.id = bids.order_id
    AND orders.client_id = auth.uid()
  )
);
