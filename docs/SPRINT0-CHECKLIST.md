# Sprint 0 - Checklist de Execucao Manual

Execute estes passos no Supabase Dashboard para completar o lancamento.

---

## 1. Criar Storage Buckets

1. Acesse: https://supabase.com/dashboard/project/zwfiadmmfgillrqhlbjw/storage
2. Clique em **"New Bucket"**

### Bucket 1: user-documents
- **Name:** user-documents
- **Public:** No
- **File size limit:** 10MB
- **Allowed MIME types:** image/png, image/jpeg, image/webp, application/pdf

### Bucket 2: product-photos
- **Name:** product-photos
- **Public:** Yes
- **File size limit:** 5MB
- **Allowed MIME types:** image/png, image/jpeg, image/webp

### Bucket 3: avatars
- **Name:** avatars
- **Public:** Yes
- **File size limit:** 2MB
- **Allowed MIME types:** image/png, image/jpeg, image/webp

3. Execute o SQL em `supabase/migrations/20260401000001_setup_storage.sql` no SQL Editor

---

## 2. Configurar Edge Function Secrets

1. Acesse: https://supabase.com/dashboard/project/zwfiadmmfgillrqhlbjw/functions/secrets
2. Adicione os secrets conforme `supabase/migrations/20260401000002_edge_function_secrets.sql`

---

## 3. Registrar Webhook do Mercado Pago

1. Acesse: https://www.mercadopago.com.br/developers/panel
2. Selecione sua aplicacao
3. Va em **"Webhooks"** ou **"Notificacoes"**
4. URL do webhook:
   ```
   https://zwfiadmmfgillrqhlbjw.supabase.co/functions/v1/mp-webhook
   ```
5. Marque os eventos:
   - `payment.created`
   - `payment.updated`
   - `payment.pending`
   - `payment.rejected`
   - `payment.refunded`

---

## 4. Deploy Edge Functions

Execute no terminal:

```bash
cd C:\Users\Andre Ramos\Documents\Projetos\clickmontcombr
set SUPABASE_ACCESS_TOKEN=SEU_PAT_AQUI
npx supabase functions deploy create-checkout
npx supabase functions deploy send-push
npx supabase functions deploy notify-order-status
npx supabase functions deploy notify-new-bid
npx supabase functions deploy notify-payment-received
npx supabase functions deploy notify-new-montador
npx supabase functions deploy get-vapid-key
```

---

## Checklist Final

- [ ] Storage buckets criados
- [ ] Politicas RLS configuradas
- [ ] Edge function secrets configurados
- [ ] Webhook Mercado Pago registrado
- [ ] Edge functions deployadas
- [ ] Testes de integracao passando

---

## Contatos de Suporte

- Supabase: https://supabase.com/dashboard/support
- Mercado Pago Developers: https://www.mercadopago.com.br/developers
