import { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { getSignedUrl } from "@/lib/storage";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Shield, Send, Image, ArrowLeft } from "lucide-react";
import { SignedImage } from "@/components/SignedImage";

interface Ticket {
  id: string;
  order_id: string;
  opened_by: string;
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

interface Profile {
  user_id: string;
  full_name: string;
  role: string;
}

const statusOptions = [
  { value: "aberto", label: "Aberto" },
  { value: "em_analise", label: "Em análise" },
  { value: "resolvido", label: "Resolvido" },
  { value: "fechado", label: "Fechado" },
];

const statusColors: Record<string, string> = {
  aberto: "bg-warning text-warning-foreground",
  em_analise: "bg-primary text-primary-foreground",
  resolvido: "bg-success text-success-foreground",
  fechado: "bg-muted text-muted-foreground",
};

const AdminAssistencia = () => {
  const { user } = useAuth();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [profiles, setProfiles] = useState<Record<string, Profile>>({});
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [messages, setMessages] = useState<TicketMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  const [newMessage, setNewMessage] = useState("");
  const [mediaFile, setMediaFile] = useState<File | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (user) checkAdminAndFetch();
  }, [user]);

  useEffect(() => {
    if (selectedTicket) {
      fetchMessages(selectedTicket.id);
      const channel = supabase
        .channel(`admin-ticket-${selectedTicket.id}`)
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

  const checkAdminAndFetch = async () => {
    // Check admin role
    const { data: roleData } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", user!.id)
      .eq("role", "admin")
      .maybeSingle();

    if (!roleData) {
      setIsAdmin(false);
      setLoading(false);
      return;
    }

    setIsAdmin(true);

    // Fetch all tickets
    const { data: ticketsData } = await supabase
      .from("support_tickets")
      .select("*")
      .order("created_at", { ascending: false });

    const allTickets = (ticketsData || []) as Ticket[];
    setTickets(allTickets);

    // Fetch profiles for ticket openers
    const userIds = [...new Set(allTickets.map((t) => t.opened_by))];
    if (userIds.length > 0) {
      const { data: profilesData } = await supabase
        .from("profiles")
        .select("user_id, full_name, role")
        .in("user_id", userIds);
      const map: Record<string, Profile> = {};
      (profilesData || []).forEach((p: any) => { map[p.user_id] = p; });
      setProfiles(map);
    }

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

  const updateTicketStatus = async (ticketId: string, status: string) => {
    const { error } = await supabase
      .from("support_tickets")
      .update({ status, updated_at: new Date().toISOString() })
      .eq("id", ticketId);
    if (error) { toast.error(error.message); return; }
    toast.success("Status atualizado!");
    setTickets((prev) => prev.map((t) => t.id === ticketId ? { ...t, status } : t));
    if (selectedTicket?.id === ticketId) setSelectedTicket((prev) => prev ? { ...prev, status } : null);
  };

  const uploadMedia = async (file: File): Promise<string | null> => {
    const ext = file.name.split(".").pop();
    const path = `admin/${Date.now()}.${ext}`;
    const { error } = await supabase.storage.from("ticket-media").upload(path, file);
    if (error) { toast.error("Erro no upload"); return null; }
    // Store path reference (bucket is private); signed URL generated on display
    return path;
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() && !mediaFile) return;
    if (!selectedTicket) return;

    let mediaUrl: string | null = null;
    if (mediaFile) mediaUrl = await uploadMedia(mediaFile);

    const { error } = await supabase.from("ticket_messages").insert({
      ticket_id: selectedTicket.id,
      sender_id: user!.id,
      message: newMessage.trim() || "(mídia anexada)",
      media_url: mediaUrl,
    });

    if (error) { toast.error(error.message); return; }
    setNewMessage("");
    setMediaFile(null);
  };

  if (loading) {
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

  if (selectedTicket) {
    const opener = profiles[selectedTicket.opened_by];
    return (
      <div className="space-y-4 animate-fade-in">
        <Button variant="ghost" onClick={() => setSelectedTicket(null)}>
          <ArrowLeft className="h-4 w-4 mr-1" /> Voltar
        </Button>
        <Card>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="text-lg">{selectedTicket.subject}</CardTitle>
                <CardDescription>
                  Aberto por: <strong>{opener?.full_name || "Desconhecido"}</strong> ({opener?.role || "?"})
                </CardDescription>
              </div>
              <Select value={selectedTicket.status} onValueChange={(v) => updateTicketStatus(selectedTicket.id, v)}>
                <SelectTrigger className="w-36">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {statusOptions.map((s) => (
                    <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-96 overflow-y-auto mb-4 p-2">
              {messages.map((msg) => {
                const isAdmin = msg.sender_id === user!.id;
                const senderProfile = profiles[msg.sender_id];
                return (
                  <div key={msg.id} className={`flex ${isAdmin ? "justify-end" : "justify-start"}`}>
                    <div className={`max-w-[80%] rounded-lg p-3 ${isAdmin ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
                      <p className="text-xs font-semibold mb-1 opacity-70">
                        {isAdmin ? "🛡️ Você (Mediador)" : `👤 ${senderProfile?.full_name || "Usuário"}`}
                      </p>
                      <p className="text-sm">{msg.message}</p>
                      {msg.media_url && (
                        <a href="#" onClick={async (e) => { e.preventDefault(); const url = await getSignedUrl("ticket-media", msg.media_url); if (url) window.open(url, "_blank"); }}>
                          <SignedImage bucket="ticket-media" path={msg.media_url} alt="Anexo" className="mt-2 max-w-full rounded-md max-h-48 object-cover cursor-pointer hover:opacity-80" />
                        </a>
                      )}
                      <p className="text-xs opacity-60 mt-1">
                        {new Date(msg.created_at).toLocaleString("pt-BR")}
                      </p>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            <div className="flex gap-2 border-t border-border pt-3">
              <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={(e) => setMediaFile(e.target.files?.[0] || null)} />
              <Button variant="outline" size="icon" onClick={() => fileRef.current?.click()}>
                <Image className="h-4 w-4" />
              </Button>
              <Input
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Responder como mediador..."
                onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
              />
              <Button onClick={handleSendMessage} className="gradient-primary text-primary-foreground">
                <Send className="h-4 w-4" />
              </Button>
            </div>
            {mediaFile && <p className="text-xs text-muted-foreground mt-1">📎 {mediaFile.name}</p>}
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Shield className="h-6 w-6 text-primary" /> Painel de Mediação
        </h1>
        <p className="text-muted-foreground">Gerencie disputas entre clientes e montadores</p>
      </div>

      {tickets.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">Nenhum chamado pendente</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-3">
          {tickets.map((ticket) => {
            const opener = profiles[ticket.opened_by];
            return (
              <Card key={ticket.id} className="cursor-pointer hover:border-primary/50 transition-colors" onClick={() => setSelectedTicket(ticket)}>
                <CardContent className="flex items-center justify-between py-4">
                  <div>
                    <p className="font-medium">{ticket.subject}</p>
                    <p className="text-xs text-muted-foreground">
                      {opener?.full_name || "?"} ({opener?.role || "?"}) • {new Date(ticket.created_at).toLocaleDateString("pt-BR")}
                    </p>
                  </div>
                  <Badge className={statusColors[ticket.status]}>
                    {statusOptions.find((s) => s.value === ticket.status)?.label || ticket.status}
                  </Badge>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default AdminAssistencia;
