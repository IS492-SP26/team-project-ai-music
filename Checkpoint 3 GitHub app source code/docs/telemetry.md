# Telemetry & observability plan

How Sonic Scholar **logs**, **persists generations in Supabase**, and how to **debug** tests and local runs.

---

## 1. Runtime logging (application)

**Where:** `app/api/generate/route.ts` (`try` / `catch`), `lib/log-generation.ts` (Supabase errors).

**Principles:**

- Structured fields where possible; avoid logging full request bodies in production.
- Never log **`SUPABASE_SERVICE_ROLE_KEY`**, `AI_GATEWAY_API_KEY`, cookies, or session tokens.

**Console (dev / server)**

| Message | Meaning |
|---------|---------|
| `[v0] AI output:` | Structured LLM result (trim noise in production). |
| `[generate route] AI generation failed:` | AI path threw; fallback may still return. |
| `[Supabase] generations row inserted ok` | Row written to `public.generations`. |
| `[Supabase] generations insert failed:` | DB/RLS/schema issue — see message, `code`, `details`. |
| `[Supabase] Insert skipped:` | Missing `NEXT_PUBLIC_SUPABASE_*` env. |
| RLS **42501** hint | Add `SUPABASE_SERVICE_ROLE_KEY` or run [`supabase-rls-and-grants.sql`](./supabase-rls-and-grants.sql). |

**Optional vendors:** Vercel Runtime Logs, Sentry (`SENTRY_DSN` in `.env.example`).

---

## 2. Database: `public.generations` (implemented)

**Purpose:** Audit what users submitted and what the model (or fallback) returned, for product analytics and support.

**When:** After each successful `POST /api/generate` response that includes `educational` — both **live AI** and **local fallback** paths call `insertGenerationServer`.

**Implementation:** `lib/log-generation.ts` → `getSupabaseServerClient()` in `lib/supabaseServer.ts` (prefers **`SUPABASE_SERVICE_ROLE_KEY`** so RLS does not block server inserts).

**Columns (logical)**

| Column | Content |
|--------|---------|
| `description` | User creative prompt (`prompt`) |
| `mood`, `vibe`, `instruments`, `bpm`, `excitement` | Settings |
| `melody_style`, `bassline_style`, `drum_pattern` | Settings |
| `track_vibe`, `rhythm_energy`, `harmony_structure`, `instrument_magic`, `pro_tip` | AI lesson sections (UI-aligned) |
| `model_explanation` | Legacy nullable column; app sends **`null`** (structured columns hold text) |
| `created_at` | Server timestamp (DB default) |

**Schema / RLS SQL:** [`supabase-generations.sql`](./supabase-generations.sql), [`supabase-rls-and-grants.sql`](./supabase-rls-and-grants.sql), [`supabase-fix-missing-lesson-columns.sql`](./supabase-fix-missing-lesson-columns.sql).

**Viewing data:** Supabase **Table Editor** → `generations`, or **SQL Editor** → `select * from public.generations order by created_at desc limit 50;`.

---

## 3. Debugging test runs and local CI

**Symptom:** Vitest logs `Unauthenticated request to AI Gateway` during `tests/api/generate.smoke.test.ts`.

**Meaning:** Expected when `AI_GATEWAY_API_KEY` is unset; the route **catches** the error and returns **200** with a **fallback** `educational` payload. The test asserts shape, not live AI.

**Supabase during tests:** If `.env.local` is not loaded in Vitest, you may see `[Supabase] Insert skipped`. That does not fail the smoke test. To test DB inserts in CI, use a dedicated Supabase project or mock the client — not required for the current smoke test.

**How to debug**

1. Run `npm run test` and confirm **1 passed** (or early exit on 403 setup branch).
2. For **real AI** locally, set `AI_GATEWAY_API_KEY` in `.env.local` and restart `npm run dev`.
3. For **Supabase inserts**, set `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, and preferably **`SUPABASE_SERVICE_ROLE_KEY`**; restart dev; trigger generate and watch the terminal for `[Supabase] generations row inserted ok`.
4. **403 / billing:** Deploy or adjust Vercel AI Gateway billing; inspect JSON `error`, `link`.

**Client-side:** Web Audio issues rarely appear in Vitest; use browser DevTools.

---

## Related

- [safety-and-privacy.md](./safety-and-privacy.md) — PII in `generations`, RLS  
- [architecture.md](./architecture.md) — data flow  
- [config/data-connectors.md](../config/data-connectors.md)  
