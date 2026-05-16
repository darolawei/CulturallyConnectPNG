# Deploy To Vercel (Public URL)

## 1) Frontend deploy

From this folder:

```powershell
cd artifacts/culturally-connect-png
pnpm run build
```

Then deploy with Vercel (CLI or dashboard).

If using CLI:

```powershell
vercel
vercel --prod
```

Use these settings:

- Framework: `Vite`
- Build Command: `pnpm run build`
- Output Directory: `dist/public`
- Root Directory: `artifacts/culturally-connect-png` (if deploying from repo root)

`vercel.json` is already included for SPA route handling.

## 2) API requirement (important)

This app calls `/api/*`.  
A static frontend deploy needs a live backend API.

Options:

1. Deploy your API server separately and expose a public base URL.
2. Put API and frontend behind the same domain (recommended), with `/api` routed to backend.

Without a live backend, pages load but data actions will fail.
