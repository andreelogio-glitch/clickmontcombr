
-- ============================================================
-- EMERGENCY FIX: Convert ALL RLS policies from RESTRICTIVE to PERMISSIVE
-- PostgreSQL ignores RESTRICTIVE policies when no PERMISSIVE exists
-- This is the root cause of the white screen / login loop
-- ============================================================

-- 1) DROP all existing policies on all tables
DO $$
DECLARE
  pol RECORD;
BEGIN
  FOR pol IN
    SELECT schemaname, tablename, policyname
    FROM pg_policies
    WHERE schemaname = 'public'
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON %I.%I', pol.policyname, pol.schemaname, pol.tablename);
  END LOOP;
END $$;

-- ============================================================
-- 2) RECREATE all policies as PERMISSIVE
-- ============================================================

-- ---- PROFILES ----
CREATE POLICY "Users view own profile" ON public.profiles FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Admins view all profiles" ON public.profiles FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Montadores see accepted-order client profiles" ON public.profiles FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM orders o JOIN bids b ON b.order_id = o.id WHERE b.montador_id = auth.uid() AND b.accepted = true AND profiles.user_id = o.client_id));
CREATE POLICY "Order participants view profiles" ON public.profiles FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM orders o JOIN bids b ON b.order_id = o.id AND b.accepted = true
    WHERE (o.client_id = auth.uid() AND profiles.user_id = b.montador_id) OR (b.montador_id = auth.uid() AND profiles.user_id = o.client_id)));
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id AND is_approved = (SELECT p.is_approved FROM profiles p WHERE p.user_id = auth.uid()));
CREATE POLICY "Admins update all profiles" ON public.profiles FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Users can delete own profile" ON public.profiles FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- ---- ORDERS ----
CREATE POLICY "Clients see own orders" ON public.orders FOR SELECT TO authenticated USING (auth.uid() = client_id);
CREATE POLICY "Admins see all orders" ON public.orders FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Montadores see orders" ON public.orders FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles WHERE profiles.user_id = auth.uid() AND profiles.role = 'montador'));
CREATE POLICY "Clients create orders" ON public.orders FOR INSERT TO authenticated WITH CHECK (auth.uid() = client_id);
CREATE POLICY "Clients update own orders" ON public.orders FOR UPDATE TO authenticated USING (auth.uid() = client_id);
CREATE POLICY "Admins update all orders" ON public.orders FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Montadores update orders with accepted bids" ON public.orders FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM bids WHERE bids.order_id = orders.id AND bids.montador_id = auth.uid() AND bids.accepted = true));
CREATE POLICY "Clients can delete pending orders" ON public.orders FOR DELETE TO authenticated
  USING (auth.uid() = client_id AND status = 'pendente');

-- ---- BIDS ----
CREATE POLICY "Clients see bids on own orders" ON public.bids FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM orders WHERE orders.id = bids.order_id AND orders.client_id = auth.uid()));
CREATE POLICY "Montadores see own bids" ON public.bids FOR SELECT TO authenticated USING (auth.uid() = montador_id);
CREATE POLICY "Admins see all bids" ON public.bids FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Montadores create bids" ON public.bids FOR INSERT TO authenticated WITH CHECK (auth.uid() = montador_id);
CREATE POLICY "Clients accept bids" ON public.bids FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM orders WHERE orders.id = bids.order_id AND orders.client_id = auth.uid()));
CREATE POLICY "Montadores update own unaccepted bids" ON public.bids FOR UPDATE TO authenticated
  USING (auth.uid() = montador_id AND accepted = false);
CREATE POLICY "Montadores delete unaccepted bids" ON public.bids FOR DELETE TO authenticated
  USING (auth.uid() = montador_id AND accepted = false);

-- ---- WALLET_TRANSACTIONS ----
CREATE POLICY "Montador sees own transactions" ON public.wallet_transactions FOR SELECT TO authenticated USING (auth.uid() = montador_id);
CREATE POLICY "Admin sees all transactions" ON public.wallet_transactions FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admin inserts transactions" ON public.wallet_transactions FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admin updates transactions" ON public.wallet_transactions FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Montador inserts debit requests" ON public.wallet_transactions FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = montador_id AND type = 'debit' AND status = 'pendente');

-- ---- CHAT_MESSAGES ----
CREATE POLICY "Chat participants see messages" ON public.chat_messages FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM orders o LEFT JOIN bids b ON b.order_id = o.id
    WHERE o.id = chat_messages.order_id AND (o.client_id = auth.uid() OR b.montador_id = auth.uid())));
CREATE POLICY "Chat participants send messages" ON public.chat_messages FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = sender_id AND EXISTS (SELECT 1 FROM orders o LEFT JOIN bids b ON b.order_id = o.id
    WHERE o.id = chat_messages.order_id AND (o.client_id = auth.uid() OR b.montador_id = auth.uid())));
CREATE POLICY "Users delete own chat messages" ON public.chat_messages FOR DELETE TO authenticated USING (auth.uid() = sender_id);

-- ---- NOTIFICATIONS ----
CREATE POLICY "Users see own notifications" ON public.notifications FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users update own notifications" ON public.notifications FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Admin inserts notifications" ON public.notifications FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- ---- SUPPORT_TICKETS ----
CREATE POLICY "Users see own tickets" ON public.support_tickets FOR SELECT TO authenticated USING (auth.uid() = opened_by);
CREATE POLICY "Admins see all tickets" ON public.support_tickets FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Users create own tickets" ON public.support_tickets FOR INSERT TO authenticated WITH CHECK (auth.uid() = opened_by);
CREATE POLICY "Admins update all tickets" ON public.support_tickets FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Users delete own tickets" ON public.support_tickets FOR DELETE TO authenticated USING (auth.uid() = opened_by);

-- ---- TICKET_MESSAGES ----
CREATE POLICY "Ticket owner sees messages" ON public.ticket_messages FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM support_tickets t WHERE t.id = ticket_messages.ticket_id AND t.opened_by = auth.uid()));
CREATE POLICY "Admins see all ticket messages" ON public.ticket_messages FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Users send messages on own tickets" ON public.ticket_messages FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = sender_id AND EXISTS (SELECT 1 FROM support_tickets t WHERE t.id = ticket_messages.ticket_id AND t.opened_by = auth.uid()));
CREATE POLICY "Admins send ticket messages" ON public.ticket_messages FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = sender_id AND public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Users delete own ticket messages" ON public.ticket_messages FOR DELETE TO authenticated USING (auth.uid() = sender_id);

-- ---- PUSH_SUBSCRIPTIONS ----
CREATE POLICY "Users manage own push subs" ON public.push_subscriptions FOR ALL TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- ---- CODE_VALIDATION_ATTEMPTS ----
CREATE POLICY "Auth insert attempts" ON public.code_validation_attempts FOR INSERT TO authenticated WITH CHECK (auth.uid() = montador_id);
CREATE POLICY "Admins read attempts" ON public.code_validation_attempts FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- ---- USER_ROLES ----
CREATE POLICY "Users view own role" ON public.user_roles FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Admins can view roles" ON public.user_roles FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- ---- AI_TRAINING_DATA ----
CREATE POLICY "Admins read training data" ON public.ai_training_data FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins insert training data" ON public.ai_training_data FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));
