import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../generated/client.ts';
import { env } from './env.ts';

// Prisma 7 talks to Postgres through a driver adapter.
// Small pools: each serverless instance connects through Supabase's transaction pooler.
const adapter = new PrismaPg({ connectionString: env.databaseUrl, max: env.serverless ? 3 : 10 });
export const db = new PrismaClient({ adapter });
