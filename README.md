# SkyFlux

Visualizador espacial 3D em tempo quase real, feito para portfolio.

SkyFlux roda 100% no cliente (sem backend) e combina:
- Globo 3D interativo (Three.js via React Three Fiber)
- Satelites baseados em TLE com `satellite.js`
- Lancamentos SpaceX com trajetoria animada (GSAP)
- NASA APOD com cache persistente

## Demo Features

- Renderizacao de 500+ satelites com LOD (`InstancedMesh` + `Points`)
- Polling adaptativo com Page Visibility API
- Cache com IndexedDB + fallback para localStorage
- Tratamento de erro para CORS, rede e rate limit
- UI responsiva: celular, tablet, desktop e ultrawide

## Stack

- React + Vite
- Tailwind CSS
- Three.js (`@react-three/fiber`, `@react-three/drei`)
- GSAP
- `satellite.js`
- `idb` (IndexedDB)
- Vitest + Testing Library

## APIs

- CelesTrak TLE: `https://celestrak.org/NORAD/elements/gp.php?GROUP=starlink&FORMAT=tle`
- SpaceX v4: `https://api.spacexdata.com/v4/launches` e `https://api.spacexdata.com/v4/launchpads`
- NASA APOD: `https://api.nasa.gov/planetary/apod`

## Setup (PT-BR)

### 1) Instalar dependencias

```bash
npm install
```

### 2) Configurar ambiente local

Crie `.env.local` com base no `.env.example`.

Linux/macOS:
```bash
cp .env.example .env.local
```

Windows PowerShell:
```powershell
Copy-Item .env.example .env.local
```

### 3) Rodar projeto

```bash
npm run dev
```

### 4) Comandos uteis

```bash
npm run lint
npm run test
npm run build
npm run preview
```

## Variaveis de ambiente

- `VITE_NASA_API_KEY` (opcional)
  - padrao: `DEMO_KEY`
  - recomendado para desenvolvimento local

## Seguranca de chave (importante)

Como nao ha backend, qualquer chave enviada ao front fica exposta no navegador.

- Use chaves restritas e com baixa permissao
- Em producao, prefira mover chamadas sensiveis para serverless/proxy reverso
- Para MVP/portfolio, `DEMO_KEY` e suficiente

## Cache e Polling

- TLE: TTL 15 min, polling 15 min (foreground) / 30 min (background)
- Launches: TTL 2 min, polling 90s (foreground) / 180s (background)
- APOD: TTL 24h

## Fallbacks

- TLE indisponivel/CORS: modo demo com TLE mock
- SpaceX indisponivel: lancamentos mock com animacao ativa
- APOD indisponivel/rate limit: conteudo fallback com aviso na interface

## Responsividade validada

Viewports-alvo:
- `320x568`, `360x800`, `390x844`, `412x915`
- `768x1024`, `820x1180`
- `1024x768`, `1366x768`, `1440x900`, `1920x1080`, `2560x1440`

Regras UX:
- Sem scroll horizontal
- Touch targets >= 44px
- Painel mobile/tablet colapsavel
- Sidebar fixa em desktop

## EN Quick Summary

SkyFlux is a client-only near real-time 3D space activity viewer.

- 500+ satellite rendering with LOD
- SpaceX launch paths with GSAP animations
- NASA APOD with 24h cache
- IndexedDB caching + retry/backoff + stale fallback
- Responsive UX from small phones to ultrawide

Run:
```bash
npm install
npm run dev
```
