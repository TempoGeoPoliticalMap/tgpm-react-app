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
```

Notes:
- If `next build` fails with a local Turbopack environment issue, use:
  - `npx next build --webpack`
- ESLint currently uses legacy config files (`.eslintrc.json`, `.eslintignore`) with ESLint v9 installed. Lint may fail until migrated to `eslint.config.js`.

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
  - `bash scripts/openapi.sh`

What this script does:
- Downloads latest OpenAPI spec
- Applies local spec patching
- Recreates `src/@generated`
- Runs `openapi-generator-cli` for `typescript-axios`

## Conventions

- Reusable components: `src/components/`
- Page section composites: `src/partials/`
- UI code: `.jsx`
- API/generated client: `.ts`

## Known Gaps / Cleanup Targets

- ESLint v9 flat config migration is pending.
- Legacy template components exist and may be unused.
- No automated test suite is currently configured.
