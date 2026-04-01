# Plano de Testes E2E - ClickMont

**Data:** 2026-04-01
**Versao:** 1.0

---

## 1. Preparacao

### 1.1 Criar Usuarios de Teste

1. Acesse **https://clickmont.com.br**

2. Cadastre 3 usuarios:
   - **Admin:** andreelogio@gmail.com (sua conta)
   - **Montador:** montador@teste.com (conta de teste)
   - **Cliente:** cliente@teste.com (conta de teste)

3. Execute o script SQL:
   ```
   supabase/migrations/20260401000003_test_users.sql
   ```

4. Configure os perfis via SQL:
   ```sql
   -- Apos saber o ID do seu usuario, execute:
   UPDATE profiles SET role = 'admin' WHERE email = 'andreelogio@gmail.com';
   ```

### 1.2 Verificar Setup

Execute este comando para verificar:
```powershell
.\scripts\test-users.ps1
```

---

## 2. Testes de Flujo

### TESTE 1: Fluxo do Cliente

| Passo | Acao | Esperado |
|-------|------|----------|
| 1 | Faca login como cliente@teste.com | Redireciona para home do cliente |
| 2 | Verifique menu: "Inicio" e "Pedir" | Links visiveis |
| 3 | Verifique que NAO ve: "Sou Montador" | Link NAO visivel |
| 4 | Verifique que NAO ve: painel admin | Links NAO visiveis |
| 5 | Clique em "Pedir Montagem" | Abre formulario de pedido |
| 6 | Preencha formulario (tipo, foto, endereco) | Formulario funcional |
| 7 | Submeta pedido | Pedido criado com sucesso |
| 8 | Verifique pedido em "Meus Pedidos" | Pedido aparece na lista |
| 9 | Aguarde orcamentos | Ver lista de lances |
| 10 | aceite um orcamento | Status muda para "Aguardando pagamento" |

**PASSOU:** Cliente consegue criar pedido e ver seus pedidos

---

### TESTE 2: Fluxo do Montador

| Passo | Acao | Esperado |
|-------|------|----------|
| 1 | Faca login como montador@teste.com | Redireciona para mural |
| 2 | Verifique menu: "Mural" e "Meus Orcamentos" | Links visiveis |
| 3 | Verifique que NAO ve: "Inicio" do cliente | Link NAO visivel |
| 4 | Verifique que NAO ve: painel admin | Links NAO visiveis |
| 5 | Navegue pelo Mural de Servicos | Lista de pedidos pendentes |
| 6 | Clique em um pedido | Abre modal de detalhes |
| 7 | Envie um orcamento | Lance criado com sucesso |
| 8 | Verifique em "Meus Orcamentos" | Orcamento aparece na lista |
| 9 | Aguarde aceite do cliente | Status do lance muda |

**PASSOU:** Montador consegue ver mural e enviar orcamentos

---

### TESTE 3: Fluxo do Admin

| Passo | Acao | Esperado |
|-------|------|----------|
| 1 | Faca login como andreelogio@gmail.com | Redireciona para /admin |
| 2 | Verifique menu: Painel Admin | Links de admin visiveis |
| 3 | Acesse Dashboard Admin | Pagina carrega com dados |
| 4 | Verifique usuarios | Lista de usuarios |
| 5 | Verifique pedidos | Lista de pedidos |
| 6 | Acesse gestao de montadores | Lista de montadores |
| 7 | Tente acessar /pedir-montagem | ACESSO NEGADO (redireciona) |
| 8 | Tente acessar /dashboard/montador | ACESSO NEGADO (redireciona) |

**PASSOU:** Admin acessa painel admin mas NAO acessa areas de cliente/montador

---

### TESTE 4: Teste de Seguranca

| Passo | Acao | Esperado |
|-------|------|----------|
| 1 | Cliente tenta acessar /admin | ACESSO NEGADO |
| 2 | Cliente tenta acessar /dashboard/montador | ACESSO NEGADO |
| 3 | Montador tenta acessar /admin | ACESSO NEGADO |
| 4 | Montador tenta acessar /dashboard/cliente | ACESSO NEGADO |
| 5 | Montador tenta acessar /pedir-montagem | ACESSO NEGADO |
| 6 | Usuario nao logado tenta acessar /dashboard/cliente | Redireciona para login |
| 7 | Chat: Cliente tenta acessar chat de outro pedido | ACESSO NEGADO |

**PASSOU:** Sistema bloqueia acessos nao autorizados

---

### TESTE 5: Chat

| Passo | Acao | Esperado |
|-------|------|----------|
| 1 | Cliente acessa pedido com orcamento aceito | Chat disponivel |
| 2 | Montador acessa chat do pedido aceito | Chat disponivel |
| 3 | Cliente envia mensagem | Mensagem aparece |
| 4 | Montador recebe mensagem | Notificacao ou ve no chat |
| 5 | Montador responde | Resposta aparece |

**PASSOU:** Chat funciona entre cliente e montador do pedido

---

### TESTE 6: Pagamentos (Se configurado)

| Passo | Acao | Esperado |
|-------|------|----------|
| 1 | Cliente aceita orcamento | Botao de pagamento disponivel |
| 2 | Clica em "Pagar" | Redireciona para Mercado Pago |
| 3 | Completa pagamento | Status muda para "Pago" |
| 4 | Montador ve pagamento | Status muda no mural |
| 5 | Apos servico, Montador confirma chegada | Cliente e notificado |

**NOTA:** Depende de webhook configurado

---

## 3. Checklist de Testes

### Setup
- [ ] 3 usuarios criados (Admin, Montador, Cliente)
- [ ] Perfis configurados no banco
- [ ] Role de admin definida

### Fluxo Cliente
- [ ] Login como cliente
- [ ] Criar pedido de montagem
- [ ] Ver pedidos propios
- [ ] Receber orcamentos
- [ ] Aceitar orcamento

### Fluxo Montador
- [ ] Login como montador
- [ ] Ver mural de servicos
- [ ] Ver detalhes de pedido
- [ ] Enviar orcamento
- [ ] Ver orcamentos enviados

### Fluxo Admin
- [ ] Login como admin
- [ ] Acessar painel admin
- [ ] Ver usuarios
- [ ] Ver pedidos
- [ ] Bloqueado de areas de cliente/montador

### Seguranca
- [ ] Cliente NAO acessa admin
- [ ] Cliente NAO acessa montador
- [ ] Montador NAO acessa admin
- [ ] Montador NAO acessa cliente
- [ ] Chat bloqueado para nao participantes

### Chat
- [ ] Cliente acessa chat do proprio pedido
- [ ] Montador acessa chat do pedido aceito
- [ ] Mensagens trocadas aparecem

---

## 4. Reportar Problemas

Se encontrar bugs, documente:

```
BUG #[numero]
Titulo: 
Descricao: 
Passos para reproduzir:
1. 
2. 
3. 
Resultado esperado:
Resultado real:
Severity: [Critico/Alto/Medio/Baixo]
```

---

**Fim do Plano de Testes**
