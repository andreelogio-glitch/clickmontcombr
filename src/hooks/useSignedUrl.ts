import { useState, useEffect } from "react";
import { getSignedUrl } from "@/lib/storage";

/**
 * Hook to resolve a storage path to a signed URL.
 * Handles both legacy full URLs and new path-only references.
 */
export function useSignedUrl(
  bucket: string,
  path: string | null | undefined,
  expiresInSeconds = 7200
) {
  const [url, setUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!path) {
      setUrl(null);
      return;
    }
    // If already a full URL, use directly
    if (path.startsWith("http://") || path.startsWith("https://")) {
      setUrl(path);
      return;
    }
    let cancelled = false;
    getSignedUrl(bucket, path, expiresInSeconds).then((signed) => {
      if (!cancelled) setUrl(signed);
    });
    return () => { cancelled = true; };
  }, [bucket, path, expiresInSeconds]);

  return url;
}
