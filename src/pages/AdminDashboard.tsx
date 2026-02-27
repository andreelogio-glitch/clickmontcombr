import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useIsAdmin } from "@/hooks/useIsAdmin";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Shield, Package, AlertTriangle, Eye, DollarSign, CheckCircle, XCircle, Landmark, Loader2, Users, ShieldCheck } from "lucide-react";
import { toast } from "sonner";

interface Order {
  id: string; title: string; furniture_type: string; status: string;
  service_type: string; created_at: string; client_id: string;
  address: string; photo_url: string | null;
}
interface Ticket {
  id: string; order_id: string; opened_by: string; subject: string;
  description: string; status: string; created_at: string;
}
interface Profile {
  user_id: string; full_name: string; role: string;
  phone: string | null; pix_key: string | null; is_approved: boolean;
  city: string | null; created_at: string;
}
interface WalletTx {
  id: string; montador_id: string; order_id: string | null;
  type: string; description: string; amount: number;
  status: string; created_at: string;
}

const orderStatusLabels: Record<string, string> = {
  pendente: "Pendente", com_lance: "Com lance", aceito: "Aceito",
  pago: "Pago", desmontagem_confirmada: "Desmontagem OK",
  aguardando_liberacao: "Aguardando liberação", concluido: "Concluído",
};
const orderStatusColors: Record<string, string> = {
  pendente: "bg-muted text-muted-foreground", com_lance: "bg-warning text-warning-foreground",
  aceito: "bg-primary text-primary-foreground", pago: "bg-success text-success-foreground",
  desmontagem_confirmada: "bg-accent text-accent-foreground",
  aguardando_liberacao: "bg-primary/80 text-primary-foreground",
  concluido: "bg-secondary text-secondary-foreground",
};
const ticketStatusColors: Record<string, string> = {
  aberto: "bg-warning text-warning-foreground", em_analise: "bg-primary text-primary-foreground",
  resolvido: "bg-success text-success-foreground", fechado: "bg-muted text-muted-foreground",
};

const AdminDashboard = () => {
  const { user } = useAuth();
  const { isAdmin, loading: adminLoading } = useIsAdmin(user);
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [allProfiles, setAllProfiles] = useState<Profile[]>([]);
  const [profiles, setProfiles] = useState<Record<string, Profile>>({});
  const [walletTxs, setWalletTxs] = useState<WalletTx[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<string | null>(null);

  const [confirmAction, setConfirmAction] = useState<{
    type: "authorize" | "block" | "withdraw";
    tx: WalletTx;
    montadorName: string;
  } | null>(null);

  useEffect(() => {
    if (isAdmin) fetchAll();
  }, [isAdmin]);

  const fetchAll = async () => {
    const [ordersRes, ticketsRes, walletRes, profilesRes] = await Promise.all([
      supabase.from("orders").select("*").order("created_at", { ascending: false }),
      supabase.from("support_tickets").select("*").order("created_at", { ascending: false }),
      supabase.from("wallet_transactions").select("*").order("created_at", { ascending: false }),
      supabase.from("profiles").select("*").order("created_at", { ascending: false }),
    ]);

    const allOrders = (ordersRes.data || []) as Order[];
    const allTickets = (ticketsRes.data || []) as Ticket[];
    const allWallet = (walletRes.data || []) as WalletTx[];
    const allProfilesList = (profilesRes.data || []) as Profile[];

    setOrders(allOrders);
    setTickets(allTickets);
    setWalletTxs(allWallet);
    setAllProfiles(allProfilesList);

    const map: Record<string, Profile> = {};
    allProfilesList.forEach((p) => { map[p.user_id] = p; });
    setProfiles(map);
    setLoading(false);
  };

  const executeAuthorize = async (tx: WalletTx) => {
    setProcessing(tx.id);
    try {
      const { error } = await supabase
        .from("wallet_transactions")
        .update({ status: "disponivel" })
        .eq("id", tx.id);
      if (error) throw error;
      if (tx.order_id) {
        await supabase
          .from("orders")
          .update({ status: "concluido" })
          .eq("id", tx.order_id)
          .eq("status", "aguardando_liberacao");
      }
      toast.success("Pagamento autorizado! Saldo liberado para o montador.");
      setConfirmAction(null);
      fetchAll();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setProcessing(null);
    }
  };

  const executeBlock = async (tx: WalletTx) => {
    setProcessing(tx.id);
    try {
      const { error } = await supabase
        .from("wallet_transactions")
        .update({ status: "bloqueado" })
        .eq("id", tx.id);
      if (error) throw error;
      toast.success("Pagamento bloqueado para análise.");
      setConfirmAction(null);
      fetchAll();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setProcessing(null);
    }
  };

  const executeWithdraw = async (tx: WalletTx) => {
    setProcessing(tx.id);
    try {
      const { error } = await supabase
        .from("wallet_transactions")
        .update({ status: "sacado" })
        .eq("id", tx.id);
      if (error) throw error;
      toast.success("Saque confirmado como pago!");
      setConfirmAction(null);
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
  const auditTxs = walletTxs.filter((t) => t.type === "credit" && t.status === "auditoria");
  const pendingWithdrawals = walletTxs.filter((t) => t.type === "debit" && t.status === "pendente");
  const pendingMontadores = allProfiles.filter((p) => p.role === "montador" && !p.is_approved);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Shield className="h-6 w-6 text-primary" /> Painel Administrativo
          </h1>
          <p className="text-muted-foreground">Centro de comando de pagamentos e gestão</p>
        </div>
        <Button onClick={() => navigate("/admin-approval")} variant="outline" className="gap-2">
          <ShieldCheck className="h-4 w-4" />
          Aprovação de Montadores
          {pendingMontadores.length > 0 && (
            <Badge variant="destructive" className="ml-1">{pendingMontadores.length}</Badge>
          )}
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <Card><CardContent className="py-4 text-center"><p className="text-2xl font-bold">{orders.length}</p><p className="text-xs text-muted-foreground">Pedidos</p></CardContent></Card>
        <Card><CardContent className="py-4 text-center"><p className="text-2xl font-bold">{allProfiles.length}</p><p className="text-xs text-muted-foreground">Usuários</p></CardContent></Card>
        <Card><CardContent className="py-4 text-center"><p className="text-2xl font-bold text-warning">{openTickets.length}</p><p className="text-xs text-muted-foreground">Tickets</p></CardContent></Card>
        <Card><CardContent className="py-4 text-center"><p className="text-2xl font-bold text-primary">{auditTxs.length}</p><p className="text-xs text-muted-foreground">Em Auditoria</p></CardContent></Card>
        <Card><CardContent className="py-4 text-center"><p className="text-2xl font-bold text-destructive">{pendingMontadores.length}</p><p className="text-xs text-muted-foreground">Pendentes</p></CardContent></Card>
      </div>

      <Tabs defaultValue="orders">
        <TabsList className="flex-wrap">
          <TabsTrigger value="orders" className="gap-1"><Package className="h-4 w-4" /> Pedidos ({orders.length})</TabsTrigger>
          <TabsTrigger value="users" className="gap-1"><Users className="h-4 w-4" /> Usuários ({allProfiles.length})</TabsTrigger>
          <TabsTrigger value="financeiro" className="gap-1"><DollarSign className="h-4 w-4" /> Financeiro ({auditTxs.length + pendingWithdrawals.length})</TabsTrigger>
          <TabsTrigger value="tickets" className="gap-1"><AlertTriangle className="h-4 w-4" /> Tickets ({tickets.length})</TabsTrigger>
        </TabsList>

        {/* Orders Tab */}
        <TabsContent value="orders" className="mt-4 space-y-3">
          {orders.length === 0 ? (
            <Card><CardContent className="py-8 text-center text-muted-foreground">Nenhum pedido encontrado.</CardContent></Card>
          ) : orders.map((order) => {
            const client = profiles[order.client_id];
            return (
              <Card key={order.id}>
                <CardContent className="flex items-center justify-between py-4">
                  <div className="space-y-1">
                    <p className="font-medium">{order.title}</p>
                    <p className="text-xs text-muted-foreground">
                      Cliente: {client?.full_name || "?"} • {order.furniture_type} • {order.service_type === "desmontagem" ? "📦" : "🔧"} {order.service_type}
                    </p>
                    <p className="text-xs text-muted-foreground">{order.address}</p>
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

        {/* Users Tab */}
        <TabsContent value="users" className="mt-4 space-y-3">
          {allProfiles.map((p) => (
            <Card key={p.user_id}>
              <CardContent className="flex items-center justify-between py-4">
                <div className="space-y-1">
                  <p className="font-medium">{p.full_name}</p>
                  <p className="text-xs text-muted-foreground">
                    {p.phone || "Sem telefone"} • {p.city || "Sem cidade"} • Cadastrado em {new Date(p.created_at).toLocaleDateString("pt-BR")}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={p.role === "montador" ? "default" : "secondary"}>{p.role}</Badge>
                  {p.role === "montador" && (
                    <Badge variant={p.is_approved ? "default" : "destructive"} className={p.is_approved ? "bg-success text-success-foreground" : ""}>
                      {p.is_approved ? "Aprovado" : "Pendente"}
                    </Badge>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        {/* Financeiro Tab */}
        <TabsContent value="financeiro" className="mt-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-3">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-primary" /> Liberação de Serviços
              </h2>
              {auditTxs.length === 0 ? (
                <Card><CardContent className="py-8 text-center text-muted-foreground">Nenhum pagamento em auditoria.</CardContent></Card>
              ) : (
                auditTxs.map((tx) => {
                  const montador = profiles[tx.montador_id];
                  const order = orders.find((o) => o.id === tx.order_id);
                  return (
                    <Card key={tx.id} className="border-primary/30">
                      <CardContent className="py-4 space-y-3">
                        <div className="flex items-start justify-between">
                          <div className="space-y-1">
                            <p className="font-medium">{tx.description}</p>
                            <p className="text-sm text-muted-foreground">Montador: <strong>{montador?.full_name || "?"}</strong></p>
                            <p className="text-sm text-muted-foreground">PIX: <strong>{montador?.pix_key || "N/A"}</strong></p>
                            {order && <p className="text-xs text-muted-foreground">Pedido: {order.title} · {order.service_type === "desmontagem" ? "📦" : "🔧"} {order.service_type}</p>}
                            <p className="text-xs text-muted-foreground">{new Date(tx.created_at).toLocaleString("pt-BR")}</p>
                          </div>
                          <p className="text-xl font-bold text-primary">R$ {tx.amount.toFixed(2)}</p>
                        </div>
                        <div className="flex gap-2">
                          <Button size="sm" className="bg-success hover:bg-success/80 text-success-foreground" onClick={() => setConfirmAction({ type: "authorize", tx, montadorName: montador?.full_name || "Montador" })}>
                            <CheckCircle className="h-4 w-4 mr-1" /> Autorizar
                          </Button>
                          <Button size="sm" variant="destructive" onClick={() => setConfirmAction({ type: "block", tx, montadorName: montador?.full_name || "Montador" })}>
                            <XCircle className="h-4 w-4 mr-1" /> Bloquear
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })
              )}
            </div>
            <div className="space-y-3">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <Landmark className="h-5 w-5 text-destructive" /> Pedidos de Saque
              </h2>
              {pendingWithdrawals.length === 0 ? (
                <Card><CardContent className="py-8 text-center text-muted-foreground">Nenhum saque pendente.</CardContent></Card>
              ) : (
                pendingWithdrawals.map((tx) => {
                  const montador = profiles[tx.montador_id];
                  return (
                    <Card key={tx.id} className="border-destructive/30">
                      <CardContent className="py-4 space-y-2">
                        <div className="flex items-start justify-between">
                          <div className="space-y-1">
                            <p className="font-medium">{montador?.full_name || "Montador"}</p>
                            <p className="text-sm text-muted-foreground">PIX: <strong>{montador?.pix_key || "N/A"}</strong></p>
                            <p className="text-xs text-muted-foreground">{tx.description}</p>
                            <p className="text-xs text-muted-foreground">{new Date(tx.created_at).toLocaleString("pt-BR")}</p>
                          </div>
                          <p className="text-lg font-bold text-destructive">R$ {Math.abs(tx.amount).toFixed(2)}</p>
                        </div>
                        <Button size="sm" className="bg-success hover:bg-success/80 text-success-foreground" onClick={() => setConfirmAction({ type: "withdraw", tx, montadorName: montador?.full_name || "Montador" })}>
                          <CheckCircle className="h-4 w-4 mr-1" /> Confirmar Transferência
                        </Button>
                      </CardContent>
                    </Card>
                  );
                })
              )}
            </div>
          </div>
        </TabsContent>

        {/* Tickets Tab */}
        <TabsContent value="tickets" className="mt-4 space-y-3">
          {tickets.map((ticket) => {
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

      {/* Confirmation Modal */}
      <Dialog open={!!confirmAction} onOpenChange={(open) => !open && setConfirmAction(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {confirmAction?.type === "authorize" && "Confirmar Autorização de Pagamento"}
              {confirmAction?.type === "block" && "Confirmar Bloqueio de Pagamento"}
              {confirmAction?.type === "withdraw" && "Confirmar Transferência PIX"}
            </DialogTitle>
            <DialogDescription>
              {confirmAction?.type === "authorize" && (
                <>Deseja realmente autorizar o pagamento de <strong className="text-success">R$ {confirmAction.tx.amount.toFixed(2)}</strong> para o montador <strong>{confirmAction.montadorName}</strong>?</>
              )}
              {confirmAction?.type === "block" && (
                <>Deseja bloquear o pagamento de <strong className="text-destructive">R$ {confirmAction.tx.amount.toFixed(2)}</strong> para <strong>{confirmAction.montadorName}</strong>?</>
              )}
              {confirmAction?.type === "withdraw" && (
                <>Confirma que a transferência PIX de <strong className="text-destructive">R$ {Math.abs(confirmAction.tx.amount).toFixed(2)}</strong> para <strong>{confirmAction.montadorName}</strong> foi realizada?</>
              )}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setConfirmAction(null)} disabled={!!processing}>Cancelar</Button>
            <Button
              className={confirmAction?.type === "block" ? "bg-destructive hover:bg-destructive/80 text-destructive-foreground" : "bg-success hover:bg-success/80 text-success-foreground"}
              disabled={!!processing}
              onClick={() => {
                if (!confirmAction) return;
                if (confirmAction.type === "authorize") executeAuthorize(confirmAction.tx);
                else if (confirmAction.type === "block") executeBlock(confirmAction.tx);
                else if (confirmAction.type === "withdraw") executeWithdraw(confirmAction.tx);
              }}
            >
              {processing ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : null}
              {confirmAction?.type === "authorize" && "Sim, Autorizar"}
              {confirmAction?.type === "block" && "Sim, Bloquear"}
              {confirmAction?.type === "withdraw" && "Sim, Confirmar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminDashboard;
