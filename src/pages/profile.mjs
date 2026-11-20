import { roles } from '../data/roles.mjs';
import { team } from '../data/site.mjs';
import { paths } from '../sections/find.mjs';
import { googleButton } from '../lib.mjs';

const body = `
<section class="page-hero ph-blue">
  <div class="container">
    <p class="eyebrow"><i class="dot"></i>Your space</p>
    <h1>Your <span class="hl">profile</span>.</h1>
    <p class="lead">Tickets, points, badges, your Tech Atlas picks and where you stand on the leaderboard.</p>
  </div>
  <div class="hero-shapes" aria-hidden="true"><i class="s s1"></i><i class="s s2"></i><i class="s s3"></i></div>
</section>

<section class="section">
  <div class="container">
    <div id="p-loading" class="card" style="text-align:center">Loading your profile…</div>
    <div id="p-off" class="card c-yellow" hidden><h3>Accounts aren't switched on yet</h3><p>Once the backend is connected you'll be able to sign in here.</p></div>
    <div id="p-out" class="card c-blue signin-card" hidden>
      <h3>Sign in to see your profile</h3>
      <p>Use your Google account. It takes one click, and you'll get tickets, points and badges.</p>
      ${googleButton()}
    </div>
    <div id="p-app" hidden></div>
  </div>
</section>
<script type="application/json" id="roles-data">${JSON.stringify(roles.map(r => ({ id: r.id, name: r.name, glyph: r.glyph })))}</script>
<script type="application/json" id="team-links">${JSON.stringify([...team.organizers, team.mentor, ...team.core].map(p => ({ name: p.name, linkedin: p.links?.linkedin || '', github: p.links?.github || '' })))}</script>
<script type="application/json" id="paths-names">${JSON.stringify(Object.fromEntries(paths.map(p => [p.id, { name: p.name, glyph: p.glyph, color: p.color, cta: p.cta, tab: p.tab }])))}</script>
`;

export default {
  path: 'profile.html', nav: 'profile', title: 'Your Profile', noindex: true,
  description: 'Your GDG on Campus GITAM profile: tickets, points, badges and leaderboard.',
  scripts: ['profile.js'], body
};
