import { app } from './app.ts';
import { env } from './env.ts';

if (env.devAuth) console.warn('⚠️  DEV_AUTH is on: x-dev-user header sign-in is enabled. Never use this in production.');
Deno.serve({ port: env.port }, app.fetch);
