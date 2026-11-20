// Google Cloud helpers: service-account access token, Firebase custom claims (RBAC) and FCM push.
import { importPKCS8, SignJWT } from 'jose';
import { env } from './env.ts';

type ServiceAccount = { client_email: string; private_key: string; project_id?: string };
const sa = (): ServiceAccount | null => {
  try { return env.serviceAccount ? JSON.parse(env.serviceAccount) : null; } catch { return null; }
};
export const googleConfigured = () => !!sa();
const projectId = () => env.firebaseProjectId || sa()?.project_id || '';

let cached: { token: string; exp: number } | null = null;
async function accessToken(): Promise<string> {
  const acct = sa();
  if (!acct) throw new Error('GOOGLE_SERVICE_ACCOUNT is not configured');
  if (cached && cached.exp > Date.now() + 60_000) return cached.token;
  const key = await importPKCS8(acct.private_key, 'RS256');
  const now = Math.floor(Date.now() / 1000);
  const assertion = await new SignJWT({ scope: 'https://www.googleapis.com/auth/cloud-platform' })
    .setProtectedHeader({ alg: 'RS256', typ: 'JWT' })
    .setIssuer(acct.client_email).setSubject(acct.client_email)
    .setAudience('https://oauth2.googleapis.com/token').setIssuedAt(now).setExpirationTime(now + 3600).sign(key);
  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST', headers: { 'content-type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer', assertion }),
  });
  if (!res.ok) throw new Error('Google token exchange failed: ' + await res.text());
  const j = await res.json();
  cached = { token: j.access_token, exp: Date.now() + (j.expires_in ?? 3600) * 1000 };
  return cached.token;
}

/** Mirror a user's role into Firebase custom claims. Best effort: the DB role stays authoritative. */
export async function setRoleClaim(uid: string, role: string): Promise<boolean> {
  if (!googleConfigured() || uid.startsWith('dev_')) return false;
  try {
    const res = await fetch(`https://identitytoolkit.googleapis.com/v1/projects/${projectId()}/accounts:update`, {
      method: 'POST',
      headers: { authorization: `Bearer ${await accessToken()}`, 'content-type': 'application/json' },
      body: JSON.stringify({ localId: uid, customAttributes: JSON.stringify({ role }) }),
    });
    return res.ok;
  } catch (e) { console.error('setRoleClaim failed', e); return false; }
}

/** Send a push notification to FCM tokens. Returns tokens that are no longer valid. */
export async function sendPush(tokens: string[], msg: { title: string; body: string; url?: string }): Promise<{ sent: number; invalid: string[] }> {
  if (!googleConfigured() || !tokens.length) return { sent: 0, invalid: [] };
  const bearer = await accessToken();
  const invalid: string[] = []; let sent = 0;
  for (const token of tokens) {
    const res = await fetch(`https://fcm.googleapis.com/v1/projects/${projectId()}/messages:send`, {
      method: 'POST', headers: { authorization: `Bearer ${bearer}`, 'content-type': 'application/json' },
      body: JSON.stringify({ message: { token, notification: { title: msg.title, body: msg.body }, webpush: { fcm_options: { link: msg.url || '/' } } } }),
    });
    if (res.ok) sent++; else if (res.status === 404 || res.status === 400) invalid.push(token);
  }
  return { sent, invalid };
}
