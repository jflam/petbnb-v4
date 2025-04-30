# Map & Search Enhancements Plan

## 1. Location & Geocoding
- DB schema
  - Ensure `sitters.address` is NOT NULL.
  - Add `latitude` and `longitude` columns (nullable, default NULL).
- Search endpoint (`/api/v1/sitters/search`)
  1. Accept `address` as authoritative source.
  2. When filtering by location:
     - If `req.query.latitude`/`longitude` provided, use them.
     - Else if sitter’s stored coords are NULL, call `geocode(address)` once, persist results, then use them.
  3. Fallback to server‐side geocode of raw `location` param when no sitter data yet.
- Geocode service
  - Already implements `geocode()` + `addPrivacyOffset()`.
  - Ensure `/api/geocode` returns offset coords for dropdown/map.

## 2. Ranking & Sort
- Create `config/ranking.json`:
  ```json
  { "distance": 0.4, "rating": 0.25, "availability": 0.15, "responseRate": 0.1, "repeatClient": 0.1 }
  ```
- In `/api/v1/sitters/search`
  1. After filtering & Haversine distance, normalize each signal to [0–1].
  2. Compute weighted score per config.
  3. If `sort=price` or `sort=rating`, override score sort accordingly.
  4. Return sorted DTO.

## 3. Expanded Filters
- Front‑end (`FiltersSidebar`)
  - Sync `petSize[]`, `specialNeeds[]`, `homeFeatures[]`, `certifications[]` to URL.
- Back‑end query builder
  - Apply `maxDistance` filter to distance calc.
  - Filter JSON arrays for `special_needs`, `home_features`, `certifications`.
  - Handle `topSittersOnly`: `WHERE top_sitter = true`.

## 4. Listing Card Enhancements
- `SitterCard` component
  - Wrap ★ rating in a Tooltip showing `review_count`.
  - Show `median_response_time` badge.
  - Compute & display repeat‐client % (`repeat_client_count / total_client_count`).
  - If multiple services, render “[Service] from $X · [Service2] from $Y”.

## 5. Interactive Map Behavior
- UI
  - Add `<ViewToggle>` in results header; maintain `view` state in App.
  - Render `MapView` only when `view==='map'`.
  - Include “Search this area” button and optional “Auto‐update” checkbox.
- Map implementation
  - Lazy‐load map library.
  - Center on last search coords; zoom via sitter distances.
  - Numbered pins & popup with metadata.
  - Enable clustering when >50 pins.
  - Render heatmap overlay when >200 pins.
  - Fade out filtered‐out pins (30% opacity).
- Accessibility & analytics
  - Keyboard nav + ARIA‐live region for top 3 visible sitters.
  - Emit `map_viewport_changed`, `map_pin_clicked`, `search_this_area`, `heatmap_rendered` events.

---

## Sample Data Update: 5 Sitters → Austin, TX
In `server/seeds/02_sitters_seed.js`, update five existing sitter objects’ `address` to Austin addresses; set their `latitude` and `longitude` to `null` so geocoding will populate them on first use.
