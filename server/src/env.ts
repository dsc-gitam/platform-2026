// Typed access to environment variables. Works on Deno (local dev, tests) and Node (Firebase Functions).
const g = globalThis as unknown as { Deno?: { env: { get(k: string): string | undefined } }; process?: { env: Record<string, string | undefined> } };
const get = (k: string, d = '') => g.Deno?.env.get(k) ?? g.process?.env[k] ?? d;

export const env = {
  databaseUrl: get('DATABASE_URL'),
  // FIREBASE_* names are reserved on Cloud Functions, which provides the project id itself.
  firebaseProjectId: get('FIREBASE_PROJECT_ID') || get('GOOGLE_CLOUD_PROJECT') || get('GCLOUD_PROJECT'),
  serviceAccount: get('GOOGLE_SERVICE_ACCOUNT'),
  superAdmins: get('SUPERADMIN_EMAILS').split(',').map((s) => s.trim().toLowerCase()).filter(Boolean),
  allowedOrigins: get('ALLOWED_ORIGINS', 'http://localhost:4173').split(',').map((s) => s.trim()).filter(Boolean),
  githubToken: get('GITHUB_TOKEN'),
  githubRepo: get('GITHUB_REPO'),
  githubBranch: get('GITHUB_BRANCH', 'main'),
  githubApi: get('GITHUB_API_URL', 'https://api.github.com'), // override only in tests
  devAuth: get('DEV_AUTH') === '1',
  port: Number(get('PORT', '8000')),
  // On Cloud Run / Functions the CPU is throttled once the response is sent, so publishing must finish inside the request.
  serverless: !!get('K_SERVICE') || get('GDG_SERVERLESS') === '1',
};
