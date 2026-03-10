# TempoGeoPoliticalMap React App

## Project setup

- `npm install`
- Provide environment variables into `.env` file (see `.env.example`)

## Available scripts

Command format: `npm run <command>`

| Command | Description |
|---|---|
| `npm run dev` | Start Next.js in development mode |
| `npm run build` | Build the application for production |
| `npm run start` | Start a Next.js production server |
| `npm run lint` | Run ESLint |
| `npm run lint:fix` | Auto-fix lint errors |

## Deployment

The app is deployed to **Netlify** automatically:

- **Production** — deploys from the `main` branch
- **Preview** — deploys automatically for every pull request

No manual deployment steps are required.

## Stack

- [Next.js 16](https://nextjs.org/) (Pages Router)
- [React 19](https://react.dev/)
- [Tailwind CSS v4](https://tailwindcss.com/)
- [Ant Design v6](https://ant.design/)
- [React Leaflet](https://react-leaflet.js.org/) for the interactive map
- Data sourced from [Wikidata](https://www.wikidata.org/) via [api.tgpm.world](https://api.tgpm.world)
