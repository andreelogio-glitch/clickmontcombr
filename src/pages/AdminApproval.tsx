import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useIsAdmin } from "@/hooks/useIsAdmin";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { CheckCircle, XCircle, MessageCircle, User, Phone, MapPin, ShieldCheck, LogOut, ArrowLeft } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { useNavigate } from "react-router-dom";

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
  const { user, signOut } = useAuth();
  const { isAdmin, loading: adminLoading } = useIsAdmin(user);
  const navigate = useNavigate();
  const [montadores, setMontadores] = useState<PendingMontador[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<string | null>(null);
  const [rejectTarget, setRejectTarget] = useState<PendingMontador | null>(null);

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
    setProcessing(montador.user_id);
    try {
      const { error } = await supabase
        .from("profiles")
        .update({ is_approved: true })
        .eq("user_id", montador.user_id);
      if (error) throw error;

      await supabase.functions.invoke("notify-montador-approved", {
        body: { user_id: montador.user_id, name: montador.full_name },
      });

      toast.success(`${montador.full_name} aprovado com sucesso!`);
      fetchPending();
    } catch (err: any) {
      toast.error("Erro ao aprovar: " + err.message);
    } finally {
      setProcessing(null);
    }
  };

  const handleReject = async (montador: PendingMontador) => {
    setProcessing(montador.user_id);
    try {
      // Change role back to cliente effectively rejecting the montador
      const { error } = await supabase
        .from("profiles")
        .update({ role: "cliente", is_approved: false } as any)
        .eq("user_id", montador.user_id);
      if (error) throw error;

      toast.success(`${montador.full_name} recusado.`);
      setRejectTarget(null);
      fetchPending();
    } catch (err: any) {
      toast.error("Erro ao recusar: " + err.message);
    } finally {
      setProcessing(null);
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
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <p className="text-muted-foreground">Acesso restrito.</p>
        <Button variant="ghost" size="sm" onClick={signOut}><LogOut className="h-4 w-4 mr-1" /> Sair</Button>
      </div>
    );
  }

  return (
    <div className="container py-8 space-y-6 max-w-4xl">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" onClick={() => navigate("/admin")} className="gap-1">
            <ArrowLeft className="h-4 w-4" /> Voltar ao Painel
          </Button>
          <ShieldCheck className="h-7 w-7 text-primary" />
          <h1 className="text-2xl font-bold">Aprovação de Montadores</h1>
          <Badge variant="outline">{montadores.length} pendente(s)</Badge>
        </div>
        <Button variant="ghost" size="sm" onClick={signOut}><LogOut className="h-4 w-4 mr-1" /> Sair</Button>
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
                    <a href={m.selfie_url} target="_blank" rel="noopener noreferrer" className="text-primary underline">Ver Selfie</a>
                  )}
                  {m.document_url && (
                    <a href={m.document_url} target="_blank" rel="noopener noreferrer" className="text-primary underline">Ver Documento</a>
                  )}
                  {m.experience_proof_url && (
                    <a href={m.experience_proof_url} target="_blank" rel="noopener noreferrer" className="text-primary underline">Ver Experiência</a>
                  )}
                </div>

                <p className="text-xs text-muted-foreground">
                  Cadastrado em: {new Date(m.created_at).toLocaleString("pt-BR")}
                </p>

                <div className="flex gap-2 pt-2">
                  <Button
                    size="sm"
                    disabled={processing === m.user_id}
                    onClick={() => handleApprove(m)}
                  >
                    <CheckCircle className="h-4 w-4 mr-1" />
                    {processing === m.user_id ? "Aprovando..." : "Aprovar"}
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    disabled={processing === m.user_id}
                    onClick={() => setRejectTarget(m)}
                  >
                    <XCircle className="h-4 w-4 mr-1" />
                    Recusar
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => openWhatsApp(m.phone, m.full_name)}
                  >
                    <MessageCircle className="h-4 w-4 mr-1" />
                    WhatsApp
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Reject confirmation */}
      <Dialog open={!!rejectTarget} onOpenChange={(open) => !open && setRejectTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Recusar Montador</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja recusar o cadastro de <strong>{rejectTarget?.full_name}</strong>? O perfil será revertido para cliente.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setRejectTarget(null)}>Cancelar</Button>
            <Button variant="destructive" disabled={!!processing} onClick={() => rejectTarget && handleReject(rejectTarget)}>
              Sim, Recusar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminApproval;
