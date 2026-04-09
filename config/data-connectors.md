# Data connectors (planned / optional)

This app does **not** persist user sessions or AI transcripts by default. Use this note to wire **telemetry**, **rate limiting**, and **future product data** without coupling it to Next.js routes.

## Suggested connectors

| Connector | Role | Typical env var |
|-----------|------|-----------------|
| **PostgreSQL** (or Neon, Supabase) | Store `ai_generation_events` rows from [docs/telemetry.md](../docs/telemetry.md) | `DATABASE_URL` |
| **Redis** (e.g. Upstash) | Per-IP or per-user rate limits for `POST /api/generate` | `REDIS_URL` |
| **Object storage** (S3, R2) | Optional exports (audio stems, reports) — not implemented | `S3_*` |
| **Error tracking** | Sentry / Datadog for server exceptions | `SENTRY_DSN` |

## Integration pattern

1. Keep **secrets** in `.env.local` / Vercel env — never in `config/*.json`.
2. Add a small server-only module (e.g. `lib/db.ts`) when you introduce a real client; import it only from Route Handlers or Server Actions.
3. Log **hashes** and **outcome enums** first; add raw prompt storage only with explicit retention and redaction (see [docs/safety-and-privacy.md](../docs/safety-and-privacy.md)).

## Model settings

The default LLM id for `generateText` lives in **`config/model.json`** (`generateTextModel`). The API route reads this file at runtime (see `lib/model-config.ts`).
