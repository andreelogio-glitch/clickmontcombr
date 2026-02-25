
-- Storage RLS: user-documents bucket - only owner and admin can see
CREATE POLICY "Owner can view own documents"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'user-documents' 
  AND (
    auth.uid()::text = (storage.foldername(name))[1]
    OR public.has_role(auth.uid(), 'admin'::app_role)
  )
);

CREATE POLICY "Owner can upload own documents"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'user-documents' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Storage RLS: ticket-media bucket - only ticket owner and admin can see
CREATE POLICY "Owner can view own ticket media"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'ticket-media'
  AND (
    auth.uid()::text = (storage.foldername(name))[1]
    OR public.has_role(auth.uid(), 'admin'::app_role)
  )
);

CREATE POLICY "Owner can upload ticket media"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'ticket-media'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Admin can upload to ticket-media too
CREATE POLICY "Admin can upload ticket media"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'ticket-media'
  AND public.has_role(auth.uid(), 'admin'::app_role)
);
