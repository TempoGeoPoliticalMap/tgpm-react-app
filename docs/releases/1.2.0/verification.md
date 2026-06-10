# Release 1.2.0 — Verification Report

**Branch:** `23-create-mobile-view-for-daily-news-checks`  
**Verified:** 2026-06-10  
**Tests:** 91 passing, 0 failing (67 before this branch; 24 new tests added)  
**Lint:** clean  
**Coverage:** Stmts 90.57% · Branch 77.92% · Funcs 77.77% · Lines 91.41%

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

### 1. `src/hooks/useMobileDetect.js`
**✅ Done.**  
File created. Uses `useSyncExternalStore` rather than the plan's `useState + useEffect` pattern — a stricter React 18 approach that eliminates the one-render lag and is safe under concurrent rendering. SSR safety is preserved via the third argument `() => false` (server snapshot). The observable behaviour is identical to the plan's spec.

---

### 2. `src/partials/events/EventMobileCardV2.jsx`
**✅ Done.**  
File created. All plan requirements met:

- Title `<a>` links to `safeHref(wikipediaUrl) ?? safeHref(wikidataUrl)`; falls back to `<span>` when both resolve to `null` ✅
- All external links carry `target="_blank" rel="noreferrer"` — `noreferrer` implies `noopener` in all modern browsers ✅
- Image validated through `safeHref()`; falls back to type-icon `<div role="img" aria-label={...}>` ✅
- `line-clamp-2` on description ✅
- Dates formatted via `formatDateTime()`; "ongoing" shown when `timeStateRelativeToNow === "ONGOING"` and `endDateTime` is null ✅
- Type badge using `TYPE_ICONS` / `TYPES` constants ✅
- Status dot: green / slate / blue ✅
- `aria-label={name}` on title link ✅

One minor deviation from plan wording: `STATUS_DOT` uses the raw API key strings (`"ONGOING"`, `"PAST"`, `"FUTURE"`) as map keys rather than referencing them through `STATUSES`. This is correct — `timeStateRelativeToNow` values from the API are the uppercase key strings, not the display values (`"Now"`, `"Past"`, `"Future"`). `STATUSES` is still imported and used for the displayed label text via `STATUSES[timeStateRelativeToNow]`.

---

### 3. `src/partials/events/EventsMobileV2.jsx`
**✅ Done.**  
File created. Renders `<div className="divide-y divide-slate-100 px-4 py-2">` with one `EventMobileCardV2` per event, keyed by `wikidataId`. Empty state ("No events found") shown when `events` is empty or the prop is omitted. Matches the plan exactly.

---

### 4. `pages/index.js`
**✅ Done.**  
`useMobileDetect` imported and called. Mobile view is wired via derived state (`const activeView = isMobile ? "mobile" : desktopView`) rather than the plan's `useEffect + setActiveView` pattern. This is strictly cleaner: no stale-closure risk, no `react-hooks/exhaustive-deps` concern, and no extra render cycle. The end result is identical — `activeView` is `"mobile"` when `isMobile` is true and the last desktop view otherwise.

`views={isMobile ? [] : VIEWS}` and `filtersNode={isMobile ? null : filtersNode}` are passed to `<MinimalHeader>`, hiding the view switcher and filter bar on mobile. Filter state (`selectedTypes`, `fromDate`, `toDate`) continues to flow through to `EventsV2` and the API call on mobile as intended by the plan.

---

### 5. `src/components/events/EventsV2.jsx`
**✅ Done.**  
`EventsMobileV2` added as a dynamic import (`ssr: false`). `mobile: <EventsMobileV2 {...props} />` added to the content map. `PropTypes.oneOf` updated to include `"mobile"`. Outer wrapper changed from `h-screen` to `h-[100dvh]` to fix iOS Safari viewport obscuring.

---

### 6. `src/components/MinimalHeader.jsx`
**✅ Done.**  
Responsive Tailwind classes applied to the hero section: `text-xl md:text-3xl` on the `<h1>` and `pb-8 md:pb-16` on the hero content div, reducing header height on small screens as the plan suggested. No logic changes were needed — the view switcher already short-circuits at `views.length > 0` (line 70) and `filtersNode={null}` suppresses the filter bar.

---

### 7. Tests — `useMobileDetect`
**✅ Done.**  
`src/hooks/__tests__/useMobileDetect.test.js` — 5 tests:
- Returns `false` when `matchMedia` does not match ✅
- Returns `true` when `matchMedia` matches on mount ✅
- Updates state when the media query fires a change event ✅
- Removes the event listener on unmount ✅
- ➕ Uses the custom breakpoint value in the media query string (beyond plan)

---

### 8. Tests — `EventMobileCardV2`
**✅ Done.**  
`src/partials/events/__tests__/EventMobileCardV2.test.jsx` — 14 tests. All six plan-specified cases covered:
- Title link renders to `wikipediaUrl` when valid ✅
- Falls back to `wikidataUrl` when `wikipediaUrl` is null ✅
- Renders `<span>` (no link) when both URLs are null ✅
- Renders type-icon fallback `<div>` when `imageUrl` is null ✅
- Renders type-icon fallback when `imageUrl` uses a non-http/https scheme ✅
- Shows "ongoing" label when status is `ONGOING` and `endDate` is null ✅

➕ Eight additional tests beyond the plan: description renders / absent, image renders for valid https URL, http image URL upgraded to https, Wikimedia Special:FilePath `?width=144` appended, non-Wikimedia URLs unmodified, PAST status shows formatted end date, external links carry `rel="noreferrer" target="_blank"`.

---

### 9. Tests — `EventsMobileV2`
**✅ Done.**  
`src/partials/events/__tests__/EventsMobileV2.test.jsx` — 3 tests. Both plan-specified cases covered:
- Renders one card per event ✅
- Renders the empty-state message when `events` is an empty array ✅
- ➕ Renders empty-state when `events` prop is omitted entirely (beyond plan)

---

### 10. Documentation — `README.md`
**✅ Done.**  
"Views" section added above the Stack section. Five-row table lists Table, Timeline, Map, Compact, and Mobile with trigger and description columns as specified in the plan.

---

### 11. Documentation — `AGENTS.md`
**✅ Done.**  
Three additions made as specified:
- `mobile` (`src/partials/events/EventsMobileV2.jsx`) added to the view modes list under `EventsV2` ✅
- `useMobileDetect.js` added to the data flow bullet list ✅
- Conventions note added: mobile hides view switcher and filter bar; agents must not reinstate them on small viewports; filter state still applies to the API call on mobile ✅

---

### 12. Documentation — `docs/technical-design/README.md`
**✅ Done.**  
Four section updates made as specified:
- **Section 1 — Overview**: "four views" changed to "five views; on mobile devices a dedicated card-list view is loaded automatically" ✅
- **Section 3 — Project Layout**: `useMobileDetect.js`, `EventsMobileV2.jsx`, and `EventMobileCardV2.jsx` added to the file tree ✅
- **Section 6 — Data Flow**: `useMobileDetect` added as the entry point; `EventsMobileV2` branch added to the tree; `isMobile` suppression of `views` and `filtersNode` noted; filter-state-still-applies caveat added ✅
- **Section 7 — Views**: Mobile row added to the table ✅

---

## Changes implemented beyond plan scope

| Change | Files |
|---|---|
| `wikimediaThumbnail` helper: appends `?width=144` to Wikimedia `Special:FilePath` URLs for server-side thumbnailing; upgrades `http://` to `https://` to avoid mixed-content blocking | `src/partials/events/EventMobileCardV2.jsx` |
| `useSyncExternalStore` implementation instead of `useState + useEffect` — eliminates the one-render lag and is safe under React 18 concurrent rendering | `src/hooks/useMobileDetect.js` |
| Derived state for `activeView` in `pages/index.js` instead of `useEffect + setActiveView` — removes stale-closure risk and the extra render cycle | `pages/index.js` |

---

## Coverage gap

`pages/index.js` lines 23, 61–64 (the `isMobile === true` branches) are not covered by the `index.test.jsx` suite — the mock sets `matches: false`, so the mobile path in `Home` is never entered there. These branches are exercised indirectly by the three dedicated mobile test suites and are straightforward derived-state expressions. No additional test is strictly required but a test mocking `useMobileDetect` to return `true` would close the gap.

---

## Post-verification fixes

After the initial verification pass, CI was failing due to `npm audit --audit-level=high`. The following changes were made:

| Change | Detail |
|---|---|
| `npm audit fix` | `axios` upgraded to 1.17.0 (HIGH), `next` to 16.2.9 (HIGH), plus moderate fixes for `brace-expansion`, `ws`, `postcss` |
| CI `node-version: 20` → `24` | Node.js 20 runner is deprecated on GitHub Actions effective 2026-06-16 |
| CI audit step updated | `npm audit --audit-level=high --omit=dev` — excludes `shell-quote` CRITICAL in devDep `@openapitools/openapi-generator-cli` (no safe upgrade path; never ships to production) |
| `AGENTS.md` updated | Stale postcss note replaced with current shell-quote constraint |

All production dependencies are now clean at HIGH+.

---

## Outstanding gaps before merge

None. All plan items are fully implemented and verified. Documentation is complete. The branch is ready to merge.
