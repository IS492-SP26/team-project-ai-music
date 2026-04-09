# Sonic Scholar — Installation & Runbook

Next.js 16 (App Router), TypeScript, Tailwind CSS, and an AI-backed `POST /api/generate` route for educational music breakdowns.

## Prerequisites

- **Node.js** 20.x or 22.x (LTS recommended)
- **npm** or **pnpm** (both lockfiles may exist; pick one package manager and stick with it)

## Clone & install

```bash
git clone <your-repository-url>
cd <repository-directory>
npm install
```

## Environment

Copy the example file (no secrets committed) to the project root:

```bash
cp .env.example .env.local
```

On Windows (PowerShell):

```powershell
Copy-Item .env.example .env.local
```

See [.env.example](./.env.example) for variable names. On Vercel, AI Gateway is usually configured in the project dashboard; locally you may need `AI_GATEWAY_API_KEY` for live model calls.

## Run scripts (`package.json`)

| Command | Description |
|--------|-------------|
| `npm run dev` | Development server (Turbopack) |
| `npm run build` | Production build |
| `npm run start` | Serve production build (after `build`) |
| `npm run lint` | ESLint (`eslint .`) |
| `npm run test` | Vitest — minimal tests under `tests/` |
| `npm run test:watch` | Vitest watch mode |

If `lint` fails with “eslint not recognized”, install ESLint as a dev dependency or run `npx eslint .`.

## Run locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Production

```bash
npm run build
npm run start
```

## Deploy (Vercel)

1. Connect the repository.
2. Set environment variables to match `.env.example` where applicable.
3. Default build: `next build`.

## Verify tests

```bash
npm run test
```

## Repository layout (high level)

| Path | Purpose |
|------|---------|
| `app/` | Next.js routes and UI entry |
| `prompts/` | System and user LLM templates |
| `config/` | Model id and data-connector notes |
| `docs/` | Architecture, use cases, telemetry, safety |
| `tests/` | Critical-path unit/smoke tests |

## Documentation

- [docs/architecture.md](./docs/architecture.md) — stack, diagram, data flow  
- [docs/use-cases.md](./docs/use-cases.md) — user paths and test mapping  
- [docs/telemetry.md](./docs/telemetry.md) — logging and DB telemetry plan  
- [docs/safety-and-privacy.md](./docs/safety-and-privacy.md) — PII, rate limits, abuse  

## Troubleshooting

- **AI / Gateway errors:** Configure billing or `AI_GATEWAY_API_KEY` per [Vercel AI Gateway](https://vercel.com/docs/ai-gateway); the API returns a local fallback when the provider fails (except some 403 setup cases).
- **Silent audio previews:** Add mapped samples under `public/assets/audio/` (see `lib/audio-sample-map.ts`) or use the Web Audio fallback.
