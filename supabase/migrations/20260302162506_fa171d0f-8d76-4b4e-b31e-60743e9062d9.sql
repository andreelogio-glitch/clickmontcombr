
-- Fix RESTRICTIVE-only policies on other critical tables

-- === ORDERS ===
DROP POLICY IF EXISTS "Clients see own orders" ON public.orders;
DROP POLICY IF EXISTS "Admins see all orders" ON public.orders;
DROP POLICY IF EXISTS "Montadores see pending orders" ON public.orders;
DROP POLICY IF EXISTS "Clients create orders" ON public.orders;
DROP POLICY IF EXISTS "Clients update own orders" ON public.orders;
DROP POLICY IF EXISTS "Admins update all orders" ON public.orders;
DROP POLICY IF EXISTS "Montadores update orders with accepted bids" ON public.orders;
DROP POLICY IF EXISTS "Clients can delete pending orders" ON public.orders;

CREATE POLICY "Clients see own orders" ON public.orders FOR SELECT USING (auth.uid() = client_id);
CREATE POLICY "Admins see all orders" ON public.orders FOR SELECT USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Montadores see pending orders" ON public.orders FOR SELECT USING (EXISTS (SELECT 1 FROM profiles WHERE profiles.user_id = auth.uid() AND profiles.role = 'montador'));
CREATE POLICY "Clients create orders" ON public.orders FOR INSERT WITH CHECK (auth.uid() = client_id);
CREATE POLICY "Clients update own orders" ON public.orders FOR UPDATE USING (auth.uid() = client_id);
CREATE POLICY "Admins update all orders" ON public.orders FOR UPDATE USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Montadores update orders with accepted bids" ON public.orders FOR UPDATE USING (EXISTS (SELECT 1 FROM bids WHERE bids.order_id = orders.id AND bids.montador_id = auth.uid() AND bids.accepted = true));
CREATE POLICY "Clients can delete pending orders" ON public.orders FOR DELETE USING (auth.uid() = client_id AND status = 'pendente');

-- === BIDS ===
DROP POLICY IF EXISTS "Clients see bids on own orders" ON public.bids;
DROP POLICY IF EXISTS "Montadores see own bids" ON public.bids;
DROP POLICY IF EXISTS "Admins see all bids" ON public.bids;
DROP POLICY IF EXISTS "Montadores create bids" ON public.bids;
DROP POLICY IF EXISTS "Clients accept bids on own orders" ON public.bids;
DROP POLICY IF EXISTS "Montadores update own unaccepted bids" ON public.bids;
DROP POLICY IF EXISTS "Montadores can delete unaccepted bids" ON public.bids;

CREATE POLICY "Clients see bids on own orders" ON public.bids FOR SELECT USING (EXISTS (SELECT 1 FROM orders WHERE orders.id = bids.order_id AND orders.client_id = auth.uid()));
CREATE POLICY "Montadores see own bids" ON public.bids FOR SELECT USING (auth.uid() = montador_id);
CREATE POLICY "Admins see all bids" ON public.bids FOR SELECT USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Montadores create bids" ON public.bids FOR INSERT WITH CHECK (auth.uid() = montador_id);
CREATE POLICY "Clients accept bids on own orders" ON public.bids FOR UPDATE USING (EXISTS (SELECT 1 FROM orders WHERE orders.id = bids.order_id AND orders.client_id = auth.uid())) WITH CHECK (accepted = true AND EXISTS (SELECT 1 FROM orders WHERE orders.id = bids.order_id AND orders.client_id = auth.uid()));
CREATE POLICY "Montadores update own unaccepted bids" ON public.bids FOR UPDATE USING (auth.uid() = montador_id AND accepted = false);
CREATE POLICY "Montadores can delete unaccepted bids" ON public.bids FOR DELETE USING (auth.uid() = montador_id AND accepted = false);

-- === NOTIFICATIONS ===
DROP POLICY IF EXISTS "Users see own notifications" ON public.notifications;
DROP POLICY IF EXISTS "Users update own notifications" ON public.notifications;
DROP POLICY IF EXISTS "Admin inserts notifications" ON public.notifications;

CREATE POLICY "Users see own notifications" ON public.notifications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users update own notifications" ON public.notifications FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Admin inserts notifications" ON public.notifications FOR INSERT WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- === CHAT_MESSAGES ===
DROP POLICY IF EXISTS "Chat participants can see messages" ON public.chat_messages;
DROP POLICY IF EXISTS "Chat participants can send messages" ON public.chat_messages;
DROP POLICY IF EXISTS "Users can delete own messages" ON public.chat_messages;

CREATE POLICY "Chat participants can see messages" ON public.chat_messages FOR SELECT USING (EXISTS (SELECT 1 FROM orders o LEFT JOIN bids b ON b.order_id = o.id WHERE o.id = chat_messages.order_id AND (o.client_id = auth.uid() OR b.montador_id = auth.uid())));
CREATE POLICY "Chat participants can send messages" ON public.chat_messages FOR INSERT WITH CHECK (auth.uid() = sender_id AND EXISTS (SELECT 1 FROM orders o LEFT JOIN bids b ON b.order_id = o.id WHERE o.id = chat_messages.order_id AND (o.client_id = auth.uid() OR b.montador_id = auth.uid())));
CREATE POLICY "Users can delete own messages" ON public.chat_messages FOR DELETE USING (auth.uid() = sender_id);

-- === WALLET_TRANSACTIONS ===
DROP POLICY IF EXISTS "Montador sees own transactions" ON public.wallet_transactions;
DROP POLICY IF EXISTS "Admin sees all transactions" ON public.wallet_transactions;
DROP POLICY IF EXISTS "Admin inserts transactions" ON public.wallet_transactions;
DROP POLICY IF EXISTS "Admin updates transactions" ON public.wallet_transactions;
DROP POLICY IF EXISTS "Montador inserts debit requests" ON public.wallet_transactions;

CREATE POLICY "Montador sees own transactions" ON public.wallet_transactions FOR SELECT USING (auth.uid() = montador_id);
CREATE POLICY "Admin sees all transactions" ON public.wallet_transactions FOR SELECT USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admin inserts transactions" ON public.wallet_transactions FOR INSERT WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admin updates transactions" ON public.wallet_transactions FOR UPDATE USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Montador inserts debit requests" ON public.wallet_transactions FOR INSERT WITH CHECK (auth.uid() = montador_id AND type = 'debit' AND status = 'pendente' AND (order_id IS NULL OR EXISTS (SELECT 1 FROM bids WHERE bids.order_id = wallet_transactions.order_id AND bids.montador_id = auth.uid() AND bids.accepted = true)));

-- === SUPPORT_TICKETS ===
DROP POLICY IF EXISTS "Users see own tickets" ON public.support_tickets;
DROP POLICY IF EXISTS "Admins see all tickets" ON public.support_tickets;
DROP POLICY IF EXISTS "Users create own tickets" ON public.support_tickets;
DROP POLICY IF EXISTS "Admins update all tickets" ON public.support_tickets;
DROP POLICY IF EXISTS "Users can delete own tickets" ON public.support_tickets;

CREATE POLICY "Users see own tickets" ON public.support_tickets FOR SELECT USING (auth.uid() = opened_by);
CREATE POLICY "Admins see all tickets" ON public.support_tickets FOR SELECT USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Users create own tickets" ON public.support_tickets FOR INSERT WITH CHECK (auth.uid() = opened_by AND EXISTS (SELECT 1 FROM orders WHERE orders.id = support_tickets.order_id AND (orders.client_id = auth.uid() OR EXISTS (SELECT 1 FROM bids WHERE bids.order_id = orders.id AND bids.montador_id = auth.uid() AND bids.accepted = true))));
CREATE POLICY "Admins update all tickets" ON public.support_tickets FOR UPDATE USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Users can delete own tickets" ON public.support_tickets FOR DELETE USING (auth.uid() = opened_by);

-- === TICKET_MESSAGES ===
DROP POLICY IF EXISTS "Ticket owner sees messages" ON public.ticket_messages;
DROP POLICY IF EXISTS "Admins see all messages" ON public.ticket_messages;
DROP POLICY IF EXISTS "Users send messages on own tickets" ON public.ticket_messages;
DROP POLICY IF EXISTS "Admins send messages" ON public.ticket_messages;
DROP POLICY IF EXISTS "Users can delete own ticket messages" ON public.ticket_messages;

CREATE POLICY "Ticket owner sees messages" ON public.ticket_messages FOR SELECT USING (EXISTS (SELECT 1 FROM support_tickets t WHERE t.id = ticket_messages.ticket_id AND t.opened_by = auth.uid()));
CREATE POLICY "Admins see all messages" ON public.ticket_messages FOR SELECT USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Users send messages on own tickets" ON public.ticket_messages FOR INSERT WITH CHECK (auth.uid() = sender_id AND EXISTS (SELECT 1 FROM support_tickets t WHERE t.id = ticket_messages.ticket_id AND t.opened_by = auth.uid()));
CREATE POLICY "Admins send messages" ON public.ticket_messages FOR INSERT WITH CHECK (auth.uid() = sender_id AND has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Users can delete own ticket messages" ON public.ticket_messages FOR DELETE USING (auth.uid() = sender_id);

-- === PUSH_SUBSCRIPTIONS ===
DROP POLICY IF EXISTS "Users manage own subscriptions" ON public.push_subscriptions;
CREATE POLICY "Users manage own subscriptions" ON public.push_subscriptions FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- === USER_ROLES ===
DROP POLICY IF EXISTS "Admins can view roles" ON public.user_roles;
CREATE POLICY "Admins can view roles" ON public.user_roles FOR SELECT USING (has_role(auth.uid(), 'admin'::app_role));

-- === AI_TRAINING_DATA ===
DROP POLICY IF EXISTS "Admins read training data" ON public.ai_training_data;
DROP POLICY IF EXISTS "System insert training data" ON public.ai_training_data;
CREATE POLICY "Admins read training data" ON public.ai_training_data FOR SELECT USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "System insert training data" ON public.ai_training_data FOR INSERT WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- === CODE_VALIDATION_ATTEMPTS ===
DROP POLICY IF EXISTS "Admins read attempts" ON public.code_validation_attempts;
DROP POLICY IF EXISTS "Auth insert attempts" ON public.code_validation_attempts;
CREATE POLICY "Admins read attempts" ON public.code_validation_attempts FOR SELECT USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Auth insert attempts" ON public.code_validation_attempts FOR INSERT WITH CHECK (auth.uid() = montador_id);
