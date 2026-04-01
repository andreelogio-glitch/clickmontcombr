# Assets - ClickMont

Estrutura de arquivos e organizacao de assets da marca ClickMont.

## Estrutura de Diretórios

```
assets/
├── banners/
│   └── 20260401-clickmont-social/
│       ├── banner-facebook-cover-820x312.html
│       ├── banner-facebook-cover-820x312.png
│       ├── banner-instagram-post-1080x1080.html
│       ├── banner-instagram-post-1080x1080.png
│       ├── banner-instagram-story-1080x1920.html
│       ├── banner-instagram-story-1080x1920.png
│       ├── banner-twitter-header-1500x500.html
│       ├── banner-twitter-header-1500x500.png
│       ├── banner-website-hero-1500x600.html
│       └── banner-website-hero-1500x600.png
│
├── design-tokens/
│   ├── design-tokens.json
│   └── design-tokens.css
│
├── logo/
│   ├── README.md (este arquivo)
│   ├── clickmont-logo-horizontal.svg
│   ├── clickmont-logo-vertical.svg
│   ├── clickmont-icon.png
│   ├── clickmont-favicon.ico
│   ├── clickmont-pwa-192.png
│   └── clickmont-pwa-512.png
│
├── icons/
│   ├── README.md
│   └── (icones customizados da marca)
│
└── photos/
    ├── README.md
    └── (fotos para marketing)
```

## Tamanhos de Banner

| Plataforma | Formato | Tamanho (px) | Aspect Ratio |
|------------|---------|---------------|--------------|
| Instagram Post | Feed | 1080x1080 | 1:1 |
| Instagram Story | Stories | 1080x1920 | 9:16 |
| Facebook Cover | Capa | 820x312 | ~2.6:1 |
| Twitter/X Header | Header | 1500x500 | 3:1 |
| LinkedIn Banner | Personal | 1584x396 | 4:1 |
| Website Hero | Hero | 1500x600 | ~2.5:1 |
| Google Display | Med Rectangle | 300x250 | 6:5 |
| Google Display | Leaderboard | 728x90 | 8:1 |

## Cores da Marca

| Nome | Hex | RGB |
|------|-----|-----|
| Laranja Primary | #FF6B00 | rgb(255, 107, 0) |
| Laranja Light | #FF8C00 | rgb(255, 140, 0) |
| Laranja Dark | #E65C00 | rgb(230, 92, 0) |
| Success | #22C55E | rgb(34, 197, 94) |
| Warning | #F59E0B | rgb(245, 158, 11) |
| Error | #EF4444 | rgb(239, 68, 68) |

## Convenções de Nomenclatura

### Banners
```
{YYMMDD}-{campanha}-{tipo}-{tamanho}.{ext}
Exemplo: 20260401-clickmont-social-instagram-post-1080x1080.png
```

### Logos
```
{marca}-{variante}-{cor}-{tamanho}.{ext}
Exemplo: clickmont-logo-horizontal-white-400.png
```

### Icones
```
{icone}-{tamanho}.{ext}
Exemplo: icon-check-24.png
```

## Como Adicionar Novos Assets

1. Coloque o arquivo no diretorio correto
2. Atualize este README se adicionar nova estrutura
3. Commit no Git com descricao clara

## Design Tokens

Os tokens de design estao disponiveis em:
- JSON: `assets/design-tokens/design-tokens.json`
- CSS: `assets/design-tokens/design-tokens.css`

Para sincronizar com o CSS do projeto, copie o conteudo de `design-tokens.css` para `src/index.css` na secao de variaveis.

## Contato

Para duvidas sobre assets, consulte `docs/brand-guidelines.md` ou entre em contato com o time de marketing.
