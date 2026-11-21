// Publish database content to the static site: build JSON files from the DB, commit them to GitHub,
// and let the deploy workflow rebuild the site. Called after stories/team/events/profile changes.
import { db } from './db.ts';
import { commitFiles, githubConfigured, type RepoFile } from './github.ts';
import { env } from './env.ts';

const todayIST = () => new Date(Date.now() + 5.5 * 3600_000).toISOString().slice(0, 10);
const safe = (id: string) => id.replace(/[^a-zA-Z0-9_-]/g, '_');
const json = (v: unknown) => JSON.stringify(v, null, 2) + '\n';

// deno-lint-ignore no-explicit-any
const asObj = (v: unknown): Record<string, any> => (v && typeof v === 'object' && !Array.isArray(v) ? v as Record<string, any> : {});

export async function buildFiles(): Promise<RepoFile[]> {
  const files: RepoFile[] = [];
  const today = todayIST();

  // Events (same shape as src/data/site.mjs)
  const events = await db.event.findMany({ where: { published: true }, orderBy: { date: 'asc' } });
  files.push({
    path: 'src/data/generated/events.json',
    content: json(events.map((e) => {
      const d = asObj(e.details);
      const past = e.status === 'PAST' || e.date < today;
      return {
        id: e.id, status: past ? 'past' : 'upcoming', type: e.type, color: e.color, title: e.title, date: e.date, time: e.time,
        end: e.endTime ?? e.time, venue: e.venue, seats: e.seats, free: e.free, blurb: e.blurb, tags: e.tags, speakers: e.speakers, questions: e.questions,
        ...(past ? { ready: e.ready, attendees: d.attendees ?? '', about: d.about ?? [], takeaways: d.takeaways ?? [], resources: d.resources ?? [], recording: d.recording ?? { youtubeId: '', note: '' }, photos: d.photos ?? [], report: d.report ?? {} } : {}),
      };
    })),
  });

  // Team: people the admins chose to show on the site
  const people = await db.user.findMany({ where: { showOnSite: true, teamKind: { not: null } }, orderBy: { createdAt: 'asc' } });
  const team: Record<string, unknown[]> = { organizers: [], core: [], volunteers: [] };
  for (const u of people) {
    let photo = u.photoUrl ?? '';
    if (u.photoData) { photo = `assets/team/${safe(u.id)}.jpg`; files.push({ path: `src/assets/team/${safe(u.id)}.jpg`, content: new Uint8Array(u.photoData) }); }
    const entry = {
      name: u.name, role: u.teamTitle || (u.teamKind === 'VOLUNTEER' ? 'Volunteer' : u.teamKind === 'CORE' ? 'Core Team' : 'Co-Organizer'),
      color: u.teamColor || 'blue', blurb: u.teamBlurb || u.bio || '', photo, links: { linkedin: u.linkedin ?? '', github: u.github ?? '' },
    };
    team[u.teamKind === 'ORGANIZER' ? 'organizers' : u.teamKind === 'CORE' ? 'core' : 'volunteers'].push(entry);
  }
  files.push({ path: 'src/data/generated/team.json', content: json(team) });

  // Stories: approved + featured
  const storyRowsRaw = await db.application.findMany({ where: { type: 'STORY', status: 'APPROVED', featured: true }, orderBy: { reviewedAt: 'asc' } });
  // Admin-chosen order (data._order) first; stories without one keep the order they were approved in.
  const rank = (a: { data: unknown }) => { const o = Number((a.data as Record<string, unknown>)?._order); return Number.isFinite(o) ? o : 1e9; };
  const stories = [...storyRowsRaw].sort((a, b) => rank(a) - rank(b));
  const storyRows = stories.map((st, i) => {
    const d = asObj(st.data);
    let photo = '';
    if (st.photoData) { photo = `assets/stories/${safe(st.id)}.jpg`; files.push({ path: `src/assets/stories/${safe(st.id)}.jpg`, content: new Uint8Array(st.photoData) }); }
    return { name: st.name, batch: d.batch ?? '', now: d.now ?? '', before: d.before ?? '', after: d.after ?? '', quote: d.quote ?? '', color: ['blue', 'red', 'yellow', 'green'][i % 4], ...(photo ? { photo } : {}) };
  });
  files.push({ path: 'src/data/generated/stories.json', content: json(storyRows) });
  return files;
}

let timer: number | undefined; let pending: string[] = [];

/** Locally: debounced (several admin actions in a row become one commit). Serverless: publish before the response ends. */
export async function queuePublish(reason: string): Promise<void> {
  if (env.serverless) { await publishNow(reason); return; }
  pending.push(reason);
  if (timer) clearTimeout(timer);
  timer = setTimeout(() => { const r = pending.join('; '); pending = []; timer = undefined; publishNow(r).catch(console.error); }, 5000) as unknown as number;
}

export async function publishNow(reason: string): Promise<{ ok: boolean; commit: string | null; message: string }> {
  let files: RepoFile[] = [];
  try {
    files = await buildFiles();
    if (!githubConfigured()) {
      await db.syncLog.create({ data: { reason, files: files.map((f) => f.path), ok: false, message: 'GitHub is not configured; nothing was published.' } });
      return { ok: false, commit: null, message: 'GitHub is not configured' };
    }
    const sha = await commitFiles(files, `content: ${reason.slice(0, 140)}`);
    const message = sha ? 'Committed; deploy will start from GitHub Actions.' : 'No changes to publish.';
    await db.syncLog.create({ data: { reason, files: files.map((f) => f.path), commitSha: sha, ok: true, message } });
    return { ok: true, commit: sha, message };
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    await db.syncLog.create({ data: { reason, files: files.map((f) => f.path), ok: false, message } }).catch(() => {});
    return { ok: false, commit: null, message };
  }
}
