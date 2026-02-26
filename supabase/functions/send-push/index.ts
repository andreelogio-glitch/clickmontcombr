import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// Web Push with VAPID using the web-push npm package via esm.sh
async function sendPushNotification(
  subscription: { endpoint: string; p256dh: string; auth: string },
  payload: string,
  vapidPublicKey: string,
  vapidPrivateKey: string
) {
  // Use the web-push library
  const webpush = await import("npm:web-push@3.6.7");

  webpush.setVapidDetails(
    "mailto:contato@clickmont.com.br",
    vapidPublicKey,
    vapidPrivateKey
  );

  const pushSubscription = {
    endpoint: subscription.endpoint,
    keys: {
      p256dh: subscription.p256dh,
      auth: subscription.auth,
    },
  };

  await webpush.sendNotification(pushSubscription, payload);
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { user_id, title, message, order_id } = await req.json();

    if (!user_id || !title || !message) {
      return new Response(JSON.stringify({ error: "Missing fields" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // 1. Insert in-app notification
    await supabase.from("notifications").insert({
      user_id,
      title,
      message,
      order_id: order_id || null,
    });

    // 2. Send push notifications to all user subscriptions
    const vapidPublicKey = Deno.env.get("VAPID_PUBLIC_KEY");
    const vapidPrivateKey = Deno.env.get("VAPID_PRIVATE_KEY");

    if (vapidPublicKey && vapidPrivateKey) {
      const { data: subs } = await supabase
        .from("push_subscriptions")
        .select("*")
        .eq("user_id", user_id);

      const payload = JSON.stringify({
        title,
        body: message,
        icon: "/pwa-192x192.png",
        badge: "/pwa-192x192.png",
        data: { url: order_id ? `/chat/${order_id}` : "/" },
      });

      const results = await Promise.allSettled(
        (subs || []).map((sub) =>
          sendPushNotification(
            { endpoint: sub.endpoint, p256dh: sub.p256dh, auth: sub.auth },
            payload,
            vapidPublicKey,
            vapidPrivateKey
          )
        )
      );

      const sent = results.filter((r) => r.status === "fulfilled").length;
      const failed = results.filter((r) => r.status === "rejected").length;
      console.log(`Push: ${sent} sent, ${failed} failed for user ${user_id}`);

      // Clean up invalid subscriptions
      for (let i = 0; i < results.length; i++) {
        if (results[i].status === "rejected") {
          const sub = subs![i];
          await supabase
            .from("push_subscriptions")
            .delete()
            .eq("id", sub.id);
        }
      }
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("Send push error:", err);
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
