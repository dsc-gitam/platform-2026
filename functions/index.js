// Firebase Function that serves the whole API (the Hono app built from ../server) at /api/**.
// Firebase Hosting rewrites /api/** to this function, so the site and the API share one origin.
import { onRequest } from 'firebase-functions/v2/https';
import { defineSecret } from 'firebase-functions/params';

const DATABASE_URL = defineSecret('DATABASE_URL');
const GOOGLE_SERVICE_ACCOUNT = defineSecret('GOOGLE_SERVICE_ACCOUNT');
const GITHUB_TOKEN = defineSecret('GITHUB_TOKEN'); // lets the API commit approved content to GitHub

let app;
export const api = onRequest(
  { region: 'asia-south1', memory: '512MiB', timeoutSeconds: 60, maxInstances: 10, secrets: [DATABASE_URL, GOOGLE_SERVICE_ACCOUNT, GITHUB_TOKEN] },
  async (req, res) => {
    app ??= (await import('./lib/app.js')).app;
    // Firebase has already read the body (req.rawBody), so rebuild a standard Request for Hono.
    const headers = new Headers();
    for (const [k, v] of Object.entries(req.headers)) if (v !== undefined) headers.set(k, Array.isArray(v) ? v.join(', ') : String(v));
    const hasBody = !['GET', 'HEAD'].includes(req.method);
    const request = new Request(`https://${req.hostname}${req.originalUrl}`, { method: req.method, headers, body: hasBody && req.rawBody?.length ? req.rawBody : undefined });
    const response = await app.fetch(request);
    res.status(response.status);
    response.headers.forEach((value, key) => res.setHeader(key, value));
    res.send(Buffer.from(await response.arrayBuffer()));
  },
);
