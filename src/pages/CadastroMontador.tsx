import { useState, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { Wrench, Camera, FileText, Upload, DollarSign } from "lucide-react";
import logoClickmont from "@/assets/logo-clickmont.png";

const CadastroMontador = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [pixKey, setPixKey] = useState("");
  const [bio, setBio] = useState("");
  const [lgpdAccepted, setLgpdAccepted] = useState(false);

  const [selfieFile, setSelfieFile] = useState<File | null>(null);
  const [documentFile, setDocumentFile] = useState<File | null>(null);
  const [experienceFile, setExperienceFile] = useState<File | null>(null);
  const selfieRef = useRef<HTMLInputElement>(null);
  const documentRef = useRef<HTMLInputElement>(null);
  const experienceRef = useRef<HTMLInputElement>(null);

  const uploadFile = async (file: File, userId: string, folder: string): Promise<string | null> => {
    const ext = file.name.split(".").pop();
    const path = `${userId}/${folder}.${ext}`;
    const { error } = await supabase.storage.from("user-documents").upload(path, file, { upsert: true });
    if (error) { console.error("Upload error:", error); return null; }
    const { data } = supabase.storage.from("user-documents").getPublicUrl(path);
    return data.publicUrl;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!lgpdAccepted) { toast.error("Aceite a Política de Privacidade para continuar."); return; }
    if (!selfieFile || !documentFile || !experienceFile) {
      toast.error("Envie selfie, documento e comprovação de experiência.");
      return;
    }
    setLoading(true);
    try {
      const { data: signUpData, error } = await supabase.auth.signUp({
        email, password,
        options: { data: { full_name: fullName, role: "montador" } },
      });
      if (error) throw error;

      const userId = signUpData.user?.id;
      if (userId) {
        const [selfieUrl, docUrl, expUrl] = await Promise.all([
          uploadFile(selfieFile, userId, "selfie"),
          uploadFile(documentFile, userId, "documento"),
          uploadFile(experienceFile, userId, "experiencia"),
        ]);
        await supabase.from("profiles").update({
          phone: phone || null,
          pix_key: pixKey || null,
          lgpd_accepted_at: new Date().toISOString(),
          selfie_url: selfieUrl,
          document_url: docUrl,
          experience_proof_url: expUrl,
        }).eq("user_id", userId);
      }
      toast.success("Conta de montador criada! Verifique seu e-mail para confirmar.");
      navigate("/");
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-lg animate-fade-in">
        <CardHeader className="text-center">
          <img src={logoClickmont} alt="Clickmont" className="mx-auto mb-3 h-14 w-14 object-contain" />
          <CardTitle className="text-2xl font-bold flex items-center justify-center gap-2">
            <Wrench className="h-6 w-6 text-primary" /> Cadastro Montador
          </CardTitle>
          <CardDescription>Preencha seus dados para começar a receber pedidos</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label>Nome completo</Label>
              <Input value={fullName} onChange={(e) => setFullName(e.target.value)} required placeholder="Seu nome" />
            </div>
            <div>
              <Label>E-mail</Label>
              <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="seu@email.com" />
            </div>
            <div>
              <Label>Senha</Label>
              <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} placeholder="Mínimo 6 caracteres" />
            </div>
            <div>
              <Label>Telefone</Label>
              <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="(11) 99999-9999" />
            </div>

            <div className="space-y-3 rounded-lg border border-border p-4">
              <p className="text-sm font-semibold">Verificação obrigatória</p>

              <div>
                <Label className="text-xs flex items-center gap-1"><DollarSign className="h-3.5 w-3.5" /> Chave PIX</Label>
                <Input placeholder="CPF, email, telefone ou chave aleatória" value={pixKey} onChange={(e) => setPixKey(e.target.value)} required className="mt-1" />
              </div>

              <div>
                <Label className="text-xs flex items-center gap-1"><Camera className="h-3.5 w-3.5" /> Selfie</Label>
                <input ref={selfieRef} type="file" accept="image/*" capture="user" className="hidden" onChange={(e) => setSelfieFile(e.target.files?.[0] || null)} />
                <Button type="button" variant="outline" size="sm" className="w-full mt-1" onClick={() => selfieRef.current?.click()}>
                  {selfieFile ? `✓ ${selfieFile.name}` : "Tirar selfie / enviar foto"}
                </Button>
              </div>

              <div>
                <Label className="text-xs flex items-center gap-1"><FileText className="h-3.5 w-3.5" /> Documento (RG ou CNH)</Label>
                <input ref={documentRef} type="file" accept="image/*,.pdf" className="hidden" onChange={(e) => setDocumentFile(e.target.files?.[0] || null)} />
                <Button type="button" variant="outline" size="sm" className="w-full mt-1" onClick={() => documentRef.current?.click()}>
                  {documentFile ? `✓ ${documentFile.name}` : "Enviar documento"}
                </Button>
              </div>

              <div>
                <Label className="text-xs flex items-center gap-1"><Upload className="h-3.5 w-3.5" /> Comprovação de experiência</Label>
                <p className="text-xs text-muted-foreground mb-1">Carteira de trabalho ou MEI (mín. 6 meses)</p>
                <input ref={experienceRef} type="file" accept="image/*,.pdf" className="hidden" onChange={(e) => setExperienceFile(e.target.files?.[0] || null)} />
                <Button type="button" variant="outline" size="sm" className="w-full mt-1" onClick={() => experienceRef.current?.click()}>
                  {experienceFile ? `✓ ${experienceFile.name}` : "Enviar comprovação"}
                </Button>
              </div>

              <div>
                <Label className="text-xs">Bio / experiência</Label>
                <Textarea placeholder="Descreva brevemente sua experiência..." value={bio} onChange={(e) => setBio(e.target.value)} rows={3} className="mt-1" />
              </div>
            </div>

            <div className="flex items-start gap-2 rounded-lg border border-border p-3">
              <Checkbox id="lgpd" checked={lgpdAccepted} onCheckedChange={(v) => setLgpdAccepted(v === true)} />
              <label htmlFor="lgpd" className="text-xs text-muted-foreground leading-relaxed cursor-pointer">
                Li e aceito os{" "}
                <Link to="/termos-e-privacidade" target="_blank" className="text-primary underline hover:text-primary/80">
                  Termos de Uso e Política de Privacidade
                </Link>{" "}
                da Clickmont (LGPD).
              </label>
            </div>

            <Button type="submit" className="w-full gradient-primary text-primary-foreground" disabled={loading}>
              {loading ? "Cadastrando..." : "Cadastrar como Montador"}
            </Button>

            <p className="text-center text-sm text-muted-foreground">
              Já tem conta? <button type="button" onClick={() => navigate("/")} className="text-primary hover:underline">Fazer login</button>
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default CadastroMontador;
