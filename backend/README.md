# Hotel Discovery API

A lightweight RESTful API for browsing hotels, written in Go using only the standard library.

## Requirements

- Go 1.22 or later (uses the enhanced `net/http` router with `{id}` path parameters)

## Running

```bash
cd backend
go run .
# listens on :8080 by default
```

Environment variables (all optional):

| Variable    | Default                   | Description                         |
|-------------|---------------------------|-------------------------------------|
| `PORT`      | `8080`                    | TCP port to listen on               |
| `DATA_PATH` | `../data/hotels.json`     | Path to the hotels JSON seed file   |

## Testing

```bash
go test ./...
```

Runs unit tests for the store query logic and integration tests for all HTTP handlers using `httptest`.

## API Reference

### `GET /hotels`

Returns all hotels, optionally filtered.

| Query param | Type   | Description                                |
|-------------|--------|--------------------------------------------|
| `city`      | string | Exact city name match                      |
| `min_stars` | int    | Minimum star rating (inclusive)            |
| `max_stars` | int    | Maximum star rating (inclusive)            |
| `min_price` | float  | Min price/night — hotel must have ≥1 room in range |
| `max_price` | float  | Max price/night — hotel must have ≥1 room in range |

**200 OK**
```json
{ "hotels": [...], "total": 40 }
```

### `GET /hotels/{id}`

Returns full details for a single hotel.

**200 OK** — hotel object  
**404 Not Found** — `{ "error": "hotel not found" }`

### `GET /hotels/{id}/rooms`

Returns available rooms for a date range.

| Query param  | Type   | Required | Description              |
|--------------|--------|----------|--------------------------|
| `check_in`   | string | yes      | `YYYY-MM-DD`             |
| `check_out`  | string | yes      | `YYYY-MM-DD`             |

A room is returned only if every night from `check_in` through `check_out - 1 day` appears in its `available_dates` list.

**200 OK**
```json
{ "rooms": [...], "total": 2, "hotel_id": "hotel-01", "check_in": "2026-07-10", "check_out": "2026-07-12" }
```
**400 Bad Request** — missing or invalid dates  
**404 Not Found** — hotel not found

## Architecture

```
backend/
├── main.go                     ← HTTP server, CORS middleware, wiring
└── internal/
    ├── models/hotel.go         ← data types
    ├── store/store.go          ← in-memory store, filter/availability logic
    └── handlers/hotels.go      ← HTTP handlers (thin: parse → store → encode)
```

- **No external dependencies** — stdlib only (`net/http`, `encoding/json`, `os`, `time`)
- **In-memory store** — hotels JSON is loaded once at startup into a slice + id→pointer map
- **Separation of concerns** — handlers contain no business logic; all filtering/availability lives in the store layer

## AI Tooling

This project was built with Claude Code (claude-sonnet-4-6) via the Anthropic Claude Code CLI. AI was used for:

- Scaffolding the package structure (models, store, handlers)
- Writing all tests against a fixture store (no real filesystem dependencies)
- Wiring CORS middleware to avoid browser cross-origin issues with the companion Next.js frontend
- Choosing `net/http` with Go 1.22 routing over external router libraries to keep the dependency list at zero
