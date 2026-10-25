# NavRiti Capstone — Vercel Multi-Service Deployment

This repository is configured as a single Vercel project with multiple services.

## Services (proposed)

- `client` (`Client/`) — Vite React frontend
- `server` (`Server/`) — Express API (`/api/*` public)
- `career_api` (`models/career_api/`) — FastAPI (internal)
- `kundali_api` (`models/kundali_api/`) — FastAPI (internal)
- `market_api` (`models/market_api/`) — FastAPI (`/market/*` public)
- `parental_api` (`models/parental_api/`) — FastAPI (internal)
- `society_api` (`models/society_api/`) — FastAPI (internal)

## Architecture and routing

Public routes are handled by top-level rewrites in `/vercel.json`:

- `/api` and `/api/*` → `server`
- `/market` and `/market/*` → `market_api`
- `/*` → `client` (SPA catch-all)

Internal service-to-service calls are done through Vercel service bindings on `server`:

- `CAREER_API_URL` → `career_api`
- `KUNDALI_API_URL` → `kundali_api`
- `PARENTAL_API_URL` → `parental_api`
- `SOCIETY_API_URL` → `society_api`

`market_api` is intentionally public because the current frontend calls it directly.

## Local setup

Install dependencies per service:

```bash
# from repository root
cd Client && npm install
cd ../Server && npm install
```

Python dependencies (per API service):

```bash
pip install -r models/career_api/requirements.txt
pip install -r models/kundali_api/requirements.txt
pip install -r models/market_api/requirements.txt
pip install -r models/parental_api/requirements.txt
pip install -r models/society_api/requirements.txt
```

Run local development with Vercel service orchestration:

```bash
vercel dev
```

For non-Vercel local backend development, Express still works with:

```bash
cd Server
npm run dev
```

## Environment variables

### Client build-time variables (Vite)

Set in Vercel **for the `client` service** (or `.env` for local Vite builds):

- `VITE_SERVER_BASE_API` (optional, default: `/api`)
- `VITE_MARKET_API_BASE` (optional, default: `/market`)

These are build-time only and should not be used for secrets.

### Server/runtime variables (secret-capable)

Set in Vercel **for the `server` service**:

- `MONGO_URI`
- `JWT_SECRET`
- `JWT_EXPIRES_IN` (optional)
- `ALLOWED_ORIGINS` (optional, comma-separated)
- SMTP / mail vars used by server mail utilities (`SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `MAIL_FROM`, etc.)

Service binding URLs are injected automatically by Vercel and should **not** be manually set:

- `CAREER_API_URL`, `KUNDALI_API_URL`, `PARENTAL_API_URL`, `SOCIETY_API_URL`

### Python service variables

Set as needed per service (examples from current code):

- `GOOGLE_API_KEY` (used by `market_api`, `parental_api`, and other model logic)

## Vercel deployment steps

1. Import this repository into Vercel.
2. Ensure the project uses the root `vercel.json`.
3. Configure environment variables for each service.
4. Deploy from `main` (or a PR branch) in Vercel.
5. Verify routes:
   - `/` serves client app
   - `/api/docs` serves Express Swagger
   - `/market/final-market-ranking` reaches market FastAPI service

## Known limitations / assumptions

- Service names, rewrite paths, and bindings are proposed and should be confirmed by the repository owner.
- `market_api` is kept public due existing frontend usage; if you want it internal, add an Express proxy endpoint and switch the frontend to `/api/*` only.
- FastAPI services are assumed to be deployable via Vercel Python runtime using their current entrypoint files.
- Express is adapted for serverless by exporting app (`Server/api/index.ts`) while preserving local `npm run dev` behavior.
