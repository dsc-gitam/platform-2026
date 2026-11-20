// Badges are computed from activity (no extra tables to keep in sync).
export type Badge = { id: string; name: string; desc: string; icon: string; color: string };

export const BADGES: (Badge & { test: (s: Stats) => boolean })[] = [
  { id: 'hello', name: 'Hello, world', desc: 'Joined the club', icon: 'sparkles', color: 'blue', test: (s) => s.onboarded },
  { id: 'first-event', name: 'First event', desc: 'Attended your first event', icon: 'calendar', color: 'green', test: (s) => s.attended >= 1 },
  { id: 'regular', name: 'Regular', desc: 'Attended 3 events', icon: 'users', color: 'yellow', test: (s) => s.attended >= 3 },
  { id: 'devotee', name: 'Devotee', desc: 'Attended 5 events', icon: 'flag', color: 'red', test: (s) => s.attended >= 5 },
  { id: 'explorer', name: 'Explorer', desc: 'Saved roles in the Tech Atlas', icon: 'compass', color: 'blue', test: (s) => s.savedRoles >= 1 },
  { id: 'found-place', name: 'Found my place', desc: 'Took the Find your place quiz', icon: 'trending-up', color: 'green', test: (s) => s.quizDone },
  { id: 'points-50', name: 'Rising', desc: 'Earned 50 points', icon: 'sparkles', color: 'yellow', test: (s) => s.points >= 50 },
  { id: 'points-200', name: 'Star', desc: 'Earned 200 points', icon: 'sparkles', color: 'red', test: (s) => s.points >= 200 },
];

export type Stats = { onboarded: boolean; attended: number; savedRoles: number; quizDone: boolean; points: number };

export const badgesFor = (s: Stats) => BADGES.filter((b) => b.test(s)).map(({ test: _t, ...b }) => b);
export const allBadges = () => BADGES.map(({ test: _t, ...b }) => b);
