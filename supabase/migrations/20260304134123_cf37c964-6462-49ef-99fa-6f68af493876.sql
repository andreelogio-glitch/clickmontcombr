
CREATE TABLE public.chat_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  content text NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.chat_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins manage templates" ON public.chat_templates
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Authenticated users read templates" ON public.chat_templates
  FOR SELECT TO authenticated
  USING (true);
