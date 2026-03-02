import { useSignedUrl } from "@/hooks/useSignedUrl";

interface SignedImageProps {
  bucket: string;
  path: string | null | undefined;
  alt: string;
  className?: string;
  onClick?: () => void;
}

/**
 * Renders an image from a private storage bucket using a signed URL.
 * Handles both legacy full URLs and path-only references.
 */
export function SignedImage({ bucket, path, alt, className, onClick }: SignedImageProps) {
  const url = useSignedUrl(bucket, path);

  if (!url) return null;

  return (
    <img
      src={url}
      alt={alt}
      className={className}
      onClick={onClick}
    />
  );
}
