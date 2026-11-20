# Go live: setup checklist

These are the one-time steps to switch on accounts and publishing. The Firebase project is **`gdg-gitam`** and the repository is **`dsc-gitam/platform-2026`**.

## 1. Firebase (sign-in, hosting, notifications)

1. In the [Firebase console](https://console.firebase.google.com/project/gdg-gitam) open **Authentication → Sign-in method** and enable **Google**, **Anonymous** and **Email link (passwordless sign-in)**. Email/password can stay on but is not used.
2. Under **Authentication → Settings → Authorized domains** add your live domain (and keep `localhost`). Email links only work on authorized domains.
3. The **web app is already registered** ("GDG GITAM Web", app id `1:650001549225:web:06ae9c83f8fdeeebe0e6b8`) and its public config is saved in `src/data/firebase.web.json`, so the site picks it up without any build variable. The hosting site is `gdg-gitam` (https://gdg-gitam.web.app).
4. **Cloud Messaging → Web Push certificates**: the key pair has been generated and its public key is saved as `vapidKey` in `src/data/firebase.web.json` (public keys are safe to commit). If you ever regenerate it, replace that value.
5. **Project settings → Service accounts → Generate new private key**. Keep that JSON secret: it goes into the API's `GOOGLE_SERVICE_ACCOUNT`, and a Firebase Hosting deploy key goes into GitHub (step 4).

The Firebase CLI needs to be signed in with an account that has access to `gdg-gitam`:

```bash
firebase login:use <account with access>   # or: firebase login:add
firebase apps:list --project gdg-gitam
firebase apps:sdkconfig web 1:650001549225:web:06ae9c83f8fdeeebe0e6b8 --project gdg-gitam
```

## 2. Supabase (database)

1. Create a project. Pick a region close to your users.
2. **Project settings → Database → Connection string**:
   - **Transaction pooler** (port 6543) is `DATABASE_URL`, used by the running API.
   - **Direct connection** (port 5432) is `DIRECT_URL`, used for migrations.
3. Create the tables from your machine:

   ```bash
   cd server
   deno task generate
   deno task migrate
   deno task seed      # optional: imports the sample events
   ```

## 3. The API (Firebase Functions)

The API is written for Deno (`server/`, with its tests) and is **bundled to run as a Firebase Function** (Node 22) from `functions/`. Hosting rewrites `/api/**` to the function, so the site and the API share one origin (`https://gdg-gitam.web.app`) and there is no CORS to configure for the live site.

One-time setup (needs the **Blaze** plan; Firebase Functions and Secret Manager do not run on Spark):

```bash
# secrets live in Secret Manager
firebase functions:secrets:set DATABASE_URL --project gdg-gitam            # Supabase transaction pooler string
firebase functions:secrets:set GOOGLE_SERVICE_ACCOUNT --data-file key.json --project gdg-gitam
firebase functions:secrets:set GITHUB_TOKEN --project gdg-gitam            # fine-grained token, Contents read/write on this repo
```

Then add `GITHUB_TOKEN` to the `secrets` list in `functions/index.js` (a comment shows where). Non-secret settings go in `functions/.env.gdg-gitam` (git-ignored, copy `functions/.env.example`):

| Variable | Value |
|---|---|
| `SUPERADMIN_EMAILS` | comma-separated emails that become admin on first sign-in |
| `ALLOWED_ORIGINS` | the site origins, for example `https://gdg-gitam.web.app` (plus `http://localhost:4173` for local work) |
| `GITHUB_REPO` | `dsc-gitam/platform-2026` |
| `GITHUB_BRANCH` | `main` |

The Firebase project id is provided by Cloud Functions itself, and the database password never leaves Secret Manager.

Deploy the function whenever `server/` changes:

```bash
firebase deploy --only functions --project gdg-gitam    # builds functions/lib/app.js, then uploads
```

Check it: `https://gdg-gitam.web.app/api/health` returns `{"ok":true}` once the site is deployed with the rewrite, or `https://asia-south1-gdg-gitam.cloudfunctions.net/api/api/health` directly.

Run the same code locally with Deno (`deno task dev` in `server/`) or smoke-test the bundle on Node with `npm run smoke` in `functions/`.

## 4. GitHub (build and deploy)

In the repository **Settings → Secrets and variables → Actions**:

| Name | Kind | Value |
|---|---|---|
| `GDG_API_BASE` | variable | `https://gdg-gitam.web.app` (the API is served from the same origin) |
| `FIREBASE_WEB_CONFIG` | variable (optional) | overrides `src/data/firebase.web.json`; one-line JSON, including `vapidKey` |
| `FIREBASE_PROJECT_ID` | variable | `gdg-gitam` |
| `SITE_URL` | variable | the live site URL |
| `FIREBASE_SERVICE_ACCOUNT` | secret | a service account JSON allowed to deploy to Firebase Hosting |

The workflow in `.github/workflows/deploy.yml` then builds the site and deploys it to Firebase Hosting on every push to `main`, and every night so upcoming events turn into past events on time.

## 5. First admin

Put your email in `SUPERADMIN_EMAILS`, sign in on the site, and open `/admin.html`. From **Users & roles** you can give other people roles. Roles are explained in the *Admin guide*.

## Before you announce

- Replace `site.url` and the social links in `src/data/site.mjs`, and set `showPlaceholderTags: false` once real content is in.
- Replace the sample events, team text and photos (see *Content and publishing*).
- Add a 1200x630 PNG share image: link previews on WhatsApp and LinkedIn do not render SVG.
