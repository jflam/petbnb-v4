# PetBnB – Product Specification (v1.1 – Rover‑informed)

## Overview

PetBnB is an Airbnb‑style, two‑sided marketplace that connects pet owners with background‑checked, verified sitters for in‑home or in‑sitter‑home pet care.  Owners can quickly discover nearby sitters who match their pets’ needs, review sitter profiles, and book securely through the platform.  Sitters gain a flexible income stream while PetBnB handles marketing, trust & safety, and payment processing.

This revision incorporates **deep competitive research on Rover** to sharpen our sitter‑discovery MVP and ensure feature‑parity—or strategic differentiation—at launch.

---

## Competitive Landscape

### Rover (Deep‑dive)

- **Founded / Scale** – 2011; > 2 million pet parents, 500 K+ sitters globally. Revenue from 20 % marketplace fee.
- **Core Services** – Boarding, House Sitting, Drop‑in Visits, Doggy Day Care, Dog Walking.
- **Search UX**
  - Unified **location/date** search bar with auto‑complete.
  - Toggleable **Map + List** view.
  - Extensive filters: pet type & size, age, special needs, service type, price range, home features (fenced yard, children‑free), sitter attributes (home full‑time, accepts last‑minute bookings).
- **Listing Card Elements** – Hero image; sitter name; ★ average rating + review count; starting price; response time (“Responds within 15 min”); repeat‑client %; distance badge.
- **Ranking Signals** – Distance & availability → reputation factors (rating, response rate/time, repeat‑client %, booking rate) → profile completeness; new sitters receive temporary exposure boost.
- **Trust & Safety** – Mandatory basic background check (U.S.), Rover Guarantee (24/7 vet assistance), SECURE payments, photo updates.
- **Pain Points (Opportunities)** – Algorithm opacity; high fees; limited license verification for specialised care; complaints around requests outside sitter radius.

### Wag! / TrustedHousesitters

*Placeholders – to be completed later.*

---

## Features

### 1  Sitter Discovery & Search (MVP – Rover‑informed)

#### Motivation

Pet owners must evaluate sitter options instantly—without account friction—while receiving confidence‑building data (rating, response time, repeat clients) pioneered by market leader Rover.  Leveraging these patterns speeds user trust and increases conversion.

#### User Stories (additions highlighted)

- **LO‑US‑03** As a *logged‑out owner*, I can switch between **List** and **Map** view so that I visualise sitter proximity.
- **LI‑US‑04** As a *logged‑in owner*, I can filter sitters by **pet size** (XS–XL) and **special needs** (medication, senior care) so that my unique requirements are met.
- **LI‑US‑05** As a *logged‑in owner*, I can sort results by **rating**, **price**, or **distance** so that I can prioritise what matters most.

#### Requirements (delta additions)

1. **View Toggle** – Add Map/List switch (default List).  Map pins cluster on zoom out.
2. **Expanded Filters**
   - **Pet Size** (XS <15 lb, S 15‑39 lb, M 40‑69 lb, L 70‑99 lb, XL ≥100 lb).
   - **Special Needs** checkbox group (Puppy <1 yr, Senior >8 yr, Medication‑required, Reactive).
   - **Home Features** (Fenced Yard, Smoke‑free, No other pets).
3. **Listing Card Enhancements**
   - ★ Rating displayed with tooltip showing review count.
   - **Response Time** badge (derived from median of last 30 enquiries).
   - **Repeat‑client %** indicator.
   - Two service price points shown if sitter offers multiple services (e.g., Boarding from \$45 · Day Care from \$30).
4. **Ranking Algorithm (v0.5)** – Score = 0.4 × Distance (normalised) + 0.25 × Rating + 0.15 × Availability match + 0.1 × Response Rate + 0.1 × Repeat‑client %.  Tunable weights stored in Config.
5. **Sort Options** – Distance (default), Price (asc), Rating (desc).
6. **URL‑driven State** extended to `petSize`, `specialNeeds[]`, `sort`.

#### Acceptance Criteria (additions)

```gherkin
  Scenario: Toggle to map view
    Given I have performed a sitter search
    When I click the "Map" toggle
    Then the results grid is replaced by an interactive map with clustered sitter pins
    And the List/Map toggle indicates "List" as the alternate view

  Scenario: Filter by pet size and special needs
    Given I have performed a search
    When I select pet size "M" and special need "Medication‑required"
    Then only sitters who accept medium dogs and administer medication are shown

  Scenario: Sort by rating
    Given results are displayed
    When I choose the "Rating" sort option
    Then sitter cards are ordered by rating descending
```

#### Testing (Playwright additions)

- **mapToggle.spec.ts** – Assert map renders via Leaflet, clusters at <8 zoom.
- **petSizeFilter.spec.ts** – Seed two sitters (S, M); apply size filter; assert correct filtering.
- **sortRating.spec.ts** – Ensure sorting toggles query param and order.

### 2  Interactive Map Behavior & Sitter Visibility

#### Core Map Features
- **Map / List Synchronisation**  
  - Toggle sits in the results header (default **List**).  
  - In **Map** view, panning/zooming does **not** auto‑refresh; instead a sticky **Search this area** button appears top‑right.  
  - An optional *Auto‑update as map moves* checkbox triggers live updates (mirrors Rover UX). [1]
- **Initial Viewport** – Centered on the user‑entered location; zoom calibrated to include ~50 closest matches (fallback: 15‑mile radius).
- **Pins & Clustering**  
  - Pins are **numbered** to match their card order in the side list.  
  - Marker clustering activates when > 50 sitters share the viewport; cluster bubbles display count and "explode" on zoom.
- **Heat‑Map Shading** – When the total sitter count in the current viewport exceeds **200**, render a translucent red‑to‑yellow density overlay beneath the pins.  Heat disappears when zoomed in beyond level 13 to avoid visual clutter.
- **Pin Metadata** – Overlays display nightly price, ★ rating, **repeat‑client %**, and Star‑Sitter badge. Hover reveals a mini‑profile tooltip (photo, name, distance, *View Profile*).
- **Privacy‑First Geocoding** – Apply ±400 ft random offset before rendering pins; the true address is shown only after a booking is confirmed, improving on Rover’s exact pins. [2]
- **Service Radius Overlay (Optional)** – Toggle a dashed circle showing each sitter’s travel radius; compensates for Rover’s fixed ~1‑mile halo. [3]
- **Filter Coupling** – Active filters (pet size, special needs, price, etc.) limit visible pins; filtered‑out sitters fade to 30 % opacity and are non‑interactive.
- **Accessibility & Keyboard Support** – Map is fully navigable via arrow keys + Enter; an ARIA‑live region announces the top three visible sitters whenever the viewport changes.
- **Performance Targets** – Initial map bundle ≤ 250 kB (gzipped); first pin render ≤ 1 s on 4 G using Mapbox GL JS with lazy‑loaded vector tiles.
- **Analytics Hooks** – Emit `map_viewport_changed`, `map_pin_clicked`, `search_this_area`, and `heatmap_rendered` events with bounding‑box and result count.

#### Acceptance Criteria
```gherkin
Scenario: Map search updates only after user confirmation
  Given I have toggled to Map view
  When I drag the map 10 miles south
  Then the "Search this area" button becomes enabled
  And sitter pins do not change until I press the button

Scenario: Privacy offset on pins
  Given a sitter’s geocoded address at LAT 47.6205, LNG -122.3493
  When the map renders pins
  Then the sitter’s pin latitude and longitude differ by at least 50 ft and no more than 400 ft from the true address
```



### 3  Owner ↔ Sitter Messaging

*Unchanged – to be spec’d next.*

### 4  Booking & Payments

*Unchanged – placeholder.*



####


## References
[1] Rover.com Community Q&A: “Can I search for a service member by neighborhood?” — details Rover’s *Search this area* UX (accessed 29 Apr 2025).

[2] Reddit thread r/RoverPetSitting: “Rover search shows home addresses of sitters” — discusses privacy concerns around exact pin locations (accessed 29 Apr 2025).

[3] Rover.com Community Q&A: “Pet sitters service area map is not accurate anymore” — notes loss of adjustable service‑radius halo (accessed 29 Apr 2025).

