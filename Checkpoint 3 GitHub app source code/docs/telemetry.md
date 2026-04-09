# Telemetry & observability plan

How we intend to **log**, **persist metadata**, and **debug** Sonic Scholar in production and in tests. Implementation is **optional** until you wire a vendor or database (see [config/data-connectors.md](../config/data-connectors.md)).

---

## 1. Runtime logging (application)

**Where:** `app/api/generate/route.ts` (`try` / `catch`), future middleware.

**Principles:**

- Structured fields, not raw request bodies.
- Never log secrets (`AI_GATEWAY_API_KEY`, cookies, tokens).

**Suggested log fields**

| Field | Example | Notes |
|-------|---------|--------|
| `route` | `/api/generate` | |
| `outcome` | `success` / `fallback` / `gateway_403` / `error` | Aligns with DB enum below |
| `modelId` | from `config/model.json` | |
| `durationMs` | number | Wall time for LLM call |
| `requestId` | header or generated uuid | Correlate with edge logs |
| `errorClass` | e.g. `AI_GATEWAY_UNAUTHENTICATED` | Sanitized; no stack in user-facing responses |

**Destinations:** Vercel Runtime Logs, Axiom, Datadog, or Sentry (see `.env.example` placeholders).

---

## 2. Database telemetry (planned)

**Purpose:** Audit volume, latency, cost, and failure modes without storing full prompts by default.

**Table: `ai_generation_events`**

| Column | Type | Notes |
|--------|------|--------|
| `id` | uuid | PK |
| `created_at` | timestamptz | |
| `request_id` | text | Correlation |
| `model` | text | e.g. `openai/gpt-4o-mini` |
| `prompt_hash` | text | SHA-256 of normalized user prompt |
| `settings_hash` | text | Hash of canonical settings JSON |
| `latency_ms` | int | |
| `token_usage` | jsonb | If provider returns usage |
| `outcome` | text | `success`, `fallback`, `gateway_403`, `error` |
| `error_class` | text | Nullable |

**Retention:** e.g. 90 days for metadata; no secrets. Optional truncated/redacted prompt excerpts only with policy (see [safety-and-privacy.md](./safety-and-privacy.md)).

---

## 3. Debugging test runs and local CI

**Symptom:** Vitest logs `Unauthenticated request to AI Gateway` during `tests/api/generate.smoke.test.ts`.

**Meaning:** Expected when `AI_GATEWAY_API_KEY` is unset; the route **catches** the error and returns **200** with a **fallback** `educational` payload. The test asserts shape, not live AI.

**How to debug**

1. Run `npm run test` and confirm **1 passed** (or early exit on 403 setup branch).
2. To exercise **real** AI locally, set `AI_GATEWAY_API_KEY` in `.env.local` and re-run; watch server logs for `[v0] AI output` (trim in production).
3. To debug **403 / billing**, temporarily assert `res.status === 403` in a branch test or deploy to a project without card verification and inspect JSON `error`, `link`.
4. Correlate with **Vercel** function logs using `requestId` once you add header propagation.

**Client-side:** Web Audio issues rarely appear in Vitest; use browser DevTools → Console + Performance; document repro steps in issues.

---

## Related

- [safety-and-privacy.md](./safety-and-privacy.md) — PII and rate limits  
- [architecture.md](./architecture.md) — data flow  
