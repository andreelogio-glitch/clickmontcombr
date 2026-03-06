import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { Wrench, Package, Truck, MapPin, FileText, Lock, ShieldCheck, Upload, CalendarDays, AlertTriangle } from "lucide-react";
import logoClickmont from "@/assets/logo-clickmont.png";

const FURNITURE_TYPES = [
  "Guarda-roupa",
  "Cozinha planejada",
  "Escritório",
  "Rack / Painel de TV",
  "Cama Box",
  "Mesa / Escrivaninha",
  "Armário de banheiro",
  "Estante",
  "Outro",
];

type ServiceType = "montagem" | "desmontagem" | "mudanca";

const SERVICE_OPTIONS: { value: ServiceType; label: string; icon: typeof Wrench; desc: string }[] = [
  { value: "montagem", label: "Apenas Montagem", icon: Wrench, desc: "Pagamento 100% após conclusão" },
  { value: "desmontagem", label: "Apenas Desmontagem", icon: Package, desc: "Pagamento 100% após conclusão" },
  { value: "mudanca", label: "Mudança (Des + Mont)", icon: Truck, desc: "Pagamento fracionado 40/60" },
];

const PedirMontagem = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [form, setForm] = useState({
    title: "",
    description: "",
    furniture_type: "",
    brand: "",
    address: "",
    city: "",
    service_type: "montagem" as ServiceType,
    preferred_date: "",
    is_urgent: false,
    needs_wall_mount: false,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setLoading(true);

    try {
      let photo_url: string | null = null;

      if (photoFile) {
        const fileExt = photoFile.name.split(".").pop();
        const filePath = `${user.id}/${Date.now()}.${fileExt}`;
        const { error: uploadError } = await supabase.storage
          .from("user-documents")
          .upload(filePath, photoFile);
        if (uploadError) throw uploadError;
        const { data: urlData } = supabase.storage.from("user-documents").getPublicUrl(filePath);
        photo_url = urlData.publicUrl;
      }

      // Map mudanca to desmontagem for DB (fractioned logic handled by service_type)
      const dbServiceType = form.service_type === "mudanca" ? "desmontagem" : form.service_type;

      const { data: createdOrderId, error } = await supabase.rpc("create_order_safe", {
        _title: form.title,
        _description: `${form.description}${form.preferred_date ? `\n📅 Data preferencial: ${form.preferred_date}` : ""}${form.is_urgent ? "\n⚠️ URGENTE" : ""}`,
        _furniture_type: form.furniture_type,
        _brand: form.brand || "",
        _address: form.address,
        _city: form.city,
        _service_type: dbServiceType,
        _photo_url: photo_url || "",
        _is_urgent: form.is_urgent,
        _needs_wall_mount: form.needs_wall_mount,
      });

      if (error) throw error;
      toast.success("Pedido criado com sucesso! Montadores da região serão notificados.");
      navigate(`/chat/${createdOrderId}`);
    } catch (error: any) {
      console.error("[orders.insert] Falha ao criar pedido:", error);
      toast.error("Erro ao criar pedido: " + error.message);
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto animate-fade-in space-y-4">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <img src={logoClickmont} alt="Clickmont" className="h-8 w-8" />
            <div>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5 text-primary" />
                Solicitar Serviço
              </CardTitle>
              <CardDescription>Descreva o móvel e o tipo de serviço desejado</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Service type selector */}
            <div>
              <Label>Tipo de serviço</Label>
              <div className="grid grid-cols-3 gap-3 mt-2">
                {SERVICE_OPTIONS.map(({ value, label, icon: Icon, desc }) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setForm({ ...form, service_type: value })}
                    className={`rounded-lg border-2 p-3 text-center text-sm font-medium transition-all ${
                      form.service_type === value
                        ? "border-primary bg-accent text-accent-foreground"
                        : "border-border text-muted-foreground hover:border-muted-foreground"
                    }`}
                  >
                    <Icon className="h-5 w-5 mx-auto mb-1" />
                    <span className="block text-xs font-semibold">{label}</span>
                    <span className="block text-[10px] text-muted-foreground mt-0.5">{desc}</span>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <Label htmlFor="title">Título do pedido</Label>
              <Input
                id="title"
                placeholder={`Ex: ${form.service_type === "desmontagem" ? "Desmontagem" : form.service_type === "mudanca" ? "Mudança" : "Montagem"} guarda-roupa casal`}
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                required
              />
            </div>

            <div>
              <Label>Tipo de móvel</Label>
              <Select value={form.furniture_type} onValueChange={(v) => setForm({ ...form, furniture_type: v })} required>
                <SelectTrigger><SelectValue placeholder="Selecione o tipo" /></SelectTrigger>
                <SelectContent>
                  {FURNITURE_TYPES.map((t) => (
                    <SelectItem key={t} value={t}>{t}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="brand">Marca (opcional)</Label>
              <Input id="brand" placeholder="Ex: Madesa, Bartira, MDF..." value={form.brand} onChange={(e) => setForm({ ...form, brand: e.target.value })} />
            </div>

            <div>
              <Label htmlFor="description"><FileText className="h-4 w-4 inline mr-1" />Descrição detalhada</Label>
              <Textarea id="description" placeholder="Descreva detalhes: quantidade de peças, observações, andares..." value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} required rows={4} />
            </div>

            {/* Photo upload */}
            <div>
              <Label><Upload className="h-4 w-4 inline mr-1" />Foto do móvel (opcional)</Label>
              <Input
                type="file"
                accept="image/*"
                onChange={(e) => setPhotoFile(e.target.files?.[0] || null)}
                className="mt-1"
              />
              {photoFile && <p className="text-xs text-muted-foreground mt-1">📷 {photoFile.name}</p>}
            </div>

            {/* Cidade */}
            <div>
              <Label><MapPin className="h-4 w-4 inline mr-1" />Cidade</Label>
              <Select value={form.city} onValueChange={(v) => setForm({ ...form, city: v })} required>
                <SelectTrigger className="mt-1"><SelectValue placeholder="Selecione a cidade" /></SelectTrigger>
                <SelectContent>
                  {["Campinas", "Sumaré", "Hortolândia", "Valinhos", "Vinhedo", "Paulínia"].map((c) => (
                    <SelectItem key={c} value={c}>{c}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="address"><MapPin className="h-4 w-4 inline mr-1" />Endereço (Bairro e complemento)</Label>
              <Input id="address" placeholder="Bairro, Rua, Número" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} required />
              <p className="text-[10px] text-muted-foreground mt-1">O endereço completo só será visível ao montador após o pagamento.</p>
            </div>

            {/* Preferred date */}
            <div>
              <Label htmlFor="preferred_date"><CalendarDays className="h-4 w-4 inline mr-1" />Data preferencial (opcional)</Label>
              <Input
                id="preferred_date"
                type="date"
                value={form.preferred_date}
                onChange={(e) => setForm({ ...form, preferred_date: e.target.value })}
              />
            </div>

            {/* Wall mount checkbox */}
            <div className="flex items-start gap-2 rounded-lg border border-border p-3">
              <Checkbox
                id="needs_wall_mount"
                checked={form.needs_wall_mount}
                onCheckedChange={(checked) => setForm({ ...form, needs_wall_mount: checked === true })}
              />
              <Label htmlFor="needs_wall_mount" className="text-sm cursor-pointer leading-relaxed">
                Precisa de instalação na parede? (Ex: Painéis, armários suspensos, nichos)
              </Label>
            </div>

            {/* Urgent checkbox */}
            <div className="flex items-center gap-2">
              <Checkbox
                id="is_urgent"
                checked={form.is_urgent}
                onCheckedChange={(checked) => setForm({ ...form, is_urgent: checked === true })}
              />
              <Label htmlFor="is_urgent" className="flex items-center gap-1 text-sm cursor-pointer">
                <AlertTriangle className="h-4 w-4 text-warning" /> É Urgente?
              </Label>
            </div>

            <Button type="submit" className="w-full gradient-primary text-primary-foreground" disabled={loading}>
              {loading ? "Enviando..." : "Solicitar Serviço"}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Trust & Guarantee Card */}
      <Card className="border-[hsl(210,60%,85%)] bg-[hsl(210,60%,97%)]">
        <CardContent className="pt-5 space-y-3">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-primary" />
            <p className="text-sm font-semibold text-foreground">Pagamento Seguro via Mercado Pago</p>
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed">
            O seu dinheiro fica retido com segurança. A Clickmont só liberta o pagamento ao montador após a sua confirmação de cada etapa do serviço.
          </p>
          <p className="text-[10px] text-muted-foreground flex items-center gap-1">
           <Lock className="h-3 w-3" /> Ambiente criptografado e monitorado
          </p>
          <Link to="/termos-e-privacidade" className="text-[10px] text-primary hover:underline inline-flex items-center gap-1 mt-1">
            📄 Termos de Uso e Política de Privacidade
          </Link>
        </CardContent>
      </Card>
    </div>
  );
};

export default PedirMontagem;