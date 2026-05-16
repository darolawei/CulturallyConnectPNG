# Culturally Connect PNG — Local Setup Guide

A digital cultural vault for Papua New Guinea's 22 provinces, with animated dancing backgrounds, an AI Tumbuna Man chatbot, voice-recorded oral histories, and real geographic SVG map.

---

## Prerequisites

Install these before anything else:

| Tool | Version | Download |
|------|---------|----------|
| Node.js | 20 or 22 LTS | https://nodejs.org |
| pnpm | 9+ | `npm install -g pnpm` |
| PostgreSQL | 15 or 16 | https://postgresql.org/download |
| Git | any | https://git-scm.com |

---

## 1. Extract the Archive

Unzip `culturally-connect-png-source.tar.gz` into a folder:

```bash
tar -xzf culturally-connect-png-source.tar.gz
cd culturally-connect-png
```

On Windows you can use 7-Zip or Git Bash to extract the `.tar.gz`.

---

## 2. Create the Database

Open a terminal and log into PostgreSQL:

```bash
psql -U postgres
```

Inside psql, run:

```sql
CREATE USER ccpng WITH PASSWORD 'ccpng123';
CREATE DATABASE culturally_connect_png OWNER ccpng;
\q
```

---

## 3. Configure Environment Variables

Create a file called `.env` in the **project root** (same folder as `pnpm-workspace.yaml`):

```env
# PostgreSQL connection string — adjust host/user/password if needed
DATABASE_URL=postgresql://ccpng:ccpng123@localhost:5432/culturally_connect_png

# Express session secret — change to any long random string before going live
SESSION_SECRET=change-me-to-something-long-and-random

# OpenAI key — optional, only needed for voice transcription (Whisper)
# Without it, the app still works; voice recording will show an error,
# but stories can be typed manually.
OPENAI_API_KEY=sk-...your-key-here...

# Port for the API server
PORT=8081
```

---

## 4. Install Dependencies

From the project root:

```bash
pnpm install
```

This installs all packages for every workspace at once.

---

## 5. Push the Database Schema

```bash
pnpm --filter @workspace/db run push
```

Creates all tables (provinces, stories, herbs, villages, conversations, messages) and seeds all 22 province rows with their names, capitals, regions, languages, populations, and flag colours.

---

## 6. Run the App (Two Terminals)

You need **two terminals running at the same time**.

**Terminal A — API server:**

```bash
pnpm --filter @workspace/api-server run dev
```

Starts on http://localhost:8081

**Terminal B — React frontend:**

```bash
pnpm --filter @workspace/culturally-connect-png run dev
```

Starts on http://localhost:5173 (Vite will show the exact port).

Open **http://localhost:5173** in your browser.

---

## 7. Opening in IntelliJ IDEA

1. **File → Open** → select the project root folder.
2. IntelliJ detects it as a Node.js project automatically.
3. Go to **Run → Edit Configurations → + (Add New)**.

### Create an "API Server" run config

| Field | Value |
|-------|-------|
| Type | npm |
| Name | `API Server` |
| package.json | `artifacts/api-server/package.json` |
| Command | `run` |
| Scripts | `dev` |

### Create a "Frontend" run config

| Field | Value |
|-------|-------|
| Type | npm |
| Name | `Frontend` |
| package.json | `artifacts/culturally-connect-png/package.json` |
| Command | `run` |
| Scripts | `dev` |

### Run both at once

Create a **Compound** configuration:
- Run → Edit Configurations → **+** → **Compound**
- Name it `Culturally Connect PNG`
- Add both configs above
- Click **Run** — both servers start together

---

## 8. Default Login

| Field | Value |
|-------|-------|
| Elder / Scholar ID | `admin` |
| Secret Word | `admin123` |

To change credentials: `artifacts/api-server/src/routes/auth.ts`

---

## Project Structure

```
culturally-connect-png/
│
├── artifacts/
│   │
│   ├── api-server/                 Express 5 REST API  →  port 8080
│   │   └── src/
│   │       ├── routes/             All endpoints (provinces, stories, herbs, villages, openai)
│   │       └── index.ts            Server entry point
│   │
│   └── culturally-connect-png/     React 18 + Vite PWA  →  port 5173
│       └── src/
│           ├── components/
│           │   ├── DancingBackground.tsx   CSS-animated SVG dancer silhouettes
│           │   ├── SvgMap.tsx              Real PNG geographic map (22 provinces)
│           │   ├── TumbunaMan.tsx          🦅 AI chatbot widget
│           │   └── Layout.tsx              App shell / nav
│           ├── pages/
│           │   ├── Login.tsx
│           │   ├── Map.tsx                 Province selector map
│           │   └── Province.tsx            Province dashboard (stories/herbs/villages/festivals)
│           └── data/
│               ├── png-map.json            Pre-computed SVG paths for all 22 provinces (~98 KB)
│               └── festivals.ts            Cultural events & dance style data per province
│
├── lib/
│   ├── db/                         Drizzle ORM + PostgreSQL
│   │   └── src/schema/             provinces, stories, herbs, villages, conversations, messages
│   ├── api-spec/                   OpenAPI 3.1 spec (openapi.yaml)
│   └── api-client-react/           Auto-generated React Query hooks
│
├── scripts/
│   ├── png_provinces.geojson       Raw geoBoundaries ADM1 GeoJSON (3.8 MB, 22 features)
│   └── build-png-map.mjs           Converts GeoJSON → png-map.json (run with: node scripts/build-png-map.mjs)
│
├── .env                            ← You create this (see step 3 above)
├── SETUP.md                        This file
└── pnpm-workspace.yaml             Monorepo workspace config
```

---

## Features Overview

| Feature | How it works |
|---------|-------------|
| **Real geographic map** | SVG paths pre-computed from geoBoundaries GeoJSON via d3-geo |
| **Province dashboards** | Stories, herbs, villages, festivals — all stored in PostgreSQL |
| **Animated dance backgrounds** | Pure CSS keyframe SVG silhouettes, province-specific dance style |
| **Tumbuna Man AI** | OpenAI GPT-4o-mini chatbot fed context from the province DB |
| **Voice recording** | MediaRecorder API → OpenAI Whisper transcription → saved as story |
| **Offline-first PWA** | Vite PWA plugin + service worker caches all assets |

---

## Regenerating the Geographic Map

If you ever need to update the province shapes:

```bash
node scripts/build-png-map.mjs
```

Reads `scripts/png_provinces.geojson` → writes `artifacts/culturally-connect-png/src/data/png-map.json`.

---

## Troubleshooting

| Problem | Fix |
|---------|-----|
| `DATABASE_URL not found` | Check `.env` is in the root folder and both servers are restarted |
| Port 8081 in use | Set `PORT` in `.env` to a free port and update `apiTarget` in `artifacts/culturally-connect-png/vite.config.ts` |
| `pnpm: command not found` | Run `npm install -g pnpm` first |
| TypeScript errors in IntelliJ | Run `pnpm run typecheck` in terminal; restart IDE after |
| Voice transcription fails | Provide a valid `OPENAI_API_KEY` in `.env` |
| Map shows blank / green | Rebuild the map data: `node scripts/build-png-map.mjs` |
