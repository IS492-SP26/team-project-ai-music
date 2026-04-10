# Data connectors — Supabase (implemented)

The app **persists each successful generation** to **Supabase Postgres** using the official SDK and server-side inserts.

## Supabase (active)

| Item | Detail |
|------|--------|
| **SDK** | `@supabase/supabase-js` |
| **Client (server)** | `lib/supabaseServer.ts` — `getSupabaseServerClient()` prefers **`SUPABASE_SERVICE_ROLE_KEY`**, then anon key |
| **Write path** | `lib/log-generation.ts` — `insertGenerationServer()` called from `POST /api/generate` after building the response |
| **Table** | `public.generations` |
| **Env vars** | `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY` (server only) |

**SQL (run in Supabase):**

- [`docs/supabase-generations.sql`](../docs/supabase-generations.sql) — create table, RLS, grants  
- [`docs/supabase-rls-and-grants.sql`](../docs/supabase-rls-and-grants.sql) — fix **42501** if using anon-only  
- [`docs/supabase-fix-missing-lesson-columns.sql`](../docs/supabase-fix-missing-lesson-columns.sql) — add lesson columns on older DBs  

See also [docs/telemetry.md](../docs/telemetry.md) for column semantics and [docs/safety-and-privacy.md](../docs/safety-and-privacy.md) for key handling.

## Other connectors (optional / future)

| Connector | Role | Typical env var |
|-----------|------|-----------------|
| **Redis** (e.g. Upstash) | Per-IP rate limits for `POST /api/generate` | `REDIS_URL` |
| **Object storage** (S3, R2) | Optional exports (stems, reports) | `S3_*` |
| **Error tracking** | Sentry / Datadog | `SENTRY_DSN` |

## Integration pattern

1. Keep **secrets** in `.env.local` / Vercel — never in `config/*.json` or client code.
2. **Service role** only in Route Handlers / server modules (`lib/supabaseServer.ts`).
3. Raw prompts live in **`generations.description`** — apply retention/redaction policies per your org (see telemetry and safety docs).

## Model settings

The default LLM id for `generateText` lives in **`config/model.json`** (`generateTextModel`). The API route reads it at runtime via `lib/model-config.ts`.
