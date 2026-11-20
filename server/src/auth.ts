// Firebase Auth: verify ID tokens, load/create the user, enforce permissions.
import { createRemoteJWKSet, jwtVerify } from 'jose';
import type { Context, Next } from 'hono';
import { db } from './db.ts';
import { env } from './env.ts';
import { can, type Perm, type Role, ROLE_PERMS } from './perms.ts';
import { setRoleClaim } from './google.ts';

const JWKS = createRemoteJWKSet(new URL('https://www.googleapis.com/service_accounts/v1/jwk/securetoken@system.gserviceaccount.com'));

type Identity = { uid: string; email: string; name: string; picture?: string };

async function identify(c: Context): Promise<Identity | null> {
  // Local development only: `x-dev-user: email|Display Name` (requires DEV_AUTH=1).
  const dev = c.req.header('x-dev-user');
  if (dev && env.devAuth) {
    const [email, name] = dev.split('|');
    if (!email) return null;
    return { uid: 'dev_' + email.toLowerCase(), email: email.toLowerCase(), name: name || email.split('@')[0] };
  }
  const h = c.req.header('authorization') || '';
  if (!h.startsWith('Bearer ')) return null;
  try {
    const { payload } = await jwtVerify(h.slice(7), JWKS, { issuer: `https://securetoken.google.com/${env.firebaseProjectId}`, audience: env.firebaseProjectId });
    const email = String(payload.email || '').toLowerCase();
    if (!payload.sub || !email) return null;
    return { uid: String(payload.sub), email, name: String(payload.name || email.split('@')[0]), picture: payload.picture as string | undefined };
  } catch { return null; }
}

export type AuthedUser = NonNullable<Awaited<ReturnType<typeof loadUser>>>;

async function loadUser(id: Identity) {
  const existing = await db.user.findUnique({ where: { id: id.uid } });
  if (existing) {
    return await db.user.update({ where: { id: id.uid }, data: { lastLoginAt: new Date(), ...(existing.photoData ? {} : { photoUrl: id.picture ?? existing.photoUrl }) } });
  }
  const role: Role = env.superAdmins.includes(id.email) ? 'ADMIN' : 'MEMBER';
  const created = await db.user.create({ data: { id: id.uid, email: id.email, name: id.name, photoUrl: id.picture ?? null, role } });
  if (role !== 'MEMBER') setRoleClaim(id.uid, role);
  return created;
}

/** Attach `user` to the request when a valid token is present (does not reject anonymous calls). */
export async function optionalAuth(c: Context, next: Next) {
  const id = await identify(c);
  if (id) c.set('user', await loadUser(id));
  await next();
}

/** Reject requests without a valid token. */
export async function requireAuth(c: Context, next: Next) {
  const id = await identify(c);
  if (!id) return c.json({ error: 'Sign in required' }, 401);
  c.set('user', await loadUser(id));
  await next();
}

export const requirePerm = (perm: Perm) => async (c: Context, next: Next) => {
  const id = await identify(c);
  if (!id) return c.json({ error: 'Sign in required' }, 401);
  const user = await loadUser(id);
  if (!can(user.role as Role, perm)) return c.json({ error: 'Not allowed for your role', needs: perm }, 403);
  c.set('user', user);
  await next();
};

export const userOf = (c: Context): AuthedUser => c.get('user') as AuthedUser;
export const permsOf = (role: string) => ROLE_PERMS[role as Role] ?? [];
