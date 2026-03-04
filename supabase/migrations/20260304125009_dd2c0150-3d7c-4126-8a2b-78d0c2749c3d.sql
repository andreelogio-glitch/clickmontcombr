
-- Create platform_logs audit table
CREATE TABLE public.platform_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  user_id uuid NOT NULL,
  action_type text NOT NULL,
  order_id uuid REFERENCES public.orders(id),
  details jsonb DEFAULT '{}'::jsonb
);

-- Enable RLS
ALTER TABLE public.platform_logs ENABLE ROW LEVEL SECURITY;

-- Admin-only policies
CREATE POLICY "Admins read logs" ON public.platform_logs
  FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins insert logs" ON public.platform_logs
  FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));
