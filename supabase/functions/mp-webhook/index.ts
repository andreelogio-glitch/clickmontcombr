import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { encode as hexEncode } from "https://deno.land/std@0.224.0/encoding/hex.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

async function verifyMPSignature(
  xSignature: string,
  xRequestId: string,
  dataId: string,
  secret: string
): Promise<boolean> {
  // Parse x-signature header: "ts=...,v1=..."
  const parts: Record<string, string> = {};
  for (const part of xSignature.split(",")) {
    const [key, ...val] = part.split("=");
    parts[key.trim()] = val.join("=").trim();
  }

  const ts = parts["ts"];
  const v1 = parts["v1"];
  if (!ts || !v1) return false;

  // Build manifest string per MP docs
  const manifest = `id:${dataId};request-id:${xRequestId};ts:${ts};`;

  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const signature = await crypto.subtle.sign("HMAC", key, encoder.encode(manifest));
  const hex = new TextDecoder().decode(hexEncode(new Uint8Array(signature)));

  return hex === v1;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const topic = url.searchParams.get("topic") || url.searchParams.get("type");

    let paymentId: string | null = null;
    let bodyText = "";

    if (req.method === "POST") {
      bodyText = await req.text();
      const body = JSON.parse(bodyText);
      console.log("Webhook received:", JSON.stringify(body));

      // Signature verification
      const xSignature = req.headers.get("x-signature");
      const xRequestId = req.headers.get("x-request-id");
      const webhookSecret = Deno.env.get("MP_WEBHOOK_SECRET");

      if (webhookSecret && xSignature && xRequestId) {
        const dataId = body.data?.id ? String(body.data.id) : url.searchParams.get("id") || "";
        const valid = await verifyMPSignature(xSignature, xRequestId, dataId, webhookSecret);
        if (!valid) {
          console.error("Invalid MP webhook signature");
          return new Response(JSON.stringify({ error: "Invalid signature" }), {
            status: 401,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
        console.log("MP signature verified ✓");
      } else if (webhookSecret) {
        // Secret configured but headers missing - log warning but allow (IPN format)
        console.warn("MP webhook secret configured but signature headers missing, falling back to API verification");
      }

      // IPN format
      if (topic === "payment") {
        paymentId = url.searchParams.get("id");
      }

      // Webhooks v2 format
      if (body.type === "payment" && body.data?.id) {
        paymentId = String(body.data.id);
      }

      if (body.action?.startsWith("payment.") && body.data?.id) {
        paymentId = String(body.data.id);
      }
    }

    if (!paymentId) {
      return new Response(JSON.stringify({ received: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const accessToken = Deno.env.get("MERCADOPAGO_ACCESS_TOKEN");
    if (!accessToken) {
      console.error("MERCADOPAGO_ACCESS_TOKEN not set");
      return new Response(JSON.stringify({ error: "Token not configured" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const mpRes = await fetch(
      `https://api.mercadopago.com/v1/payments/${paymentId}`,
      { headers: { Authorization: `Bearer ${accessToken}` } }
    );
    const payment = await mpRes.json();
    await mpRes.text().catch(() => {});

    console.log(
      `Payment ${paymentId}: status=${payment.status}, external_reference=${payment.external_reference}`
    );

    const orderId = payment.external_reference;
    if (!orderId) {
      return new Response(JSON.stringify({ received: true, skipped: "no external_reference" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    if (payment.status === "approved") {
      const verificationCode = String(Math.floor(1000 + Math.random() * 9000));

      const { error: updateError, data: updatedOrder } = await supabase
        .from("orders")
        .update({ status: "pago", verification_code: verificationCode })
        .eq("id", orderId)
        .eq("status", "aceito")
        .select("title")
        .maybeSingle();

      if (updateError) {
        console.error("Error updating order:", updateError);
      } else if (updatedOrder) {
        console.log(`Order ${orderId} marked as paid`);

        const { data: acceptedBid } = await supabase
          .from("bids")
          .select("montador_id")
          .eq("order_id", orderId)
          .eq("accepted", true)
          .maybeSingle();

        if (acceptedBid) {
          const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
          const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

          await fetch(`${supabaseUrl}/functions/v1/send-push`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${serviceKey}`,
            },
            body: JSON.stringify({
              user_id: acceptedBid.montador_id,
              title: "💰 Pagamento confirmado!",
              message: `O pagamento do serviço "${updatedOrder.title}" foi aprovado. Acesse o chat para combinar os detalhes.`,
              order_id: orderId,
            }),
          }).catch((e) => console.error("Push notification error:", e));
        }
      }
    } else if (payment.status === "rejected" || payment.status === "cancelled") {
      console.log(`Payment ${paymentId} was ${payment.status} for order ${orderId}`);
    }

    return new Response(JSON.stringify({ received: true, status: payment.status }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("Webhook error:", err);
    return new Response(JSON.stringify({ error: err.message }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
