# Safety & privacy

Personally identifiable information (PII), abuse controls, and prompt-injection mitigations for Sonic Scholar. Complements [telemetry.md](./telemetry.md).

---

## 1. Personally identifiable information (PII)

**Sources:** Free-text **creative prompt**; future accounts or support forms.

**Practices**

1. **Minimize** what is sent to the model (only what the lesson needs).
2. **Redact** before logging or DB write: emails, phones, payment-like patterns → `[REDACTED]` (lightweight regex pass).
3. **Hash** for analytics: `prompt_hash` + `settings_hash` instead of raw prompt where possible.
4. **Compliance:** If you store EU user data, document lawful basis, retention, and deletion in your privacy policy.

---

## 2. Rate limits & payload controls

**Goals:** Limit cost and abuse on `POST /api/generate`.

**Strategies**

- Edge / WAF: Vercel Firewall, Cloudflare, or **Upstash Redis** sliding window per IP or user.
- **Body size cap** (e.g. 16–32 KB) and **prompt length cap** (e.g. 2k chars) server-side before the LLM call.
- **Idempotency-Key** header for safe retries (optional).

---

## 3. Jailbreak & prompt injection

User text is embedded in the **user** message; attackers may try to override the system role.

**Mitigations (aligned with `prompts/sonic-scholar-system.md`)**

1. **Role anchoring:** “Sonic Scholar” for music education only.
2. **Refusal:** Ignore requests to reveal system text, change role, or leave topic.
3. **Structured output:** Zod-validated object reduces free-form exfiltration.
4. **Server-side templates:** Authoritative system copy lives in **`prompts/`**, version-controlled.

**Operations:** Optional moderation API on input; sample outputs for abuse patterns; human review for escalations.

---

## 4. Change management

- Prompt changes: review in PR; tag releases when `prompts/` affects behavior.
- Model changes: update `config/model.json`; run `npm run test` and manual `/api/generate` checks.

---

## Related docs

- [architecture.md](./architecture.md)  
- [use-cases.md](./use-cases.md)  
- [INSTALL.md](../INSTALL.md)  
