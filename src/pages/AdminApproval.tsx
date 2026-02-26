import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useIsAdmin } from "@/hooks/useIsAdmin";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { CheckCircle, MessageCircle, User, Phone, MapPin, ShieldCheck } from "lucide-react";

interface PendingMontador {
  id: string;
  user_id: string;
  full_name: string;
  phone: string | null;
  city: string | null;
  selfie_url: string | null;
  document_url: string | null;
  experience_proof_url: string | null;
  pix_key: string | null;
  created_at: string;
}

const AdminApproval = () => {
  const { user } = useAuth();
  const { isAdmin, loading: adminLoading } = useIsAdmin(user);
  const [montadores, setMontadores] = useState<PendingMontador[]>([]);
  const [loading, setLoading] = useState(true);
  const [approving, setApproving] = useState<string | null>(null);

  useEffect(() => {
    if (isAdmin) fetchPending();
  }, [isAdmin]);

  const fetchPending = async () => {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("role", "montador")
      .eq("is_approved", false)
      .order("created_at", { ascending: false });
    if (!error && data) setMontadores(data as PendingMontador[]);
    setLoading(false);
  };

  const handleApprove = async (montador: PendingMontador) => {
    setApproving(montador.user_id);
    try {
      const { error } = await supabase
        .from("profiles")
        .update({ is_approved: true })
        .eq("user_id", montador.user_id);
      if (error) throw error;

      // Trigger welcome email
      await supabase.functions.invoke("notify-montador-approved", {
        body: { user_id: montador.user_id, name: montador.full_name },
      });

      toast.success(`${montador.full_name} aprovado com sucesso!`);
      fetchPending();
    } catch (err: any) {
      toast.error("Erro ao aprovar: " + err.message);
    } finally {
      setApproving(null);
    }
  };

  const openWhatsApp = (phone: string | null, name: string) => {
    if (!phone) {
      toast.error("Montador não informou telefone.");
      return;
    }
    const cleaned = phone.replace(/\D/g, "");
    const number = cleaned.startsWith("55") ? cleaned : `55${cleaned}`;
    window.open(`https://wa.me/${number}?text=${encodeURIComponent(`Olá ${name}, aqui é da equipe Clickmont!`)}`, "_blank");
  };

  if (adminLoading || loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-muted-foreground">Acesso restrito.</p>
      </div>
    );
  }

  return (
    <div className="container py-8 space-y-6 max-w-4xl">
      <div className="flex items-center gap-3">
        <ShieldCheck className="h-7 w-7 text-primary" />
        <h1 className="text-2xl font-bold">Aprovação de Montadores</h1>
        <Badge variant="outline">{montadores.length} pendente(s)</Badge>
      </div>

      {montadores.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            Nenhum montador pendente de aprovação.
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {montadores.map((m) => (
            <Card key={m.id}>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <User className="h-5 w-5" />
                  {m.full_name}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                  {m.phone && (
                    <span className="flex items-center gap-1">
                      <Phone className="h-3.5 w-3.5" /> {m.phone}
                    </span>
                  )}
                  {m.city && (
                    <span className="flex items-center gap-1">
                      <MapPin className="h-3.5 w-3.5" /> {m.city}
                    </span>
                  )}
                  {m.pix_key && <span>PIX: {m.pix_key}</span>}
                </div>

                <div className="flex flex-wrap gap-2 text-xs">
                  {m.selfie_url && (
                    <a href={m.selfie_url} target="_blank" rel="noopener noreferrer" className="text-primary underline">
                      Ver Selfie
                    </a>
                  )}
                  {m.document_url && (
                    <a href={m.document_url} target="_blank" rel="noopener noreferrer" className="text-primary underline">
                      Ver Documento
                    </a>
                  )}
                  {m.experience_proof_url && (
                    <a href={m.experience_proof_url} target="_blank" rel="noopener noreferrer" className="text-primary underline">
                      Ver Experiência
                    </a>
                  )}
                </div>

                <p className="text-xs text-muted-foreground">
                  Cadastrado em: {new Date(m.created_at).toLocaleString("pt-BR")}
                </p>

                <div className="flex gap-2 pt-2">
                  <Button
                    size="sm"
                    disabled={approving === m.user_id}
                    onClick={() => handleApprove(m)}
                  >
                    <CheckCircle className="h-4 w-4 mr-1" />
                    {approving === m.user_id ? "Aprovando..." : "Aprovar"}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => openWhatsApp(m.phone, m.full_name)}
                  >
                    <MessageCircle className="h-4 w-4 mr-1" />
                    Chamar no WhatsApp
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminApproval;
