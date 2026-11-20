# GDG on Campus GITAM — website

Static, zero-dependency site. Source in `src/`, built HTML in `dist/` (deploy that folder anywhere: Firebase Hosting, Netlify, GitHub Pages, Cloud Storage).

```bash
npm run dev      # build + serve at http://localhost:4173
npm run build    # just build into dist/
```

## Where content lives (edit these, rebuild)

| What | File |
|---|---|
| Site name, domain, email, socials, form endpoints, "Sample" tags on/off | `src/data/site.mjs` → `site` |
| Team, open roles | `src/data/site.mjs` → `team` |
| Events (upcoming/past) | `src/data/site.mjs` → `events` |
| Announcements, forum seed posts | `updates`, `forumSeed` |
| Domains, timeline, achievements, stories, gallery, roadmap, FAQs | same file |
| Tech Atlas roles, interests | `src/data/roles.mjs` |
| Find-your-place paths | `src/sections/find.mjs` (`paths`, shown on the home page) and scoring in `src/assets/js/quiz.js` |
| Colours, type, components | `src/assets/css/styles.css` (`:root` tokens) |

## Before launch checklist

- Set `site.url` (canonical URLs, sitemap, OG tags).
- Set `site.client.formEndpoint` (e.g. a Google Apps Script web app writing to a Sheet) so registrations/applications reach you. Until then submissions are stored in the visitor's browser only.
- Set up the community board backend (`forumEndpoint`) — it is local-only until then.
- Replace placeholder photos/stories/bios; set `showPlaceholderTags: false`.
- Swap the brand mark for the official GDG on Campus assets, and convert `og-image.svg` to a 1200×630 PNG (most social crawlers ignore SVG).

## Publishing a past event (Documentation team)

Past events live in `src/data/site.mjs` (`events`, entries with `status: 'past'`). Until an event is **ready**, its "Explore this event" button is disabled with the tooltip "Will be available within 12 hours", and no detail page or report is built.

To publish one, fill in what you have and set `ready: true`:

- `about` (paragraphs), `speakers`, `takeaways`, `resources` (`{ label, url, kind }`), `photos` (add `src: 'assets/events/…jpg'` for real photos), `recording.youtubeId` (the id from the YouTube link).
- Optional `report` extras used only in the PDF: `stats` (`[{ label, value }]`), `highlights`, `feedback` (`[{ quote, by }]`), `thanks`, `preparedBy`.

The event page's **Download report (PDF)** button opens a print-ready page built from this data (`event-<name>-report.html`). Any section with no data is simply left out, so a partial report still looks complete. Visitors choose **Save as PDF** in the print dialog.

---

## Backend, accounts and admin panel

The site is still static, but it can talk to a small API (Deno + Prisma 7 + Supabase Postgres) that adds Google sign-in, registrations with QR tickets, points/badges/leaderboard, an admin panel, and publishing of approved content back to this repo (which redeploys the site).

```
browser (static site on Firebase Hosting)
   │  Firebase Auth (Google)  ──►  ID token
   ▼
Deno API (server/)  ──►  Supabase Postgres (Prisma 7)
   │  approved story / team / event / profile change
   ▼
GitHub commit  ──►  GitHub Actions  ──►  rebuild + deploy
```

### What the site does once the backend is connected
- **Account badge** (top right of the navbar) and a **Continue with Google** option when registering (above the classic form, separated by "or").
- **First sign-in** sends people to the *Become a member* form only. After that, **registering is one click**: details come from the profile and only the event's own questions are asked.
- **Profile** (`profile.html`): tickets with QR codes, points, badges, leaderboard, Tech Atlas picks and quiz result (synced from the browser), editable details and photo.
- **Access ticket**: on the day of an event, the home page button for a registered member changes from *Save your seat* to *Access ticket* and opens the ticket dialog.
- **Notification prompt** shortly after landing (the browser's own dialog only appears if they say yes).
- **Admin panel** (`admin.html`): analytics, events (create/edit), registrations + CSV, post-event uploads, QR scanner with check-in and points, requests (member / volunteer / core / speaker / session / story), users & roles, push notifications, publishing log.

### Roles (RBAC)
| Role | Can |
|---|---|
| MEMBER | no admin access |
| CORE | scan tickets, check in, award points, see registrations |
| DOCS | upload post-event data, see registrations and analytics |
| ORGANIZER | everything above plus create/edit events, review requests, send notifications, see users |
| ADMIN | everything, including changing roles and forcing a publish |

The database role is authoritative and is mirrored into a Firebase custom claim (`role`). Emails in `SUPERADMIN_EMAILS` become ADMIN the first time they sign in.

### Points
Checking in gives +10. Core/organizers can then award points from the scanner during the session (presets such as *Speaker question +10*, *Icebreaker winner +15*, or a custom amount between -50 and 100). The leaderboard sums everything.

### Content that is published to GitHub
When an admin approves it, the API commits JSON (and team photos) to `src/data/generated/` and `src/assets/team/` in one commit, which triggers `.github/workflows/deploy.yml`:
- a **featured story** → `stories.json` (appears on Home and Legacy)
- an approved **core team** or **volunteer** application (the admin chooses title and bio) → `team.json`
- **events** (create/edit/post-event data) → `events.json`
- a team member **updating their profile or photo** → `team.json` + photo

If those files are missing the site simply uses the sample data in `src/data/site.mjs`. The workflow also runs every night so upcoming events become past events on time.

### Setup checklist
1. **Supabase**: create a project; copy the *transaction pooler* URL (`DATABASE_URL`) and the *direct* URL (`DIRECT_URL`).
2. **Firebase**: create a project; enable *Authentication → Google*; register a web app and copy its config. For push, enable Cloud Messaging and generate a Web Push key (VAPID). Create a service account key (Project settings → Service accounts) for the API.
3. **API** (`server/`, needs Deno 2): copy `.env.example` to `.env` and fill it in, then
   ```bash
   cd server
   deno task generate     # Prisma client
   deno task migrate      # create tables
   deno task seed         # import the events that ship with the site (optional)
   deno task dev          # http://localhost:8000
   deno task test         # end-to-end tests (need a throw-away Postgres in .env.test)
   ```
   Deploy it to Deno Deploy (or any Deno host) with the same environment variables; run `deno task generate` as the build step.
4. **GitHub**: add a fine-grained token with *Contents: read and write* on this repo as `GITHUB_TOKEN` for the API. For the deploy workflow add repository **variables** `GDG_API_BASE`, `FIREBASE_WEB_CONFIG` (the web app config as one-line JSON, plus `vapidKey`), `FIREBASE_PROJECT_ID`, `SITE_URL`, and the secret `FIREBASE_SERVICE_ACCOUNT` (a deploy key for Firebase Hosting).
5. Build locally with the same variables to try it: `GDG_API_BASE=http://localhost:8000 FIREBASE_WEB_CONFIG='{...}' node build.mjs`.

For local testing without Firebase, run the API with `DEV_AUTH=1` and build the site with `GDG_DEV_AUTH=1`; the sign-in dialog then offers a dev sign-in. **Never enable `DEV_AUTH` in production.**
