export const str = (v: unknown, max = 500): string => (typeof v === 'string' ? v.trim().slice(0, max) : '');
export const optStr = (v: unknown, max = 500): string | null => { const s = str(v, max); return s || null; };
export const strArr = (v: unknown, maxItems = 30, max = 120): string[] => Array.isArray(v) ? v.map((x) => str(x, max)).filter(Boolean).slice(0, maxItems) : [];
export const slug = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 60);

const ALPHA = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // no 0/O/1/I
export function ticketCode(): string {
  const b = crypto.getRandomValues(new Uint8Array(8));
  const c = [...b].map((x) => ALPHA[x % ALPHA.length]).join('');
  return `GDG-${c.slice(0, 4)}-${c.slice(4)}`;
}
export const normCode = (s: string) => str(s, 40).toUpperCase().replace(/^GDG:/, '').trim();

export const todayIST = () => new Date(Date.now() + 5.5 * 3600_000).toISOString().slice(0, 10);

// Tiny in-memory rate limiter for anonymous form posts (per instance, best effort).
const hits = new Map<string, { n: number; t: number }>();
export function rateLimit(key: string, max = 8, windowMs = 60_000): boolean {
  const now = Date.now(); const h = hits.get(key);
  if (!h || now - h.t > windowMs) { hits.set(key, { n: 1, t: now }); return true; }
  h.n++; return h.n <= max;
}

/** Parse a JPEG data URL (max 250 KB). Returns null when it is not a small JPEG. */
export function jpegFromDataUrl(v: unknown): Uint8Array<ArrayBuffer> | null {
  const m = /^data:image\/jpeg;base64,([A-Za-z0-9+/=]+)$/.exec(String(v || ''));
  if (!m) return null;
  const raw = atob(m[1]); const bytes = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i++) bytes[i] = raw.charCodeAt(i);
  if (bytes.length > 250_000 || bytes[0] !== 0xff || bytes[1] !== 0xd8) return null;
  return bytes;
}
