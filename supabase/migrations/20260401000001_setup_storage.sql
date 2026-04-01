-- ============================================
-- SPRINT 0: Setup de Infraestrutura
-- Executar no Supabase SQL Editor
-- Data: 2026-04-01
-- ============================================

-- ============================================
-- 1. CRIAR STORAGE BUCKETS
-- ============================================

-- Bucket para fotos de documentos dos usuarios (notas fiscais, etc)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'user-documents',
  'user-documents',
  false,
  10485760, -- 10MB
  ARRAY['image/png', 'image/jpeg', 'image/webp', 'application/pdf']::text[]
)
ON CONFLICT (id) DO NOTHING;

-- Bucket para fotos de produtos moveis
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'product-photos',
  'product-photos',
  true,
  5242880, -- 5MB
  ARRAY['image/png', 'image/jpeg', 'image/webp']::text[]
)
ON CONFLICT (id) DO NOTHING;

-- Bucket para avatares de perfil
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'avatars',
  'avatars',
  true,
  2097152, -- 2MB
  ARRAY['image/png', 'image/jpeg', 'image/webp']::text[]
)
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- 2. POLITICAS RLS PARA STORAGE
-- ============================================

-- Bucket: user-documents
-- Todos os usuarios autenticados podem fazer upload
-- Apenas o dono do arquivo pode ver/baixar
CREATE POLICY "Users can upload to user-documents"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'user-documents'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can view own files in user-documents"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'user-documents'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can update own files in user-documents"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'user-documents'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete own files in user-documents"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'user-documents'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Bucket: avatars - public read
CREATE POLICY "Public can view avatars"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'avatars');

CREATE POLICY "Authenticated can upload avatars"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'avatars'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can update own avatars"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'avatars'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Bucket: product-photos - public read
CREATE POLICY "Public can view product photos"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'product-photos');

-- Admin pode gerenciar todos os buckets
CREATE POLICY "Admin can manage all storage"
ON storage.objects FOR ALL
TO authenticated
USING (
  has_role(auth.uid(), 'admin'::public.app_role)
);

-- ============================================
-- 3. VERIFICAR BUCKETS CRIADOS
-- ============================================
SELECT id, name, public, file_size_limit FROM storage.buckets;

-- ============================================
-- 4. VERIFICAR POLITICAS
-- ============================================
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies
WHERE tablename = 'objects';
