import { createClient } from "https://esm.sh/@supabase/supabase-js@2.97.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

async function sendPushNotification(
  subscription: { endpoint: string; p256dh: string; auth: string },
  payload: string,
  vapidPublicKey: string,
  vapidPrivateKey: string
) {
  const webpush = await import("npm:web-push@3.6.7");
  webpush.setVapidDetails(
    "mailto:contato@clickmont.com.br",
    vapidPublicKey,
    vapidPrivateKey
  );
  await webpush.sendNotification(
    { endpoint: subscription.endpoint, keys: { p256dh: subscription.p256dh, auth: subscription.auth } },
    payload
  );
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Validate JWT
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseAuth = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const token = authHeader.replace("Bearer ", "");
    const { data: claimsData, error: claimsError } = await supabaseAuth.auth.getClaims(token);
    if (claimsError || !claimsData?.claims) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { user_id, title, message, order_id, city } = await req.json();

    // Input validation
    if (!user_id || typeof user_id !== "string") {
      return new Response(JSON.stringify({ error: "Missing user_id" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }
    if (!title || typeof title !== "string" || title.length > 200) {
      return new Response(JSON.stringify({ error: "Invalid title" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }
    if (!message || typeof message !== "string" || message.length > 1000) {
      return new Response(JSON.stringify({ error: "Invalid message" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Insert in-app notification
    await supabase.from("notifications").insert({
      user_id,
      title: title.slice(0, 200),
      message: message.slice(0, 1000),
      order_id: order_id || null,
    });

    // Send push notifications
    const vapidPublicKey = Deno.env.get("VAPID_PUBLIC_KEY");
    const vapidPrivateKey = Deno.env.get("VAPID_PRIVATE_KEY");

    if (vapidPublicKey && vapidPrivateKey) {
      const payload = JSON.stringify({
        title: title.slice(0, 100),
        body: message.slice(0, 500),
        icon: "/pwa-192x192.png",
        badge: "/pwa-192x192.png",
        data: { url: order_id ? `/chat/${order_id}` : "/" },
      });

      if (user_id !== "broadcast") {
        const { data: subs } = await supabase
          .from("push_subscriptions")
          .select("*")
          .eq("user_id", user_id);

        const results = await Promise.allSettled(
          (subs || []).map((sub) =>
            sendPushNotification(
              { endpoint: sub.endpoint, p256dh: sub.p256dh, auth: sub.auth },
              payload, vapidPublicKey, vapidPrivateKey
            )
          )
        );

        for (let i = 0; i < results.length; i++) {
          if (results[i].status === "rejected") {
            await supabase.from("push_subscriptions").delete().eq("id", subs![i].id);
          }
        }
      } else {
        let subsQuery = supabase
          .from("push_subscriptions")
          .select("*, profiles!inner(city, role)")
          .eq("profiles.role", "montador");
        if (city) subsQuery = subsQuery.eq("profiles.city", city);

        const { data: subs } = await subsQuery;
        const results = await Promise.allSettled(
          (subs || []).map((sub: any) =>
            sendPushNotification(
              { endpoint: sub.endpoint, p256dh: sub.p256dh, auth: sub.auth },
              payload, vapidPublicKey, vapidPrivateKey
            )
          )
        );

        for (let i = 0; i < results.length; i++) {
          if (results[i].status === "rejected") {
            const sub = (subs as any)![i];
            await supabase.from("push_subscriptions").delete().eq("id", sub.id);
          }
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
