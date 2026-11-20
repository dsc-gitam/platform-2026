// Typed access to environment variables.
const get = (k: string, d = '') => Deno.env.get(k) ?? d;

export const env = {
  databaseUrl: get('DATABASE_URL'),
  firebaseProjectId: get('FIREBASE_PROJECT_ID'),
  serviceAccount: get('GOOGLE_SERVICE_ACCOUNT'),
  superAdmins: get('SUPERADMIN_EMAILS').split(',').map((s) => s.trim().toLowerCase()).filter(Boolean),
  allowedOrigins: get('ALLOWED_ORIGINS', 'http://localhost:4173').split(',').map((s) => s.trim()).filter(Boolean),
  githubToken: get('GITHUB_TOKEN'),
  githubRepo: get('GITHUB_REPO'),
  githubBranch: get('GITHUB_BRANCH', 'main'),
  githubApi: get('GITHUB_API_URL', 'https://api.github.com'), // override only in tests
  devAuth: get('DEV_AUTH') === '1',
  port: Number(get('PORT', '8000')),
};
