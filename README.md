# PayG

PayG is the mother/umbrella site and monorepo for all PayG products.

## Folder Structure

```
PayG/                          ← Mother site (repo root)
├── src/                       ← PayG mother site source (React/Vite)
├── public/
├── package.json
├── vite.config.js
├── netlify.toml
│
└── health-insurance/          ← Health Insurance product
    ├── frontend/              ← React/Vite frontend
    │   ├── src/
    │   ├── .env               ← VITE_API_BASE_URL points to backend
    │   ├── package.json
    │   └── vite.config.js
    │
    └── backend/               ← Node.js/Express API
        ├── routes/
        ├── models/
        ├── middleware/
        ├── utils/
        ├── .env               ← FRONTEND_URL points to frontend
        ├── package.json
        └── server.js
```

## Sites & Products

| Site/App | Folder | Description |
|----------|--------|-------------|
| PayG (Mother) | `/` | Main marketing & gateway site |
| Health Insurance Frontend | `health-insurance/frontend/` | Customer-facing insurance app |
| Health Insurance Backend | `health-insurance/backend/` | REST API for the insurance app |

## Local Development

### Mother Site
```bash
npm install && npm run dev        # http://localhost:5173
```

### Health Insurance Frontend
```bash
cd health-insurance/frontend/
npm install
cp .env.example .env   # set VITE_API_BASE_URL=http://localhost:5000/api
npm run dev            # http://localhost:5174
```

### Health Insurance Backend
```bash
cd health-insurance/backend/
npm install
cp .env.example .env   # fill in Supabase, JWT, Paystack, and messaging configuration
npm run dev            # http://localhost:5000
```

## Deployment
- **Mother site** → Deploy `/` to Netlify
- **Health Insurance Frontend** → Deploy `health-insurance/frontend/` to Netlify/Vercel
- **Health Insurance Backend** → Deploy `health-insurance/backend/` to Render

## Demo and service boundaries

The root React/Vite site includes demonstration UI flows; it does not establish an insurance policy or process a payment. The separate health-insurance backend requires Supabase and configured third-party services. Never expose its service credentials in VITE_ variables: those values are public browser assets.

Use `npm ci` and `npm run build` at the root for a reproducible static build. Deploy the root and product frontend as separate applications with their own base directory. A static Vercel deployment does not run the Express backend; configure the frontend API URL to an independently hosted backend. Test payment webhooks only in provider test mode. No payment, SMS, database write or deployment is performed by a local build.

Offline API checks: run `npm test` in `health-insurance/backend`. These stub database health, verify anonymous access is denied, and ensure provider errors are not exposed. They do not issue payments, send SMS, or modify a hosted database. Root `npm run lint` checks both browser source and CommonJS backend source; generated build folders are excluded.
