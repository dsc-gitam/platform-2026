// Import the events that ship with the static site into the database (safe to re-run).
// Usage: deno task seed
import { db } from './db.ts';
// deno-lint-ignore no-explicit-any
const { events, DEFAULT_QUESTIONS } = await import('../../src/data/site.mjs') as any;

let n = 0;
for (const e of events) {
  const past = e.status === 'past';
  const details = past ? { attendees: e.attendees, about: e.about ?? [], takeaways: e.takeaways ?? [], resources: e.resources ?? [], recording: e.recording ?? {}, photos: e.photos ?? [], report: e.report ?? {} } : {};
  const data = {
    title: e.title, type: e.type, color: e.color, date: e.date, time: e.time ?? '10:00', endTime: e.end ?? null, venue: e.venue, seats: e.seats ?? 100, free: e.free ?? true,
    blurb: e.blurb, tags: e.tags ?? [], speakers: e.speakers ?? [], questions: e.questions ?? DEFAULT_QUESTIONS,
    status: past ? 'PAST' : 'UPCOMING', ready: !!e.ready, details, published: true,
  };
  await db.event.upsert({ where: { id: e.id }, create: { id: e.id, ...data }, update: data });
  n++;
}
console.log(`Seeded ${n} events.`);
await db.$disconnect();
