-- ============================================
-- ClickMont - Setup de Infraestrutura
-- Execute no Supabase SQL Editor
-- Data: 2026-04-01
-- 
-- Para executar:
-- 1. Acesse: https://supabase.com/dashboard/project/zwfiadmmfgillrqhlbjw/sql
-- 2. Cole este SQL e clique em "Run"
-- ============================================

-- ============================================
-- 1. CRIAR STORAGE BUCKETS
-- ============================================
DO $$
BEGIN
    -- Bucket para documentos do usuario (notas fiscais, etc)
    IF NOT EXISTS (SELECT 1 FROM storage.buckets WHERE id = 'user-documents') THEN
        INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
        VALUES (
            'user-documents',
            'user-documents',
            false,
            10485760, -- 10MB
            ARRAY['image/png', 'image/jpeg', 'image/webp', 'application/pdf']::text[]
        );
        RAISE NOTICE 'Bucket user-documents criado';
    ELSE
        RAISE NOTICE 'Bucket user-documents ja existe';
    END IF;
    
    -- Bucket para fotos de produtos moveis
    IF NOT EXISTS (SELECT 1 FROM storage.buckets WHERE id = 'product-photos') THEN
        INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
        VALUES (
            'product-photos',
            'product-photos',
            true,
            5242880, -- 5MB
            ARRAY['image/png', 'image/jpeg', 'image/webp']::text[]
        );
        RAISE NOTICE 'Bucket product-photos criado';
    ELSE
        RAISE NOTICE 'Bucket product-photos ja existe';
    END IF;
    
    -- Bucket para avatares de perfil
    IF NOT EXISTS (SELECT 1 FROM storage.buckets WHERE id = 'avatars') THEN
        INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
        VALUES (
            'avatars',
            'avatars',
            true,
            2097152, -- 2MB
            ARRAY['image/png', 'image/jpeg', 'image/webp']::text[]
        );
        RAISE NOTICE 'Bucket avatars criado';
    ELSE
        RAISE NOTICE 'Bucket avatars ja existe';
    END IF;
END $$;

-- ============================================
-- 2. POLITICAS RLS PARA STORAGE
-- ============================================

-- user-documents: usuarios autenticados podem fazer upload
-- Apenas o dono do arquivo pode ver/baixar
DROP POLICY IF EXISTS "Users can upload to user-documents" ON storage.objects;
CREATE POLICY "Users can upload to user-documents"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
    bucket_id = 'user-documents'
    AND auth.uid()::text = (storage.foldername(name))[1]
);

DROP POLICY IF EXISTS "Users can view own files in user-documents" ON storage.objects;
CREATE POLICY "Users can view own files in user-documents"
ON storage.objects FOR SELECT
TO authenticated
USING (
    bucket_id = 'user-documents'
    AND auth.uid()::text = (storage.foldername(name))[1]
);

DROP POLICY IF EXISTS "Users can update own files in user-documents" ON storage.objects;
CREATE POLICY "Users can update own files in user-documents"
ON storage.objects FOR UPDATE
TO authenticated
USING (
    bucket_id = 'user-documents'
    AND auth.uid()::text = (storage.foldername(name))[1]
);

DROP POLICY IF EXISTS "Users can delete own files in user-documents" ON storage.objects;
CREATE POLICY "Users can delete own files in user-documents"
ON storage.objects FOR DELETE
TO authenticated
USING (
    bucket_id = 'user-documents'
    AND auth.uid()::text = (storage.foldername(name))[1]
);

-- avatars: leitura publica
DROP POLICY IF EXISTS "Public can view avatars" ON storage.objects;
CREATE POLICY "Public can view avatars"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'avatars');

DROP POLICY IF EXISTS "Authenticated can upload avatars" ON storage.objects;
CREATE POLICY "Authenticated can upload avatars"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
    bucket_id = 'avatars'
    AND auth.uid()::text = (storage.foldername(name))[1]
);

DROP POLICY IF EXISTS "Users can update own avatars" ON storage.objects;
CREATE POLICY "Users can update own avatars"
ON storage.objects FOR UPDATE
TO authenticated
USING (
    bucket_id = 'avatars'
    AND auth.uid()::text = (storage.foldername(name))[1]
);

-- product-photos: leitura publica
DROP POLICY IF EXISTS "Public can view product photos" ON storage.objects;
CREATE POLICY "Public can view product photos"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'product-photos');

-- Admin pode gerenciar todos os buckets
DROP POLICY IF EXISTS "Admin can manage all storage" ON storage.objects;
CREATE POLICY "Admin can manage all storage"
ON storage.objects FOR ALL
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM user_roles
        WHERE user_roles.user_id = auth.uid()
        AND user_roles.role = 'admin'::public.app_role
    )
);

-- ============================================
-- 3. VERIFICAR RESULTADO
-- ============================================
SELECT 
    'Buckets criados:' as info,
    string_agg(name, ', ') as buckets
FROM storage.buckets;

SELECT 
    policyname,
    cmd
FROM pg_policies
WHERE tablename = 'objects';
