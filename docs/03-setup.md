# Go live: setup checklist

These are the one-time steps to switch on accounts and publishing. The Firebase project is **`gdg-gitam`** and the repository is **`dsc-gitam/platform-2026`**.

## 1. Firebase (sign-in, hosting, notifications)

1. In the [Firebase console](https://console.firebase.google.com/project/gdg-gitam) open **Authentication → Sign-in method** and enable **Google**, **Anonymous** and **Email link (passwordless sign-in)**. Email/password can stay on but is not used.
2. Under **Authentication → Settings → Authorized domains** add your live domain (and keep `localhost`). Email links only work on authorized domains.
3. **Project settings → Your apps → Add app → Web**. Copy the config object. You will need it as `FIREBASE_WEB_CONFIG` (below).
4. **Project settings → Cloud Messaging → Web Push certificates → Generate key pair**. Add the public key to the config object as `"vapidKey"`. This is what lets the browser receive push notifications.
5. **Project settings → Service accounts → Generate new private key**. Keep that JSON secret: it goes into the API's `GOOGLE_SERVICE_ACCOUNT`, and a Firebase Hosting deploy key goes into GitHub (step 4).

With the Firebase CLI you can read the web config once you are signed in to the account that owns the project:

```bash
firebase login --reauth
firebase apps:list --project gdg-gitam
firebase apps:sdkconfig web <APP_ID> --project gdg-gitam
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

## 3. The API (Deno)

Deploy `server/` to **Deno Deploy** (or any host that runs Deno). Set the build command to `deno task generate` and the entry point to `src/main.ts`, then add these environment variables:

| Variable | Value |
|---|---|
| `DATABASE_URL` | Supabase transaction pooler string |
| `FIREBASE_PROJECT_ID` | `gdg-gitam` |
| `GOOGLE_SERVICE_ACCOUNT` | the service account JSON on one line |
| `SUPERADMIN_EMAILS` | comma-separated emails that become admin on first sign-in |
| `ALLOWED_ORIGINS` | your site origin(s), for example `https://gdg-gitam.web.app` |
| `GITHUB_TOKEN` | fine-grained token with **Contents: read and write** on `dsc-gitam/platform-2026` |
| `GITHUB_REPO` | `dsc-gitam/platform-2026` |
| `GITHUB_BRANCH` | `main` |

Do not set `DEV_AUTH` in production. Check `https://<your-api>/api/health` returns `{"ok":true}`.

## 4. GitHub (build and deploy)

In the repository **Settings → Secrets and variables → Actions**:

| Name | Kind | Value |
|---|---|---|
| `GDG_API_BASE` | variable | the API URL, no trailing slash |
| `FIREBASE_WEB_CONFIG` | variable | the web config from step 1 as one-line JSON, including `vapidKey` |
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
