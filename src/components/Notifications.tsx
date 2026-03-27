import { useState, useEffect } from "react";
import { Bell, BellOff, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { subscribeToPush, isSubscribedToPush } from "@/lib/push";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface Notification {
  id: string;
  title: string;
  message: string;
  read: boolean;
  order_id: string | null;
  created_at: string;
}

export const useNotifications = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!user) return;

    // Fetch existing notifications
    const fetchNotifications = async () => {
      const { data } = await supabase
        .from("notifications")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(20);
      if (data) {
        setNotifications(data as Notification[]);
        setUnreadCount(data.filter((n: any) => !n.read).length);
      }
    };

    fetchNotifications();

    // Subscribe to realtime notifications
    const channel = supabase
      .channel("notifications")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "notifications",
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          const newNotif = payload.new as Notification;
          setNotifications((prev) => [newNotif, ...prev]);
          setUnreadCount((prev) => prev + 1);
          toast(newNotif.title, { description: newNotif.message });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  const markAsRead = async (id: string) => {
    await supabase.from("notifications").update({ read: true }).eq("id", id);
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
    setUnreadCount((prev) => Math.max(0, prev - 1));
  };

  const markAllAsRead = async () => {
    if (!user) return;
    const unreadIds = notifications.filter((n) => !n.read).map((n) => n.id);
    if (unreadIds.length === 0) return;
    await supabase.from("notifications").update({ read: true }).in("id", unreadIds);
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    setUnreadCount(0);
  };

  return { notifications, unreadCount, markAsRead, markAllAsRead };
};

export const NotificationBell = ({
  unreadCount,
  onClick,
}: {
  unreadCount: number;
  onClick: () => void;
}) => (
  <button
    onClick={onClick}
    className="relative p-2 rounded-lg hover:bg-accent transition-colors"
    aria-label="Notificações"
  >
    <Bell className="h-5 w-5 text-foreground" />
    {unreadCount > 0 && (
      <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[10px] font-bold text-destructive-foreground">
        {unreadCount > 9 ? "9+" : unreadCount}
      </span>
    )}
  </button>
);

export const PushPermissionBanner = () => {
  const { user } = useAuth();
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user) return;
    const check = async () => {
      if (!("PushManager" in window)) return;
      const subscribed = await isSubscribedToPush();
      const dismissedAt = localStorage.getItem("push-banner-dismissed");

      let isExpired = true;
      if (dismissedAt) {
        isExpired = new Date() > new Date(dismissedAt);
      }

      if (!subscribed && isExpired) setShow(true);
    };
    check();
  }, [user]);

  const handleEnable = async () => {
    setLoading(true);
    const success = await subscribeToPush();
    setLoading(false);
    if (success) {
      toast.success("Notificações ativadas!");
      setShow(false);
    } else {
      toast.error("Não foi possível ativar as notificações.");
    }
  };

  const handleDismiss = () => {
    const nextAttempt = new Date();
    nextAttempt.setDate(nextAttempt.getDate() + 7);
    localStorage.setItem("push-banner-dismissed", nextAttempt.toISOString());
    setShow(false);
  };

  if (!show) return null;

  return (
    <div className="mx-4 my-2 flex items-center gap-3 rounded-xl border bg-card p-3 shadow-sm animate-in slide-in-from-top-2">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10">
        <BellOff className="h-4 w-4 text-primary" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-semibold text-card-foreground">Ativar notificações</p>
        <p className="text-[10px] text-muted-foreground">Receba avisos de pagamentos e novos pedidos</p>
      </div>
      <Button size="sm" variant="default" onClick={handleEnable} disabled={loading} className="shrink-0 text-xs">
        {loading ? "..." : "Ativar"}
      </Button>
      <button onClick={handleDismiss} className="shrink-0 text-muted-foreground hover:text-foreground">
        <X className="h-3.5 w-3.5" />
      </button>
    </div>
  );
};
