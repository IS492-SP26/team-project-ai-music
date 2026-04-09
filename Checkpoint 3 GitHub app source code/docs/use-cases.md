# Critical user paths — Sonic Scholar

These flows define product value. Keep them stable in UI, API, and tests.

---

## 1. Configure and generate a lesson

**Actor:** Learner / creator  
**Goal:** Personalized music-theory explanation for the chosen configuration.

**Steps:** Open app → enter creative prompt → set mood, vibe, instruments, BPM, excitement, melody, bassline, drums → **Generate Music & Learn** → receive `educational` JSON (AI or fallback) and breakdown UI.

**Success criteria:** `educational.summary` and related fields present; `settings` echo submission.

---

## 2. Recover when AI is unavailable

**Actor:** Same as (1), with missing or misconfigured AI.

**Steps:** Same form → API fails (network, quota, unauthenticated gateway).

**Success criteria:** Fallback lesson (`warning` allowed); no uncaught client error; 403 setup path when applicable.

---

## 3. Preview option sounds before generating

**Actor:** User exploring controls.

**Steps:** Use headphone preview on a control → short demo (file from `public/assets/audio/` or Web Audio fallback).

**Success criteria:** Audio plays; no console spam on missing files.

---

## 4. Play the full soundscape

**Actor:** User after a successful generate.

**Steps:** Use main **Play** on the audio player → multi-layer preview from settings + prompt-derived seed.

**Success criteria:** Playback on user gesture; stop works; layers reflect mood/BPM/vibe/excitement.

---

## 5. Gateway billing / setup (production)

**Actor:** Maintainer on Vercel.

**Steps:** Deploy without Gateway billing verification → trigger generate.

**Success criteria:** **403** with `AI_GATEWAY_SETUP_REQUIRED` and `link`; UI can show error state (`app/page.tsx`).

---

## Automated tests (minimal coverage)

| Use case | How we test | File |
|----------|-------------|------|
| **1 + 2** (happy path + fallback) | `POST` handler with valid JSON; assert JSON shape and `educational` fields; allow **403** for gateway setup | [`tests/api/generate.smoke.test.ts`](../tests/api/generate.smoke.test.ts) |

**Run:** `npm run test` from the repository root.

**Not covered in-repo (add when needed):** Playwright/Cypress e2e for (3) and (4) (Web Audio + gestures); contract tests against a mocked LLM.

**Debugging failures:** See [telemetry.md](./telemetry.md#debugging-test-runs-and-local-ci).
