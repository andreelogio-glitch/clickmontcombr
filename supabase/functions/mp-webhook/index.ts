import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const topic = url.searchParams.get("topic") || url.searchParams.get("type");

    // MP sends different notification types; we only care about payments
    let paymentId: string | null = null;

    if (req.method === "POST") {
      const body = await req.json();
      console.log("Webhook received:", JSON.stringify(body));

      // IPN format: topic=payment, id in query
      if (topic === "payment") {
        paymentId = url.searchParams.get("id");
      }

      // Webhooks v2 format: type=payment, data.id in body
      if (body.type === "payment" && body.data?.id) {
        paymentId = String(body.data.id);
      }

      // Also handle action "payment.updated" or "payment.created"
      if (body.action?.startsWith("payment.") && body.data?.id) {
        paymentId = String(body.data.id);
      }
    }

    if (!paymentId) {
      // Not a payment notification, acknowledge anyway
      return new Response(JSON.stringify({ received: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Fetch payment details from Mercado Pago
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
      {
        headers: { Authorization: `Bearer ${accessToken}` },
      }
    );
    const payment = await mpRes.json();
    await mpRes.text().catch(() => {}); // ensure body consumed

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
      // Update order status to "pago"
      const { error: updateError, data: updatedOrder } = await supabase
        .from("orders")
        .update({ status: "pago" })
        .eq("id", orderId)
        .eq("status", "aceito")
        .select("title")
        .maybeSingle();

      if (updateError) {
        console.error("Error updating order:", updateError);
      } else if (updatedOrder) {
        console.log(`Order ${orderId} marked as paid`);

        // Find the accepted bid's montador to notify
        const { data: acceptedBid } = await supabase
          .from("bids")
          .select("montador_id")
          .eq("order_id", orderId)
          .eq("accepted", true)
          .maybeSingle();

        if (acceptedBid) {
          // Send push notification to montador
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
    // Always return 200 to MP so it doesn't retry endlessly
    return new Response(JSON.stringify({ error: err.message }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
