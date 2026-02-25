import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useIsAdmin } from "@/hooks/useIsAdmin";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Shield, Package, AlertTriangle, MessageSquare, Eye } from "lucide-react";

interface Order {
  id: string;
  title: string;
  furniture_type: string;
  status: string;
  service_type: string;
  created_at: string;
  client_id: string;
  address: string;
}

interface Ticket {
  id: string;
  order_id: string;
  opened_by: string;
  subject: string;
  status: string;
  created_at: string;
}

interface Profile {
  user_id: string;
  full_name: string;
  role: string;
  phone: string | null;
}

const orderStatusLabels: Record<string, string> = {
  pendente: "Pendente",
  com_lance: "Com lance",
  aceito: "Aceito",
  pago: "Pago",
  desmontagem_confirmada: "Desmontagem OK",
  concluido: "Concluído",
};

const orderStatusColors: Record<string, string> = {
  pendente: "bg-muted text-muted-foreground",
  com_lance: "bg-warning text-warning-foreground",
  aceito: "bg-primary text-primary-foreground",
  pago: "bg-success text-success-foreground",
  desmontagem_confirmada: "bg-accent text-accent-foreground",
  concluido: "bg-secondary text-secondary-foreground",
};

const ticketStatusColors: Record<string, string> = {
  aberto: "bg-warning text-warning-foreground",
  em_analise: "bg-primary text-primary-foreground",
  resolvido: "bg-success text-success-foreground",
  fechado: "bg-muted text-muted-foreground",
};

const AdminDashboard = () => {
  const { isAdmin, loading: adminLoading } = useIsAdmin();
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [profiles, setProfiles] = useState<Record<string, Profile>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isAdmin) fetchAll();
  }, [isAdmin]);

  const fetchAll = async () => {
    // Fetch all orders (admin sees all via montador policy - they can see all orders)
    const { data: ordersData } = await supabase
      .from("orders")
      .select("*")
      .order("created_at", { ascending: false });

    // Fetch all tickets
    const { data: ticketsData } = await supabase
      .from("support_tickets")
      .select("*")
      .order("created_at", { ascending: false });

    const allOrders = (ordersData || []) as Order[];
    const allTickets = (ticketsData || []) as Ticket[];

    setOrders(allOrders);
    setTickets(allTickets);

    // Fetch profiles
    const userIds = [
      ...new Set([
        ...allOrders.map((o) => o.client_id),
        ...allTickets.map((t) => t.opened_by),
      ]),
    ];
    if (userIds.length > 0) {
      const { data: profilesData } = await supabase
        .from("profiles")
        .select("user_id, full_name, role, phone")
        .in("user_id", userIds);
      const map: Record<string, Profile> = {};
      (profilesData || []).forEach((p: any) => { map[p.user_id] = p; });
      setProfiles(map);
    }

    setLoading(false);
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

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Shield className="h-6 w-6 text-primary" /> Painel Administrativo
        </h1>
        <p className="text-muted-foreground">Visão completa de pedidos e tickets</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card>
          <CardContent className="py-4 text-center">
            <p className="text-2xl font-bold">{orders.length}</p>
            <p className="text-xs text-muted-foreground">Pedidos totais</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="py-4 text-center">
            <p className="text-2xl font-bold">{orders.filter((o) => o.status === "pendente").length}</p>
            <p className="text-xs text-muted-foreground">Pendentes</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="py-4 text-center">
            <p className="text-2xl font-bold text-warning">{openTickets.length}</p>
            <p className="text-xs text-muted-foreground">Tickets abertos</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="py-4 text-center">
            <p className="text-2xl font-bold text-success">{orders.filter((o) => o.status === "concluido").length}</p>
            <p className="text-xs text-muted-foreground">Concluídos</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="orders">
        <TabsList>
          <TabsTrigger value="orders" className="gap-1">
            <Package className="h-4 w-4" /> Pedidos ({orders.length})
          </TabsTrigger>
          <TabsTrigger value="tickets" className="gap-1">
            <AlertTriangle className="h-4 w-4" /> Tickets ({tickets.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="orders" className="mt-4 space-y-3">
          {orders.map((order) => {
            const client = profiles[order.client_id];
            return (
              <Card key={order.id}>
                <CardContent className="flex items-center justify-between py-4">
                  <div className="space-y-1">
                    <p className="font-medium">{order.title}</p>
                    <p className="text-xs text-muted-foreground">
                      Cliente: {client?.full_name || "?"} • {order.furniture_type} • {order.service_type === "desmontagem" ? "📦 Desmontagem" : "🔧 Montagem"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(order.created_at).toLocaleDateString("pt-BR")}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={orderStatusColors[order.status]}>
                      {orderStatusLabels[order.status] || order.status}
                    </Badge>
                    <Button variant="outline" size="sm" onClick={() => navigate(`/chat/${order.id}`)}>
                      <Eye className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </TabsContent>

        <TabsContent value="tickets" className="mt-4 space-y-3">
          {tickets.map((ticket) => {
            const opener = profiles[ticket.opened_by];
            return (
              <Card
                key={ticket.id}
                className="cursor-pointer hover:border-primary/50 transition-colors"
                onClick={() => navigate("/admin/assistencia")}
              >
                <CardContent className="flex items-center justify-between py-4">
                  <div className="space-y-1">
                    <p className="font-medium">{ticket.subject}</p>
                    <p className="text-xs text-muted-foreground">
                      {opener?.full_name || "?"} ({opener?.role || "?"}) • {new Date(ticket.created_at).toLocaleDateString("pt-BR")}
                    </p>
                  </div>
                  <Badge className={ticketStatusColors[ticket.status]}>
                    {ticket.status}
                  </Badge>
                </CardContent>
              </Card>
            );
          })}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminDashboard;
