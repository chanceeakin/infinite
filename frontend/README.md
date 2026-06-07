# Hotel Discovery Interface

A lightweight hotel discovery frontend built with Next.js 15, TypeScript, and Tailwind CSS.

## Setup & Running

```bash
cd frontend
npm install
npm run dev       # starts dev server at http://localhost:3000
npm run build     # production build
npm run test      # run all tests (Vitest)
npm run test:watch  # interactive test watch mode
```

The app reads hotel data from `public/data/hotels.json` (40 properties, 10 cities). No backend or external API is required.

## Features

- **Search & Filter Dashboard** (`/`): Browse all 40 properties with live filtering by city, star rating, and price range
- **Hotel Detail View** (`/hotels/[id]`): Full property info including amenities, policies, and contact details
- **Room Availability Checker**: Select check-in/check-out dates to see which rooms are open and at what price

## Component Breakdown

```text
src/
├── app/
│   ├── page.tsx                     # Dashboard (filter + grid)
│   └── hotels/[id]/page.tsx         # Hotel detail + room checker
├── components/
│   ├── filters/                     # FilterPanel, CityFilter, StarRatingFilter, PriceRangeFilter
│   ├── hotels/                      # HotelCard, HotelGrid, EmptyState
│   ├── hotel-detail/                # HotelHeader, AmenitiesList, PolicyInfo
│   ├── rooms/                       # RoomAvailabilityChecker, DateRangePicker, RoomCard, NoRoomsState
│   └── ui/                          # StarRating, Badge (reusable primitives)
├── hooks/
│   ├── useHotelFilters.ts           # Filter state + memoized filtered list
│   └── useRoomAvailability.ts       # Date state + available rooms list
├── lib/
│   ├── hotels.ts                    # Data access helpers (getHotelById, getPriceRange, etc.)
│   └── availability.ts              # Pure availability logic (isRoomAvailable, getAvailableRooms)
└── types/
    └── hotel.ts                     # TypeScript interfaces (Hotel, Room, Address, Policy, FilterState)
```

## State Management

No external state library. The app uses two custom hooks built on `useState` + `useMemo`:

- `useHotelFilters` — holds filter values, derives the filtered hotel list via `useMemo` (no unnecessary re-computations)
- `useRoomAvailability` — holds check-in/check-out strings, derives available rooms via `useMemo`

All hotel data is imported directly from the JSON file at module load — no async fetching, no loading states needed.

## Empty & Error States

- **No hotels found**: `EmptyState` component shown when filters produce zero results
- **No dates selected**: `NoRoomsState` with instructional text (not an error — just a prompt)
- **No rooms for dates**: `NoRoomsState` with "No rooms available" message and a suggestion to try different dates
- **Unknown hotel ID**: Next.js `notFound()` triggers the built-in 404 page

## AI Tooling

This project was built with Claude Code (claude-sonnet-4-6) via the Anthropic Claude Code CLI. AI was used for:

- Scaffolding all component, hook, and lib files from the architectural plan
- Writing Vitest unit tests for core logic
- Identifying and fixing a timezone-drift bug in date availability checking (`new Date("YYYY-MM-DD")` parses as UTC; replaced with a local-date constructor to avoid off-by-one errors across timezones)
- Reviewing Next.js 15 docs for the `params: Promise<{id}>` breaking change and applying the correct `await params` pattern in the dynamic route page
