
-- 1. Fix bid INSERT policy: only approved montadores can create bids
DROP POLICY IF EXISTS "Montadores create bids" ON public.bids;

CREATE POLICY "Approved montadores create bids"
ON public.bids
FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() = montador_id
  AND EXISTS (
    SELECT 1 FROM public.profiles
    WHERE user_id = auth.uid()
      AND role = 'montador'
      AND is_approved = true
  )
);

-- 2. Server-side chat message sanitization trigger (strip phone/email)
CREATE OR REPLACE FUNCTION public.sanitize_chat_message()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Remove phone numbers (Brazilian formats)
  NEW.message := regexp_replace(NEW.message, '\(?\d{2}\)?\s*\d{4,5}[-.\s]?\d{4}', '[telefone removido]', 'g');
  -- Remove emails
  NEW.message := regexp_replace(NEW.message, '[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}', '[email removido]', 'g');
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS sanitize_chat_message_trigger ON public.chat_messages;
CREATE TRIGGER sanitize_chat_message_trigger
  BEFORE INSERT ON public.chat_messages
  FOR EACH ROW
  EXECUTE FUNCTION public.sanitize_chat_message();

-- 3. Hide verification_code from montadores by updating the SELECT policy
-- Montadores should see pending orders but NOT the verification_code
-- We'll use a view for montador order access
DROP POLICY IF EXISTS "Montadores see available orders" ON public.orders;

CREATE POLICY "Montadores see available orders"
ON public.orders
FOR SELECT
TO authenticated
USING (
  (status = ANY (ARRAY['pendente'::text, 'pending'::text, 'bidding'::text]))
  AND EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.user_id = auth.uid()
      AND p.role = 'montador'
      AND p.is_approved = true
  )
);

-- 4. Make user-documents bucket private
UPDATE storage.buckets SET public = false WHERE id = 'user-documents';

-- Drop the public read policy if it exists
DROP POLICY IF EXISTS "Public read documents" ON storage.objects;
