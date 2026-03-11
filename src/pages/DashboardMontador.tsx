import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  neighborhood: string | null;
  status: string;
  service_type: string;
  created_at: string;
  client_id: string;
  is_urgent?: boolean;
  needs_wall_mount?: boolean;
  montador_arrived?: boolean;
  code_validated?: boolean;
  verification_code?: string | null;
  assigned_montador_id?: string | null;
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

const DashboardMontador = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [orders, setOrders] = useState<Order[]>([]);
  const [myBids, setMyBids] = useState<Bid[]>([]);
  const [bidAmounts, setBidAmounts] = useState<Record<string, string>>({});
  const [bidMessages, setBidMessages] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState<string | null>(null);
  const [wallMountAccepted, setWallMountAccepted] = useState<Record<string, boolean>>({});
  const [arrivingAt, setArrivingAt] = useState<string | null>(null);
  const [montadorCity, setMontadorCity] = useState<string | null>(null);
  const [showAllRegion, setShowAllRegion] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(() => {
    return !localStorage.getItem("montador-onboarding-done");
  });

  useEffect(() => {
    if (user) {
      fetchProfile();
      fetchOrders();
      fetchMyBids();
    } else {
      setLoading(false);
    }
  }, [user]);

  const fetchProfile = async () => {
    if (!user) return;
    const { data, error } = await supabase
      .from("profiles")
      .select("city")
      .eq("user_id", user.id)
      .single();

    if (error) {
      console.error("Erro ao buscar perfil do montador:", error);
      return;
    }

    if (data?.city) {
      setMontadorCity(data.city);
    }
  };

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

    if (data) {
      setOrders(data as Order[]);
    }
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

    if (data) {
      setMyBids(data as Bid[]);
    }
  };

  const handleBid = async (orderId: string, needsWallMount?: boolean) => {
    if (!user) return;

    const amount = parseFloat(bidAmounts[orderId] || "0");
    if (amount <= 0) {
      toast.error("Informe um valor válido");
      return;
    }

    if (needsWallMount && !wallMountAccepted[orderId]) {
      toast.error("Você precisa aceitar o termo de instalação em parede para enviar o lance.");
      return;
    }

    setSubmitting(orderId);

    try {
      const { error } = await supabase.from("bids").insert({
        order_id: orderId,
        montador_id: user.id,
        amount,
        message: bidMessages[orderId] || null,
      });

      if (error) throw error;

      await supabase
        .from("orders")
        .update({ status: "com_lance" })
        .eq("id", orderId);

      toast.success("Lance enviado!");
      fetchOrders();
      fetchMyBids();
    } catch (error: any) {
      console.error("Erro ao enviar lance:", error);
      toast.error("Erro: " + error.message);
    } finally {
      setSubmitting(null);
    }
  };

  const handleArrival = async (
    orderId: string,
    orderTitle: string,
    clientId: string
  ) => {
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

  // Mural: pedidos pendentes em que ainda não dei lance
  const muralOrders = orders.filter(
    (o) =>
      o.status === "pendente" &&
      !myBidOrderIds.has(o.id) &&
      (!o.assigned_montador_id || o.assigned_montador_id === user?.id)
  );

  const filteredMural =
    montadorCity && !showAllRegion
      ? muralOrders.filter((o) => o.city === montadorCity)
      : muralOrders;

  // Agenda: pedidos com lance aceito em status ativo
  const activeStatuses = [
    "aceito",
    "pago",
    "em_andamento",
    "desmontagem_confirmada",
  ];

  const agendaOrders = orders.filter(
    (o) =>
      myAcceptedBidOrderIds.has(o.id) && activeStatuses.includes(o.status)
  );

  // Histórico: pedidos concluídos / aguardando liberação
  const historicoStatuses = ["aguardando_liberacao", "concluido"];

  const historicoOrders = orders.filter(
    (o) =>
      myAcceptedBidOrderIds.has(o.id) && historicoStatuses.includes(o.status)
  );

  // Pedidos onde já dei lance mas ainda não foi aceito
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
                <Badge
                  variant="secondary"
                  className="ml-1 h-5 w-5 p-0 flex items-center justify-center text-xs"
                >
                  {filteredMural.length}
                </Badge>
              )}
            </TabsTrigger>

            <TabsTrigger value="agenda" className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              <span className="hidden sm:inline">Agenda</span>
              {agendaOrders.length > 0 && (
                <Badge
                  variant="secondary"
                  className="ml-1 h-5 w-5 p-0 flex items-center justify-center text-xs"
                >
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

            {/* Pedidos onde já enviei lance e está aguardando */}
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
                          {order.furniture_type} ·{" "}
                          {order.city || "Sem cidade definida"}
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
                  const bidVal = parseFloat(bidAmounts[order.id] || "0");
                  const isUrgent = !!order.is_urgent;
                  const needsWallMount = !!order.needs_wall_mount;
                  const isDesmontagem = order.service_type === "desmontagem";

                  // bairro vem da coluna neighborhood; fallback simples
                  const neighborhood =
                    order.neighborhood ||
                    (order.address ? order.address.split(",")[0] : "Bairro não informado");

                  return (
                    <Card
                      key={order.id}
                      className={`overflow-hidden ${
                        isUrgent
                          ? "border-destructive/60 shadow-lg shadow-destructive/10"
                          : ""
                      }`}
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
                            <div className="flex items-center gap-2 mt-1">
                              <Badge variant="outline" className="text-xs">
                                {isDesmontagem
                                  ? "🚚 Mudança (Des+Mont)"
                                  : "🔧 Montagem"}
                              </Badge>
                              <span className="text-sm text-muted-foreground">
                                {order.furniture_type}
                                {order.brand && ` · ${order.brand}`}
                              </span>
                            </div>
                          </div>
                          <Badge className={statusColors[order.status]}>
                            {statusLabels[order.status] || order.status}
                          </Badge>
                        </div>
                      </CardHeader>

                      <CardContent className="space-y-3">
                        <p className="text-sm">{order.description}</p>

                        <p className="text-sm text-muted-foreground flex items-center gap-1">
                          <MapPin className="h-3.5 w-3.5" />
                          {neighborhood} · {order.city || "Cidade não informada"}
                        </p>

                        {needsWallMount && (
                          <Alert className="border-warning/50 bg-warning/10">
                            <AlertTriangle className="h-5 w-5 text-warning" />
                            <AlertTitle className="text-warning font-bold">
                              ⚠️ Requer furação de parede
                            </AlertTitle>
                            <AlertDescription className="text-sm text-muted-foreground">
                              Certifique-se de possuir furadeira e brocas
                              adequadas.
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

                        <div className="space-y-2 pt-2 border-t border-border">
                          <div className="flex flex-col md:flex-row gap-2">
                            <Input
                              type="number"
                              placeholder="Seu valor R$"
                              className="md:flex-1"
                              value={bidAmounts[order.id] || ""}
                              onChange={(e) =>
                                setBidAmounts({
                                  ...bidAmounts,
                                  [order.id]: e.target.value,
                                })
                              }
                            />

                            <Input
                              placeholder="Mensagem (opcional)"
                              className="md:flex-1"
                              value={bidMessages[order.id] || ""}
                              onChange={(e) =>
                                setBidMessages({
                                  ...bidMessages,
                                  [order.id]: e.target.value,
                                })
                              }
                            />

                            <Button
                              className="gradient-primary text-primary-foreground md:w-auto w-full"
                              disabled={
                                submitting === order.id ||
                                (needsWallMount &&
                                  !wallMountAccepted[order.id])
                              }
                              onClick={() =>
                                handleBid(order.id, needsWallMount)
                              }
                            >
                              <Send className="h-4 w-4 mr-1" />
                              {submitting === order.id ? "..." : "Enviar"}
                            </Button>
                          </div>

                          {needsWallMount && (
                            <div className="flex items-start gap-2 rounded-lg border border-warning/40 bg-warning/5 p-3">
                              <Checkbox
                                id={`wall-mount-${order.id}`}
                                checked={wallMountAccepted[order.id] || false}
                                onCheckedChange={(checked) =>
                                  setWallMountAccepted({
                                    ...wallMountAccepted,
                                    [order.id]: checked === true,
                                  })
                                }
                              />
                              <label
                                htmlFor={`wall-mount-${order.id}`}
                                className="text-xs text-muted-foreground leading-relaxed cursor-pointer"
                              >
                                Confirmo que possuo as ferramentas necessárias
                                para instalação em parede.
                              </label>
                            </div>
                          )}

                          {bidVal > 0 && (
                            <div className="flex items-start gap-1.5 text-xs text-muted-foreground rounded-lg bg-muted p-2">
                              <Info className="h-3.5 w-3.5 mt-0.5 shrink-0" />
                              <span>
                                Seu lance: R$ {bidVal.toFixed(2)} → Cliente
                                paga: R${" "}
                                {calcClientTotal(bidVal).toFixed(2)} → Você
                                recebe:{" "}
                                <strong
                                  className={
                                    isUrgent
                                      ? "text-destructive"
                                      : "text-success"
                                  }
                                >
                                  R${" "}
                                  {calcMontadorReceives(
                                    bidVal,
                                    isUrgent
                                  ).toFixed(2)}
                                </strong>
                                {isUrgent
                                  ? " (🔥 Taxa Zero!)"
                                  : " (comissão 10%)"}
                                {isDesmontagem &&
                                  " · 40% após desmontagem, 60% após montagem"}
                              </span>
                            </div>
                          )}
                        </div>
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
                  const isPaid = [
                    "pago",
                    "em_andamento",
                    "desmontagem_confirmada",
                  ].includes(order.status);
                  const isDesmontagem = order.service_type === "desmontagem";
                  const acceptedBid = myBids.find(
                    (b) => b.order_id === order.id && b.accepted
                  );

                  return (
                    <Card
                      key={order.id}
                      className="overflow-hidden border-primary/30"
                    >
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                          <CardTitle className="text-lg">
                            {order.title}
                          </CardTitle>
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
                              {order.neighborhood && `${order.neighborhood} · `}
                              {order.city}
                            </p>
                            <div className="flex gap-2 mt-2">
                              <a
                                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                                  order.address
                                )}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-xs text-primary underline"
                              >
                                📍 Google Maps
                              </a>
                              <a
                                href={`https://waze.com/ul?q=${encodeURIComponent(
                                  order.address
                                )}`}
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
                            <MapPin className="h-3.5 w-3.5" /> Endereço liberado
                            após pagamento
                          </p>
                        )}

                        {acceptedBid && (
                          <p className="text-sm text-muted-foreground">
                            Valor do lance:{" "}
                            <strong className="text-primary">
                              R$ {acceptedBid.amount.toFixed(2)}
                            </strong>
                          </p>
                        )}

                        {order.status === "pago" && !order.montador_arrived && (
                          <Button
                            size="sm"
                            className="gradient-primary text-primary-foreground"
                            disabled={arrivingAt === order.id}
                            onClick={() =>
                              handleArrival(order.id, order.title, order.client_id)
                            }
                          >
                            <MapPinCheck className="h-4 w-4 mr-1" />
                            {arrivingAt === order.id
                              ? "Notificando..."
                              : "Cheguei no Local"}
                          </Button>
                        )}

                        {order.montador_arrived &&
                          order.status === "pago" && (
                            <Badge className="bg-success/20 text-success border border-success/30">
                              <MapPinCheck className="h-3 w-3 mr-1" />
                              Chegada confirmada
                            </Badge>
                          )}

                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => navigate(`/chat/${order.id}`)}
                        >
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
                  const acceptedBid = myBids.find(
                    (b) => b.order_id === order.id && b.accepted
                  );
                  const isUrgent = !!order.is_urgent;

                  return (
                    <Card key={order.id}>
                      <CardContent className="py-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">{order.title}</p>
                            <p className="text-xs text-muted-foreground">
                              {order.furniture_type} ·{" "}
                              {new Date(order.created_at).toLocaleDateString(
                                "pt-BR"
                              )}
                            </p>
                            {acceptedBid && (
                              <p className="text-sm mt-1">
                                Valor:{" "}
                                <strong className="text-success">
                                  R${" "}
                                  {calcMontadorReceives(
                                    acceptedBid.amount,
                                    isUrgent
                                  ).toFixed(2)}
                                </strong>
                                {isUrgent && (
                                  <span className="text-xs text-destructive ml-1">
                                    (Taxa Zero)
                                  </span>
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

            <Button
              variant="outline"
              className="w-full"
              onClick={() => navigate("/carteira")}
            >
              <DollarSign className="h-4 w-4 mr-1" /> Ver Carteira Completa
            </Button>
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
};

export default DashboardMontador;
