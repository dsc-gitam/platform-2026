# Run it locally

You need **Node 22+** for the site and **Deno 2** plus **PostgreSQL** for the API (only if you want accounts).

## The site only

```bash
npm run dev          # builds into dist/ and serves http://localhost:4173
```

Edit a file in `src/`, run `npm run build`, refresh. Account features stay hidden because no API is configured, but the account badge is always shown on `localhost` so you can review the design.

## The site with the API

1. Start Postgres and create a database, for example `gdg`.
2. Create `server/.env` from `server/.env.example`. For local work you only need:

   ```bash
   DATABASE_URL=postgresql://localhost:5432/gdg
   DIRECT_URL=postgresql://localhost:5432/gdg
   DEV_AUTH=1
   SUPERADMIN_EMAILS=you@example.com
   ALLOWED_ORIGINS=http://localhost:4173
   ```

3. Set up the database and start the API:

   ```bash
   cd server
   deno task generate     # builds the Prisma client
   deno task migrate      # creates the tables
   deno task seed         # imports the sample events (optional)
   deno task dev          # http://localhost:8000
   ```

4. Build the site pointing at it, with the local sign-in switched on:

   ```bash
   GDG_API_BASE=http://localhost:8000 GDG_DEV_AUTH=1 node build.mjs
   node serve.mjs
   ```

The sign-in dialog now shows a **Dev sign-in** form (type any email and name). Using the email from `SUPERADMIN_EMAILS` makes you an admin.

> **Never** set `DEV_AUTH=1` on a real server. It lets anyone sign in as anyone by sending a header.

## Tests

```bash
cd server
deno task test         # uses server/.env.test, point it at a throw-away database
```

The tests run the whole API against a real Postgres: sign-in, membership, registration, guests, roles, check-in and points, requests, events, and the content that is published to GitHub. A second test runs the GitHub commit logic against a local fake of the GitHub API.
