## Overview
PetBnB is an Airbnb‑style web marketplace that connects pet owners with verified sitters. The core value proposition is to make finding safe, reliable, and convenient care for pets as frictionless as booking a short‑term rental. The initial web release focuses on surfacing sitter listings that match an owner’s search criteria, visible to both anonymous visitors and authenticated users.

The high‑level layout is derived from the provided sketch:
* **Global Search Bar** across the top for free‑text location, date, and keyword queries.
* **Filters Sidebar** on the left with toggleable facets (dates, pet type, services, price, distance, rating, sitter certifications).
* **Listing Grid** in the main content area displaying sitter cards (square photos, name, rate, rating, quick descriptors).
* **Profile / Settings Menu** in the top‑right corner (avatar icon) that conditionally shows login/register or account links.

Significant changes to the product vision, user flows, or page layout must be reflected in this Overview.

---
## Competitive Landscape
### Rover
*Founded in 2011, Rover is the largest North‑American marketplace for pet boarding, house sitting, and dog walking. Key learnings that inform PetBnB’s MVP:*

**Discovery UX**
* Multi‑category service filter (Boarding, House Sitting, Drop‑In, Day Care, Dog Walking) sits at the top of the filter stack and visibly toggles listings.
* Map‑and‑list dual view lets owners visually gauge sitter density; the map auto‑updates as the user pans. 
* Sidebar filters include: date range, pet type (dog/cat), dog size buckets, nightly rate slider, “Star Sitter” toggle, and add‑on services (puppy care, bathing, training).

**Listing Card Signals**
* Prominent sitter photo, nightly rate, star rating, review count, repeat‑client count, and distance from search center.
* Trust badges: *Verified Background Check*, *Star Sitter*, and *Rover 101* training give instant credibility.
* Availability freshness label (e.g., “Updated 3 days ago”) reduces stale bookings.

**Trust & Safety**
* All sitters pass a third‑party **enhanced criminal background check** and bookings are backed by **RoverProtect** (up to $25k vet reimbursement & 24/7 support).

**Ranking Insights**
* Algorithm weights acceptance rate, response time, review quality, and grants a temporary boost for new sitters to ensure marketplace liquidity.

These practices highlight the importance of credibility badges, up‑to‑date availability signals, map context, and robust filters—each folded into our MVP below.

### Wag!
* Known for on‑demand dog walking and boarding.
* Strengths: background‑checked walkers, live GPS tracking.
* Weaknesses: higher service fees, less emphasis on overnight care.

_Additional competitors will be added as they are researched._

---
## Features
### 1. Sitter Discovery & Listing (MVP Feature)
#### Motivation
Pet owners need a fast, trustworthy way to discover sitters who meet their location, schedule, and service requirements. This feature solves the “where do I start?” problem when browsing the marketplace.

#### User Stories
* **Anon‑Browse‑01:** As an unauthenticated pet owner, I can browse a list of sitters near a default location so I can gauge availability before creating an account.
* **Search‑01:** As any user, I can enter a city or ZIP code, select service dates, and see updated sitter results so that listings are relevant to my trip.
* **Filter‑01:** As any user, I can refine results by price, rating, pet type, and services to quickly narrow my choices.
* **Auth‑Personalize‑01:** As an authenticated user with saved pets, the platform pre‑filters sitters who accept my pet’s type and size.
* **Card‑Details‑01:** As any user, I can click a sitter card to open a details page containing bio, availability calendar, and reviews.

#### Requirements
1. 
* **R1**: Global search bar accepts location text and date range; hitting **Enter** refreshes results.
* **R2**: Filters sidebar includes service type (boarding, house sitting, drop‑in, day care, walking), pet type, dog size buckets, nightly rate slider, rating, sitter certifications, distance slider, and a *Top Sitter* toggle.
* **R3**: Anonymous sessions default location via IP geolocation with fallback.
* **R4**: Results surface in a responsive list **and** optional map view; the map auto‑pans with list results and can be toggled on/off.
* **R5**: `/api/v1/sitters/search` supports all filter params and returns sitter objects with distance, verification badges, `availability_updated_at`, and `repeat_client_count`.
* **R6**: Each sitter card displays a square hero photo, nightly rate, star rating (one decimal), distance label (e.g., “2.1 mi”), verification badges, and repeat‑client metric.
* **R7**: Logged‑in users see sitters ranked by compatibility; ranking algorithm also factors acceptance rate and response time.
* **R8**: Clicking a card routes to `/sitters/{id}` while preserving query params.
* **R9**: Empty‑state UI includes illustration, explanatory copy, and a **Reset Filters** call‑to‑action.

#### Acceptance Criteria (Gherkin)
```gherkin
Feature: Sitter Discovery
  Scenario: Anonymous user performs a basic search
    Given I am not logged in
    When I navigate to "/" and enter "Seattle, WA" in the search bar and submit
    Then I should see sitter cards located in Seattle within the listing grid

  Scenario: Authenticated user sees personalized ranking
    Given I am logged in as "john@example.com" with a saved cat profile
    When I search for "Seattle, WA" with dates "2025‑05‑01 to 2025‑05‑05"
    Then sitters who accept cats should appear in the first positions of the grid

  Scenario: Applying multiple filters narrows results
    Given the listing grid shows 100 sitters
    When I select "Price ≤ $50" and "Rating ≥ 4.5"
    Then the grid should update to ≤ 100 sitters and all displayed sitters must meet both criteria

  Scenario: No results triggers empty state
    Given I filter by "Price ≤ $10" and "Rating ≥ 5"
    Then an empty‑state illustration and message "No sitters match your filters" should appear
```

#### Testing (Playwright)
* **test‑anon‑search.spec.ts**
  * Load home page → fill search input → assert URL contains query params → wait for API call → expect at least one sitter card.
* **test‑auth‑personalization.spec.ts**
  * Login fixture (create cat profile) → perform search → assert that first ten cards each include "🐱" badge.
* **test‑filtering.spec.ts**
  * Perform unfiltered search → capture initial card count → toggle price slider → expect reduced count and all prices ≤ slider value.
* **test‑no‑results.spec.ts**
  * Apply impossible filter combination → expect `data‑cy=empty‑state` element to be visible.

---
### Backlog Features (stubs)
1. Authentication & Onboarding
2. Sitter Profile Page
3. Booking & Payment Flow
4. Messaging & Notifications
5. Reviews & Trust Badges
6. Responsive Mobile Layout

Detailed specs will be added in separate Feature sections as the project progresses.

