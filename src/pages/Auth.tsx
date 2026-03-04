import { useState, useRef, useEffect } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { User, Wrench, Camera, FileText, Upload, DollarSign, LogOut } from "lucide-react";
import logoClickmont from "@/assets/logo-clickmont.png";

const Auth = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [role, setRole] = useState<"cliente" | "montador">("cliente");
  const [lgpdAccepted, setLgpdAccepted] = useState(false);
  const [loading, setLoading] = useState(false);

  // Montador verification files
  const [selfieFile, setSelfieFile] = useState<File | null>(null);
  const [documentFile, setDocumentFile] = useState<File | null>(null);
  const [experienceFile, setExperienceFile] = useState<File | null>(null);
  const [pixKey, setPixKey] = useState("");
  const selfieRef = useRef<HTMLInputElement>(null);
  const documentRef = useRef<HTMLInputElement>(null);
  const experienceRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const roleParam = searchParams.get("role");
    if (roleParam === "cliente" || roleParam === "montador") {
      setRole(roleParam);
      setIsLogin(false);
    }
  }, [searchParams]);

  const uploadFile = async (file: File, userId: string, folder: string): Promise<string | null> => {
    const ext = file.name.split(".").pop();
    const path = `${userId}/${folder}.${ext}`;
    const { error } = await supabase.storage.from("user-documents").upload(path, file, { upsert: true });
    if (error) {
      console.error("Upload error:", error);
      return null;
    }
    const { data } = supabase.storage.from("user-documents").getPublicUrl(path);
    return data.publicUrl;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isLogin && !lgpdAccepted) {
      toast.error("Você precisa aceitar a Política de Privacidade (LGPD) para continuar.");
      return;
    }
    if (!isLogin && role === "montador") {
      if (!selfieFile || !documentFile || !experienceFile) {
        toast.error("Montador precisa enviar selfie, documento e comprovação de experiência.");
        return;
      }
    }
    setLoading(true);

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        toast.success("Login realizado com sucesso!");
        // Let Index handle role-based routing — just navigate to root
        window.location.hash = "#/";
      } else {
        const { data: signUpData, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { full_name: fullName, role },
          },
        });
        if (error) throw error;

        const userId = signUpData.user?.id;
        if (userId) {
          // Update profile with phone and LGPD
          const updates: Record<string, any> = {
            role,
            phone: phone || null,
            lgpd_accepted_at: new Date().toISOString(),
          };

          if (role === "montador") {
            updates.pix_key = pixKey || null;
            updates.is_approved = false;
          }

          if (role === "montador" && selfieFile && documentFile && experienceFile) {
            const [selfieUrl, docUrl, expUrl] = await Promise.all([
              uploadFile(selfieFile, userId, "selfie"),
              uploadFile(documentFile, userId, "documento"),
              uploadFile(experienceFile, userId, "experiencia"),
            ]);
            updates.selfie_url = selfieUrl;
            updates.document_url = docUrl;
            updates.experience_proof_url = expUrl;
          }

          await supabase.from("profiles").update(updates).eq("user_id", userId);
        }

        toast.success("Conta criada com sucesso!");
        window.location.hash = "#/";
      }
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background p-4">
      {/* Top bar with logout */}
      <div className="flex justify-end mb-4">
        <Button variant="ghost" size="sm" onClick={async () => { await supabase.auth.signOut(); navigate("/"); }} className="text-muted-foreground">
          <LogOut className="h-4 w-4 mr-1" /> Sair
        </Button>
      </div>
      <div className="flex-1 flex items-center justify-center">
      <Card className="w-full max-w-md animate-fade-in">
        <CardHeader className="text-center">
          <img src={logoClickmont} alt="Clickmont" className="mx-auto mb-3 h-16 w-16 object-contain" />
          <CardTitle className="text-2xl font-bold text-foreground">Clickmont</CardTitle>
          <CardDescription>
            {isLogin ? "Acesse sua conta" : "Crie sua conta"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <>
                <div>
                  <Label htmlFor="fullName">Nome completo</Label>
                  <Input id="fullName" value={fullName} onChange={(e) => setFullName(e.target.value)} required placeholder="Seu nome" />
                </div>
                <div>
                  <Label htmlFor="phone">Telefone</Label>
                  <Input id="phone" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="(11) 99999-9999" />
                </div>
                <div>
                  <Label>Eu sou:</Label>
                  <div className="grid grid-cols-2 gap-3 mt-2">
                    <button
                      type="button"
                      onClick={() => setRole("cliente")}
                      className={`flex flex-col items-center gap-2 rounded-lg border-2 p-4 transition-all ${
                        role === "cliente" ? "border-primary bg-accent" : "border-border hover:border-muted-foreground"
                      }`}
                    >
                      <User className={`h-6 w-6 ${role === "cliente" ? "text-primary" : "text-muted-foreground"}`} />
                      <span className={`text-sm font-medium ${role === "cliente" ? "text-accent-foreground" : "text-muted-foreground"}`}>Cliente</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setRole("montador")}
                      className={`flex flex-col items-center gap-2 rounded-lg border-2 p-4 transition-all ${
                        role === "montador" ? "border-primary bg-accent" : "border-border hover:border-muted-foreground"
                      }`}
                    >
                      <Wrench className={`h-6 w-6 ${role === "montador" ? "text-primary" : "text-muted-foreground"}`} />
                      <span className={`text-sm font-medium ${role === "montador" ? "text-accent-foreground" : "text-muted-foreground"}`}>Montador</span>
                    </button>
                  </div>
                </div>

                {/* Montador verification */}
                {role === "montador" && (
                  <div className="space-y-3 rounded-lg border border-border p-4">
                    <p className="text-sm font-medium text-foreground">Verificação obrigatória do montador</p>

                    <div>
                      <Label className="text-xs flex items-center gap-1">
                        <DollarSign className="h-3.5 w-3.5" /> Chave PIX (para recebimentos)
                      </Label>
                      <Input
                        placeholder="CPF, email, telefone ou chave aleatória"
                        value={pixKey}
                        onChange={(e) => setPixKey(e.target.value)}
                        className="mt-1"
                        required
                      />
                      <p className="text-xs text-muted-foreground mt-1">É através dessa chave que você receberá seus pagamentos.</p>
                    </div>

                    <div>
                      <Label className="text-xs flex items-center gap-1">
                        <Camera className="h-3.5 w-3.5" /> Selfie (foto do rosto)
                      </Label>
                      <input ref={selfieRef} type="file" accept="image/*" capture="user" className="hidden" onChange={(e) => setSelfieFile(e.target.files?.[0] || null)} />
                      <Button type="button" variant="outline" size="sm" className="w-full mt-1" onClick={() => selfieRef.current?.click()}>
                        {selfieFile ? `✓ ${selfieFile.name}` : "Tirar selfie / enviar foto"}
                      </Button>
                    </div>

                    <div>
                      <Label className="text-xs flex items-center gap-1">
                        <FileText className="h-3.5 w-3.5" /> Documento (RG ou CNH)
                      </Label>
                      <input ref={documentRef} type="file" accept="image/*,.pdf" className="hidden" onChange={(e) => setDocumentFile(e.target.files?.[0] || null)} />
                      <Button type="button" variant="outline" size="sm" className="w-full mt-1" onClick={() => documentRef.current?.click()}>
                        {documentFile ? `✓ ${documentFile.name}` : "Enviar documento"}
                      </Button>
                    </div>

                    <div>
                      <Label className="text-xs flex items-center gap-1">
                        <Upload className="h-3.5 w-3.5" /> Comprovação de experiência
                      </Label>
                      <p className="text-xs text-muted-foreground mb-1">Carteira de trabalho ou MEI com mín. 6 meses de atuação</p>
                      <input ref={experienceRef} type="file" accept="image/*,.pdf" className="hidden" onChange={(e) => setExperienceFile(e.target.files?.[0] || null)} />
                      <Button type="button" variant="outline" size="sm" className="w-full mt-1" onClick={() => experienceRef.current?.click()}>
                        {experienceFile ? `✓ ${experienceFile.name}` : "Enviar comprovação"}
                      </Button>
                    </div>
                  </div>
                )}

                {/* LGPD */}
                <div className="flex items-start gap-2 rounded-lg border border-border p-3">
                  <Checkbox id="lgpd" checked={lgpdAccepted} onCheckedChange={(v) => setLgpdAccepted(v === true)} />
                   <label htmlFor="lgpd" className="text-xs text-muted-foreground leading-relaxed cursor-pointer">
                    Ao cadastrar-se, você concorda com nossos{" "}
                    <Link to="/termos-de-uso" className="text-primary underline hover:text-primary/80" target="_blank" onClick={(e) => e.stopPropagation()}>Termos de Uso</Link> e{" "}
                    <Link to="/politica-de-privacidade" className="text-primary underline hover:text-primary/80" target="_blank" onClick={(e) => e.stopPropagation()}>Política de Privacidade</Link> da ClickMont, em conformidade com a LGPD (Lei nº 13.709/2018).
                  </label>
                </div>
              </>
            )}
            <div>
              <Label htmlFor="email">E-mail</Label>
              <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="seu@email.com" />
            </div>
            <div>
              <Label htmlFor="password">Senha</Label>
              <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} placeholder="Mínimo 6 caracteres" />
            </div>
            <Button type="submit" className="w-full gradient-primary text-primary-foreground" disabled={loading}>
              {loading ? "Carregando..." : isLogin ? "Entrar" : "Criar conta"}
            </Button>
          </form>
          <div className="mt-4 text-center">
            <button onClick={() => setIsLogin(!isLogin)} className="text-sm text-primary hover:underline">
              {isLogin ? "Não tem conta? Cadastre-se" : "Já tem conta? Faça login"}
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
    </div>
  );
};

export default Auth;
