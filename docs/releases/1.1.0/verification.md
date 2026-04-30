# Release 1.1.0 — Verification Report

**Branch:** `complete-migration-to-v2-events`  
**Verified:** 2026-04-30  
**Tests:** 67 passing, 0 failing  
**Lint:** clean  
**Coverage:** Stmts 90.3% · Branch 74.4% · Funcs 81.1% · Lines 91.6% (all above plan thresholds)

---

## Legend

| Symbol | Meaning |
|---|---|
| ✅ | Fully implemented and verified |
| ⚠️ | Partially implemented — gap noted |
| ❌ | Not implemented |
| ➕ | Implemented beyond plan scope |

---

## Item-by-item status

### 1. Fix CORS failure on `GET /v2/events`
**✅ Done.**  
`src/api/api.ts`: all three non-standard request headers (`Content-Type`, `cache-control`, `Access-Control-Allow-Origin`) removed from `axios.create()`. GET requests are now simple CORS requests with no preflight.

---

### 2. Remove mock mode — always load live data
**✅ Done.**  
`pages/index.js` renders `<EventsV2>` directly with no tab switching, no mock data imports, and no `renderTab` logic. `MinimalHeader` no longer has `activeTab`/`onTabChange` props. All v1 UI and mock files removed (covered fully by item 12).

---

### 3. Technical design documentation
**✅ Done.**  
`docs/technical-design/README.md` exists and covers all 11 planned sections. Updated during this branch to reflect server-side filtering, the two independent `DatePicker` components, and the `useEventsV2` params signature.

---

### 4. Version bump to 1.1.0
**✅ Done.**  
- `package.json` version: **1.1.0** ✅  
- `CHANGELOG.md` created with a `## [1.1.0]` section ✅  
- `scripts/openapi/openapi.yaml` `info.version`: bumped to **1.1.0** ✅

---

### 5. CI: version-bump gate
**✅ Done.**  
`.github/workflows/version-check.yml` exists and implements the exact logic from the plan: checks out both sides, extracts `package.json` versions with `jq`, asserts `pr > main` via `npx semver`.

---

### 6. Align code generation with backend pattern
**✅ Done.**  
- `config.env` created with `SPEC_SHA=775b078` (subsequently updated to `c7d0fed` after re-pinning to current main of `tgpm-openapi`) ✅  
- `openapitools.json` bumped to CLI v7.9.0 ✅  
- `scripts/openapi.sh` rewrites: sources `config.env`, uses `${SPEC_SHA}` in curl URL ✅  
- `Makefile` created with single `openapi:` target ✅  
- `.openapi-generator-ignore` updated: `git_push.sh` excluded; confirmed absent from `src/@generated/` ✅  
- `src/@generated/` regenerated from pinned SHA; v1 paths absent ✅

---

### 7. Claude Code: auto-approve read-only operations
**✅ Done.**  
`.claude/settings.json` present with the full allow-list from the plan (`curl`, `cat`, `ls`, `find`, `grep`, `git log`, `git diff`, `git status`, `git show`, `git branch`, `git remote`, `echo`, `jq`, `wc`, `head`, `tail`, `sort`, `uniq`).

---

### 8. Automated tests

#### 8.1 Test infrastructure setup
**✅ Done.**  
`jest`, `jest-environment-jsdom`, `@testing-library/react`, `@testing-library/jest-dom`, `@testing-library/user-event`, `msw`, `babel-jest` installed. `jest.config.js`, `jest.setup.js`, `babel.config.js`, `src/mocks/handlers.js`, `src/mocks/server.js` all present. `npm test` and `npm run test:coverage` scripts active.

#### 8.2 Unit tests — utilities
**✅ Done.**  
- `filterAndSortEventsV2`: 13 cases (all planned scenarios including sort direction, null handling, immutability) ✅  
- `formatDateTime`: 5 cases ✅  
- `safeHref` (item 8.8): 7 cases ✅  
- `parseCoordinate` (item 8.9): 6 cases ✅

Note: plan item 8.2 listed sort order as "ascending" but implementation (and tests) correctly sort **descending** (newest first). Plan corrected.

#### 8.3 Component tests — `EventsV2.jsx`
**✅ Done.**  
`src/components/events/__tests__/EventsV2.test.jsx` present with 9 cases: loading spinner, error message, `mockData` bypasses hook, default table view, timeline/map/compact view routing, `typeFilter` client-side reduction, and unmount-before-resolve safety.

#### 8.4 Component tests — `pages/index.js`
**✅ Done.**  
`pages/__tests__/index.test.jsx` present with 8 cases: default `activeView=table`, view-switch propagation, `typeFilter` propagation, `fromDate`/`toDate` propagation, collapse toggle with localStorage write, collapse restored from localStorage on mount, and crash resilience when localStorage throws.

#### 8.5 Component tests — `MinimalHeader`
**✅ Done.**  
`src/components/__tests__/MinimalHeader.test.jsx` present covering the planned scenarios (dropdown open/close, view selection, outside-click, collapse callback, active label, filter slot).

#### 8.6 Component tests — filter components
**✅ Done.**  
`src/partials/events/__tests__/EventTypeLegendV2.test.jsx` present. `EventRegionFilterV2`, `EventStatusFilterV2`, and `EventTimeframeFilterV2` correctly have no tests (deleted in item 13.2).

#### 8.7 CI: run tests on every PR
**✅ Done.**  
`.github/workflows/ci.yml` runs `npm ci`, `npm audit --audit-level=high`, `npm test -- --ci --coverage`, `npm run lint`, and `npm run build` on PRs and pushes to `main`. `--passWithNoTests` removed now that all test suites exist (67 tests, 9 suites).

#### 8.10 Hook tests — `useEventsV2`
**✅ Done (expanded beyond plan).**  
`src/hooks/__tests__/useEventsV2.test.js` has 10 cases covering all planned scenarios plus: filter params forwarded as query params, timeslot params forwarded, params omitted when not provided, reactive refetch on `types` change, stable serialisation (no spurious refetch on same-content array), and deduplication by `wikidataId`.

---

### 9. Security hardening

#### 9.1 HTTP security headers
**✅ Done.**  
`next.config.js` exports a `headers()` function applying `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, `Permissions-Policy`, and a full CSP to `source: "/(.*)"`. CSP matches the plan exactly.

#### 9.2 Move API base URL to environment variable
**✅ Done.**  
`src/api/api.ts`: `baseURL: process.env.NEXT_PUBLIC_API_URL ?? "https://api.tgpm.world/"`. `.env.example` updated to `NEXT_PUBLIC_API_URL=https://api.tgpm.world/`. Commented dead `ENV` lines removed.

#### 9.3 Validate URL scheme on API-provided hrefs
**✅ Done.**  
`src/utils/safeHref.js` implements the exact function from the plan. Applied in all four view components: `EventsTableItemV2`, `EventsTimelineV2`, `EventsCompactV2`, `EventsMapV2`.

#### 9.4 Validate map coordinates before rendering
**✅ Done.**  
`parseCoordinate` function present in `EventsMapV2.jsx` (line 34), implementing the exact guard from the plan. Markers with `null` return are skipped.

#### 9.5 Add `npm audit` to CI
**✅ Done.**  
`npm audit --audit-level=high` step included in `ci.yml`. Two known moderate `postcss` advisories (tracked in AGENTS.md) do not fail the gate as they are below HIGH severity.

---

### 10. Enterprise coding standards

#### 10.1 PropTypes on all components
**✅ Done.**  
All live components have PropTypes declarations. `react/prop-types: "error"` is active in `eslint.config.js` and lint is clean.

#### 10.2 Error boundary
**✅ Done.**  
`src/components/ErrorBoundary.jsx` present, matching the plan's implementation. Wraps `<EventsV2>` in `pages/index.js`.

#### 10.3 Fix no-op axios response interceptor
**✅ Done.**  
`src/api/api.ts` interceptor normalises Axios errors into plain `Error` objects with `[status] message` format.

#### 10.4 Standardise async pattern
**✅ Done.**  
Events data fetching uses `async/await` uniformly via the shared `useEventsV2` hook. `EventsMapV2.jsx` GeoJSON fetch also converted to `async/await` inside a cancellation-safe `useEffect` with an `iife` pattern and `cancelled` flag guard.

---

### 11. Clean code

#### 11.1 Extract duplicate data-fetching into shared hook
**✅ Done.**  
`src/hooks/useEventsV2.js` implemented. Accepts `{types, timeslotStart, timeslotEnd}`, sends server-side query params, deduplicates by `wikidataId`, and uses `useReducer` for clean loading/error/data state transitions. All view components receive `events[]` exclusively from the parent; none fetch independently.

#### 11.2 Centralise `REGION_COLORS`
**✅ Done.**  
`REGION_COLORS` exported from `src/constants/eventsV2Types.js`. `EventsTableItemV2` imports it from there. `EventRegionFilterV2` (the other former consumer) was deleted in item 13.2.

#### 11.3 Remove dead code
**✅ Done.**  
- `pages/_app.js`: empty `useEffect` and its import removed ✅  
- `src/api/api.ts`: commented `ENV` lines removed ✅  
- `EventsV1.jsx` commented block: file deleted entirely in item 12 ✅

#### 11.4 Fix macOS-only `sed`
**✅ Done.**  
`scripts/openapi.sh` line 13 uses `sed -i.bak ... && rm -f *.bak` — portable on both macOS (BSD) and Linux (GNU).

---

### 12. Remove all v1 endpoint code

#### 12.1 Files deleted
**✅ Done.**  
All five files deleted: `EventsV1.jsx`, `EventsTableV1.jsx`, `EventsTableItemV1.jsx`, `mockEventsV1.js`, `eventsV1Types.js`.

#### 12.2 Files modified
**✅ Done.**  
`pages/index.js` has no v1 imports or references. `MinimalHeader.jsx` has no tab bar or `activeTab`/`onTabChange` props.

#### 12.3 OpenAPI spec cleanup
**✅ Not needed — correctly skipped.**  
Upstream spec at pinned SHA `c7d0fed` already excludes `/v1/events`.

#### 12.4 Regenerate `src/@generated/`
**✅ Done.**  
`src/@generated/` regenerated from pinned SHA. `git_push.sh` absent. `src/@generated/.openapi-generator/VERSION` shows `7.9.0`. No v1 types in generated code.

---

### 13. Remove all dead code — unused files

#### 13.1 Template boilerplate
**✅ Done.**  
All 30 template components in `src/components/` and 8 template files in `src/partials/` deleted. `src/partials/actions/` directory removed.

#### 13.2 Unintegrated filter components
**✅ Done.**  
`EventRegionFilterV2.jsx`, `EventStatusFilterV2.jsx`, `EventTimeframeFilterV2.jsx` deleted. The date-filter use case is covered by two independent `DatePicker` components wired directly in `pages/index.js`.

#### 13.3 Dead utility files
**✅ Done.**  
`Utils.js`, `Transition.jsx`, `routerCompat.jsx` deleted. Lint is clean — no dangling imports remain.

#### 13.4 Verify with ESLint
**✅ Done.**  
`npm run lint` exits 0 with no errors or warnings.

---

## Changes implemented beyond plan scope

These were added during the branch and are not tracked in the plan items above.

| Change | Files |
|---|---|
| Server-side filtering: `useEventsV2` sends `types`, `timeslot_start`, `timeslot_end` as API query params on every filter change | `src/hooks/useEventsV2.js`, `src/components/events/EventsV2.jsx` |
| Axios array serialisation fixed: `paramsSerializer: {indexes: null}` ensures `types=A&types=B` not `types[]=A` | `src/api/api.ts` |
| Date filters replaced: `RangePicker` replaced by two independent `DatePicker` components with separate clear buttons | `pages/index.js` |
| SSR hydration fix: `collapsed` state initialises as `false` (matching server) and syncs from `localStorage` after mount | `pages/index.js` |
| Loading indicator on refetch: `useEventsV2` uses `useReducer` with `FETCH_START` dispatch, showing spinner on every API call including filter changes | `src/hooks/useEventsV2.js` |
| Event deduplication: response deduplicated by `wikidataId` before state update | `src/hooks/useEventsV2.js` |
| Name column width: `min-w-[400px]` on Name `<td>` | `src/partials/events/EventsTableItemV2.jsx` |
| Table full-width layout: removed `max-w-9xl` and padding from `EventsV2` wrapper | `src/components/events/EventsV2.jsx` |
| antd deprecation fix: `dropdownStyle` → `styles.popup.root` on `Select` | `src/partials/events/EventTypeLegendV2.jsx` |

---

## Outstanding gaps before merge

None. All plan items are fully implemented and verified. The branch is ready to merge.
