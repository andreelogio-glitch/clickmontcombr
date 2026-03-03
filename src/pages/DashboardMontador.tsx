import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Package, MapPin, DollarSign, Send, MessageSquare, Info, Flame, Rocket, Globe, MapPinCheck, AlertTriangle } from "lucide-react";
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
    } else {
      setLoading(false);
    }
  }, [user]);

  const fetchProfile = async () => {
    if (!user) return;
    const { data } = await supabase.from("profiles").select("city").eq("user_id", user.id).single();
    if (data?.city) setMontadorCity(data.city);
  };

  const fetchOrders = async () => {
    const { data, error } = await supabase.from("orders").select("*").order("created_at", { ascending: false });
    if (!error && data) setOrders(data as Order[]);
    setLoading(false);
  };

  const handleBid = async (orderId: string, needsWallMount?: boolean) => {
    if (!user) return;
    const amount = parseFloat(bidAmounts[orderId] || "0");
    if (amount <= 0) { toast.error("Informe um valor válido"); return; }
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
      await supabase.from("orders").update({ status: "com_lance" }).eq("id", orderId);
      toast.success("Lance enviado!");
      fetchOrders();
    } catch (error: any) {
      toast.error("Erro: " + error.message);
    } finally {
      setSubmitting(null);
    }
  };

  const handleArrival = async (orderId: string, orderTitle: string, clientId: string) => {
    if (!user) return;
    setArrivingAt(orderId);
    try {
      // Mark as arrived
      await supabase.from("orders").update({ montador_arrived: true } as any).eq("id", orderId);

      // Get montador name
      const { data: mp } = await supabase.from("profiles").select("full_name").eq("user_id", user.id).single();
      const montadorName = mp?.full_name || "Montador";

      // Get verification code
      const { data: orderData } = await supabase.from("orders").select("verification_code").eq("id", orderId).single();
      const code = (orderData as any)?.verification_code || "****";

      // Send push to client
      await supabase.functions.invoke("send-push", {
        body: {
          user_id: clientId,
          title: "🔔 Seu montador chegou!",
          message: `${montadorName} acabou de chegar! Tenha em mãos o seu código de segurança: #${code}`,
          order_id: orderId,
        },
      });

      // Auto-message in chat
      await supabase.from("chat_messages").insert({
        order_id: orderId,
        sender_id: user.id,
        message: "Olá! Acabei de chegar ao local. Quando puder, por favor, me informe o código de 4 dígitos que aparece no seu aplicativo para eu iniciar o serviço.",
        is_preset: false,
      });

      toast.success("Cliente notificado da sua chegada!");
      fetchOrders();
    } catch (err: any) {
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
            <h1 className="text-2xl font-bold">Pedidos Disponíveis</h1>
            <p className="text-muted-foreground">
              {montadorCity && !showAllRegion
                ? `Mostrando pedidos em ${montadorCity}`
                : "Mostrando todos os pedidos da região"}
            </p>
          </div>
        </div>
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

      {(() => {
        const filteredOrders = montadorCity && !showAllRegion
          ? orders.filter((o) => (o as any).city === montadorCity)
          : orders;

        return filteredOrders.length === 0 ? (
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
          {filteredOrders.map((order) => {
            const bidVal = parseFloat(bidAmounts[order.id] || "0");
            const isDesmontagem = order.service_type === "desmontagem";
            const isPaid = ["pago", "desmontagem_confirmada", "aguardando_liberacao", "concluido"].includes(order.status);
            const isUrgent = !!(order as any).is_urgent;
            const needsWallMount = !!(order as any).needs_wall_mount;

            return (
              <Card key={order.id} className={`overflow-hidden ${isUrgent ? "border-destructive/60 shadow-lg shadow-destructive/10" : ""}`}>
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
                          {isDesmontagem ? "🚚 Mudança (Des+Mont)" : "🔧 Montagem"}
                        </Badge>
                        <span className="text-sm text-muted-foreground">
                          {order.furniture_type}{order.brand && ` · ${order.brand}`}
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
                    <MapPin className="h-3.5 w-3.5" /> {isPaid ? order.address : order.address.split(",")[0] + " (endereço completo após pagamento)"}
                  </p>

                  {/* Wall mount alert */}
                  {needsWallMount && (
                    <Alert className="border-warning/50 bg-warning/10">
                      <AlertTriangle className="h-5 w-5 text-warning" />
                      <AlertTitle className="text-warning font-bold">⚠️ ATENÇÃO: Este serviço requer furação de parede.</AlertTitle>
                      <AlertDescription className="text-sm text-muted-foreground">
                        O cliente solicitou instalação em parede (painéis, armários suspensos, nichos). Certifique-se de possuir furadeira e brocas adequadas.
                      </AlertDescription>
                    </Alert>
                  )}

                  {/* Urgent incentive banner */}
                  {isUrgent && order.status === "pendente" && (
                    <div className="rounded-lg bg-destructive/10 border border-destructive/30 p-3 flex items-start gap-2">
                      <Rocket className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm font-semibold text-destructive">🚀 Oportunidade: Este pedido é urgente!</p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          Taxa zero para o montador — você recebe o valor total do seu lance.
                        </p>
                      </div>
                    </div>
                  )}

                  {order.status === "pendente" && (
                    <div className="space-y-2 pt-2 border-t border-border">
                      <div className="flex gap-2">
                        <div className="flex-1">
                          <Input type="number" placeholder="Seu valor R$" value={bidAmounts[order.id] || ""} onChange={(e) => setBidAmounts({ ...bidAmounts, [order.id]: e.target.value })} />
                        </div>
                        <Input placeholder="Mensagem (opcional)" className="flex-1" value={bidMessages[order.id] || ""} onChange={(e) => setBidMessages({ ...bidMessages, [order.id]: e.target.value })} />
                        <Button className="gradient-primary text-primary-foreground" disabled={submitting === order.id || (needsWallMount && !wallMountAccepted[order.id])} onClick={() => handleBid(order.id, needsWallMount)}>
                          <Send className="h-4 w-4 mr-1" />
                          {submitting === order.id ? "..." : "Enviar"}
                        </Button>
                      </div>
                      {/* Wall mount acceptance checkbox */}
                      {needsWallMount && (
                        <div className="flex items-start gap-2 rounded-lg border border-warning/40 bg-warning/5 p-3">
                          <Checkbox
                            id={`wall-mount-${order.id}`}
                            checked={wallMountAccepted[order.id] || false}
                            onCheckedChange={(checked) => setWallMountAccepted({ ...wallMountAccepted, [order.id]: checked === true })}
                          />
                          <label htmlFor={`wall-mount-${order.id}`} className="text-xs text-muted-foreground leading-relaxed cursor-pointer">
                            Estou ciente de que este serviço exige instalação em parede e confirmo que possuo as ferramentas necessárias (furadeira e brocas) para a execução.
                          </label>
                        </div>
                      )}
                      {bidVal > 0 && (
                        <div className="flex items-start gap-1.5 text-xs text-muted-foreground rounded-lg bg-muted p-2">
                          <Info className="h-3.5 w-3.5 mt-0.5 shrink-0" />
                          <span>
                            Seu lance: R$ {bidVal.toFixed(2)} → Cliente paga: R$ {calcClientTotal(bidVal).toFixed(2)} → Você recebe: <strong className={isUrgent ? "text-destructive" : "text-success"}>R$ {calcMontadorReceives(bidVal, isUrgent).toFixed(2)}</strong>
                            {isUrgent ? " (🔥 Taxa Zero!)" : " (taxa 10%)"}
                            {isDesmontagem && " · Desmontagem: 40% liberado após desmontagem, 60% após montagem"}
                          </span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* "Cheguei no Local" button for paid orders */}
                  {order.status === "pago" && !(order as any).montador_arrived && (
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

                  {(order as any).montador_arrived && order.status === "pago" && (
                    <Badge className="bg-success/20 text-success border border-success/30">
                      <MapPinCheck className="h-3 w-3 mr-1" /> Chegada confirmada
                    </Badge>
                  )}

                  {["com_lance", "aceito", "pago", "em_andamento", "desmontagem_confirmada", "aguardando_liberacao", "concluido"].includes(order.status) && (
                    <Button variant="outline" size="sm" onClick={() => navigate(`/chat/${order.id}`)}>
                      <MessageSquare className="h-4 w-4 mr-1" /> Abrir Chat
                    </Button>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      );
      })()}
    </div>
    </>
  );
};

export default DashboardMontador;
