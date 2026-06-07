# Architectural Assumptions & Tradeoffs

## In-Memory Store vs. Database

Hotels are loaded from JSON once at startup and held in memory. There is no database.

**Why**: The dataset is 40 static records. An in-memory `map[string]*Hotel` gives O(1) lookup and avoids the operational cost of a database (connection pooling, migrations, schema). For a real production service, a relational DB or search platform would be appropriate.

**Tradeoff**: Changes to the data file require a server restart. No write endpoints are implemented, so this is acceptable for the assignment scope.

---

## Standard Library Only (No Router Framework)

All routing uses Go 1.22's enhanced `net/http` ServeMux with `GET /hotels/{id}` path-parameter syntax.

**Why**: Zero dependencies means no `go.sum` churn, no CVE surface from third-party packages, and no hidden magic. Go 1.22's routing covers everything this API needs: method matching, wildcard path segments, and clean `r.PathValue("id")` access.

**Tradeoff**: If the API grew to need middleware chains, request validation structs, or OpenAPI generation, a framework like `chi` or `echo` would add that ergonomics cheaply. At this scope it would be over-engineering.

---

## Filter Logic: "Any Room in Price Range"

A hotel passes the `min_price`/`max_price` filter if **at least one room** falls within the range.

**Why**: This is the most permissive, discovery-friendly behavior. A hotel with both a $150 budget room and a $600 suite should appear when filtering `max_price=200`.

**Tradeoff**: Could mislead users into clicking a hotel expecting cheap rooms, only to find they're all gone for their dates. A real API might also expose a `min_available_price` field computed from available rooms for the requested dates.

---

## Room Availability: Date-Set Intersection

A room is considered available for a stay if every calendar night (`check_in` through `check_out - 1 day`) is present in the room's `available_dates` array. This is a Set membership test, not a calendar/booking engine.

**Why**: Directly matches the data model. The mock data records which specific dates are open — checking set membership is exact and O(n) in dates.

**Tradeoff**: The data model means a room can have arbitrary "holes" in availability. A real system would typically model bookings and derive availability; the seed data's `available_dates` array is a denormalized snapshot.

---

## CORS: Permissive Wildcard

The CORS middleware allows `*` origin for development.

**Why**: The companion Next.js frontend runs on a different port (3000 vs 8080). In development, wildcard CORS is the simplest configuration. For production, `Access-Control-Allow-Origin` should be locked to the actual frontend domain.

---

## Error Codes Returned

| Status | When |
|--------|------|
| 200 OK | Successful search, detail, or room availability |
| 400 Bad Request | Missing or invalid `check_in`/`check_out` params; `check_out` not after `check_in` |
| 404 Not Found | Hotel ID not found in the store |

No 500s are surfaced to clients — if the store fails to load at startup, the server exits before accepting connections.

---

## Dates: Server-Side vs. Client-Side

The previous (frontend-only) version computed room availability entirely client-side from the `available_dates` JSON. Moving this to the backend means:
- The frontend sends `check_in`/`check_out` and receives only the rooms that match — it doesn't need to download all `available_dates` and filter locally.
- Date parsing and validation errors are returned as 400 responses with clear messages, rather than silently returning empty results.
