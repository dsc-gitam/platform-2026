// Bundles the API (server/src) into functions/lib/app.js. Run by `firebase deploy` (predeploy) and by hand.
import { build } from 'esbuild';
import { execSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { join } from 'node:path';

const here = fileURLToPath(new URL('.', import.meta.url));
const server = join(here, '..', 'server');

// The Prisma client is generated from the schema (it is not committed).
execSync('npx prisma generate', { cwd: server, stdio: 'inherit', env: { ...process.env, DIRECT_URL: process.env.DIRECT_URL || 'postgresql://x:x@localhost:5432/x' } });

await build({
  entryPoints: [join(server, 'src/app.ts')],
  outfile: join(here, 'lib/app.js'),
  bundle: true, platform: 'node', format: 'esm', target: 'node22', sourcemap: false, logLevel: 'info',
  // Resolve hono/jose from this package; keep Prisma's runtime and the pg driver as real dependencies.
  nodePaths: [join(here, 'node_modules')],
  external: ['@prisma/client', '@prisma/client/*', '@prisma/adapter-pg', 'pg'],
  banner: { js: "import { createRequire as __cr } from 'node:module'; const require = __cr(import.meta.url);" },
});
console.log('built functions/lib/app.js');
