import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import {
  Package,
  MapPin,
  DollarSign,
  Send,
  MessageSquare,
  Info,
  Flame,
  Rocket,
  Globe,
  MapPinCheck,
  AlertTriangle,
  Calendar,
  History,
  Briefcase,
  Clock,
  FileText,
} from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { useNavigate } from "react-router-dom";
import { calcMontadorReceives, calcClientTotal } from "@/lib/fees";
import MontadorOnboarding from "@/components/MontadorOnboarding";
import logoClickmont from "@/assets/logo-clickmont.png";

interface Order {
  id: string;
  title: string;
  description: string;
  furniture_type: string;
  brand: string | null;
  address: string;
  city: string | null;
  status: string;
  service_type: string;
  created_at: string;
  client_id: string;
  is_urgent?: boolean;
  needs_wall_mount?: boolean;
  montador_arrived?: boolean;
  code_validated?: boolean;
  verification_code?: string | null;
}

interface Bid {
  id: string;
  order_id: string;
  montador_id: string;
  amount: number;
  accepted: boolean;
}

const statusLabels: Record<string, string> = {
  pendente: "Novo",
  com_lance: "Lance enviado",
  aceito: "Aceito",
  pago: "Pago",
  em_andamento: "Em andamento",
  desmontagem_confirmada: "Desmontagem OK",
  aguardando_liberacao: "Aguardando liberação",
  concluido: "Concluído",
};

const statusColors: Record<string, string> = {
  pendente: "bg-warning text-warning-foreground",
  com_lance: "bg-primary text-primary-foreground",
  aceito: "bg-accent text-accent-foreground",
  pago: "bg-success text-success-foreground",
  em_andamento: "bg-primary text-primary-foreground",
  desmontagem_confirmada: "bg-accent text-accent-foreground",
  aguardando_liberacao: "bg-primary/80 text-primary-foreground",
  concluido: "bg-muted text-muted-foreground",
};

const extractNeighborhood = (address: string) =>
  address ? address.split(",")[0] : "Bairro não informado";

const DashboardMontador = () => {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const montadorCity = profile?.city ?? null;

  const [orders, setOrders] = useState<Order[]>([]);
  const [myBids, setMyBids] = useState<Bid[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState<string | null>(null);
  const [wallMountAccepted, setWallMountAccepted] = useState<Record<string, boolean>>({});
  const [arrivingAt, setArrivingAt] = useState<string | null>(null);
  const [showAllRegion, setShowAllRegion] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(() => {
    return !localStorage.getItem("montador-onboarding-done");
  });

  // Detail modal state
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [bidAmount, setBidAmount] = useState("");
  const [bidDeadline, setBidDeadline] = useState("");
  const [bidMessage, setBidMessage] = useState("");

  useEffect(() => {
    if (user) {
      fetchOrders();
      fetchMyBids();
    } else {
      setLoading(false);
    }
  }, [user]);

  const fetchOrders = async () => {
    const { data, error } = await supabase
      .from("orders")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Erro ao buscar pedidos:", error);
      toast.error("Erro ao carregar pedidos");
      setLoading(false);
      return;
    }

    if (data) setOrders(data as Order[]);
    setLoading(false);
  };

  const fetchMyBids = async () => {
    if (!user) return;
    const { data, error } = await supabase
      .from("bids")
      .select("*")
      .eq("montador_id", user.id);

    if (error) {
      console.error("Erro ao buscar meus lances:", error);
      return;
    }
    if (data) setMyBids(data as Bid[]);
  };

  const openOrderDetail = (order: Order) => {
    setSelectedOrder(order);
    setBidAmount("");
    setBidDeadline("");
    setBidMessage("");
  };

  const handleBidFromModal = async () => {
    if (!user || !selectedOrder) return;

    const amount = parseFloat(bidAmount);
    if (amount <= 0 || isNaN(amount)) {
      toast.error("Informe um valor válido");
      return;
    }

    const needsWallMount = !!selectedOrder.needs_wall_mount;
    if (needsWallMount && !wallMountAccepted[selectedOrder.id]) {
      toast.error("Você precisa aceitar o termo de instalação em parede.");
      return;
    }

    setSubmitting(selectedOrder.id);

    try {
      const { error } = await supabase.from("bids").insert({
        order_id: selectedOrder.id,
        montador_id: user.id,
        amount,
        message: bidMessage || null,
        deadline: bidDeadline || null,
      } as any);

      if (error) throw error;

      await supabase
        .from("orders")
        .update({ status: "com_lance" })
        .eq("id", selectedOrder.id);

      toast.success("Orçamento enviado com sucesso!");
      setSelectedOrder(null);
      fetchOrders();
      fetchMyBids();
    } catch (error: any) {
      console.error("Erro ao enviar orçamento:", error);
      toast.error("Erro: " + error.message);
    } finally {
      setSubmitting(null);
    }
  };

  const handleArrival = async (orderId: string, orderTitle: string, clientId: string) => {
    if (!user) return;
    setArrivingAt(orderId);

    try {
      await supabase
        .from("orders")
        .update({ montador_arrived: true } as any)
        .eq("id", orderId);

      const { data: mp } = await supabase
        .from("profiles")
        .select("full_name")
        .eq("user_id", user.id)
        .single();

      const montadorName = mp?.full_name || "Montador";

      const { data: orderData } = await supabase
        .from("orders")
        .select("verification_code")
        .eq("id", orderId)
        .single();

      const code = (orderData as any)?.verification_code || "****";

      await supabase.functions.invoke("send-push", {
        body: {
          user_id: clientId,
          title: "🔔 Seu montador chegou!",
          message: `${montadorName} acabou de chegar! Tenha em mãos o seu código de segurança: #${code}`,
          order_id: orderId,
        },
      });

      await supabase.from("chat_messages").insert({
        order_id: orderId,
        sender_id: user.id,
        message:
          "Olá! Acabei de chegar ao local. Quando puder, por favor, me informe o código de 4 dígitos que aparece no seu aplicativo para eu iniciar o serviço.",
        is_preset: false,
      });

      toast.success("Cliente notificado da sua chegada!");
      fetchOrders();
    } catch (err: any) {
      console.error("Erro ao registrar chegada:", err);
      toast.error("Erro: " + err.message);
    } finally {
      setArrivingAt(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  // ===== Categorização de pedidos =====
  const myBidOrderIds = new Set(myBids.map((b) => b.order_id));
  const myAcceptedBidOrderIds = new Set(
    myBids.filter((b) => b.accepted).map((b) => b.order_id)
  );

  const muralOrders = orders.filter(
    (o) => o.status === "pendente" && !myBidOrderIds.has(o.id)
  );

  const filteredMural =
    montadorCity && !showAllRegion
      ? muralOrders.filter((o) => o.city === montadorCity)
      : muralOrders;

  const activeStatuses = ["aceito", "pago", "em_andamento", "desmontagem_confirmada"];
  const agendaOrders = orders.filter(
    (o) => myAcceptedBidOrderIds.has(o.id) && activeStatuses.includes(o.status)
  );

  const historicoStatuses = ["aguardando_liberacao", "concluido"];
  const historicoOrders = orders.filter(
    (o) => myAcceptedBidOrderIds.has(o.id) && historicoStatuses.includes(o.status)
  );

  const pendingBidOrders = orders.filter(
    (o) =>
      myBidOrderIds.has(o.id) &&
      !myAcceptedBidOrderIds.has(o.id) &&
      o.status === "com_lance"
  );

  return (
    <>
      {showOnboarding && (
        <MontadorOnboarding onComplete={() => setShowOnboarding(false)} />
      )}

      {/* ===== DETAIL MODAL ===== */}
      <Dialog open={!!selectedOrder} onOpenChange={(open) => !open && setSelectedOrder(null)}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          {selectedOrder && (() => {
            const neighborhood = extractNeighborhood(selectedOrder.address);
            const isUrgent = !!selectedOrder.is_urgent;
            const needsWallMount = !!selectedOrder.needs_wall_mount;
            const isDesmontagem = selectedOrder.service_type === "desmontagem";
            const parsedAmount = parseFloat(bidAmount) || 0;

            return (
              <>
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    {selectedOrder.title}
                    {isUrgent && (
                      <Badge className="bg-destructive text-destructive-foreground text-xs animate-pulse">
                        <Flame className="h-3 w-3 mr-1" /> URGENTE
                      </Badge>
                    )}
                  </DialogTitle>
                  <DialogDescription>
                    Detalhes do pedido e envio de orçamento
                  </DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
                  {/* Status + Type */}
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge className={statusColors[selectedOrder.status]}>
                      {statusLabels[selectedOrder.status] || selectedOrder.status}
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      {isDesmontagem ? "🚚 Mudança (Des+Mont)" : "🔧 Montagem"}
                    </Badge>
                  </div>

                  {/* Description */}
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-1">Descrição</p>
                    <p className="text-sm">{selectedOrder.description}</p>
                  </div>

                  {/* Furniture */}
                  <div className="flex gap-4">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Móvel</p>
                      <p className="text-sm">{selectedOrder.furniture_type}</p>
                    </div>
                    {selectedOrder.brand && (
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Marca</p>
                        <p className="text-sm">{selectedOrder.brand}</p>
                      </div>
                    )}
                  </div>

                  {/* Location */}
                  <div className="rounded-lg bg-muted p-3 space-y-1">
                    <p className="text-sm font-medium flex items-center gap-1">
                      <MapPin className="h-4 w-4 text-primary" /> Localização
                    </p>
                    <p className="text-sm">
                      {neighborhood} · {selectedOrder.city || "Cidade não informada"}
                    </p>
                  </div>

                  {/* Date */}
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    Publicado em{" "}
                    {new Date(selectedOrder.created_at).toLocaleDateString("pt-BR", {
                      day: "2-digit",
                      month: "long",
                      year: "numeric",
                    })}
                  </div>

                  {/* Wall mount warning */}
                  {needsWallMount && (
                    <Alert className="border-warning/50 bg-warning/10">
                      <AlertTriangle className="h-5 w-5 text-warning" />
                      <AlertTitle className="text-warning font-bold">
                        ⚠️ Requer furação de parede
                      </AlertTitle>
                      <AlertDescription className="text-sm text-muted-foreground">
                        Certifique-se de possuir furadeira e brocas adequadas.
                      </AlertDescription>
                    </Alert>
                  )}

                  {isUrgent && (
                    <div className="rounded-lg bg-destructive/10 border border-destructive/30 p-3 flex items-start gap-2">
                      <Rocket className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm font-semibold text-destructive">
                          🚀 Pedido urgente — Taxa Zero!
                        </p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          Você recebe o valor total do seu lance.
                        </p>
                      </div>
                    </div>
                  )}

                  {/* ===== BID FORM ===== */}
                  <div className="border-t border-border pt-4 space-y-3">
                    <p className="text-sm font-semibold flex items-center gap-1">
                      <FileText className="h-4 w-4" /> Enviar Orçamento
                    </p>

                    <div>
                      <label className="text-xs font-medium text-muted-foreground">Valor proposto (R$) *</label>
                      <Input
                        type="number"
                        placeholder="Ex: 150.00"
                        value={bidAmount}
                        onChange={(e) => setBidAmount(e.target.value)}
                      />
                    </div>

                    <div>
                      <label className="text-xs font-medium text-muted-foreground">Prazo estimado</label>
                      <Input
                        placeholder="Ex: 2 horas, 1 dia"
                        value={bidDeadline}
                        onChange={(e) => setBidDeadline(e.target.value)}
                      />
                    </div>

                    <div>
                      <label className="text-xs font-medium text-muted-foreground">Mensagem (opcional)</label>
                      <Textarea
                        placeholder="Observações, experiência, etc."
                        value={bidMessage}
                        onChange={(e) => setBidMessage(e.target.value)}
                        rows={3}
                      />
                    </div>

                    {needsWallMount && (
                      <div className="flex items-start gap-2 rounded-lg border border-warning/40 bg-warning/5 p-3">
                        <Checkbox
                          id={`wall-mount-modal`}
                          checked={wallMountAccepted[selectedOrder.id] || false}
                          onCheckedChange={(checked) =>
                            setWallMountAccepted({
                              ...wallMountAccepted,
                              [selectedOrder.id]: checked === true,
                            })
                          }
                        />
                        <label
                          htmlFor={`wall-mount-modal`}
                          className="text-xs text-muted-foreground leading-relaxed cursor-pointer"
                        >
                          Confirmo que possuo as ferramentas necessárias para instalação em parede.
                        </label>
                      </div>
                    )}

                    {parsedAmount > 0 && (
                      <div className="flex items-start gap-1.5 text-xs text-muted-foreground rounded-lg bg-muted p-2">
                        <Info className="h-3.5 w-3.5 mt-0.5 shrink-0" />
                        <span>
                          Seu lance: R$ {parsedAmount.toFixed(2)} → Cliente paga: R${" "}
                          {calcClientTotal(parsedAmount).toFixed(2)} → Você recebe:{" "}
                          <strong className={isUrgent ? "text-destructive" : "text-success"}>
                            R$ {calcMontadorReceives(parsedAmount, isUrgent).toFixed(2)}
                          </strong>
                          {isUrgent ? " (🔥 Taxa Zero!)" : " (comissão 10%)"}
                          {isDesmontagem && " · 40% após desmontagem, 60% após montagem"}
                        </span>
                      </div>
                    )}

                    <Button
                      className="w-full gradient-primary text-primary-foreground"
                      disabled={submitting === selectedOrder.id}
                      onClick={handleBidFromModal}
                    >
                      <Send className="h-4 w-4 mr-1" />
                      {submitting === selectedOrder.id ? "Enviando..." : "Enviar Orçamento"}
                    </Button>
                  </div>
                </div>
              </>
            );
          })()}
        </DialogContent>
      </Dialog>

      <div className="space-y-6 animate-fade-in">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src={logoClickmont} alt="Clickmont" className="h-8 w-8" />
            <div>
              <h1 className="text-2xl font-bold">Área do Montador</h1>
              <p className="text-muted-foreground">Gerencie seus serviços</p>
            </div>
          </div>
        </div>

        <Tabs defaultValue="mural" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="mural" className="flex items-center gap-1">
              <Briefcase className="h-4 w-4" />
              <span className="hidden sm:inline">Mural</span>
              {filteredMural.length > 0 && (
                <Badge variant="secondary" className="ml-1 h-5 w-5 p-0 flex items-center justify-center text-xs">
                  {filteredMural.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="agenda" className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              <span className="hidden sm:inline">Agenda</span>
              {agendaOrders.length > 0 && (
                <Badge variant="secondary" className="ml-1 h-5 w-5 p-0 flex items-center justify-center text-xs">
                  {agendaOrders.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="historico" className="flex items-center gap-1">
              <History className="h-4 w-4" />
              <span className="hidden sm:inline">Histórico</span>
            </TabsTrigger>
          </TabsList>

          {/* ===== MURAL ===== */}
          <TabsContent value="mural" className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                {montadorCity && !showAllRegion
                  ? `Pedidos em ${montadorCity}`
                  : "Todos os pedidos disponíveis"}
              </p>
              {montadorCity && (
                <Button
                  variant={showAllRegion ? "default" : "outline"}
                  size="sm"
                  onClick={() => setShowAllRegion(!showAllRegion)}
                >
                  <Globe className="h-4 w-4 mr-1" />
                  {showAllRegion ? "Só minha cidade" : "Ver toda região"}
                </Button>
              )}
            </div>

            {/* Lances pendentes */}
            {pendingBidOrders.length > 0 && (
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">
                  Lances enviados (aguardando resposta)
                </p>
                {pendingBidOrders.map((order) => (
                  <Card key={order.id} className="border-primary/20">
                    <CardContent className="py-3 flex items-center justify-between">
                      <div>
                        <p className="font-medium text-sm">{order.title}</p>
                        <p className="text-xs text-muted-foreground">
                          {order.furniture_type} · {extractNeighborhood(order.address)} · {order.city || "Cidade não informada"}
                        </p>
                      </div>
                      <Badge className={statusColors["com_lance"]}>
                        {statusLabels["com_lance"]}
                      </Badge>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {filteredMural.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center text-muted-foreground">
                  <Package className="h-12 w-12 mx-auto mb-3 opacity-40" />
                  {montadorCity && !showAllRegion
                    ? `Nenhum pedido disponível em ${montadorCity}. Tente "Ver toda região".`
                    : "Nenhum pedido disponível no momento."}
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4">
                {filteredMural.map((order) => {
                  const isUrgent = !!order.is_urgent;
                  const isDesmontagem = order.service_type === "desmontagem";
                  const neighborhood = extractNeighborhood(order.address);

                  return (
                    <Card
                      key={order.id}
                      className={`overflow-hidden hover:border-primary/60 transition-colors cursor-pointer ${
                        isUrgent ? "border-destructive/60 shadow-lg shadow-destructive/10" : ""
                      }`}
                      onClick={() => openOrderDetail(order)}
                    >
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                          <div>
                            <CardTitle className="text-lg flex items-center gap-2">
                              {order.title}
                              {isUrgent && (
                                <Badge className="bg-destructive text-destructive-foreground text-xs animate-pulse">
                                  <Flame className="h-3 w-3 mr-1" /> URGENTE
                                </Badge>
                              )}
                            </CardTitle>
                            <div className="flex flex-wrap items-center gap-2 mt-1 text-sm">
                              <Badge variant="outline" className="text-xs">
                                {isDesmontagem ? "🚚 Mudança (Des+Mont)" : "🔧 Montagem"}
                              </Badge>
                              <span className="text-muted-foreground">
                                {order.furniture_type}
                                {order.brand && ` · ${order.brand}`}
                              </span>
                            </div>
                            <p className="mt-1 text-xs font-medium text-primary flex items-center gap-1">
                              <MapPin className="h-3.5 w-3.5" />
                              {neighborhood} · {order.city || "Cidade não informada"}
                            </p>
                          </div>
                          <Badge className={statusColors[order.status]}>
                            {statusLabels[order.status] || order.status}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <p className="text-sm text-muted-foreground line-clamp-2">{order.description}</p>
                        <p className="text-xs text-primary mt-2 font-medium">Clique para ver detalhes e enviar orçamento →</p>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </TabsContent>

          {/* ===== AGENDA ===== */}
          <TabsContent value="agenda" className="space-y-4">
            {agendaOrders.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center text-muted-foreground">
                  <Calendar className="h-12 w-12 mx-auto mb-3 opacity-40" />
                  Nenhum serviço agendado no momento.
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4">
                {agendaOrders.map((order) => {
                  const isPaid = ["pago", "em_andamento", "desmontagem_confirmada"].includes(order.status);
                  const isDesmontagem = order.service_type === "desmontagem";
                  const acceptedBid = myBids.find((b) => b.order_id === order.id && b.accepted);

                  return (
                    <Card key={order.id} className="overflow-hidden border-primary/30">
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                          <CardTitle className="text-lg">{order.title}</CardTitle>
                          <Badge className={statusColors[order.status]}>
                            {statusLabels[order.status] || order.status}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="outline" className="text-xs">
                            {isDesmontagem ? "🚚 Mudança" : "🔧 Montagem"}
                          </Badge>
                          <span className="text-sm text-muted-foreground">
                            {order.furniture_type}
                            {order.brand && ` · ${order.brand}`}
                          </span>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <p className="text-sm">{order.description}</p>

                        {isPaid ? (
                          <div className="rounded-lg bg-success/10 border border-success/30 p-3">
                            <p className="text-sm font-medium flex items-center gap-1">
                              <MapPin className="h-4 w-4 text-success" />
                              Endereço de Montagem:
                            </p>
                            <p className="text-sm mt-1">{order.address}</p>
                            <p className="text-xs text-muted-foreground mt-1">
                              {extractNeighborhood(order.address)} · {order.city}
                            </p>
                            <div className="flex gap-2 mt-2">
                              <a
                                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(order.address)}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-xs text-primary underline"
                              >
                                📍 Google Maps
                              </a>
                              <a
                                href={`https://waze.com/ul?q=${encodeURIComponent(order.address)}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-xs text-primary underline"
                              >
                                🗺️ Waze
                              </a>
                            </div>
                          </div>
                        ) : (
                          <p className="text-sm text-muted-foreground flex items-center gap-1">
                            <MapPin className="h-3.5 w-3.5" /> Endereço liberado após pagamento
                          </p>
                        )}

                        {acceptedBid && (
                          <p className="text-sm text-muted-foreground">
                            Valor do lance:{" "}
                            <strong className="text-primary">R$ {acceptedBid.amount.toFixed(2)}</strong>
                          </p>
                        )}

                        {order.status === "pago" && !order.montador_arrived && (
                          <Button
                            size="sm"
                            className="gradient-primary text-primary-foreground"
                            disabled={arrivingAt === order.id}
                            onClick={() => handleArrival(order.id, order.title, order.client_id)}
                          >
                            <MapPinCheck className="h-4 w-4 mr-1" />
                            {arrivingAt === order.id ? "Notificando..." : "Cheguei no Local"}
                          </Button>
                        )}

                        {order.montador_arrived && order.status === "pago" && (
                          <Badge className="bg-success/20 text-success border border-success/30">
                            <MapPinCheck className="h-3 w-3 mr-1" />
                            Chegada confirmada
                          </Badge>
                        )}

                        <Button variant="outline" size="sm" onClick={() => navigate(`/chat/${order.id}`)}>
                          <MessageSquare className="h-4 w-4 mr-1" /> Abrir Chat
                        </Button>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </TabsContent>

          {/* ===== HISTÓRICO ===== */}
          <TabsContent value="historico" className="space-y-4">
            {historicoOrders.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center text-muted-foreground">
                  <History className="h-12 w-12 mx-auto mb-3 opacity-40" />
                  Nenhum serviço concluído ainda.
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4">
                {historicoOrders.map((order) => {
                  const acceptedBid = myBids.find((b) => b.order_id === order.id && b.accepted);
                  const isUrgent = !!order.is_urgent;

                  return (
                    <Card key={order.id}>
                      <CardContent className="py-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">{order.title}</p>
                            <p className="text-xs text-muted-foreground">
                              {order.furniture_type} ·{" "}
                              {new Date(order.created_at).toLocaleDateString("pt-BR")}
                            </p>
                            {acceptedBid && (
                              <p className="text-sm mt-1">
                                Valor:{" "}
                                <strong className="text-success">
                                  R$ {calcMontadorReceives(acceptedBid.amount, isUrgent).toFixed(2)}
                                </strong>
                                {isUrgent && (
                                  <span className="text-xs text-destructive ml-1">(Taxa Zero)</span>
                                )}
                              </p>
                            )}
                          </div>
                          <Badge className={statusColors[order.status]}>
                            {statusLabels[order.status] || order.status}
                          </Badge>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}

            <Button variant="outline" className="w-full" onClick={() => navigate("/carteira")}>
              <DollarSign className="h-4 w-4 mr-1" /> Ver Carteira Completa
            </Button>
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
};

export default DashboardMontador;
