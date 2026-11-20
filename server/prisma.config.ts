import { defineConfig } from 'prisma/config';

// Prisma 7 reads the connection string from here (not from schema.prisma).
// DATABASE_URL = Supabase pooled connection (runtime); DIRECT_URL = direct connection (migrations).
export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: { path: 'prisma/migrations' },
  datasource: { url: process.env.DIRECT_URL ?? process.env.DATABASE_URL ?? '' },
});
