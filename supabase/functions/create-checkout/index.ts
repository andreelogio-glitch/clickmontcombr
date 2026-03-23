import { createClient } from "https://esm.sh/@supabase/supabase-js@2.97.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Validate JWT
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabaseAuth = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const token = authHeader.replace('Bearer ', '');
    const { data: claimsData, error: claimsError } = await supabaseAuth.auth.getClaims(token);
    if (claimsError || !claimsData?.claims) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const callerUserId = claimsData.claims.sub;

    const { order_id, title, amount } = await req.json();

    // Input validation
    if (!order_id || typeof order_id !== 'string' || !title || typeof title !== 'string' || !amount || typeof amount !== 'number' || amount <= 0 || amount > 100000) {
      return new Response(JSON.stringify({ error: 'Invalid input' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    // Verify order belongs to caller
    const { data: order } = await supabase
      .from('orders')
      .select('client_id, status')
      .eq('id', order_id)
      .single();

    if (!order || order.client_id !== callerUserId) {
      return new Response(JSON.stringify({ error: 'Forbidden: not your order' }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const accessToken = Deno.env.get('MERCADOPAGO_ACCESS_TOKEN');
    if (!accessToken) {
      return new Response(JSON.stringify({ error: 'MP token not configured' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
    const webhookUrl = `${supabaseUrl}/functions/v1/mp-webhook`;

    const preference = {
      items: [
        {
          title: `Clickmont - ${title.slice(0, 200)}`,
          quantity: 1,
          unit_price: Number(amount),
          currency_id: 'BRL',
        },
      ],
      external_reference: order_id,
      notification_url: webhookUrl,
      back_urls: {
        success: `${req.headers.get('origin') || 'https://clickmont.com.br'}/?payment=success&order=${order_id}`,
        failure: `${req.headers.get('origin') || 'https://clickmont.com.br'}/?payment=failure&order=${order_id}`,
        pending: `${req.headers.get('origin') || 'https://clickmont.com.br'}/?payment=pending&order=${order_id}`,
      },
      auto_return: 'approved',
    };

    const mpResponse = await fetch('https://api.mercadopago.com/checkout/preferences', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify(preference),
    });

    const mpData = await mpResponse.json();

    if (!mpResponse.ok) {
      console.error('MP error:', mpData);
      return new Response(JSON.stringify({ error: 'Erro ao criar preferência' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ checkout_url: mpData.init_point, id: mpData.id }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error('Internal error:', err);
    return new Response(JSON.stringify({ error: 'Ocorreu um erro inesperado. Por favor, tente novamente mais tarde.' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
