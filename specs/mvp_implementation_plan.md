# PetBnB – MVP Implementation Plan  
*(Feature 1: Sitter Discovery & Listing)*

---

## 1. Scope  
Deliver a production‑ready search & listing experience that lets any visitor:
* Search by location + date range.
* Apply key filters (service type, pet type, dog size, nightly rate, rating, certifications, distance, **Top Sitter**).
* View sitter cards in a responsive grid (optional map view in Phase 2).
* Click a card to open the sitter detail route (stub in MVP).

---

## 2. Backend Design  

### 2.1 Database Schema (SQLite → easily portable to Postgres)  
| Table | Purpose | Key Columns | Notes |
|-------|---------|-------------|-------|
| `sitters` | Core sitter profile | `id PK`, `first_name`, `last_name`, `bio`, `photo_url`, `hourly_rate`, `accepts_cats BOOL`, `accepts_dogs BOOL`, `dog_size_min`, `dog_size_max`, `lat NUMERIC`, `lng NUMERIC`, `city`, `state`, `zip`, `created_at`, `updated_at` |  |
| `services` | Canonical list of service types | `id PK`, `name` (Boarding, House Sitting, etc.) | Static seed |
| `sitter_services` | M‑N sitters ↔ services | `sitter_id FK`, `service_id FK`, `price_override` | Composite PK |
| `certifications` | e.g. Background Check, Vet Tech | `id PK`, `name`, `icon` | Static seed |
| `sitter_certifications` | M‑N join | `sitter_id FK`, `certification_id FK`, `verified_at` |  |
| `reviews` | Owner reviews (aggregated for rating) | `id PK`, `sitter_id FK`, `rating NUMERIC (1‑5)`, `comment`, `created_at` | Avg & count cached in `sitters.rating`, `sitters.review_count` via trigger or nightly job |
| `availability` *(Phase 2)* | Calendar ranges | `id PK`, `sitter_id FK`, `start_date`, `end_date` | Enables R1 / R2 |

Indexes:  
`CREATE INDEX idx_sitters_location ON sitters(city, state, zip);`  
`CREATE INDEX idx_sitters_geo ON sitters(lat, lng);` for distance calc.

### 2.2 Knex Migration Plan  
1. `20250601_create_core_tables.js` → all tables above.  
2. `20250602_add_seed_data.js` → 10‑20 demo sitters with mixed services & certs.  

### 2.3 Seed Data Blueprint  
```jsonc
[
  {
    "first_name": "Maya",
    "last_name": "Rodriguez",
    "bio": "Former vet tech who loves dogs & cats.",
    "photo_url": "https://source.unsplash.com/320x320/?pet", // high‑quality random pet photo
    "hourly_rate": 45,
    "accepts_cats": true,
    "accepts_dogs": true,
    "dog_size_min": 0,
    "dog_size_max": 80,
    "city": "Seattle",
    "state": "WA",
    "zip": "98101",
    "lat": 47.608,
    "lng": -122.335,
    "services": ["Boarding", "Day Care"],
    "certifications": ["Background Check", "Vet Tech"]
  },
  "...18 more..."
]
```
*(Full JSON lives in `seeds/02_sitters_seed.js` – use  
`https://source.unsplash.com/320x320/?{dog|cat}` for variety.)*

---

## 3. API Contract  

`GET /api/v1/sitters/search`  

Query params:  
| Param | Type | Example | Description |
|-------|------|---------|-------------|
| `q` | string | `"Seattle, WA"` | Free‑text location; geocoded server‑side → (lat,lng) |
| `start` / `end` | `YYYY‑MM‑DD` | `2025-05-01` | Stay dates |
| `services` | CSV ids | `1,3` | Boarding, House Sitting… |
| `petType` | `cat|dog|all` | `dog` |  |
| `sizeMin` / `sizeMax` | int | `0 / 50` | Dog weight (lbs) |
| `priceMax` | int | `50` | Nightly cap |
| `ratingMin` | float | `4.5` |  |
| `distanceMax` | int (mi) | `25` |  |
| `topSitter` | bool | `true` | Acceptance rate ≥ 95 % & rating ≥ 4.8 |

Response (`200 OK`)
```ts
type SitterCardDTO = {
  id: number;
  name: string;           // "Maya R."
  photoUrl: string;
  nightlyRate: number;
  rating: number;         // 4.9
  reviewCount: number;    // 42
  distance: number;       // miles from search center
  certifications: string[]; // ["Background Check", "Vet Tech"]
  repeatClientCount: number;
  availabilityUpdatedAt: string; // ISO
};
```

Pagination: cursor (`?cursor=...&limit=20`) in Phase 2.

---

## 4. Backend Implementation Tasks  

1. **Geocoding helper** – call Nominatim or Mapbox; cache results.  
2. **Distance SQL** – Haversine formula in `ORDER BY distance ASC`.  
3. **Query builder** – parse filters → Knex chain.  
4. **Controller** (`routes/sitters.ts`) – validates input, fetches, maps rows to DTO.  
5. **Unit tests** with Jest (filter combinations, empty state).  
6. **Remove fortune demo** after MVP routes compile.  

---

## 5. Front‑end Architecture (React 19 + Vite)  

### 5.1 Component Tree  
```
<App>
 ├─ <SearchPage>
 │    ├─ <GlobalSearchBar />   // location + dates (R1)
 │    ├─ <FiltersSidebar />    // collapsible on mobile
 │    ├─ <ListingGrid>
 │    │    ├─ ...<SitterCard />
 │    │    └─ <EmptyState />   // R9
 │    └─ <MapToggle />         // Phase 2
 └─ <Router> (react-router v6)
```

### 5.2 Key Components  

* **GlobalSearchBar**  
  Props: `onSubmit({ location, start, end })`. Debounced geocode preview list.  

* **FiltersSidebar**  
  Local state synced to URL query params. Sliders: `price`, `distance`; checkboxes: `services`, `petType`, `certifications`, `topSitter`.  

* **ListingGrid**  
  Fetches `/api/v1/sitters/search` when query params change. Handles `loading`, `error`, `data`.  

* **SitterCard**  
  Displays hero img, name, rate, stars badge, distance, cert icons, repeat‑client pill. Click → `/sitters/:id?prevQuery=…`.  

* **EmptyState**  
  Illustration + “No sitters match your filters” + **Reset Filters** button (R9).  

### 5.3 State Management  

* `react-router` URL is single source of truth.  
* Custom hook `useSearchQuery()` parses/encodes params.  
* SWR or React‑Query optional for caching; plain `fetch` acceptable.

---

## 6. Incremental Roll‑out  

| Phase | Deliverable |
|-------|-------------|
| 0 | Migrations + seed data compile. CLI check: `knex seed:run` inserts 20 sitters. |
| 1 | `/api/v1/sitters/search` returns hard‑coded fixtures → integrate ListingGrid. |
| 2 | Full filter SQL, geocoding, and distance sort. |
| 3 | Map view toggle, pagination, availability calendar. |
| 4 | Remove fortune demo; update README & root scripts. |

---

## 7. TODO Checklist  

- [ ] Write migrations (`sitters`, `services`, `certifications`, joins, reviews).  
- [ ] Seed: static services + certifications.  
- [ ] Seed: 20 demo sitters covering every edge case.  
- [ ] Express route `/api/v1/sitters/search` + validation.  
- [ ] React components scaffolded with static mocks.  
- [ ] Playwright e2e tests from spec file.  
- [ ] Docs: update README; deprecate fortune verbiage/logs.  

---

*End of plan – ready for engineering breakdown & ticketing.*
