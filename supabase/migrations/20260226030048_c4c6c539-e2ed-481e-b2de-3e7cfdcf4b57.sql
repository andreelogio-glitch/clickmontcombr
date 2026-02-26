
-- Allow montadores to update orders they have accepted bids on (for montador_arrived, etc.)
CREATE POLICY "Montadores update orders with accepted bids"
ON public.orders
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM bids
    WHERE bids.order_id = orders.id
    AND bids.montador_id = auth.uid()
    AND bids.accepted = true
  )
);

-- Enable realtime for orders table so Chat UI updates in real-time
ALTER PUBLICATION supabase_realtime ADD TABLE public.orders;
