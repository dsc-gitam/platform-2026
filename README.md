# GDG on Campus GITAM: platform 2026

The website and platform for **GDG on Campus GITAM**: events and registration with QR tickets, a profile with points and badges, a Tech Atlas for exploring tech roles, a community noticeboard, and an admin panel for the team.

- **Site:** a static site built with a small zero-dependency Node script (plain HTML, CSS and JavaScript).
- **API:** written for [Deno](https://deno.com) with [Hono](https://hono.dev) and [Prisma 7](https://www.prisma.io) on PostgreSQL ([Supabase](https://supabase.com)), and run in production as a **Firebase Function** (`functions/` bundles `server/`).
- **Auth:** [Firebase Auth](https://firebase.google.com/docs/auth) (Google, guest sessions and passwordless email links) with role-based access control.
- **Hosting and deploys:** Firebase Hosting through GitHub Actions; `/api/**` is rewritten to the function. Approved content is committed back to this repository and redeployed automatically.

Full documentation is in [`docs/`](docs/) and is also published inside the site at **`/docs.html`**.

## Quick start

```bash
npm run dev            # build into dist/ and serve http://localhost:4173
```

Edit files in `src/`, then run `npm run build` and refresh. No install step: the site has no dependencies.

To run it with accounts, registrations and the admin panel you also need the API and a Postgres database. That takes about five minutes: see [Run it locally](docs/02-run-locally.md).

```bash
cd server
deno task generate && deno task migrate && deno task seed
deno task dev                       # API on http://localhost:8000
deno task test                      # end-to-end tests against Postgres
```

## Documentation

| Read | For |
|---|---|
| [Overview](docs/01-overview.md) | What is in the repo and how the pieces fit. |
| [Run it locally](docs/02-run-locally.md) | Site only, site plus API, tests. |
| [Go live](docs/03-setup.md) | Firebase, Supabase, the API, GitHub and the first admin. |
| [Accounts, tickets and points](docs/04-accounts.md) | Google, guests, email links, QR tickets, points. |
| [Admin guide](docs/05-admin-guide.md) | Roles and every section of the admin panel. |
| [Content and publishing](docs/06-content.md) | How content reaches the site, and how the documentation team publishes an event. |
| [Reference](docs/07-reference.md) | Environment variables, API endpoints, data model, troubleshooting. |

## Project layout

```
src/pages/        one file per page            src/data/site.mjs   sample content and settings
src/sections/     blocks shared by pages       src/assets/         CSS, JS, images, team photos
server/           API source (Deno), Prisma schema, tests
functions/        Firebase Function that bundles and serves the API
docs/             these documents (Markdown, rendered at /docs.html)
build.mjs         builds the site into dist/   .github/workflows/  build and deploy
```

## Scripts

| Command | What it does |
|---|---|
| `npm run build` | Build the site into `dist/`. |
| `npm run dev` | Build, then serve on port 4173. |
| `deno task dev` (in `server/`) | Run the API with file watching. |
| `deno task test` (in `server/`) | API and GitHub-publishing tests. |
| `firebase deploy --only functions` | Bundle and deploy the API function. |

## Environment

The API reads its settings from `server/.env` (copy `server/.env.example`). The site reads `GDG_API_BASE`, `SITE_URL` and (optionally) `FIREBASE_WEB_CONFIG` at build time; the public Firebase web config is already in `src/data/firebase.web.json`. Nothing secret is ever built into the site. Details are in the [reference](docs/07-reference.md).

## Contributing

1. Make your change on a branch and run `npm run build` (and `deno task test` if you touched `server/`).
2. Open a pull request. Pushes to `main` deploy the site.
3. Content that is managed in the admin panel (events, stories, team) lives in `src/data/generated/` and is written by the API. Do not edit those files by hand.

An independent student community. Google and the Google Developer Groups program are trademarks of Google LLC.
