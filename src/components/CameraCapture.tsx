import { useState, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Camera, RefreshCw, Check, X, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface CameraCaptureProps {
  orderId: string;
  userId: string;
  onUploadSuccess?: (url: string) => void;
}

const CameraCapture = ({ orderId, userId, onUploadSuccess }: CameraCaptureProps) => {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [photo, setPhoto] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user" },
      });
      setStream(mediaStream);
      if (videoRef.current) videoRef.current.srcObject = mediaStream;
    } catch {
      toast.error("Não foi possível acessar a câmera.");
    }
  };

  const takePhoto = () => {
    if (!videoRef.current) return;
    const canvas = document.createElement("canvas");
    canvas.width = videoRef.current.videoWidth || 640;
    canvas.height = videoRef.current.videoHeight || 480;
    canvas.getContext("2d")?.drawImage(videoRef.current, 0, 0);
    setPhoto(canvas.toDataURL("image/jpeg"));
    stopCamera();
  };

  const stopCamera = () => {
    stream?.getTracks().forEach((track) => track.stop());
    setStream(null);
  };

  const uploadSelfie = async () => {
    if (!photo) return;
    setUploading(true);
    try {
      const blob = await (await fetch(photo)).blob();
      const fileName = `selfie-${orderId}-${Date.now()}.jpg`;

      const { error: upErr } = await supabase.storage
        .from("arrival-selfies")
        .upload(fileName, blob, { contentType: "image/jpeg" });
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
      onUploadSuccess?.(urlData.publicUrl);
      setPhoto(null);
    } catch (err: any) {
      toast.error("Erro ao enviar selfie: " + err.message);
    } finally {
      setUploading(false);
    }
  };

  const retake = () => {
    setPhoto(null);
    startCamera();
  };

  const cancel = () => {
    setPhoto(null);
    stopCamera();
  };

  return (
    <div>
      {/* Initial state: show camera button */}
      {!stream && !photo && (
        <Button variant="outline" onClick={startCamera} title="Tirar selfie de chegada">
          <Camera className="h-4 w-4 mr-2" />
          Tirar Selfie
        </Button>
      )}

      {/* Camera active: show video feed */}
      {stream && (
        <div className="space-y-2">
          <div className="relative rounded-lg overflow-hidden border border-border">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full max-h-64 object-cover rounded-lg"
            />
          </div>
          <div className="flex gap-2 justify-center">
            <Button variant="outline" size="sm" onClick={cancel}>
              <X className="h-4 w-4 mr-1" /> Cancelar
            </Button>
            <Button size="sm" className="gradient-primary text-primary-foreground" onClick={takePhoto}>
              <Camera className="h-4 w-4 mr-1" /> Capturar
            </Button>
          </div>
        </div>
      )}

      {/* Photo preview: confirm or retake */}
      {photo && (
        <div className="space-y-2">
          <div className="relative rounded-lg overflow-hidden border border-border">
            <img src={photo} alt="Selfie preview" className="w-full max-h-64 object-cover rounded-lg" />
          </div>
          <div className="flex gap-2 justify-center">
            <Button variant="outline" size="sm" onClick={retake} disabled={uploading}>
              <RefreshCw className="h-4 w-4 mr-1" /> Refazer
            </Button>
            <Button
              size="sm"
              className="gradient-primary text-primary-foreground"
              onClick={uploadSelfie}
              disabled={uploading}
            >
              {uploading ? (
                <Loader2 className="h-4 w-4 mr-1 animate-spin" />
              ) : (
                <Check className="h-4 w-4 mr-1" />
              )}
              Confirmar
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CameraCapture;
