// End-to-end API test against a real Postgres (run with DATABASE_URL set and DEV_AUTH=1).
// deno task test
import { assert, assertEquals } from 'jsr:@std/assert@1';
import { app } from './app.ts';
import { db } from './db.ts';

const call = async (method: string, path: string, who?: string, body?: unknown) => {
  const res = await app.request(`http://localhost/api${path}`, {
    method, headers: { 'content-type': 'application/json', ...(who ? { 'x-dev-user': who } : {}) }, body: body ? JSON.stringify(body) : undefined,
  });
  const text = await res.text();
  return { status: res.status, json: text ? JSON.parse(text) : null };
};

const ADMIN = 'admin@test.dev|Ada Admin', CORE = 'core@test.dev|Cora Core', ANN = 'ann@test.dev|Ann Member', BOB = 'bob@test.dev|Bob Member';

Deno.test('end to end', async (t) => {
  // clean slate for test users
  await db.pointAward.deleteMany({ where: { OR: [{ user: { OR: [{ email: { endsWith: '@test.dev' } }, { id: { startsWith: 'dev_anon_' } }, { guestEmail: { endsWith: '@test.dev' } }] } }, { awardedBy: { email: { endsWith: '@test.dev' } } }] } });
  await db.user.deleteMany({ where: { OR: [{ email: { endsWith: '@test.dev' } }, { id: { startsWith: 'dev_anon_' } }, { guestEmail: { endsWith: '@test.dev' } }, { id: 'dev_up@test.dev' }] } });
  await db.application.deleteMany({ where: { email: { endsWith: '@test.dev' } } });
  for (const [id, date] of [['test-evt-a', '2031-03-01'], ['test-evt-b', '2031-04-01']]) {
    await db.event.upsert({ where: { id }, create: { id, title: 'Test ' + id, type: 'workshop', date, time: '10:00', venue: 'Lab', blurb: 'Test event', seats: 50, questions: [{ id: 'level', label: 'Experience', type: 'radio', options: ['Total beginner', 'Tried a bit'], required: true }, { id: 'note', label: 'Anything else?', type: 'textarea', options: [], required: false }] }, update: { status: 'UPCOMING', published: true, date } });
  }
  const ev = await db.event.findFirstOrThrow({ where: { id: 'test-evt-a' } });

  await t.step('health + anonymous protection', async () => {
    assertEquals((await call('GET', '/health')).status, 200);
    assertEquals((await call('GET', '/me')).status, 401);
    assertEquals((await call('GET', '/admin/stats')).status, 401);
  });

  await t.step('first sign-in creates a MEMBER straight away (no membership form); superadmin email becomes ADMIN', async () => {
    const ann = await call('GET', '/me', ANN);
    assertEquals(ann.json.user.role, 'MEMBER'); assertEquals(ann.json.user.onboarded, true); assertEquals(ann.json.user.year, null);
    const admin = await call('GET', '/me', ADMIN);
    assertEquals(admin.json.user.role, 'ADMIN'); // listed in SUPERADMIN_EMAILS (.env.test)
    await call('GET', '/me', CORE); await call('GET', '/me', BOB);
    const core = await call('GET', '/me', CORE);
    await db.user.update({ where: { id: core.json.user.id }, data: { role: 'CORE' } });
  });

  await t.step('the first registration completes the profile (year is required), later ones just use it', async () => {
    const r = await call('POST', `/me/events/${ev.id}/register`, ANN, { answers: { level: 'Total beginner' } });
    assertEquals(r.status, 400); assertEquals(r.json.code, 'PROFILE_INCOMPLETE');
    const fresh = 'newbie@test.dev|Nina Newbie';
    const ok = await call('POST', `/me/events/${ev.id}/register`, fresh, { profile: { year: '1st', branch: 'ece', phone: '9000000002', reg_no: '2024ECE001' }, answers: { level: 'Total beginner' } });
    assertEquals(ok.status, 201);
    const me = await call('GET', '/me', fresh);
    assertEquals(me.json.user.year, '1st'); assertEquals(me.json.user.branch, 'ece'); assertEquals(me.json.user.regNo, '2024ECE001'); assertEquals(me.json.registrations.length, 1);
  });

  await t.step('member form onboards and prefills the profile', async () => {
    const r = await call('POST', '/applications', ANN, { type: 'member', data: { name: 'Ann Member', phone: '9999999999', reg_no: '2021001', branch: 'CSE', year: '3rd', domains: 'web, ai' } });
    assertEquals(r.status, 201); assertEquals(r.json.onboarded, true);
    await call('POST', '/applications', BOB, { type: 'member', data: { branch: 'ECE', year: '2nd' } });
    const me = await call('GET', '/me', ANN);
    assertEquals(me.json.user.onboarded, true); assertEquals(me.json.user.branch, 'CSE'); assertEquals(me.json.user.interests, ['web', 'ai']);
  });

  let code = '';
  await t.step('register with only the event-specific answers; required questions enforced', async () => {
    assertEquals((await call('POST', `/me/events/${ev.id}/register`, ANN, { answers: {} })).status, 400);
    const r = await call('POST', `/me/events/${ev.id}/register`, ANN, { answers: { level: 'Tried a bit', note: 'hi' } });
    assertEquals(r.status, 201); assert(/^GDG-[A-Z2-9]{4}-[A-Z2-9]{4}$/.test(r.json.ticketCode)); code = r.json.ticketCode;
    const again = await call('POST', `/me/events/${ev.id}/register`, ANN, { answers: { level: 'Total beginner' } });
    assertEquals(again.status, 200); assertEquals(again.json.ticketCode, code); // idempotent
    const me = await call('GET', '/me', ANN);
    assertEquals(me.json.registrations.length, 1); assertEquals(me.json.registrations[0].ticketCode, code);
    const seats = await call('GET', '/seats'); assert(seats.json[ev.id] >= 1);
  });

  await t.step('RBAC: members cannot scan, core can, only admin changes roles', async () => {
    assertEquals((await call('POST', '/admin/scan', ANN, { code })).status, 403);
    assertEquals((await call('POST', '/admin/scan', CORE, { code })).status, 200);
    assertEquals((await call('GET', '/admin/stats', CORE)).status, 403);
    assertEquals((await call('GET', '/admin/stats', ADMIN)).status, 200);
    const bob = (await call('GET', '/me', BOB)).json.user.id;
    assertEquals((await call('PATCH', `/admin/users/${bob}/role`, CORE, { role: 'ADMIN' })).status, 403);
    assertEquals((await call('POST', '/admin/events', CORE, { title: 'x' })).status, 403);
  });

  await t.step('check-in awards attendance points; session points stack; leaderboard + badges update', async () => {
    const ci = await call('POST', '/admin/checkin', CORE, { code });
    assertEquals(ci.status, 200); assertEquals(ci.json.totalPoints, 10);
    assertEquals((await call('POST', '/admin/checkin', CORE, { code })).json.alreadyCheckedIn, true);
    const p = await call('POST', '/admin/points', CORE, { code: 'gdg:' + code.toLowerCase(), points: 25, reason: 'Icebreaker winner' });
    assertEquals(p.json.totalPoints, 35);
    assertEquals((await call('POST', '/admin/points', CORE, { code, points: 500 })).status, 400);
    const me = await call('GET', '/me', ANN);
    assertEquals(me.json.points, 35); assertEquals(me.json.rank, 1); assertEquals(me.json.attended.length, 1);
    assert(me.json.badges.some((b: { id: string }) => b.id === 'first-event'));
    assertEquals(me.json.leaderboard[0].name, 'Ann Member');
  });

  await t.step('exploration (Tech Atlas + quiz) is saved and earns badges', async () => {
    await call('PUT', '/me/exploration', ANN, { atlas: { interests: ['web'], saved: ['frontend'], top: ['frontend'], mode: 'guided' }, quiz: { result: 'builder' } });
    const me = await call('GET', '/me', ANN);
    assertEquals(me.json.exploration.atlas.saved, ['frontend']);
    assert(me.json.badges.some((b: { id: string }) => b.id === 'explorer') && me.json.badges.some((b: { id: string }) => b.id === 'found-place'));
  });

  await t.step('cancel frees the seat; cannot cancel after check-in', async () => {
    assertEquals((await call('DELETE', `/me/events/${ev.id}/register`, ANN)).status, 409);
    await call('POST', `/me/events/${(await db.event.findFirstOrThrow({ where: { status: 'UPCOMING', id: { not: ev.id } } })).id}/register`, BOB, { answers: { level: 'Total beginner' } });
  });

  await t.step('requests: story approval and featuring', async () => {
    const s = await call('POST', '/applications', ANN, { type: 'story', data: { before: 'Lost', after: 'Shipped', now: 'Intern', consent: 'yes' } });
    assertEquals(s.status, 201);
    assertEquals((await call('PATCH', `/admin/applications/${s.json.id}`, CORE, { status: 'APPROVED' })).status, 403);
    const ok = await call('PATCH', `/admin/applications/${s.json.id}`, ADMIN, { status: 'APPROVED', featured: true });
    assertEquals(ok.status, 200); assertEquals(ok.json.application.featured, true); assertEquals(ok.json.publishing, true);
    const list = await call('GET', '/admin/applications?type=STORY', ADMIN);
    assert(list.json.applications.some((a: { id: string }) => a.id === s.json.id));
  });

  await t.step('stories can carry a photo that is private until featured, then published with the story', async () => {
    const tiny = 'data:image/jpeg;base64,/9j/2Q==';
    assertEquals((await call('POST', '/applications', ANN, { type: 'story', photo: 'data:image/png;base64,AAAA', data: { before: 'x', after: 'y' } })).status, 400);
    const s = await call('POST', '/applications', ANN, { type: 'story', photo: tiny, data: { before: 'Lost', after: 'Found my place', now: 'Intern' } });
    assertEquals(s.status, 201);
    const list = await call('GET', '/admin/applications?type=STORY&status=PENDING', ADMIN);
    const row = list.json.applications.find((a: { id: string }) => a.id === s.json.id);
    assertEquals(row.hasPhoto, true); assert(!('photoData' in row));
    assertEquals((await call('GET', `/admin/applications/${s.json.id}/photo`, ANN)).status, 403); // members cannot read it
    const { buildFiles } = await import('./sync.ts');
    let files = await buildFiles();
    assert(!files.some((f) => f.path.includes('assets/stories/' + s.json.id))); // not featured yet: not published
    assertEquals((await call('PATCH', `/admin/applications/${s.json.id}`, ADMIN, { status: 'APPROVED', featured: true })).status, 200);
    files = await buildFiles();
    assert(files.some((f) => f.path === `src/assets/stories/${s.json.id}.jpg`));
    const stories = JSON.parse(files.find((f) => f.path.endsWith('stories.json'))!.content as string);
    assertEquals(stories.find((x: { after: string }) => x.after === 'Found my place').photo, `assets/stories/${s.json.id}.jpg`);
  });

  await t.step('requests: core approval puts the person on the team and grants CORE', async () => {
    const a = await call('POST', '/applications', BOB, { type: 'core-application', data: { role: 'design', why: 'Love design' } });
    const r = await call('PATCH', `/admin/applications/${a.json.id}`, ADMIN, { status: 'APPROVED', team: { title: 'Core Team · Design', blurb: 'Pixels.' } });
    assertEquals(r.status, 200);
    const bob = await call('GET', '/me', BOB);
    assertEquals(bob.json.user.role, 'CORE'); assertEquals(bob.json.user.showOnSite, true);
  });

  await t.step('event CRUD + post-event upload (docs flow)', async () => {
    const mk = await call('POST', '/admin/events', ADMIN, { title: 'Test Jam', type: 'studyjam', date: '2030-01-01', time: '10:00', venue: 'Lab', blurb: 'A test.', seats: 5 });
    assertEquals(mk.status, 201);
    const up = await call('PUT', `/admin/events/${mk.json.event.id}/details`, ADMIN, { ready: true, details: { attendees: '40', about: ['It happened.'], takeaways: ['Ship it'], report: { stats: [{ label: 'Score', value: '4.8' }] } } });
    assertEquals(up.status, 200); assertEquals(up.json.event.ready, true);
    assertEquals((await call('DELETE', `/admin/events/${mk.json.event.id}`, ADMIN)).status, 200);
  });

  await t.step('guests register without an account, then claim the ticket by signing in with the same email', async () => {
    const G1 = 'anon:g1|Guest', other = (await db.event.findFirstOrThrow({ where: { status: 'UPCOMING', id: { not: ev.id } } })).id;
    // details are required for guests
    assertEquals((await call('POST', `/me/events/${ev.id}/register`, G1, { answers: { level: 'Total beginner' } })).status, 400);
    const reg = await call('POST', `/me/events/${ev.id}/register`, G1, { profile: { name: 'Gina Guest', email: 'Gina@test.dev', phone: '9000000001', branch: 'ECE', year: '2nd' }, answers: { level: 'Total beginner' } });
    assertEquals(reg.status, 201); const code2 = reg.json.ticketCode;
    const me = await call('GET', '/me', G1);
    assertEquals(me.json.user.guest, true); assertEquals(me.json.user.email, 'gina@test.dev'); assertEquals(me.json.registrations.length, 1);
    // guests can't send membership forms and never appear on the leaderboard
    assertEquals((await call('POST', '/applications', G1, { type: 'member', data: {} })).status, 401);
    await call('POST', '/admin/points', CORE, { code: code2, points: 90, reason: 'big win' });
    assert(!(await call('GET', '/me', ANN)).json.leaderboard.some((l: { name: string }) => l.name === 'Gina Guest'));
    // admin sees the typed email, not the placeholder
    const regs = await call('GET', `/admin/events/${ev.id}/registrations`, ADMIN);
    assert(regs.json.registrations.some((r: { user: { email: string } }) => r.user.email === 'gina@test.dev'));
    // another device: sign in with the same (verified) email -> the guest's ticket and points move over
    const gina = await call('GET', '/me', 'gina@test.dev|Gina Real');
    assertEquals(gina.json.registrations.length, 1); assertEquals(gina.json.registrations[0].ticketCode, code2); assertEquals(gina.json.points, 90); assertEquals(gina.json.user.guest, false);
    assertEquals(await db.user.count({ where: { id: 'dev_anon_g1' } }), 0);
    // she was also registered on the real account for another event: no duplicate tickets
    assertEquals((await call('GET', '/me', 'gina@test.dev|Gina Real')).json.registrations.length, 1);
    void other;
  });

  await t.step('a guest that links an email on the same device becomes a normal account', async () => {
    await db.user.create({ data: { id: 'dev_up@test.dev', email: 'anon-up@guest.invalid', name: 'Uma', isAnonymous: true, guestEmail: 'up@test.dev' } });
    const r = await call('GET', '/me', 'up@test.dev|Uma Up');
    assertEquals(r.json.user.guest, false); assertEquals(r.json.user.email, 'up@test.dev');
  });

  await t.step('content build produces site JSON', async () => {
    const { buildFiles } = await import('./sync.ts');
    const files = await buildFiles();
    const stories = JSON.parse(files.find((f) => f.path.endsWith('stories.json'))!.content as string);
    assert(stories.some((s: { after: string }) => s.after === 'Shipped'));
    const team = JSON.parse(files.find((f) => f.path.endsWith('team.json'))!.content as string);
    assert(team.core.some((p: { name: string }) => p.name === 'Bob Member'));
    const events = JSON.parse(files.find((f) => f.path.endsWith('events.json'))!.content as string);
    assert(events.length >= 2);
  });

  await db.$disconnect();
});
