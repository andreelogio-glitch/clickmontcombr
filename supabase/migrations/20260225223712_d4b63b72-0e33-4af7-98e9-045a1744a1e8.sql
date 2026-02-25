
-- Admin role system
CREATE TYPE public.app_role AS ENUM ('admin', 'moderator', 'user');

CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  UNIQUE (user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- Only admins can see user_roles
CREATE POLICY "Admins can view roles" ON public.user_roles
  FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Support tickets table
CREATE TABLE public.support_tickets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid REFERENCES public.orders(id) NOT NULL,
  opened_by uuid NOT NULL,
  subject text NOT NULL,
  description text NOT NULL,
  status text NOT NULL DEFAULT 'aberto',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.support_tickets ENABLE ROW LEVEL SECURITY;

-- Users see own tickets
CREATE POLICY "Users see own tickets" ON public.support_tickets
  FOR SELECT TO authenticated
  USING (auth.uid() = opened_by);

-- Users create own tickets
CREATE POLICY "Users create own tickets" ON public.support_tickets
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = opened_by);

-- Admins see all tickets
CREATE POLICY "Admins see all tickets" ON public.support_tickets
  FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Admins update tickets
CREATE POLICY "Admins update all tickets" ON public.support_tickets
  FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Ticket messages (admin responses + user messages)
CREATE TABLE public.ticket_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id uuid REFERENCES public.support_tickets(id) ON DELETE CASCADE NOT NULL,
  sender_id uuid NOT NULL,
  message text NOT NULL,
  media_url text,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.ticket_messages ENABLE ROW LEVEL SECURITY;

-- Ticket opener can see messages on their tickets
CREATE POLICY "Ticket owner sees messages" ON public.ticket_messages
  FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.support_tickets t
    WHERE t.id = ticket_messages.ticket_id AND t.opened_by = auth.uid()
  ));

-- Users can send messages on own tickets
CREATE POLICY "Users send messages on own tickets" ON public.ticket_messages
  FOR INSERT TO authenticated
  WITH CHECK (
    auth.uid() = sender_id AND
    EXISTS (
      SELECT 1 FROM public.support_tickets t
      WHERE t.id = ticket_messages.ticket_id AND t.opened_by = auth.uid()
    )
  );

-- Admins see all messages
CREATE POLICY "Admins see all messages" ON public.ticket_messages
  FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Admins send messages on any ticket
CREATE POLICY "Admins send messages" ON public.ticket_messages
  FOR INSERT TO authenticated
  WITH CHECK (
    auth.uid() = sender_id AND
    public.has_role(auth.uid(), 'admin')
  );

-- Storage bucket for ticket media
INSERT INTO storage.buckets (id, name, public) VALUES ('ticket-media', 'ticket-media', true);

-- Anyone authenticated can upload to ticket-media
CREATE POLICY "Auth users upload ticket media" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'ticket-media');

-- Public read for ticket media
CREATE POLICY "Public read ticket media" ON storage.objects
  FOR SELECT
  USING (bucket_id = 'ticket-media');

-- AI training data collection table
CREATE TABLE public.ai_training_data (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid REFERENCES public.orders(id),
  furniture_type text,
  brand text,
  service_type text,
  bid_amount numeric,
  final_amount numeric,
  address_region text,
  resolution_type text,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.ai_training_data ENABLE ROW LEVEL SECURITY;

-- Only admins can read training data
CREATE POLICY "Admins read training data" ON public.ai_training_data
  FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- System can insert training data
CREATE POLICY "System insert training data" ON public.ai_training_data
  FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Enable realtime for ticket messages
ALTER PUBLICATION supabase_realtime ADD TABLE public.ticket_messages;
