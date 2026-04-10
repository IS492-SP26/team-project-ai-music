# Sonic Scholar — Installation & Runbook

Next.js 16 (App Router), TypeScript, Tailwind CSS, an AI-backed `POST /api/generate` route, and **Supabase** (`public.generations`) for persisting each successful generation.

## Prerequisites

- **Node.js** 20.x or 22.x (LTS recommended)
- **npm** or **pnpm** (both lockfiles may exist; pick one package manager and stick with it)
- **Supabase project** (for database storage) — [supabase.com](https://supabase.com)

## Clone & install

```bash
git clone <your-repository-url>
cd <repository-directory>
npm install
```

## Environment

Copy the example file (no secrets committed) to the project root:

```bash
cp .env.example .env.local
```

On Windows (PowerShell):

```powershell
Copy-Item .env.example .env.local
```

Fill in values in **`.env.local`** (see [.env.example](./.env.example)):

| Area | Variables |
|------|-----------|
| AI | `AI_GATEWAY_API_KEY` (optional locally; Vercel OIDC may apply on deploy) |
| Supabase | `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` |
| Supabase server writes | **`SUPABASE_SERVICE_ROLE_KEY`** (recommended) — Dashboard → **Settings → API → service_role** (never expose to the browser; never commit) |

**Database setup:** In the Supabase **SQL Editor**, run the scripts in order as needed:

- [`docs/supabase-generations.sql`](./docs/supabase-generations.sql) — create `generations` + RLS + grants  
- [`docs/supabase-fix-missing-lesson-columns.sql`](./docs/supabase-fix-missing-lesson-columns.sql) — add lesson columns if upgrading an older table  
- [`docs/supabase-rls-and-grants.sql`](./docs/supabase-rls-and-grants.sql) — if inserts fail with RLS **42501** and you only use the anon key  

After changing `.env.local`, **restart** the dev server so Next.js picks up env vars.

## Run scripts (`package.json`)

| Command | Description |
|--------|-------------|
| `npm run dev` | Development server (Turbopack) |
| `npm run build` | Production build |
| `npm run start` | Serve production build (after `build`) |
| `npm run lint` | ESLint (`eslint .`) |
| `npm run test` | Vitest — minimal tests under `tests/` |
| `npm run test:watch` | Vitest watch mode |

If `lint` fails with “eslint not recognized”, install ESLint as a dev dependency or run `npx eslint .`.

## Run locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Production

```bash
npm run build
npm run start
```

## Deploy (Vercel)

1. Connect the repository.
2. Set environment variables to match `.env.example` (including Supabase and, for reliable inserts, **`SUPABASE_SERVICE_ROLE_KEY`**).
3. Default build: `next build`.

## Verify tests

```bash
npm run test
```

## Repository layout (high level)

| Path | Purpose |
|------|---------|
| `app/` | Next.js routes and UI entry |
| `prompts/` | System and user LLM templates |
| `config/` | Model id (`model.json`) and data-connector notes |
| `lib/` | Audio, prompts, model config, **Supabase server client**, **generation logging** |
| `docs/` | Architecture, use cases, telemetry, safety, **Supabase SQL** |
| `tests/` | Critical-path unit/smoke tests |

## Documentation

- [docs/architecture.md](./docs/architecture.md) — stack, diagram, data flow (including Supabase)  
- [docs/use-cases.md](./docs/use-cases.md) — user paths and test mapping  
- [docs/telemetry.md](./docs/telemetry.md) — logging, `generations` table, debugging tests  
- [docs/safety-and-privacy.md](./docs/safety-and-privacy.md) — PII, RLS, rate limits, abuse  

## Troubleshooting

- **AI / Gateway errors:** Configure billing or `AI_GATEWAY_API_KEY` per [Vercel AI Gateway](https://vercel.com/docs/ai-gateway); the API may return a local fallback when the provider fails (except some 403 setup cases).
- **Supabase insert errors:** Check the terminal for `[Supabase] generations insert failed`. Common fixes: add **`SUPABASE_SERVICE_ROLE_KEY`**, or run [`docs/supabase-rls-and-grants.sql`](./docs/supabase-rls-and-grants.sql), or ensure lesson columns exist ([`docs/supabase-fix-missing-lesson-columns.sql`](./docs/supabase-fix-missing-lesson-columns.sql)).
- **Silent audio previews:** Add mapped samples under `public/assets/audio/` (see `lib/audio-sample-map.ts`) or use the Web Audio fallback.
