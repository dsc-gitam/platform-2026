// Role-based access control. The database role is the source of truth; it is mirrored into
// Firebase custom claims (see google.ts) so the web app can show/hide UI without an extra call.
export type Role = 'MEMBER' | 'CORE' | 'DOCS' | 'ORGANIZER' | 'ADMIN';

export const PERMS = [
  'registrations:read', // see who registered
  'checkin', // scan tickets / check attendees in
  'points:award', // award points during a session
  'postevent:write', // upload post-event data (about, takeaways, photos, recording, report)
  'analytics:read',
  'events:write', // create / edit / delete events
  'requests:read', // see member / volunteer / core / speaker / session / story requests
  'requests:review', // approve, reject, feature
  'users:read',
  'roles:write', // change roles and team placement
  'notify:send', // broadcast push notifications
  'content:sync', // force a publish to GitHub
] as const;
export type Perm = typeof PERMS[number];

const CORE: Perm[] = ['registrations:read', 'checkin', 'points:award'];
const DOCS: Perm[] = ['registrations:read', 'postevent:write', 'analytics:read'];

export const ROLE_PERMS: Record<Role, Perm[]> = {
  MEMBER: [],
  CORE,
  DOCS,
  ORGANIZER: [...new Set<Perm>([...CORE, ...DOCS, 'events:write', 'requests:read', 'requests:review', 'users:read', 'notify:send'])],
  ADMIN: [...PERMS],
};

export const can = (role: Role, perm: Perm) => ROLE_PERMS[role]?.includes(perm) ?? false;
