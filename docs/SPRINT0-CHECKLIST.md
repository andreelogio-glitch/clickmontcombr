# Sprint 0 - Checklist de Execucao

Execute estes passos na ORDEM indicada para completar o lancamento.

---

## PASSO 1: Setup Admin (andreelogio@gmail.com)

**Execute no Supabase SQL Editor:**
https://supabase.com/dashboard/project/zwfiadmmfgillrqhlbjw/sql

1. Cole e execute: `supabase/migrations/20260401000006_setup_admin_user.sql`
2. Verifique se aparece "Admin configurado com sucesso!"

---

## PASSO 2: Criar Storage Buckets

**Supabase Dashboard:** https://supabase.com/dashboard/project/zwfiadmmfgillrqhlbjw/storage

1. Clique em **"New Bucket"**

2. Bucket 1: `user-documents`
   - Public: **No**
   - File size limit: **10MB**
   - Allowed MIME types: `image/png, image/jpeg, image/webp, application/pdf`

3. Bucket 2: `product-photos`
   - Public: **Yes**
   - File size limit: **5MB**
   - Allowed MIME types: `image/png, image/jpeg, image/webp`

4. Bucket 3: `avatars`
   - Public: **Yes**
   - File size limit: **2MB**
   - Allowed MIME types: `image/png, image/jpeg, image/webp`

5. Execute no SQL Editor: `supabase/migrations/20260401000004_storage_setup_executable.sql`

---

## PASSO 3: Configurar Secrets das Edge Functions

**Dashboard:** https://supabase.com/dashboard/project/zwfiadmmfgillrqhlbjw/functions/secrets

| Secret | Valor |
|--------|-------|
| SUPABASE_URL | `https://zwfiadmmfgillrqhlbjw.supabase.co` |
| SUPABASE_ANON_KEY | (copie do Settings > API) |
| SUPABASE_SERVICE_ROLE_KEY | (copie do Settings > API) |
| MERCADOPAGO_ACCESS_TOKEN | (do Mercado Pago Developers) |
| VAPID_PUBLIC_KEY | `BMBW4lAdHim3Q7fJRc8I4yJ5nKxZvA9LmNqRtY2uW8` |
| VAPID_PRIVATE_KEY | `5N-83BN-Wi73apDhN8vLx4qR6kF9mWx2YzA7bJcP1dE` |

---

## PASSO 4: Cadastrar Montador e Cliente

1. Acesse: https://clickmont.com.br/cadastro
2. Crie conta como **MONTADOR**: `montador@teste.com`
3. Crie conta como **CLIENTE**: `cliente@teste.com`
4. Execute no SQL Editor: `supabase/migrations/20260401000007_setup_test_users.sql`

---

## PASSO 5: Registrar Webhook do Mercado Pago

1. Acesse: https://www.mercadopago.com.br/developers/panel
2. Selecione sua aplicacao
3. Webhook URL:
   ```
   https://zwfiadmmfgillrqhlbjw.supabase.co/functions/v1/mp-webhook
   ```
4. Marque: `payment.created`, `payment.updated`, `payment.pending`, `payment.rejected`, `payment.refunded`

---

## PASSO 6: Deploy Edge Functions

```powershell
cd C:\Users\Andre Ramos\Documents\Projetos\clickmontcombr
$env:SUPABASE_ACCESS_TOKEN = 'seu_pat_aqui'
npm run supabase:deploy
```

---

## PASSO 7: Novo GitHub PAT

1. https://github.com/settings/tokens/new
2. Scopes: `repo`, `workflow`, `admin:repo_hook`
3. Adicione como Secret `GITHUB_TOKEN` em:
   https://github.com/andreelogio-glitch/clickmontcombr/settings/secrets/actions

---

## PASSO 8: Push do Codigo

```powershell
git checkout main
git merge feat/auditoria-seguranca-clickmont
git push origin main
```

---

## Checklist Final

- [ ] Admin configurado (andreelogio@gmail.com)
- [ ] Storage buckets criados (3 buckets)
- [ ] Politicas RLS configuradas
- [ ] Edge function secrets configurados
- [ ] Montador e Cliente cadastrados
- [ ] Webhook Mercado Pago registrado
- [ ] Edge functions deployadas
- [ ] Novo GitHub PAT configurado
- [ ] Codigo mergeado para main
- [ ] Login admin funcionando (/admin)
- [ ] Login montador funcionando (/montador)
- [ ] Login cliente funcionando (ClienteHome)

---

## Ordem de Execucao

```
1. Setup Admin (SQL)
   ↓
2. Storage Buckets (Dashboard + SQL)
   ↓
3. Secrets (Dashboard)
   ↓
4. Cadastrar Montador/Cliente (Site)
   ↓
5. Setup Montador/Cliente (SQL)
   ↓
6. Webhook Mercado Pago
   ↓
7. Deploy Edge Functions
   ↓
8. GitHub PAT + Push
```
