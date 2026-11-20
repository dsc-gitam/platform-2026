# Overview

The GDG on Campus GITAM website is a **static site** (plain HTML, CSS and JavaScript built by a small Node script) plus an optional **API** (Deno-authored, running as a Firebase Function) that adds accounts, registrations, QR tickets, points and an admin panel.

```
Browser  ──►  Firebase Hosting (static site, built by GitHub Actions)
   │
   │  Firebase Auth: Google, guest (anonymous) and email link
   ▼
Firebase Function (the API, /api/**)  ──►  Supabase Postgres (Prisma 7)
   │
   │  approved story / team change / event / profile update
   ▼
GitHub commit to dsc-gitam/platform-2026  ──►  GitHub Actions  ──►  rebuild and deploy
```

Without the API the site still works: forms are kept in the visitor's browser and the sample content in `src/data/site.mjs` is shown.

## What visitors can do

- Browse events, domains, the community noticeboard, the legacy and team pages, and the **Tech Atlas** (an interactive way to explore tech roles).
- Take the **Find your place** quiz on the home page.
- **Register for an event** in one click when signed in with Google, or as a **guest** by filling a short form.
- See a **QR ticket**, and on the day of the event an **Access ticket** button on the home page.
- Keep a **profile** with tickets, points, badges, a leaderboard, and their Tech Atlas and quiz results.

## What the team can do

- Run everything from the **admin panel** at `/admin.html` (see *Admin guide*).
- Publish events, post-event pages and PDF reports, approve stories and team members, and send notifications.
- Every approved change is published to the site automatically through GitHub (see *Content and publishing*).

## Repository layout

| Path | What it is |
|---|---|
| `src/pages/` | One file per page (`index.mjs`, `events.mjs`, `admin.mjs`, ...). |
| `src/sections/` | Blocks shared by several pages (legacy, Find your place, event reports). |
| `src/data/site.mjs` | Sample content and site settings. Replaced by `src/data/generated/*.json` when the API publishes. |
| `src/assets/` | CSS, JavaScript, images and team photos. |
| `docs/` | These documents (Markdown). They are rendered at `/docs.html`. |
| `server/` | The API source (Deno), the Prisma schema and migrations, and the tests. |
| `functions/` | Bundles `server/` into a Firebase Function that serves the API at `/api/**`. |
| `build.mjs` | Builds the site into `dist/`. |
| `.github/workflows/deploy.yml` | Builds and deploys the site on every push and nightly. |
