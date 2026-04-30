# TGPM React App — Technical Design

## 1. Overview

TempoGeoPoliticalMap (TGPM) is a read-only data visualisation app that presents historical and ongoing political events sourced from Wikipedia via the TGPM backend API. Users can browse events in four views (Table, Timeline, Map, Compact) and filter by event type, date range, and other dimensions. The app has no user accounts and no server-side state; it is a pure client-side frontend backed by a public REST API.

## 2. Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (Pages Router) |
| UI library | React 19 |
| Styling | Tailwind CSS v4 |
| Component library | Ant Design 6 |
| HTTP client | Axios |
| Map | Leaflet + React-Leaflet |
| Code generation | OpenAPI Generator CLI 7.9.0 (typescript-axios) |

## 3. Project Layout

```
pages/
  _app.js          — global styles and Leaflet CSS
  index.js         — single page: header + EventsV2 wrapped in ErrorBoundary
src/
  api/
    api.ts         — single axios instance; base URL from NEXT_PUBLIC_API_URL
  @generated/      — TypeScript models generated from openapi.yaml (do not edit)
  components/
    ErrorBoundary.jsx
    LoadingSpinner.jsx
    MinimalHeader.jsx
    events/
      EventsV2.jsx — top-level data component; uses useEventsV2 hook
  constants/
    eventsV2Types.js — TYPES, STATUSES, REGIONS, REGION_COLORS, TYPE_ICONS
  hooks/
    useEventsV2.js   — fetches /v2/events; returns {events, loading, error}
  mocks/
    handlers.js    — MSW request handlers (test fixture)
    server.js      — MSW node server (test setup)
  partials/
    events/
      EventsTableV2.jsx       — pure table view; receives events[] from parent
      EventsTableItemV2.jsx   — single table row
      EventsTimelineV2.jsx    — horizontal Gantt timeline; receives events[]
      EventsCompactV2.jsx     — split Gantt + embedded map; receives events[]
      EventsMapV2.jsx         — Leaflet map; receives events[]
      EventTypeLegendV2.jsx   — multi-select type filter
  utils/
    filterAndSortEventsV2.js  — pure filter/sort function
    formatDateTime.js         — ISO → display string
    safeHref.js               — validates http/https scheme on API URLs
scripts/
  openapi.sh     — downloads pinned spec and runs openapi-generator-cli
  openapi/
    openapi.yaml — local copy of the bundled OpenAPI spec (generated, do not commit hand-edits)
config.env       — SPEC_SHA: pinned commit for reproducible spec downloads
Makefile         — `make openapi` entry point
docs/
  technical-design/  — this document
  releases/          — per-release implementation plans
```

## 4. API Integration

- **Base URL:** configured via `NEXT_PUBLIC_API_URL` env var (default `https://api.tgpm.world/`)
- **Single instance:** `src/api/api.ts` exports `axiosInstance` used everywhere
- **CORS:** all API calls are simple CORS requests (no custom request headers); the browser preflight is never triggered
- **Error normalisation:** the response interceptor rewrites Axios errors into plain `Error` objects with human-readable messages

## 5. Code Generation

The TypeScript API models in `src/@generated/` are generated from the OpenAPI spec:

```bash
make openapi          # runs scripts/openapi.sh
```

The script:
1. Sources `config.env` to get `SPEC_SHA`
2. Downloads `openapi.bundled.yaml` from GitHub at that SHA
3. Runs `openapi-generator-cli` (v7.9.0) with `typescript-axios` generator
4. Post-processes enum names to remove the `Def` suffix
5. Removes `git_push.sh` (excluded via `.openapi-generator-ignore`)

**Never edit `src/@generated/` by hand.** Regenerate instead.

## 6. Data Flow

```
pages/index.js
  └── ErrorBoundary
        └── EventsV2
              ├── useEventsV2()          — fetches GET /v2/events
              ├── filterAndSortEventsV2  — client-side filter + sort
              └── (activeView switch)
                    ├── EventsTableV2    — receives events[]
                    ├── EventsTimelineV2 — receives events[]
                    ├── EventsMapV2      — receives events[]
                    └── EventsCompactV2  — receives events[] (embeds EventsMapV2)
```

Filtering props (`typeFilter`, `fromDate`, `toDate`) originate in `pages/index.js` and flow down through `EventsV2` into `filterAndSortEventsV2`. View components receive the already-filtered `events` array and do no fetching of their own.

## 7. Views

| View | Component | Notes |
|---|---|---|
| Table | `EventsTableV2` | Sortable columns; each row is `EventsTableItemV2` |
| Timeline | `EventsTimelineV2` | Horizontal Gantt; year markers computed from event date range |
| Map | `EventsMapV2` | Leaflet map with country highlight and location markers; coordinate validation via `parseCoordinate` |
| Compact | `EventsCompactV2` | Synchronized table + Gantt + embedded map; ResizeObserver for Gantt width |

All view components are dynamically imported (`next/dynamic`, `ssr: false`) to avoid Leaflet SSR issues.

## 8. Filtering

`filterAndSortEventsV2(events, {typeFilter, statusFilter, regionFilter, fromDate, toDate})` is a pure function in `src/utils/`. Filters compose as AND conditions. `fromDate`/`toDate` are Day.js objects from Ant Design's `DatePicker`. The function is memoised inside `EventsV2` via `useMemo`.

## 9. Security

- **Security headers** set in `next.config.js`: `X-Frame-Options`, `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy`, CSP
- **URL validation**: `safeHref(url)` allows only `http:` and `https:` schemes; used for all `href` attributes sourced from API data (`wikipediaUrl`, `wikidataUrl`)
- **Coordinate validation**: `parseCoordinate` in `EventsMapV2` rejects non-finite or out-of-range lat/lng before passing to Leaflet

## 10. Deployment

- `output: "standalone"` in `next.config.js` produces a self-contained Node.js bundle suitable for Docker
- No server-side secrets; `NEXT_PUBLIC_API_URL` is the only runtime env var
- Static assets (logo, header image) are served from `public/`

## 11. Local Development

```bash
npm run dev        # start dev server at http://localhost:3000
make openapi       # regenerate src/@generated/ from pinned spec
npm run lint       # ESLint (includes react/prop-types rule)
npm test           # Jest + Testing Library
npm run build      # production build (also run in CI)
```
