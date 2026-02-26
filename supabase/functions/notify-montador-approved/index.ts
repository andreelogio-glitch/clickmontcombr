import { createClient } from "https://esm.sh/@supabase/supabase-js@2.97.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { user_id, name } = await req.json();

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Get the user's email
    const { data: userData } = await supabase.auth.admin.getUserById(user_id);
    const email = userData?.user?.email;

    if (email) {
      // Send welcome email via notification (in-app)
      await supabase.from("notifications").insert({
        user_id,
        title: "✅ Parabéns! O seu perfil foi aprovado no Clickmont",
        message:
          "Olá! É com prazer que informamos que o seu cadastro foi aprovado pela nossa equipa. Agora já pode aceder à plataforma, visualizar os serviços disponíveis em Campinas e região, e começar as suas montagens. Boas vendas!",
      });
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
