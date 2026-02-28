
-- Add permissive baseline policies requiring authentication on all tables
-- This ensures anonymous access is explicitly blocked

CREATE POLICY "Require auth for profiles" ON public.profiles FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Require auth for orders" ON public.orders FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Require auth for bids" ON public.bids FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Require auth for chat_messages" ON public.chat_messages FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Require auth for wallet_transactions" ON public.wallet_transactions FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Require auth for notifications" ON public.notifications FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Require auth for support_tickets" ON public.support_tickets FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Require auth for ticket_messages" ON public.ticket_messages FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Require auth for push_subscriptions" ON public.push_subscriptions FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Require auth for ai_training_data" ON public.ai_training_data FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Require auth for user_roles" ON public.user_roles FOR ALL TO authenticated USING (true) WITH CHECK (true);
