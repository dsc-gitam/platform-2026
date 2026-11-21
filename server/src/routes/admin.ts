import { Hono } from 'hono';
import { db } from '../db.ts';
import { requirePerm, userOf } from '../auth.ts';
import { sendPush, setRoleClaim } from '../google.ts';
import { publishNow, queuePublish } from '../sync.ts';
import { jpegFromDataUrl, optStr, normCode, slug, str, strArr } from '../util.ts';
import type { Role } from '../perms.ts';
import type { Prisma } from '../../generated/client.ts';

export const admin = new Hono();

const ROLES: Role[] = ['MEMBER', 'CORE', 'DOCS', 'ORGANIZER', 'ADMIN'];
const RANK: Record<Role, number> = { MEMBER: 0, CORE: 1, DOCS: 1, ORGANIZER: 2, ADMIN: 3 };

// ---------------- Analytics ----------------
admin.get('/stats', requirePerm('analytics:read'), async (c) => {
  const [users, onboarded, regs, checkins, apps, perEvent, signups, points] = await Promise.all([
    db.user.count({ where: { isAnonymous: false } }), db.user.count({ where: { onboarded: true } }),
    db.registration.count({ where: { status: 'REGISTERED' } }), db.registration.count({ where: { checkedInAt: { not: null } } }),
    db.application.groupBy({ by: ['type', 'status'], _count: { _all: true } }),
    db.event.findMany({ select: { id: true, title: true, date: true, seats: true, status: true, _count: { select: { registrations: { where: { status: 'REGISTERED' } } } } }, orderBy: { date: 'desc' }, take: 12 }),
    db.$queryRaw<{ d: string; n: number }[]>`select to_char(date_trunc('day', "createdAt"), 'YYYY-MM-DD') as d, count(*)::int as n from "User" where "createdAt" > now() - interval '30 days' group by 1 order by 1`,
    db.pointAward.aggregate({ _sum: { points: true } }),
  ]);
  const checked = await db.registration.groupBy({ by: ['eventId'], where: { checkedInAt: { not: null } }, _count: { _all: true } });
  const ck = new Map(checked.map((r) => [r.eventId, r._count._all]));
  return c.json({
    totals: { users, members: onboarded, registrations: regs, checkins, attendanceRate: regs ? Math.round((checkins / regs) * 100) : 0, pointsAwarded: points._sum.points ?? 0 },
    applications: apps.map((a) => ({ type: a.type, status: a.status, n: a._count._all })),
    events: perEvent.map((e) => ({ id: e.id, title: e.title, date: e.date, seats: e.seats, registered: e._count.registrations, checkedIn: ck.get(e.id) ?? 0 })),
    signups,
  });
});

// ---------------- Events ----------------
const eventData = (b: Record<string, unknown>) => ({
  title: str(b.title, 140), type: str(b.type, 20) || 'workshop', color: str(b.color, 10) || 'blue', date: str(b.date, 10), time: str(b.time, 5), endTime: optStr(b.endTime ?? b.end, 5),
  venue: str(b.venue, 140), seats: Math.max(1, Math.min(5000, Number(b.seats) || 100)), free: b.free !== false, blurb: str(b.blurb, 600), tags: strArr(b.tags, 8, 30),
  speakers: (Array.isArray(b.speakers) ? b.speakers : []).slice(0, 8).map((s: Record<string, unknown>) => ({ name: str(s.name, 80), role: str(s.role, 120), color: str(s.color, 10) || 'blue', ...(s.photo ? { photo: str(s.photo, 200) } : {}), ...(s.tba ? { tba: true } : {}) })),
  questions: (Array.isArray(b.questions) ? b.questions : []).slice(0, 8).map((q: Record<string, unknown>) => ({ id: slug(str(q.id || q.label, 40)) || 'q', label: str(q.label, 160), type: ['text', 'textarea', 'select', 'radio'].includes(str(q.type, 10)) ? str(q.type, 10) : 'text', options: strArr(q.options, 8, 60), required: !!q.required })),
  published: b.published !== false,
});
const valid = (d: ReturnType<typeof eventData>) => d.title && /^\d{4}-\d{2}-\d{2}$/.test(d.date) && /^\d{2}:\d{2}$/.test(d.time) && d.venue && d.blurb;

admin.get('/events', requirePerm('registrations:read'), async (c) => {
  const events = await db.event.findMany({ orderBy: { date: 'desc' }, include: { _count: { select: { registrations: { where: { status: 'REGISTERED' } } } } } });
  return c.json({ events: events.map(({ _count, ...e }) => ({ ...e, registered: _count.registrations })) });
});

admin.post('/events', requirePerm('events:write'), async (c) => {
  const b = await c.req.json().catch(() => ({})); const d = eventData(b);
  if (!valid(d)) return c.json({ error: 'Title, date (YYYY-MM-DD), time (HH:MM), venue and blurb are required' }, 400);
  const id = slug(str(b.id, 60) || d.title);
  if (await db.event.findUnique({ where: { id } })) return c.json({ error: 'An event with this id already exists' }, 409);
  const ev = await db.event.create({ data: { id, ...d } });
  await queuePublish(`event created: ${ev.title}`);
  return c.json({ event: ev }, 201);
});

admin.put('/events/:id', requirePerm('events:write'), async (c) => {
  const b = await c.req.json().catch(() => ({})); const d = eventData(b);
  if (!valid(d)) return c.json({ error: 'Title, date, time, venue and blurb are required' }, 400);
  const ev = await db.event.update({ where: { id: c.req.param('id') }, data: { ...d, ...(['UPCOMING', 'PAST'].includes(str(b.status, 10)) ? { status: str(b.status, 10) as 'UPCOMING' | 'PAST' } : {}) } });
  await queuePublish(`event updated: ${ev.title}`);
  return c.json({ event: ev });
});

admin.delete('/events/:id', requirePerm('events:write'), async (c) => {
  const n = await db.registration.count({ where: { eventId: c.req.param('id') } });
  if (n > 0) return c.json({ error: `This event has ${n} registrations. Unpublish it instead of deleting.` }, 409);
  await db.event.delete({ where: { id: c.req.param('id') } });
  await queuePublish('event deleted');
  return c.json({ ok: true });
});

// Post-event data (documentation team): about, takeaways, resources, photos, recording, report extras.
admin.put('/events/:id/details', requirePerm('postevent:write'), async (c) => {
  const b = await c.req.json().catch(() => ({})); const d = (b.details ?? {}) as Record<string, unknown>;
  const photos = (Array.isArray(d.photos) ? d.photos : []).slice(0, 24).map((p: Record<string, unknown>) => ({ label: str(p.label, 120), color: str(p.color, 10) || 'blue', size: ['sq', 'wide', 'tall'].includes(str(p.size, 5)) ? str(p.size, 5) : 'sq', ...(p.src ? { src: str(p.src, 300) } : {}) }));
  const details = {
    attendees: str(d.attendees, 20), about: strArr(d.about, 6, 1200), takeaways: strArr(d.takeaways, 10, 300),
    resources: (Array.isArray(d.resources) ? d.resources : []).slice(0, 12).map((r: Record<string, unknown>) => ({ label: str(r.label, 120), url: str(r.url, 300), kind: ['slides', 'code', 'link'].includes(str(r.kind, 8)) ? str(r.kind, 8) : 'link' })),
    recording: { youtubeId: str((d.recording as Record<string, unknown>)?.youtubeId, 20), note: str((d.recording as Record<string, unknown>)?.note, 200) || 'The recording will be published here.' },
    photos,
    report: {
      stats: (Array.isArray((d.report as Record<string, unknown>)?.stats) ? (d.report as { stats: Record<string, unknown>[] }).stats : []).slice(0, 6).map((s) => ({ label: str(s.label, 40), value: str(s.value, 20) })),
      highlights: strArr((d.report as Record<string, unknown>)?.highlights, 8, 300),
      feedback: (Array.isArray((d.report as Record<string, unknown>)?.feedback) ? (d.report as { feedback: Record<string, unknown>[] }).feedback : []).slice(0, 6).map((f) => ({ quote: str(f.quote, 300), by: str(f.by, 80) })),
      thanks: str((d.report as Record<string, unknown>)?.thanks, 400), preparedBy: str((d.report as Record<string, unknown>)?.preparedBy, 80),
    },
  };
  const ready = !!b.ready;
  const ev = await db.event.update({ where: { id: c.req.param('id') }, data: { details, ready, ...(ready ? { status: 'PAST' as const } : {}) } });
  await queuePublish(`post-event data: ${ev.title}`);
  return c.json({ event: ev });
});

// ---------------- Registrations, check-in & points ----------------
admin.get('/events/:id/registrations', requirePerm('registrations:read'), async (c) => {
  const regs = await db.registration.findMany({
    where: { eventId: c.req.param('id'), status: 'REGISTERED' }, orderBy: { createdAt: 'asc' },
    include: { user: { select: { id: true, name: true, email: true, guestEmail: true, isAnonymous: true, phone: true, regNo: true, branch: true, year: true, photoUrl: true } } },
  });
  return c.json({ registrations: regs.map((r) => ({ id: r.id, ticketCode: r.ticketCode, checkedInAt: r.checkedInAt, answers: r.answers, registeredAt: r.createdAt, user: { ...r.user, email: r.user.isAnonymous ? (r.user.guestEmail ?? '') : r.user.email, guest: r.user.isAnonymous } })) });
});

async function regByCode(code: string) {
  return await db.registration.findUnique({ where: { ticketCode: normCode(code) }, include: { user: true, event: true } });
}
const brief = async (r: NonNullable<Awaited<ReturnType<typeof regByCode>>>) => {
  const p = await db.pointAward.aggregate({ where: { userId: r.userId }, _sum: { points: true } });
  const here = await db.pointAward.aggregate({ where: { userId: r.userId, eventId: r.eventId }, _sum: { points: true } });
  return {
    registrationId: r.id, ticketCode: r.ticketCode, status: r.status, checkedInAt: r.checkedInAt,
    user: { id: r.user.id, name: r.user.name, photoUrl: r.user.photoUrl, regNo: r.user.regNo, branch: r.user.branch, year: r.user.year },
    event: { id: r.event.id, title: r.event.title, date: r.event.date }, totalPoints: p._sum.points ?? 0, eventPoints: here._sum.points ?? 0,
  };
};

// Scan a QR: look the attendee up (does not change anything).
admin.post('/scan', requirePerm('checkin'), async (c) => {
  const r = await regByCode(String((await c.req.json().catch(() => ({}))).code || ''));
  if (!r || r.status !== 'REGISTERED') return c.json({ error: 'Ticket not found' }, 404);
  return c.json(await brief(r));
});

// Check in (+10 attendance points the first time).
admin.post('/checkin', requirePerm('checkin'), async (c) => {
  const me = userOf(c); const r = await regByCode(String((await c.req.json().catch(() => ({}))).code || ''));
  if (!r || r.status !== 'REGISTERED') return c.json({ error: 'Ticket not found' }, 404);
  if (!r.checkedInAt) {
    await db.$transaction([
      db.registration.update({ where: { id: r.id }, data: { checkedInAt: new Date() } }),
      db.pointAward.create({ data: { userId: r.userId, eventId: r.eventId, points: 10, reason: 'Attended', awardedById: me.id } }),
    ]);
  }
  return c.json({ ...(await brief((await regByCode(r.ticketCode))!)), alreadyCheckedIn: !!r.checkedInAt });
});

admin.post('/points', requirePerm('points:award'), async (c) => {
  const me = userOf(c); const b = await c.req.json().catch(() => ({}));
  const r = await regByCode(String(b.code || ''));
  if (!r || r.status !== 'REGISTERED') return c.json({ error: 'Ticket not found' }, 404);
  const points = Math.round(Number(b.points));
  if (!Number.isFinite(points) || points === 0 || points < -50 || points > 100) return c.json({ error: 'Points must be between -50 and 100' }, 400);
  const reason = str(b.reason, 80) || 'Session points';
  await db.pointAward.create({ data: { userId: r.userId, eventId: r.eventId, points, reason, awardedById: me.id } });
  return c.json(await brief(r));
});

// ---------------- Requests ----------------
admin.get('/applications', requirePerm('requests:read'), async (c) => {
  const type = c.req.query('type'); const status = c.req.query('status');
  const where: Prisma.ApplicationWhereInput = {};
  if (type) where.type = type as never; if (status) where.status = status as never;
  const apps = await db.application.findMany({ where, orderBy: { createdAt: 'desc' }, take: 200, omit: { photoData: true }, include: { user: { select: { id: true, photoUrl: true, showOnSite: true, teamKind: true, role: true } } } });
  const withPhoto = new Set((await db.application.findMany({ where: { id: { in: apps.map((a) => a.id) }, photoData: { not: null } }, select: { id: true } })).map((a) => a.id));
  return c.json({ applications: apps.map((a) => ({ ...a, hasPhoto: withPhoto.has(a.id) })) });
});

admin.get('/applications/:id/photo', requirePerm('requests:read'), async (c) => {
  const a = await db.application.findUnique({ where: { id: c.req.param('id') }, select: { photoData: true } });
  if (!a?.photoData) return c.body(null, 404);
  return c.body(a.photoData.buffer.slice(a.photoData.byteOffset, a.photoData.byteOffset + a.photoData.byteLength) as ArrayBuffer, 200, { 'content-type': 'image/jpeg', 'cache-control': 'private, max-age=300' });
});

const ROLE_TITLES: Record<string, string> = { tech: 'Technical', design: 'Design & Media', research: 'Research & Onboarding', docs: 'Documentation & Reports', photo: 'Photography & Media' };

admin.patch('/applications/:id', requirePerm('requests:review'), async (c) => {
  const me = userOf(c); const b = await c.req.json().catch(() => ({}));
  const app = await db.application.findUnique({ where: { id: c.req.param('id') } });
  if (!app) return c.json({ error: 'Not found' }, 404);
  const status = ['PENDING', 'APPROVED', 'REJECTED'].includes(str(b.status, 10)) ? str(b.status, 10) as 'PENDING' | 'APPROVED' | 'REJECTED' : app.status;
  const featured = app.type === 'STORY' ? (b.featured === undefined ? app.featured : !!b.featured) && status === 'APPROVED' : false;
  const wasLive = app.status === 'APPROVED' && (app.type !== 'STORY' || app.featured);
  const photoEdited = !!(b.photo || b.removePhoto);

  // Story edits before publishing (fix typos, add batch/role).
  const data = { ...(app.data as Record<string, string>) };
  if (b.data && typeof b.data === 'object') for (const [k, v] of Object.entries(b.data)) data[str(k, 40)] = str(String(v), 4000);

  let photoChange: { photoData?: Uint8Array<ArrayBuffer> | null } = {};
  if (b.removePhoto) photoChange = { photoData: null };
  else if (b.photo) { const j = jpegFromDataUrl(b.photo); if (!j) return c.json({ error: 'Please use a JPEG photo under 250 KB' }, 400); photoChange = { photoData: j }; }

  const updated = await db.application.update({ where: { id: app.id }, data: { ...photoChange, status, featured, notes: b.notes === undefined ? app.notes : optStr(b.notes, 500), data, reviewedById: me.id, reviewedAt: new Date() } });

  let publish = false;
  const target = app.userId ? await db.user.findUnique({ where: { id: app.userId } }) : await db.user.findUnique({ where: { email: app.email } });
  if (updated.type === 'STORY') publish = featured || (wasLive && !featured) || (photoEdited && featured);
  if ((updated.type === 'CORE' || updated.type === 'VOLUNTEER') && target) {
    const t = (b.team ?? {}) as Record<string, unknown>;
    if (status === 'APPROVED') {
      const kind = updated.type === 'CORE' ? 'CORE' : 'VOLUNTEER';
      const newRole: Role = updated.type === 'CORE' && RANK[target.role as Role] < RANK.CORE ? 'CORE' : target.role as Role;
      await db.user.update({
        where: { id: target.id },
        data: {
          teamKind: kind, showOnSite: t.showOnSite !== false, role: newRole,
          teamTitle: str(t.title, 80) || target.teamTitle || (kind === 'CORE' ? `Core Team · ${ROLE_TITLES[(data.role as string)] ?? 'Team'}` : 'Volunteer'),
          teamBlurb: str(t.blurb, 300) || target.teamBlurb || target.bio, teamColor: str(t.color, 10) || target.teamColor || 'blue',
        },
      });
      if (newRole !== target.role) await setRoleClaim(target.id, newRole);
      publish = true;
    } else if (wasLive && target.showOnSite) {
      await db.user.update({ where: { id: target.id }, data: { showOnSite: false } });
      publish = true;
    }
  }
  if (publish) await queuePublish(`${updated.type.toLowerCase()} ${status.toLowerCase()}: ${updated.name}`);
  return c.json({ application: updated, publishing: publish });
});

// ---------------- Users & roles ----------------
admin.get('/users', requirePerm('users:read'), async (c) => {
  const q = str(c.req.query('q'), 60);
  const users = await db.user.findMany({
    where: { isAnonymous: false, ...(q ? { OR: [{ name: { contains: q, mode: 'insensitive' } }, { email: { contains: q, mode: 'insensitive' } }] } : {}) },
    orderBy: { createdAt: 'desc' }, take: 100,
    select: { id: true, name: true, email: true, isAnonymous: true, photoUrl: true, role: true, onboarded: true, teamKind: true, teamTitle: true, showOnSite: true, createdAt: true, _count: { select: { registrations: true } } },
  });
  return c.json({ users });
});

admin.patch('/users/:id/role', requirePerm('roles:write'), async (c) => {
  const me = userOf(c); const role = str((await c.req.json().catch(() => ({}))).role, 12) as Role;
  if (!ROLES.includes(role)) return c.json({ error: 'Unknown role' }, 400);
  if (c.req.param('id') === me.id && role !== 'ADMIN') return c.json({ error: "You can't remove your own admin role" }, 400);
  const u = await db.user.update({ where: { id: c.req.param('id') }, data: { role } });
  const claim = await setRoleClaim(u.id, role);
  return c.json({ user: { id: u.id, role: u.role }, claimSynced: claim });
});

admin.patch('/users/:id/name', requirePerm('roles:write'), async (c) => {
  const name = str((await c.req.json().catch(() => ({}))).name, 80);
  if (name.length < 2) return c.json({ error: 'Please enter a name' }, 400);
  const u = await db.user.update({ where: { id: c.req.param('id') }, data: { name } });
  if (u.teamKind) await queuePublish(`name update: ${u.name}`); // team cards show the name
  return c.json({ user: { id: u.id, name: u.name } });
});

admin.patch('/users/:id/team', requirePerm('roles:write'), async (c) => {
  const b = await c.req.json().catch(() => ({}));
  const kind = ['ORGANIZER', 'CORE', 'VOLUNTEER'].includes(str(b.kind, 12)) ? str(b.kind, 12) as 'ORGANIZER' | 'CORE' | 'VOLUNTEER' : null;
  const u = await db.user.update({ where: { id: c.req.param('id') }, data: { teamKind: kind, showOnSite: !!kind && b.showOnSite !== false, teamTitle: optStr(b.title, 80), teamBlurb: optStr(b.blurb, 300), teamColor: optStr(b.color, 10) } });
  await queuePublish(`team update: ${u.name}`);
  return c.json({ ok: true });
});

// ---------------- Notifications & publishing ----------------
admin.post('/notify', requirePerm('notify:send'), async (c) => {
  const b = await c.req.json().catch(() => ({})); const title = str(b.title, 80), body = str(b.body, 200);
  if (!title || !body) return c.json({ error: 'Title and message are required' }, 400);
  const eventId = str(b.eventId, 60);
  const users = await db.user.findMany({
    where: { fcmTokens: { isEmpty: false }, ...(eventId ? { registrations: { some: { eventId, status: 'REGISTERED' } } } : {}) },
    select: { id: true, fcmTokens: true },
  });
  const tokens = users.flatMap((u) => u.fcmTokens);
  const { sent, invalid } = await sendPush(tokens, { title, body, url: str(b.url, 200) || undefined });
  if (invalid.length) for (const u of users) { const keep = u.fcmTokens.filter((t) => !invalid.includes(t)); if (keep.length !== u.fcmTokens.length) await db.user.update({ where: { id: u.id }, data: { fcmTokens: keep } }); }
  return c.json({ recipients: tokens.length, sent });
});

admin.post('/sync', requirePerm('content:sync'), async (c) => c.json(await publishNow('manual publish by ' + userOf(c).name)));
admin.get('/sync-log', requirePerm('content:sync'), async (c) => c.json({ log: await db.syncLog.findMany({ orderBy: { createdAt: 'desc' }, take: 25 }) }));
