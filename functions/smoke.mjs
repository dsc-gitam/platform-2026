// Runs the built bundle on Node (the Firebase Functions runtime) against a database and checks a few calls.
// DATABASE_URL=postgresql://... DEV_AUTH=1 node smoke.mjs
const { app } = await import('./lib/app.js');
const call = async (path, headers = {}) => { const r = await app.fetch(new Request('http://localhost/api' + path, { headers })); return { status: r.status, body: await r.text() }; };
const results = [
  ['health', (await call('/health')).status === 200],
  ['seats', (await call('/seats')).status === 200],
  ['me needs sign-in', (await call('/me')).status === 401],
  ['me with dev user', (await call('/me', { 'x-dev-user': 'smoke@test.dev|Smoke' })).status === 200],
  ['admin needs a role', (await call('/admin/stats', { 'x-dev-user': 'smoke@test.dev|Smoke' })).status === 403],
];
for (const [name, ok] of results) console.log(ok ? 'ok  ' : 'FAIL', name);
process.exit(results.every(([, ok]) => ok) ? 0 : 1);
