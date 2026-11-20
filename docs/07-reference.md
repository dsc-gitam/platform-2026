# Reference

## Environment variables (API)

On Firebase Functions `DATABASE_URL`, `GOOGLE_SERVICE_ACCOUNT` and `GITHUB_TOKEN` are **secrets** (Secret Manager), the rest go in `functions/.env.gdg-gitam`. Locally they come from `server/.env`.

| Variable | Purpose |
|---|---|
| `DATABASE_URL` | Runtime Postgres connection (Supabase pooler). |
| `DIRECT_URL` | Direct connection used by `deno task migrate`. |
| `FIREBASE_PROJECT_ID` | Used to verify Firebase ID tokens (local only: Cloud Functions provides it). |
| `GOOGLE_SERVICE_ACCOUNT` | Service account JSON: sets role claims and sends push notifications. |
| `SUPERADMIN_EMAILS` | Become ADMIN on first sign-in. |
| `ALLOWED_ORIGINS` | CORS allow-list for the site. |
| `GITHUB_TOKEN`, `GITHUB_REPO`, `GITHUB_BRANCH` | Where approved content is committed. |
| `PORT` | Port to listen on locally (default 8000). |
| `DEV_AUTH` | Local testing only. Never in production. |

## Build-time variables (site)

| Variable | Purpose |
|---|---|
| `GDG_API_BASE` | API URL. Without it the account features stay off. |
| `FIREBASE_WEB_CONFIG` | Optional override of `src/data/firebase.web.json` (the public web config; add `vapidKey` for push). |
| `SITE_URL` | Canonical URL, sitemap and share tags (default `https://gdg-gitam.web.app`). |
| `GDG_DEV_AUTH` | Shows the dev sign-in dialog when set to `1`. |

## API endpoints

All paths start with `/api`. "Auth" means a valid Firebase ID token (`Authorization: Bearer ...`).

| Method and path | Access | What it does |
|---|---|---|
| `GET /health` | public | Database check. |
| `GET /seats` | public | Registered count per event. |
| `GET /users/:id/photo` | public | Uploaded profile photo. |
| `POST /applications` | auth (session ideas also public) | Submit a member, volunteer, core, speaker, session or story form. |
| `GET /me` | auth | Profile, points, rank, badges, registrations, exploration, leaderboard. |
| `PATCH /me`, `PUT /me/photo` | auth | Update details and photo. |
| `PUT /me/exploration` | auth | Save Tech Atlas and quiz results. |
| `POST /me/fcm-token` | auth | Register a device for push. |
| `POST /me/events/:id/register` | auth or guest | Register. Guests send their details as `profile`. |
| `DELETE /me/events/:id/register` | auth | Cancel (not after check-in). |
| `GET /admin/stats` | `analytics:read` | Dashboard numbers. |
| `GET/POST /admin/events`, `PUT/DELETE /admin/events/:id` | `registrations:read` / `events:write` | List and manage events. |
| `PUT /admin/events/:id/details` | `postevent:write` | Post-event data and publish flag. |
| `GET /admin/events/:id/registrations` | `registrations:read` | Registrations for an event. |
| `POST /admin/scan`, `/admin/checkin` | `checkin` | Look up and check in by ticket code. |
| `POST /admin/points` | `points:award` | Award points. |
| `GET /admin/applications`, `PATCH /admin/applications/:id` | `requests:read` / `requests:review` | Review requests. |
| `GET /admin/users`, `PATCH /admin/users/:id/role` and `/team` | `users:read` / `roles:write` | Users, roles, team placement. |
| `POST /admin/notify` | `notify:send` | Push notification. |
| `POST /admin/sync`, `GET /admin/sync-log` | `content:sync` | Force a publish, see the log. |

## Data model (Prisma)

`User`, `Event`, `Registration`, `PointAward`, `Exploration` (Tech Atlas and quiz), `Application` (all form requests) and `SyncLog`. The schema is in `server/prisma/schema.prisma` and migrations are in `server/prisma/migrations/`.

## Troubleshooting

| Symptom | Likely cause |
|---|---|
| No account badge on the live site | `GDG_API_BASE` or `FIREBASE_WEB_CONFIG` was not set at build time. |
| Google sign-in popup says unauthorized domain | Add the domain under Firebase **Authentication → Settings → Authorized domains**. |
| "Could not reach the server" | Function not deployed, wrong `GDG_API_BASE`, or (for another origin) it is missing from `ALLOWED_ORIGINS`. Function logs: `firebase functions:log --project gdg-gitam`. |
| Email link says expired or already used | Links work once and expire. Request a new one. |
| Approved something but the site did not change | Open **Admin → Publishing**: the log shows the GitHub error (token scope, repo name, branch). |
| Admin panel says "No admin access" | The account has no role yet. Add the email to `SUPERADMIN_EMAILS` or ask an admin. |
| Push notifications do nothing | Add `vapidKey` to `FIREBASE_WEB_CONFIG` and enable Cloud Messaging. |
