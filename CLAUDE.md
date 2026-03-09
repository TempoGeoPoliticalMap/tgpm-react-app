# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**TempoGeoPoliticalMap (TGPM)** — a Next.js 13 web app that displays historical and ongoing geopolitical events sourced from a REST API backed by Wikidata. The single page renders a table of events (currently only `WARFARE_AND_ARMED_CONFLICTS` type) fetched from `https://api.tgpm.world/`.

## Commands

```bash
npm run dev        # Start Next.js dev server (NODE_ENV=development)
npm run build      # Production build
npm run start      # Start production server
npm run lint       # Lint pages/ and src/ (.js, .jsx)
npm run lint:fix   # Auto-fix lint errors
```

No test suite is configured yet (eslint-plugin-jest is installed but no test files exist).

## Architecture

**Framework:** Next.js 13 (Pages Router, `output: "standalone"` for containerized deploys)
**Styling:** Tailwind CSS v3 + `@tailwindcss/forms`
**UI template base:** [Cruip Mosaic](https://cruip.com/demos/mosaic/) — many components from the template exist but are unused/commented out.

### Key data flow

```
pages/index.js
  └─ MinimalHeader (src/components/)
  └─ Events (src/components/)
       └─ EventsTable (src/partials/events/)
            ├─ fetches GET /v1/events via axiosInstance (src/api/api.ts)
            ├─ shows LoadingSpinner while fetching
            └─ renders EventsTableItem rows (src/partials/events/)
                 └─ maps type/status via TYPES/STATUSES constants (src/constants/events.js)
```

### API layer

- `src/api/api.ts` — Axios instance preconfigured with `baseURL: "https://api.tgpm.world/"` and `proxy: false`
- `src/@generated/` — TypeScript client auto-generated from OpenAPI spec via `openapi-generator-cli` (v6.5.0); **do not edit manually**
- `scripts/openapi/openapi.yaml` — the OpenAPI spec source; regenerate the client after changes

### Event data model (from API)

`EventDef`: `wikidataId`, `name`, `type` (only `WARFARE_AND_ARMED_CONFLICTS`), `startTime`, `endTime?`, `timeStateRelativeToNow` (`PAST`|`ONGOING`|`FUTURE`), `countries[]`, `locations[]`

### Code conventions

- Components in `src/components/` are generic/reusable; `src/partials/` holds page-section composites
- JSX files use `.jsx`; API/generated code uses `.ts`
- ESLint enforces: double quotes, no `console`, no `var`, import ordering with newlines between groups, no trailing commas
- Prettier is integrated via `eslint-plugin-prettier`

### Known TODOs in code

- Filtering by event type and date is hardcoded on the backend (see `Events.jsx` TODO comments)
- Countries/Territories and Locations columns in the table are stubbed as "TBD"
- Pagination is removed pending proper implementation
- Many Sidebar/Header/Checkbox/Search features from the Mosaic template are commented out
