# ClickMont - Plano de Implementacao

**Versao:** 1.0
**Data:** 2026-04-01
**Metodologia:** GSD (Get Shit Done)

---

## 1. Status Atual do Projeto

### O que foi construido

| Componente | Status | Observacao |
|------------|--------|------------|
| Frontend React + TypeScript | ✅ Producao | clickmont.com.br no ar |
| Autenticacao (Supabase Auth) | ✅ Producao | Email/Google |
| Perfis (Cliente, Montador, Admin) | ✅ Producao | RBAC implementado |
| Pedidos de Montagem | ✅ Producao | RPC com validacao financeira |
| Sistema de Orcamentos (Bids) | ✅ Producao | Montador envia, cliente aceita |
| Chat em Tempo Real | ✅ Producao | Supabase Realtime |
| Pagamentos (Mercado Pago) | ✅ Producao | Checkout + Webhook |
| Push Notifications | ✅ Parcial | Edge function deployada |
| Storage (fotos, docs) | ⚠️ Pendente | Bucket nao criado |
| Edge Functions | ⚠️ Parcial | 2/6 deployadas |
| PWA | ⚠️ Parcial | Maskable icons gerados |
| CI/CD | ✅ Criado | GitHub Actions |
| Auditoria de Seguranca | ✅ Concluida | Patches aplicados |

---

## 2. Tarefas de Lancamento (Sprint 0)

### 2.1 Infraestrutura de Pagamento

| Tarefa | Prioridade | Esforco | Status |
|--------|-----------|---------|--------|
| Registrar webhook Mercado Pago | CRITICA | 1h | Pendente |
| Configurar secrets das edge functions | CRITICA | 2h | Pendente |
| Testar fluxo completo de pagamento | CRITICA | 4h | Pendente |
| Validar webhook em producao | CRITICA | 1h | Pendente |

### 2.2 Storage e Mídia

| Tarefa | Prioridade | Esforco | Status |
|--------|-----------|---------|--------|
| Criar bucket user-documents | CRITICA | 1h | Pendente |
| Criar bucket product-photos | MEDIA | 1h | Pendente |
| Configurar RLS nos buckets | CRITICA | 2h | Pendente |
| Migrar fotos existentes | BAIXA | 4h | Pendente |

### 2.3 Edge Functions

| Tarefa | Prioridade | Esforco | Status |
|--------|-----------|---------|--------|
| Deploy create-checkout | CRITICA | 1h | Pendente |
| Deploy send-push | CRITICA | 1h | Pendente |
| Deploy notify-* | MEDIA | 2h | Pendente |
| Configurar secrets | CRITICA | 2h | Pendente |
| Testar todas functions | CRITICA | 4h | Pendente |

### 2.4 SEO e Performance

| Tarefa | Prioridade | Esforco | Status |
|--------|-----------|---------|--------|
| Gerar sitemap.xml | MEDIA | 1h | Pendente |
| Configurar robots.txt | MEDIA | 1h | Pendente |
| Otimizar Core Web Vitals | MEDIA | 8h | Pendente |
| Setup Google Analytics | MEDIA | 4h | Pendente |
| Setup Google Search Console | MEDIA | 2h | Pendente |

---

## 3. Tarefas de Melhoria (Sprint 1)

### 3.1 Experiencia do Usuario

| Tarefa | Prioridade | Esforco | Impacto |
|--------|-----------|---------|---------|
| Tutorial/onboarding primeiro acesso | ALTA | 16h | Retencao |
| Historico de pedidos completo | ALTA | 8h | Utilidade |
| Notificacoes push completas | ALTA | 12h | Engajamento |
| Avaliacao de servico (pos-conclusao) | MEDIA | 8h | Feedback |
| FAQ dinamico | MEDIA | 8h | Suporte |

### 3.2 Para Montadores

| Tarefa | Prioridade | Esforco | Impacto |
|--------|-----------|---------|---------|
| App mobile para montadores | CRITICA | 40h | Core |
| Calendario de disponibilidade | ALTA | 16h | Utilidade |
| Historico de ganhos | ALTA | 8h | Engajamento |
| Verificacao de documento (CNPJ/CPF) | MEDIA | 12h | Confianca |
| Portifolio/Galeria de trabalhos | MEDIA | 16h | Conversao |

### 3.3 Para Administracao

| Tarefa | Prioridade | Esforco | Impacto |
|--------|-----------|---------|---------|
| Dashboard analitico completo | ALTA | 24h | Gestao |
| Controle financeiro detalhado | ALTA | 16h | Gestao |
| Gerenciamento de usuarios | MEDIA | 8h | Gestao |
| Logs de auditoria | MEDIA | 8h | Seguranca |
| Relatorios automatizados | MEDIA | 12h | Gestao |

---

## 4. Tarefas de Crescimento (Sprint 2)

### 4.1 Aquisição de Usuarios

| Tarefa | Prioridade | Esforco | Impacto |
|--------|-----------|---------|---------|
| Landing page otimizada | CRITICA | 16h | Conversao |
| SEO completo (blog) | ALTA | 24h | Tráfego |
| Integracao com marketplaces | MEDIA | 32h | Parcerias |
| Programa de afiliados | MEDIA | 24h | Crescimento |
| Campanhas Google Ads | CONTÍNUO | - | Aquisição |

### 4.2 Retenção

| Tarefa | Prioridade | Esforco | Impacto |
|--------|-----------|---------|---------|
| Programa de fidelidade | MEDIA | 24h | Retencao |
| Indique e ganhe | ALTA | 16h | Viral |
| Notificacoes proativas | MEDIA | 12h | Engajamento |
| Suporte via WhatsApp | ALTA | 8h | Satisfacao |

### 4.3 Monetização

| Tarefa | Prioridade | Esforco | Impacto |
|--------|-----------|---------|---------|
| Taxa de servico (% sobre transacao) | CRITICA | 8h | Receita |
| Planos premium para montadores | MEDIA | 24h | Receita |
| DestaqueVIP para montadores | MEDIA | 16h | Receita |
| Publicidade segmentada | BAIXA | 32h | Receita |

---

## 5. Plano de Execucao Detalhado

### Fase 1: Lancamento (Semana 1-2)

```
DIA 1-2: Infraestrutura
├── Registrar webhook Mercado Pago
├── Criar buckets de storage
├── Configurar RLS nos buckets
└── Deploy todas edge functions

DIA 3-4: Configuracao
├── Configurar secrets das functions
├── Testar fluxo de pagamento
├── Validar webhook em producao
└── Configurar Google Analytics

DIA 5-7: Polimento
├── Otimizar SEO
├── Testar fluxo completo E2E
├── Corrigir bugs encontrados
└── Deploy em producao
```

### Fase 2: Estabilizacao (Semana 3-4)

```
SEMANA 3: Funcionalidades Core
├── Onboarding primeiro acesso
├── Historico de pedidos
├── Notificacoes push completas
└── FAQ dinamico

SEMANA 4: Para Montadores
├── Calendario de disponibilidade
├── Historico de ganhos
└── Teste de usabilidade
```

### Fase 3: Crescimento (Mes 2-3)

```
MES 2: Acquisição
├── Landing page otimizada
├── SEO e blog
├── Campanhas iniciales
└── Indique e ganhe

MES 3: Escala
├── App mobile montadores
├── Dashboard admin completo
├── Programa de fidelidade
└── Planos premium
```

---

## 6. Estimativas de Esforco

| Fase | Semanas | Horas | Entregas |
|------|---------|-------|----------|
| Sprint 0 (Lancamento) | 2 | 80h | Sistema no ar completo |
| Sprint 1 (Melhoria) | 4 | 160h | UX melhorada |
| Sprint 2 (Crescimento) | 8 | 200h | Escala do negocio |

**Total estimado:** 440 horas (~11 semanas para 1 desenvolvedor)

---

## 7. Riscos e Mitigacoes

| Risco | Probabilidade | Impacto | Mitigacao |
|-------|--------------|---------|-----------|
| Webhook nao funciona | MEDIA | ALTO | Testes extensivos |
| Edge functions com timeout | MEDIA | MEDIO | Retry logic |
| Storage custos altos | BAIXA | MEDIO | Otimizar imagens |
| Concorrentes | ALTA | ALTO | Diferenciacao rapida |
| Adesao baixa | MEDIA | ALTO | Marketing agressivo |

---

## 8. KPIs de Sucesso

| KPI | Meta Mes 1 | Meta Mes 3 |
|-----|-----------|-----------|
| Pedidos/mês | 50 | 200 |
| Montadores ativos | 20 | 50 |
| Taxa conversao | 5% | 10% |
| Satisfacao (NPS) | 60 | 75 |
| GMV mensal | R$10k | R$50k |

---

**Proximo passo:** Executar Fase 1 (Lancamento)
