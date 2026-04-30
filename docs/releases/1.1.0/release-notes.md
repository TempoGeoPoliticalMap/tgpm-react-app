# Release Notes — 1.1.0

> **Branch:** `complete-migration-to-v2-events`
> **Date:** 2026-04-30

---

## Summary

Release 1.1.0 completes the migration from the legacy v1 API to the v2 events endpoint, makes live data loading work correctly in the browser, and establishes an engineering baseline — automated tests, security headers, CI gates, and a technical design document — that the project was missing entirely.

The app previously failed every API call in production browsers due to a CORS preflight error caused by incorrect request headers. All data was loaded from mock files rather than the live API. This release fixes the root cause, removes all mock-mode code, and ensures the app exclusively loads from `GET /v2/events` on every page load and filter change.

Alongside the bug fix, 44 unused template files were deleted, the entire v1 codebase was removed, server-side filtering was introduced so filter state is reflected in API requests, and 67 automated tests were added across 9 suites where there were previously none.

---

## Breaking changes

### Mock mode removed

The Data tab bar (`v1-live / v1-mock / v2-live / v2-mock`) has been removed from the header. The app no longer has a mock-data toggle. Every page load fetches live data from the API. Deployments that relied on mock mode for offline development must use the `NEXT_PUBLIC_API_URL` environment variable to point at a local or staging API instead.

### `GET /v1/events` no longer called

The frontend no longer calls `/v1/events` under any code path. All five v1 source files (`EventsV1.jsx`, `EventsTableV1.jsx`, `EventsTableItemV1.jsx`, `mockEventsV1.js`, `eventsV1Types.js`) are deleted.

---

## Release details

### CORS fix — live API calls now work in browsers

**Root cause:** `src/api/api.ts` sent `Access-Control-Allow-Origin: *`, `cache-control: no-cache`, and `Content-Type: application/json` as *request* headers on every GET. `Access-Control-Allow-Origin` is a response header; sending it in a request triggers a CORS preflight (OPTIONS). The API server did not list it in `Access-Control-Allow-Headers`, so the preflight was rejected and every API call failed before it was sent.

**Fix:** All three non-standard headers were removed from the `axios.create()` call. GET requests with no custom headers qualify as simple CORS requests and bypass preflight entirely. This was committed earlier in the branch and is the single change that makes the live app functional.

---

### Server-side filtering

Selecting event types or setting a date range now sends corresponding query parameters to the API on every change. Filtering is no longer purely client-side.

| Filter | Query parameter | Format |
|---|---|---|
| Event type | `types` | Repeated values: `types=WARFARE_AND_ARMED_CONFLICTS&types=POLITICAL_CRISIS` |
| From date | `timeslot_start` | ISO 8601: `2024-01-01T00:00:00.000Z` |
| To date | `timeslot_end` | ISO 8601: `2024-12-31T23:59:59.999Z` |

The `types` array is serialised with `paramsSerializer: {indexes: null}` to produce the correct repeated-key format rather than the Axios 1.x default `types[]=A&types[]=B`.

Filter state is stable across renders: the types array is sorted and joined to a string key before being used as a `useEffect` dependency, preventing spurious re-fetches when a parent re-renders with a new array reference holding the same values.

---

### Loading indicator on every fetch

A loading spinner now appears not only on the initial page load but on every subsequent API call triggered by a filter change. The `useEventsV2` hook uses `useReducer` with `FETCH_START` / `FETCH_SUCCESS` / `FETCH_ERROR` actions so loading state is reset atomically at the start of each request, avoiding the intermediate inconsistent states that arise from separate `useState` calls.

---

### Date filter — independent clear buttons

The date filter previously used a single `RangePicker`, which required clearing both dates together. It has been replaced with two independent `DatePicker` components, each with its own clear (`×`) button. Start and end dates can now be cleared separately without resetting the other.

---

### Automated tests — 67 tests across 9 suites

The project had no test infrastructure. This release builds the full test baseline:

| Suite | File | Cases |
|---|---|---|
| `useEventsV2` hook | `src/hooks/__tests__/useEventsV2.test.js` | 10 |
| `filterAndSortEventsV2` | `src/utils/__tests__/filterAndSortEventsV2.test.js` | 13 |
| `formatDateTime` | `src/utils/__tests__/formatDateTime.test.js` | 5 |
| `safeHref` | `src/utils/__tests__/safeHref.test.js` | 7 |
| `parseCoordinate` | `src/partials/events/__tests__/parseCoordinate.test.js` | 6 |
| `EventsV2` component | `src/components/events/__tests__/EventsV2.test.jsx` | 9 |
| `pages/index.js` | `pages/__tests__/index.test.jsx` | 8 |
| `MinimalHeader` | `src/components/__tests__/MinimalHeader.test.jsx` | 6 |
| `EventTypeLegendV2` | `src/partials/events/__tests__/EventTypeLegendV2.test.jsx` | 3 |

Coverage thresholds enforced in CI: statements 70%, branches 65%, functions 80%, lines 70% (all currently exceeded).

MSW (Mock Service Worker) intercepts all `axiosInstance` calls in tests; no real network requests are made.

---

### Security hardening

#### HTTP security headers

`next.config.js` now applies the following response headers to all routes:

| Header | Value |
|---|---|
| `X-Frame-Options` | `DENY` |
| `X-Content-Type-Options` | `nosniff` |
| `Referrer-Policy` | `strict-origin-when-cross-origin` |
| `Permissions-Policy` | `geolocation=(), microphone=(), camera=()` |
| `Content-Security-Policy` | `default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; connect-src 'self' https://api.tgpm.world https://raw.githubusercontent.com; font-src 'self' data:; frame-ancestors 'none'` |

#### URL sanitisation on API-provided links

Wikipedia and Wikidata URLs from the API are now passed through `safeHref()` before being rendered as `href` attributes. Any URL whose scheme is not `https:` or `http:` is silently dropped and the link is not rendered. Applied in all four view components: `EventsTableItemV2`, `EventsTimelineV2`, `EventsCompactV2`, `EventsMapV2`.

#### Map coordinate validation

Coordinates from the API are validated before being passed to Leaflet. A `parseCoordinate()` guard checks that the value contains exactly two comma-separated segments, that both parse as finite numbers, and that the values are within valid geographic bounds (lat −90..90, lng −180..180). Markers for locations that fail validation are silently skipped.

#### API base URL from environment variable

`baseURL` is no longer hardcoded. The app reads `NEXT_PUBLIC_API_URL` at build time and falls back to `https://api.tgpm.world/` if unset. See `.env.example` for the variable name.

#### `npm audit` in CI

The CI pipeline fails the build if any dependency has a known HIGH or CRITICAL vulnerability. Two existing moderate `postcss` advisories are documented in `AGENTS.md` and do not fail the gate.

---

### Code generation alignment

The OpenAPI code generation pipeline now mirrors the pattern used in `tgpm-backend-py-flask`:

- **Spec SHA pinned** in `config.env` (`SPEC_SHA=c7d0fed`) for reproducible generation.
- **Generator CLI upgraded** from v6.5.0 → v7.9.0 (`openapitools.json`).
- **`Makefile`** added with a single `openapi:` target (`make openapi`).
- **`scripts/openapi.sh`** sources `config.env`, fetches the bundled spec at the pinned SHA.
- **`git_push.sh`** excluded from generation output via `.openapi-generator-ignore`.
- **`scripts/openapi/openapi.yaml` `info.version`** bumped to `1.1.0`.
- The `sed -i.bak` portable pattern replaces the macOS-only `sed -i ''` that would have failed on Linux CI runners.

---

### Shared data-fetching hook

All four view components (`EventsTableV2`, `EventsTimelineV2`, `EventsMapV2`, `EventsCompactV2`) previously contained copy-pasted fetch logic with minor inconsistencies. This is now consolidated in `src/hooks/useEventsV2.js`. View components receive `events[]` exclusively as a prop from `EventsV2`; none fetch independently. The hook also deduplicates events by `wikidataId` on receipt to guard against duplicate keys in the API response.

---

### Table layout improvements

- **Name column width:** `min-w-[400px]` enforced on the Name table cell, making the column approximately 60% of the table width on typical viewports.
- **Full-screen width:** The events table now fills the full viewport width. The previous `max-w-9xl` constraint and side padding on the `EventsV2` wrapper were removed.

---

### CI gates

Two GitHub Actions workflows are now active on every pull request to `main`:

| Workflow | File | Check |
|---|---|---|
| CI | `.github/workflows/ci.yml` | `npm ci` → `npm audit --audit-level=high` → `npm test --ci --coverage` → `npm run lint` → `npm run build` |
| Version check | `.github/workflows/version-check.yml` | `package.json` version on the PR branch must be strictly greater than `main` (verified with `npx semver`) |

---

## Infrastructure

- **`src/hooks/useEventsV2.js`** — new shared hook; `useReducer` for atomic state transitions; stable `typesKey` serialisation; cancellation flag; deduplication.
- **`src/api/api.ts`** — `paramsSerializer: {indexes: null}`; `NEXT_PUBLIC_API_URL` env var; error-normalising response interceptor.
- **`src/components/ErrorBoundary.jsx`** — new class component; wraps `<EventsV2>` in `pages/index.js`; prevents a single rendering exception from blanking the whole page.
- **`src/components/LoadingSpinner.jsx`** — `data-testid="loading-spinner"` attribute added for test assertions.
- **`docs/technical-design/README.md`** — new living design document covering overview, tech stack, project layout, API integration, code generation, data flow, views, filtering, deployment, and local development.
- **`.claude/settings.json`** — project-level Claude Code auto-approvals for safe read-only shell commands.

---

## Removed

- `src/components/events/EventsV1.jsx`
- `src/partials/events/EventsTableV1.jsx`
- `src/partials/events/EventsTableItemV1.jsx`
- `src/partials/events/mockEventsV1.js`
- `src/constants/eventsV1Types.js`
- `src/partials/events/EventRegionFilterV2.jsx` (unintegrated filter component)
- `src/partials/events/EventStatusFilterV2.jsx` (unintegrated filter component)
- `src/partials/events/EventTimeframeFilterV2.jsx` (superseded by DatePicker pair)
- `src/utils/Utils.js`, `src/utils/Transition.jsx`, `src/utils/routerCompat.jsx` (dead utilities)
- 30 template UI components in `src/components/` and 8 template layout files in `src/partials/` (dashboard scaffold boilerplate never wired into the app)

---

## Backward compatibility

`GET /v1/events` is no longer called by the frontend. There is no other change to response shape expectations — `GET /v2/events` behaviour and the JSON response structure are unchanged.

The `mockData` prop on `EventsV2` is retained (no page-level code passes it) as a test-injection seam. It is not dead code.

---

## Known constraints

- `unsafe-inline` is present in the `script-src` and `style-src` CSP directives, required by Next.js's inline runtime scripts and Ant Design's CSS-in-JS. Tightening with nonces is deferred to a future release.
- `CORS_ALLOWED_ORIGINS` is configured on the API server, not the frontend. See the [backend 2.0.0 release notes](https://github.com/TempoGeoPoliticalMap/tgpm-backend-py-flask/blob/main/docs/releases/2.0.0/release-notes.md) for the server-side CORS variable.
- The default API time window (when no date filters are set) is determined by the backend — currently **today only** (UTC midnight to 23:59:59).
- Leaflet (`EventsMapV2`) is excluded from test coverage; it requires a real DOM with canvas support. Covered by manual verification only.
- End-to-end tests (Playwright/Cypress) are deferred to a future release.
