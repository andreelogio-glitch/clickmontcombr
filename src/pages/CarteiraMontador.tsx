import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Wallet, Clock, ArrowDownCircle, DollarSign, Landmark, ShieldCheck, Loader2, Search } from "lucide-react";

interface WalletTransaction {
  id: string;
  order_id: string | null;
  type: string;
  description: string;
  amount: number;
  status: string;
  created_at: string;
}

const statusLabel: Record<string, string> = {
  auditoria: "Em Auditoria",
  pendente: "Saque Pendente",
  disponivel: "Disponível",
  sacado: "Sacado",
  bloqueado: "Bloqueado p/ Análise",
};

const statusColor: Record<string, string> = {
  auditoria: "bg-primary/80 text-primary-foreground",
  pendente: "bg-warning text-warning-foreground",
  disponivel: "bg-success text-success-foreground",
  sacado: "bg-muted text-muted-foreground",
  bloqueado: "bg-destructive text-destructive-foreground",
};

const CarteiraMontador = () => {
  const { user, profile } = useAuth();
  const [transactions, setTransactions] = useState<WalletTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [pixKey, setPixKey] = useState("");
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [editingPix, setEditingPix] = useState(false);
  const [newPixKey, setNewPixKey] = useState("");

  useEffect(() => {
    if (!user) return;
    fetchTransactions();
  }, [user]);

  const fetchTransactions = async () => {
    const { data } = await supabase
      .from("wallet_transactions")
      .select("*")
      .eq("montador_id", user!.id)
      .order("created_at", { ascending: false });
    if (data) setTransactions(data as WalletTransaction[]);
    setLoading(false);
  };

  const credits = transactions.filter((t) => t.type === "credit");
  const debits = transactions.filter((t) => t.type === "debit");

  const auditoriaBalance = credits.filter((t) => t.status === "auditoria").reduce((s, t) => s + t.amount, 0);
  const availableBalance = credits.filter((t) => t.status === "disponivel").reduce((s, t) => s + t.amount, 0);
  const withdrawnTotal = debits.filter((t) => t.status === "sacado").reduce((s, t) => s + Math.abs(t.amount), 0);
  const pendingWithdrawals = debits.filter((t) => t.status === "pendente").reduce((s, t) => s + Math.abs(t.amount), 0);

  const netAvailable = availableBalance - withdrawnTotal - pendingWithdrawals;

  const handleWithdraw = async () => {
    const amount = parseFloat(withdrawAmount);
    const key = pixKey.trim() || (profile as any)?.pix_key;
    if (!key) { toast.error("Informe sua chave PIX."); return; }
    if (!amount || amount <= 0 || amount > netAvailable) { toast.error("Valor inválido ou superior ao saldo disponível."); return; }
    setSubmitting(true);
    try {
      const { error } = await supabase.from("wallet_transactions").insert({
        montador_id: user!.id,
        type: "debit",
        status: "pendente",
        amount: -amount,
        description: `Saque PIX: ${key} - R$ ${amount.toFixed(2)}`,
      });
      if (error) throw error;
      toast.success("Solicitação de saque enviada! Aguarde aprovação.");
      setDialogOpen(false);
      setWithdrawAmount("");
      fetchTransactions();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center gap-3">
        <Wallet className="h-7 w-7 text-primary" />
        <div>
          <h1 className="text-2xl font-bold">Minha Carteira</h1>
          <p className="text-muted-foreground">Acompanhe seus ganhos em cada fase</p>
        </div>
      </div>

      {/* Balance Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="border-primary/30">
          <CardContent className="flex items-center gap-4 py-6">
            <div className="rounded-full bg-primary/20 p-3">
              <Search className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Em Auditoria</p>
              <p className="text-2xl font-bold text-primary">R$ {auditoriaBalance.toFixed(2)}</p>
              <p className="text-xs text-muted-foreground">Aguardando liberação da plataforma</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-success/30">
          <CardContent className="flex items-center gap-4 py-6">
            <div className="rounded-full bg-success/20 p-3">
              <DollarSign className="h-6 w-6 text-success" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Disponível para Saque</p>
              <p className="text-2xl font-bold text-success">R$ {Math.max(0, netAvailable).toFixed(2)}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-muted">
          <CardContent className="flex items-center gap-4 py-6">
            <div className="rounded-full bg-muted p-3">
              <ShieldCheck className="h-6 w-6 text-muted-foreground" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-muted-foreground">Chave PIX</p>
              {editingPix ? (
                <div className="flex gap-2 mt-1">
                  <Input
                    value={newPixKey}
                    onChange={(e) => setNewPixKey(e.target.value)}
                    placeholder="CPF, email, telefone ou chave aleatória"
                    className="h-8 text-sm"
                  />
                  <Button
                    size="sm"
                    className="h-8"
                    onClick={async () => {
                      if (!newPixKey.trim()) return;
                      await supabase.from("profiles").update({ pix_key: newPixKey.trim() }).eq("user_id", user!.id);
                      toast.success("Chave PIX salva!");
                      setEditingPix(false);
                    }}
                  >Salvar</Button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium truncate max-w-[140px]">
                    {(profile as any)?.pix_key || "Não informado"}
                  </p>
                  <Button variant="ghost" size="sm" className="h-6 text-xs" onClick={() => { setNewPixKey((profile as any)?.pix_key || ""); setEditingPix(true); }}>
                    Editar
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Withdraw */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogTrigger asChild>
          <Button className="gradient-primary text-primary-foreground w-full sm:w-auto" disabled={netAvailable <= 0}>
            <Landmark className="h-4 w-4 mr-2" /> Solicitar Saque via PIX
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Solicitar Saque</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Saldo disponível: <strong className="text-success">R$ {Math.max(0, netAvailable).toFixed(2)}</strong>
            </p>
            <div>
              <Label>Chave PIX</Label>
              <Input value={pixKey || (profile as any)?.pix_key || ""} onChange={(e) => setPixKey(e.target.value)} placeholder="CPF, email, telefone ou chave aleatória" />
            </div>
            <div>
              <Label>Valor do saque (R$)</Label>
              <Input type="number" value={withdrawAmount} onChange={(e) => setWithdrawAmount(e.target.value)} placeholder="0.00" />
            </div>
            <Button className="w-full gradient-primary text-primary-foreground" disabled={submitting} onClick={handleWithdraw}>
              {submitting ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Enviando...</> : "Confirmar Saque"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Auditoria notice */}
      {auditoriaBalance > 0 && (
        <Card className="border-primary/40 bg-primary/5">
          <CardContent className="py-4 flex items-center gap-3">
            <Search className="h-5 w-5 text-primary shrink-0" />
            <p className="text-sm">
              Você tem <strong>R$ {auditoriaBalance.toFixed(2)}</strong> em serviços concluídos pelo cliente. O valor está <strong>em auditoria</strong> e será liberado após verificação pela plataforma.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Transaction History */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ArrowDownCircle className="h-5 w-5" /> Histórico de Transações
          </CardTitle>
        </CardHeader>
        <CardContent>
          {transactions.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">Nenhuma transação ainda.</p>
          ) : (
            <div className="space-y-3">
              {transactions.map((tx) => (
                <div key={tx.id} className="flex items-center justify-between rounded-lg border border-border p-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{tx.description}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(tx.created_at).toLocaleDateString("pt-BR")} · {tx.type === "debit" ? "Saque" : "Crédito"}
                    </p>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <span className={`font-semibold ${tx.type === "debit" ? "text-destructive" : ""}`}>
                      {tx.type === "debit" ? "-" : "+"}R$ {Math.abs(tx.amount).toFixed(2)}
                    </span>
                    <Badge className={statusColor[tx.status] || "bg-muted"}>
                      {statusLabel[tx.status] || tx.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default CarteiraMontador;
