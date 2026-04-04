# 📋 ClickMont — Documentação Completa do Projeto

**Versão:** 2.0  
**Data:** 2026-04-04  
**Proprietário:** Andre Ramos (CTO/Founder)  
**Domínio:** [clickmont.com.br](https://clickmont.com.br)  
**Repositório:** [github.com/andreelogio-glitch/clickmontcombr](https://github.com/andreelogio-glitch/clickmontcombr)

---

## 📌 Índice

1. [Visão Geral](#1-visão-geral)
2. [Stack Tecnológica](#2-stack-tecnológica)
3. [Arquitetura do Sistema](#3-arquitetura-do-sistema)
4. [Estrutura de Diretórios](#4-estrutura-de-diretórios)
5. [Funcionalidades & Páginas](#5-funcionalidades--páginas)
6. [Sistema de Roles (RBAC)](#6-sistema-de-roles-rbac)
7. [Regras de Negócio](#7-regras-de-negócio)
8. [Backend — Supabase](#8-backend--supabase)
9. [Edge Functions](#9-edge-functions)
10. [PWA & Service Workers](#10-pwa--service-workers)
11. [Design System & Brand](#11-design-system--brand)
12. [CI/CD & Deploy](#12-cicd--deploy)
13. [Squads & Agentes IA](#13-squads--agentes-ia)
14. [Segurança](#14-segurança)
15. [Testes](#15-testes)
16. [Scripts Utilitários](#16-scripts-utilitários)
17. [Variáveis de Ambiente](#17-variáveis-de-ambiente)
18. [Roadmap](#18-roadmap)
19. [KPIs & Métricas](#19-kpis--métricas)
20. [Contatos](#20-contatos)

---

## 1. Visão Geral

### O que é o ClickMont?

O **ClickMont** é uma plataforma digital que conecta **clientes** a **profissionais verificados** para serviços de **montagem e desmontagem de móveis**. Funciona como um marketplace de serviços com sistema de orçamentos (bids), pagamento seguro via Mercado Pago e chat em tempo real.

### Proposta de Valor

| Pilar | Descrição |
|-------|-----------|
| **Profissionalismo** | Montadores verificados e aprovados pela plataforma |
| **Segurança** | Pagamento via Mercado Pago com proteção ao consumidor |
| **Transparência** | Sistema de orçamentos competitivos (bid marketplace) |
| **Praticidade** | PWA instalável, chat em tempo real, notificações push |

### Tagline

> *"Monte seus móveis sem estresse"*

---

## 2. Stack Tecnológica

### Frontend

| Tecnologia | Versão | Uso |
|------------|--------|-----|
| **React** | 18.3.x | Framework de UI |
| **TypeScript** | 5.8.x | Tipagem estática |
| **Vite** | 5.4.x | Build tool e dev server |
| **Tailwind CSS** | 3.4.x | Estilização utility-first |
| **shadcn/ui** | latest | Component library (Radix UI) |
| **React Router DOM** | 6.30.x | Roteamento SPA (HashRouter) |
| **TanStack React Query** | 5.83.x | Cache e data fetching |
| **Framer Motion** | 12.34.x | Animações |
| **Recharts** | 2.15.x | Gráficos e dashboards |
| **React Hook Form** | 7.61.x | Formulários |
| **Zod** | 3.25.x | Validação de schemas |
| **Lucide React** | 0.462.x | Ícones |
| **date-fns** | 3.6.x | Manipulação de datas |
| **Sonner** | 1.7.x | Toast notifications |
| **Embla Carousel** | 8.6.x | Carrosséis |

### Backend (BaaS)

| Tecnologia | Versão | Uso |
|------------|--------|-----|
| **Supabase** | 2.97.x | Auth, DB, Realtime, Storage, Edge Functions |
| **PostgreSQL** | (Supabase) | Banco de dados relacional |
| **Supabase Auth** | — | Autenticação (Email/Google) |
| **Supabase Realtime** | — | Chat em tempo real |
| **Supabase Edge Functions** | Deno | Serverless functions |

### Pagamentos

| Tecnologia | Uso |
|------------|-----|
| **Mercado Pago** | Checkout + Webhook de pagamentos |

### DevOps

| Tecnologia | Uso |
|------------|-----|
| **GitHub Actions** | CI/CD pipeline |
| **Vercel** | Deploy alternativo |
| **Hostinger** | Hosting principal (FTP deploy) |
| **Vitest** | Unit tests |
| **ESLint** | Linting |
| **PWA (Workbox)** | Progressive Web App |

---

## 3. Arquitetura do Sistema

```
┌─────────────────────────────────────────────────────────────────┐
│                        CLIENTE (Browser/PWA)                    │
│  React + TypeScript + Vite + Tailwind + shadcn/ui               │
│  HashRouter · React Query · Framer Motion                       │
├─────────────────────────────────────────────────────────────────┤
│                              │                                  │
│              ┌───────────────┼───────────────┐                  │
│              ▼               ▼               ▼                  │
│      Supabase Auth    Supabase DB     Supabase Realtime         │
│      (Email/Google)   (PostgreSQL)    (Chat WebSocket)          │
│              │               │               │                  │
│              └───────────────┼───────────────┘                  │
│                              │                                  │
│              ┌───────────────┼───────────────┐                  │
│              ▼               ▼               ▼                  │
│      Edge Functions    Supabase Storage   Mercado Pago          │
│      (Deno Runtime)    (Fotos/Docs)       (Pagamentos)          │
└─────────────────────────────────────────────────────────────────┘
```

### Fluxo Principal

```
Cliente solicita montagem → Montadores enviam orçamentos (bids)
→ Cliente aceita orçamento → Pagamento via Mercado Pago
→ Chat entre cliente e montador → Serviço realizado
→ Confirmação e avaliação
```

---

## 4. Estrutura de Diretórios

```
clickmontcombr-main/
├── .github/workflows/          # CI/CD (GitHub Actions)
│   └── ci.yml                  # Pipeline: lint → test → build → deploy
├── docs/                       # Documentação do projeto
│   ├── IMPLEMENTATION-PLAN.md  # Plano de implementação detalhado
│   ├── ROADMAP.md              # Roadmap de 12 meses
│   ├── SPRINT0-CHECKLIST.md    # Checklist de lançamento
│   ├── TEST-PLAN.md            # Plano de testes E2E
│   ├── brand-guidelines.md     # Guia de marca e identidade visual
│   ├── messaging-framework.md  # Templates de comunicação
│   └── CLEANUP_ADMIN_SQL.sql   # Scripts de limpeza SQL
├── scripts/                    # Scripts utilitários
│   ├── create-admin.mjs        # Criação de admin via API
│   ├── promote-admin.sql       # Promoção a admin via SQL
│   ├── sprint0-deploy.ps1      # Deploy automatizado Sprint 0
│   └── test-users.ps1          # Setup de usuários de teste
├── squads/                     # Squads de agentes IA
│   ├── auditoria-seguranca_clickmont.yaml
│   └── auditoria-seguranca_clickmont/
│       ├── relatorio-auditoria.txt
│       ├── patches.json
│       └── checklist-aceitacao.md
├── supabase/                   # Configuração Supabase
│   ├── config.toml             # Config do CLI
│   ├── functions/              # 6 Edge Functions
│   │   ├── create-checkout/    # Checkout Mercado Pago
│   │   ├── mp-webhook/         # Webhook Mercado Pago
│   │   ├── send-push/          # Envio de push notifications
│   │   ├── get-vapid-key/      # Chave VAPID pública
│   │   ├── notify-montador-approved/  # Notificação: montador aprovado
│   │   └── notify-new-montador/       # Notificação: novo montador
│   └── migrations/             # 50 migrations SQL
├── src/                        # Código-fonte principal
│   ├── App.tsx                 # Rotas e providers
│   ├── main.tsx                # Entry point
│   ├── index.css               # Estilos globais (CSS variables)
│   ├── components/             # Componentes React
│   │   ├── ui/                 # 49 componentes shadcn/ui
│   │   ├── AppLayout.tsx       # Layout principal com sidebar
│   │   ├── ProtectedRoute.tsx  # Guarda de rotas (RBAC)
│   │   ├── CameraCapture.tsx   # Captura de fotos (câmera)
│   │   ├── MontadorOnboarding.tsx  # Onboarding do montador
│   │   ├── MontadorPendingApproval.tsx
│   │   ├── MontadorResumo.tsx  # Resumo financeiro do montador
│   │   ├── NavLink.tsx         # Navegação
│   │   ├── Notifications.tsx   # Sistema de notificações
│   │   └── PWAInstallPrompt.tsx # Prompt de instalação PWA
│   ├── hooks/                  # Custom hooks
│   │   ├── useAuth.tsx         # Autenticação e perfil do usuário
│   │   ├── useIsAdmin.tsx      # Verificação de admin
│   │   ├── use-mobile.tsx      # Detecção de mobile
│   │   └── use-toast.ts        # Toast notifications
│   ├── integrations/           # Integrações externas
│   │   └── supabase/
│   │       └── client.ts       # Cliente Supabase (hardcoded)
│   ├── lib/                    # Utilitários e lógica de negócio
│   │   ├── fees.ts             # Cálculo de taxas e comissões
│   │   ├── push.ts             # Push notifications (VAPID)
│   │   └── utils.ts            # Utilidades gerais (cn)
│   ├── pages/                  # 29 páginas da aplicação
│   ├── test/                   # Testes unitários
│   └── tests/                  # Testes de integração
├── xquads-squads-main/         # 12 squads IA (Xquads/Synkra)
├── index.html                  # HTML entry point
├── vite.config.ts              # Config do Vite + PWA
├── tailwind.config.ts          # Config do Tailwind CSS
├── tsconfig.json               # Config TypeScript
├── package.json                # Dependências e scripts
└── PROJETO.md                  # ← ESTE ARQUIVO
```

---

## 5. Funcionalidades & Páginas

### Rotas Públicas (sem autenticação)

| Rota | Página | Descrição |
|------|--------|-----------|
| `/` | `Index` → `LandingPage` | Landing page principal |
| `/auth` | `Auth` | Login/Cadastro (Email + Google) |
| `/quem-somos` | `QuemSomos` | Apresentação da empresa |
| `/sou-montador` | `SouMontador` | Landing page para montadores |
| `/cadastro-montador` | `CadastroMontador` | Formulário de cadastro de montador |
| `/termos-e-privacidade` | `TermosPrivacidade` | Termos gerais |
| `/termos-de-uso` | `TermosDeUso` | Termos de uso |
| `/politica-de-privacidade` | `PoliticaPrivacidade` | Política de privacidade |
| `/institucional` | `Institucional` | Página institucional |

### Rotas Protegidas (qualquer usuário logado)

| Rota | Página | Descrição |
|------|--------|-----------|
| `/chat/:orderId` | `ChatPage` | Chat em tempo real (Supabase Realtime) |
| `/carteira` | `CarteiraPage` → `CarteiraMontador` | Carteira financeira |
| `/assistencia` | `AssistenciaPage` | Suporte e assistência |

### Rotas Exclusivas — Cliente

| Rota | Página | Descrição |
|------|--------|-----------|
| `/pedir-montagem` | `PedirMontagemPage` | Formulário de pedido |
| `/dashboard/cliente` | `ClienteDashboardPage` → `ClienteHome` | Dashboard do cliente |

### Rotas Exclusivas — Montador

| Rota | Página | Descrição |
|------|--------|-----------|
| `/dashboard/montador` | `MontadorDashboardPage` → `DashboardMontador` | Mural de serviços + orçamentos |
| `/suporte-montador` | `SuporteMontador` | Suporte dedicado ao montador |

### Rotas Exclusivas — Admin

| Rota | Página | Descrição |
|------|--------|-----------|
| `/admin` | `AdminDashboardPage` → `AdminDashboard` | Painel administrativo completo |
| `/admin/assistencia` | `AdminAssistenciaPage` | Gestão de tickets de suporte |
| `/admin-approval` | `AdminApproval` | Aprovação de montadores |

### Redirecionamentos Legados

| Rota antiga | Redireciona para |
|-------------|-----------------|
| `/montador` | `/dashboard/montador` |
| `/montador-dashboard` | `/dashboard/montador` |

---

## 6. Sistema de Roles (RBAC)

### Roles Disponíveis

| Role | Acesso | Descrição |
|------|--------|-----------|
| `cliente` | Dashboard cliente, Pedir Montagem, Chat, Carteira, Assistência | Usuário que solicita montagens |
| `montador` | Dashboard montador, Mural de serviços, Enviar orçamentos, Chat, Carteira, Suporte | Profissional que executa montagens |
| `admin` | Painel Admin, Aprovação de montadores, Gestão de assistência, Todos os dados | Administrador da plataforma |

### Implementação Frontend

```tsx
// src/components/ProtectedRoute.tsx
<ProtectedRoute allowedRoles={["cliente"]}>   // Só clientes
<ProtectedRoute allowedRoles={["montador"]}>  // Só montadores
<ProtectedRoute allowedRoles={["admin"]}>     // Só admins
<ProtectedRoute>                               // Qualquer logado
```

**Comportamento de acesso negado:**
- Montador tentando acessar área de cliente → redireciona para `/dashboard/montador`
- Cliente tentando acessar área de montador/admin → redireciona para `/dashboard/cliente`
- Usuário não logado → redireciona para `/auth`
- Verificação profunda de sessão via `supabase.auth.getSession()` (mitigação de segurança)

### Implementação Backend (Supabase)

```sql
-- Enum de roles
CREATE TYPE app_role AS ENUM ('cliente', 'montador', 'admin');

-- Função de verificação
CREATE FUNCTION has_role(role app_role) RETURNS boolean;

-- Políticas RLS em profiles e orders usando has_role()
```

### Fluxo de Autenticação

```
1. Supabase Auth (Email/Google)
      ↓
2. Trigger cria perfil em "profiles" (role = 'cliente' padrão)
      ↓
3. useAuth() busca o profile do user_id (com retry até 6x)
      ↓
4. ProtectedRoute verifica role e renderiza ou redireciona
      ↓
5. Verificação Deep Session (client-side verify adicional)
```

---

## 7. Regras de Negócio

### 7.1 Taxas e Comissões (`src/lib/fees.ts`)

| Regra | Valor | Fórmula |
|-------|-------|---------|
| **Taxa de montagem** | 10% | `Valor_Montagem = Valor_Nota × 10%` |
| **Comissão ClickMont** | 23% | `Comissão = Valor_Montagem × 23%` |
| **Montador recebe** | 77% | `Montador = Valor_Montagem × 77%` |
| **Bônus mesmo dia** | +10% | `Bônus = Valor_Montador × 10%` |

### 7.2 Desmontagem (split de pagamento)

| Etapa | Percentual |
|-------|-----------|
| Na confirmação da desmontagem | 40% do valor do montador |
| Na montagem final | 60% do valor do montador |

### 7.3 Exemplo Prático

```
Nota fiscal do móvel: R$ 3.000,00
├── Valor de montagem (10%): R$ 300,00  ← cliente paga
│   ├── ClickMont (23%): R$ 69,00       ← plataforma retém
│   └── Montador (77%): R$ 231,00       ← profissional recebe
│       └── Bônus mesmo dia (+10%): R$ 23,10 (adicional)
```

### 7.4 Fluxo de Pedido

```
1. Cliente posta pedido (fotos, endereço, tipo de móvel)
      ↓
2. Montadores visualizam no mural e enviam orçamentos (bids)
      ↓
3. Cliente compara orçamentos e aceita o melhor
      ↓
4. Pagamento via Mercado Pago (checkout seguro)
      ↓
5. Webhook confirma pagamento → status atualizado
      ↓
6. Chat habilitado entre cliente e montador
      ↓
7. Montador realiza o serviço
      ↓
8. Confirmação de conclusão → repasse financeiro
```

### 7.5 Fluxo do Montador

```
1. Cadastro via /cadastro-montador (dados pessoais, documentos)
      ↓
2. Admin aprova via /admin-approval
      ↓
3. Montador aprovado acessa mural de serviços
      ↓
4. Envia orçamentos para pedidos disponíveis
      ↓
5. Se aceito, recebe notificação + acesso ao chat
      ↓
6. Realiza o serviço e confirma conclusão
      ↓
7. Recebe pagamento (77% do valor - via carteira)
```

---

## 8. Backend — Supabase

### Projeto Supabase

| Campo | Valor |
|-------|-------|
| **Project ID** | `mmfsgzsvhktcyflarlae` |
| **URL** | `https://mmfsgzsvhktcyflarlae.supabase.co` |
| **Region** | South America (São Paulo) |

### Tabelas Principais (inferidas das migrations)

| Tabela | Descrição |
|--------|-----------|
| `profiles` | Perfis de usuários (role, nome, telefone, cidade, is_approved) |
| `orders` | Pedidos de montagem (tipo, fotos, endereço, status, valor_nota) |
| `bids` | Orçamentos/lances dos montadores |
| `messages` | Mensagens do chat em tempo real |
| `push_subscriptions` | Assinaturas de Push Notifications |
| `platform_logs` | Logs de auditoria da plataforma |
| `user_roles` | Tabela de roles RBAC |

### Migrations

O projeto possui **50 migrations SQL** cobrindo:
- Schema inicial (profiles, orders, bids)
- Sistema de RBAC (`app_role` enum, `has_role()`)
- Políticas RLS (Row Level Security)
- Setup de admin e usuários de teste
- Storage buckets e políticas
- Campo `valor_nota` em orders

### Storage Buckets

| Bucket | Público | Limite | Uso |
|--------|---------|--------|-----|
| `user-documents` | Não | 10MB | Documentos de montadores (CPF, CNPJ) |
| `product-photos` | Sim | 5MB | Fotos de móveis para pedidos |
| `avatars` | Sim | 2MB | Fotos de perfil |

### Realtime

- **Canal:** Mensagens do chat (table `messages`)
- **Uso:** Comunicação em tempo real entre cliente e montador

---

## 9. Edge Functions

| Função | Descrição | Status |
|--------|-----------|--------|
| `create-checkout` | Cria sessão de checkout no Mercado Pago | ⚠️ Pendente deploy |
| `mp-webhook` | Recebe webhooks do Mercado Pago (pagamento) | ⚠️ Pendente deploy |
| `send-push` | Envia push notifications via Web Push (VAPID) | ⚠️ Pendente deploy |
| `get-vapid-key` | Retorna chave pública VAPID | ⚠️ Pendente deploy |
| `notify-montador-approved` | Notifica montador quando aprovado | ⚠️ Pendente deploy |
| `notify-new-montador` | Notifica admin sobre novo cadastro de montador | ⚠️ Pendente deploy |

### Secrets Necessários

| Secret | Descrição |
|--------|-----------|
| `SUPABASE_URL` | URL do projeto Supabase |
| `SUPABASE_ANON_KEY` | Chave anônima |
| `SUPABASE_SERVICE_ROLE_KEY` | Chave de serviço (Admin) |
| `MERCADOPAGO_ACCESS_TOKEN` | Token de acesso Mercado Pago |
| `VAPID_PUBLIC_KEY` | Chave pública VAPID (push) |
| `VAPID_PRIVATE_KEY` | Chave privada VAPID (push) |

---

## 10. PWA & Service Workers

### Configuração PWA

| Propriedade | Valor |
|-------------|-------|
| **Nome** | Clickmont - Montagem de Móveis |
| **Nome curto** | Clickmont |
| **Display** | standalone |
| **Orientação** | portrait |
| **Cor do tema** | `#FF6B00` (Laranja) |
| **Cor de fundo** | `#FFFFFF` (Branco) |
| **Ícones** | 192x192 e 512x512 (maskable) |

### Estratégias de Cache (Workbox)

| Padrão | Estratégia | Cache | TTL |
|--------|-----------|-------|-----|
| Supabase API (`*.supabase.co`) | NetworkFirst | `supabase-cache` | 1 hora |
| Imagens (png, jpg, svg, webp) | CacheFirst | `image-cache` | 30 dias |

### Service Workers

- **`sw.js`** — Service worker principal (Workbox)
- **`sw-push.js`** — Handler de push notifications
- **`registerSW.js`** — Auto-registro do SW

### Push Notifications

- Protocolo **Web Push** com chaves **VAPID**
- Subscriptions salvas na tabela `push_subscriptions`
- Edge function `send-push` para envio server-side
- Compatível com iOS (PWA) e Android

---

## 11. Design System & Brand

### Paleta de Cores

#### Cores Primárias
| Nome | Hex | Uso |
|------|-----|-----|
| Laranja Primary | `#FF6B00` | Logo, CTAs, destaques |
| Laranja Light | `#FF8C00` | Gradientes, hover |
| Laranja Dark | `#E65C00` | Pressed states |

#### Cores Neutras
| Nome | Hex | Uso |
|------|-----|-----|
| Branco | `#FFFFFF` | Fundos, texto destaque |
| Cinza Escuro | `#1A1A2E` | Fundos escuros, hero |
| Cinza Médio | `#4A4A6A` | Texto secundário |
| Cinza Claro | `#F5F5F7` | Fundos alternativos |

#### Cores de Feedback
| Nome | Hex | Uso |
|------|-----|-----|
| Success | `#22C55E` | Confirmações |
| Warning | `#F59E0B` | Alertas |
| Error | `#EF4444` | Erros |
| Info | `#3B82F6` | Informações |

### Tipografia

- **Família:** Inter (Google Fonts)
- **Pesos:** 400 (Regular), 500 (Medium), 700 (Bold), 800 (ExtraBold), 900 (Black)
- **H1:** 48-64px, Black (900)
- **Body:** 16px, Regular (400)
- **Button:** 16px, Bold (700)

### Ícones

- **Biblioteca:** Lucide Icons
- **Tamanho padrão:** 24px
- **Stroke:** 2px

### Componentes UI (shadcn/ui)

49 componentes Radix UI customizados:
`Accordion`, `AlertDialog`, `Alert`, `Avatar`, `Badge`, `Breadcrumb`, `Button`, `Calendar`, `Card`, `Carousel`, `Chart`, `Checkbox`, `Collapsible`, `Command`, `ContextMenu`, `Dialog`, `Drawer`, `DropdownMenu`, `Form`, `HoverCard`, `InputOTP`, `Input`, `Label`, `Menubar`, `NavigationMenu`, `Pagination`, `Popover`, `Progress`, `RadioGroup`, `Resizable`, `ScrollArea`, `Select`, `Separator`, `Sheet`, `Sidebar`, `Skeleton`, `Slider`, `Sonner`, `Switch`, `Table`, `Tabs`, `Textarea`, `Toast`, `Toaster`, `ToggleGroup`, `Toggle`, `Tooltip`

### Tailwind CSS Customizações

- **Dark mode:** class-based
- **Border radius tokens:** `--radius` base com cálculos
- **Animações custom:** `accordion-down`, `accordion-up`, `fade-in`
- **Cores semânticas:** `success`, `warning`, `gold`, `sidebar`
- **Container:** max-width 1400px, centralizado, padding 2rem

---

## 12. CI/CD & Deploy

### Pipeline GitHub Actions (`ci.yml`)

```
Push para main
    ↓
┌─────────┐     ┌──────────┐
│  Lint   │     │  Tests   │     (paralelo)
└────┬────┘     └────┬─────┘
     └────────┬──────┘
              ↓
        ┌──────────┐
        │  Build   │
        └────┬─────┘
             ↓
    ┌─────────────────┐
    │  Deploy (FTP)   │  ← Apenas push em main
    │  → Hostinger    │
    └─────────────────┘
```

### Ambientes

| Ambiente | URL | Deploy |
|----------|-----|--------|
| **Produção** | clickmont.com.br | Hostinger (FTP via GitHub Actions) |
| **Alternativo** | Vercel | Deploy automático via Git |
| **Dev** | localhost:8080 | `npm run dev` |

### Scripts NPM

| Script | Comando | Uso |
|--------|---------|-----|
| `dev` | `vite` | Servidor de desenvolvimento |
| `build` | `vite build` | Build de produção |
| `build:dev` | `vite build --mode development` | Build de desenvolvimento |
| `preview` | `vite preview` | Preview do build |
| `lint` | `eslint .` | Verificação de código |
| `test` | `vitest run` | Testes unitários |
| `test:watch` | `vitest` | Testes em modo watch |

---

## 13. Squads & Agentes IA

### Squad Interno: Auditoria de Segurança

**Arquivo:** `squads/auditoria-seguranca_clickmont.yaml`

| Fase | Objetivos |
|------|-----------|
| **1. Rotas e RBAC** | Verificar ProtectedRoute, garantir separação de áreas por role |
| **2. RBAC no DB** | Validar `app_role` enum, políticas com `has_role()` |
| **3. Fluxos de Usuário** | Testar fluxos completos: Cliente, Montador, Admin |
| **4. Relatório & Patches** | Gerar relatório de achados e sugerir patches |
| **5. Aprovações** | Validação do proprietário antes de aplicar mudanças |

**Outputs gerados:**
- `relatorio-auditoria.txt` — Resumo dos achados
- `patches.json` — Patches sugeridos
- `checklist-aceitacao.md` — Checklist de aceitação

### Xquads — 12 Squads IA (Synkra AIOS)

Framework completo em `xquads-squads-main/`:

| Squad | Agentes | Foco |
|-------|---------|------|
| **Advisory Board** | 11 | Conselheiros estratégicos (Ray Dalio, Charlie Munger, Naval Ravikant) |
| **Brand Squad** | 15 | Branding e posicionamento (David Aaker, Marty Neumeier, Al Ries) |
| **C-Level Squad** | 6 | Liderança executiva (CEO, CTO, CMO, COO, CIO, CAIO) |
| **Claude Code Mastery** | 8 | Domínio do Claude Code e AIOS |
| **Copy Squad** | 23 | Copywriting (Gary Halbert, Eugene Schwartz, David Ogilvy) |
| **Cybersecurity** | 15 | Segurança ofensiva e defensiva |
| **Data Squad** | 7 | Analytics e growth (Sean Ellis, Avinash Kaushik) |
| **Design Squad** | 8 | UX/UI e design systems (Brad Frost, Dan Mall) |
| **Hormozi Squad** | 16 | Negócios e escala (framework Alex Hormozi) |
| **Movement** | 7 | Construção de comunidades |
| **Storytelling** | 12 | Narrativa (Joseph Campbell, Oren Klaff) |
| **Traffic Masters** | 16 | Tráfego pago e mídia (Pedro Sobral, Kasim Aslam) |

**Total: 144 agentes IA especializados**

### Estrutura de Cada Squad

```
squad-name/
├── squad.yaml      # Manifesto (agentes, tasks, workflows)
├── agents/         # Definições de agentes (persona, role, focus)
├── tasks/          # Tasks executáveis com inputs/outputs
├── workflows/      # Workflows multi-agente
├── checklists/     # Checklists de qualidade
├── config/         # Configurações
└── data/           # Frameworks e catálogos
```

---

## 14. Segurança

### Medidas Implementadas

| Camada | Medida | Status |
|--------|--------|--------|
| **Frontend** | ProtectedRoute com RBAC | ✅ Implementado |
| **Frontend** | Deep Session Verify (client-side) | ✅ Implementado |
| **Backend** | Row Level Security (RLS) | ✅ Implementado |
| **Backend** | `has_role()` function para políticas | ✅ Implementado |
| **Backend** | Enum `app_role` para roles tipados | ✅ Implementado |
| **Auth** | Supabase Auth (Email/Google) | ✅ Implementado |
| **Auth** | Auto refresh token | ✅ Implementado |
| **Auth** | Persistent session (localStorage) | ✅ Implementado |
| **Pagamentos** | Checkout seguro via Mercado Pago | ✅ Configurado |
| **API** | Chave anon (publishable) no frontend | ✅ Hardcoded |
| **Auditoria** | Logs em `platform_logs` | ✅ Implementado |
| **Storage** | RLS policies nos buckets | ⚠️ Pendente |
| **HTTPS** | SSL em clickmont.com.br | ✅ Ativo |

### Auditoria Realizada

- **Data:** 2026-03-31
- **Alvos:** Rotas, RBAC, fluxos por role
- **Resultado:** Aprovado ✅ com recomendações menores
- **Patches aplicados:** Sim

### Recomendações Pendentes

1. Adicionar testes E2E automatizados de autorização
2. Testes de carga nas políticas RBAC
3. Garantir que orçamentos não exponham dados sensíveis do cliente
4. Atualizar documentação de RBAC com exemplos

---

## 15. Testes

### Framework de Testes

| Ferramenta | Uso |
|------------|-----|
| **Vitest** | Unit tests |
| **Testing Library** | React component testing |
| **jsdom** | DOM environment para testes |

### Plano de Testes E2E

| Teste | Cenário | Criticidade |
|-------|---------|-------------|
| Fluxo Cliente | Login → Pedir montagem → Ver pedidos → Aceitar orçamento | CRÍTICA |
| Fluxo Montador | Login → Mural → Enviar orçamento → Chat | CRÍTICA |
| Fluxo Admin | Login → Dashboard → Aprovar montador | ALTA |
| Segurança | Cross-role access attempts (todos negados) | CRÍTICA |
| Chat | Troca de mensagens em tempo real | ALTA |
| Pagamento | Checkout → Webhook → Confirmação | CRÍTICA |

### Usuarios de Teste

| Role | Email |
|------|-------|
| Admin | `andreelogio@gmail.com` |
| Montador | `montador@teste.com` |
| Cliente | `cliente@teste.com` |

---

## 16. Scripts Utilitários

| Script | Caminho | Descrição |
|--------|---------|-----------|
| `create-admin.mjs` | `scripts/` | Cria ou promove um usuário a admin via API |
| `promote-admin.sql` | `scripts/` | SQL para promover admin diretamente no DB |
| `sprint0-deploy.ps1` | `scripts/` | Automação completa do deploy Sprint 0 (10KB) |
| `test-users.ps1` | `scripts/` | Setup e verificação de usuários de teste |

---

## 17. Variáveis de Ambiente

### Arquivo `.env`

```env
VITE_SUPABASE_PROJECT_ID="mmfsgzsvhktcyflarlae"
VITE_SUPABASE_PUBLISHABLE_KEY="eyJhbG..." (anon key)
VITE_SUPABASE_URL="https://mmfsgzsvhktcyflarlae.supabase.co"
```

> **Nota:** O cliente Supabase (`src/integrations/supabase/client.ts`) possui as credenciais **hardcoded** por questões de confiabilidade no deploy. A chave utilizada é a `anon` key (pública), segura para exposição no frontend.

### GitHub Actions Secrets

| Secret | Uso |
|--------|-----|
| `VITE_SUPABASE_URL` | URL do Supabase para build |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Anon key para build |
| `VITE_SUPABASE_PROJECT_ID` | Project ID para build |
| `FTP_SERVER` | Servidor FTP Hostinger |
| `FTP_USERNAME` | Usuário FTP |
| `FTP_PASSWORD` | Senha FTP |

---

## 18. Roadmap

### Visão de 12 Meses

```
Q2 2026 (LAUNCH)     Q3 2026 (GROWTH)     Q4 2026 (SCALE)      Q1 2027 (EXPAND)
─────────────────    ──────────────────    ──────────────────    ──────────────────
├─ Lançamento MVP     ├─ App Mobile        ├─ Cobertura Nacional  ├─ API & Integrações
├─ Estabilização      ├─ Marketing Ativo   ├─ IA & Automação     ├─ Marketplace B2B
├─ 100 pedidos        ├─ Fidelidade        ├─ Novos Serviços     ├─ Expansão Latam
└─ Onboarding UX      └─ Parcerias         └─ B2B & Empresas     └─ Series A (meta)
```

### Status Atual (Sprint 0)

| Componente | Status |
|------------|--------|
| Frontend React + TypeScript | ✅ Em produção |
| Autenticação (Supabase Auth) | ✅ Em produção |
| Perfis (RBAC) | ✅ Em produção |
| Pedidos de Montagem | ✅ Em produção |
| Sistema de Orçamentos | ✅ Em produção |
| Chat em Tempo Real | ✅ Em produção |
| Pagamentos (Mercado Pago) | ✅ Em produção |
| Push Notifications | ⚠️ Parcial |
| Storage (fotos, docs) | ⚠️ Pendente buckets |
| Edge Functions | ⚠️ Parcial (2/6 deployadas) |
| PWA | ⚠️ Parcial (ícones gerados) |
| CI/CD | ✅ Configurado |
| Auditoria de Segurança | ✅ Concluída |

---

## 19. KPIs & Métricas

### Metas por Período

| KPI | Mês 1 | Mês 3 | Mês 6 | Mês 12 |
|-----|-------|-------|-------|--------|
| Pedidos/mês | 50 | 200 | 300 | 500 |
| Montadores ativos | 20 | 50 | 100 | 200 |
| Taxa de conversão | 5% | 10% | — | — |
| NPS | 60 | 75 | — | — |
| GMV mensal | R$10k | R$50k | R$50k | R$100k |
| MRR | — | — | R$5k | R$15k |

### Competidores

| Competidor | Diferenciação ClickMont |
|------------|------------------------|
| GetNinjas | Foco 100% em montagens |
| Ubermont | Profissionais verificados + Garantia |
| Fixxer | Marketplace bid + Pagamento seguro |

---

## 20. Contatos

| Tipo | Contato |
|------|---------|
| **Fundador/CTO** | Andre Ramos |
| **Email Suporte** | contato@clickmont.com.br |
| **Email Comercial** | comercial@clickmont.com.br |
| **WhatsApp** | (11) 5128-0116 |
| **CNPJ** | 61.774.392/0001-30 |
| **GitHub** | @andreelogio-glitch |

---

## Documentação Relacionada

| Documento | Caminho | Descrição |
|-----------|---------|-----------|
| Plano de Implementação | `docs/IMPLEMENTATION-PLAN.md` | Sprints detalhados com estimativas |
| Roadmap | `docs/ROADMAP.md` | Roadmap trimestral de 12 meses |
| Sprint 0 Checklist | `docs/SPRINT0-CHECKLIST.md` | Passo a passo de lançamento |
| Plano de Testes | `docs/TEST-PLAN.md` | Cenários de testes E2E |
| Brand Guidelines | `docs/brand-guidelines.md` | Identidade visual completa |
| Messaging Framework | `docs/messaging-framework.md` | Templates de comunicação |
| Relatório de Auditoria | `squads/auditoria-seguranca_clickmont/relatorio-auditoria.txt` | Achados de segurança |

---

> **Última atualização:** 2026-04-04 | **Versão:** 2.0 | **Autor:** Documentação gerada por AI assistente
