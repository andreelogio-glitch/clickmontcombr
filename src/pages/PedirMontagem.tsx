import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Package, MapPin, FileText } from "lucide-react";

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

const PedirMontagem = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    title: "",
    description: "",
    furniture_type: "",
    brand: "",
    address: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setLoading(true);

    try {
      const { error } = await supabase.from("orders").insert({
        client_id: user.id,
        title: form.title,
        description: form.description,
        furniture_type: form.furniture_type,
        brand: form.brand || null,
        address: form.address,
      });
      if (error) throw error;
      toast.success("Pedido de montagem criado com sucesso!");
      navigate("/");
    } catch (error: any) {
      toast.error("Erro ao criar pedido: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto animate-fade-in">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5 text-primary" />
            Pedir Montagem
          </CardTitle>
          <CardDescription>Descreva o móvel e onde ele será montado</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="title">Título do pedido</Label>
              <Input
                id="title"
                placeholder="Ex: Montagem guarda-roupa casal"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                required
              />
            </div>

            <div>
              <Label>Tipo de móvel</Label>
              <Select
                value={form.furniture_type}
                onValueChange={(v) => setForm({ ...form, furniture_type: v })}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o tipo" />
                </SelectTrigger>
                <SelectContent>
                  {FURNITURE_TYPES.map((t) => (
                    <SelectItem key={t} value={t}>{t}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="brand">Marca (opcional)</Label>
              <Input
                id="brand"
                placeholder="Ex: Madesa, Bartira, MDF..."
                value={form.brand}
                onChange={(e) => setForm({ ...form, brand: e.target.value })}
              />
            </div>

            <div>
              <Label htmlFor="description">
                <FileText className="h-4 w-4 inline mr-1" />
                Descrição
              </Label>
              <Textarea
                id="description"
                placeholder="Descreva detalhes: quantidade de peças, observações..."
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                required
                rows={4}
              />
            </div>

            <div>
              <Label htmlFor="address">
                <MapPin className="h-4 w-4 inline mr-1" />
                Endereço da montagem
              </Label>
              <Input
                id="address"
                placeholder="Rua, número, bairro, cidade"
                value={form.address}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
                required
              />
            </div>

            <Button type="submit" className="w-full gradient-primary text-primary-foreground" disabled={loading}>
              {loading ? "Enviando..." : "Enviar Pedido"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default PedirMontagem;
