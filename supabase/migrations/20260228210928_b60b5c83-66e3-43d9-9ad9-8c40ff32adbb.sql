
-- Fix RLS "Require auth" policies: replace USING(true) WITH CHECK(true) with proper auth checks

-- ai_training_data
DROP POLICY IF EXISTS "Require auth for ai_training_data" ON public.ai_training_data;
CREATE POLICY "Require auth for ai_training_data" ON public.ai_training_data
  AS RESTRICTIVE FOR ALL
  USING (auth.uid() IS NOT NULL)
  WITH CHECK (auth.uid() IS NOT NULL);

-- bids
DROP POLICY IF EXISTS "Require auth for bids" ON public.bids;
CREATE POLICY "Require auth for bids" ON public.bids
  AS RESTRICTIVE FOR ALL
  USING (auth.uid() IS NOT NULL)
  WITH CHECK (auth.uid() IS NOT NULL);

-- chat_messages
DROP POLICY IF EXISTS "Require auth for chat_messages" ON public.chat_messages;
CREATE POLICY "Require auth for chat_messages" ON public.chat_messages
  AS RESTRICTIVE FOR ALL
  USING (auth.uid() IS NOT NULL)
  WITH CHECK (auth.uid() IS NOT NULL);

-- notifications
DROP POLICY IF EXISTS "Require auth for notifications" ON public.notifications;
CREATE POLICY "Require auth for notifications" ON public.notifications
  AS RESTRICTIVE FOR ALL
  USING (auth.uid() IS NOT NULL)
  WITH CHECK (auth.uid() IS NOT NULL);

-- orders
DROP POLICY IF EXISTS "Require auth for orders" ON public.orders;
CREATE POLICY "Require auth for orders" ON public.orders
  AS RESTRICTIVE FOR ALL
  USING (auth.uid() IS NOT NULL)
  WITH CHECK (auth.uid() IS NOT NULL);

-- profiles
DROP POLICY IF EXISTS "Require auth for profiles" ON public.profiles;
CREATE POLICY "Require auth for profiles" ON public.profiles
  AS RESTRICTIVE FOR ALL
  USING (auth.uid() IS NOT NULL)
  WITH CHECK (auth.uid() IS NOT NULL);

-- push_subscriptions
DROP POLICY IF EXISTS "Require auth for push_subscriptions" ON public.push_subscriptions;
CREATE POLICY "Require auth for push_subscriptions" ON public.push_subscriptions
  AS RESTRICTIVE FOR ALL
  USING (auth.uid() IS NOT NULL)
  WITH CHECK (auth.uid() IS NOT NULL);

-- support_tickets
DROP POLICY IF EXISTS "Require auth for support_tickets" ON public.support_tickets;
CREATE POLICY "Require auth for support_tickets" ON public.support_tickets
  AS RESTRICTIVE FOR ALL
  USING (auth.uid() IS NOT NULL)
  WITH CHECK (auth.uid() IS NOT NULL);

-- ticket_messages
DROP POLICY IF EXISTS "Require auth for ticket_messages" ON public.ticket_messages;
CREATE POLICY "Require auth for ticket_messages" ON public.ticket_messages
  AS RESTRICTIVE FOR ALL
  USING (auth.uid() IS NOT NULL)
  WITH CHECK (auth.uid() IS NOT NULL);

-- user_roles
DROP POLICY IF EXISTS "Require auth for user_roles" ON public.user_roles;
CREATE POLICY "Require auth for user_roles" ON public.user_roles
  AS RESTRICTIVE FOR ALL
  USING (auth.uid() IS NOT NULL)
  WITH CHECK (auth.uid() IS NOT NULL);

-- wallet_transactions
DROP POLICY IF EXISTS "Require auth for wallet_transactions" ON public.wallet_transactions;
CREATE POLICY "Require auth for wallet_transactions" ON public.wallet_transactions
  AS RESTRICTIVE FOR ALL
  USING (auth.uid() IS NOT NULL)
  WITH CHECK (auth.uid() IS NOT NULL);

-- code_validation_attempts
DROP POLICY IF EXISTS "Require auth for code_validation_attempts" ON public.code_validation_attempts;
CREATE POLICY "Require auth for code_validation_attempts" ON public.code_validation_attempts
  AS RESTRICTIVE FOR ALL
  USING (auth.uid() IS NOT NULL)
  WITH CHECK (auth.uid() IS NOT NULL);
