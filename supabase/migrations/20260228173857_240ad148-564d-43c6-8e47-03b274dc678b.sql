-- Remove dangerous public/anon read policies on storage
DROP POLICY IF EXISTS "Public read documents" ON storage.objects;
DROP POLICY IF EXISTS "Public read ticket media" ON storage.objects;