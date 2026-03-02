import { supabase } from "@/integrations/supabase/client";

/**
 * Generate a signed URL for a file in a private bucket.
 * Returns null if the path is empty/null or if signing fails.
 * If the path is already a full URL (legacy data), returns it as-is.
 */
export async function getSignedUrl(
  bucket: string,
  path: string | null | undefined,
  expiresInSeconds = 7200 // 2 hours
): Promise<string | null> {
  if (!path) return null;

  // Legacy: if it's already a full URL, return as-is
  if (path.startsWith("http://") || path.startsWith("https://")) {
    return path;
  }

  const { data, error } = await supabase.storage
    .from(bucket)
    .createSignedUrl(path, expiresInSeconds);

  if (error || !data?.signedUrl) {
    console.error("Failed to create signed URL:", error?.message);
    return null;
  }

  return data.signedUrl;
}

/**
 * Generate multiple signed URLs in parallel.
 */
export async function getSignedUrls(
  bucket: string,
  paths: (string | null | undefined)[],
  expiresInSeconds = 7200
): Promise<(string | null)[]> {
  return Promise.all(
    paths.map((p) => getSignedUrl(bucket, p, expiresInSeconds))
  );
}
