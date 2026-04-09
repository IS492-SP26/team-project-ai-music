# Sonic Scholar — Installation & Runbook

This project is a **Next.js 16** app (App Router) with **TypeScript**, **Tailwind CSS**, and an AI-backed `/api/generate` route for educational music breakdowns.

## Prerequisites

- **Node.js** 20.x or 22.x (LTS recommended)
- **npm** (or **pnpm** — a `pnpm-lock.yaml` is present; use one package manager consistently)

## Clone

```bash
git clone <your-repository-url>
cd <repository-directory>
```

## Install dependencies

```bash
npm install
```

If you use pnpm:

```bash
pnpm install
```

## Environment

Copy the example env file from this folder to the project root and adjust values:

```bash
cp app/docs/env.example .env.local
```

See `app/docs/env.example` for variables. AI generation on Vercel typically uses the platform AI Gateway; local development may require additional provider keys depending on your setup.

## Scripts (from `package.json`)

| Command        | Description                                      |
|----------------|--------------------------------------------------|
| `npm run dev`  | Start the development server (Turbopack)       |
| `npm run build`| Production build                                 |
| `npm run start`| Serve the production build (run `build` first)   |
| `npm run lint` | Run ESLint (`eslint .`)                          |
| `npm run test` | Run Vitest (smoke / unit tests under `app/tests`) |

> **Note:** `lint` expects the `eslint` CLI to be available. If `npm run lint` fails with “eslint not recognized”, install ESLint as a dev dependency or run `npx eslint .`.

## Run locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Production build

```bash
npm run build
npm run start
```

## Deploy (Vercel)

1. Connect the repo to Vercel.
2. Set environment variables (mirror keys from `app/docs/env.example`) in the Vercel project settings.
3. Use the default **Build Command**: `next build` and **Output**: Next.js.

## Verify tests

```bash
npm run test
```

## Troubleshooting

- **AI errors / “AI Gateway” messages:** Ensure billing or AI Gateway access is configured on Vercel per their docs; the API route falls back to a local template when the provider is unavailable.
- **Audio previews silent:** Add mapped `.mp3` / `.wav` files under `public/assets/audio/` (see `lib/audio-sample-map.ts`) or rely on the built-in Web Audio fallback.

## More documentation

- [Architecture](./architecture.md)
- [Use cases](./use-cases.md)
- [Governance](./GOVERNANCE.md)
