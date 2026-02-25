import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useIsAdmin } from "@/hooks/useIsAdmin";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Shield, Package, AlertTriangle, Eye, DollarSign, CheckCircle, XCircle, Landmark, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface Order {
  id: string;
  title: string;
  furniture_type: string;
  status: string;
  service_type: string;
  created_at: string;
  client_id: string;
  address: string;
  photo_url: string | null;
}

interface Ticket {
  id: string;
  order_id: string;
  opened_by: string;
  subject: string;
  description: string;
  status: string;
  created_at: string;
}

interface Profile {
  user_id: string;
  full_name: string;
  role: string;
  phone: string | null;
  pix_key: string | null;
}

interface WalletTx {
  id: string;
  montador_id: string;
  order_id: string | null;
  type: string;
  description: string;
  amount: number;
  status: string;
  created_at: string;
}

interface Bid {
  id: string;
  order_id: string;
  montador_id: string;
  amount: number;
  accepted: boolean | null;
}

const orderStatusLabels: Record<string, string> = {
  pendente: "Pendente", com_lance: "Com lance", aceito: "Aceito",
  pago: "Pago", desmontagem_confirmada: "Desmontagem OK", concluido: "Concluído",
};
const orderStatusColors: Record<string, string> = {
  pendente: "bg-muted text-muted-foreground", com_lance: "bg-warning text-warning-foreground",
  aceito: "bg-primary text-primary-foreground", pago: "bg-success text-success-foreground",
  desmontagem_confirmada: "bg-accent text-accent-foreground", concluido: "bg-secondary text-secondary-foreground",
};
const ticketStatusColors: Record<string, string> = {
  aberto: "bg-warning text-warning-foreground", em_analise: "bg-primary text-primary-foreground",
  resolvido: "bg-success text-success-foreground", fechado: "bg-muted text-muted-foreground",
};

const AdminDashboard = () => {
  const { isAdmin, loading: adminLoading } = useIsAdmin();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [bids, setBids] = useState<Bid[]>([]);
  const [profiles, setProfiles] = useState<Record<string, Profile>>({});
  const [walletTxs, setWalletTxs] = useState<WalletTx[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<string | null>(null);

  useEffect(() => {
    if (isAdmin) fetchAll();
  }, [isAdmin]);

  const fetchAll = async () => {
    const [ordersRes, ticketsRes, walletRes, bidsRes] = await Promise.all([
      supabase.from("orders").select("*").order("created_at", { ascending: false }),
      supabase.from("support_tickets").select("*").order("created_at", { ascending: false }),
      supabase.from("wallet_transactions").select("*").order("created_at", { ascending: false }),
      supabase.from("bids").select("*").eq("accepted", true),
    ]);

    const allOrders = (ordersRes.data || []) as Order[];
    const allTickets = (ticketsRes.data || []) as Ticket[];
    const allWallet = (walletRes.data || []) as WalletTx[];
    const allBids = (bidsRes.data || []) as Bid[];

    setOrders(allOrders);
    setTickets(allTickets);
    setWalletTxs(allWallet);
    setBids(allBids);

    const userIds = [
      ...new Set([
        ...allOrders.map((o) => o.client_id),
        ...allTickets.map((t) => t.opened_by),
        ...allWallet.map((w) => w.montador_id),
        ...allBids.map((b) => b.montador_id),
      ]),
    ];
    if (userIds.length > 0) {
      const { data: profilesData } = await supabase
        .from("profiles")
        .select("user_id, full_name, role, phone, pix_key")
        .in("user_id", userIds);
      const map: Record<string, Profile> = {};
      (profilesData || []).forEach((p: any) => { map[p.user_id] = p; });
      setProfiles(map);
    }
    setLoading(false);
  };

  // Parse amount from ticket description like "Valor a liberar: R$ 123.45"
  const parseAmountFromDescription = (desc: string): number => {
    const match = desc.match(/Valor a liberar: R\$ ([\d.,]+)/);
    if (match) return parseFloat(match[1].replace(",", "."));
    return 0;
  };

  // Parse montador_id from description
  const parseMontadorFromDescription = (desc: string): string | null => {
    const match = desc.match(/montador ([a-f0-9-]{36})/);
    return match ? match[1] : null;
  };

  const handleAuthorizePayment = async (ticket: Ticket) => {
    setProcessing(ticket.id);
    try {
      const amount = parseAmountFromDescription(ticket.description);
      let montadorId = parseMontadorFromDescription(ticket.description);

      // Fallback: find montador from accepted bid on the order
      if (!montadorId) {
        const bid = bids.find((b) => b.order_id === ticket.order_id && b.accepted);
        montadorId = bid?.montador_id || null;
      }

      if (!montadorId || amount <= 0) {
        toast.error("Não foi possível extrair os dados do pagamento.");
        return;
      }

      // Create wallet transaction as disponivel
      const { error: walletErr } = await supabase.from("wallet_transactions").insert({
        montador_id: montadorId,
        order_id: ticket.order_id,
        type: "credit",
        status: "disponivel",
        amount,
        description: ticket.subject,
      });
      if (walletErr) throw walletErr;

      // Close the ticket
      await supabase.from("support_tickets").update({ status: "resolvido" }).eq("id", ticket.id);

      toast.success("Pagamento autorizado! Saldo liberado para o montador.");
      fetchAll();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setProcessing(null);
    }
  };

  const handleBlockPayment = async (ticket: Ticket) => {
    setProcessing(ticket.id);
    try {
      await supabase.from("support_tickets").update({ status: "em_analise" }).eq("id", ticket.id);
      toast.success("Pagamento bloqueado para análise.");
      fetchAll();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setProcessing(null);
    }
  };

  const handleConfirmWithdraw = async (tx: WalletTx) => {
    setProcessing(tx.id);
    try {
      const { error } = await supabase
        .from("wallet_transactions")
        .update({ status: "sacado" })
        .eq("id", tx.id);
      if (error) throw error;
      toast.success("Saque confirmado como pago!");
      fetchAll();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setProcessing(null);
    }
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
        <Card>
          <CardContent className="py-12 text-center">
            <Shield className="h-12 w-12 mx-auto mb-3 text-destructive opacity-60" />
            <p className="text-muted-foreground">Acesso restrito a administradores</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const openTickets = tickets.filter((t) => t.status === "aberto" || t.status === "em_analise");
  // Payment audit tickets - those with "Liberação de pagamento" in subject and still open
  const paymentTickets = tickets.filter(
    (t) => t.subject.startsWith("Liberação de pagamento") && (t.status === "aberto" || t.status === "em_analise")
  );
  const generalTickets = tickets.filter(
    (t) => !t.subject.startsWith("Liberação de pagamento")
  );
  const pendingWithdrawals = walletTxs.filter((t) => t.type === "debit" && t.status === "pendente");

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Shield className="h-6 w-6 text-primary" /> Painel Administrativo
        </h1>
        <p className="text-muted-foreground">Visão completa de pedidos, tickets e pagamentos</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <Card>
          <CardContent className="py-4 text-center">
            <p className="text-2xl font-bold">{orders.length}</p>
            <p className="text-xs text-muted-foreground">Pedidos totais</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="py-4 text-center">
            <p className="text-2xl font-bold">{orders.filter((o) => o.status === "pendente").length}</p>
            <p className="text-xs text-muted-foreground">Pendentes</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="py-4 text-center">
            <p className="text-2xl font-bold text-warning">{openTickets.length}</p>
            <p className="text-xs text-muted-foreground">Tickets abertos</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="py-4 text-center">
            <p className="text-2xl font-bold text-primary">{paymentTickets.length}</p>
            <p className="text-xs text-muted-foreground">Pgtos p/ auditar</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="py-4 text-center">
            <p className="text-2xl font-bold text-gold">{pendingWithdrawals.length}</p>
            <p className="text-xs text-muted-foreground">Saques pendentes</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="audit">
        <TabsList className="flex-wrap">
          <TabsTrigger value="audit" className="gap-1">
            <DollarSign className="h-4 w-4" /> Auditoria ({paymentTickets.length})
          </TabsTrigger>
          <TabsTrigger value="withdrawals" className="gap-1">
            <Landmark className="h-4 w-4" /> Saques ({pendingWithdrawals.length})
          </TabsTrigger>
          <TabsTrigger value="orders" className="gap-1">
            <Package className="h-4 w-4" /> Pedidos ({orders.length})
          </TabsTrigger>
          <TabsTrigger value="tickets" className="gap-1">
            <AlertTriangle className="h-4 w-4" /> Tickets ({generalTickets.length})
          </TabsTrigger>
        </TabsList>

        {/* Audit Tab */}
        <TabsContent value="audit" className="mt-4 space-y-3">
          <h2 className="text-lg font-semibold">Pagamentos Pendentes de Auditoria</h2>
          {paymentTickets.length === 0 ? (
            <Card><CardContent className="py-8 text-center text-muted-foreground">Nenhum pagamento pendente de auditoria.</CardContent></Card>
          ) : (
            paymentTickets.map((ticket) => {
              const order = orders.find((o) => o.id === ticket.order_id);
              const client = profiles[ticket.opened_by];
              const amount = parseAmountFromDescription(ticket.description);
              let montadorId = parseMontadorFromDescription(ticket.description);
              if (!montadorId) {
                const bid = bids.find((b) => b.order_id === ticket.order_id && b.accepted);
                montadorId = bid?.montador_id || null;
              }
              const montador = montadorId ? profiles[montadorId] : null;

              return (
                <Card key={ticket.id} className="border-primary/30">
                  <CardContent className="py-4 space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <p className="font-medium">{ticket.subject}</p>
                        <p className="text-sm text-muted-foreground">
                          Montador: <strong>{montador?.full_name || "?"}</strong> · PIX: <strong>{montador?.pix_key || "N/A"}</strong>
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Cliente: <strong>{client?.full_name || "?"}</strong>
                        </p>
                        {order && (
                          <p className="text-xs text-muted-foreground">
                            Pedido: {order.title} · {order.service_type === "desmontagem" ? "📦 Desmontagem" : "🔧 Montagem"}
                          </p>
                        )}
                        {order?.photo_url && (
                          <img src={order.photo_url} alt="Foto do serviço" className="h-20 w-20 rounded-md object-cover mt-1" />
                        )}
                        <p className="text-xs text-muted-foreground mt-1">{ticket.description}</p>
                        <p className="text-xs text-muted-foreground">{new Date(ticket.created_at).toLocaleString("pt-BR")}</p>
                        <Badge className={ticket.status === "em_analise" ? "bg-destructive text-destructive-foreground" : "bg-warning text-warning-foreground"}>
                          {ticket.status === "em_analise" ? "🔒 Em análise" : "⏳ Aguardando"}
                        </Badge>
                      </div>
                      <p className="text-xl font-bold text-primary">R$ {amount.toFixed(2)}</p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        className="bg-success hover:bg-success/80 text-success-foreground"
                        disabled={processing === ticket.id}
                        onClick={() => handleAuthorizePayment(ticket)}
                      >
                        {processing === ticket.id ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : <CheckCircle className="h-4 w-4 mr-1" />}
                        Autorizar Pagamento
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        disabled={processing === ticket.id}
                        onClick={() => handleBlockPayment(ticket)}
                      >
                        <XCircle className="h-4 w-4 mr-1" /> Bloquear/Analisar
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </TabsContent>

        {/* Withdrawals Tab */}
        <TabsContent value="withdrawals" className="mt-4 space-y-3">
          <h2 className="text-lg font-semibold">Solicitações de Saque</h2>
          {pendingWithdrawals.length === 0 ? (
            <Card><CardContent className="py-8 text-center text-muted-foreground">Nenhum saque pendente.</CardContent></Card>
          ) : (
            pendingWithdrawals.map((tx) => {
              const montador = profiles[tx.montador_id];
              return (
                <Card key={tx.id} className="border-gold/30">
                  <CardContent className="flex items-center justify-between py-4">
                    <div className="space-y-1">
                      <p className="font-medium">{montador?.full_name || "Montador"}</p>
                      <p className="text-sm text-muted-foreground">
                        PIX: <strong>{montador?.pix_key || "N/A"}</strong>
                      </p>
                      <p className="text-xs text-muted-foreground">{tx.description}</p>
                      <p className="text-xs text-muted-foreground">{new Date(tx.created_at).toLocaleString("pt-BR")}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <p className="text-lg font-bold text-destructive">R$ {Math.abs(tx.amount).toFixed(2)}</p>
                      <Button
                        size="sm"
                        className="bg-success hover:bg-success/80 text-success-foreground"
                        disabled={processing === tx.id}
                        onClick={() => handleConfirmWithdraw(tx)}
                      >
                        {processing === tx.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle className="h-4 w-4 mr-1" />}
                        Confirmar Pagamento
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </TabsContent>

        {/* Orders Tab */}
        <TabsContent value="orders" className="mt-4 space-y-3">
          {orders.map((order) => {
            const client = profiles[order.client_id];
            return (
              <Card key={order.id}>
                <CardContent className="flex items-center justify-between py-4">
                  <div className="space-y-1">
                    <p className="font-medium">{order.title}</p>
                    <p className="text-xs text-muted-foreground">
                      Cliente: {client?.full_name || "?"} • {order.furniture_type} • {order.service_type === "desmontagem" ? "📦 Desmontagem" : "🔧 Montagem"}
                    </p>
                    <p className="text-xs text-muted-foreground">{new Date(order.created_at).toLocaleDateString("pt-BR")}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={orderStatusColors[order.status]}>{orderStatusLabels[order.status] || order.status}</Badge>
                    <Button variant="outline" size="sm" onClick={() => navigate(`/chat/${order.id}`)}><Eye className="h-3.5 w-3.5" /></Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </TabsContent>

        {/* Tickets Tab */}
        <TabsContent value="tickets" className="mt-4 space-y-3">
          {generalTickets.map((ticket) => {
            const opener = profiles[ticket.opened_by];
            return (
              <Card key={ticket.id} className="cursor-pointer hover:border-primary/50 transition-colors" onClick={() => navigate("/admin/assistencia")}>
                <CardContent className="flex items-center justify-between py-4">
                  <div className="space-y-1">
                    <p className="font-medium">{ticket.subject}</p>
                    <p className="text-xs text-muted-foreground">
                      {opener?.full_name || "?"} ({opener?.role || "?"}) • {new Date(ticket.created_at).toLocaleDateString("pt-BR")}
                    </p>
                  </div>
                  <Badge className={ticketStatusColors[ticket.status]}>{ticket.status}</Badge>
                </CardContent>
              </Card>
            );
          })}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminDashboard;
