# Changelog

## [1.1.0] — 2026-04-29

### Fixed
- CORS failure on `GET /v2/events` — removed non-standard request headers that triggered browser preflight

### Changed
- App always loads live data; mock mode and v1 tabs removed
- API base URL moved to `NEXT_PUBLIC_API_URL` environment variable
- `scripts/openapi.sh` `sed` made portable (Linux/macOS)
- OpenAPI generator CLI bumped to v7.9.0 with pinned spec SHA via `config.env`
- Axios no-op response interceptor replaced with error-normalising interceptor
- Async pattern standardised to `async/await` across all view components

### Added
- CI workflow: version-bump gate and test/lint/build/audit pipeline
- Security headers in `next.config.js` (CSP, X-Frame-Options, etc.)
- `safeHref` utility — validates `http/https` scheme on API-provided URLs before rendering
- Coordinate bounds validation in `EventsMapV2` before passing to Leaflet
- `useEventsV2` shared data-fetching hook
- `ErrorBoundary` component wrapping the main events view
- PropTypes declarations on all components
- `REGION_COLORS` centralised in `src/constants/eventsV2Types.js`
- Jest + Testing Library + MSW test infrastructure
- Unit and component tests for core utilities and components
- Technical design documentation at `docs/technical-design/README.md`

### Removed
- All v1 endpoint code (`EventsV1`, `EventsTableV1`, `EventsTableItemV1`, `eventsV1Types`, mock data)
- `/v1/events` path and v1-only schemas from OpenAPI spec
- 44 unused template boilerplate, dead filter components, and dead utility files
