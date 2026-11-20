import { Hono } from 'hono';
import { db } from '../db.ts';
import { permsOf, requireAuth, userOf } from '../auth.ts';
import { allBadges, badgesFor } from '../badges.ts';
import { queuePublish } from '../sync.ts';
import { optStr, str, strArr, ticketCode, todayIST } from '../util.ts';

export const me = new Hono();
me.use('*', requireAuth);

const publicUser = (u: Awaited<ReturnType<typeof userOf>>) => ({
  id: u.id, email: u.isAnonymous ? (u.guestEmail ?? '') : u.email, guest: u.isAnonymous, name: u.name, photoUrl: u.photoUrl, role: u.role, perms: permsOf(u.role), onboarded: u.onboarded,
  phone: u.phone, regNo: u.regNo, branch: u.branch, year: u.year, bio: u.bio, linkedin: u.linkedin, github: u.github, interests: u.interests,
  teamKind: u.teamKind, showOnSite: u.showOnSite, createdAt: u.createdAt,
});

export async function pointsFor(userId: string) {
  const r = await db.pointAward.aggregate({ where: { userId }, _sum: { points: true } });
  return r._sum.points ?? 0;
}

export async function leaderboard(limit = 10) {
  const rows = await db.$queryRaw<{ userId: string; name: string; photoUrl: string | null; points: number }[]>`
    select a."userId", u."name", u."photoUrl", sum(a."points")::int as points
    from "PointAward" a join "User" u on u."id" = a."userId"
    where u."isAnonymous" = false group by a."userId", u."name", u."photoUrl"
    having sum(a."points") > 0 order by points desc, u."name" asc limit ${limit}`;
  return rows.map((r, i) => ({ rank: i + 1, userId: r.userId, name: r.name, photoUrl: r.photoUrl, points: r.points }));
}

async function rankOf(userId: string, points: number) {
  if (points <= 0) return null;
  const [r] = await db.$queryRaw<{ n: number }[]>`
    select count(*)::int as n from (
      select a."userId" from "PointAward" a join "User" u on u."id" = a."userId"
      where u."isAnonymous" = false group by a."userId" having sum(a."points") > ${points}) t`;
  return (r?.n ?? 0) + 1;
}

me.get('/', async (c) => {
  const u = userOf(c);
  const [regs, expl, points] = await Promise.all([
    db.registration.findMany({ where: { userId: u.id, status: 'REGISTERED' }, include: { event: true }, orderBy: { createdAt: 'desc' } }),
    db.exploration.findUnique({ where: { userId: u.id } }),
    pointsFor(u.id),
  ]);
  const attended = regs.filter((r) => r.checkedInAt);
  const saved = (expl?.atlas as { saved?: string[] } | null)?.saved ?? [];
  const quiz = expl?.quiz as { result?: string } | null;
  const badges = badgesFor({ onboarded: u.onboarded, attended: attended.length, savedRoles: saved.length, quizDone: !!quiz?.result, points });
  const slim = (r: typeof regs[number]) => ({
    eventId: r.eventId, ticketCode: r.ticketCode, checkedInAt: r.checkedInAt, registeredAt: r.createdAt,
    event: { id: r.event.id, title: r.event.title, date: r.event.date, time: r.event.time, endTime: r.event.endTime, venue: r.event.venue, type: r.event.type, color: r.event.color },
  });
  return c.json({
    user: publicUser(u), points, rank: await rankOf(u.id, points), badges, allBadges: allBadges(),
    registrations: regs.map(slim), attended: attended.map(slim),
    exploration: { atlas: expl?.atlas ?? {}, quiz: expl?.quiz ?? {} },
    leaderboard: await leaderboard(10), today: todayIST(),
  });
});

me.get('/leaderboard', async (c) => c.json({ leaderboard: await leaderboard(Math.min(Number(c.req.query('limit') || 20), 50)) }));

me.patch('/', async (c) => {
  const u = userOf(c); const b = await c.req.json().catch(() => ({}));
  const data = {
    name: str(b.name, 80) || u.name, phone: optStr(b.phone, 20), regNo: optStr(b.regNo ?? b.reg_no, 30), branch: optStr(b.branch, 60), year: optStr(b.year, 20),
    bio: optStr(b.bio, 400), linkedin: optStr(b.linkedin, 200), github: optStr(b.github, 200), interests: strArr(b.interests, 12, 40),
  };
  const updated = await db.user.update({ where: { id: u.id }, data });
  if (updated.showOnSite) await queuePublish(`profile update: ${updated.name}`);
  return c.json({ user: publicUser(updated) });
});

me.put('/photo', async (c) => {
  const u = userOf(c); const b = await c.req.json().catch(() => ({}));
  const m = /^data:image\/jpeg;base64,([A-Za-z0-9+/=]+)$/.exec(String(b.dataUrl || ''));
  if (!m) return c.json({ error: 'Send a JPEG as a data URL' }, 400);
  const bytes = Uint8Array.from(atob(m[1]), (ch) => ch.charCodeAt(0));
  if (bytes.length > 250_000) return c.json({ error: 'Image too large (max 250 KB)' }, 413);
  if (bytes[0] !== 0xff || bytes[1] !== 0xd8) return c.json({ error: 'Not a JPEG' }, 400);
  const url = `${new URL(c.req.url).origin}/api/users/${encodeURIComponent(u.id)}/photo?v=${Date.now()}`;
  const updated = await db.user.update({ where: { id: u.id }, data: { photoData: bytes, photoUrl: url } });
  if (updated.showOnSite) await queuePublish(`profile photo: ${updated.name}`);
  return c.json({ user: publicUser(updated) });
});

me.put('/exploration', async (c) => {
  const u = userOf(c); const b = await c.req.json().catch(() => ({}));
  const atlas = { interests: strArr(b.atlas?.interests, 20, 40), saved: strArr(b.atlas?.saved, 40, 40), top: strArr(b.atlas?.top, 12, 40), mode: str(b.atlas?.mode, 20) };
  const quiz = { result: str(b.quiz?.result, 40), second: str(b.quiz?.second, 40) };
  const row = await db.exploration.upsert({ where: { userId: u.id }, create: { userId: u.id, atlas, quiz }, update: { atlas, quiz } });
  return c.json({ exploration: { atlas: row.atlas, quiz: row.quiz } });
});

me.post('/fcm-token', async (c) => {
  const u = userOf(c); const token = str((await c.req.json().catch(() => ({}))).token, 400);
  if (!token) return c.json({ error: 'token required' }, 400);
  if (!u.fcmTokens.includes(token)) await db.user.update({ where: { id: u.id }, data: { fcmTokens: [...u.fcmTokens, token].slice(-5) } });
  return c.json({ ok: true });
});

// ---- Event registration ----
type Q = { id: string; label?: string; required?: boolean };

me.post('/events/:id/register', async (c) => {
  const u = userOf(c);
  if (!u.onboarded && !u.isAnonymous) return c.json({ error: 'Finish the membership form first', code: 'NOT_ONBOARDED' }, 409);
  const ev = await db.event.findUnique({ where: { id: c.req.param('id') } });
  if (!ev || !ev.published) return c.json({ error: 'Event not found' }, 404);
  if (ev.status === 'PAST' || ev.date < todayIST()) return c.json({ error: 'This event has already happened' }, 410);
  const body = await c.req.json().catch(() => ({}));
  if (u.isAnonymous) {
    // Guests give their details once, in the registration form; later registrations reuse them.
    const g = body.profile as Record<string, unknown> | undefined;
    if (g) {
      const email = str(g.email, 120).toLowerCase(), name = str(g.name, 80);
      if (!name || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return c.json({ error: 'Please enter your name and a valid email' }, 400);
      await db.user.update({ where: { id: u.id }, data: { name, guestEmail: email, phone: optStr(g.phone, 20), regNo: optStr(g.reg_no ?? g.regNo, 30), branch: optStr(g.branch, 60), year: optStr(g.year, 20) } });
    } else if (!u.guestEmail) return c.json({ error: 'Please enter your name and a valid email' }, 400);
  }
  const questions = (Array.isArray(ev.questions) ? ev.questions : []) as Q[];
  const answers: Record<string, string> = {};
  for (const q of questions) {
    const v = str(body.answers?.[q.id], 600);
    if (q.required && !v) return c.json({ error: `Please answer: ${q.label || q.id}` }, 400);
    if (v) answers[q.id] = v;
  }
  const existing = await db.registration.findUnique({ where: { userId_eventId: { userId: u.id, eventId: ev.id } } });
  if (!existing || existing.status === 'CANCELLED') {
    const taken = await db.registration.count({ where: { eventId: ev.id, status: 'REGISTERED' } });
    if (taken >= ev.seats) return c.json({ error: 'This event is full', code: 'FULL' }, 409);
  }
  const reg = existing
    ? await db.registration.update({ where: { id: existing.id }, data: { answers, status: 'REGISTERED' } })
    : await db.registration.create({ data: { userId: u.id, eventId: ev.id, answers, ticketCode: ticketCode() } });
  return c.json({ ticketCode: reg.ticketCode, eventId: ev.id, registeredAt: reg.createdAt }, existing ? 200 : 201);
});

me.delete('/events/:id/register', async (c) => {
  const u = userOf(c);
  const r = await db.registration.findUnique({ where: { userId_eventId: { userId: u.id, eventId: c.req.param('id') } } });
  if (!r) return c.json({ error: 'Not registered' }, 404);
  if (r.checkedInAt) return c.json({ error: 'Already checked in' }, 409);
  await db.registration.update({ where: { id: r.id }, data: { status: 'CANCELLED' } });
  return c.json({ ok: true });
});

