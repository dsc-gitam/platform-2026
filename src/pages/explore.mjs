import { roles, interests, clusters } from '../data/roles.mjs';
import { esc, pageHero, arrow } from '../lib.mjs';

const body = `
${pageHero({ eyebrow: 'Tech Atlas', title: 'Lost in tech? <span class="hl">Wander the map.</span>', lead: 'Twelve roles, one interactive map. Explore freely, or tell us what lights you up and we\'ll light up the roles that fit. Every role has a roadmap, a starter task for tonight, and voices from people on that path.', color: 'green' })}

<section class="section">
  <div class="container atlas-wrap">
    <div style="display:flex;gap:16px;flex-wrap:wrap;align-items:center;justify-content:space-between">
      <div class="mode-switch" role="group" aria-label="How do you want to explore?">
        <button id="mode-wander" aria-pressed="true">Wander freely</button>
        <button id="mode-guide" aria-pressed="false">Guide me</button>
      </div>
      <div class="legend" aria-hidden="true">${clusters.map(c => `<span><i style="--c:var(--${c.color})"></i>${esc(c.name)}</span>`).join('')}</div>
    </div>

    <div class="card guide-panel c-yellow" id="guide" hidden>
      <h3>What lights you up?</h3>
      <p>Pick anything that sounds like you. We\'ll highlight the roles that overlap most.</p>
      <div class="choice" id="interest-chips">${interests.map(i => `<input type="checkbox" id="int-${i.id}" value="${i.id}"><label for="int-${i.id}">${esc(i.label)}</label>`).join('')}</div>
      <div class="slider-row"><span>Deep focus, solo</span><input type="range" id="social" min="0" max="3" step="1" value="1" aria-label="Preferred amount of teamwork"><span>Team buzz, always</span></div>
      <div class="top-list" id="top-list" style="margin-top:14px"></div>
    </div>

    <div class="map" id="map" aria-label="Tech roles map">
      <p class="sr">JavaScript is needed for the interactive map. A plain list of roles is available below.</p>
    </div>

    <div class="tray" id="tray" hidden><b>Your shortlist:</b><span id="tray-items" style="display:contents"></span><a class="btn btn-ink btn-sm" href="find-your-place.html" style="margin-left:auto">Plan with GDG ${arrow}</a></div>
  </div>
</section>

<section class="section tint">
  <div class="container">
    <div class="section-head"><p class="eyebrow"><i class="dot"></i>All roles at a glance</p><h2>Prefer a <span class="hl">list</span>?</h2></div>
    <ul class="roles-list" style="padding-left:20px">${roles.map(r => `<li><a href="explore.html#${r.id}" data-open="${r.id}">${esc(r.name)}</a> — ${esc(r.tagline)}</li>`).join('')}</ul>
  </div>
</section>

<div class="scrim" id="scrim"></div>
<aside class="drawer" id="drawer" aria-hidden="true" aria-label="Role details"></aside>
`;

export default {
  path: 'explore.html', nav: 'explore', title: 'Tech Atlas — Explore Tech Careers',
  description: 'An interactive map of 12 tech roles. Explore freely or get guided by your interests: see what each role is, the skills, a roadmap to get there, and where to start tonight.',
  scripts: ['atlas.js'],
  body: body + `<script type="application/json" id="atlas-data">${JSON.stringify({ roles, interests, clusters })}</script>`
};
