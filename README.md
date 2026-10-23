# PayG Web and Health Insurance Monorepo

A JavaScript monorepo containing the PayG marketing site, a health-insurance frontend and an Express API. Each package has its own local development command and environment configuration.

## What is included

- Vite marketing website
- Vite insurance frontend
- Express backend with provider integrations configured through environment variables

## Run locally

```sh
# Marketing site (repository root)
npm ci
npm run dev

# In separate terminals: health-insurance/frontend and health-insurance/backend
# In each directory:
npm ci
# Copy .env.example to .env, configure required values, then run:
npm run dev
```

## Verify

Run `npm run lint` and `npm run build` in the root and frontend packages. Run the backend offline tests with `npm test` from `health-insurance/backend`.

## Repository map

`src/` and `public/` contain the marketing site. `health-insurance/frontend/` contains the customer UI. `health-insurance/backend/` contains the API and its `.env.example`. Root and nested lockfiles define separate dependencies.

## Evidence and limitations

Both Vite frontends build, source lint passes, and two offline backend tests pass. Dependency audits reported no findings in the checked production dependency trees.

Supabase, payment, messaging and insurance-provider operations were not exercised against provider sandboxes. Configure secrets only in private environment settings; do not commit `.env` files. Financial/regulatory review and authenticated end-to-end tests are required before issuing policies or accepting payments.

## License

No repository license file is included. Unless the project owner adds a license, do not assume the code, data or model artifacts may be redistributed or reused. Verify third-party data and model terms separately.
