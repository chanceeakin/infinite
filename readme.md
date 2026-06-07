# Hotel Discovery — Full-Stack Take-Home

A production-ready hotel discovery platform built as a full-stack take-home assignment. The Go backend serves hotel data via a RESTful API; the Next.js frontend consumes it to deliver a search/filter dashboard, hotel detail views, and a live room availability checker.

## Repository Structure

```text
.
├── data/
│   └── hotels.json           ← 40-property mock dataset (shared source of truth)
├── backend/                  ← Go REST API (stdlib only, no external deps)
└── frontend/                 ← Next.js 15 + TypeScript + Tailwind CSS
```

---

## Quick Start

You need **Go 1.22+** and **Node.js 18+**.

```bash
# 1 — Start the API (port 8080)
cd backend
go run .

# 2 — In a new terminal, start the frontend (port 3000)
cd frontend
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Backend — `backend/`

A lightweight RESTful API written in Go using only the standard library.

### Commands

```bash
cd backend
go run .          # starts on :8080
go test ./...     # runs all tests
```

| Env variable | Default | Description |
| --- | --- | --- |
| `PORT` | `8080` | TCP port |
| `DATA_PATH` | `../data/hotels.json` | Path to the JSON seed file |

### API Reference

#### `GET /hotels`

Returns all hotels, with optional filtering.

| Query param | Type | Description |
| --- | --- | --- |
| `city` | string | Exact city name |
| `min_stars` | int | Minimum star rating (inclusive) |
| `max_stars` | int | Maximum star rating (inclusive) |
| `min_price` | float | Min room price/night |
| `max_price` | float | Max room price/night |

```json
{ "hotels": [...], "total": 40 }
```

#### `GET /hotels/{id}`

Full property details for one hotel.

**200** — hotel object  
**404** — `{ "error": "hotel not found" }`

#### `GET /hotels/{id}/rooms?check_in=YYYY-MM-DD&check_out=YYYY-MM-DD`

Rooms available for the entire requested stay. A room is returned only if every night from `check_in` through `check_out - 1` appears in its `available_dates` list.

```json
{ "rooms": [...], "total": 2, "hotel_id": "hotel-01", "check_in": "2026-07-10", "check_out": "2026-07-12" }
```

**400** — missing or invalid dates  
**404** — hotel not found

### Architecture

```text
backend/
├── main.go                      ← server setup, CORS middleware, env config
└── internal/
    ├── models/hotel.go          ← typed structs matching the JSON schema
    ├── store/store.go           ← in-memory store: filter + availability logic
    └── handlers/hotels.go       ← thin HTTP handlers (parse → store → encode)
```

- **No external dependencies** — `net/http`, `encoding/json`, `os`, `time` only
- **Go 1.22 routing** — uses `{id}` path parameters and method-based matching via the enhanced `ServeMux`
- **In-memory store** — JSON loaded once at startup into a slice + `map[string]*Hotel` for O(1) lookup
- **CORS** — permissive `*` origin for local development so the Next.js dev server can call the API directly

---

## Frontend — `frontend/`

A Next.js 15 App Router application with TypeScript and Tailwind CSS.

### Setup & Commands

```bash
cd frontend
npm install
npm run dev          # dev server at http://localhost:3000
npm run build        # production build
npm run test         # Vitest test suite
npm run test:watch   # interactive watch mode
```

Set `NEXT_PUBLIC_API_URL` in `frontend/.env.local` (defaults to `http://localhost:8080`).

### Features

- **Search & Filter Dashboard** (`/`) — browse all 40 properties; live filtering by city, star rating, and price range; no page reload required
- **Hotel Detail View** (`/hotels/[id]`) — full property info: name, address, description, amenities, policies, contact
- **Room Availability Checker** — select check-in/check-out dates; queries the Go backend in real time and shows matching rooms with price per night; shows empty state when no rooms match. The date picker's `min`/`max` bounds are derived from the hotel's own `available_dates` data so the calendar immediately greys out months with no inventory (see [TRADEOFFS.md](frontend/TRADEOFFS.md) for why this works here but wouldn't in a live system)

### Frontend Architecture

```text
frontend/src/
├── app/
│   ├── page.tsx                      ← Server Component: fetches hotels, passes to client
│   └── hotels/[id]/page.tsx          ← Server Component: fetches hotel by ID
├── components/
│   ├── hotels/
│   │   ├── HotelDashboard.tsx        ← Client Component: filter state + grid
│   │   ├── HotelCard.tsx             ← card with name, city, stars, lowest price
│   │   ├── HotelGrid.tsx             ← responsive grid or empty state
│   │   └── EmptyState.tsx
│   ├── filters/
│   │   ├── FilterPanel.tsx           ← filter sidebar container
│   │   ├── CityFilter.tsx            ← city dropdown
│   │   ├── StarRatingFilter.tsx      ← star toggle buttons
│   │   └── PriceRangeFilter.tsx      ← dual-handle range slider
│   ├── hotel-detail/
│   │   ├── HotelHeader.tsx           ← name, address, rating, reviews
│   │   ├── AmenitiesList.tsx         ← amenity badge list
│   │   └── PolicyInfo.tsx            ← check-in/out + cancellation
│   ├── rooms/
│   │   ├── RoomAvailabilityChecker.tsx ← date picker + API fetch + room list
│   │   ├── DateRangePicker.tsx
│   │   ├── RoomCard.tsx
│   │   └── NoRoomsState.tsx
│   └── ui/
│       ├── StarRating.tsx            ← reusable star display
│       └── Badge.tsx                 ← reusable pill badge
├── hooks/
│   ├── useHotelFilters.ts            ← filter state + memoized filtered list
│   └── useRoomAvailability.ts        ← date state + fetch from /hotels/{id}/rooms
├── lib/
│   ├── api.ts                        ← typed fetch functions (fetchHotels, fetchHotel, fetchAvailableRooms)
│   └── hotels.ts                     ← pure utility functions (getLowestRoomPrice, etc.)
└── types/
    └── hotel.ts                      ← Hotel, Room, Address, Policy, FilterState interfaces
```

**State management** — no external library. `useHotelFilters` uses `useState` + `useMemo` for client-side filter state over data fetched server-side. `useRoomAvailability` uses `useEffect` to call the backend when dates change.

**Server / Client split** — pages are Server Components that fetch data from the Go API; interactive pieces (`HotelDashboard`, `RoomAvailabilityChecker`) are Client Components. This keeps the JS bundle lean and makes each hotel URL directly shareable.

### Empty & Error States

| Situation | UI |
| --- | --- |
| No hotels match filters | `EmptyState` — "No hotels found, adjust your filters" |
| Dates not yet selected | `NoRoomsState` — instructional prompt |
| No rooms for selected dates | `NoRoomsState` — "No rooms available, try different dates" |
| Unknown hotel ID | Next.js built-in 404 page via `notFound()` |

---

## AI Tooling

This project was built end-to-end with **Claude Code** (`claude-sonnet-4-6`) via the Anthropic Claude Code CLI.

**Backend** — AI scaffolded the package structure, wrote all handler and store logic, wrote tests against a fixture store (no real filesystem dependencies in tests), and identified that Go 1.22's enhanced `ServeMux` eliminated the need for any external router dependency.

**Frontend** — AI scaffolded all component, hook, and lib files from an architectural plan, caught and fixed a timezone-drift bug in date availability checking (`new Date("YYYY-MM-DD")` parses as UTC; the fix uses a local-date constructor), and applied the Next.js 15 `params: Promise<{id}>` breaking change in the dynamic route page.

**Integration** — AI designed the Server/Client Component split so the dashboard page server-renders the initial hotel list from the Go API, and only the interactive filter shell and room checker run client-side. It also wired CORS middleware on the Go side to allow browser fetches from the Next.js dev server.
