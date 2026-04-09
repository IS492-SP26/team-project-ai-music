# Critical user paths — Sonic Scholar

Five end-to-end flows that must remain stable for the product to deliver value.

## 1. Configure and generate a lesson

**Actor:** Learner / creator  
**Goal:** Get a personalized music-theory explanation for a chosen configuration.

**Steps:**

1. Open the home page.
2. Enter a **creative prompt** (required).
3. Choose **mood**, **vibe**, **instruments**, **BPM**, **excitement**, **melody**, **bassline**, and **drum pattern**.
4. Submit **Generate Music & Learn**.
5. Receive **educational** JSON (AI or fallback) and rendered breakdown UI.

**Success criteria:** Response includes `educational.summary` and related fields; settings echo what was submitted.

---

## 2. Recover when AI is unavailable

**Actor:** Same as above, with missing or misconfigured AI backend.

**Steps:**

1. Complete the same form as (1).
2. API fails (network, quota, gateway setup).

**Success criteria:** User still sees a **fallback** lesson (`warning` may be present); no uncaught client error; optional messaging for gateway setup (403) when applicable.

---

## 3. Preview option sounds before generating

**Actor:** Explorer tuning controls.

**Steps:**

1. Hover or click **headphone** preview next to a control (mood, instrument, BPM, etc.).
2. Hear a **short** demo (file from `public/assets/audio/` if present, else Web Audio fallback).

**Success criteria:** Audio plays without flooding the console for missing files; distinct gestures per option type.

---

## 4. Play the full 30s soundscape

**Actor:** User who already generated once.

**Steps:**

1. After a successful generate, use the main **Play** control on the audio player.
2. Hear a **multi-layer** preview (pads, lead, rhythm, FX) derived from **all** settings including prompt-derived seed.

**Success criteria:** Playback starts on user gesture; layers reflect mood/BPM/vibe/excitement; stopping works cleanly.

---

## 5. Understand gateway billing / setup (production)

**Actor:** Maintainer or first-time deployer on Vercel.

**Steps:**

1. Deploy without AI Gateway credits or card verification.
2. Trigger generate.

**Success criteria:** API returns **403** with `AI_GATEWAY_SETUP_REQUIRED` and a helpful `link`; UI can surface that state (existing error branch in `app/page.tsx`).
