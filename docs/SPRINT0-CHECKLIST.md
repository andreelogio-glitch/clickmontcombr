# Sprint 0 - Checklist de Execucao

Execute estes passos na ORDEM indicada para completar o lancamento.

---

## PASSO 1: Criar Storage Buckets

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

5. Execute no SQL Editor (https://supabase.com/dashboard/project/zwfiadmmfgillrqhlbjw/sql):
   ```sql
   -- Cole o conteudo de supabase/migrations/20260401000004_storage_setup_executable.sql
   ```

---

## PASSO 2: Configurar Secrets das Edge Functions

**Dashboard:** https://supabase.com/dashboard/project/zwfiadmmfgillrqhlbjw/functions/secrets

Adicione os seguintes secrets:

| Secret | Valor |
|--------|-------|
| SUPABASE_URL | `https://zwfiadmmfgillrqhlbjw.supabase.co` |
| SUPABASE_ANON_KEY | (copie do Settings > API) |
| SUPABASE_SERVICE_ROLE_KEY | (copie do Settings > API) |
| MERCADOPAGO_ACCESS_TOKEN | (do Mercado Pago Developers) |
| VAPID_PUBLIC_KEY | `BMBW4lAdHim3Q7fJRc8I4yJ5nKxZvA9LmNqRtY2uW8` |
| VAPID_PRIVATE_KEY | `5N-83BN-Wi73apDhN8vLx4qR6kF9mWx2YzA7bJcP1dE` |

---

## PASSO 3: Registrar Webhook do Mercado Pago

1. Acesse: https://www.mercadopago.com.br/developers/panel
2. Selecione sua aplicacao
3. Webhook URL:
   ```
   https://zwfiadmmfgillrqhlbjw.supabase.co/functions/v1/mp-webhook
   ```
4. Marque eventos: `payment.created`, `payment.updated`, `payment.pending`, `payment.rejected`, `payment.refunded`

---

## PASSO 4: Deploy Edge Functions

Execute no terminal:

```powershell
cd C:\Users\Andre Ramos\Documents\Projetos\clickmontcombr
$env:SUPABASE_ACCESS_TOKEN = 'seu_pat_aqui'
npm run supabase:deploy
```

Ou use o script interativo:
```powershell
.\scripts\sprint0-deploy.ps1
```

---

## PASSO 5: Criar Novo GitHub PAT

1. Acesse: https://github.com/settings/tokens/new
2. Configure:
   - **Token name:** `clickmont-deploy`
   - **Expiration:** `90 days`
   - **Scopes:** `repo`, `workflow`, `admin:repo_hook`
3. Copie o token gerado
4. Adicione como Secret `GITHUB_TOKEN` em:
   https://github.com/andreelogio-glitch/clickmontcombr/settings/secrets/actions

---

## PASSO 6: Push do Codigo

```powershell
cd C:\Users\Andre Ramos\Documents\Projetos\clickmontcombr
git add .
git commit -m "feat(sprint0): scripts e configuracao para lancamento"
git push origin feat/auditoria-seguranca-clickmont
```

Depois, faça merge para `main`:
```powershell
git checkout main
git merge feat/auditoria-seguranca-clickmont
git push origin main
```

---

## PASSO 7: Criar Usuarios de Teste

1. Acesse https://clickmont.com.br
2. Crie 3 contas:
   - `admin@clickmont.com.br` (voce)
   - `montador@teste.com`
   - `cliente@teste.com`
3. Execute no Supabase SQL Editor:
   ```sql
   -- Cole o conteudo de supabase/migrations/20260401000005_test_users_executable.sql
   ```
4. Substitua os UUIDs pelos IDs reais dos usuarios criados

---

## PASSO 8: Verificar Tudo

1. Site: https://clickmont.com.br
2. Login como admin
3. Verifique /admin
4. Crie um pedido como cliente
5. Veja no mural como montador
6. Teste o chat

---

## Checklist de Verificacao

- [ ] Storage buckets criados (3 buckets)
- [ ] Politicas RLS configuradas
- [ ] Edge function secrets configurados
- [ ] Webhook Mercado Pago registrado
- [ ] Edge functions deployadas
- [ ] Novo GitHub PAT configurado
- [ ] Codigo pushado para main
- [ ] CI/CD executando
- [ ] 3 usuarios de teste criados
- [ ] Fluxo admin verificado
- [ ] Fluxo cliente verificado
- [ ] Fluxo montador verificado
- [ ] Chat funcionando

---

## Arquivos Criados

- `scripts/sprint0-deploy.ps1` - Script de deploy interativo
- `supabase/migrations/20260401000004_storage_setup_executable.sql` - Storage buckets
- `supabase/migrations/20260401000005_test_users_executable.sql` - Usuarios de teste
- `.github/workflows/ci.yml` - Pipeline CI/CD
