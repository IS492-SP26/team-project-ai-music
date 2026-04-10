# Beat AI — Installation & Runbook

This project uses Next.js 16 (App Router), TypeScript, Tailwind CSS, an AI-powered `POST /api/generate` route, and Supabase to store generated results in `public.generations`.

---

## Prerequisites

Make sure you have:

- Node.js (version 20 or 22 recommended)
- npm or pnpm (just pick one and stick with it)
- A Supabase project (https://supabase.com)

---

## Clone and Install

Run the following in your terminal:

```bash
git clone <your-repository-url>
cd <repository-directory>
npm install
```

---

## Set Up Environment Variables

Copy the example file:

```bash
cp .env.example .env.local
```

On Windows (PowerShell):

```powershell
Copy-Item .env.example .env.local
```

Then open `.env.local` and fill in the values.

### What you need to add:

- AI (optional for local testing):
  - `AI_GATEWAY_API_KEY`

- Supabase (required):
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`

- Supabase server access (recommended):
  - `SUPABASE_SERVICE_ROLE_KEY`
  - Find this in Supabase → Settings → API → service_role  
  - Do NOT expose this key in the frontend or commit it to GitHub

After editing `.env.local`, restart your dev server.

---

## Database Setup (Supabase)

Go to the Supabase SQL Editor and run these files if needed:

- `docs/supabase-generations.sql`  
  Creates the `generations` table and sets up permissions  

- `docs/supabase-fix-missing-lesson-columns.sql`  
  Adds missing columns if you are upgrading  

- `docs/supabase-rls-and-grants.sql`  
  Use this if you get permission errors (RLS 42501)

---

## Running the App

Start the development server:

```bash
npm run dev
```

Then open:

http://localhost:3000

---

## Build for Production

```bash
npm run build
npm run start
```

---

## Deploying (Vercel)

1. Connect your repo to Vercel  
2. Add the same environment variables from `.env.local`  
3. Include `SUPABASE_SERVICE_ROLE_KEY` for database writes  
4. Use the default build command: `next build`

---

## Running Tests

```bash
npm run test
```

---

## Project Structure (Simple Overview)

- `app/` → Main app pages and API routes  
- `prompts/` → AI prompt templates  
- `config/` → Model settings  
- `lib/` → Helper functions (Supabase, logging, audio, etc.)  
- `docs/` → Documentation and SQL setup files  
- `tests/` → Basic tests  

---

## Helpful Docs

- `docs/architecture.md` → How everything connects  
- `docs/use-cases.md` → Main user flows  
- `docs/telemetry.md` → Logging and debugging  
- `docs/safety-and-privacy.md` → Data handling and security  

---

## Troubleshooting

AI not working:
- Make sure billing or `AI_GATEWAY_API_KEY` is set up  
- The app may return a fallback response if AI fails  

Supabase not saving data:
- Check terminal for:
  ```
  [Supabase] generations insert failed
  ```
- Fixes:
  - Add `SUPABASE_SERVICE_ROLE_KEY`
  - Run the RLS SQL file
  - Make sure all columns exist  

Audio not playing:
- Add audio files to `public/assets/audio/`  
- Or use the Web Audio fallback  

---
