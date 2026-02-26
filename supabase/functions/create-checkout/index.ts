const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { order_id, title, amount } = await req.json();

    if (!order_id || !title || !amount) {
      return new Response(JSON.stringify({ error: 'Missing fields' }), {
        status: 400,
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
          title: `Clickmont - ${title}`,
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
      return new Response(JSON.stringify({ error: 'Erro ao criar preferência', details: mpData }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ checkout_url: mpData.init_point, id: mpData.id }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error('Error:', err);
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
