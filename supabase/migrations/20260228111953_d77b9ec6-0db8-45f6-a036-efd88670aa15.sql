
-- Allow users to delete own profiles (LGPD compliance)
CREATE POLICY "Users can delete own profile"
ON public.profiles FOR DELETE TO authenticated
USING (auth.uid() = user_id);

-- Allow clients to delete own pending orders
CREATE POLICY "Clients can delete pending orders"
ON public.orders FOR DELETE TO authenticated
USING (auth.uid() = client_id AND status = 'pendente');

-- Allow montadores to delete unaccepted bids
CREATE POLICY "Montadores can delete unaccepted bids"
ON public.bids FOR DELETE TO authenticated
USING (auth.uid() = montador_id AND accepted = false);

-- Allow users to delete own chat messages
CREATE POLICY "Users can delete own messages"
ON public.chat_messages FOR DELETE TO authenticated
USING (auth.uid() = sender_id);

-- Allow users to delete own support tickets
CREATE POLICY "Users can delete own tickets"
ON public.support_tickets FOR DELETE TO authenticated
USING (auth.uid() = opened_by);

-- Allow users to delete own ticket messages
CREATE POLICY "Users can delete own ticket messages"
ON public.ticket_messages FOR DELETE TO authenticated
USING (auth.uid() = sender_id);
