import { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { AlertTriangle, Send, Upload, Image, MessageSquare, Clock } from "lucide-react";

interface Order {
  id: string;
  title: string;
  status: string;
}

interface Ticket {
  id: string;
  order_id: string;
  subject: string;
  description: string;
  status: string;
  created_at: string;
}

interface TicketMessage {
  id: string;
  ticket_id: string;
  sender_id: string;
  message: string;
  media_url: string | null;
  created_at: string;
}

const statusLabels: Record<string, string> = {
  aberto: "Aberto",
  em_analise: "Em análise",
  resolvido: "Resolvido",
  fechado: "Fechado",
};

const statusColors: Record<string, string> = {
  aberto: "bg-warning text-warning-foreground",
  em_analise: "bg-primary text-primary-foreground",
  resolvido: "bg-success text-success-foreground",
  fechado: "bg-muted text-muted-foreground",
};

const Assistencia = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [messages, setMessages] = useState<TicketMessage[]>([]);
  const [loading, setLoading] = useState(true);

  // New ticket form
  const [showForm, setShowForm] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState("");
  const [subject, setSubject] = useState("");
  const [description, setDescription] = useState("");
  const [mediaFile, setMediaFile] = useState<File | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  // Message input
  const [newMessage, setNewMessage] = useState("");
  const [msgMediaFile, setMsgMediaFile] = useState<File | null>(null);
  const msgFileRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (user) fetchData();
  }, [user]);

  useEffect(() => {
    if (selectedTicket) {
      fetchMessages(selectedTicket.id);
      const channel = supabase
        .channel(`ticket-${selectedTicket.id}`)
        .on("postgres_changes", { event: "INSERT", schema: "public", table: "ticket_messages", filter: `ticket_id=eq.${selectedTicket.id}` }, (payload) => {
          setMessages((prev) => [...prev, payload.new as TicketMessage]);
        })
        .subscribe();
      return () => { supabase.removeChannel(channel); };
    }
  }, [selectedTicket]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const fetchData = async () => {
    // Fetch user's orders for the dropdown
    const { data: ordersData } = await supabase
      .from("orders")
      .select("id, title, status")
      .or(`client_id.eq.${user!.id}`);

    // Also check if user is a montador with bids
    const { data: bidOrders } = await supabase
      .from("bids")
      .select("order_id, orders(id, title, status)")
      .eq("montador_id", user!.id);

    const allOrders: Order[] = [...(ordersData || [])];
    if (bidOrders) {
      bidOrders.forEach((b: any) => {
        if (b.orders && !allOrders.find((o) => o.id === b.orders.id)) {
          allOrders.push(b.orders);
        }
      });
    }
    setOrders(allOrders);

    // Fetch tickets
    const { data: ticketsData } = await supabase
      .from("support_tickets")
      .select("*")
      .eq("opened_by", user!.id)
      .order("created_at", { ascending: false });
    setTickets((ticketsData || []) as Ticket[]);
    setLoading(false);
  };

  const fetchMessages = async (ticketId: string) => {
    const { data } = await supabase
      .from("ticket_messages")
      .select("*")
      .eq("ticket_id", ticketId)
      .order("created_at", { ascending: true });
    setMessages((data || []) as TicketMessage[]);
  };

  const uploadMedia = async (file: File): Promise<string | null> => {
    const ext = file.name.split(".").pop();
    const path = `${user!.id}/${Date.now()}.${ext}`;
    const { error } = await supabase.storage.from("ticket-media").upload(path, file);
    if (error) { toast.error("Erro no upload: " + error.message); return null; }
    return supabase.storage.from("ticket-media").getPublicUrl(path).data.publicUrl;
  };

  const handleCreateTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrder || !subject || !description) {
      toast.error("Preencha todos os campos");
      return;
    }

    let mediaUrl: string | null = null;
    if (mediaFile) mediaUrl = await uploadMedia(mediaFile);

    const { data, error } = await supabase.from("support_tickets").insert({
      order_id: selectedOrder,
      opened_by: user!.id,
      subject,
      description,
    }).select().single();

    if (error) { toast.error(error.message); return; }

    // Send initial message with optional media
    if (data) {
      await supabase.from("ticket_messages").insert({
        ticket_id: data.id,
        sender_id: user!.id,
        message: description,
        media_url: mediaUrl,
      });
    }

    toast.success("Chamado aberto! Nossa equipe analisará o caso.");
    setShowForm(false);
    setSubject("");
    setDescription("");
    setSelectedOrder("");
    setMediaFile(null);
    fetchData();
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() && !msgMediaFile) return;
    if (!selectedTicket) return;

    let mediaUrl: string | null = null;
    if (msgMediaFile) mediaUrl = await uploadMedia(msgMediaFile);

    const { error } = await supabase.from("ticket_messages").insert({
      ticket_id: selectedTicket.id,
      sender_id: user!.id,
      message: newMessage.trim() || "(mídia anexada)",
      media_url: mediaUrl,
    });

    if (error) { toast.error(error.message); return; }
    setNewMessage("");
    setMsgMediaFile(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  // Ticket detail view
  if (selectedTicket) {
    return (
      <div className="space-y-4 animate-fade-in">
        <Button variant="ghost" onClick={() => setSelectedTicket(null)}>← Voltar</Button>
        <Card>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="text-lg">{selectedTicket.subject}</CardTitle>
                <CardDescription>{selectedTicket.description}</CardDescription>
              </div>
              <Badge className={statusColors[selectedTicket.status]}>
                {statusLabels[selectedTicket.status] || selectedTicket.status}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-96 overflow-y-auto mb-4 p-2">
              {messages.map((msg) => (
                <div key={msg.id} className={`flex ${msg.sender_id === user!.id ? "justify-end" : "justify-start"}`}>
                  <div className={`max-w-[80%] rounded-lg p-3 ${msg.sender_id === user!.id ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
                    {msg.sender_id !== user!.id && (
                      <p className="text-xs font-semibold mb-1 opacity-70">🛡️ Mediador</p>
                    )}
                    <p className="text-sm">{msg.message}</p>
                    {msg.media_url && (
                      <img src={msg.media_url} alt="Anexo" className="mt-2 max-w-full rounded-md max-h-48 object-cover" />
                    )}
                    <p className="text-xs opacity-60 mt-1">
                      {new Date(msg.created_at).toLocaleString("pt-BR")}
                    </p>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {selectedTicket.status !== "fechado" && selectedTicket.status !== "resolvido" && (
              <div className="flex gap-2 border-t border-border pt-3">
                <input
                  ref={msgFileRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => setMsgMediaFile(e.target.files?.[0] || null)}
                />
                <Button variant="outline" size="icon" onClick={() => msgFileRef.current?.click()}>
                  <Image className="h-4 w-4" />
                </Button>
                <Input
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Descreva o problema ou envie fotos..."
                  onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                />
                <Button onClick={handleSendMessage} className="gradient-primary text-primary-foreground">
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            )}
            {msgMediaFile && (
              <p className="text-xs text-muted-foreground mt-1">📎 {msgMediaFile.name}</p>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <AlertTriangle className="h-6 w-6 text-warning" /> Assistência
          </h1>
          <p className="text-muted-foreground">Abra um chamado e nossa equipe mediará o caso</p>
        </div>
        <Button className="gradient-primary text-primary-foreground" onClick={() => setShowForm(!showForm)}>
          {showForm ? "Cancelar" : "Novo Chamado"}
        </Button>
      </div>

      {showForm && (
        <Card className="animate-fade-in">
          <CardHeader>
            <CardTitle className="text-lg">Abrir Chamado</CardTitle>
            <CardDescription>Descreva o problema. Você pode enviar fotos dos móveis ou etiquetas. Nossa equipe analisará o caso de forma imparcial.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreateTicket} className="space-y-4">
              <div>
                <Label>Pedido relacionado</Label>
                <Select value={selectedOrder} onValueChange={setSelectedOrder}>
                  <SelectTrigger><SelectValue placeholder="Selecione o pedido" /></SelectTrigger>
                  <SelectContent>
                    {orders.map((o) => (
                      <SelectItem key={o.id} value={o.id}>{o.title}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Assunto</Label>
                <Input value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="Ex: Peça danificada na montagem" required />
              </div>
              <div>
                <Label>Descrição detalhada</Label>
                <Textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Descreva o que aconteceu com detalhes..." required rows={4} />
              </div>
              <div>
                <Label className="flex items-center gap-1"><Upload className="h-3.5 w-3.5" /> Anexar foto (opcional)</Label>
                <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={(e) => setMediaFile(e.target.files?.[0] || null)} />
                <Button type="button" variant="outline" size="sm" className="w-full mt-1" onClick={() => fileRef.current?.click()}>
                  {mediaFile ? `✓ ${mediaFile.name}` : "Enviar foto do móvel / etiqueta"}
                </Button>
              </div>
              <Button type="submit" className="w-full gradient-primary text-primary-foreground">
                <Send className="h-4 w-4 mr-2" /> Abrir Chamado
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      {tickets.length === 0 && !showForm ? (
        <Card>
          <CardContent className="py-12 text-center">
            <MessageSquare className="h-12 w-12 mx-auto mb-3 text-muted-foreground opacity-40" />
            <p className="text-muted-foreground">Nenhum chamado aberto</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-3">
          {tickets.map((ticket) => (
            <Card key={ticket.id} className="cursor-pointer hover:border-primary/50 transition-colors" onClick={() => setSelectedTicket(ticket)}>
              <CardContent className="flex items-center justify-between py-4">
                <div className="flex items-center gap-3">
                  <Clock className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium">{ticket.subject}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(ticket.created_at).toLocaleDateString("pt-BR")}
                    </p>
                  </div>
                </div>
                <Badge className={statusColors[ticket.status]}>
                  {statusLabels[ticket.status] || ticket.status}
                </Badge>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default Assistencia;
