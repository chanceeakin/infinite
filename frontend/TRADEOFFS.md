# Architectural Assumptions & Tradeoffs

## Data Loading: Static JSON Import vs. Fetch

Hotels data is imported directly at module load time (`import hotelsData from "../../public/data/hotels.json"`), not fetched via an API route or `fetch()`.

**Why**: With 40 records and a static dataset the simplest approach is a direct import. It eliminates loading states, avoids network round-trips, and makes filtering purely synchronous. A real app would swap this for an API call or server data-fetch, but that complexity would obscure the UI logic the assignment is evaluating.

**Tradeoff**: Data is bundled into the JS payload and cannot be refreshed without a redeploy. For a real product, an API + SWR/React Query would be appropriate.

---

## State Management: Local Hooks vs. Zustand/Redux

Filter state lives in `useHotelFilters` (a single `useState` + `useMemo` hook). There is no global store.

**Why**: The dashboard is the only consumer of filter state. Lifting it into a store would add indirection with no benefit at this scope. `useMemo` ensures the filtered list is only recomputed when filters change.

**Tradeoff**: If filters needed to persist across routes (e.g., "Back to search preserves filters"), a store or URL search params would be cleaner. URL params would also make deep-linking to a filtered view possible.

---

## Room Availability: Date String Comparison vs. Date Objects

`isRoomAvailable` accepts ISO date strings (`"YYYY-MM-DD"`) and compares them against the room's `available_dates` array using a `Set` lookup.

**Why**: The dataset stores dates as strings. Keeping the comparison in string-space avoids `Date` object construction entirely in the hot path. It also sidesteps timezone drift — `new Date("2026-07-10")` is parsed as UTC midnight, which can resolve to the previous calendar day in negative-offset timezones when calling `toISOString()`. Using local-date constructors (`new Date(y, m-1, d)`) or pure string operations removes the class of bugs entirely.

**Tradeoff**: The function trusts that all date strings in the dataset are valid `"YYYY-MM-DD"` format. No parsing validation is performed (acceptable per the assignment's note about skipping robust error handling).

---

## Price Range Filter: "Any Room in Range" vs. "Lowest Room Price in Range"

A hotel passes the price filter if **any** of its rooms falls within the selected range, not just the cheapest.

**Why**: This is the most permissive and discovery-friendly behavior. If the user sets a max price of $200, they should still see a hotel that has a $150 room, even if it also has a $400 suite.

**Tradeoff**: Could be counterintuitive if users expect to filter by "starting from" price only.

---

## Routing: Dedicated Pages vs. Modal/Drawer

Hotel detail is a separate Next.js App Router page (`/hotels/[id]`), not a modal overlay or side panel.

**Why**: Dedicated routes give each hotel a shareable URL, support native browser back/forward, and integrate naturally with Next.js's prerendering. Modals would require more client-side state management and break deep-linking.

**Tradeoff**: Navigating to detail and back does a full page transition. A modal could feel snappier for quick peeks, but the tradeoffs favor routes for a real product.

---

## No "use client" on Detail Page

`app/hotels/[id]/page.tsx` is a React Server Component that renders static content (name, amenities, policies) and passes `hotel.rooms` down to `<RoomAvailabilityChecker>`, which is a Client Component.

**Why**: This is the recommended composition pattern in Next.js App Router. Server Components handle data access; Client Components handle interactivity. The boundary is the `RoomAvailabilityChecker`, which owns all date-picker state.

---

## Date Picker Bounds: Derived from Room Data vs. Dedicated Availability Endpoint

The `DateRangePicker` `min`/`max` attributes are computed from the hotel object that the detail-page server component already fetched — specifically, the union of every room's `available_dates` array. The earliest date across all rooms becomes the check-in `min`; the latest becomes the check-in `max` and check-out `max - 1` (check-out allows one day past the last available night so the user can actually book that final night).

**Why**: The hotel detail page already fetches the full hotel object, which includes each room's `available_dates`. Computing min/max there adds negligible cost and eliminates an extra API round-trip. For this static mock dataset the approach is correct: the available dates don't change, and constraining the calendar to the actual date window immediately shows the user where to look (e.g., all of June is greyed out; only July 10–14 is selectable).

**Tradeoff**: This would not work in production. A real inventory system has availability that changes in real time (bookings, cancellations, dynamic pricing). Deriving bounds from a stale room object would show incorrect constraints. The right approach is a dedicated endpoint — something like `GET /hotels/{id}/availability?month=YYYY-MM` — that returns the open date range for a given window, called lazily as the user navigates the calendar. The component would then shade unavailable dates dynamically, similar to Airbnb's or Booking.com's calendar pickers.

---

## Tests: Unit-First, No E2E

Tests cover the pure availability logic and filter hook thoroughly, with lighter component smoke tests for `HotelCard` and `RoomAvailabilityChecker`.

**Why**: The core business logic (availability calculation, filter reduction) is where bugs are most likely and most impactful. Component tests verify the wiring, not the logic. E2E tests (Playwright/Cypress) would add value for a production app but are out of scope for a 3-hour assignment.
