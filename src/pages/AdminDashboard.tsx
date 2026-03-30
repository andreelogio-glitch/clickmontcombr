import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useIsAdmin } from "@/hooks/useIsAdmin";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Shield, Package, AlertTriangle, Eye, DollarSign, CheckCircle, XCircle, Landmark, Loader2, Users, ShieldCheck, FileText, TrendingUp, Clock, Wallet, Trash2, Ban, RotateCcw, MessageSquareText, Plus } from "lucide-react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";

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
interface AuditLog {
  id: string; created_at: string; user_id: string;
  action_type: string; order_id: string | null;
  details: Record<string, any> | null;
}
interface ChatTemplate {
  id: string; content: string; created_at: string;
}

const orderStatusLabels: Record<string, string> = {
  aguardando: "Aguardando", pendente: "Aguardando", com_lance: "Com lance", aceito: "Aceito",
  pago: "Pago", em_andamento: "Em andamento", desmontagem_confirmada: "Desmontagem OK",
  aguardando_liberacao: "Aguardando liberação", concluido: "Concluído",
};
const orderStatusColors: Record<string, string> = {
  aguardando: "bg-muted text-muted-foreground",
  pendente: "bg-muted text-muted-foreground", com_lance: "bg-warning text-warning-foreground",
  aceito: "bg-primary text-primary-foreground", pago: "bg-success text-success-foreground",
  em_andamento: "bg-accent text-accent-foreground",
  desmontagem_confirmada: "bg-accent text-accent-foreground",
  aguardando_liberacao: "bg-primary/80 text-primary-foreground",
  concluido: "bg-secondary text-secondary-foreground",
};
const ticketStatusColors: Record<string, string> = {
  aberto: "bg-warning text-warning-foreground", em_analise: "bg-primary text-primary-foreground",
  resolvido: "bg-success text-success-foreground", fechado: "bg-muted text-muted-foreground",
};

const actionTypeLabels: Record<string, string> = {
  RELEASE_PAYMENT: "Pagamento Liberado",
  BLOCK_PAYMENT: "Pagamento Bloqueado",
  CONFIRM_WITHDRAWAL: "Saque Confirmado",
  SERVICE_CONFIRMED: "Serviço Confirmado",
  REFUND_TO_CLIENT: "Estorno ao Cliente",
  SUSPEND_USER: "Usuário Suspenso",
  DELETE_USER: "Usuário Excluído",
  DELETE_ORDER: "Pedido Excluído",
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
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [chatTemplates, setChatTemplates] = useState<ChatTemplate[]>([]);
  const [newTemplate, setNewTemplate] = useState("");
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<string | null>(null);

  const [confirmAction, setConfirmAction] = useState<{
    type: "authorize" | "block" | "withdraw" | "suspend" | "delete_user" | "delete_order" | "refund";
    tx?: WalletTx;
    montadorName?: string;
    targetId?: string;
    targetName?: string;
  } | null>(null);

  useEffect(() => {
    if (isAdmin) fetchAll();
  }, [isAdmin]);

  const fetchAll = async () => {
    const [ordersRes, ticketsRes, walletRes, profilesRes, logsRes, templatesRes] = await Promise.all([
      supabase.from("orders").select("*").order("created_at", { ascending: false }),
      supabase.from("support_tickets").select("*").order("created_at", { ascending: false }),
      supabase.from("wallet_transactions").select("*").order("created_at", { ascending: false }),
      supabase.from("profiles").select("*").order("created_at", { ascending: false }),
      supabase.from("platform_logs").select("*").order("created_at", { ascending: false }).limit(50),
      supabase.from("chat_templates").select("*").order("created_at", { ascending: true }),
    ]);

    const allOrders = (ordersRes.data || []) as Order[];
    const allTickets = (ticketsRes.data || []) as Ticket[];
    const allWallet = (walletRes.data || []) as WalletTx[];
    const allProfilesList = (profilesRes.data || []) as Profile[];
    const allLogs = (logsRes.data || []) as AuditLog[];
    const allTemplates = (templatesRes.data || []) as ChatTemplate[];

    setOrders(allOrders);
    setTickets(allTickets);
    setWalletTxs(allWallet);
    setAllProfiles(allProfilesList);
    setAuditLogs(allLogs);
    setChatTemplates(allTemplates);

    const map: Record<string, Profile> = {};
    allProfilesList.forEach((p) => { map[p.user_id] = p; });
    setProfiles(map);
    setLoading(false);
  };

  const logAction = async (actionType: string, orderId: string | null, details: Record<string, any>) => {
    if (!user) return;
    await supabase.from("platform_logs").insert({
      user_id: user.id,
      action_type: actionType,
      order_id: orderId,
      details,
    });
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
      await logAction("RELEASE_PAYMENT", tx.order_id, {
        tx_id: tx.id,
        montador_id: tx.montador_id,
        amount: tx.amount,
        description: tx.description,
      });
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
      await logAction("BLOCK_PAYMENT", tx.order_id, {
        tx_id: tx.id,
        montador_id: tx.montador_id,
        amount: tx.amount,
      });
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
      await logAction("CONFIRM_WITHDRAWAL", tx.order_id, {
        tx_id: tx.id,
        montador_id: tx.montador_id,
        amount: tx.amount,
      });
      toast.success("Saque confirmado como pago!");
      setConfirmAction(null);
      fetchAll();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setProcessing(null);
    }
  };

  const executeSuspend = async (userId: string) => {
    setProcessing(userId);
    try {
      const { error } = await supabase.from("profiles").update({ role: "suspenso" } as any).eq("user_id", userId);
      if (error) throw error;
      await logAction("SUSPEND_USER", null, { suspended_user_id: userId });
      toast.success("Usuário suspenso.");
      setConfirmAction(null);
      fetchAll();
    } catch (err: any) { toast.error(err.message); } finally { setProcessing(null); }
  };

  const executeDeleteUser = async (userId: string) => {
    setProcessing(userId);
    try {
      const { error } = await supabase.from("profiles").delete().eq("user_id", userId);
      if (error) throw error;
      await logAction("DELETE_USER", null, { deleted_user_id: userId });
      toast.success("Perfil excluído.");
      setConfirmAction(null);
      fetchAll();
    } catch (err: any) { toast.error(err.message); } finally { setProcessing(null); }
  };

  const executeDeleteOrder = async (orderId: string) => {
    setProcessing(orderId);
    try {
      const { error } = await supabase.from("orders").delete().eq("id", orderId);
      if (error) throw error;
      await logAction("DELETE_ORDER", orderId, {});
      toast.success("Pedido excluído.");
      setConfirmAction(null);
      fetchAll();
    } catch (err: any) { toast.error(err.message); } finally { setProcessing(null); }
  };

  const executeRefund = async (orderId: string) => {
    setProcessing(orderId);
    try {
      const { error } = await supabase.from("orders").update({ status: "cancelado" } as any).eq("id", orderId);
      if (error) throw error;
      await logAction("REFUND_TO_CLIENT", orderId, { refunded: true });
      toast.success("Pedido estornado e marcado como cancelado.");
      setConfirmAction(null);
      fetchAll();
    } catch (err: any) { toast.error(err.message); } finally { setProcessing(null); }
  };

  const addTemplate = async () => {
    if (!newTemplate.trim()) return;
    const { error } = await supabase.from("chat_templates").insert({ content: newTemplate.trim() });
    if (error) { toast.error(error.message); return; }
    setNewTemplate("");
    fetchAll();
    toast.success("Frase adicionada!");
  };

  const deleteTemplate = async (id: string) => {
    const { error } = await supabase.from("chat_templates").delete().eq("id", id);
    if (error) { toast.error(error.message); return; }
    fetchAll();
    toast.success("Frase removida.");
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

  // Financial summary calculations (nova regra: montador=77%, ClickMont=23%)
  const custodyOrders = orders.filter((o) => ["pago", "em_andamento", "desmontagem_confirmada", "aguardando_liberacao"].includes(o.status));
  // custodyTotal = valor total em escrow (valor_montagem = montador_amount / 0.77)
  const custodyTotal = walletTxs
    .filter((t) => t.type === "credit" && ["auditoria", "pendente"].includes(t.status))
    .reduce((sum, t) => sum + Math.round((t.amount / 0.77) * 100) / 100, 0);

  // projectedProfit = comissão ClickMont (23% do valor_montagem = 23/77 do valor montador)
  const projectedProfit = walletTxs
    .filter((t) => t.type === "credit" && ["auditoria", "disponivel"].includes(t.status))
    .reduce((sum, t) => sum + Math.round((t.amount * 23 / 77) * 100) / 100, 0);

  const pendingRelease = orders.filter((o) => o.status === "aguardando_liberacao").length;

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
          <TabsTrigger value="gestao" className="gap-1"><Wallet className="h-4 w-4" /> Gestão Financeira</TabsTrigger>
          <TabsTrigger value="templates" className="gap-1"><MessageSquareText className="h-4 w-4" /> Chat Templates</TabsTrigger>
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
                    <Button variant="outline" size="sm" className="text-destructive" onClick={() => setConfirmAction({ type: "refund", targetId: order.id, targetName: order.title })} title="Estornar">
                      <RotateCcw className="h-3.5 w-3.5" />
                    </Button>
                    <Button variant="ghost" size="sm" className="text-destructive" onClick={() => setConfirmAction({ type: "delete_order", targetId: order.id, targetName: order.title })} title="Excluir">
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
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
                  <Button variant="outline" size="sm" className="text-warning" onClick={() => setConfirmAction({ type: "suspend", targetId: p.user_id, targetName: p.full_name })} title="Suspender">
                    <Ban className="h-3.5 w-3.5" />
                  </Button>
                  <Button variant="ghost" size="sm" className="text-destructive" onClick={() => setConfirmAction({ type: "delete_user", targetId: p.user_id, targetName: p.full_name })} title="Excluir">
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        {/* Financeiro Tab (existing) */}
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

        {/* Gestão Financeira Tab (NEW) */}
        <TabsContent value="gestao" className="mt-4 space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Card className="border-primary/30">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2 text-muted-foreground">
                  <Shield className="h-4 w-4" /> Saldo em Custódia
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold text-primary">R$ {custodyTotal.toFixed(2)}</p>
                <p className="text-xs text-muted-foreground mt-1">{custodyOrders.length} ordens ativas</p>
              </CardContent>
            </Card>

            <Card className="border-success/30">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2 text-muted-foreground">
                  <TrendingUp className="h-4 w-4" /> Receita Prevista
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold text-success">R$ {projectedProfit.toFixed(2)}</p>
                <p className="text-xs text-muted-foreground mt-1">Receita acumulada</p>
              </CardContent>
            </Card>

            <Card className="border-warning/30">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2 text-muted-foreground">
                  <Clock className="h-4 w-4" /> Pendentes de Liberação
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold text-warning">{pendingRelease}</p>
                <p className="text-xs text-muted-foreground mt-1">Serviços aguardando aprovação</p>
              </CardContent>
            </Card>
          </div>

          {/* Orders awaiting release - responsive table */}
          <div>
            <h2 className="text-lg font-semibold flex items-center gap-2 mb-3">
              <DollarSign className="h-5 w-5 text-primary" /> Ordens Concluídas — Autorizar Pagamento
            </h2>
            {(() => {
              const releaseOrders = orders.filter((o) => o.status === "aguardando_liberacao");
              if (releaseOrders.length === 0) {
                return <Card><CardContent className="py-8 text-center text-muted-foreground">Nenhuma ordem pendente de liberação.</CardContent></Card>;
              }
              return (
                <div className="overflow-x-auto rounded-lg border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Pedido</TableHead>
                        <TableHead className="hidden sm:table-cell">Cliente</TableHead>
                        <TableHead className="hidden md:table-cell">Tipo</TableHead>
                        <TableHead>Data</TableHead>
                        <TableHead className="text-right">Ação</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {releaseOrders.map((order) => {
                        const client = profiles[order.client_id];
                        const relatedTx = auditTxs.find((t) => t.order_id === order.id);
                        return (
                          <TableRow key={order.id}>
                            <TableCell>
                              <div>
                                <p className="font-medium text-sm">{order.title}</p>
                                <p className="text-xs text-muted-foreground sm:hidden">{client?.full_name || "?"}</p>
                              </div>
                            </TableCell>
                            <TableCell className="hidden sm:table-cell text-sm">{client?.full_name || "?"}</TableCell>
                            <TableCell className="hidden md:table-cell">
                              <Badge variant="secondary">{order.service_type}</Badge>
                            </TableCell>
                            <TableCell className="text-xs text-muted-foreground">{new Date(order.created_at).toLocaleDateString("pt-BR")}</TableCell>
                            <TableCell className="text-right">
                              {relatedTx ? (
                                <Button
                                  size="sm"
                                  className="bg-success hover:bg-success/80 text-success-foreground"
                                  onClick={() => setConfirmAction({ type: "authorize", tx: relatedTx, montadorName: profiles[relatedTx.montador_id]?.full_name || "Montador" })}
                                >
                                  <CheckCircle className="h-4 w-4 mr-1" /> Autorizar
                                </Button>
                              ) : (
                                <Badge variant="outline">Sem transação</Badge>
                              )}
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              );
            })()}
          </div>

          {/* Audit Log Section */}
          <div>
            <h2 className="text-lg font-semibold flex items-center gap-2 mb-3">
              <FileText className="h-5 w-5 text-muted-foreground" /> Histórico de Auditoria
            </h2>
            {auditLogs.length === 0 ? (
              <Card><CardContent className="py-8 text-center text-muted-foreground">Nenhum registro de auditoria encontrado.</CardContent></Card>
            ) : (
              <div className="overflow-x-auto rounded-lg border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Data/Hora</TableHead>
                      <TableHead>Ação</TableHead>
                      <TableHead className="hidden sm:table-cell">Executor</TableHead>
                      <TableHead className="hidden md:table-cell">Detalhes</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {auditLogs.map((log) => {
                      const executor = profiles[log.user_id];
                      return (
                        <TableRow key={log.id}>
                          <TableCell className="text-xs whitespace-nowrap">{new Date(log.created_at).toLocaleString("pt-BR")}</TableCell>
                          <TableCell>
                            <Badge variant="outline">{actionTypeLabels[log.action_type] || log.action_type}</Badge>
                          </TableCell>
                          <TableCell className="hidden sm:table-cell text-sm">{executor?.full_name || "Sistema"}</TableCell>
                          <TableCell className="hidden md:table-cell text-xs text-muted-foreground max-w-[200px] truncate">
                            {log.details ? (
                              <>
                                {log.details.amount && <span>R$ {Number(log.details.amount).toFixed(2)}</span>}
                                {log.details.montador_id && (
                                  <span className="ml-2">→ {profiles[log.details.montador_id as string]?.full_name || "Montador"}</span>
                                )}
                              </>
                            ) : "—"}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            )}
          </div>
        </TabsContent>

        {/* Chat Templates Tab */}
        <TabsContent value="templates" className="mt-4 space-y-4">
          <Card>
            <CardHeader><CardTitle className="text-lg flex items-center gap-2"><MessageSquareText className="h-5 w-5" /> Frases Pré-definidas do Chat</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input placeholder="Nova frase curta..." value={newTemplate} onChange={(e) => setNewTemplate(e.target.value)} onKeyDown={(e) => e.key === "Enter" && addTemplate()} />
                <Button onClick={addTemplate} className="gap-1"><Plus className="h-4 w-4" /> Adicionar</Button>
              </div>
              {chatTemplates.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">Nenhuma frase cadastrada.</p>
              ) : (
                <div className="space-y-2">
                  {chatTemplates.map((t) => (
                    <div key={t.id} className="flex items-center justify-between rounded-lg border p-3">
                      <span className="text-sm">{t.content}</span>
                      <Button variant="ghost" size="sm" className="text-destructive" onClick={() => deleteTemplate(t.id)}><Trash2 className="h-4 w-4" /></Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
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
              {confirmAction?.type === "suspend" && "Suspender Usuário"}
              {confirmAction?.type === "delete_user" && "Excluir Usuário"}
              {confirmAction?.type === "delete_order" && "Excluir Pedido"}
              {confirmAction?.type === "refund" && "Estornar Pedido"}
            </DialogTitle>
            <DialogDescription>
              {confirmAction?.type === "authorize" && confirmAction.tx && (
                <>Deseja autorizar o pagamento de <strong className="text-success">R$ {confirmAction.tx.amount.toFixed(2)}</strong> para <strong>{confirmAction.montadorName}</strong>?</>
              )}
              {confirmAction?.type === "block" && confirmAction.tx && (
                <>Deseja bloquear o pagamento de <strong className="text-destructive">R$ {confirmAction.tx.amount.toFixed(2)}</strong> para <strong>{confirmAction.montadorName}</strong>?</>
              )}
              {confirmAction?.type === "withdraw" && confirmAction.tx && (
                <>Confirma a transferência PIX de <strong className="text-destructive">R$ {Math.abs(confirmAction.tx.amount).toFixed(2)}</strong> para <strong>{confirmAction.montadorName}</strong>?</>
              )}
              {confirmAction?.type === "suspend" && <>Deseja suspender o usuário <strong>{confirmAction.targetName}</strong>?</>}
              {confirmAction?.type === "delete_user" && <>Deseja excluir permanentemente o perfil de <strong className="text-destructive">{confirmAction.targetName}</strong>?</>}
              {confirmAction?.type === "delete_order" && <>Deseja excluir permanentemente o pedido <strong className="text-destructive">{confirmAction.targetName}</strong>?</>}
              {confirmAction?.type === "refund" && <>Deseja estornar e cancelar o pedido <strong className="text-warning">{confirmAction.targetName}</strong>?</>}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setConfirmAction(null)} disabled={!!processing}>Cancelar</Button>
            <Button
              className={["block", "delete_user", "delete_order"].includes(confirmAction?.type || "") ? "bg-destructive hover:bg-destructive/80 text-destructive-foreground" : "bg-success hover:bg-success/80 text-success-foreground"}
              disabled={!!processing}
              onClick={() => {
                if (!confirmAction) return;
                if (confirmAction.type === "authorize" && confirmAction.tx) executeAuthorize(confirmAction.tx);
                else if (confirmAction.type === "block" && confirmAction.tx) executeBlock(confirmAction.tx);
                else if (confirmAction.type === "withdraw" && confirmAction.tx) executeWithdraw(confirmAction.tx);
                else if (confirmAction.type === "suspend" && confirmAction.targetId) executeSuspend(confirmAction.targetId);
                else if (confirmAction.type === "delete_user" && confirmAction.targetId) executeDeleteUser(confirmAction.targetId);
                else if (confirmAction.type === "delete_order" && confirmAction.targetId) executeDeleteOrder(confirmAction.targetId);
                else if (confirmAction.type === "refund" && confirmAction.targetId) executeRefund(confirmAction.targetId);
              }}
            >
              {processing ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : null}
              {confirmAction?.type === "authorize" && "Sim, Autorizar"}
              {confirmAction?.type === "block" && "Sim, Bloquear"}
              {confirmAction?.type === "withdraw" && "Sim, Confirmar"}
              {confirmAction?.type === "suspend" && "Sim, Suspender"}
              {confirmAction?.type === "delete_user" && "Sim, Excluir"}
              {confirmAction?.type === "delete_order" && "Sim, Excluir"}
              {confirmAction?.type === "refund" && "Sim, Estornar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminDashboard;
