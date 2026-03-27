import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { DollarSign, TrendingUp, Target, Camera } from "lucide-react";

interface RecentService {
  orderId: string;
  title: string;
  clientName: string;
  selfieUrl: string | null;
  completedAt: string;
  amount: number;
}

const MontadorResumo = () => {
  const { user } = useAuth();
  const [totalEarnings, setTotalEarnings] = useState(0);
  const [recentServices, setRecentServices] = useState<RecentService[]>([]);
  const [totalBids, setTotalBids] = useState(0);
  const [acceptedBids, setAcceptedBids] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) fetchAll();
  }, [user]);

  const fetchAll = async () => {
    if (!user) return;
    setLoading(true);

    // 1. Financial summary from wallet_transactions
    const { data: txns } = await supabase
      .from("wallet_transactions")
      .select("amount")
      .eq("montador_id", user.id)
      .eq("type", "credit");

    const total = txns?.reduce((sum, t) => sum + Number(t.amount), 0) ?? 0;
    setTotalEarnings(total);

    // 2. Bid conversion stats
    const { data: allBids } = await supabase
      .from("bids")
      .select("id, accepted, order_id")
      .eq("montador_id", user.id);

    const bids = allBids ?? [];
    setTotalBids(bids.length);
    setAcceptedBids(bids.filter((b) => b.accepted).length);

    // 3. Recent completed services (accepted bids → orders concluído/aguardando_liberacao)
    const acceptedOrderIds = bids.filter((b) => b.accepted).map((b) => b.order_id);

    if (acceptedOrderIds.length > 0) {
      const { data: completedOrders } = await supabase
        .from("orders")
        .select("id, title, client_id, created_at, status")
        .in("id", acceptedOrderIds)
        .in("status", ["concluido", "aguardando_liberacao"])
        .order("created_at", { ascending: false })
        .limit(5);

      if (completedOrders && completedOrders.length > 0) {
        // Fetch client names
        const clientIds = [...new Set(completedOrders.map((o) => o.client_id))];
        const { data: profiles } = await supabase
          .from("profiles")
          .select("user_id, full_name")
          .in("user_id", clientIds);

        const profileMap = new Map(profiles?.map((p) => [p.user_id, p.full_name]) ?? []);

        // Fetch selfies from chat_messages (is_image = true)
        const orderIds = completedOrders.map((o) => o.id);
        const { data: selfieMessages } = await supabase
          .from("chat_messages")
          .select("order_id, message")
          .in("order_id", orderIds)
          .eq("is_image" as any, true)
          .order("created_at", { ascending: false });

        const selfieMap = new Map<string, string>();
        selfieMessages?.forEach((m) => {
          if (!selfieMap.has(m.order_id)) {
            selfieMap.set(m.order_id, m.message);
          }
        });

        // Fetch amounts from wallet
        const { data: txnsByOrder } = await supabase
          .from("wallet_transactions")
          .select("order_id, amount")
          .eq("montador_id", user.id)
          .eq("type", "credit")
          .in("order_id", orderIds);

        const amountMap = new Map<string, number>();
        txnsByOrder?.forEach((t) => {
          amountMap.set(t.order_id!, (amountMap.get(t.order_id!) ?? 0) + Number(t.amount));
        });

        const services: RecentService[] = completedOrders.map((o) => ({
          orderId: o.id,
          title: o.title,
          clientName: profileMap.get(o.client_id) ?? "Cliente",
          selfieUrl: selfieMap.get(o.id) ?? null,
          completedAt: o.created_at,
          amount: amountMap.get(o.id) ?? 0,
        }));

        setRecentServices(services);
      }
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
      {/* Financial Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="rounded-full bg-success/10 p-3">
                <DollarSign className="h-6 w-6 text-success" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Total Ganho</p>
                <p className="text-2xl font-bold text-success">
                  R$ {totalEarnings.toFixed(2)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="rounded-full bg-primary/10 p-3">
                <TrendingUp className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Serviços Concluídos</p>
                <p className="text-2xl font-bold">{acceptedBids}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="rounded-full bg-accent/10 p-3">
                <Target className="h-6 w-6 text-accent-foreground" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Lances Enviados</p>
                <p className="text-2xl font-bold">{totalBids}</p>
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

      {/* Recent Services with Selfies */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Camera className="h-4 w-4 text-primary" />
            Últimos Serviços
          </CardTitle>
        </CardHeader>
        <CardContent>
          {recentServices.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-6">
              Nenhum serviço concluído ainda. Continue enviando orçamentos!
            </p>
          ) : (
            <div className="space-y-3">
              {recentServices.map((service) => (
                <div
                  key={service.orderId}
                  className="flex items-center gap-3 rounded-lg border border-border p-3"
                >
                  {service.selfieUrl ? (
                    <div className="relative shrink-0">
                      <img
                        src={service.selfieUrl}
                        alt="Selfie de chegada"
                        className="h-14 w-14 rounded-lg object-cover border border-border"
                      />
                      <Badge className="absolute -bottom-1 -right-1 bg-success/90 text-success-foreground text-[8px] px-1 py-0">
                        ✅
                      </Badge>
                    </div>
                  ) : (
                    <div className="h-14 w-14 rounded-lg bg-muted flex items-center justify-center shrink-0">
                      <Camera className="h-5 w-5 text-muted-foreground" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{service.title}</p>
                    <p className="text-xs text-muted-foreground">
                      Cliente: {service.clientName}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(service.completedAt).toLocaleDateString("pt-BR", {
                        day: "2-digit",
                        month: "short",
                      })}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-sm font-bold text-success">
                      R$ {service.amount.toFixed(2)}
                    </p>
                  </div>
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
