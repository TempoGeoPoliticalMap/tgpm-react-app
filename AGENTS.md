# AGENTS.md

Guidance for coding agents working in this repository.

## Project Overview

**TempoGeoPoliticalMap (TGPM)** is a Next.js (Pages Router) app that displays geopolitical events sourced from `https://api.tgpm.world/`.

Current stack (source of truth: `package.json`):
- Next.js `16.x`
- React `19.x`
- Tailwind CSS `4.x`
- Ant Design `6.x`

## Commands

```bash
npm run dev        # Start Next.js dev server
npm run build      # Production build (Turbopack)
npm run start      # Start production server
npm run lint       # Lint pages/ and src/ (.js, .jsx)
npm run lint:fix   # Auto-fix lint errors
npm test           # Run test suite (Jest + Testing Library)
npm run test:coverage  # Run tests with coverage report
```

Notes:
- If `next build` fails with a local Turbopack environment issue, use:
  - `npx next build --webpack`
- ESLint uses flat config (`eslint.config.js`); there is no `.eslintrc.json` or `.eslintignore`.

## Architecture

Primary route:
- `pages/index.js`

Main page composition:
- `MinimalHeader` (`src/components/MinimalHeader.jsx`)
- `EventsV2` (`src/components/events/EventsV2.jsx`) with view modes:
  - `table` (`src/partials/events/EventsTableV2.jsx`)
  - `timeline` (`src/partials/events/EventsTimelineV2.jsx`)
  - `map` (`src/partials/events/EventsMapV2.jsx`)
  - `compact` (`src/partials/events/EventsCompactV2.jsx`)

Data flow:
- API client: `src/api/api.ts` (`axiosInstance`)
- V2 filter/sort helper: `src/utils/filterAndSortEventsV2.js`
- Event constants + icons: `src/constants/eventsV2Types.js`

## Routing and Tooling Rules

- This repo is Next.js-based. Do not introduce `react-router-dom`.
- Do not reintroduce Vite config/dependencies.
- Use `next/link`, `next/router` (or local compat utilities) for navigation concerns.

## API / Generated Client

Generated client location:
- `src/@generated/` (do not edit manually)

OpenAPI source:
- `scripts/openapi/openapi.yaml`

Regeneration workflow:
- Run from repository root:
  - `make openapi`
- The spec SHA is pinned in `config.env` (`SPEC_SHA=<sha>`); update it before regenerating.

What this does:
- Downloads the bundled OpenAPI spec at the pinned SHA from `TempoGeoPoliticalMap/tgpm-openapi`
- Applies local spec patching
- Recreates `src/@generated/` via `openapi-generator-cli` v7.9.0 (`typescript-axios`)

## Conventions

- Reusable components: `src/components/`
- Page section composites: `src/partials/`
- UI code: `.jsx`
- API/generated client: `.ts`

## Known Gaps / Cleanup Targets

- 2 moderate `npm audit` vulnerabilities (PostCSS XSS, `GHSA-qx2v-qp2m-jg93`) are blocked on an upstream Next.js fix. Next.js 16.2.4 (current latest, including canary) still bundles PostCSS 8.4.31; the fix requires PostCSS ≥8.5.10. Unresolvable until Next.js ships a release that bumps their internal PostCSS dependency.
