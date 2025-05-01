# Migration to Azure Plan

## 1. Existing Application Tech Stack

### Frontend (client/)
- Framework: React 19.1.0
- Language: TypeScript (+ TSX), JavaScript
- Bundler/Dev Server: Vite (^6.3.4) with `@vitejs/plugin-react`
- UI & Map libraries:
  - react-map-gl (^7.1.6)
  - mapbox-gl (^3.11.1)
  - react-datepicker (^8.3.0)
  - lodash.debounce (^4.0.8)
- Build & Run scripts:
  - `npm run dev` (Vite dev server)
  - `npm run build`, `npm run preview`

### Backend (server/)
- Runtime: Node.js (LTS)
- Language: TypeScript
- Web framework: Express 5.1.0
- API server tooling:
  - ts-node-dev (for rapid reload)
  - knex (3.1.0) for migrations, seeds, and query building
- Environment: dotenv for configuration
- Middleware: cors
- HTTP client: node-fetch
- Database driver: sqlite3 (5.1.7) for local development

### Database & Data Layer
- ORMs/Migrations: Knex migrations & seeds
- Current engine: SQLite3 (`dev.sqlite3`)
- Migrations:
  - create_fortunes_table
  - create_sitters_table
  - add_lat_long_columns
  - add_special_needs_and_home_features
  - add_address_to_sitters
- Seed files:
  - 01_fortunes_seed.js
  - 02_sitters_seed.js

### Testing
- Test runner: (located in `server/tests/test-anon-search.spec.ts`)
- Likely using Jest/Mocha or other (config to be verified)

### Repository & Tooling
- Monorepo layout:
  - `/client` (frontend)
  - `/server` (backend)
  - `/scripts` for bootstrap
  - `/specs`, `/tests`, `/migrations`, `/seeds`
- Dev tooling:
  - concurrently (to run server and client in parallel)
  - bash scripts for initial setup

### Configuration & Secrets
- `.env` files for local credentials (not committed)
- Knex config in `knexfile.js`
- Ranking weights in `server/src/config/ranking.json`

---

*Next Steps:*
- Collect detailed Azure service mappings (Static Web Apps, Container Apps, Azure Database for PostgreSQL)
- Identify build/deploy adjustments (CI/CD, environment variables)
- Assemble research prompts for deep technical investigation

# Full implementation plan

Below is a **step-by-step implementation blueprint** that an automated coding agent (or a human, where UI clicks are still unavoidable) can follow to migrate your monorepo pet-sitter marketplace from its local SQLite/Node/React stack to production-grade Azure infrastructure.

---

## 0. Prerequisites

1. **Azure subscription** with Owner or Contributor rights.  
2. **GitHub repo** containing the monorepo (`/client`, `/server`, etc.).  
3. **Local workstation** with:
   - **Azure CLI ≥ 2.60** ( `az upgrade` to latest).  
   - **Bicep CLI** (`az bicep install`).  
   - **Docker Desktop** (or `podman`) for local container builds.  
   - **Node 18 LTS** (matches runtime in containers).  
4. **Service principal** for CI:  
   ```bash
   az ad sp create-for-rbac \
     --name "gh-pets-svc" \
     --role contributor \
     --scopes /subscriptions/<SUB_ID> \
     --sdk-auth > gh-creds.json
   ```  
   – Store the JSON output (minus any surrounding quotes) as a GitHub secret named **`AZURE_SP`**.

---

## 1. Repository Refactor (local)

### 1.1 Backend containerisation

1. Create `/server/Dockerfile` (multi-stage):

   ```dockerfile
   FROM node:18-alpine AS build
   WORKDIR /app
   COPY server/package*.json ./
   RUN npm ci
   COPY server/. .
   RUN npm run build           # tsc -> /dist

   FROM node:18-alpine
   WORKDIR /app
   COPY --from=build /app/dist ./dist
   COPY --from=build /app/package*.json ./
   RUN npm ci --omit=dev
   EXPOSE 3000
   ENV NODE_ENV=production
   CMD ["node", "dist/index.js"]
   ```

2. Verify locally:

   ```bash
   docker build -t pets-api:dev -f server/Dockerfile .
   docker run -p 3000:3000 pets-api:dev
   ```

### 1.2 Knex re-configuration

Add an **“azure”** (or “production”) environment to `knexfile.ts` that expects `process.env.DATABASE_URL` and uses client `pg` with `ssl: { rejectUnauthorized: false }`.

### 1.3 Front-end build fallback

Add `staticwebapp.config.json` to `/client`:

```json
{
  "navigationFallback": {
    "rewrite": "/index.html",
    "exclude": ["/assets/*", "/favicon.ico"]
  }
}
```

---

## 2. Infrastructure-as-Code

### 2.1 Author `infra/main.bicep`

The template declares (parameterise names as needed):

- **Resource group** (if deploying at subscription scope).  
- **Azure Container Registry** (Basic).  
- **Log Analytics** workspace.  
- **Container Apps Environment** wired to the workspace.  
- **System-assigned Key Vault** with RBAC.  
- **PostgreSQL Flexible Server** (General Purpose B2S, 32 GB, SSL required) + default DB `pets`.  
- **Container App** placeholder (hello-world), external ingress on :3000, scale 0–5, system identity, `DATABASE_URL` secret referencing Key Vault URI.  
- **Static Web App** (Free tier).  
- **RBAC role assignments**:  
  - Container App identity ➜ **AcrPull** on ACR.  
  - Container App identity ➜ **Key Vault Secrets User** on the vault.

Deploy once:

```bash
az group create -n petapp-rg -l westus2
az deployment group create -g petapp-rg -f infra/main.bicep \
  -p postgrePassword=<STRONG_PWD> githubRepo=https://github.com/<org>/<repo>
```

*Manual check*: copy **Static Web App** deployment token from Azure Portal → GitHub secret `SWA_TOKEN`.

---

## 3. Secrets & Key Vault

```bash
CONN="postgres://dbadmin@pets-db:<PW>@pets-db.postgres.database.azure.com:5432/pets?sslmode=require"
az keyvault secret set -n PG_CONN -v "$CONN" -n pets-kv -g petapp-rg
```

> **UI fallback**: if portal is preferred, add the secret in Key Vault → Secrets.

---

## 4. CI/CD Workflows

### 4.1 `/.github/workflows/frontend.yaml`

```yaml
name: SWA Deploy
on: [push]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v3
        with: { node-version: 18 }
      - run: cd client && npm ci
      - run: cd client && npm run build
        env:
          VITE_MAPBOX_TOKEN: ${{ secrets.MAPBOX_TOKEN }}
          VITE_API_URL: ${{ secrets.API_URL }}
      - uses: Azure/static-web-apps-deploy@v1
        with:
          azure_static_web_apps_api_token: ${{ secrets.SWA_TOKEN }}
          app_location: client
          output_location: client/dist
```

Manual once-off: add `MAPBOX_TOKEN`, `API_URL` (later set to your Container App URL) in GitHub repo secrets.

### 4.2 `/.github/workflows/backend.yaml`

```yaml
name: API Deploy
on:
  push:
    branches: [main]
    paths: ["server/**", ".github/workflows/backend.yaml"]
jobs:
  build-deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: azure/login@v1
        with: { creds: ${{ secrets.AZURE_SP }} }

      - run: az acr login -n petsacr

      - run: |
          docker build -t petsacr.azurecr.io/pets-api:${{ github.sha }} -f server/Dockerfile .
          docker push  petsacr.azurecr.io/pets-api:${{ github.sha }}

      - uses: azure/container-apps-deploy-action@v1
        with:
          containerAppName: pets-api
          resourceGroup: petapp-rg
          acrName: petsacr
          imageToDeploy: petsacr.azurecr.io/pets-api:${{ github.sha }}
```

---

## 5. Database Migration

1. Ensure local Postgres client (`psql` or PGAdmin).  
2. Create the schema on Azure:

   ```bash
   export DATABASE_URL=$CONN
   npx knex migrate:latest --env production
   npx knex seed:run --env production   # if seeds safe
   ```

3. For existing data in SQLite:

   ```bash
   sqlite3 dev.sqlite3 .dump > dump.sql
   # Manual tidy-up: adapt data types if needed
   psql "$CONN" -f dump.sql
   ```

   If > 50 k rows, script with Knex copy in batches.

---

## 6. Application Updates

1. **Backend** – ensure `.env` fallback but prefer `process.env.DATABASE_URL`.  
2. **CORS** – configure allowed origin:

   ```ts
   app.use(cors({ origin: process.env.ALLOWED_ORIGIN, credentials: true }));
   ```

   In Azure, set `ALLOWED_ORIGIN` secret to the SWA hostname (or your custom domain).

3. **Frontend** – consume `VITE_API_URL` so runtime endpoint is injected during build.

---

## 7. Validation & Smoke Tests

1. Once both workflows succeed, browse to `https://<swa>.azurestaticapps.net`.  
2. Ensure network tab shows XHRs to `https://pets-api.<hash>.azurecontainerapps.io` returning 200.  
3. Hit `/health` endpoint exposed by Express (add one if absent) to confirm DB connectivity.  
4. In Azure Portal → Log Analytics → query:

   ```kusto
   ContainerAppConsoleLogs
   | where ContainerAppName == "pets-api"
   | sort by TimeGenerated desc
   ```

   to verify any runtime errors.

---

## 8. Hardening & Operations

1. Change Postgres firewall from “0.0.0.0/0” to **“Allow Azure-internal only”**:

   ```bash
   az postgres flexible-server firewall-rule delete -g petapp-rg -s pets-db -n AllowAll
   az postgres flexible-server firewall-rule create -g petapp-rg -s pets-db \
     -n AllowAzure --start-ip 0.0.0.0 --end-ip 0.0.0.0
   ```

2. Optional: move Container Apps + Postgres into same VNet with private endpoints (requires redeploy).

3. Add alerts:

   ```bash
   az monitor metrics alert create \
     -g petapp-rg -n "CPUHigh" \
     --scopes $(az containerapp show -g petapp-rg -n pets-api --query id -o tsv) \
     --condition "avg Percentage CPU > 80 at least 5m" \
     --action email admin@example.com
   ```

4. Enable **Auto-stop** for dev Postgres if idle (Flexible Server supports scheduled stop/start).

5. Document cost expectations (SWA Free, Container Apps scales to 0, PG B2S ≈ $40/mo).

---

## 9. Manual UI Touch-Points (cannot yet automate)

| Task | Where | Frequency |
|------|-------|-----------|
| Copy Static Web App deployment token ➜ GitHub secret | Azure Portal → Static Web App → Settings → Deployment token | Once per SWA |
| Add `MAPBOX_TOKEN`, `API_URL` secrets in GitHub repo | GitHub Settings → Secrets | Once |
| Approve custom domain CNAME + SSL for SWA (if desired) | Azure Portal → SWA → Custom domains | Once per domain |

All other steps are CLI/Bicep-automatable.

---

## 10. Roll-out Timeline (suggested)

1. **Day 0** – Repository refactor + Dockerfile committed → workflows green (local SQLite).  
2. **Day 1** – Infra Bicep deployed in a dev RG; PG migrations run; workflows re-point to dev API; smoke test.  
3. **Day 3** – Harden firewall, set autoscale rules, add alerts.  
4. **Day 5** – Cut over DNS/custom domain; enable production RG with scaled Postgres tier.  
5. **Post-cut-over** – Monitor logs & costs for one week; tweak replica/DB sizing.

---

With the above blueprint, an automation agent can provision cloud resources, build/push images, run migrations, and release your app end-to-end. Humans only step in for secrets injection and the two UI tasks Azure currently doesn’t expose via CLI.