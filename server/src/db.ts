import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../generated/client.ts';
import { env } from './env.ts';

// Prisma 7 talks to Postgres through a driver adapter.
const adapter = new PrismaPg({ connectionString: env.databaseUrl });
export const db = new PrismaClient({ adapter });
