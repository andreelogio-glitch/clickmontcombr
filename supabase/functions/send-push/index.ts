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

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    const supabaseAuth = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const token = authHeader.replace("Bearer ", "");

    // Determine caller identity
    let callerUserId: string | null = null;
    let isServiceRole = false;

    // Check if this is a service role call (from webhook or other edge functions)
    if (token === serviceRoleKey) {
      isServiceRole = true;
    } else {
      const { data: userData, error: userError } = await supabaseAuth.auth.getUser();
      if (userError || !userData?.user) {
        return new Response(JSON.stringify({ error: "Unauthorized" }), {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      callerUserId = userData.user.id;
    }

    const { user_id, title, message, order_id, city, include_verification_code } = await req.json();

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

    const supabase = createClient(supabaseUrl, serviceRoleKey);

    // ── Authorization checks ──
    if (!isServiceRole) {
      // Check if caller is admin
      const { data: adminRole } = await supabase
        .from("user_roles")
        .select("id")
        .eq("user_id", callerUserId!)
        .eq("role", "admin")
        .maybeSingle();

      const isAdmin = !!adminRole;

      // Broadcast: admin-only
      if (user_id === "broadcast") {
        if (!isAdmin) {
          return new Response(JSON.stringify({ error: "Forbidden: broadcast requires admin" }), {
            status: 403,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
      } else if (order_id) {
        // Order-related notification: verify caller is a participant
        const { data: order } = await supabase
          .from("orders")
          .select("client_id")
          .eq("id", order_id)
          .single();

        if (!order) {
          return new Response(JSON.stringify({ error: "Order not found" }), {
            status: 404,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }

        const isClient = order.client_id === callerUserId;

        const { data: bid } = await supabase
          .from("bids")
          .select("montador_id")
          .eq("order_id", order_id)
          .eq("montador_id", callerUserId!)
          .maybeSingle();

        const isMontador = !!bid;

        if (!isClient && !isMontador && !isAdmin) {
          return new Response(JSON.stringify({ error: "Forbidden: not a participant" }), {
            status: 403,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }

        // Additional check: target user_id must be a participant too
        const isTargetClient = order.client_id === user_id;
        const { data: targetBid } = await supabase
          .from("bids")
          .select("montador_id")
          .eq("order_id", order_id)
          .eq("montador_id", user_id)
          .maybeSingle();
        const isTargetMontador = !!targetBid;

        if (!isTargetClient && !isTargetMontador && !isAdmin) {
          return new Response(JSON.stringify({ error: "Forbidden: target not a participant" }), {
            status: 403,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
      } else if (!isAdmin) {
        // Non-order, non-broadcast, non-admin: forbidden
        return new Response(JSON.stringify({ error: "Forbidden" }), {
          status: 403,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }

    // If requested, look up verification code server-side and inject into message
    let finalMessage = message;
    if (include_verification_code && order_id) {
      const { data: orderData } = await supabase
        .from("orders")
        .select("verification_code")
        .eq("id", order_id)
        .single();
      const code = orderData?.verification_code || "****";
      finalMessage = message.replace("{CODE}", code);
    }

    // Insert in-app notification
    await supabase.from("notifications").insert({
      user_id,
      title: title.slice(0, 200),
      message: finalMessage.slice(0, 1000),
      order_id: order_id || null,
    });

    // Send push notifications
    const vapidPublicKey = Deno.env.get("VAPID_PUBLIC_KEY");
    const vapidPrivateKey = Deno.env.get("VAPID_PRIVATE_KEY");

    if (vapidPublicKey && vapidPrivateKey) {
      const payload = JSON.stringify({
        title: title.slice(0, 100),
        body: finalMessage.slice(0, 500),
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
    return new Response(JSON.stringify({ error: "Internal error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
