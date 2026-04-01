# Brand Guidelines - ClickMont

**Versao:** 1.0
**Data:** 2026-04-01
**Proprietario:** Andre Ramos (CTO)

---

## 1. Identidade da Marca

### 1.1 Nome e Tagline

| Elemento | Valor |
|----------|-------|
| Nome | ClickMont |
| Tagline Principal | "Monte seus moveis sem estresse" |
| Tagline Alternativa | "Profissionais verificados para sua tranquilidade" |
| Subtitulo | Montagem e Desmontagem Profissional |

### 1.2 Proposta de Valor

- **O que fazemos:** Conectamos clientes a profissionais verificados para montagem e desmontagem de moveis
- **Como fazemos:** Plataforma digital com profissionalismo, seguranca e transparencia
- **Por que importa:** Economia de tempo, seguranca e tranquilidade para o cliente

### 1.3 Personalidade da Marca

| Atributo | Descricao |
|----------|-----------|
| Profissional | Servico confiavel, qualidade garantida |
| Acessivel | Linguagem simples, sem jargoes |
| Confiavel | Profissionais verificados, pagamentos seguros |
| Eficiente | Respostas rapidas, servicos pontuais |
| Moderno | Tecnologia a favor do cliente |

---

## 2. Voice & Tone

### 2.1 Voz da Marca

**Como falamos:**
- Linguagem clara e direta
- Tom amigavel mas profissional
- Mensagens positivas e encorajadoras
- Foco em beneficios para o cliente
- Nao usamos linguagem muito tecnica ou formal demais

**Exemplos de copy:**

| Tipo | Evitar | Usar |
|------|--------|------|
| Boas-vindas | "Bem-vindo ao nosso sistema" | "Oi! Pronto para montar seus moveis?" |
| CTA | "Clique aqui para continuar" | "Quero solicitar minha montagem" |
| Erro | "Ocorreu uma falha tecnica" | "Ops! Algo deu errado. Tenta de novo?" |
| Sucesso | "Transacao processada" | "Tudo certo! Seu pedido foi enviado" |

### 2.2 Tom por Situacao

| Situacao | Tom | Exemplo |
|----------|-----|---------|
| Boas-vindas | Caloroso, amigavel | "Oi [Nome]! Bem-vindo ao ClickMont" |
| Instrucoes | Simples, passo a passo | "E simples: 1. Fotos 2. Endereco 3. Pronto" |
| Erro | Empatico, solucionador | "Calma, isso acontece. Deixa a gente te ajudar" |
| Sucesso | Celebratorio, confiante | "Parabens! Seu movel esta em boas maos" |
| Urgencia | Firme, claro | "Servico urgente? Encontre profissionais agora" |

### 2.3 Palavras-Chave da Marca

**Usar:**
- Profissional, verificado, garantido, seguro, rapido, facil, tranquilo, experiente

**Evitar:**
- Barato (usar "preco justo"), freelancer (usar "profissional"), gambiarra (usar "solucao")

---

## 3. Identidade Visual

### 3.1 Paleta de Cores

#### Cores Primarias

| Nome | Hex | RGB | Uso |
|------|-----|-----|-----|
| Laranja Primary | `#FF6B00` | rgb(255, 107, 0) | Logo, CTAs principais, elementos de destaque |
| Laranja Light | `#FF8C00` | rgb(255, 140, 0) | Gradientes, hover states |
| Laranja Dark | `#E65C00` | rgb(230, 92, 0) | Pressed states |

#### Cores Secundarias

| Nome | Hex | RGB | Uso |
|------|-----|-----|-----|
| Branco | `#FFFFFF` | rgb(255, 255, 255) | Fundos, texto em destaque |
| Cinza Escuro | `#1A1A2E` | rgb(26, 26, 46) | Fundos escuros, hero sections |
| Cinza Medio | `#4A4A6A` | rgb(74, 74, 106) | Texto secundario |
| Cinza Claro | `#F5F5F7` | rgb(245, 245, 247) | Fundos alternativos |

#### Cores de Feedback

| Nome | Hex | RGB | Uso |
|------|-----|-----|-----|
| Success | `#22C55E` | rgb(34, 197, 94) | Confirmacoes, pagamentos aprovados |
| Warning | `#F59E0B` | rgb(245, 158, 11) | Alertas, pendencias |
| Error | `#EF4444` | rgb(239, 68, 68) | Erros, cancelamentos |
| Info | `#3B82F6` | rgb(59, 130, 246) | Informacoes gerais |

### 3.2 Tipografia

#### Familia Principal

| Uso | Fonte | Peso | Tamanho |
|-----|-------|------|---------|
| Headline H1 | Inter | 900 (Black) | 48-64px |
| Headline H2 | Inter | 800 (ExtraBold) | 36-48px |
| Headline H3 | Inter | 700 (Bold) | 28-36px |
| Body Large | Inter | 500 (Medium) | 18-20px |
| Body | Inter | 400 (Regular) | 16px |
| Body Small | Inter | 400 (Regular) | 14px |
| Caption | Inter | 500 (Medium) | 12px |
| Button | Inter | 700 (Bold) | 16px |

#### Import

```css
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');
```

### 3.3 Espacamento

| Token | Valor | Uso |
|-------|-------|-----|
| `--space-xs` | 4px | Espacos minimos |
| `--space-sm` | 8px | Entre elementos relacionados |
| `--space-md` | 16px | Padding interno de componentes |
| `--space-lg` | 24px | Separacao de secoes |
| `--space-xl` | 32px | Margens de secao |
| `--space-2xl` | 48px | Separacao de blocos grandes |

### 3.4 Bordas e Sombras

| Token | Valor | Uso |
|-------|-------|-----|
| `--radius-sm` | 8px | Inputs, botoes secundarios |
| `--radius-md` | 12px | Cards, modais |
| `--radius-lg` | 16px | Cards grandes |
| `--radius-xl` | 24px | Banners, hero sections |
| `--radius-full` | 9999px | Pills, avatares |

### 3.5 Iconografia

**Estilo:** Lucide Icons
**Tamanho padrao:** 24px
**Stroke:** 2px
**Cores:** Usar cor atual do texto (currentColor)

### 3.6 Ilustracoes e Fotos

**Estilo de foto:** Real, natural, com pessoas diversidade
**Nao usar:** Fotos estocadas genericas, pessoas em poses forcadas
**Tratamento:** Cores quentes, luminosidade natural

---

## 4. Logo

### 4.1 Versoes do Logo

| Versao | Uso | Fundo |
|--------|-----|-------|
| Principal | fundo claro | Laranja (#FF6B00) com texto branco |
| Horizontal | menu, headers | Fundo transparente |
| Icon | PWA, favicon, apps | Fundo laranja ou branco |

### 4.2 Uso Correto

**Fazer:**
- Usar espaco livre minimo de 1x a altura do icone
- Manter proporcoes originais
- Usar apenas em fundos que garantam contraste

**Nao fazer:**
- Alterar cores
- Adicionar efeitos
- Distorcer proporcoes
- Usar em fundos que comprometam leitura

### 4.3 Arquivos

```
assets/logo/
├── clickmont-logo-horizontal.png
├── clickmont-logo-vertical.png
├── clickmont-icon.png
├── clickmont-favicon.ico
└── clickmont-pwa-192.png
```

---

## 5. Aplicacoes

### 5.1 Website

- Hero com gradiente laranja (#FF6B00 → #FFA500)
- CTAs em laranja primario
- Cards com sombra suave
- Borda arredondada nos componentes

### 5.2 Redes Sociais

| Rede | Banner Principal | Post | Story |
|------|-----------------|------|-------|
| Instagram | 1080x1080 | 1080x1080 | 1080x1920 |
| Facebook | 820x312 | 1200x630 | - |
| Twitter | 1500x500 | 1600x900 | - |
| LinkedIn | 1584x396 | 1200x627 | - |

### 5.3 Anuncios

| Formato | Tamanho |
|---------|---------|
| Google Display | 300x250, 728x90 |
| Facebook Feed | 1080x1080 |
| Instagram Feed | 1080x1080 |

---

## 6. Mensagens por Canal

### 6.1 Anuncios (Ads)

**Headline:** [Beneficio direto]
**Exemplo:** "Monte seus moveis em 24h"

**Body:** [Como funciona + garantia]
**Exemplo:** "Profissionais verificados. Pagamento seguro. Servico garantido."

**CTA:** [Acao clara]
**Exemplo:** "Solicitar Agora", "Ver Profissionais"

### 6.2 Rede Social

**Estrutura:**
1. Hook (pergunta ou afirmacao impactante)
2. Beneficio principal
3. Prova social ou garantia
4. CTA

**Exemplo Instagram:**
> "Sabe aquele movel que esta ai esperando h meses? 
> 
> Com o ClickMont, voce encontra profissionais verificados na sua cidade em ate 24h.
> 
> +500 montagens realizadas com satisfacao total.
> 
> Link na bio! Monte agora!"

### 6.3 Email

**Assunto:** [Beneficio + Urgencia]
**Exemplo:** "Seu movel pronto esta semana? Encontramos profissionais"

**Corpo:**
- Saudacao personalizada
- Beneficio claro
- Como acessar
- CTA unico

---

## 7. Checklist de Consistência

### Antes de Publicar

- [ ] Cor primaria #FF6B00 usada corretamente
- [ ] Fonte Inter em todos os textos
- [ ] Tom amigavel e profissional
- [ ] CTAs claros e em laranja
- [ ] Logo bem posicionado
- [ ] Espacamentos consistentes
- [ ] Sem erros de ortografia
- [ ] Links funcionando
- [ ] Mobile responsivo

---

## 8. Contatos

| Tipo | Contato |
|------|---------|
| Suporte | contato@clickmont.com.br |
| Comercial | comercial@clickmont.com.br |
| WhatsApp | (11) 5128-0116 |
| CNPJ | 61.774.392/0001-30 |

---

**Proxima revisao:** 2026-07-01
