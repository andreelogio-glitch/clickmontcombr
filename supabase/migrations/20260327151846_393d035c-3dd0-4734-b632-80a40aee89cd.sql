
-- 1. Create arrival-selfies bucket (public for easy URL access)
INSERT INTO storage.buckets (id, name, public)
VALUES ('arrival-selfies', 'arrival-selfies', true)
ON CONFLICT (id) DO NOTHING;

-- 2. RLS: Only authenticated montadores can upload
CREATE POLICY "Montadores upload selfies"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'arrival-selfies'
  AND EXISTS (
    SELECT 1 FROM public.profiles
    WHERE user_id = auth.uid() AND role = 'montador'
  )
);

-- 3. RLS: Anyone authenticated can view selfies
CREATE POLICY "Authenticated view selfies"
ON storage.objects
FOR SELECT
TO authenticated
USING (bucket_id = 'arrival-selfies');

-- 4. Add is_image column to chat_messages
ALTER TABLE public.chat_messages
ADD COLUMN IF NOT EXISTS is_image boolean NOT NULL DEFAULT false;
