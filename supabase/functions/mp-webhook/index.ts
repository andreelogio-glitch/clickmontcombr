import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

async function verifyMpSignature(
  req: Request,
  dataId: string
): Promise<boolean> {
  const webhookSecret = Deno.env.get("MP_WEBHOOK_SECRET");
  if (!webhookSecret) {
    console.warn("MP_WEBHOOK_SECRET not set, skipping signature verification");
    return false;
  }

  const xSignature = req.headers.get("x-signature");
  const xRequestId = req.headers.get("x-request-id");

  if (!xSignature || !xRequestId) {
    console.error("Missing x-signature or x-request-id headers");
    return false;
  }

  // Parse x-signature: "ts=...,v1=..."
  const parts: Record<string, string> = {};
  for (const part of xSignature.split(",")) {
    const [key, ...valueParts] = part.trim().split("=");
    parts[key] = valueParts.join("=");
  }

  const ts = parts["ts"];
  const v1 = parts["v1"];

  if (!ts || !v1) {
    console.error("Invalid x-signature format");
    return false;
  }

  // Build the manifest string per MP docs
  const manifest = `id:${dataId};request-id:${xRequestId};ts:${ts};`;

  // Compute HMAC-SHA256
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(webhookSecret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const signature = await crypto.subtle.sign("HMAC", key, encoder.encode(manifest));
  const hex = Array.from(new Uint8Array(signature))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");

  if (hex !== v1) {
    console.error("Signature mismatch");
    return false;
  }

  return true;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const topic = url.searchParams.get("topic") || url.searchParams.get("type");

    let paymentId: string | null = null;
    let dataIdForSig: string | null = null;

    if (req.method === "POST") {
      const body = await req.json();
      console.log("Webhook received:", JSON.stringify(body));

      // IPN format: topic=payment, id in query
      if (topic === "payment") {
        paymentId = url.searchParams.get("id");
        dataIdForSig = paymentId;
      }

      // Webhooks v2 format: type=payment, data.id in body
      if (body.type === "payment" && body.data?.id) {
        paymentId = String(body.data.id);
        dataIdForSig = paymentId;
      }

      // Also handle action "payment.updated" or "payment.created"
      if (body.action?.startsWith("payment.") && body.data?.id) {
        paymentId = String(body.data.id);
        dataIdForSig = paymentId;
      }

      // Verify signature if we have a data ID
      if (dataIdForSig) {
        const isValid = await verifyMpSignature(req, dataIdForSig);
        if (!isValid) {
          console.error("Webhook signature verification failed");
          return new Response(JSON.stringify({ error: "Invalid signature" }), {
            status: 403,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
      }
    }

    if (!paymentId) {
      return new Response(JSON.stringify({ received: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Fetch payment details from Mercado Pago
    const accessToken = Deno.env.get("MERCADOPAGO_ACCESS_TOKEN");
    if (!accessToken) {
      console.error("MERCADOPAGO_ACCESS_TOKEN not set");
      return new Response(JSON.stringify({ error: "Internal server error" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const mpRes = await fetch(
      `https://api.mercadopago.com/v1/payments/${paymentId}`,
      {
        headers: { Authorization: `Bearer ${accessToken}` },
      }
    );
    const payment = await mpRes.json();

    console.log(
      `Payment ${paymentId}: status=${payment.status}, external_reference=${payment.external_reference}`
    );

    const orderId = payment.external_reference;
    if (!orderId) {
      return new Response(JSON.stringify({ received: true, skipped: "no external_reference" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Initialize Supabase with service role to bypass RLS
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
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
