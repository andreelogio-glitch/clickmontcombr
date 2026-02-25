import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Package, MapPin, DollarSign, Send, MessageSquare, Info } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { calcMontadorReceives, calcClientTotal } from "@/lib/fees";
import logoClickmont from "@/assets/logo-clickmont.png";

interface Order {
  id: string;
  title: string;
  description: string;
  furniture_type: string;
  brand: string | null;
  address: string;
  status: string;
  service_type: string;
  created_at: string;
  client_id: string;
}

const statusLabels: Record<string, string> = {
  pendente: "Novo",
  com_lance: "Lance enviado",
  aceito: "Aceito",
  pago: "Pago",
  desmontagem_confirmada: "Desmontagem OK",
  aguardando_liberacao: "Aguardando liberação",
  concluido: "Concluído",
};

const statusColors: Record<string, string> = {
  pendente: "bg-warning text-warning-foreground",
  com_lance: "bg-primary text-primary-foreground",
  aceito: "bg-accent text-accent-foreground",
  pago: "bg-success text-success-foreground",
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

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    const { data, error } = await supabase.from("orders").select("*").order("created_at", { ascending: false });
    if (!error && data) setOrders(data as Order[]);
    setLoading(false);
  };

  const handleBid = async (orderId: string) => {
    if (!user) return;
    const amount = parseFloat(bidAmounts[orderId] || "0");
    if (amount <= 0) { toast.error("Informe um valor válido"); return; }
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
        <img src={logoClickmont} alt="Clickmont" className="h-8 w-8" />
        <div>
          <h1 className="text-2xl font-bold">Pedidos Disponíveis</h1>
          <p className="text-muted-foreground">Veja os pedidos e envie seu lance</p>
        </div>
      </div>

      {orders.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            <Package className="h-12 w-12 mx-auto mb-3 opacity-40" />
            Nenhum pedido disponível no momento.
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {orders.map((order) => {
            const bidVal = parseFloat(bidAmounts[order.id] || "0");
            const isDesmontagem = order.service_type === "desmontagem";

            return (
              <Card key={order.id} className="overflow-hidden">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">{order.title}</CardTitle>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline" className="text-xs">
                          {isDesmontagem ? "📦 Desmontagem" : "🔧 Montagem"}
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
                    <MapPin className="h-3.5 w-3.5" /> {order.address}
                  </p>

                  {order.status === "pendente" && (
                    <div className="space-y-2 pt-2 border-t border-border">
                      <div className="flex gap-2">
                        <div className="flex-1">
                          <Input type="number" placeholder="Seu valor R$" value={bidAmounts[order.id] || ""} onChange={(e) => setBidAmounts({ ...bidAmounts, [order.id]: e.target.value })} />
                        </div>
                        <Input placeholder="Mensagem (opcional)" className="flex-1" value={bidMessages[order.id] || ""} onChange={(e) => setBidMessages({ ...bidMessages, [order.id]: e.target.value })} />
                        <Button className="gradient-primary text-primary-foreground" disabled={submitting === order.id} onClick={() => handleBid(order.id)}>
                          <Send className="h-4 w-4 mr-1" />
                          {submitting === order.id ? "..." : "Enviar"}
                        </Button>
                      </div>
                      {bidVal > 0 && (
                        <div className="flex items-start gap-1.5 text-xs text-muted-foreground rounded-lg bg-muted p-2">
                          <Info className="h-3.5 w-3.5 mt-0.5 shrink-0" />
                          <span>
                            Seu lance: R$ {bidVal.toFixed(2)} → Cliente paga: R$ {calcClientTotal(bidVal).toFixed(2)} → Você recebe: <strong className="text-success">R$ {calcMontadorReceives(bidVal).toFixed(2)}</strong> (taxa 10%)
                            {isDesmontagem && " · Desmontagem: 40% liberado após desmontagem, 60% após montagem"}
                          </span>
                        </div>
                      )}
                    </div>
                  )}

                  {["com_lance", "aceito", "pago", "desmontagem_confirmada"].includes(order.status) && (
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

export default DashboardMontador;
