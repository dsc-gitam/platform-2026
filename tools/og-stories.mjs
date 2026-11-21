// Renders a share image (1200x630 PNG) for every story: photo, name, role, and clipped before/after in a card.
// Output goes to src/assets/og/ (git-ignored); story-detail.mjs points each story page's og:image at it.
// Needs devDependencies (npm ci). If they are missing the site still builds and falls back to the default share image.
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
let satori, Resvg;
try { satori = (await import('satori')).default; Resvg = (await import('@resvg/resvg-js')).Resvg; }
catch { console.warn('og-stories: satori / @resvg/resvg-js not installed (run npm ci); skipping share images.'); process.exit(0); }

const { stories } = await import('../src/data/site.mjs');
const { storyPage, clip } = await import('../src/sections/legacy.mjs');

const font = (pkg, file) => readFile(join(root, 'node_modules/@fontsource', pkg, 'files', file));
const fonts = [
  { name: 'Bricolage', data: await font('bricolage-grotesque', 'bricolage-grotesque-latin-800-normal.woff'), weight: 800, style: 'normal' },
  { name: 'DM Sans', data: await font('dm-sans', 'dm-sans-latin-400-normal.woff'), weight: 400, style: 'normal' },
  { name: 'DM Sans', data: await font('dm-sans', 'dm-sans-latin-700-normal.woff'), weight: 700, style: 'normal' },
];
const C = { blue: '#4285F4', red: '#EA4335', yellow: '#FBBC04', green: '#34A853' };
const T = { blue: '#DCE8FD', red: '#FCDDD9', yellow: '#FEF0C0', green: '#D3EDDB' };
const INK = '#1D1B26';

const h = (type, style, ...kids) => ({ type, props: { style: { display: 'flex', ...style }, children: kids.length === 1 ? kids[0] : kids } });
const img = (src, style) => ({ type: 'img', props: { src, style } });
const dataUri = async (rel, mime) => `data:${mime};base64,${(await readFile(join(root, rel))).toString('base64')}`;

const logo = await dataUri('src/assets/gdg-logo.png', 'image/png');
await mkdir(join(root, 'src/assets/og'), { recursive: true });

for (const s of stories) {
  try {
    const color = s.color in C ? s.color : 'blue';
    const photoPath = s.photo && join(root, 'src', s.photo);
    const avatar = photoPath && existsSync(photoPath)
      ? img(await dataUri('src/' + s.photo, 'image/jpeg'), { width: 92, height: 92, borderRadius: 46, border: `4px solid ${INK}`, objectFit: 'cover' })
      : h('div', { width: 92, height: 92, borderRadius: 46, border: `4px solid ${INK}`, background: C[color], color: '#fff', alignItems: 'center', justifyContent: 'center', fontFamily: 'Bricolage', fontWeight: 800, fontSize: 40 },
        String(s.name).split(/\s+/).map((w) => w[0]).slice(0, 2).join('').toUpperCase());
    const box = (label, text) => h('div', { flex: 1, flexDirection: 'column', background: '#fff', border: `3px solid ${INK}`, borderRadius: 22, paddingTop: 20, paddingBottom: 20, paddingLeft: 24, paddingRight: 24 },
      h('div', { fontSize: 18, fontWeight: 700, letterSpacing: 3, color: '#7A7688', marginBottom: 10 }, label),
      h('div', { fontSize: 28, lineHeight: 1.35, color: INK }, text));
    const sub = [s.batch, s.now].filter(Boolean).join(' · ');
    const tree = h('div', { boxSizing: 'border-box', width: 1200, height: 630, background: '#fff', paddingTop: 34, paddingLeft: 34, paddingRight: 46, paddingBottom: 46, fontFamily: 'DM Sans' },
      h('div', { boxSizing: 'border-box', flex: 1, flexDirection: 'column', justifyContent: 'space-between', background: T[color], border: `4px solid ${INK}`, borderRadius: 36, paddingTop: 34, paddingBottom: 34, paddingLeft: 42, paddingRight: 42, boxShadow: `12px 12px 0 ${INK}` },
        h('div', { alignItems: 'center', gap: 24 }, avatar,
          h('div', { flexDirection: 'column', flex: 1 },
            h('div', { fontFamily: 'Bricolage', fontWeight: 800, fontSize: 54, lineHeight: 1.05, color: INK }, String(s.name)),
            sub ? h('div', { fontSize: 26, color: '#4A4757', marginTop: 6 }, sub) : h('div', {}, ''))),
        h('div', { gap: 22 }, box('BEFORE', clip(s.before, 120)), box('AFTER', clip(s.after, 150))),
        h('div', { alignItems: 'center', justifyContent: 'space-between' },
          h('div', { alignItems: 'center', gap: 14 }, img(logo, { width: 76, height: 43 }), h('div', { fontFamily: 'Bricolage', fontWeight: 800, fontSize: 28 }, 'GDG on Campus GITAM')),
          h('div', { fontSize: 24, fontWeight: 700 }, 'Read the full story'))));
    const svg = await satori(tree, { width: 1200, height: 630, fonts });
    const png = new Resvg(svg, { fitTo: { mode: 'width', value: 1200 } }).render().asPng();
    await writeFile(join(root, 'src/assets/og', storyPage(s).replace(/\.html$/, '.png')), png);
    console.log('  og image', s.name);
  } catch (e) { console.warn('og-stories: skipped', s.name, '-', e.message); }
}
