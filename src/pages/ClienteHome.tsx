import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { PlusCircle, Package, DollarSign, Check, MessageSquare, ExternalLink } from "lucide-react";

interface Order {
  id: string;
  title: string;
  furniture_type: string;
  status: string;
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
  concluido: "Concluído",
};

const statusColors: Record<string, string> = {
  pendente: "bg-muted text-muted-foreground",
  com_lance: "bg-warning text-warning-foreground",
  aceito: "bg-primary text-primary-foreground",
  pago: "bg-success text-success-foreground",
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
        const { data: bidsData } = await supabase
          .from("bids")
          .select("*")
          .in("order_id", orderIds);
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

  const handlePayment = (orderId: string, amount: number) => {
    // Opens Mercado Pago checkout link - user will configure this
    const checkoutUrl = `https://www.mercadopago.com.br/checkout/v1/redirect?pref_id=SEU_PREFERENCE_ID`;
    window.open(checkoutUrl, "_blank");
    // For demo: mark as paid
    markAsPaid(orderId);
  };

  const markAsPaid = async (orderId: string) => {
    await supabase.from("orders").update({ status: "pago" }).eq("id", orderId);
    toast.success("Pagamento confirmado! Chat liberado.");
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
          <p className="text-muted-foreground">Acompanhe suas montagens</p>
        </div>
        <Link to="/pedir-montagem">
          <Button className="gradient-primary text-primary-foreground">
            <PlusCircle className="h-4 w-4 mr-2" />
            Nova Montagem
          </Button>
        </Link>
      </div>

      {orders.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Package className="h-12 w-12 mx-auto mb-3 text-muted-foreground opacity-40" />
            <p className="text-muted-foreground mb-4">Você ainda não tem pedidos</p>
            <Link to="/pedir-montagem">
              <Button className="gradient-primary text-primary-foreground">
                Pedir primeira montagem
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {orders.map((order) => {
            const orderBids = bids[order.id] || [];
            const acceptedBid = orderBids.find((b) => b.accepted);

            return (
              <Card key={order.id}>
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-lg">{order.title}</CardTitle>
                    <Badge className={statusColors[order.status]}>
                      {statusLabels[order.status]}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{order.furniture_type}</p>
                </CardHeader>
                <CardContent className="space-y-3">
                  {/* Show bids */}
                  {orderBids.length > 0 && order.status === "com_lance" && (
                    <div className="space-y-2">
                      <p className="text-sm font-medium">Lances recebidos:</p>
                      {orderBids.map((bid) => (
                        <div
                          key={bid.id}
                          className="flex items-center justify-between rounded-lg border border-border p-3"
                        >
                          <div>
                            <p className="font-semibold text-primary flex items-center gap-1">
                              <DollarSign className="h-4 w-4" />
                              R$ {bid.amount.toFixed(2)}
                            </p>
                            {bid.message && (
                              <p className="text-sm text-muted-foreground">{bid.message}</p>
                            )}
                          </div>
                          <Button
                            size="sm"
                            className="gradient-primary text-primary-foreground"
                            onClick={() => acceptBid(bid)}
                          >
                            <Check className="h-4 w-4 mr-1" /> Aceitar
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Payment button */}
                  {order.status === "aceito" && acceptedBid && (
                    <div className="border-t border-border pt-3">
                      <p className="text-sm mb-2">
                        Lance aceito: <strong className="text-primary">R$ {acceptedBid.amount.toFixed(2)}</strong>
                      </p>
                      <Button
                        className="w-full bg-[hsl(200,80%,50%)] hover:bg-[hsl(200,80%,40%)] text-primary-foreground"
                        onClick={() => handlePayment(order.id, acceptedBid.amount)}
                      >
                        <ExternalLink className="h-4 w-4 mr-2" />
                        Pagar com Mercado Pago
                      </Button>
                    </div>
                  )}

                  {/* Chat button */}
                  {["com_lance", "aceito", "pago", "concluido"].includes(order.status) && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigate(`/chat/${order.id}`)}
                    >
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
