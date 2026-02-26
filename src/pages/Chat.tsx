import { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Lock, Unlock, Send, Phone, MessageSquare, ShieldCheck, Camera, KeyRound, UserCheck, AlertTriangle } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

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
  verification_code: string | null;
  code_validated: boolean;
  service_type: string;
  montador_arrived: boolean;
}

interface MontadorProfile {
  full_name: string;
  selfie_url: string | null;
  is_verified: boolean;
  phone: string | null;
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

const sanitizeMessage = (text: string): string => {
  let sanitized = text.replace(/(\+?\d{1,3}[\s-]?)?\(?\d{2,3}\)?[\s.-]?\d{4,5}[\s.-]?\d{4}/g, "[telefone bloqueado]");
  sanitized = sanitized.replace(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g, "[email bloqueado]");
  return sanitized;
};

const Chat = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const { user, profile } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [order, setOrder] = useState<Order | null>(null);
  const [clientProfile, setClientProfile] = useState<{ phone: string | null; full_name: string } | null>(null);
  const [montadorProfile, setMontadorProfile] = useState<MontadorProfile | null>(null);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [codeInput, setCodeInput] = useState("");
  const [validatingCode, setValidatingCode] = useState(false);
  const [uploadingSelfie, setUploadingSelfie] = useState(false);
  const selfieInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const isPaid = order?.status === "pago" || order?.status === "em_andamento" || order?.status === "desmontagem_confirmada" || order?.status === "aguardando_liberacao" || order?.status === "concluido";
  const isClient = user?.id === order?.client_id;
  const isMontador = profile?.role === "montador";

  useEffect(() => {
    if (orderId) {
      fetchOrder();
      fetchMessages();
      subscribeToMessages();
      const orderChannel = supabase
        .channel(`order-${orderId}`)
        .on(
          "postgres_changes",
          { event: "UPDATE", schema: "public", table: "orders", filter: `id=eq.${orderId}` },
          (payload) => {
            setOrder((prev) => prev ? { ...prev, ...payload.new } as any : prev);
          }
        )
        .subscribe();
      return () => { supabase.removeChannel(orderChannel); };
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
      setOrder(data as any);
      // Fetch client profile for phone reveal
      if (["pago", "em_andamento", "desmontagem_confirmada", "aguardando_liberacao", "concluido"].includes(data.status)) {
        const { data: cp } = await supabase
          .from("profiles")
          .select("phone, full_name")
          .eq("user_id", data.client_id)
          .single();
        if (cp) setClientProfile(cp);
      }
      // Fetch montador profile (accepted bid)
      const { data: bid } = await supabase
        .from("bids")
        .select("montador_id")
        .eq("order_id", orderId!)
        .eq("accepted", true)
        .maybeSingle();
      if (bid) {
        const { data: mp } = await supabase
          .from("profiles")
          .select("full_name, selfie_url, is_verified, phone")
          .eq("user_id", bid.montador_id)
          .single();
        if (mp) setMontadorProfile(mp as MontadorProfile);
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
        { event: "INSERT", schema: "public", table: "chat_messages", filter: `order_id=eq.${orderId}` },
        (payload) => {
          setMessages((prev) => [...prev, payload.new as ChatMessage]);
        }
      )
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  };

  const sendPreset = async (text: string) => {
    if (!user || !orderId) return;
    try {
      const { error } = await supabase.from("chat_messages").insert({
        order_id: orderId, sender_id: user.id, message: text, is_preset: true,
      });
      if (error) throw error;
    } catch (error: any) { toast.error(error.message); }
  };

  const sendFreeMessage = async () => {
    if (!user || !orderId || !newMessage.trim()) return;
    if (!isPaid) { toast.error("Chat liberado apenas após o pagamento"); return; }
    const sanitized = sanitizeMessage(newMessage);
    try {
      const { error } = await supabase.from("chat_messages").insert({
        order_id: orderId, sender_id: user.id, message: sanitized, is_preset: false,
      });
      if (error) throw error;
      setNewMessage("");
    } catch (error: any) { toast.error(error.message); }
  };

  const validateCode = async () => {
    if (!order || !codeInput.trim()) return;
    setValidatingCode(true);
    if (codeInput.trim() === order.verification_code) {
      await supabase.from("orders").update({
        code_validated: true,
        status: "em_andamento",
        started_at: new Date().toISOString(),
      } as any).eq("id", order.id);
      setOrder({ ...order, code_validated: true, status: "em_andamento" });
      toast.success("Código validado! Serviço iniciado — horário registrado.");
    } else {
      toast.error("Código incorreto. Peça ao cliente o código correto.");
    }
    setValidatingCode(false);
  };

  const handleSelfieUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user || !orderId) return;
    setUploadingSelfie(true);
    try {
      const ext = file.name.split(".").pop();
      const path = `${user.id}/arrival-${orderId}-${Date.now()}.${ext}`;
      const { error: upErr } = await supabase.storage.from("user-documents").upload(path, file);
      if (upErr) throw upErr;
      const { data: urlData } = supabase.storage.from("user-documents").getPublicUrl(path);

      // Send as chat message with image
      await supabase.from("chat_messages").insert({
        order_id: orderId,
        sender_id: user.id,
        message: `📸 Selfie de chegada: ${urlData.publicUrl}`,
        is_preset: false,
      });
      toast.success("Selfie enviada ao cliente!");
    } catch (err: any) {
      toast.error("Erro ao enviar selfie: " + err.message);
    } finally {
      setUploadingSelfie(false);
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
    <div className="max-w-2xl mx-auto animate-fade-in space-y-4">
      {/* Montador Identified Card */}
      {isPaid && montadorProfile && (
        <Card className="border-primary/30 bg-primary/5">
          <CardContent className="py-4">
            <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16 border-2 border-primary">
                {montadorProfile.selfie_url ? (
                  <AvatarImage src={montadorProfile.selfie_url} alt={montadorProfile.full_name} />
                ) : null}
                <AvatarFallback className="bg-primary text-primary-foreground text-lg">
                  {montadorProfile.full_name.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <UserCheck className="h-5 w-5 text-primary" />
                  <h3 className="font-bold text-foreground">Montador Identificado</h3>
                </div>
                <p className="text-sm font-semibold mt-0.5">{montadorProfile.full_name}</p>
                {montadorProfile.is_verified && (
                  <Badge className="bg-success text-success-foreground text-xs mt-1">
                    <ShieldCheck className="h-3 w-3 mr-1" /> Documentos Verificados
                  </Badge>
                )}
              </div>
            </div>
            {isClient && (
              <div className="mt-3 rounded-lg bg-warning/10 border border-warning/30 p-2.5 flex items-start gap-2">
                <AlertTriangle className="h-4 w-4 text-warning shrink-0 mt-0.5" />
                <p className="text-xs text-muted-foreground">
                  <strong>Para sua segurança</strong>, confirme se a pessoa na sua porta é a mesma da foto acima.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Security Code Card - Client View */}
      {isPaid && isClient && order?.verification_code && (
        <Card className={`border-primary/30 ${(order as any).montador_arrived && !order.code_validated ? "ring-2 ring-primary animate-pulse" : ""}`}>
          <CardContent className="py-4">
            <div className="flex items-center gap-2 mb-2">
              <KeyRound className="h-5 w-5 text-primary" />
              <h3 className="font-bold text-foreground">Senha de Segurança</h3>
              {(order as any).montador_arrived && !order.code_validated && (
                <Badge className="bg-warning text-warning-foreground text-xs animate-bounce">
                  🔔 Montador chegou!
                </Badge>
              )}
            </div>
            <div className="text-center py-3">
              <span className={`text-4xl font-mono font-bold tracking-[0.3em] text-primary ${(order as any).montador_arrived && !order.code_validated ? "animate-pulse" : ""}`}>
                #{order.verification_code}
              </span>
            </div>
            <p className="text-xs text-muted-foreground text-center">
              {(order as any).montador_arrived && !order.code_validated
                ? "⚡ O montador está na porta! Informe este código a ele agora."
                : "Passe este código ao montador apenas quando ele chegar no local."}
            </p>
            {order.code_validated && (
              <Badge className="bg-success text-success-foreground mt-2 mx-auto flex w-fit">
                <ShieldCheck className="h-3 w-3 mr-1" /> Código validado ✓
              </Badge>
            )}
          </CardContent>
        </Card>
      )}

      {/* Security Code Validation - Montador View */}
      {isPaid && isMontador && order?.verification_code && !(order as any).code_validated && (
        <Card className="border-warning/30 bg-warning/5">
          <CardContent className="py-4 space-y-3">
            <div className="flex items-center gap-2">
              <KeyRound className="h-5 w-5 text-warning" />
              <h3 className="font-bold text-foreground">Validar Início de Serviço</h3>
            </div>
            <p className="text-xs text-muted-foreground">
              Peça o código de 4 dígitos ao cliente e digite abaixo para liberar o início do serviço.
            </p>
            <div className="flex gap-2">
              <Input
                placeholder="Ex: 5032"
                value={codeInput}
                onChange={(e) => setCodeInput(e.target.value.replace(/\D/g, "").slice(0, 4))}
                maxLength={4}
                className="text-center text-xl font-mono tracking-widest"
              />
              <Button
                onClick={validateCode}
                disabled={codeInput.length !== 4 || validatingCode}
                className="gradient-primary text-primary-foreground"
              >
                {validatingCode ? "..." : "Validar"}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Validated badge for montador */}
      {isPaid && isMontador && (order as any)?.code_validated && (
        <Card className="border-success/30 bg-success/5">
          <CardContent className="py-3 flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-success" />
            <span className="text-sm font-semibold text-success">Código validado — Serviço liberado!</span>
          </CardContent>
        </Card>
      )}

      {/* Chat Card */}
      <Card className="flex flex-col h-[calc(100vh-26rem)]">
        <CardHeader className="border-b border-border pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-primary" />
              <CardTitle className="text-lg">{order?.title || "Chat"}</CardTitle>
            </div>
            <Badge className={isPaid ? "bg-success text-success-foreground" : "bg-warning text-warning-foreground"}>
              {isPaid ? (<><Unlock className="h-3 w-3 mr-1" /> Chat Liberado</>) : (<><Lock className="h-3 w-3 mr-1" /> Chat Bloqueado</>)}
            </Badge>
          </div>

          {isPaid && clientProfile?.phone && isMontador && (
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
            const isImage = msg.message.startsWith("📸 Selfie de chegada:");
            const imageUrl = isImage ? msg.message.replace("📸 Selfie de chegada: ", "") : null;

            return (
              <div key={msg.id} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[75%] rounded-2xl px-4 py-2.5 text-sm ${
                  isMe ? "gradient-primary text-primary-foreground rounded-br-md" : "bg-secondary text-secondary-foreground rounded-bl-md"
                }`}>
                  {isImage && imageUrl ? (
                    <div>
                      <p className="text-xs mb-1 opacity-80">📸 Selfie de chegada</p>
                      <img src={imageUrl} alt="Selfie do montador" className="rounded-lg max-w-full max-h-48 object-cover" />
                    </div>
                  ) : (
                    msg.message
                  )}
                </div>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </CardContent>

        {/* Input area */}
        <div className="border-t border-border p-4 space-y-3">
          <div className="flex flex-wrap gap-2">
            {PRESET_MESSAGES.slice(0, isPaid ? 3 : 8).map((text) => (
              <Button key={text} variant="outline" size="sm" className="text-xs" onClick={() => sendPreset(text)}>
                {text}
              </Button>
            ))}
          </div>

          {isPaid ? (
            <div className="flex gap-2">
              <Input
                placeholder="Digite sua mensagem..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && sendFreeMessage()}
                className="flex-1"
              />
              {/* Selfie button for montador */}
              {isMontador && (
                <>
                  <input
                    ref={selfieInputRef}
                    type="file"
                    accept="image/*"
                    capture="user"
                    className="hidden"
                    onChange={handleSelfieUpload}
                  />
                  <Button
                    variant="outline"
                    onClick={() => selfieInputRef.current?.click()}
                    disabled={uploadingSelfie}
                    title="Enviar selfie de chegada"
                  >
                    <Camera className="h-4 w-4" />
                  </Button>
                </>
              )}
              <Button className="gradient-primary text-primary-foreground" onClick={sendFreeMessage}>
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
