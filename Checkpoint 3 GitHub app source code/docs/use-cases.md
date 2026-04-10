# Critical User Paths — Sonic Scholar

These are the main flows that actually matter for the product. If these break, the app basically doesn’t work. So anything we change in the UI, API, or database should not mess these up.

---

## 1. Configure and Generate a Lesson

**Who:** User (learner / creator)  
**Goal:** Get a personalized music theory explanation based on their inputs  

**Flow:**
- Open the app  
- Enter a creative prompt  
- Choose settings (mood, vibe, instruments, BPM, excitement, melody, bassline, drums)  
- Click **Generate Music & Learn**  
- Get a lesson (`educational` JSON) and see it in the UI  

**What success looks like:**
- `educational.summary` and other fields show up  
- The settings in the response match what the user selected  

---

## 2. Handle AI Failures (Fallback)

**Who:** Same user, but AI isn’t working  

**Flow:**
- User fills out the form like normal  
- API call fails (bad key, network issue, quota, etc.)  

**What success looks like:**
- User still gets a fallback lesson  
- App doesn’t crash  
- A warning is okay  
- If needed, show a 403 setup error  

---

## 3. Preview Sounds Before Generating

**Who:** User exploring options  

**Flow:**
- Click headphone preview on a setting  
- Play a short demo sound  

**What success looks like:**
- Audio plays  
- No console errors if a file is missing  
- Uses files from `public/assets/audio/` or fallback audio  

---

## 4. Play the Full Soundscape

**Who:** User after generating a lesson  

**Flow:**
- Click the main **Play** button  
- Hear a layered sound based on their inputs  

**What success looks like:**
- Audio plays when user clicks  
- Stop button works  
- Sound reflects mood, BPM, vibe, etc.  

---

## 5. Gateway Setup / Billing (Production)

**Who:** Developer / maintainer  

**Flow:**
- Deploy app without setting up AI Gateway billing  
- Try to generate  

**What success looks like:**
- App returns a **403 error**  
- Error includes `AI_GATEWAY_SETUP_REQUIRED` and a link  
- UI shows a clear error state  

---

## 6. Save Generations to Supabase

**Who:** Any user who generates a lesson  

**Goal:** Save one row per generation in the database  

**Flow:**
- After generating (AI or fallback), server runs `insertGenerationServer`  
- Data is saved in `public.generations`  

**What success looks like:**
- New row appears in Supabase Table Editor  
- Terminal shows:

**If something breaks:** You’ll see:

[Supabase] generations insert failed

- Usually means:
- Missing `SUPABASE_SERVICE_ROLE_KEY`  
- RLS not set up properly  
- Check `INSTALL.md` for fixes  

---

## Tests (Basic Coverage)

| Use case | How we test | File |
|----------|------------|------|
| 1 + 2 (normal + fallback) | Send POST request, check response structure, allow 403 if needed | `tests/api/generate.smoke.test.ts` |

**Run tests:**

npm run test


---

## Not Covered (Yet)

- End-to-end tests (Playwright/Cypress) for audio features  
- Supabase integration tests (could mock client)  
- Mocked LLM contract tests  

---

## Debugging

If something fails, check:
- `telemetry.md` (especially debugging section)  
- Server logs  
- Supabase logs  

Most issues come down to:
- Missing environment variables  
- API keys not set  
- RLS blocking database inserts  
