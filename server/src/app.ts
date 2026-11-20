import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { env } from './env.ts';
import { pub } from './routes/public.ts';
import { me } from './routes/me.ts';
import { admin } from './routes/admin.ts';

export const app = new Hono();

app.use('/api/*', cors({
  origin: (origin) => (env.allowedOrigins.includes(origin) ? origin : null),
  allowHeaders: ['authorization', 'content-type', 'x-dev-user'],
  allowMethods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  maxAge: 600,
}));

app.route('/api', pub);
app.route('/api/me', me);
app.route('/api/admin', admin);

app.notFound((c) => c.json({ error: 'Not found' }, 404));
app.onError((err, c) => {
  console.error(err);
  // Unique/not-found style database errors surface as friendly messages, everything else is a 500.
  const code = (err as { code?: string }).code;
  if (code === 'P2025') return c.json({ error: 'Not found' }, 404);
  return c.json({ error: 'Something went wrong' }, 500);
});

