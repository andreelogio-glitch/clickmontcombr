import { useState, useEffect } from "react";
import { useParams, Navigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import AppLayout from "@/components/AppLayout";
import Chat from "./Chat";

const ChatPage = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const { user, profile, loading: authLoading } = useAuth();
  const [authorized, setAuthorized] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    if (authLoading) return;
    if (!user || !orderId) {
      setChecking(false);
      return;
    }

    const checkAccess = async () => {
      const { data: order } = await supabase
        .from("orders")
        .select("client_id")
        .eq("id", orderId)
        .single();

      if (!order) {
        setChecking(false);
        return;
      }

      const isClient = order.client_id === user.id;

      if (isClient) {
        setAuthorized(true);
        setChecking(false);
        return;
      }

      if (profile?.role === "montador") {
        const { data: acceptedBid } = await supabase
          .from("bids")
          .select("montador_id")
          .eq("order_id", orderId)
          .eq("accepted", true)
          .maybeSingle();

        if (acceptedBid?.montador_id === user.id) {
          setAuthorized(true);
        }
      }

      setChecking(false);
    };

    checkAccess();
  }, [user, profile, authLoading, orderId]);

  if (authLoading || checking) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!user || !authorized) return <Navigate to="/" />;

  return (
    <AppLayout>
      <Chat />
    </AppLayout>
  );
};

export default ChatPage;
