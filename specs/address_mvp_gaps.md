# Addressing MVP Gaps: Implementation Plan

This document outlines a step‑by‑step approach to closing the gaps between our current implementation and the v1.1 spec for **Feature 1: Sitter Discovery & Search**, with a focus on enabling the upcoming **Map/List toggle** via proper geocoding support.

---

## Geocoding Overview

Geocoding is the process of converting human-readable addresses or place names into precise geographic coordinates (latitude and longitude). It underpins several critical features in our app:
- Accurate map centering and zoom levels
- Distance calculations for proximity-based filters and sorting
- Fast autocomplete suggestions for location input
- Enabling seamless Map/List toggle and clustering of sitter pins

---

## 1. Location & Geocoding

### 1.1 Client‑side
- Replace the simple text input in `SearchBar` with a combined **location + date range** control:
  - Use a date‑range picker library (e.g. `react-datepicker`).
  - On text entry, debounce (300 ms) and call a geocoding API (e.g. Mapbox Geocoding or Google Places) to retrieve latitude/longitude and display auto‑complete suggestions.
  - On selection, store `{ latitude, longitude, locationLabel, startDate, endDate }` in component state and propagate via `onSearch()`.

### 1.2 Server‑side
- Create a new service module `src/services/geocoder.ts`:
  - Read API key from env (e.g. `GEOCODER_API_KEY`).
  - Expose `geocode(address: string): Promise<{ latitude, longitude }>`.
- Extend the `/api/v1/sitters/search` endpoint to:
  1. Accept `latitude`, `longitude`, `startDate`, `endDate` instead of raw `location`.
  2. If only `location` is provided, call `geocode()` internally before querying.

### 1.3 Configuration
- Add `.env.example` entries:
  ```dotenv
  GEOCODER_API_KEY=YOUR_API_KEY
  GEOCODER_PROVIDER=mapbox # or google
  ```
- Document usage in `README.md`.

---

## 2. Map/List Toggle & Map Integration

### 2.1 UI Components
- Add a toggle control in `SearchResultsHeader`:
  ```tsx
  <ViewToggle currentView={view} onToggle={setView} />
  ```
- Maintain `view` state (`'list' | 'map'`) in `App` or a context.

### 2.2 Map Implementation
- Use **Mapbox GL JS** (via `react-map-gl`) or **React Leaflet**:
  - Lazy‑load map bundle to meet performance targets (≤ 250 kB gzipped).
  - Center on last search lat/lng; set initial zoom to show ~50 closest sitters.
  - Display numbered pins matching list order.
  - Enable clustering (clusters > 50 sitters).
  - Integrate privacy offset (±400 ft) before rendering each pin.
  - Implement “Search this area” sticky button when in map mode.

### 2.3 State Synchronization
- Keep filters, pagination, sort, and `view` in sync with the URL using React Router’s query parameters.

---

## 3. Expanded Filters

- **Pet Size**: replace discrete `dogSize` select with checkbox group for XS, S, M, L, XL.
- **Special Needs**: add a multi‑checkbox group (Puppy, Senior, Medication‑required, Reactive).
- **Home Features**: add checkboxes (Fenced Yard, Smoke‑free, No other pets).
- **Certifications**: add a dropdown or checkboxes based on sitter data.
- Update client components (`FiltersSidebar`) and extend `FilterState` & `SearchQuery` types.
- Adjust backend query builder to filter JSON arrays for the new fields.

---

## 4. Sort Options

- Add a `SortDropdown` component: Distance (default), Price (asc), Rating (desc).
- Sync choice to URL (`?sort=rating` etc.).
- Update backend search to re‑order results based on `sort` param instead of hardcoded distance→rating→repeat.

---

## 5. Listing Card Enhancements

- In `SitterCard`:
  - Wrap rating display with a Tooltip showing total review count.
  - Show **Response Time** badge (fetch `medianResponseTime` in API).
  - Display **Repeat‑client %** (calculated as `repeat_client_count / total_clients`).
  - If sitter offers multiple services, render two “from” price points.

- Extend server’s sitter data shape to include `median_response_time` and client counts.

---

## 6. Ranking Algorithm (v0.5)

- In server config (e.g. `config/ranking.json`), define weights:
  ```json
  { "distance": 0.4, "rating": 0.25, "availability": 0.15, "responseRate": 0.1, "repeatClient": 0.1 }
  ```
- In `/api/v1/sitters/search`, after filtering and distance calc:
  - Normalize each signal (0–1), compute weighted sum, sort by score.

---

## 7. URL‑driven State

- Use React Router or `use-query-params`:
  - Store `{ view, filters, sort, startDate, endDate }` in the query string.
  - On mount, parse URL and initialize state.
  - On change, update URL without full page reload.

---

## 8. Testing

- **Unit tests** for geocoder service (mock external API).
- **Playwright/E2E**:
  - `mapToggle.spec.ts`: verify map renders, clusters, toggle behavior.
  - `petSizeFilter.spec.ts`: seed data, apply size & special‑needs filters.
  - `sortRating.spec.ts`: assert ordering and URL updates.

---

## Outstanding Issues & Risks

1. **API Key Security**: managing geocoder credentials in CI/CD and client.
2. **Bundle Size**: ensuring map library remains < 250 kB gzipped.
3. **Date Range Edge Cases**: time zones, partial-day coverage.
4. **Geocoding Accuracy & Rate Limits**: retries, caching, error handling.
5. **Privacy Offset**: implementing random offset within 50–400 ft.
6. **Ranking Normalization**: designing a robust min/max scale for distance and availability.
7. **Backend Data Shape**: migrating DB to add response‑time and special‑needs fields.
8. **Filter Coupling in Map**: managing faded pins vs. fully filtered state.
9. **Accessibility**: keyboard navigation & ARIA for map and toggles.
10. **Performance under Load**: clustering and map interactions with > 200 pins.

---

## Seed Data Enhancements

- Extend `02_sitters_seed.js` entries to include the following new fields matching our updated schema:
  - `special_needs`: array of strings (e.g. Puppy, Senior, Medication-required, Reactive)
  - `home_features`: array of strings (e.g. Fenced Yard, Smoke-free, No other pets)
  - `median_response_time`: number (hours)
  - `availability_updated_at`: ISO 8601 timestamp
  - `repeat_client_count`: integer
  - `rating`: float (1.0–5.0)
  - `review_count`: integer
  - `top_sitter`: boolean flag for high-performance sitters
- Ensure seeds cover all new filter dimensions, including:
  - Every pet type (dogs, cats, birds, rodents)
  - Full dog size ranges (XS: 0–15 lbs, S: 16–40 lbs, L, XL)
  - All combinations of certifications, services, special needs, and home features
- Update join seed files (`sitter_services`, `sitter_certifications`) to reflect proper associations for each demo sitter

---

# Research to help coding model

## Mapbox Geocoding Integration (Feature 1 Enhancement)

### Goals
Provide reliable forward and reverse geocoding so that sitter search coordinates are accurate, autocompletion feels instant (<150 ms), and the upcoming **Map/List toggle** can center and cluster pins correctly.

### API Overview
* **Endpoint (v6)**: `https://api.mapbox.com/search/geocode/v6/forward`
  * Common query params: `q`, `limit`, `proximity`, `types`, `language`, `autocomplete=true|false`.
* **Reverse**: `https://api.mapbox.com/search/geocode/v6/reverse?longitude={lon}&latitude={lat}`.
* **Auth**: Every request must include `access_token=<MAPBOX_TOKEN>`.
* **Rate‑limits**: default 1 000 req/min; 429 returned when exceeded. Build exponential back‑off + jitter.

### Environment Variables
```dotenv
MAPBOX_TOKEN=pk.********
GEOCODER_PROVIDER=mapbox
```

### Server‑Side Module (`src/services/geocoder.ts`)
```ts
import fetch from "node-fetch";

export interface Coords { latitude: number; longitude: number; }
export async function geocode(query: string, {
  limit = 5,
  signal,
}: { limit?: number; signal?: AbortSignal } = {}): Promise<Coords[]> {
  const token = process.env.MAPBOX_TOKEN;
  if (!token) throw new Error("Missing MAPBOX_TOKEN");

  const url = new URL("https://api.mapbox.com/search/geocode/v6/forward");
  url.searchParams.set("q", query);
  url.searchParams.set("limit", limit.toString());
  url.searchParams.set("autocomplete", "true");
  url.searchParams.set("access_token", token);

  const res = await fetch(url, { signal });
  if (!res.ok) throw new Error(`Mapbox Geocoding ${res.status}`);

  const data = await res.json();
  return data.features.map((f: any) => ({
    latitude: f.geometry.coordinates[1],
    longitude: f.geometry.coordinates[0],
  }));
}
```

### Alternative: Mapbox SDK
```ts
import mbxClient from "@mapbox/mapbox-sdk";
import mbxGeocoding from "@mapbox/mapbox-sdk/services/geocoding";

const baseClient = mbxClient({ accessToken: process.env.MAPBOX_TOKEN! });
const geocoding = mbxGeocoding(baseClient);

export async function geocodeSdk(query: string) {
  const resp = await geocoding.forwardGeocode({
    query,
    limit: 1,
  }).send();
  const feature = resp.body.features[0];
  return {
    latitude: feature.center[1],
    longitude: feature.center[0],
  };
}
```

### Client‑Side Autocomplete (`SearchBar.tsx`)
```tsx
const geocode = useCallback(
  debounce(async (text: string) => {
    if (text.length < 3) return;
    const res = await fetch(`/api/geocode?q=${encodeURIComponent(text)}`);
    setSuggestions(await res.json());
  }, 300),
  []
);
```
Use **Mapbox GL Geocoder** (plugin) or the newer **`@mapbox/search-js` AddressAutofill** component for drop‑in UI if bundle size allows. For a custom UX, the above fetch approach suffices.

### Error Handling & Resilience
* If Mapbox returns HTTP 429/5xx, retry with exponential backoff starting at 500 ms (max 3 attempts).
* Surface user‑friendly messages on network failures.
* Cache successful results in Redis for 24 h, key = `geo:{q}`.

### Privacy Offset
After geocoding, add a random 50‑400 ft (~15‑120 m) vector before sending lat/lng to the client map. Use `geoRandomOffsetMeters(15,120)` utility.

### Testing
* Mock Mapbox API via `nock` in unit tests.
* E2E Playwright: type "Seattle" → ensure suggestions contain "Seattle, WA, USA", select → latitude ≈47.6.

### Open Questions
1. Do we need permanent geocoding (storage flag) for analytics? Default is temporary.
2. If we hit rate limits during fast typing, should we throttle keystrokes or queue requests?


*This plan will evolve as we progress; track outstanding tasks in our JIRA backlog under EPIC `MVP‑Feat1`.*
