# PayG Web and Health Insurance Monorepo

PayG contains the marketing website, the health-insurance customer frontend, and its Express API. Root `src/` and `public/` belong to the marketing site; `health-insurance/frontend/` and `health-insurance/backend/` contain the insurance app and API.

## Run locally

```sh
# From the repository root
npm ci
npm run dev

# In another terminal
cd health-insurance/frontend
npm ci
npm run dev
```

Configure each package's environment from its `.env.example` before connecting external services. See the package scripts for build and backend commands.

## Vercel deployment

The root Vercel project builds both Vite apps and assembles the insurance app under `dist/health-insurance/`, so both apps can use one domain. Keep the Vercel Root Directory at the repository root. Routes under `/health-insurance/*` open the insurance app; all other routes open the marketing site.

Set `VITE_API_BASE_URL` to the deployed API URL ending in `/api` and `VITE_PAYSTACK_PUBLIC_KEY` to the public key for the target environment in Vercel's project settings. The API remains a separate Node service. Set its `FRONTEND_URL` to the production site origin and any specific preview origins that should be allowed. Keep server secrets in the API environment, never in frontend `VITE_` variables.

Build with `npm run build`. The output should include `dist/index.html` and `dist/health-insurance/index.html`.

## Environments and release workflow

| Environment | Branch | Health app | API |
| --- | --- | --- | --- |
| Production | `main` | https://payg-health.netlify.app | `payg-health-backend` on Render |
| Staging | `develop` | https://develop--payg-health.netlify.app | `payg-health-backend-staging` on Render |
| Preview | each pull request | `deploy-preview-<n>--payg-health.netlify.app` | staging API |

1. Branch from `develop` (`feature/<name>`) and open a pull request into `develop`. CI and a Netlify deploy preview run on the pull request.
2. After review and green checks, merge into `develop`; the staging site and API update for testing.
3. Release by opening a pull request from `develop` into `main`. Merging it deploys production.

Do not push directly to `main` or `develop`. Per-environment URLs live in each `netlify.toml`; secrets and Paystack keys are set per deploy context in Netlify and per service in Render. Staging uses its own Supabase project and test-mode Paystack and Africa's Talking credentials.
