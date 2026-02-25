
-- Add service_type to orders
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS service_type text NOT NULL DEFAULT 'montagem';

-- Add LGPD and montador verification fields to profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS lgpd_accepted_at timestamptz;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS selfie_url text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS document_url text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS experience_proof_url text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS is_verified boolean NOT NULL DEFAULT false;

-- Create storage bucket for user documents
INSERT INTO storage.buckets (id, name, public) VALUES ('user-documents', 'user-documents', true) ON CONFLICT DO NOTHING;

-- Storage RLS: users can upload their own files
CREATE POLICY "Users upload own documents" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'user-documents' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Users view own documents" ON storage.objects FOR SELECT TO authenticated USING (bucket_id = 'user-documents' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Public read documents" ON storage.objects FOR SELECT TO anon USING (bucket_id = 'user-documents');
