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
npm run dev -- --port 5174
```

Open the health frontend at `http://localhost:5174/health-insurance/`. Its Vite dev server proxies `/api` to the backend on port 5000.

Configure each package's environment from its `.env.example` before connecting external services. See the package scripts for build and backend commands.

## Vercel Services deployment

The repository root is one Vercel Services project with three independently built services: the marketing site at `/`, the insurance app at `/health-insurance/`, and the Express API at `/api/`. Keep the Vercel Root Directory at the repository root and set the project framework to **Services**. `vercel.json` declares each service and routes requests on the shared domain. The health frontend uses same-origin `/api` requests by default, so it needs no separate API hostname.

Set `VITE_PAYSTACK_PUBLIC_KEY` in Vercel for the frontend build. Leave `VITE_API_BASE_URL` unset so the insurance app uses same-origin `/api`. Configure the API service's Supabase, JWT, admin, Paystack secret, Africa's Talking, and `FRONTEND_URL` values in Vercel's environment settings. Keep server secrets out of all `VITE_` variables. After setting the variables, redeploy to apply them.

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
