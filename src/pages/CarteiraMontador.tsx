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
import { Wallet, Clock, ArrowDownCircle, DollarSign, Landmark } from "lucide-react";
import { calcMontadorReceives, PLATFORM_MONTADOR_FEE } from "@/lib/fees";

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
  pendente: "Pendente",
  disponivel: "Disponível",
  sacado: "Sacado",
};

const statusColor: Record<string, string> = {
  pendente: "bg-warning text-warning-foreground",
  disponivel: "bg-success text-success-foreground",
  sacado: "bg-muted text-muted-foreground",
};

const CarteiraMontador = () => {
  const { user, profile } = useAuth();
  const [transactions, setTransactions] = useState<WalletTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [pixKey, setPixKey] = useState("");
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

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

  const availableBalance = transactions
    .filter((t) => t.status === "disponivel")
    .reduce((sum, t) => sum + t.amount, 0);

  const pendingBalance = transactions
    .filter((t) => t.status === "pendente")
    .reduce((sum, t) => sum + t.amount, 0);

  const handleWithdraw = async () => {
    const amount = parseFloat(withdrawAmount);
    const key = pixKey.trim() || (profile as any)?.pix_key;
    if (!key) {
      toast.error("Informe sua chave PIX.");
      return;
    }
    if (!amount || amount <= 0 || amount > availableBalance) {
      toast.error("Valor inválido ou superior ao saldo disponível.");
      return;
    }
    setSubmitting(true);
    try {
      const { error } = await supabase.from("support_tickets").insert({
        opened_by: user!.id,
        order_id: transactions.find((t) => t.status === "disponivel")?.order_id || transactions[0]?.order_id,
        subject: "Solicitação de Saque",
        description: `Saque de R$ ${amount.toFixed(2)} via PIX: ${key}`,
      });
      if (error) throw error;
      toast.success("Solicitação de saque enviada! O admin irá processar.");
      setDialogOpen(false);
      setWithdrawAmount("");
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
          <p className="text-muted-foreground">Gerencie seus ganhos e saques</p>
        </div>
      </div>

      {/* Balance Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Card className="border-success/30">
          <CardContent className="flex items-center gap-4 py-6">
            <div className="rounded-full bg-success/20 p-3">
              <DollarSign className="h-6 w-6 text-success" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Saldo Disponível</p>
              <p className="text-2xl font-bold text-success">R$ {availableBalance.toFixed(2)}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-warning/30">
          <CardContent className="flex items-center gap-4 py-6">
            <div className="rounded-full bg-warning/20 p-3">
              <Clock className="h-6 w-6 text-warning" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Saldo Pendente</p>
              <p className="text-2xl font-bold text-warning">R$ {pendingBalance.toFixed(2)}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Withdraw Button */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogTrigger asChild>
          <Button className="gradient-primary text-primary-foreground w-full sm:w-auto" disabled={availableBalance <= 0}>
            <Landmark className="h-4 w-4 mr-2" />
            Solicitar Saque via PIX
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Solicitar Saque</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Saldo disponível: <strong className="text-success">R$ {availableBalance.toFixed(2)}</strong>
            </p>
            <div>
              <Label>Chave PIX</Label>
              <Input
                value={pixKey || (profile as any)?.pix_key || ""}
                onChange={(e) => setPixKey(e.target.value)}
                placeholder="CPF, email, telefone ou chave aleatória"
              />
            </div>
            <div>
              <Label>Valor do saque (R$)</Label>
              <Input
                type="number"
                value={withdrawAmount}
                onChange={(e) => setWithdrawAmount(e.target.value)}
                placeholder="0.00"
                max={availableBalance}
              />
            </div>
            <Button
              className="w-full gradient-primary text-primary-foreground"
              disabled={submitting}
              onClick={handleWithdraw}
            >
              {submitting ? "Enviando..." : "Confirmar Saque"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Transaction History */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ArrowDownCircle className="h-5 w-5" />
            Histórico de Ganhos
          </CardTitle>
        </CardHeader>
        <CardContent>
          {transactions.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">Nenhuma transação ainda.</p>
          ) : (
            <div className="space-y-3">
              {transactions.map((tx) => (
                <div key={tx.id} className="flex items-center justify-between rounded-lg border border-border p-3">
                  <div className="flex-1">
                    <p className="text-sm font-medium">{tx.description}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(tx.created_at).toLocaleDateString("pt-BR")}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-semibold">R$ {tx.amount.toFixed(2)}</span>
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
