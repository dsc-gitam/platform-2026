import { Hono } from 'hono';
import { db } from '../db.ts';
import { optionalAuth, userOf } from '../auth.ts';
import { rateLimit, str } from '../util.ts';

export const pub = new Hono();

pub.get('/health', async (c) => {
  await db.$queryRaw`select 1`;
  return c.json({ ok: true });
});

// Live seat counts for the static events page: { "android-101": 41, ... }
pub.get('/seats', async (c) => {
  const rows = await db.registration.groupBy({ by: ['eventId'], where: { status: 'REGISTERED' }, _count: { _all: true } });
  c.header('cache-control', 'public, max-age=30');
  return c.json(Object.fromEntries(rows.map((r) => [r.eventId, r._count._all])));
});

pub.get('/users/:id/photo', async (c) => {
  const u = await db.user.findUnique({ where: { id: c.req.param('id') }, select: { photoData: true } });
  if (!u?.photoData) return c.body(null, 404);
  return c.body(u.photoData.buffer.slice(u.photoData.byteOffset, u.photoData.byteOffset + u.photoData.byteLength) as ArrayBuffer, 200, { 'content-type': 'image/jpeg', 'cache-control': 'public, max-age=86400' });
});

// ---- Forms: member / volunteer / core / speaker / session / story ----
const TYPES: Record<string, 'MEMBER' | 'VOLUNTEER' | 'CORE' | 'SPEAKER' | 'SESSION' | 'STORY'> = {
  member: 'MEMBER', volunteer: 'VOLUNTEER', 'core-application': 'CORE', core: 'CORE', speaker: 'SPEAKER', suggestion: 'SESSION', session: 'SESSION', story: 'STORY',
};

pub.post('/applications', optionalAuth, async (c) => {
  const user = (c as unknown as { var: { user?: unknown } }).var.user ? userOf(c) : null;
  const ip = c.req.header('x-forwarded-for') || 'local';
  if (!rateLimit('app:' + (user?.id ?? ip))) return c.json({ error: 'Too many submissions, please wait a minute' }, 429);
  const b = await c.req.json().catch(() => ({}));
  const type = TYPES[str(b.type, 30)];
  if (!type) return c.json({ error: 'Unknown form type' }, 400);
  if (b.data?.honeypot) return c.json({ ok: true });
  if ((!user || user.isAnonymous) && type !== 'SESSION') return c.json({ error: 'Sign in to send this', code: 'SIGN_IN' }, 401);

  // Keep only short string fields from the form.
  const data: Record<string, string> = {};
  for (const [k, v] of Object.entries(b.data ?? {})) if (typeof v === 'string' || typeof v === 'number') data[str(k, 40)] = str(String(v), 4000);
  const name = (user && !user.isAnonymous ? user.name : '') || str(data.name, 80) || 'Anonymous';
  const email = (user && !user.isAnonymous ? user.email : '') || str(data.email, 120).toLowerCase();
  if (!user && !email) return c.json({ error: 'Please include your email so we can reply' }, 400);

  if (type === 'MEMBER' && user) {
    // Joining is instant: save the profile details and mark the user as onboarded.
    await db.user.update({
      where: { id: user.id },
      data: {
        onboarded: true, name: str(data.name, 80) || user.name, phone: str(data.phone, 20) || user.phone, regNo: str(data.reg_no, 30) || user.regNo,
        branch: str(data.branch, 60) || user.branch, year: str(data.year, 20) || user.year,
        interests: data.domains ? data.domains.split(',').map((s) => s.trim()).filter(Boolean).slice(0, 12) : user.interests,
      },
    });
  }
  const app = await db.application.create({
    data: { type, name, email, userId: user?.id ?? null, data, status: type === 'MEMBER' ? 'APPROVED' : 'PENDING', ...(type === 'MEMBER' ? { reviewedAt: new Date() } : {}) },
  });
  return c.json({ ok: true, id: app.id, onboarded: type === 'MEMBER' }, 201);
});
