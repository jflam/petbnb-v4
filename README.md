# PetBnB

PetBnB is an Airbnb‑style marketplace that connects pet owners with verified sitters.

## Tech Stack
- **Frontend**: React 19 + TypeScript + Vite (`client/`)
- **Mapping**: Mapbox GL via `react‑map‑gl`
- **Backend**: Express + TypeScript (`server/`)
- **Database**: SQLite (managed with Knex)
- **E2E**: Playwright

## Directory Structure
- `client/` – React SPA
- `server/` – REST/GraphQL API, DB migrations & seeds
- `scripts/` – tooling and bootstrap helpers
- `specs/` – product & migration plans
- `README.md`, `CLAUDE.md` – project and dev docs

## Environment Variables

| Scope    | Var                | Description                               |
|----------|--------------------|-------------------------------------------|
| server   | `MAPBOX_TOKEN`     | Mapbox access token *(required)*          |
| client   | `VITE_MAPBOX_TOKEN`| Same token, exposed to the browser        |

Create the files below before running the app:

```bash
# server/.env (or copy server/.env.example)
MAPBOX_TOKEN=pk.<your_token_here>

# client/.env.local  (Vite picks up VITE_* automatically)
VITE_MAPBOX_TOKEN=$MAPBOX_TOKEN
```

Get a free token at https://account.mapbox.com/.

## Getting Started

1. Install dependencies for all workspaces:
   ```bash
   npm run bootstrap
   ```

2. Add the environment files as shown above.

3. Start development servers:
   ```bash
   npm run dev           # runs client & server concurrently
   # or
   npm run server        # backend only (http://localhost:4000)
   npm run client        # frontend only (http://localhost:3000)
   ```

## Scripts

### Root  
- `npm run dev`        – parallel client & server (via `concurrently`)  
- `npm run bootstrap` – install deps in root, client, server

### Server (`server/`)  
- `npm run dev`        – hot‑reloading API + automatic DB migrate/seed  
- `npm run build`      – compile TS -> `dist/`  
- `npm run migrate`    – latest migrations  
- `npm run seed`       – seed data

### Client (`client/`)  
- `npm run dev`        – Vite dev server + HMR  
- `npm run build`      – production build (`client/dist`)  
- `npm run preview`    – serve the build locally

## Core Features (MVP)
- Global search with location auto‑complete (Mapbox geocoding)
- Rich filters: price, rating, service, pet type, dog size, special needs, home features
- List / Map toggle with clustering & heat‑map for dense areas
- Accessibility enhancements (keyboard navigation, screen‑reader live regions)

## API Endpoints

### GET `/api/v1/sitters/search`
Search sitters by location and filters.

Query params include:
`location`, `latitude`, `longitude`, `minPrice`, `maxPrice`, `minRating`,  
`service`, `petType`, `dogSize[]`, `distance`, `topSittersOnly`,  
`specialNeeds[]`, `homeFeatures[]`, `startDate`, `endDate`, `sort`.

## Production Build

Backend:
```bash
cd server
npm run build
NODE_ENV=production node dist/index.js
```

Frontend:
```bash
cd client
npm run build
npm run preview   # optional local preview
```

## License
Private & proprietary – all rights reserved.