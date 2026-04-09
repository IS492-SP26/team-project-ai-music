# Governance — Observability, data, and safety

This document describes **how to operate Sonic Scholar in production**: telemetry, PII handling, abuse controls, and prompt hardening. Implementation here is **planning + patterns**; wire concrete vendors (DB, logging, WAF) to match your org.

---

## 1. Telemetry and logging

### 1.1 Error logging

**Goal:** Capture server-side failures (AI, parsing, infra) with enough context to debug without storing raw user prompts in clear text by default.

**Plan:**

- Use a structured logger (e.g. **Vercel Runtime Logs**, **Axiom**, **Datadog**, or **Sentry**) from `app/api/generate/route.ts` `catch` blocks.
- Log fields: `route`, `errorCode`, `errorMessage` (sanitized), `requestId`, `durationMs`, `modelId`, `httpStatus`.
- Avoid `console.log` of full request bodies in production.

### 1.2 AI response metadata (database)

**Goal:** Audit usage, quality, and cost; support replay analysis without storing full completions indefinitely.

**Plan — suggested table `ai_generation_events`:**

| Column | Type | Notes |
|--------|------|--------|
| `id` | uuid | Primary key |
| `created_at` | timestamptz | Server time |
| `request_id` | text | Correlation id from edge / header |
| `model` | text | e.g. `openai/gpt-4o-mini` |
| `prompt_hash` | text | SHA-256 of normalized user prompt (not raw text) |
| `settings_hash` | text | Hash of sorted settings JSON |
| `latency_ms` | int | Round-trip model time |
| `token_usage` | jsonb | If provider returns usage |
| `outcome` | text | `success`, `fallback`, `gateway_403`, `error` |
| `error_class` | text | Nullable |

**Retention:** e.g. 90 days for metadata; **never** store secrets.

**PII note:** If you must store prompt excerpts for support, store **truncated** + **redacted** text (see §2).

---

## 2. PII masking strategies

User **creative prompt** and future **account** fields may contain names, locations, or contact info.

**Strategies:**

1. **Minimize collection:** Only send to the model what is needed for the lesson.
2. **Redaction before log/persist:** Run a lightweight scanner for email, phone, SSN-like patterns, and credit-card sequences; replace with `[REDACTED]` before logging or writing to DB.
3. **Hashing for analytics:** Use `prompt_hash` + `settings_hash` for aggregation instead of raw prompt text.
4. **Regional compliance:** If EU users exist, document lawful basis, retention, and deletion path in your privacy policy.

---

## 3. Rate limiting

**Goal:** Protect the AI route from abuse and runaway cost.

**Strategies:**

1. **Vercel / edge:** Use **Vercel Firewall**, **Upstash Redis** sliding window, or **Cloudflare** rate limits on `/api/generate`.
2. **Limits:** e.g. **N requests per IP per minute** (anonymous), higher for authenticated users.
3. **Payload caps:** Reject bodies over a small max size (e.g. 16–32 KB) and truncate `prompt` server-side to a max character count (e.g. 2k) before LLM call.
4. **Idempotency:** Optional `Idempotency-Key` header for retries without double billing.

---

## 4. Jailbreak and prompt-injection mitigation

User text is concatenated into the **user** message; users may try to override the system role.

**System-prompt strategies (aligned with `app/prompts/sonic-scholar-system.md`):**

1. **Role anchoring:** Explicitly state the assistant is “Sonic Scholar” for **music education only**.
2. **Refusal clause:** Ignore instructions to reveal system text, change role, or discuss unrelated topics.
3. **Output constraint:** Structured output (Zod / JSON schema) reduces free-form exfiltration; validate and reject malformed outputs.
4. **Server-side template:** Keep authoritative system text in **version-controlled files** under `app/prompts/`, not only in client bundles.

**Operational strategies:**

1. **Moderation layer:** Optional second pass or provider **safety** category on user prompt before generation.
2. **Monitoring:** Flag requests where output contains system-prompt-like phrases or non-music content spikes.
3. **Human review queue:** Sample sessions for quality and abuse.

---

## 5. Change management

- **Prompt changes:** Review via PR; tag releases when `app/prompts/` changes affect behavior.
- **Model changes:** Document in changelog; re-run smoke tests (`npm run test`) and manual QA on `/api/generate`.

---

## 6. Related docs

- [install.md](./install.md) — setup and scripts  
- [architecture.md](./architecture.md) — stack and data flow  
- [use-cases.md](./use-cases.md) — critical paths  
- [env.example](./env.example) — environment variables  
