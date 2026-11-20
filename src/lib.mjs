import { site } from './data/site.mjs';
import { icon } from './icons.mjs';

export const esc = (s = '') => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
export const dateParts = (iso) => {
  const [y, m, d] = iso.split('-').map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d));
  return { y, d, mon: MONTHS[m - 1], dow: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][dt.getUTCDay()] };
};
export const fmtDate = (iso) => { const p = dateParts(iso); return `${p.dow}, ${p.d} ${p.mon} ${p.y}`; };

// "Sample content" tag — shown while data is placeholder.
export const sample = (label = 'Sample') => site.showPlaceholderTags ? `<span class="sample-tag" title="Placeholder content — will be replaced">${esc(label)}</span>` : '';

// Brand mark: our own take on the "< • >" brackets idea, in the four Google colours.
export const logoMark = (size = 40) => `<img class="mark" src="assets/gdg-logo.png" width="${size}" height="${Math.round(size * 330 / 575)}" alt="" aria-hidden="true">`;

// Photo placeholder tile
export const photo = (label, color = 'blue', cls = '') => `<figure class="ph ph-${color} ${cls}" role="img" aria-label="${esc(label)} (placeholder photo)">
  <svg viewBox="0 0 120 80" preserveAspectRatio="xMidYMid slice" aria-hidden="true"><circle cx="30" cy="26" r="9"/><path d="M0 80 40 38l24 26 18-16 38 32z"/></svg>
  <figcaption>${esc(label)}</figcaption></figure>`;

export const avatar = (name, color, photoSrc) => {
  if (photoSrc) return `<div class="avatar av-${color} has-photo"><img src="${esc(photoSrc)}" alt="${esc(name)}" width="110" height="110" loading="lazy"></div>`;
  const initials = name.split(/\s+/).map(w => w[0]).slice(0, 2).join('');
  return `<div class="avatar av-${color}" aria-hidden="true"><span>${esc(initials)}</span></div>`;
};

// LinkedIn / GitHub icon links for a person; empty or '#' links are hidden.
export const socialLinks = (p) => {
  const L = p.links || {};
  const item = (url, name, label) => url && url !== '#' ? `<a href="${esc(url)}" target="_blank" rel="noopener" aria-label="${esc(p.name)} on ${label}" title="${label}">${icon(name, 18)}</a>` : '';
  const out = item(L.linkedin, 'linkedin', 'LinkedIn') + item(L.github, 'github', 'GitHub');
  return out ? `<div class="social">${out}</div>` : '';
};

// Detail-page URL for a past event.
export const eventPage = (e) => `event-${e.id.replace(/^past-/, '')}.html`;

// Compact "who's speaking" row for event cards.
export const speakerRow = (list = [], label = 'Speaker') => {
  if (!list.length) return '';
  return `<div class="ev-speakers"><span class="lbl">${esc(list.length > 1 && label === 'Speaker' ? 'Speakers' : label)}</span>${list.map(sp => `<div class="sp${sp.tba ? ' tba' : ''}">${sp.tba ? `<div class="avatar av-${sp.color || 'blue'}" aria-hidden="true"><span>?</span></div>` : avatar(sp.name, sp.color || 'blue', sp.photo)}<div><b>${esc(sp.name)}</b><small>${esc(sp.role)}</small></div></div>`).join('')}</div>`;
};

export const arrow = '<svg class="arr" width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M5 12h14m-6-6 6 6-6 6" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/></svg>';

export const squiggle = (color = '#FBBC04') => `<svg class="squig" viewBox="0 0 200 12" preserveAspectRatio="none" aria-hidden="true"><path d="M2 8c14-9 24 7 38-1s24 7 38-1 24 7 38-1 24 7 38-1 24 7 44 0" stroke="${color}" stroke-width="4" fill="none" stroke-linecap="round"/></svg>`;

export const NAV = [
  ['events.html', 'Events', 'events'],
  ['domains.html', 'Domains', 'domains'],
  ['community.html', 'Community', 'community'],
  ['legacy.html', 'Legacy', 'legacy'],
  ['about.html', 'About', 'about'],
  ['explore.html', 'Tech Atlas', 'explore']
];

export const layout = (page, body) => {
  const url = `${site.url}/${page.path === 'index.html' ? '' : page.path}`;
  const title = page.path === 'index.html' ? `${site.name} — ${site.tagline}` : `${page.title} · ${site.short}`;
  const desc = page.description;
  const ogImage = `${site.url}/assets/og-image.svg`;
  const orgLd = {
    '@context': 'https://schema.org', '@type': 'Organization', name: site.name, url: site.url,
    logo: `${site.url}/assets/gdg-logo.png`, email: site.email,
    description: 'A student community at GITAM for learning, building and shipping with Google technologies.',
    parentOrganization: { '@type': 'CollegeOrUniversity', name: 'GITAM (Deemed to be University)' },
    sameAs: Object.values(site.social).filter(v => v && v !== '#')
  };
  const ld = [orgLd, ...(page.jsonld || [])].map(o => `<script type="application/ld+json">${JSON.stringify(o)}</script>`).join('\n');
  return `<!doctype html>
<html lang="en" class="no-js">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(title)}</title>
<meta name="description" content="${esc(desc)}">
<link rel="canonical" href="${url}">
${page.noindex ? '<meta name="robots" content="noindex">' : ''}
<meta name="theme-color" content="#FFFFFF">
<meta property="og:type" content="website">
<meta property="og:site_name" content="${esc(site.name)}">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(desc)}">
<meta property="og:url" content="${url}">
<meta property="og:image" content="${ogImage}">
<meta name="twitter:card" content="summary_large_image">
<link rel="icon" href="assets/gdg-logo.png" type="image/png">
<link rel="manifest" href="manifest.webmanifest">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,500;12..96,700;12..96,800&family=DM+Mono:wght@400;500&family=DM+Sans:ital,wght@0,400;0,500;0,700;1,400&display=swap" rel="stylesheet">
<link rel="stylesheet" href="assets/css/styles.css">
${ld}
</head>
<body data-page="${page.nav || ''}">
<a class="skip" href="#main">Skip to content</a>
<header class="site-header">
  <div class="container bar">
    <a class="brand" href="index.html" aria-label="${esc(site.name)} — home">${logoMark(44)}<span class="brand-text"><b>GDG on Campus</b><small>GITAM</small></span></a>
    <nav class="nav" id="nav" aria-label="Main">
      ${NAV.map(([href, label, id]) => `<a href="${href}" data-nav="${id}">${label}</a>`).join('')}
      <a class="nav-find" href="index.html#find-your-place" data-nav="find">Find your place</a>
      <a class="btn btn-blue btn-sm" href="join.html">Join the club</a>
    </nav>
    <button class="menu-btn" aria-label="Menu" aria-expanded="false" aria-controls="nav"><span></span><span></span><span></span></button>
  </div>
</header>
<main id="main">
${body}
</main>
<footer class="site-footer">
  <div class="container">
    <div class="foot-top">
      <div class="foot-brand">
        <a class="brand" href="index.html">${logoMark(44)}<span class="brand-text"><b>GDG on Campus</b><small>GITAM</small></span></a>
        <p>${esc(site.tagline)} A student community at ${esc(site.location)}.</p>
        <form class="sub-form" data-form="subscribe" novalidate>
          <label for="foot-email" class="sr">Email for updates</label>
          <input id="foot-email" type="email" name="email" placeholder="you@example.com" required autocomplete="email">
          <input type="hidden" name="source" value="footer">
          <button class="btn btn-yellow btn-sm" type="submit">Get updates</button>
          <p class="form-done" role="status" hidden>You're on the list. Watch your inbox.</p>
        </form>
      </div>
      <div class="foot-cols">
        <div><h4>Explore</h4><a href="events.html">Events</a><a href="domains.html">Domains</a><a href="legacy.html">Legacy</a><a href="about.html">About &amp; team</a></div>
        <div><h4>Get involved</h4><a href="index.html#find-your-place">Find your place</a><a href="join.html">Join the club</a><a href="join.html#core">Apply for a role</a><a href="join.html#speaker">Become a speaker</a></div>
        <div><h4>Hang out</h4><a href="community.html">Community board</a><a href="explore.html">Tech Atlas</a><a href="${site.social.discord}">Discord</a><a href="${site.social.instagram}">Instagram</a><a href="${site.social.linkedin}">LinkedIn</a></div>
      </div>
    </div>
    <div class="foot-bottom">
      <span>© <span data-year>2026</span> ${esc(site.name)}. Built by students, for students.</span>
      <span class="legal">An independent student community. Google and the Google Developer Groups program are trademarks of Google LLC.</span>
    </div>
  </div>
</footer>
<div class="toast" id="toast" role="status" aria-live="polite"></div>
<script>window.GDG_CONFIG=${JSON.stringify(site.client)};</script>
<script src="assets/js/icons.js" defer></script>
<script src="assets/js/main.js" defer></script>
${(page.scripts || []).map(s => `<script src="assets/js/${s}" defer></script>`).join('\n')}
</body>
</html>`;
};

// Shared page blocks
export const pageHero = ({ eyebrow, title, lead, color = 'blue' }) => `<section class="page-hero ph-${color}">
  <div class="container">
    <p class="eyebrow"><i class="dot"></i>${eyebrow}</p>
    <h1>${title}</h1>
    <p class="lead">${lead}</p>
  </div>
  <div class="hero-shapes" aria-hidden="true"><i class="s s1"></i><i class="s s2"></i><i class="s s3"></i></div>
</section>`;

export const ctaBand = ({ title, text, primary, secondary }) => `<section class="section">
  <div class="container">
    <div class="cta-band reveal">
      <div><h2>${title}</h2><p>${text}</p></div>
      <div class="cta-actions">
        <a class="btn btn-ink" href="${primary[0]}">${primary[1]} ${arrow}</a>
        ${secondary ? `<a class="btn btn-ghost" href="${secondary[0]}">${secondary[1]}</a>` : ''}
      </div>
    </div>
  </div>
</section>`;
