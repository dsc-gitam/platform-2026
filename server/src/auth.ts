// Firebase Auth: verify ID tokens, load/create the user, enforce permissions.
import { createRemoteJWKSet, jwtVerify } from 'jose';
import type { Context, Next } from 'hono';
import { db } from './db.ts';
import { env } from './env.ts';
import { can, type Perm, type Role, ROLE_PERMS } from './perms.ts';
import { setRoleClaim } from './google.ts';

const JWKS = createRemoteJWKSet(new URL('https://www.googleapis.com/service_accounts/v1/jwk/securetoken@system.gserviceaccount.com'));

type Identity = { uid: string; email: string; name: string; picture?: string; anonymous?: boolean; verified?: boolean };

async function identify(c: Context): Promise<Identity | null> {
  // Local development only: `x-dev-user: email|Display Name` (requires DEV_AUTH=1).
  const dev = c.req.header('x-dev-user');
  if (dev && env.devAuth) {
    const [who, name] = dev.split('|');
    if (!who) return null;
    if (who.startsWith('anon:')) return { uid: 'dev_' + who.replace(':', '_'), email: '', name: name || 'Guest', anonymous: true };
    return { uid: 'dev_' + who.toLowerCase(), email: who.toLowerCase(), name: name || who.split('@')[0], verified: true };
  }
  const h = c.req.header('authorization') || '';
  if (!h.startsWith('Bearer ')) return null;
  try {
    const { payload } = await jwtVerify(h.slice(7), JWKS, { issuer: `https://securetoken.google.com/${env.firebaseProjectId}`, audience: env.firebaseProjectId });
    const anonymous = (payload.firebase as { sign_in_provider?: string } | undefined)?.sign_in_provider === 'anonymous';
    const email = String(payload.email || '').toLowerCase();
    if (!payload.sub || (!email && !anonymous)) return null;
    return { uid: String(payload.sub), email, name: String(payload.name || email.split('@')[0] || 'Guest'), picture: payload.picture as string | undefined, anonymous, verified: payload.email_verified === true };
  } catch { return null; }
}

export type AuthedUser = NonNullable<Awaited<ReturnType<typeof loadUser>>>;

const placeholderEmail = (uid: string) => `anon-${uid.toLowerCase()}@guest.invalid`;

/** Move everything a guest account owns into a real account, then delete the guest. */
export async function mergeUsers(fromId: string, intoId: string) {
  if (fromId === intoId) return;
  await db.$transaction(async (tx) => {
    const mine = await tx.registration.findMany({ where: { userId: fromId } });
    for (const r of mine) {
      const clash = await tx.registration.findUnique({ where: { userId_eventId: { userId: intoId, eventId: r.eventId } } });
      if (clash) await tx.registration.delete({ where: { id: r.id } }); // already registered on the real account
      else await tx.registration.update({ where: { id: r.id }, data: { userId: intoId } });
    }
    await tx.pointAward.updateMany({ where: { userId: fromId }, data: { userId: intoId } });
    await tx.application.updateMany({ where: { userId: fromId }, data: { userId: intoId } });
    const ex = await tx.exploration.findUnique({ where: { userId: fromId } });
    if (ex) { if (await tx.exploration.findUnique({ where: { userId: intoId } })) await tx.exploration.delete({ where: { userId: fromId } }); else await tx.exploration.update({ where: { userId: fromId }, data: { userId: intoId } }); }
    await tx.user.delete({ where: { id: fromId } });
  });
}

/** Guests who registered with this (verified) email hand their tickets to the real account. */
async function claimGuests(userId: string, email: string) {
  const guests = await db.user.findMany({ where: { isAnonymous: true, guestEmail: email, id: { not: userId } } });
  for (const g of guests) {
    const me = await db.user.findUniqueOrThrow({ where: { id: userId } });
    // carry over the details they typed in the registration form (never overwrite what the account already has)
    await db.user.update({ where: { id: userId }, data: { phone: me.phone ?? g.phone, regNo: me.regNo ?? g.regNo, branch: me.branch ?? g.branch, year: me.year ?? g.year } });
    await mergeUsers(g.id, userId);
  }
}

async function loadUser(id: Identity) {
  const existing = await db.user.findUnique({ where: { id: id.uid } });

  if (id.anonymous) {
    if (existing) return await db.user.update({ where: { id: id.uid }, data: { lastLoginAt: new Date() } });
    return await db.user.create({ data: { id: id.uid, email: placeholderEmail(id.uid), name: id.name, isAnonymous: true } });
  }

  if (existing) {
    // A guest that just linked an email (same uid): turn it into a real account.
    if (existing.isAnonymous && id.email) {
      const owner = await db.user.findUnique({ where: { email: id.email } });
      if (owner && owner.id !== existing.id) { await mergeUsers(existing.id, owner.id); return await db.user.findUniqueOrThrow({ where: { id: owner.id } }); }
      const upgraded = await db.user.update({ where: { id: existing.id }, data: { isAnonymous: false, email: id.email, guestEmail: null } });
      return upgraded;
    }
    const u = await db.user.update({ where: { id: id.uid }, data: { lastLoginAt: new Date(), ...(existing.photoData ? {} : { photoUrl: id.picture ?? existing.photoUrl }) } });
    if (id.verified) await claimGuests(u.id, id.email);
    return u;
  }

  // Same email, different sign-in method (e.g. Google, then email link): one account per email.
  const sameEmail = await db.user.findUnique({ where: { email: id.email } });
  if (sameEmail && id.verified && !sameEmail.isAnonymous) return sameEmail;

  const role: Role = env.superAdmins.includes(id.email) ? 'ADMIN' : 'MEMBER';
  const created = await db.user.create({ data: { id: id.uid, email: id.email, name: id.name, photoUrl: id.picture ?? null, role } });
  if (role !== 'MEMBER') await setRoleClaim(id.uid, role);
  if (id.verified) await claimGuests(created.id, id.email);
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
