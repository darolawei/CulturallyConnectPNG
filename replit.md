# Workspace

## Overview

pnpm workspace monorepo using TypeScript. Each package manages its own dependencies.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **API framework**: Express 5
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle)
- **Frontend**: React + Vite + Tailwind CSS + Framer Motion
- **Offline**: Service Worker (public/sw.js) + PWA manifest
- **AI**: OpenAI integration via Replit AI proxy (`@workspace/integrations-openai-ai-server`, `@workspace/integrations-openai-ai-react`)

## Project: Culturally Connect PNG

A digital cultural vault for Papua New Guinea's 22 provinces.

### Features
- Login auth screen with tapa cloth motif styling
- Interactive SVG Map of all 22 provinces with hover colors and tooltips
- Provincial Dashboards with:
  - Vault statistics sidebar (story/herb/village counts)
  - Tubuna Stories tab — oral history library (GET/POST)
  - Olgeta Kru tab — traditional herbs & medicine (GET/POST)
  - Mama Graun tab — village origins & ethnography (GET/POST)
- Offline/Online indicator badge in header
- Service Worker for offline-first caching
- PWA manifest for installability

### Team Credits
- Technical Lead: Darol Awei (Architecture)
- Data & Design: Rallyian Salon (Analysis) & Abbigallie Pokolau (UI/UX)
- Business & Sustainability: Kalama Mago & Meggie Giror

## Structure

```text
artifacts-monorepo/
├── artifacts/              # Deployable applications
│   ├── api-server/         # Express API server
│   └── culturally-connect-png/  # React PWA frontend
├── lib/                    # Shared libraries
│   ├── api-spec/           # OpenAPI spec + Orval codegen config
│   ├── api-client-react/   # Generated React Query hooks
│   ├── api-zod/            # Generated Zod schemas from OpenAPI
│   └── db/                 # Drizzle ORM schema + DB connection
├── scripts/                # Utility scripts (single workspace package)
│   └── src/                # Individual .ts scripts
├── pnpm-workspace.yaml     # pnpm workspace
├── tsconfig.base.json      # Shared TS options
├── tsconfig.json           # Root TS project references
└── package.json            # Root package with hoisted devDeps
```

## Database Schema

Tables in PostgreSQL:
- `provinces` — 22 PNG provinces with flagColor, region, description, danceStyle
- `stories` — Tubuna oral histories (title, content, elderName, language, tags, audioUrl)
- `herbs` — Traditional medicine (name, localName, description, uses, preparation, warnings)
- `villages` — Village origins (name, clanOrigin, foundingStory, location, languages, traditions)

## API Endpoints

All under `/api`:
- `GET /healthz` — health check
- `GET /provinces` — all 22 provinces
- `GET /provinces/:id` — single province
- `GET /provinces/:id/summary` — cultural vault stats + recent stories
- `GET /stories?provinceId=X` — stories (optionally filtered)
- `POST /stories` — create new story
- `GET /stories/:id` — single story
- `GET /herbs?provinceId=X` — herbs (optionally filtered)
- `POST /herbs` — create new herb
- `GET /villages?provinceId=X` — villages (optionally filtered)
- `POST /villages` — create new village

## TypeScript & Composite Projects

Every package extends `tsconfig.base.json` which sets `composite: true`. The root `tsconfig.json` lists all packages as project references. This means:

- **Always typecheck from the root** — run `pnpm run typecheck`
- **`emitDeclarationOnly`** — we only emit `.d.ts` files during typecheck
- **Project references** — when package A depends on package B, A's `tsconfig.json` must list B in its `references` array

## Root Scripts

- `pnpm run build` — runs `typecheck` first, then recursively runs `build` in all packages that define it
- `pnpm run typecheck` — runs `tsc --build --emitDeclarationOnly` using project references

## Packages

### `artifacts/api-server` (`@workspace/api-server`)

Express 5 API server. Routes live in `src/routes/` and use `@workspace/api-zod` for validation and `@workspace/db` for persistence.

### `artifacts/culturally-connect-png` (`@workspace/culturally-connect-png`)

React + Vite PWA. Pages: Login, Map, Province. Components: Layout, SvgMap, TumbunaMan, RecordStoryModal, DancingBackground.

### Province Dashboard features:
- **DancingBackground** — CSS-animated SVG silhouettes of traditional PNG dancers in the background. 4 animation styles mapped to province: `highlands` (jumping Wigmen), `islands` (masked Dukduk sway), `sepik` (spirit flow), `southern` (canoe paddle). Province-to-style via `PROVINCE_DANCE` in `src/data/festivals.ts`.
- **Province Facts card** — shows capital, population, area (km²), languages from DB, and a dance style badge.
- **Singsing & Festivals tab** — 4th tab with province-specific cultural events data hardcoded in `src/data/festivals.ts`. Shows festival cards with name, month, type, and description. Also shows the dance style hero card.

The map (`SvgMap.tsx`) renders real PNG geography from `src/data/png-map.json` (~98 KB, 22 provinces). The JSON is pre-computed by `scripts/build-png-map.mjs`, which:
1. Reads geoBoundaries ADM1 GeoJSON (`scripts/png_provinces.geojson`).
2. Rewinds rings (geoBoundaries uses CW outer rings; d3-geo expects CCW — failing to rewind makes geoBounds return the whole globe, collapsing the projection).
3. Simplifies with `@turf/turf` (tolerance 0.01°), then rewinds again (simplification can re-flip ring order).
4. Projects via `geoMercator().fitSize([1000, 720], …)` and serializes paths with `geoPath().digits(1)`.

To regenerate: `node scripts/build-png-map.mjs`. The geoBoundaries `shapeName` → DB province id mapping lives at the top of that script.

### `lib/db` (`@workspace/db`)

Database layer using Drizzle ORM with PostgreSQL. Schema in `src/schema/provinces.ts`.

- `pnpm --filter @workspace/db run push` — sync schema to dev DB

### `lib/api-spec` (`@workspace/api-spec`)

OpenAPI 3.1 spec (`openapi.yaml`) and Orval config.

Run codegen: `pnpm --filter @workspace/api-spec run codegen`
