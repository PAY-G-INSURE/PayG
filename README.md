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
