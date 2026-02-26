import { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Lock, Unlock, Send, Phone, MessageSquare } from "lucide-react";

interface ChatMessage {
  id: string;
  order_id: string;
  sender_id: string;
  message: string;
  is_preset: boolean;
  created_at: string;
}

interface Order {
  id: string;
  title: string;
  status: string;
  client_id: string;
}

const PRESET_MESSAGES = [
  "Tenho interesse nessa montagem",
  "Qual a marca do móvel?",
  "Quantas peças tem?",
  "Já tem todas as peças?",
  "Qual o melhor horário?",
  "Precisa de ferramentas especiais?",
  "O local tem elevador?",
  "Tem estacionamento próximo?",
];

// Filter phone numbers and emails from messages
const sanitizeMessage = (text: string): string => {
  // Remove phone patterns
  let sanitized = text.replace(/(\+?\d{1,3}[\s-]?)?\(?\d{2,3}\)?[\s.-]?\d{4,5}[\s.-]?\d{4}/g, "[telefone bloqueado]");
  // Remove email patterns
  sanitized = sanitized.replace(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g, "[email bloqueado]");
  return sanitized;
};

const Chat = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const { user, profile } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [order, setOrder] = useState<Order | null>(null);
  const [clientProfile, setClientProfile] = useState<{ phone: string | null; full_name: string } | null>(null);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const isPaid = order?.status === "pago" || order?.status === "desmontagem_confirmada" || order?.status === "aguardando_liberacao" || order?.status === "concluido";

  useEffect(() => {
    if (orderId) {
      fetchOrder();
      fetchMessages();
      subscribeToMessages();
    }
  }, [orderId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const fetchOrder = async () => {
    const { data } = await supabase
      .from("orders")
      .select("*")
      .eq("id", orderId!)
      .single();
    if (data) {
      setOrder(data as Order);
      // Fetch client profile for phone reveal
      if (["pago", "desmontagem_confirmada", "aguardando_liberacao", "concluido"].includes(data.status)) {
        const { data: cp } = await supabase
          .from("profiles")
          .select("phone, full_name")
          .eq("user_id", data.client_id)
          .single();
        if (cp) setClientProfile(cp);
      }
    }
    setLoading(false);
  };

  const fetchMessages = async () => {
    const { data } = await supabase
      .from("chat_messages")
      .select("*")
      .eq("order_id", orderId!)
      .order("created_at", { ascending: true });
    if (data) setMessages(data as ChatMessage[]);
  };

  const subscribeToMessages = () => {
    const channel = supabase
      .channel(`chat-${orderId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "chat_messages",
          filter: `order_id=eq.${orderId}`,
        },
        (payload) => {
          setMessages((prev) => [...prev, payload.new as ChatMessage]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const sendPreset = async (text: string) => {
    if (!user || !orderId) return;
    try {
      const { error } = await supabase.from("chat_messages").insert({
        order_id: orderId,
        sender_id: user.id,
        message: text,
        is_preset: true,
      });
      if (error) throw error;
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const sendFreeMessage = async () => {
    if (!user || !orderId || !newMessage.trim()) return;
    if (!isPaid) {
      toast.error("Chat liberado apenas após o pagamento");
      return;
    }
    const sanitized = sanitizeMessage(newMessage);
    try {
      const { error } = await supabase.from("chat_messages").insert({
        order_id: orderId,
        sender_id: user.id,
        message: sanitized,
        is_preset: false,
      });
      if (error) throw error;
      setNewMessage("");
    } catch (error: any) {
      toast.error(error.message);
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
    <div className="max-w-2xl mx-auto animate-fade-in">
      <Card className="flex flex-col h-[calc(100vh-10rem)]">
        <CardHeader className="border-b border-border pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-primary" />
              <CardTitle className="text-lg">{order?.title || "Chat"}</CardTitle>
            </div>
            <Badge
              className={isPaid ? "bg-success text-success-foreground" : "bg-warning text-warning-foreground"}
            >
              {isPaid ? (
                <><Unlock className="h-3 w-3 mr-1" /> Chat Liberado</>
              ) : (
                <><Lock className="h-3 w-3 mr-1" /> Chat Bloqueado</>
              )}
            </Badge>
          </div>

          {/* Phone reveal after payment */}
          {isPaid && clientProfile?.phone && profile?.role === "montador" && (
            <div className="mt-2 flex items-center gap-2 rounded-lg bg-success/10 p-2 text-sm">
              <Phone className="h-4 w-4 text-success" />
              <span>Telefone do cliente: <strong>{clientProfile.phone}</strong></span>
            </div>
          )}

          {!isPaid && (
            <p className="text-xs text-muted-foreground mt-1">
              ⚠️ O chat de texto livre será liberado após o pagamento ser aprovado.
            </p>
          )}
        </CardHeader>

        {/* Messages */}
        <CardContent className="flex-1 overflow-y-auto py-4 space-y-3">
          {messages.length === 0 && (
            <p className="text-center text-muted-foreground text-sm py-8">
              Nenhuma mensagem ainda. Use os botões abaixo para iniciar.
            </p>
          )}
          {messages.map((msg) => {
            const isMe = msg.sender_id === user?.id;
            return (
              <div
                key={msg.id}
                className={`flex ${isMe ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[75%] rounded-2xl px-4 py-2.5 text-sm ${
                    isMe
                      ? "gradient-primary text-primary-foreground rounded-br-md"
                      : "bg-secondary text-secondary-foreground rounded-bl-md"
                  }`}
                >
                  {msg.message}
                </div>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </CardContent>

        {/* Input area */}
        <div className="border-t border-border p-4 space-y-3">
          {/* Preset buttons - always visible */}
          <div className="flex flex-wrap gap-2">
            {PRESET_MESSAGES.slice(0, isPaid ? 3 : 8).map((text) => (
              <Button
                key={text}
                variant="outline"
                size="sm"
                className="text-xs"
                onClick={() => sendPreset(text)}
              >
                {text}
              </Button>
            ))}
          </div>

          {/* Free text - only when paid */}
          {isPaid ? (
            <div className="flex gap-2">
              <Input
                placeholder="Digite sua mensagem..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && sendFreeMessage()}
              />
              <Button
                className="gradient-primary text-primary-foreground"
                onClick={sendFreeMessage}
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-2 rounded-lg bg-muted p-3 text-sm text-muted-foreground">
              <Lock className="h-4 w-4" />
              <span>Campo de texto liberado após pagamento aprovado</span>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};

export default Chat;
