# PayG Web and Health Insurance Monorepo

A JavaScript monorepo containing the PayG marketing website, a health-insurance customer frontend, and its Express API. The packages cover public product pages, customer-facing insurance workflows, and provider-backed service operations.

The root `src/` and `public/` directories belong to the marketing site. `health-insurance/frontend/` contains the customer interface and `health-insurance/backend/` contains the API. Root and nested package manifests and lockfiles define their separate dependency sets; sample environment files document integrations.

## Run locally

```sh
# Marketing site, from the repository root
npm ci
npm run dev

# In separate terminals, install and run the health-insurance frontend/backend
cd health-insurance/frontend
npm ci
npm run dev
```

Configure each package's environment from its `.env.example` before connecting external services. See the package scripts for lint, build, and backend commands.

## Environments and workflow

| Environment | Branch | Health app | API |
| --- | --- | --- | --- |
| Production | `main` | https://payg-health.netlify.app | `payg-health-backend` on Render |
| Staging | `develop` | https://develop--payg-health.netlify.app | `payg-health-backend-staging` on Render |
| Preview | each pull request | `deploy-preview-<n>--payg-health.netlify.app` | staging API |

1. Branch from `develop` (`feature/<name>`) and open a pull request into `develop`. CI and a Netlify deploy preview run on the PR.
2. After review and green checks, merge into `develop`; the staging site and API update for testing.
3. Release by opening a pull request from `develop` into `main`. Merging it deploys production.

Nobody pushes directly to `main` or `develop`. Per-environment URLs live in each `netlify.toml`; secrets and Paystack keys are set per deploy context in Netlify and per service in Render. Staging uses its own Supabase project and test-mode Paystack and Africa's Talking credentials.
