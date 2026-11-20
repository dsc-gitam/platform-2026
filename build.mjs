// Zero-dependency static site builder: src/pages/*.mjs -> dist/*.html (+ sitemap, robots, manifest, 404).
import { readdir, mkdir, writeFile, rm, cp } from 'node:fs/promises';
import { join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { layout } from './src/lib.mjs';
import { site } from './src/data/site.mjs';

const root = fileURLToPath(new URL('.', import.meta.url));
const dist = join(root, 'dist');
await rm(dist, { recursive: true, force: true });
await mkdir(dist, { recursive: true });

const files = (await readdir(join(root, 'src/pages'))).filter(f => f.endsWith('.mjs'));
const pages = [];
for (const f of files) {
  const mod = await import(pathToFileURL(join(root, 'src/pages', f)).href);
  const page = mod.default;
  await writeFile(join(dist, page.path), layout(page, page.body));
  pages.push(page);
  console.log('  built', page.path);
}

// 404
await writeFile(join(dist, '404.html'), layout({
  path: '404.html', nav: '', title: 'Page not found', description: 'This page wandered off.', noindex: true,
  body: ''
}, `<section class="page-hero ph-red"><div class="container"><p class="eyebrow"><i class="dot"></i>Error 404</p><h1>This page wandered off.</h1><p class="lead">It's probably debugging itself. Let's get you back to somewhere useful.</p><p><a class="btn btn-ink" href="index.html">Back home</a> <a class="btn btn-ghost" href="find-your-place.html">Find your place</a></p></div></section>`));

// Static assets
await cp(join(root, 'src/assets'), join(dist, 'assets'), { recursive: true });

// SEO files
const today = new Date().toISOString().slice(0, 10);
const urls = pages.filter(p => !p.noindex).map(p => {
  const loc = `${site.url}/${p.path === 'index.html' ? '' : p.path}`;
  return `  <url><loc>${loc}</loc><lastmod>${today}</lastmod><priority>${p.path === 'index.html' ? '1.0' : '0.7'}</priority></url>`;
});
await writeFile(join(dist, 'sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.join('\n')}\n</urlset>\n`);
await writeFile(join(dist, 'robots.txt'), `User-agent: *\nAllow: /\nSitemap: ${site.url}/sitemap.xml\n`);
await writeFile(join(dist, 'manifest.webmanifest'), JSON.stringify({
  name: site.name, short_name: site.short, start_url: '/', display: 'standalone',
  background_color: '#FFFBF3', theme_color: '#FFFBF3',
  icons: [{ src: 'assets/gdg-logo.png', sizes: '575x330', type: 'image/png' }]
}, null, 2));

console.log(`\nDone: ${pages.length + 1} pages → dist/`);
