import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { DollarSign, TrendingUp, Target, Camera, Star } from "lucide-react";

interface RecentOrder {
  id: string;
  title: string;
  status: string;
  created_at: string;
  city: string | null;
  service_type: string;
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
  pago: "bg-success text-success-foreground",
  em_andamento: "bg-primary text-primary-foreground",
  concluido: "bg-muted text-muted-foreground",
};

const MontadorResumo = () => {
  const { user } = useAuth();
  const [balance, setBalance] = useState(0);
  const [totalServices, setTotalServices] = useState(0);
  const [rating, setRating] = useState<number | null>(null);
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([]);
  const [totalBids, setTotalBids] = useState(0);
  const [acceptedBids, setAcceptedBids] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) fetchAll();
  }, [user]);

  const fetchAll = async () => {
    if (!user) return;
    setLoading(true);

    // 1. Profile stats (balance, total_services, rating)
    const { data: profileData } = await supabase
      .from("profiles")
      .select("balance, total_services, rating" as any)
      .eq("user_id", user.id)
      .single();

    if (profileData) {
      const p = profileData as any;
      setBalance(Number(p.balance) || 0);
      setTotalServices(Number(p.total_services) || 0);
      setRating(p.rating != null ? Number(p.rating) : null);
    }

    // 2. Bid conversion stats
    const { data: allBids } = await supabase
      .from("bids")
      .select("id, accepted, order_id")
      .eq("montador_id", user.id);

    const bids = allBids ?? [];
    setTotalBids(bids.length);
    setAcceptedBids(bids.filter((b) => b.accepted).length);

    // 3. Recent orders (accepted bids)
    const acceptedOrderIds = bids.filter((b) => b.accepted).map((b) => b.order_id);
    if (acceptedOrderIds.length > 0) {
      const { data: orders } = await supabase
        .from("orders")
        .select("id, title, status, created_at, city, service_type")
        .in("id", acceptedOrderIds)
        .order("created_at", { ascending: false })
        .limit(10);

      if (orders) setRecentOrders(orders as RecentOrder[]);
    }

    setLoading(false);
  };

  const conversionRate = totalBids > 0 ? Math.round((acceptedBids / totalBids) * 100) : 0;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 3 Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Saldo a Receber */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="rounded-full bg-success/10 p-3">
                <DollarSign className="h-6 w-6 text-success" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Saldo a Receber</p>
                <p className="text-2xl font-bold text-success">
                  R$ {balance.toFixed(2)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Serviços Concluídos */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="rounded-full bg-primary/10 p-3">
                <TrendingUp className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Serviços Concluídos</p>
                <p className="text-2xl font-bold">{totalServices}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Minha Nota */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="rounded-full bg-warning/10 p-3">
                <Star className="h-6 w-6 text-warning fill-warning" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Minha Nota</p>
                <p className="text-2xl font-bold">
                  {rating != null ? rating.toFixed(1) : "—"}
                  {rating != null && <span className="text-sm text-muted-foreground ml-1">/ 5</span>}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bid Conversion Rate */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Target className="h-4 w-4 text-primary" />
            Aproveitamento de Lances
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-end justify-between">
            <div>
              <span className="text-3xl font-bold">{conversionRate}%</span>
              <p className="text-xs text-muted-foreground mt-1">
                {acceptedBids} aceitos de {totalBids} enviados
              </p>
            </div>
            <Badge
              className={
                conversionRate >= 50
                  ? "bg-success text-success-foreground"
                  : conversionRate >= 25
                  ? "bg-warning text-warning-foreground"
                  : "bg-muted text-muted-foreground"
              }
            >
              {conversionRate >= 50 ? "Excelente" : conversionRate >= 25 ? "Bom" : "Iniciante"}
            </Badge>
          </div>
          <Progress value={conversionRate} className="h-3" />
        </CardContent>
      </Card>

      {/* Recent Orders */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Camera className="h-4 w-4 text-primary" />
            Pedidos Recentes
          </CardTitle>
        </CardHeader>
        <CardContent>
          {recentOrders.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-6">
              Nenhum serviço ainda. Continue enviando orçamentos!
            </p>
          ) : (
            <div className="space-y-2">
              {recentOrders.map((order) => (
                <div
                  key={order.id}
                  className="flex items-center justify-between rounded-lg border border-border p-3"
                >
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium truncate">{order.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {order.city || "Cidade N/I"} · {order.service_type === "desmontagem" ? "Mudança" : "Montagem"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(order.created_at).toLocaleDateString("pt-BR", {
                        day: "2-digit",
                        month: "short",
                      })}
                    </p>
                  </div>
                  <Badge className={statusColors[order.status] || "bg-muted text-muted-foreground"}>
                    {statusLabels[order.status] || order.status}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default MontadorResumo;
