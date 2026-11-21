// One page per story, so the home page can show a short version and link here for the full text.
import { existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { stories } from '../data/site.mjs';
import { storyPage } from '../sections/legacy.mjs';
import { icon } from '../icons.mjs';
import { esc, avatar, ctaBand } from '../lib.mjs';

const root = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const ogFor = (s) => { const f = 'assets/og/' + storyPage(s).replace(/\.html$/, '.png'); return existsSync(join(root, 'src', f)) ? { ogImage: f, ogAlt: `${s.name}'s story: before and after joining GDG on Campus GITAM` } : {}; };

const page = (s) => ({
  path: storyPage(s), nav: 'legacy', title: `${s.name}'s story`, ...ogFor(s),
  description: `${s.name} (${s.batch}) on what changed after joining GDG on Campus GITAM.`,
  body: `
<section class="page-hero ph-${s.color}">
  <div class="container">
    <p class="crumb"><a href="legacy.html#stories">${icon('arrow-left', 16)} All stories</a></p>
    <p class="eyebrow"><i class="dot"></i>Member story</p>
    <div class="who" style="display:flex;gap:16px;align-items:center">${avatar(s.name, s.color, s.photo)}<div><h1 style="margin:0">${esc(s.name)}</h1><p class="lead" style="margin:4px 0 0">${esc(s.batch)} · ${esc(s.now)}</p></div></div>
  </div>
</section>
<section class="section"><div class="container" style="max-width:760px">
  <h2>Before the club</h2><p class="lead" style="max-width:none;white-space:pre-line">${esc(s.before)}</p>
  <h2>After the club</h2><p class="lead" style="max-width:none;white-space:pre-line">${esc(s.after)}</p>
  ${s.quote ? `<blockquote class="card c-${s.color}" style="margin:24px 0">${esc(s.quote)}</blockquote>` : ''}
</div></section>
${ctaBand({ title: 'Learnt something here? Tell us.', text: 'Your story could be the one that convinces a first-year to walk in.', primary: ['join.html#story', 'Share your story'] })}`
});
export default stories.map(page);
