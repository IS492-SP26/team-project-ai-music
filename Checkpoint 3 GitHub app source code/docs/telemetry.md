# Telemetry & Observability Plan

This explains how Sonic Scholar logs data, saves generations in Supabase, and how to debug issues when running locally or testing.

---

## 1. Runtime Logging (Application)

**Where logging happens:**
- `app/api/generate/route.ts` (inside try/catch)
- `lib/log-generation.ts` (Supabase insert errors)

**Basic rules:**

- Keep logs simple and readable  
- Do not log full request bodies in production  
- Never log sensitive info like:
  - `SUPABASE_SERVICE_ROLE_KEY`
  - `AI_GATEWAY_API_KEY`
  - cookies or session tokens  

**Common console logs:**

| Message | Meaning |
|--------|--------|
| `[v0] AI output:` | AI result (can be messy, mostly for debugging) |
| `[generate route] AI generation failed:` | AI request failed, fallback might still work |
| `[Supabase] generations row inserted ok` | Data saved successfully |
| `[Supabase] generations insert failed:` | Problem with database, RLS, or schema |
| `[Supabase] Insert skipped:` | Missing Supabase environment variables |
| RLS **42501** | Permission issue, usually fix by using service role or running SQL setup |

**Optional tools:**
- Vercel logs  
- Sentry (if configured)

---

## 2. Database: `public.generations`

**Why we store this:**
We save what the user entered and what the AI returned so we can debug problems and understand usage.

**When data is saved:**
- After every successful `POST /api/generate`
- Works for both real AI responses and fallback responses  

**How it works:**
- `lib/log-generation.ts` handles inserts  
- Uses `getSupabaseServerClient()` from `lib/supabaseServer.ts`  
- Best practice is to use `SUPABASE_SERVICE_ROLE_KEY` so inserts are not blocked  

**Main columns:**

| Column | What it stores |
|--------|---------------|
| `description` | User prompt |
| `mood`, `vibe`, `instruments`, `bpm`, `excitement` | User settings |
| `melody_style`, `bassline_style`, `drum_pattern` | More settings |
| `track_vibe`, `rhythm_energy`, `harmony_structure`, `instrument_magic`, `pro_tip` | AI-generated lesson content |
| `model_explanation` | Not used (set to null) |
| `created_at` | Timestamp |

**SQL files:**
- `supabase-generations.sql`  
- `supabase-rls-and-grants.sql`  
- `supabase-fix-missing-lesson-columns.sql`  

**How to view data:**
- Supabase Table Editor → `generations`  
- Or run:
  ```sql
  select * from public.generations order by created_at desc limit 50;

  3. Debugging Tests and Local Runs

Common issue:

Unauthenticated request to AI Gateway

What it means:

AI_GATEWAY_API_KEY is not set
This is expected during tests
The app catches the error and returns a fallback response
Tests only check the structure, not real AI output

Supabase during tests:

You might see:

[Supabase] Insert skipped
This is fine and does not fail the test
How to Debug

Run:

npm run test

Make sure tests pass

To use real AI locally:
Add AI_GATEWAY_API_KEY to .env.local
Restart the dev server
To test Supabase inserts:
Set:
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY (recommended)
Restart server
Trigger a generate request

Look for:

[Supabase] generations row inserted ok
If you get a 403 error:
Check Vercel AI Gateway billing
Look at the error response
Notes
Web Audio issues will not show up in tests, use browser DevTools
For database testing in CI, use a test Supabase project or mock the client
