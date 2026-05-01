# Release 1.1.0 — Plan

**Claude Code** · Model: `claude-sonnet-4-6`

---

## Summary

This release cleans up the data-mode UX (live-only), fixes the broken live API call, aligns code generation with the backend repo pattern, bumps the version, adds a version-check CI gate, documents the technical design, and configures Claude Code read-only auto-approvals.

---

## Items

### 1. Fix CORS failure on `GET /v2/events`

**Status:** Done (committed in this branch)

**Root cause:** `src/api/api.ts` set `"Access-Control-Allow-Origin": "*"` and `"cache-control": "no-cache"` as *request* headers. `Access-Control-Allow-Origin` is a response header; sending it as a request header causes the browser CORS preflight (OPTIONS) to fail because the API server does not list it in `Access-Control-Allow-Headers`. The superfluous `Content-Type: application/json` on a headerless GET request also triggered unnecessary preflight.

**Fix:** Remove all three non-standard request headers from the axios instance in `src/api/api.ts`, leaving no custom headers so GET requests qualify as simple CORS requests and bypass preflight entirely.

**Files changed:**
- `src/api/api.ts` — drop `headers` block from `axios.create()`

---

### 2. Remove mock mode — always load live data

**Goal:** Delete the Data: Mock toggle and the v1 tabs entirely; the app always boots in `v2-live` mode.

**Changes:**

| File | Change |
|---|---|
| `pages/index.js` | Remove `activeTab` state and tab-switching logic; delete `case "v1-live"`, `case "v1-mock"`, `case "v2-mock"` from `renderTab`; render `<EventsV2 …/>` directly; remove imports of `mockEventsV1`, `mockEventsV2`, `EventsV1` |
| `src/components/MinimalHeader.jsx` | Remove the Data tab bar (v1-live / v1-mock / v2-live / v2-mock selector) and all related props (`activeTab`, `onTabChange`) |
| `src/components/events/EventsV1.jsx` | Delete file (no longer rendered) |
| `src/partials/events/mockEventsV1.js` | Delete file |
| `src/partials/events/mockEventsV2.js` | Delete file (mock data no longer needed) |
| `src/partials/events/EventsTableV1.jsx` | Delete file |

> The view switcher (Table / Timeline / Map / Compact) and date-range/type filters are unaffected.

> **`mockData` prop retention:** `EventsV2.jsx` keeps its `mockData` prop even after this item ships. Nothing in the page passes it, but it provides a test-injection seam used by item 8.3 component tests — it avoids real network calls in unit tests. It is intentionally retained, not dead code.

---

### 3. Technical design documentation

**Goal:** Add a living design doc so new contributors understand the architecture without reading all the code.

**File to create:** `docs/technical-design/README.md`

**Sections to cover:**

1. **Overview** — purpose of the app, target users, one-paragraph summary
2. **Tech stack** — Next.js (Pages Router), React 19, Tailwind CSS v4, Ant Design, Axios, Leaflet / React-Leaflet
3. **Project layout** — annotated directory tree (`pages/`, `src/components/`, `src/partials/`, `src/api/`, `src/@generated/`, `scripts/`, `docs/`, `styles/`)
4. **API integration** — base URL (`https://api.tgpm.world/`), single axios instance in `src/api/api.ts`, OpenAPI-generated TypeScript models in `src/@generated/`, CORS requirements
5. **Code generation** — how `scripts/openapi.sh` / `make openapi` pulls the pinned spec SHA from `config.env` and regenerates `src/@generated/` (see item 6)
6. **Data flow** — `pages/index.js` → `EventsV2` → `axiosInstance.get("v2/events")` → `filterAndSortEventsV2` → view components
7. **Views** — Table, Timeline, Map, Compact; how `activeView` prop selects between them; dynamic imports for SSR avoidance
8. **Filtering** — `typeFilter`, `fromDate`, `toDate` passed top-down; `filterAndSortEventsV2` utility
9. **Deployment** — `output: "standalone"` in `next.config.js`; Docker-friendly; no server-side secrets
10. **Local development** — `npm run dev`, `make openapi` to regenerate models, lint with `npm run lint`

---

### 4. Version bump to 1.1.0

**Files to update:**

| File | Field | Old | New |
|---|---|---|---|
| `package.json` | `version` | `0.2.0` | `1.1.0` |
| `scripts/openapi/openapi.yaml` | `info.version` | `0.2.0` | `1.1.0` |

---

### 5. CI: version-bump gate

**Goal:** Block merging a PR to `main` if the `package.json` version is not greater than the version on `main`. Mirrors the approach used in `tgpm-backend-py-flask` (`.github/workflows/version-check.yml`).

**File to create:** `.github/workflows/version-check.yml`

**Logic:**
1. On `pull_request` targeting `main`, check out both the PR branch and `main`.
2. Extract `version` from `package.json` on each side using `jq`.
3. Use `npx semver` to assert `pr_version > main_version`; fail the job if not.

```yaml
name: Version Check

on:
  pull_request:
    branches: [main]

jobs:
  version-check:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0

      - name: Get PR version
        id: pr
        run: echo "version=$(jq -r .version package.json)" >> $GITHUB_OUTPUT

      - name: Get main version
        id: main
        run: |
          git fetch origin main
          echo "version=$(git show origin/main:package.json | jq -r .version)" >> $GITHUB_OUTPUT

      - name: Assert version is bumped
        run: |
          npx --yes semver "${{ steps.pr.outputs.version }}" -r ">${{ steps.main.outputs.version }}" \
            || (echo "ERROR: package.json version (${{ steps.pr.outputs.version }}) must be greater than main (${{ steps.main.outputs.version }})" && exit 1)
```

---

### 6. Align code generation with backend pattern

**Current approach (to replace):**
- `scripts/openapi.sh` fetches the spec from the `refs/heads/main` tip (no pinning) using `curl`, applies a `sed` hack to make the `Accept` header optional, and runs `openapi-generator-cli` v6.5.0.
- No `Makefile` entry point.

**Target approach (from `tgpm-backend-py-flask`):**
- Spec commit is pinned via `config.env` (`SPEC_SHA=<sha>`) for reproducible generation.
- `openapitools.json` upgraded to generator CLI **v7.9.0**.
- `scripts/openapi.sh` sources `config.env`, fetches the bundled spec at the pinned SHA, runs generation, removes unwanted generated artifacts, and formats output.
- `Makefile` added with a single `openapi` target.

**Files to change / create:**

| File | Action | Change |
|---|---|---|
| `config.env` | Create | `SPEC_SHA=<current-main-sha-of-tgpm-openapi>` |
| `openapitools.json` | Update | Bump CLI version from `6.5.0` → `7.9.0` |
| `scripts/openapi.sh` | Rewrite | Source `config.env`; use `${SPEC_SHA}` in curl URL; keep existing generator flags and sed post-processing; add cleanup of unwanted generated files |
| `Makefile` | Create | Single `openapi:` target that calls `bash scripts/openapi.sh` |
| `.gitignore` | Update | Ensure `config.env` is tracked (it only holds a public SHA, not a secret) |
| `.openapi-generator-ignore` | Update | Add `git_push.sh` so the generator does not emit this repo-push helper into `src/@generated/` |

> The TypeScript generator flags (`typescript-axios`, `--model-name-suffix`, enum options) remain unchanged; only the spec-fetch mechanism and CLI version change.

> **Generator version migration validation:** Bumping from CLI v6 to v7 is a major version change. Generated enum representations, import styles, and file-level exports may differ in breaking ways. After running `make openapi` with the new version, audit the diff (`git diff src/@generated/`) and run `npm run build` to confirm no consumer of the generated types is broken before committing.

---

### 7. Claude Code: auto-approve read-only operations

**Goal:** Prevent Claude Code from prompting for permission on safe, read-only shell commands (e.g., `curl`, `cat`, `ls`, `find`, `grep`, `git log`, `git diff`, `git status`).

**File to create:** `.claude/settings.json`

```json
{
  "permissions": {
    "allow": [
      "Bash(curl:*)",
      "Bash(cat:*)",
      "Bash(ls:*)",
      "Bash(find:*)",
      "Bash(grep:*)",
      "Bash(git log:*)",
      "Bash(git diff:*)",
      "Bash(git status:*)",
      "Bash(git show:*)",
      "Bash(git branch:*)",
      "Bash(git remote:*)",
      "Bash(echo:*)",
      "Bash(jq:*)",
      "Bash(wc:*)",
      "Bash(head:*)",
      "Bash(tail:*)",
      "Bash(sort:*)",
      "Bash(uniq:*)"
    ]
  }
}
```

**File:** `.claude/settings.json` (project-level, committed to repo so all contributors benefit)

---

### 8. Automated tests

**Context:** The codebase currently has zero test coverage — no test framework is configured, no test files exist, and `package.json` has `eslint-plugin-jest` installed but no actual test runner or assertion library.

---

#### 8.1 Test infrastructure setup

**Install (dev dependencies):**

```
jest
jest-environment-jsdom
@testing-library/react
@testing-library/jest-dom
@testing-library/user-event
msw                        ← API mocking (avoids real network calls)
babel-jest
```

**Files to create:**

| File | Purpose |
|---|---|
| `jest.config.js` | Jest config: jsdom env, module name mapper for Next.js, coverage thresholds (`lines: 70, functions: 80, branches: 65`) |
| `jest.setup.js` | Import `@testing-library/jest-dom`; set up MSW server lifecycle |
| `babel.config.js` | Transpile JSX/ESM for Jest (or use `next/babel` preset) |
| `src/mocks/handlers.js` | MSW request handlers: a success handler for `GET https://api.tgpm.world/v2/events` returning a fixture array, and a named `networkErrorHandler` for error-path tests |

**Add to `package.json`:**
```json
"scripts": {
  "test": "jest",
  "test:coverage": "jest --coverage"
}
```

---

#### 8.2 Unit tests — utilities

These are pure functions with no React or network dependencies; highest return on investment.

**`src/utils/filterAndSortEventsV2.js`** — highest priority; bugs were found during review.

| Test case | What it verifies |
|---|---|
| `typeFilter = []` passes all events through | Empty filter = no restriction |
| `typeFilter = ["WARFARE_AND_ARMED_CONFLICTS"]` keeps only matching events | Inclusion filter |
| `typeFilter` with unknown value returns empty list | No false positives |
| `regionFilter = ["EUROPE_AND_CENTRAL_ASIA"]` filters by `e.regions` | Array membership check via `some()` |
| `fromDate` set: excludes events that end before it | `fromDate.isBefore(endDateTime)` logic |
| `toDate` set: excludes events that start after it | `toDate.isAfter(startDateTime)` logic |
| Both dates set: only events overlapping the window pass | Combined date range |
| Null `fromDate` / `toDate`: no date constraint applied | Optional date filter |
| Events without `endDateTime` (ongoing): pass `fromDate` filter | Null end date handling |
| Events without `regions` field: don't crash region filter | Optional chaining on `e.regions` |
| Output is sorted by `startDateTime` ascending | Sort order |
| Events with equal `startDateTime` sorted by `endDateTime` | Secondary sort key |
| Input array is not mutated | Immutability |

**`src/utils/formatDateTime.js`**

| Test case | Expected output |
|---|---|
| `"2023-12-25T15:30:00Z"` | `"2023-12-25 15:30"` |
| `"2023-12-25T00:00:00Z"` (midnight) | `"2023-12-25"` (time stripped) |
| `null` / `undefined` / `""` | `null` |
| Invalid date string | Returns the original string |
| Single-digit month/day/hour (`"2023-01-05T09:00:00Z"`) | `"2023-01-05 09:00"` (zero-padded) |

> `src/utils/Utils.js` is deleted in item 13.3 — no tests needed for it.

---

#### 8.3 Component tests — `src/components/events/EventsV2.jsx`

This is the central data-loading component. Mock `axiosInstance` with MSW or `jest.mock`.

| Test case | What it verifies |
|---|---|
| With `mockData`: renders events immediately, no spinner, no API call | Mock path bypasses network |
| Without `mockData`: shows `<LoadingSpinner>` during fetch | Loading state |
| Successful API response: events render in the active view | Happy path |
| Failed API response (network error): shows "Failed to load events" message | Error state |
| Component unmounts before fetch completes: no state-update errors in console | `cancelled` flag + cleanup |
| `activeView="table"`: renders `EventsTableV2` | View routing |
| `activeView="timeline"`: renders `EventsTimelineV2` | View routing |
| `activeView="map"`: renders `EventsMapV2` | View routing |
| `activeView="compact"`: renders `EventsCompactV2` | View routing |
| `typeFilter` prop change re-filters events without re-fetching | useMemo update, no new API call |

---

#### 8.4 Component tests — `pages/index.js`

Mock `EventsV2` to a simple `<div data-testid="events-v2"/>` to keep tests fast.

| Test case | What it verifies |
|---|---|
| Default render shows `EventsV2` in `table` view | Default `activeView` state |
| Clicking "Timeline" view button passes `activeView="timeline"` to `EventsV2` | View switching |
| Selecting a type in `EventTypeLegendV2` passes it into `typeFilter` | Filter propagation |
| Setting a date range passes `fromDate`/`toDate` down | Date filter propagation |
| Collapse button toggles header and saves `"true"` to `localStorage` | Collapse + persistence |
| On mount, reads collapsed state from `localStorage` | Persistence restore |
| `localStorage` unavailable (quota error): does not crash | Graceful degradation |

---

#### 8.5 Component tests — `src/components/MinimalHeader.jsx`

| Test case | What it verifies |
|---|---|
| View dropdown opens on button click | Toggle behaviour |
| Clicking a view option calls `onViewChange` with correct id | Callback wiring |
| Clicking outside an open dropdown closes it | `mousedown` listener |
| Collapse button calls `onCollapse` | Prop callback |
| Active view label shown in button text | Derived display state |
| `filtersNode` renders inside the header | Filter slot |

---

#### 8.6 Component tests — filter components

`EventRegionFilterV2`, `EventStatusFilterV2`, and `EventTimeframeFilterV2` are deleted in item 13.2 — do not write tests for them.

Cover the one surviving filter component:

| Component | Key test cases |
|---|---|
| `EventTypeLegendV2` | Selecting an option calls `onChange` with selected type codes; clearing calls `onChange([])` |

---

#### 8.7 CI: run tests on every PR

Add a test job to the GitHub Actions pipeline alongside the version-check workflow.

**File to create:** `.github/workflows/ci.yml`

```yaml
name: CI

on:
  pull_request:
    branches: [main]
  push:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: npm
      - run: npm ci
      - name: Audit dependencies
        run: npm audit --audit-level=high
      - run: npm test -- --ci --coverage --passWithNoTests
      - run: npm run lint
      - run: npm run build
```

> `--passWithNoTests` keeps CI green until the test suite from items 8.2–8.6 lands; remove the flag once tests exist. The `npm audit` step here is a duplicate of item 9.5 — consolidate in one place when wiring up CI.

---

#### 8.8 Unit tests — `safeHref` utility (item 9.3)

| Test case | Expected |
|---|---|
| `safeHref("https://en.wikipedia.org/wiki/X")` | returns the URL unchanged |
| `safeHref("http://example.com")` | returns the URL unchanged |
| `safeHref("javascript:alert(1)")` | returns `null` |
| `safeHref("data:text/html,<h1>x</h1>")` | returns `null` |
| `safeHref("")` | returns `null` |
| `safeHref(null)` / `safeHref(undefined)` | returns `null` |
| Malformed string that is not a valid URL | returns `null` |

---

#### 8.9 Unit tests — `parseCoordinate` function (item 9.4)

| Test case | Expected |
|---|---|
| `"51.5,-0.1"` | `[51.5, -0.1]` |
| `"-90,180"` (boundary) | `[-90, 180]` |
| `"91,0"` (lat out of range) | `null` |
| `"0,181"` (lng out of range) | `null` |
| `"abc,def"` (NaN) | `null` |
| `""` / `","` / missing segment | `null` |

---

#### 8.10 Hook tests — `useEventsV2` (item 11.1)

Use `renderHook` from `@testing-library/react`. MSW intercepts the network calls.

| Test case | What it verifies |
|---|---|
| Initial render: `loading` is `true`, `events` is `[]` | Loading state on mount |
| After successful fetch: `loading` false, `events` populated | Happy path |
| After network error: `loading` false, `error` is a string | Error state |
| Unmount before fetch resolves: no state-update warning in console | `cancelled` flag prevents setState after unmount |
| Called with `{types: ["WARFARE_AND_ARMED_CONFLICTS"]}`: API request includes `types=WARFARE_AND_ARMED_CONFLICTS` | Filter params forwarded to API |
| Called with `{timeslotStart, timeslotEnd}`: API request includes those query params | Date filter params forwarded |
| `types` prop changes: re-fetch is triggered with new params | Reactive refetch on filter change |
| API response contains duplicate `wikidataId` entries: deduplicated in returned `events` | Deduplication guard |

---

#### 8.11 What is explicitly out of scope for 1.1

| Area | Reason |
|---|---|
| `EventsMapV2` (Leaflet) | Leaflet requires a real DOM with canvas; heavy mocking; low ROI for now |
| `EventsCompactV2` / `EventsTimelineV2` | Complex Gantt + ResizeObserver; better covered by E2E in a future release |
| `EventsV1` / `EventsTableV1` | Deleted in item 2 |
| `src/@generated/` | Auto-generated; tested implicitly via API call tests |
| End-to-end (Playwright/Cypress) | Deferred to a future release once the test baseline is in place |

---

### 9. Security hardening

#### 9.1 HTTP security headers

`next.config.js` currently has no security headers, leaving the app open to clickjacking, MIME-type sniffing, and data exfiltration.

**File to change:** `next.config.js`

Add a `headers()` export with the following response headers applied to all routes (`source: "/(.*)"`) :

| Header | Value | Purpose |
|---|---|---|
| `X-Frame-Options` | `DENY` | Prevent clickjacking |
| `X-Content-Type-Options` | `nosniff` | Block MIME-type sniffing |
| `Referrer-Policy` | `strict-origin-when-cross-origin` | Limit referrer leakage |
| `Permissions-Policy` | `geolocation=(), microphone=(), camera=()` | Disable unused browser APIs |
| `Content-Security-Policy` | see below | Whitelist resource origins |

Suggested CSP for this app (Next.js + Leaflet + Ant Design + external API + Wikipedia/Wikidata links):
```
default-src 'self';
script-src 'self' 'unsafe-inline';
style-src 'self' 'unsafe-inline';
img-src 'self' data: https:;
connect-src 'self' https://api.tgpm.world https://raw.githubusercontent.com;
font-src 'self' data:;
frame-ancestors 'none';
```

> `unsafe-inline` for scripts and styles is required by Next.js inline runtime and Ant Design's CSS-in-JS. Tighten with nonces in a later release once SSR is more controlled.

---

#### 9.2 Move API base URL to environment variable

**Problem:** `src/api/api.ts` has `baseURL: "https://api.tgpm.world/"` hardcoded. There is no way to point the app at a staging or local API without rebuilding.

**Changes:**

| File | Change |
|---|---|
| `.env.example` | Replace `REACT_APP_API_HOST=http://example.com/` with `NEXT_PUBLIC_API_URL=https://api.tgpm.world/` |
| `src/api/api.ts` | `baseURL: process.env.NEXT_PUBLIC_API_URL ?? "https://api.tgpm.world/"` |
| Remove | The dead commented-out `// import {ENV}` and `// baseURL: ENV.API_HOST` lines |

> `NEXT_PUBLIC_` prefix is required for Next.js to expose env vars to the browser bundle.

---

#### 9.3 Validate URL scheme on API-provided hrefs

**Problem:** `wikipediaUrl` and `wikidataUrl` values come from the API and are rendered directly as `href` attributes. If the API ever returns a `javascript:` or `data:` URL (misconfiguration or supply-chain compromise), the browser will execute it.

**Fix:** Add a `safeHref` utility in `src/utils/safeHref.js`:

```js
const ALLOWED_SCHEMES = ["https:", "http:"];

export function safeHref(url) {
  if (!url) return null;
  try {
    const {protocol} = new URL(url);
    return ALLOWED_SCHEMES.includes(protocol) ? url : null;
  } catch {
    return null;
  }
}
```

**Apply in:**
- `src/partials/events/EventsTableItemV2.jsx` — wrap `props.wikipediaUrl` and `props.wikidataUrl`
- `src/partials/events/EventsTimelineV2.jsx` — same fields
- `src/partials/events/EventsCompactV2.jsx` — same fields
- `src/partials/events/EventsMapV2.jsx` — same fields

Pattern: `href={safeHref(event.wikipediaUrl)}` — if `safeHref` returns `null`, the link is not rendered.

---

#### 9.4 Validate map coordinates before rendering

**Problem:** `EventsMapV2.jsx` splits coordinate strings from the API with `.split(",").map(Number)` and passes the results directly to Leaflet. No bounds check means `NaN` or out-of-range values silently produce invisible or mis-positioned markers; malformed input could also trigger Leaflet exceptions.

**File:** `src/partials/events/EventsMapV2.jsx`

Add a guard before rendering each location marker:
```js
function parseCoordinate(coordinate) {
  const [lat, lng] = coordinate.split(",").map(Number);
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;
  if (lat < -90 || lat > 90 || lng < -180 || lng > 180) return null;
  return [lat, lng];
}
```

Skip any location where `parseCoordinate` returns `null` rather than passing bad values to Leaflet.

---

#### 9.5 Add `npm audit` to CI

**Pre-condition:** Before adding the gate, run `npm audit --audit-level=high` locally and resolve or document any existing HIGH/CRITICAL advisories. Adding the gate without this pre-check will block CI immediately if current dependencies already have vulnerabilities.

**File:** `.github/workflows/ci.yml` (from item 8.7)

The `npm audit` step is already included in item 8.7's CI workflow. No separate file change is needed here — this item is a reminder to perform the local pre-check and commit any `npm audit fix` changes before the CI workflow lands.

This fails the build if any dependency has a known HIGH or CRITICAL vulnerability, without blocking on low/moderate advisories that are often noise.

---

### 10. Enterprise coding standards

#### 10.1 PropTypes on all components

No component in the codebase declares `prop-types`. This makes refactoring unsafe and hides interface mismatches at runtime.

**Install:** `prop-types` is already in `dependencies`.

**Add PropTypes declarations to every component:**

| Component | Key props to type |
|---|---|
| `EventsV2` | `mockData: PropTypes.shape({data: PropTypes.array})`, `activeView: PropTypes.oneOf(["table","timeline","map","compact"])`, `typeFilter: PropTypes.arrayOf(PropTypes.string)`, `fromDate: PropTypes.object`, `toDate: PropTypes.object` |
| `MinimalHeader` | `filtersNode: PropTypes.node`, `activeView: PropTypes.string`, `onViewChange: PropTypes.func`, `views: PropTypes.arrayOf(PropTypes.shape({id: PropTypes.string, label: PropTypes.string}))`, `collapsed: PropTypes.bool`, `onCollapse: PropTypes.func` |
| `EventsTableItemV2` | All spread `props.*` fields typed explicitly (`name`, `type`, `wikipediaUrl`, `wikidataUrl`, `wikidataId`, `description`, `status`, `startDateTime`, `endDateTime`, `regions`, `countries`, `locations`) |
| `EventsTableV2` | `events: PropTypes.array`, `data: PropTypes.object`, `typeFilter: PropTypes.array`, `fromDate: PropTypes.object`, `toDate: PropTypes.object` |
| `EventsTimelineV2` | Same shape as EventsTableV2 |
| `EventsMapV2` | Same shape as EventsTableV2 |
| `EventsCompactV2` | Same shape as EventsTableV2 |
| `EventTypeLegendV2` | `selectedTypes: PropTypes.array`, `onChange: PropTypes.func.isRequired` |
| `LoadingSpinner` | None required |

> `EventRegionFilterV2`, `EventStatusFilterV2`, and `EventTimeframeFilterV2` are deleted in item 13.2 — do not add PropTypes to them.

> **View component PropTypes and item 11.1:** `EventsTableV2`, `EventsTimelineV2`, `EventsCompactV2`, and `EventsMapV2` currently have a `data` prop alongside `events`. After item 11.1 removes their independent fetch logic, those components' interfaces will settle. Write their PropTypes declarations *after* item 11.1 is complete so the types reflect the final prop surface, not the intermediate one.

Add the `eslint-plugin-react/prop-types` rule to `eslint.config.js` so missing PropTypes become lint errors:
```js
"react/prop-types": "error"
```

---

#### 10.2 Add an error boundary component

**Problem:** There are zero error boundaries in the app. A single rendering exception (e.g., unexpected `null` in API data) crashes the entire page with a blank white screen.

**File to create:** `src/components/ErrorBoundary.jsx`

```jsx
import React from "react";

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = {error: null};
  }

  static getDerivedStateFromError(error) {
    return {error};
  }

  render() {
    if (this.state.error) {
      return this.props.fallback ?? (
        <div className="p-5 text-red-500">Something went wrong. Please reload the page.</div>
      );
    }
    return this.props.children;
  }
}
```

**Wrap in `pages/index.js`:**
```jsx
<ErrorBoundary>
  <EventsV2 … />
</ErrorBoundary>
```

---

#### 10.3 Fix the no-op axios response interceptor

**Problem:** `src/api/api.ts` registers `axiosInstance.interceptors.response.use(res => res)` which does nothing and adds unnecessary indirection. A response interceptor should either provide value (logging, error normalisation, token refresh) or not exist.

**Change:** Replace the no-op with a meaningful error-normalising interceptor:

```ts
axiosInstance.interceptors.response.use(
  res => res,
  err => {
    // Re-throw with a normalised message; components handle display.
    const status = err.response?.status;
    const message = err.response?.data?.detail ?? err.message ?? "Unknown error";
    return Promise.reject(new Error(status ? `[${status}] ${message}` : message));
  }
);
```

This means all components catch a consistent `Error` with a human-readable message rather than a raw Axios error object.

---

#### 10.4 Standardise async pattern

**Problem:** View components mix two async styles for identical operations:
- `EventsTableV2` / `EventsTimelineV2` / `EventsV2` — `async/await` inside `useEffect`
- `EventsCompactV2` / `EventsMapV2` — `.then().catch()` chain

**Rule:** All data fetching in `useEffect` must use `async/await` with a `try/catch`. Convert the `.then().catch()` chains in `EventsCompactV2` and `EventsMapV2` to match the existing pattern in `EventsV2`.

---

### 11. Clean code

#### 11.1 Extract duplicate data-fetching into a shared hook

**Problem:** `axiosInstance.get("v2/events")` with loading/error state management is copy-pasted into four view components (`EventsTableV2`, `EventsTimelineV2`, `EventsCompactV2`, `EventsMapV2`), each with slight variations in style and error handling. `EventsV2` already fetches and passes the result down as an `events` prop, making the per-component fetches dead code when rendered via the normal page flow.

**Solution:** Create `src/hooks/useEventsV2.js`:

```js
import {useEffect, useState} from "react";
import {axiosInstance} from "../api/api";

export function useEventsV2({types = [], timeslotStart = null, timeslotEnd = null} = {}) {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const typesKey = [...types].sort().join("\0");

  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    const resolvedTypes = typesKey ? typesKey.split("\0") : [];
    const params = {};
    if (resolvedTypes.length) params.types = resolvedTypes;
    if (timeslotStart) params.timeslot_start = timeslotStart;
    if (timeslotEnd) params.timeslot_end = timeslotEnd;

    (async () => {
      try {
        const {data} = await axiosInstance.get("v2/events", {params});
        if (!cancelled) {
          const seen = new Set();
          setEvents(data.data.filter(e => !seen.has(e.wikidataId) && seen.add(e.wikidataId)));
          setError(null);
        }
      } catch (err) {
        if (!cancelled) setError(err.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [typesKey, timeslotStart, timeslotEnd]);

  return {events, loading, error};
}
```

> The `typesKey` serialisation (`sort().join("\0")`) converts the `types` array to a stable primitive so the `useEffect` dependency array does not trigger on every render from a new array reference. The hook also deduplicates events by `wikidataId` on receipt, guarding against duplicate keys in the API response.

**Refactor:**
- `EventsV2.jsx` — replace its inline fetch with `useEventsV2()`
- `EventsTableV2`, `EventsTimelineV2`, `EventsCompactV2`, `EventsMapV2` — remove all local fetch logic; rely exclusively on the `events` prop passed by the parent

> Once item 2 (mock-mode removal) is done, view components are only ever rendered via `EventsV2`, so they never need to fetch independently.

---

#### 11.2 Centralise `REGION_COLORS`

**Problem:** The same `REGION_COLORS` map (7 region → Tailwind class entries) is copy-pasted in two files:
- `src/partials/events/EventsTableItemV2.jsx` (lines 8–16)
- `src/partials/events/EventRegionFilterV2.jsx` (lines 6–14)

**Fix:** Move `REGION_COLORS` into `src/constants/eventsV2Types.js` alongside the existing `REGIONS`, `TYPES`, `STATUSES`, `TYPE_ICONS` exports. Both files import from there.

---

#### 11.3 Remove dead code

Three confirmed dead-code locations to clean up atomically:

| File | Dead code | Fix |
|---|---|---|
| `pages/_app.js` line 1, 7 | `import {useEffect}` + `useEffect(() => {});` — empty hook with no deps, no body | Delete both lines |
| `src/api/api.ts` lines 2, 6 | `// import {ENV} ...` and `// baseURL: ENV.API_HOST,` | Delete commented lines |
| `src/components/events/EventsV1.jsx` | Commented-out `{/* <Header sidebarOpen=... /> */}` block | Delete commented block; file itself deleted in item 2 |

---

#### 11.4 Fix macOS-only `sed` in `scripts/openapi.sh`

**Problem:** Line 9 uses `sed -i ''` (BSD `sed` syntax, macOS only). On Linux CI runners (Ubuntu), this fails because GNU `sed` requires no space between `-i` and the suffix.

**Fix:** Replace with a portable pattern:
```bash
# Before (macOS-only):
sed -i '' '/Accept/,/required/ s/true/false/g' scripts/openapi/openapi.yaml

# After (portable):
sed -i.bak '/Accept/,/required/ s/true/false/g' scripts/openapi/openapi.yaml && rm -f scripts/openapi/openapi.yaml.bak
```

Or switch the entire post-processing step to a single `node -e` or Python one-liner to avoid `sed` portability concerns entirely.

---

### 12. Remove all v1 endpoint code

**Context:** Item 2 removes the v1 UI tabs and mock data from the page. This item completes the migration by deleting every remaining v1 artefact — source files, constants, mock data, and the `/v1/events` path from the OpenAPI spec — so there is zero dead code referencing the old endpoint.

> Item 2 and item 12 must be executed together as a single commit. They touch overlapping files; doing them separately creates an intermediate broken state.

---

#### 12.1 Files to delete

| File | Why |
|---|---|
| `src/components/events/EventsV1.jsx` | V1 top-level component; rendered only from `pages/index.js` v1 tabs |
| `src/partials/events/EventsTableV1.jsx` | V1 table; calls `axiosInstance.get("v1/events")` |
| `src/partials/events/EventsTableItemV1.jsx` | V1 table row; imports from `eventsV1Types` |
| `src/partials/events/mockEventsV1.js` | V1 mock data; used only in `pages/index.js` v1-mock tab |
| `src/constants/eventsV1Types.js` | V1 type/status constants; imported only by `EventsTableItemV1` |

---

#### 12.2 Files to modify

**`pages/index.js`** — remove all v1 references:
- `import EventsV1 from ...`
- `import {mockEventsV1} from ...`
- `case "v1-live": return <EventsV1 ... />`
- `case "v1-mock": return <EventsV1 ... mockData={mockEventsV1} />`

(The `case "v2-mock"` and `mockEventsV2` import are also removed here as part of item 2.)

**`src/components/MinimalHeader.jsx`** — remove the Data tab bar and its `activeTab` / `onTabChange` props (also item 2).

---

#### 12.3 ~~OpenAPI spec — remove `/v1/events` path and v1-only schemas~~ *(no longer needed)*

The upstream spec at `TempoGeoPoliticalMap/tgpm-openapi` was updated (pinned SHA `c7d0fed479f9c477682619b8d44b65966e0adbf0`) and no longer contains the `/v1/events` path or any v1-only schemas. Manual cleanup of `scripts/openapi/openapi.yaml` is therefore unnecessary — `make openapi` produces a v2-only `src/@generated/` automatically.

---

#### 12.4 Regenerate `src/@generated/`

Run:

```bash
make openapi
```

The generated `src/@generated/` reflects the v2-only spec. Verify the diff contains no v2 type regressions and run `npm run build` to confirm.

---

### 13. Remove all dead code — unused files

A full import-chain audit found **44 source files** that are never reached by the running application. They fall into three distinct groups.

---

#### 13.1 Template boilerplate — UI kit components that were never integrated

These components come from the Tailwind/React dashboard template used as the project scaffold. None of them are imported by any file that is part of the live app. They add confusion and maintenance burden with no benefit.

**Delete entire directory contents:**

`src/components/` — the following files only (keep `EventsV2.jsx`, `LoadingSpinner.jsx`, `MinimalHeader.jsx`, and the future `ErrorBoundary.jsx` that item 10.2 will create after this step):

| File |
|---|
| `AccordionBasic.jsx` |
| `AccordionTableItem.jsx` |
| `AccordionTableRichItem.jsx` |
| `Banner.jsx` |
| `Banner2.jsx` |
| `DateSelect.jsx` |
| `Datepicker.jsx` |
| `DropdownClassic.jsx` |
| `DropdownEditMenu.jsx` |
| `DropdownFilter.jsx` |
| `DropdownFull.jsx` |
| `DropdownHelp.jsx` |
| `DropdownNotifications.jsx` |
| `DropdownProfile.jsx` |
| `DropdownSort.jsx` |
| `DropdownSwitch.jsx` |
| `DropdownTransaction.jsx` |
| `ModalAction.jsx` |
| `ModalBasic.jsx` |
| `ModalBlank.jsx` |
| `ModalCookies.jsx` |
| `ModalSearch.jsx` |
| `Notification.jsx` |
| `PaginationClassic.jsx` |
| `PaginationNumeric.jsx` |
| `PaginationNumeric2.jsx` |
| `Toast.jsx` |
| `Toast2.jsx` |
| `Toast3.jsx` |
| `Tooltip.jsx` |

> Note: `Tooltip` used throughout the app is from `antd`, not this file. The custom `src/components/Tooltip.jsx` is never imported.

`src/partials/` — template layout files and their dependencies:

| File |
|---|
| `Header.jsx` |
| `Sidebar.jsx` |
| `SidebarLinkGroup.jsx` |
| `actions/DeleteButton.jsx` |
| `actions/SearchForm.jsx` |
| `events/EventPanel.jsx` |
| `events/TransactionsTable02.jsx` |
| `events/TransactionsTableItem02.jsx` |

> `Header.jsx`, `Sidebar.jsx`, and `SidebarLinkGroup.jsx` are the classic dashboard layout from the template; the app uses `MinimalHeader.jsx` instead. `EventPanel` and the Transactions files reference hardcoded demo image assets from the template.

**After deletion, remove the now-empty `src/partials/actions/` directory.**

---

#### 13.2 Built but unintegrated filter components

These three components were written specifically for this app (not template code) and are complete, functional implementations — but they were never imported or wired into any page or parent component.

| File | What it does | Why not wired up |
|---|---|---|
| `src/partials/events/EventRegionFilterV2.jsx` | Multi-select dropdown for filtering by world region | Region filter not exposed in the UI; `filterAndSortEventsV2` supports it but `pages/index.js` never passes a `regionFilter` |
| `src/partials/events/EventStatusFilterV2.jsx` | Multi-select dropdown for filtering by PAST / ONGOING / FUTURE | Status filter not exposed in the UI; same situation |
| `src/partials/events/EventTimeframeFilterV2.jsx` | Two separate `DatePicker` inputs for from/to date | Superseded by two independent Ant Design `DatePicker` components wired directly in `pages/index.js`, each with its own clear button |

**Decision:** Delete all three. They are dead code today. If region/status filtering is added in a future release, it should be re-implemented on top of the then-current UI conventions rather than resurrecting stale standalone components.

---

#### 13.3 Dead utility files

Three files in `src/utils/` are never imported by any live code:

| File | Reason dead |
|---|---|
| `Utils.js` | Defines `tailwindConfig`, `hexToRGB`, `formatValue`, `formatThousands` — none imported anywhere; `tailwindConfig()` also references a non-existent path `./src/css/tailwind.config.js` |
| `Transition.jsx` | Animation helper imported only by the template dropdown/modal components deleted in item 13.1; becomes unreachable after that deletion |
| `routerCompat.jsx` | Next.js router shim imported only by template components deleted in item 13.1; same situation |

**Delete all three files.**

---

#### 13.4 Verify with ESLint after deletion

After all deletions, run:

```bash
npm run lint
```

Any remaining import of a deleted file surfaces immediately as a lint error. Resolve before committing.

---

## Execution order

1. Item 1 (CORS fix) — already done
2. Item 4 (version bump) — mechanical, do first to unblock CI
3. Item 9.2 (env var for API URL) — must precede any deployment testing
4. Item 11.3 (inline dead code) — remove empty `useEffect`, commented lines; zero-risk
5. Item 11.4 (sed portability fix) — needed before CI runs openapi generation on Linux
6. Item 8.1 (test infrastructure) — install framework and config before writing any tests
7. Item 5 (CI workflow) + 8.7 (test job, includes `npm audit` gate) — wire all CI checks together; `--passWithNoTests` keeps CI green until the test suite lands
8. **Items 2 + 12 together** — remove mock mode, v1 tabs, all v1 source files in one commit; write item 8.4 page tests alongside. Step 12.3 (manual spec cleanup) is superseded — the upstream spec (SHA `c7d0fed`) already excludes v1.
9. Item 12.4 (`make openapi`) — regenerate `src/@generated/` from the pinned SHA; no manual spec edits needed
10. **Item 13** — delete all 44 unused files (template components, unintegrated filters, dead utilities including `Transition.jsx` and `routerCompat.jsx`); run `npm run lint` to verify no dangling imports
11. Item 11.1 (shared `useEventsV2` hook) — do after items 2+12 since view components become parent-only
12. Item 11.2 (centralise REGION_COLORS) + 10.3 (fix interceptor) + 10.4 (standardise async) — mechanical refactors
13. Item 9.1 (security headers) + 9.3 (safeHref) + 9.4 (coordinate validation) — security pass; run `npm audit --audit-level=high` locally first and fix any HIGH/CRITICAL findings before the CI gate lands
14. Item 10.1 (PropTypes) + 10.2 (error boundary) — standards pass; write PropTypes for view components *after* item 11.1 finalises their interface
15. Item 8.2–8.6 + 8.8–8.10 (unit + component + utility tests) — write tests for utilities, filter component (EventTypeLegendV2 only), `safeHref`, `parseCoordinate`, and `useEventsV2`; remove `--passWithNoTests` flag from CI once tests are in
16. Item 6 (code generation alignment) — update tooling, re-run `make openapi`, audit `git diff src/@generated/`, run `npm run build` to confirm no breakage
17. Item 3 (technical design doc) — write last, after all code changes are final
18. Item 7 (Claude settings) — add `.claude/settings.json` any time
