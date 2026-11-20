import { readdirSync, readFileSync } from 'node:fs';
import { renderMarkdown } from '../markdown.mjs';
import { esc, pageHero } from '../lib.mjs';

// Documentation lives in /docs as Markdown (01-overview.md, 02-run-locally.md, ...) and is rendered here.
const dir = new URL('../../docs/', import.meta.url);
const files = readdirSync(dir).filter((f) => f.endsWith('.md')).sort();
const docs = files.map((f) => {
  const { html, headings } = renderMarkdown(readFileSync(new URL(f, dir), 'utf8'), { startLevel: 2, idPrefix: '' });
  const title = headings[0]?.text ?? f;
  return { id: headings[0]?.id ?? f, title, html, sub: headings.filter((h) => h.level === 3).slice(0, 8) };
});

const body = `
${pageHero({ eyebrow: 'Documentation', title: 'How it all <span class="hl">works</span>.', lead: 'Setup, accounts, the admin panel, publishing and a reference, for the team that runs the club\'s platform.', color: 'green' })}
<section class="section">
  <div class="container doc-shell">
    <nav class="doc-toc" aria-label="Documentation sections">
      <b>On this page</b>
      ${docs.map((d) => `<a href="#${d.id}">${esc(d.title)}</a>${d.sub.length ? `<div class="sub">${d.sub.map((s) => `<a href="#${s.id}">${esc(s.text.replace(/^\d+\.\s*/, ''))}</a>`).join('')}</div>` : ''}`).join('')}
    </nav>
    <div class="doc">${docs.map((d) => `<section class="doc-sec">${d.html}</section>`).join('\n')}</div>
  </div>
</section>`;

export default {
  path: 'docs.html', nav: 'docs', title: 'Documentation', noindex: true,
  description: 'Setup, accounts, admin panel, publishing and reference for the GDG on Campus GITAM platform.', body
};
