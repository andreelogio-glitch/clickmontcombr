import { useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Camera, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface CameraCaptureProps {
  orderId: string;
  userId: string;
  disabled?: boolean;
}

const CameraCapture = ({ orderId, userId, disabled }: CameraCaptureProps) => {
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleCapture = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const fileName = `selfie-${orderId}-${Date.now()}.jpg`;
      const { error: upErr } = await supabase.storage
        .from("arrival-selfies")
        .upload(fileName, file, { contentType: file.type || "image/jpeg" });
      if (upErr) throw upErr;

      const { data: urlData } = supabase.storage
        .from("arrival-selfies")
        .getPublicUrl(fileName);

      await supabase.from("chat_messages").insert({
        order_id: orderId,
        sender_id: userId,
        message: urlData.publicUrl,
        is_preset: false,
        is_image: true,
      } as any);

      toast.success("📸 Selfie enviada ao cliente!");
    } catch (err: any) {
      toast.error("Erro ao enviar selfie: " + err.message);
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  return (
    <>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        capture="user"
        className="hidden"
        onChange={handleCapture}
      />
      <Button
        variant="outline"
        onClick={() => inputRef.current?.click()}
        disabled={disabled || uploading}
        title="Enviar selfie de chegada"
      >
        {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Camera className="h-4 w-4" />}
      </Button>
    </>
  );
};

export default CameraCapture;
