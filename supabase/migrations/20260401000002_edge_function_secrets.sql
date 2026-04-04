# Sprint 0 - Configurar Edge Functions

## Como Configurar Secrets

1. Acesse: https://supabase.com/dashboard/project/mmfsgzsvhktcyflarlae/functions/secrets
2. Clique em **"Add a new secret"** para cada secret abaixo

---

## Secrets para TODAS as Functions

| Secret | Onde Encontrar |
|--------|-----------------|
| SUPABASE_URL | Settings > API > Project URL |
| SUPABASE_ANON_KEY | Settings > API > anon public |

---

## Secrets para create-checkout

| Secret | Onde Encontrar |
|--------|-----------------|
| SUPABASE_SERVICE_ROLE_KEY | Settings > API > service_role secret |
| MERCADOPAGO_ACCESS_TOKEN | Mercado Pago Developers > Sua App > Credenciais |
| MP_WEBHOOK_SECRET | Define no Mercado Pago Webhook |

---

## Secrets para send-push e notify-*

| Secret | Onde Encontrar |
|--------|-----------------|
| VAPID_PUBLIC_KEY | Gere novo: `npx web-push generate-vapid-keys` |
| VAPID_PRIVATE_KEY | Gere novo: `npx web-push generate-vapid-keys` |

---

## Deploy das Edge Functions

Execute no terminal:

```bash
cd C:\Users\Andre Ramos\Documents\Projetos\clickmontcombr

# Configure o token
set SUPABASE_ACCESS_TOKEN=SEU_PAT_AQUI

# Deploy todas as functions
npx supabase functions deploy create-checkout
npx supabase functions deploy send-push
npx supabase functions deploy notify-order-status
npx supabase functions deploy notify-new-bid
npx supabase functions deploy notify-payment-received
npx supabase functions deploy notify-new-montador
npx supabase functions deploy get-vapid-key
```

---

## Verificar Deploy

Teste no terminal:

```bash
curl -X GET "https://mmfsgzsvhktcyflarlae.supabase.co/functions/v1/get-vapid-key" \
  -H "Authorization: Bearer SEU_ANON_KEY"
```
