# Release Notes — 1.2.0

> **Branch:** `23-create-mobile-view-for-daily-news-checks`  
> **Date:** 2026-06-10

---

## Summary

Release 1.2.0 adds a dedicated mobile view that activates automatically on viewports ≤ 768 px wide. Prior to this release, all four existing views (Table, Timeline, Map, Compact) used fixed heights and wide layouts designed exclusively for desktop screens. On a phone the app was unusable — content was clipped, the view switcher was inaccessible, and there was no meaningful way to scroll through events.

The new view presents events as a scrollable Wikipedia-style card list. Each card shows a thumbnail image (or a type-icon fallback), the event name linked to its Wikipedia page, a short description, date range, type badge, and a status indicator. The view switcher and filter bar are automatically hidden on mobile; filter state set on desktop is preserved when the viewport is resized.

No existing views or APIs are changed. The release is fully additive.

---

## Breaking changes

None.

---

## Release details

### Mobile event view — auto-detected, scrollable card list

On viewports ≤ 768 px the app automatically switches to a new `"mobile"` view. The switch is driven by `window.matchMedia` and reacts in real time as the browser is resized — crossing the 768 px breakpoint in either direction immediately toggles between mobile and the last-used desktop view.

On mobile:

- The view-switcher dropdown is hidden (an empty `views` array is passed to `MinimalHeader`, which already short-circuits at `views.length === 0`).
- The filter bar is hidden (`filtersNode={null}`). Filter state — selected types, from date, to date — is still forwarded to the API call; it is just not exposed in the mobile UI.
- Events are rendered as a vertically scrollable card list with no fixed height constraint.

#### Card layout

```
┌────────────────────────────────────────┐
│ [72×72 img]  Event Name (→ Wikipedia)  │
│              Short description…        │
│              2020-01-01 – 2025-06      │
│              [TYPE BADGE]  ● Ongoing   │
└────────────────────────────────────────┘
```

- **Title link:** resolves to `wikipediaUrl` first, then `wikidataUrl`. If both are absent or fail URL-scheme validation, the title is rendered as a plain `<span>` with no link.
- **Image:** Wikimedia `Special:FilePath` URLs have `?width=144` appended for server-side thumbnailing and are upgraded from `http://` to `https://` to avoid mixed-content blocking. If `imageUrl` is absent or uses a non-http/https scheme, a type-coloured icon fallback is shown instead.
- **Description:** clamped to two lines (`line-clamp-2`).
- **Dates:** formatted via `formatDateTime()`. Events with no end date and `ONGOING` status show "ongoing" in place of an end date.
- **Type badge:** coloured pill using the `TYPES` / `TYPE_ICONS` constants.
- **Status dot:** green (ongoing), blue (future), slate (past).
- **Accessibility:** title links carry `aria-label={event.name}`; image fallback divs carry `role="img"` and `aria-label={type name}`. All external links use `target="_blank" rel="noreferrer"`.

---

### iOS Safari — viewport height fix

The outer wrapper in `EventsV2` previously used `h-screen` (`100vh`). On iOS Safari, `100vh` is taller than the visible viewport because the browser chrome (URL bar) is not subtracted, causing the bottom of content to be obscured. The wrapper is now `h-[100dvh]` (dynamic viewport height), supported in all modern mobile browsers, which correctly reflects the usable screen area.

---

### `useMobileDetect` hook

`src/hooks/useMobileDetect.js` — new SSR-safe hook. Accepts an optional `breakpoint` parameter (default `768`). Returns `false` on the server and during the first render, then updates to the live `matchMedia` result after mount. Uses `useSyncExternalStore` for correctness under React 18 concurrent rendering — the hook cannot return a stale value between subscribe and snapshot calls.

---

### Responsive header hero

The header hero section now applies responsive Tailwind classes on small viewports: `text-xl md:text-3xl` on the headline and `pb-8 md:pb-16` on the hero content div. This reduces the header's footprint on narrow screens without affecting desktop presentation.

---

### Tests — 24 new tests (91 total across 12 suites)

Three new test suites ship with this release:

| Suite | File | Cases |
|---|---|---|
| `useMobileDetect` hook | `src/hooks/__tests__/useMobileDetect.test.js` | 5 |
| `EventMobileCardV2` component | `src/partials/events/__tests__/EventMobileCardV2.test.jsx` | 14 |
| `EventsMobileV2` component | `src/partials/events/__tests__/EventsMobileV2.test.jsx` | 3 |

`useMobileDetect` tests mock `window.matchMedia` and assert: correct initial value, update on media query change event, listener cleanup on unmount, and correct breakpoint string in the query.

`EventMobileCardV2` tests cover: title link → `wikipediaUrl`, fallback to `wikidataUrl`, plain `<span>` when both URLs are absent, plain `<span>` when URLs use non-http/https schemes, image renders for valid URL, `http://` upgraded to `https://`, Wikimedia `?width=144` thumbnail param appended, non-Wikimedia URLs left unchanged, type-icon fallback when `imageUrl` is null, type-icon fallback for non-http/https `imageUrl`, "ongoing" label shown for `ONGOING` + no end date, formatted end date for `PAST` status, external link `rel`/`target` attributes.

`EventsMobileV2` tests cover: one card rendered per event, empty-state message for an empty array, empty-state message when the `events` prop is omitted.

---

## Infrastructure

- **`src/hooks/useMobileDetect.js`** — new hook; `useSyncExternalStore`; SSR-safe server snapshot `() => false`; `breakpoint` param defaults to `768`.
- **`src/partials/events/EventMobileCardV2.jsx`** — new component; `safeHref` for all API-sourced URLs; `wikimediaThumbnail` helper for Wikimedia thumbnail resizing and http→https upgrade.
- **`src/partials/events/EventsMobileV2.jsx`** — new container; pure render; `divide-y divide-slate-100` list layout.
- **`src/components/events/EventsV2.jsx`** — `EventsMobileV2` added as dynamic import (`ssr: false`); `"mobile"` added to content map and `PropTypes.oneOf`; outer wrapper changed to `h-[100dvh]`.
- **`pages/index.js`** — `useMobileDetect` imported; `activeView` derived as `isMobile ? "mobile" : desktopView` (no `useEffect` needed); `views` and `filtersNode` gated on `isMobile`.
- **`src/components/MinimalHeader.jsx`** — responsive hero classes added; no logic changes.

---

## Dependency security updates

`npm audit fix` was run as part of this branch. Two production dependencies with HIGH-severity advisories were upgraded:

| Package | Before | After | Advisories fixed |
|---|---|---|---|
| `axios` | 1.13.x | **1.17.0** | GHSA-pjwm-pj3p-43mv, GHSA-898c-q2cr-xwhg, GHSA-35jp-ww65-95wh (and others — DoS, header injection, proxy bypass via prototype pollution) |
| `next` | 16.2.4 | **16.2.9** | GHSA-8h8q-6873-q5fj, GHSA-26hh-7cqf-hhc6, GHSA-3g8h-86w9-wvmq (and others — denial of service, middleware/proxy bypass, cache poisoning) |

One moderate advisory (`postcss < 8.5.10` bundled inside `next`) and two moderate advisories (`brace-expansion`, `ws`) were also resolved as part of the same fix run.

`shell-quote` (CRITICAL, `GHSA-w7jw-789q-3m8p`) remains unresolved. It is an indirect devDependency via `@openapitools/openapi-generator-cli` → `concurrently` and is never included in the production build. The only npm-offered fix would downgrade the CLI wrapper to 2.23.0, breaking the pinned 7.9.0 Java generator. It is excluded from the CI audit gate (see below).

---

## CI updates

### Node.js 24

The CI workflow (`jobs.test`) now runs on `node-version: 24`. GitHub Actions is deprecating Node.js 20 as the runner runtime for `actions/checkout` and `actions/setup-node`, with forced migration to Node.js 24 on 16 June 2026.

### Production-only audit gate

The audit step is now `npm audit --audit-level=high --omit=dev`. The `--omit=dev` flag restricts the audit to production dependencies, excluding the `shell-quote` CRITICAL that is locked inside the devDependency `@openapitools/openapi-generator-cli` with no safe upgrade path. All production dependencies are clean at HIGH+.

---

## Documentation

- **`README.md`** — "Views" table added, listing all five views with trigger and description.
- **`AGENTS.md`** — `mobile` added to view modes list; `useMobileDetect.js` added to data-flow bullets; conventions note added on mobile filter-state behaviour.
- **`docs/technical-design/README.md`** — Overview, Project Layout, Data Flow, and Views sections updated to reflect the new hook, components, and mobile branch in the data flow tree.

---

## Backward compatibility

Fully backward compatible. The existing Table, Timeline, Map, and Compact views are unchanged. The `"mobile"` view key is new and is only activated by `useMobileDetect` — no existing code path can inadvertently select it.

---

## Known constraints

- The `isMobile === true` branches in `pages/index.js` are not covered by `index.test.jsx` (the mock sets `matches: false`). The mobile code paths are exercised by the three dedicated mobile test suites. A future test mocking `useMobileDetect` to return `true` would close this gap.
- On the initial server render, `useMobileDetect` always returns `false`, so mobile users see a brief flash of the desktop layout before the mobile view activates after mount. Minimised by the responsive hero classes and the immediate client-side switch, but a CSS-only pre-JS solution (e.g. hiding desktop-only elements below the breakpoint) would eliminate it entirely.
- The mobile view is a card list only — it does not support the map, timeline, or compact visualisations. Tapping a card opens the Wikipedia page in a new tab; there is no in-app detail view.
- End-to-end tests (Playwright/Cypress) covering the resize breakpoint behaviour are deferred to a future release.
- `shell-quote` CRITICAL (`GHSA-w7jw-789q-3m8p`) in the devDependency `@openapitools/openapi-generator-cli` has no safe upgrade path and is excluded from the CI audit gate via `--omit=dev`. Production dependencies are clean. Tracked in `AGENTS.md`.
