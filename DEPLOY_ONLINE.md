# Launch Culturally Connect PNG Online

This deployment uses:

- Neon for PostgreSQL
- Render for the live web service
- One public URL for both the React app and `/api/*`

## 1. Create The Database

1. Create a Neon project.
2. Copy the pooled PostgreSQL connection string.
3. Use that value as `DATABASE_URL` in Render.

The connection string should look like:

```text
postgresql://USER:PASSWORD@HOST/DB?sslmode=require
```

## 2. Push To GitHub

Do not commit `.env`.

The `.gitignore` keeps the old long raw videos out of the online build. Keep these production media files:

- `dance-short.mp4`
- `public/media/provinces/national-capital/VID-20260515-WA0009.mp4`
- the National Capital JPG images

## 3. Deploy On Render

1. In Render, create a new Blueprint from the GitHub repo.
2. Render will read `render.yaml`.
3. Add these secret environment variables:

```text
DATABASE_URL=your_neon_connection_string
GEMINI_API_KEY=your_gemini_key
```

The blueprint already sets:

```text
AI_PROVIDER=gemini
GEMINI_MODEL=gemini-2.5-flash
PORT=10000
```

## 4. Build Behavior

Render runs:

```text
pnpm run build:deploy
```

That command:

1. Pushes the database schema.
2. Seeds PNG provinces.
3. Imports starter cultural records.
4. Builds the React frontend.
5. Builds the API server.

Then Render starts:

```text
pnpm run start
```

## 5. After Launch

Open the Render URL. The same domain serves:

- `/` for the app
- `/api/*` for the backend
