# Safety & Privacy

This doc explains how Sonic Scholar handles user data, Supabase storage, and protection against abuse or prompt injection. It works alongside `telemetry.md`.

---

## 1. Personally Identifiable Information (PII)

**Sources:**
- User creative prompts (stored as `generations.description`)
- Future features like accounts or support forms

**Practices:**

- Only send the **minimum data needed** to the model  
- Treat the `generations` table as **sensitive** (it stores prompts and outputs)  
- Restrict access using **RLS (Row Level Security)** and least-privilege keys  
- Redact sensitive info (emails, phone numbers, etc.) → `[REDACTED]` if logging externally  
- If storing EU data:
  - Define data usage in a privacy policy  
  - Support **data deletion/export requests**

---

## 2. Supabase Keys & Security

| Key | Where | Role |
|-----|------|------|
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Frontend | Safe for browser use, controlled by RLS |
| `SUPABASE_SERVICE_ROLE_KEY` | Server only | Full access (bypasses RLS) — keep private |

**Important:**

- Never expose the service role key in client code or GitHub  
- Never prefix it with `NEXT_PUBLIC_`  
- Store it in `.env.local` or deployment environment variables  

**Recommended:**
- Use the **service role key** for server-side inserts (`insertGenerationServer`)  
- If using only the anon key, make sure proper RLS policies are set up  

---

## 3. Rate Limits & Abuse Prevention

**Goal:** Prevent spam and control costs

**Strategies:**

- Add rate limiting (per IP/user) using:
  - Vercel Firewall  
  - Cloudflare  
  - Upstash Redis  
- Limit request body size and prompt length  
- (Optional) Use an `Idempotency-Key` header for retries  
- Optionally limit how many rows a user/IP can insert into `generations`

---

## 4. Prompt Injection & Jailbreaks

User input is passed into the model, so it can be abused.

**Protections:**

- Keep a strict system role (Sonic Scholar = music education only)  
- Ignore requests to:
  - Reveal system prompts  
  - Change roles  
  - Go off-topic  
- Use structured outputs (Zod validation) instead of free text  
- Store system prompts in `prompts/` (server-side, version-controlled)

**Note:**
- Outputs are stored in `generations`, so monitor for abuse if reused elsewhere  

---

## 5. Change Management

- **Prompt changes:** Review in PRs and track updates in `prompts/`  
- **Model changes:** Update `config/model.json` and test  
- **Database changes:** Update Supabase schema and related files (`log-generation.ts`, SQL docs)

---

## Related Docs

- `architecture.md`  
- `use-cases.md`  
- `INSTALL.md`
