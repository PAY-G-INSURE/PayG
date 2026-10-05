# PAYG Health Insurance API

Express API for the PAYG Health Insurance frontend. Persistent application data is stored in Supabase PostgreSQL through its PostgREST API. The Supabase service role key is used only by this server; never add it to a `VITE_` variable or frontend `.env` file.

## Local setup

1. Create a Supabase project.
2. In Supabase Dashboard > SQL Editor, run [`supabase/schema.sql`](supabase/schema.sql).
3. Copy `.env.example` to `.env` and set `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, and `JWT_SECRET`.
4. Add the Paystack and Africa's Talking credentials for the integrations you want to exercise.
5. Run `npm install`, then `npm run dev`.
6. Open `http://localhost:5000/health` and confirm `db` reports `connected`.

The API checks configuration at startup. API requests use the Supabase service role and enforce user ownership in the Express routes/JWT middleware. Row Level Security is enabled on the tables; the service role bypasses RLS, so it must remain server-side.

## Supabase tables

`users`, `subscriptions`, `transactions`, `claims`, and `notifications` mirror the backend domain records. Their identifiers are UUIDs. `supabase/schema.sql` is the initial schema; apply future schema changes as reviewed SQL migrations and keep the checked-in migration in sync with the project.

The initial setup creates an empty database. To carry forward existing MongoDB data, export the five collections to JSON arrays, then run `node scripts/import-mongo-json.js <export-directory> --dry-run` followed by the same command without `--dry-run`. The importer uses stable UUIDs for Mongo IDs and must be run only after the schema has been applied. Back up both databases first.

## Environment variables

| Variable | Purpose |
| --- | --- |
| `SUPABASE_URL` | Project URL, such as `https://<project-ref>.supabase.co` |
| `SUPABASE_SERVICE_ROLE_KEY` | Server-only Supabase service role/secret key |
| `JWT_SECRET` | Long random secret used to sign API session tokens |
| `ADMIN_USERNAME` | Admin login name, stored only on the server |
| `ADMIN_PASSWORD_HASH` | bcrypt hash of the admin password; never store the raw password |
| `FRONTEND_URL` | Exact allowed frontend origin; comma-separate approved origins |
| `PAYSTACK_SECRET_KEY` | Server-side Paystack secret used for transaction verification/webhooks |
| `AT_API_KEY`, `AT_USERNAME` | Africa's Talking API credentials for SMS and any enabled services |
| `AT_SENDER_ID` | Approved SMS sender ID |

See `.env.example` for the full local template. Do not commit `.env` or real credentials.

## Render deployment

Create a Node Web Service for `health-insurance/backend`; use `npm install` for the build command and `npm start` for the start command. Set all required values from `.env.example` in Render's Environment settings. The server listens on Render's `PORT` and binds to `0.0.0.0`.

After deploy, check `https://<service>.onrender.com/health`. It confirms that Supabase settings are present; make a protected API request as well to confirm the credentials and schema work.

## Vercel frontend deployment

1. Create a Vercel project from the repository and set its Root Directory to `health-insurance/frontend`.
2. Use the detected Vite defaults (`npm run build`, output directory `dist`). `vercel.json` rewrites app routes to `index.html` for client-side routing.
3. Add `VITE_API_BASE_URL=https://<service>.onrender.com/api` and `VITE_PAYSTACK_PUBLIC_KEY=pk_live_...` in Vercel Project Settings > Environment Variables. Add them to Production and Preview only as appropriate, then redeploy.
4. In Render, set `FRONTEND_URL` to the exact deployed Vercel origin (for example `https://payg.vercel.app`). Include approved preview origins only if needed.
5. Open the deployed app, sign in with OTP, top up through Paystack, and verify the wallet/transaction in the app and Supabase. Sign in to the admin area with the server-configured credentials and check users, claims, transactions, and notifications.

Deploy in this order: apply the Supabase schema (and import existing MongoDB data if needed), configure and deploy the Render API, verify `/health`, then deploy the Vercel frontend with the Render API URL. Keep all Supabase service role, JWT, Paystack secret, Africa's Talking, and admin password hash values in Render only. Only the API URL and Paystack public key belong in Vercel.

Generate an admin password hash locally with `node -e "console.log(require('bcryptjs').hashSync('choose-a-long-password', 12))"`, then place the resulting hash in Render's `ADMIN_PASSWORD_HASH` setting. Set a fresh username/password; old hardcoded browser credentials are no longer valid.

## Africa's Talking notes

- SMS requires valid AT API credentials and an approved sender ID.
- Set `AT_USSD_CALLBACK_TOKEN` to a long random value and set the USSD callback URL to `https://<service>.onrender.com/api/ussd?token=<encoded-token>` in the AT dashboard.
- Standard USSD session charging is not a callback confirming a separate wallet payment. USSD airtime top-ups and direct deduction callbacks are disabled; users can fund wallets using Paystack until a carrier-approved billing service can verify actual charges.
- The USSD callback itself is not proof of a carrier airtime charge. The existing USSD top-up path must not be treated as real reverse billing unless the selected carrier product provides a verified charge result. Africa's Talking airtime send API distributes airtime; it does not deduct a user's balance.

## Paystack webhook

Set the Paystack webhook URL to `https://<service>.onrender.com/api/payments/webhook`. The route validates Paystack's signature against the raw request body.
