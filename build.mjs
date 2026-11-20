// Zero-dependency static site builder: src/pages/*.mjs -> dist/*.html (+ sitemap, robots, manifest, 404).
import { readdir, mkdir, writeFile, rm, cp } from 'node:fs/promises';
import { join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { layout } from './src/lib.mjs';
import { site } from './src/data/site.mjs';
import { ICONS } from './src/icons.mjs';

const root = fileURLToPath(new URL('.', import.meta.url));
const dist = join(root, 'dist');
await rm(dist, { recursive: true, force: true });
await mkdir(dist, { recursive: true });

const files = (await readdir(join(root, 'src/pages'))).filter(f => f.endsWith('.mjs'));
const pages = [];
for (const f of files) {
  const mod = await import(pathToFileURL(join(root, 'src/pages', f)).href);
  for (const page of [].concat(mod.default)) {
    await writeFile(join(dist, page.path), layout(page, page.body));
    pages.push(page);
    console.log('  built', page.path);
  }
}

// 404
await writeFile(join(dist, '404.html'), layout({
  path: '404.html', nav: '', title: 'Page not found', description: 'This page wandered off.', noindex: true,
  body: ''
}, `<section class="page-hero ph-red"><div class="container"><p class="eyebrow"><i class="dot"></i>Error 404</p><h1>This page wandered off.</h1><p class="lead">It's probably debugging itself. Let's get you back to somewhere useful.</p><p><a class="btn btn-ink" href="index.html">Back home</a> <a class="btn btn-ghost" href="index.html#find-your-place">Find your place</a></p></div></section>`));

// Old /find-your-place.html now lives on the home page: keep the URL working with a redirect.
await writeFile(join(dist, 'find-your-place.html'), `<!doctype html><html lang="en"><head><meta charset="utf-8"><title>Find your place · ${site.short}</title><meta name="robots" content="noindex"><link rel="canonical" href="${site.url}/#find-your-place"><meta http-equiv="refresh" content="0; url=index.html#find-your-place"></head><body><p>Moving to <a href="index.html#find-your-place">the home page</a>…</p></body></html>`);

// Static assets
await cp(join(root, 'src/assets'), join(dist, 'assets'), { recursive: true });

// Client-side icon helper (same Lucide set as the server-rendered pages)
await writeFile(join(dist, 'assets/js/icons.js'), `window.GDG_ICON=(function(I){return function(n,s){s=s||24;return '<svg class="ico" width="'+s+'" height="'+s+'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">'+(I[n]||'')+'</svg>';};})(${JSON.stringify(ICONS)});\n`);

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
  background_color: '#FFFFFF', theme_color: '#FFFFFF',
  icons: [{ src: 'assets/gdg-logo.png', sizes: '575x330', type: 'image/png' }]
}, null, 2));

console.log(`\nDone: ${pages.length + 1} pages → dist/`);
