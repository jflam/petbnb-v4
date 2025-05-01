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
