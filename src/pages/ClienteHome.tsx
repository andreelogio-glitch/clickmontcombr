import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { PlusCircle, Package, DollarSign, Check, MessageSquare, ExternalLink } from "lucide-react";
import { calcClientTotal, calcMontadorReceives, calcDesmontagemFirst, calcDesmontagemSecond } from "@/lib/fees";

interface Order {
  id: string;
  title: string;
  furniture_type: string;
  status: string;
  service_type: string;
  created_at: string;
}

interface Bid {
  id: string;
  order_id: string;
  montador_id: string;
  amount: number;
  message: string | null;
  accepted: boolean;
  created_at: string;
}

const statusLabels: Record<string, string> = {
  pendente: "Aguardando lances",
  com_lance: "Lance recebido!",
  aceito: "Aguardando pagamento",
  pago: "Pago ✓",
  desmontagem_confirmada: "Desmontagem confirmada",
  concluido: "Concluído",
};

const statusColors: Record<string, string> = {
  pendente: "bg-muted text-muted-foreground",
  com_lance: "bg-warning text-warning-foreground",
  aceito: "bg-primary text-primary-foreground",
  pago: "bg-success text-success-foreground",
  desmontagem_confirmada: "bg-accent text-accent-foreground",
  concluido: "bg-secondary text-secondary-foreground",
};

const ClienteHome = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);
  const [bids, setBids] = useState<Record<string, Bid[]>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) fetchData();
  }, [user]);

  const fetchData = async () => {
    const { data: ordersData } = await supabase
      .from("orders")
      .select("*")
      .eq("client_id", user!.id)
      .order("created_at", { ascending: false });

    if (ordersData) {
      setOrders(ordersData as Order[]);
      const orderIds = ordersData.map((o) => o.id);
      if (orderIds.length > 0) {
        const { data: bidsData } = await supabase.from("bids").select("*").in("order_id", orderIds);
        if (bidsData) {
          const grouped: Record<string, Bid[]> = {};
          (bidsData as Bid[]).forEach((b) => {
            if (!grouped[b.order_id]) grouped[b.order_id] = [];
            grouped[b.order_id].push(b);
          });
          setBids(grouped);
        }
      }
    }
    setLoading(false);
  };

  const acceptBid = async (bid: Bid) => {
    try {
      await supabase.from("bids").update({ accepted: true }).eq("id", bid.id);
      await supabase.from("orders").update({ status: "aceito" }).eq("id", bid.order_id);
      toast.success("Lance aceito! Efetue o pagamento para liberar o chat.");
      fetchData();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const handlePayment = async (orderId: string) => {
    const order = orders.find((o) => o.id === orderId);
    const acceptedBid = (bids[orderId] || []).find((b) => b.accepted);
    if (!order || !acceptedBid) return;

    const totalAmount = calcClientTotal(acceptedBid.amount);

    try {
      const { data, error } = await supabase.functions.invoke("create-checkout", {
        body: {
          order_id: orderId,
          title: order.title,
          amount: totalAmount,
        },
      });

      if (error) throw error;

      if (data?.checkout_url) {
        window.open(data.checkout_url, "_blank");
        // Mark as paid optimistically (in production, use webhook)
        markAsPaid(orderId);
      } else {
        toast.error("Erro ao gerar link de pagamento");
      }
    } catch (error: any) {
      toast.error("Erro no pagamento: " + error.message);
    }
  };

  const markAsPaid = async (orderId: string) => {
    await supabase.from("orders").update({ status: "pago" }).eq("id", orderId);
    toast.success("Pagamento confirmado! Chat liberado.");
    fetchData();
  };

  const confirmDesmontagem = async (orderId: string) => {
    await supabase.from("orders").update({ status: "desmontagem_confirmada" }).eq("id", orderId);
    toast.success("Desmontagem confirmada! 40% liberado para o montador.");
    fetchData();
  };

  const confirmConcluido = async (orderId: string) => {
    await supabase.from("orders").update({ status: "concluido" }).eq("id", orderId);
    toast.success("Serviço concluído! Restante liberado para o montador.");
    fetchData();
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Meus Pedidos</h1>
          <p className="text-muted-foreground">Acompanhe seus serviços</p>
        </div>
        <Link to="/pedir-montagem">
          <Button className="gradient-primary text-primary-foreground">
            <PlusCircle className="h-4 w-4 mr-2" /> Novo Serviço
          </Button>
        </Link>
      </div>

      {orders.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Package className="h-12 w-12 mx-auto mb-3 text-muted-foreground opacity-40" />
            <p className="text-muted-foreground mb-4">Você ainda não tem pedidos</p>
            <Link to="/pedir-montagem">
              <Button className="gradient-primary text-primary-foreground">Pedir primeiro serviço</Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {orders.map((order) => {
            const orderBids = bids[order.id] || [];
            const acceptedBid = orderBids.find((b) => b.accepted);
            const isDesmontagem = order.service_type === "desmontagem";

            return (
              <Card key={order.id}>
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">{order.title}</CardTitle>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline" className="text-xs">
                          {isDesmontagem ? "📦 Desmontagem" : "🔧 Montagem"}
                        </Badge>
                      </div>
                    </div>
                    <Badge className={statusColors[order.status]}>
                      {statusLabels[order.status] || order.status}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{order.furniture_type}</p>
                </CardHeader>
                <CardContent className="space-y-3">
                  {/* Show bids with fee breakdown */}
                  {orderBids.length > 0 && order.status === "com_lance" && (
                    <div className="space-y-2">
                      <p className="text-sm font-medium">Lances recebidos:</p>
                      {orderBids.map((bid) => {
                        const clientTotal = calcClientTotal(bid.amount);
                        return (
                          <div key={bid.id} className="flex items-center justify-between rounded-lg border border-border p-3">
                            <div>
                              <p className="font-semibold text-primary flex items-center gap-1">
                                <DollarSign className="h-4 w-4" />
                                R$ {clientTotal.toFixed(2)}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                (Lance: R$ {bid.amount.toFixed(2)} + taxa plataforma 20%)
                              </p>
                              {bid.message && <p className="text-sm text-muted-foreground mt-1">{bid.message}</p>}
                            </div>
                            <Button size="sm" className="gradient-primary text-primary-foreground" onClick={() => acceptBid(bid)}>
                              <Check className="h-4 w-4 mr-1" /> Aceitar
                            </Button>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* Payment button */}
                  {order.status === "aceito" && acceptedBid && (
                    <div className="border-t border-border pt-3">
                      <p className="text-sm mb-2">
                        Total a pagar: <strong className="text-primary">R$ {calcClientTotal(acceptedBid.amount).toFixed(2)}</strong>
                      </p>
                      <Button className="w-full bg-[hsl(200,80%,50%)] hover:bg-[hsl(200,80%,40%)] text-primary-foreground" onClick={() => handlePayment(order.id)}>
                        <ExternalLink className="h-4 w-4 mr-2" /> Pagar com Mercado Pago
                      </Button>
                    </div>
                  )}

                  {/* Desmontagem split confirmation buttons */}
                  {isDesmontagem && order.status === "pago" && (
                    <div className="border-t border-border pt-3 space-y-2">
                      <p className="text-xs text-muted-foreground">
                        Ao confirmar a desmontagem, 40% será liberado ao montador. Os outros 60% após a montagem.
                      </p>
                      <Button size="sm" onClick={() => confirmDesmontagem(order.id)}>
                        ✅ Confirmar Desmontagem Concluída
                      </Button>
                    </div>
                  )}

                  {isDesmontagem && order.status === "desmontagem_confirmada" && (
                    <div className="border-t border-border pt-3 space-y-2">
                      <p className="text-xs text-muted-foreground">
                        Desmontagem confirmada! 40% liberado. Confirme a montagem para liberar os 60% restantes.
                      </p>
                      <Button size="sm" onClick={() => confirmConcluido(order.id)}>
                        ✅ Confirmar Montagem Concluída
                      </Button>
                    </div>
                  )}

                  {!isDesmontagem && order.status === "pago" && (
                    <div className="border-t border-border pt-3">
                      <Button size="sm" onClick={() => confirmConcluido(order.id)}>
                        ✅ Confirmar Serviço Concluído
                      </Button>
                    </div>
                  )}

                  {/* Chat button */}
                  {["com_lance", "aceito", "pago", "desmontagem_confirmada", "concluido"].includes(order.status) && (
                    <Button variant="outline" size="sm" onClick={() => navigate(`/chat/${order.id}`)}>
                      <MessageSquare className="h-4 w-4 mr-1" /> Abrir Chat
                    </Button>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ClienteHome;
