import { team, roadmap, values, expectations, faqs } from '../data/site.mjs';
import { icon } from '../icons.mjs';
import { esc, avatar, pageHero, ctaBand, sample, arrow } from '../lib.mjs';

const person = (p, big) => `<article class="card person reveal">
  ${avatar(p.name, p.color, p.photo)}<h3>${esc(p.name)}</h3><div class="role">${esc(p.role)}</div>
  <p>${esc(p.blurb)}</p>
  <div class="links"><a href="${p.links.linkedin}">LinkedIn</a><a href="${p.links.github}">GitHub</a></div>
</article>`;

const body = `
${pageHero({ eyebrow: 'About', title: 'A club built <span class="hl">with</span> you, not <i>for</i> you.', lead: 'GDG on Campus GITAM is a student community for learning, building and shipping with Google technologies. We are relaunching, and we want to get it right.', color: 'blue' })}

<section class="section">
  <div class="container split">
    <div class="reveal">
      <p class="eyebrow"><i class="dot"></i>Mission</p>
      <h2>Make GITAM a place where tech feels <span class="hl">possible</span>.</h2>
      <p class="lead" style="max-width:none">Many students have the curiosity but not the starting point. We exist to give that starting point: a first workshop, a first teammate, a first project, a first stage.</p>
      <p>We are part of the global Google Developer Groups community, but what makes us worth joining is local: the people in this room, and what we make together.</p>
    </div>
    <div class="grid g2 reveal">
      ${values.map(v => `<div class="card c-${v.color}" style="padding:20px"><h3 style="font-size:1.15rem">${esc(v.t)}</h3><p style="margin:0;font-size:.96rem;color:var(--ink-2)">${esc(v.d)}</p></div>`).join('')}
    </div>
  </div>
</section>

<section class="section tint" id="roadmap">
  <div class="container">
    <div class="section-head reveal">
      <p class="eyebrow"><i class="dot"></i>The next 12 months ${sample('Draft plan')}</p>
      <h2>Where we are headed, <span class="hl">quarter by quarter</span>.</h2>
      <p>This is the plan we will hold ourselves to. If we miss it, you'll be able to say so on the community board.</p>
    </div>
    <div class="roadmap">
      ${roadmap.map(r => `<div class="quarter c-${r.color} ${r.color === 'yellow' ? 'y' : ''} reveal"><header><small>${r.q} · ${r.months}</small><h3>${r.title}</h3></header><ul>${r.goals.map(g => `<li>${esc(g)}</li>`).join('')}</ul></div>`).join('')}
    </div>
    <div class="beyond reveal">
      <div class="big"><span style="color:var(--blue)">3</span><span style="color:var(--red)">y</span></div>
      <div><h3>And beyond</h3><p style="margin:0;max-width:62ch">In three years we want GDG GITAM to be the first thing a curious first-year hears about, a place where alumni come back to mentor, where projects outlive batches, and where students from every branch ship things that matter. <i>(Placeholder vision, to be refined with the team.)</i></p></div>
    </div>
  </div>
</section>

<section class="section">
  <div class="container">
    <div class="section-head reveal">
      <p class="eyebrow"><i class="dot"></i>What to expect</p>
      <h2>A two-way <span class="hl">deal</span>.</h2>
    </div>
    <div class="grid g2">
      <div class="card c-blue reveal"><h3>From us</h3><ul class="checks" style="--c:var(--blue)">${expectations.fromUs.map(x => `<li>${esc(x)}</li>`).join('')}</ul></div>
      <div class="card c-yellow reveal"><h3>From you</h3><ul class="checks" style="--c:var(--yellow)">${expectations.fromYou.map(x => `<li>${esc(x)}</li>`).join('')}</ul></div>
    </div>
  </div>
</section>

<section class="section tint" id="team">
  <div class="container">
    <div class="section-head reveal">
      <p class="eyebrow"><i class="dot"></i>The team ${sample('Bios coming')}</p>
      <h2>The people <span class="hl">behind</span> it.</h2>
    </div>
    <div class="team-grid">${[...team.organizers, team.mentor].map(p => person(p)).join('')}</div>
    <h3 class="reveal" style="margin:56px 0 22px;font-size:1.5rem">Core team</h3>
    <div class="team-grid team-grid-2">${team.core.map(p => person(p)).join('')}</div>

    <div style="margin-top:70px" class="reveal">
      <h3 style="font-size:1.8rem">How the team is <span class="hl">built</span></h3>
      <p style="color:var(--ink-2);max-width:62ch">${team.structure.reduce((n, r) => n + r.headcount, 0)} seats across seven areas, backed by a bench of volunteers. Filled seats are shown in colour; the dashed ones are open.</p>
    </div>
    <div class="structure">
      ${team.structure.map(r => `<article class="card st c-${r.color} reveal"><div class="badge">${icon(r.icon, 24)}</div><div><h4>${esc(r.title)}</h4><p>${esc(r.does)}</p></div><div class="seats" aria-label="${r.filled} of ${r.headcount} seats filled">${Array.from({ length: r.headcount }, (_, i) => `<i class="${i < r.filled ? 'on' : ''}"></i>`).join('')}<span>${r.filled}/${r.headcount}</span></div></article>`).join('')}
      <article class="card st st-vol c-blue reveal"><div class="badge">${icon('users', 24)}</div><div><h4>Volunteer cohort · ${esc(team.volunteers.capacity)}</h4><p><b>${esc(team.volunteers.note)}.</b> ${esc(team.volunteers.workflow)}</p></div><a class="btn btn-ghost btn-sm" href="join.html#volunteer">Volunteer</a></article>
    </div>

    <div style="margin-top:70px" class="reveal">
      <h3 style="font-size:1.8rem">Seats open for <span class="hl">you</span></h3>
      <p style="color:var(--ink-2);max-width:60ch">Core team seats open each term. No prior title needed, just energy and consistency.</p>
    </div>
    <div class="grid g3">
      ${team.openRoles.map(r => `<a class="open-role c-${r.color} reveal" href="join.html?role=${r.id}#core"><i class="sq"></i><div><b>${esc(r.title)}</b><span>${esc(r.desc)}</span><em>${r.open} open</em></div></a>`).join('')}
    </div>
  </div>
</section>

<section class="section">
  <div class="container split">
    <div class="reveal"><p class="eyebrow"><i class="dot"></i>FAQ</p><h2>Quick <span class="hl">answers</span>.</h2><p class="lead">Still unsure? Ask on the community board, we reply fast.</p><a class="btn btn-ghost" href="community.html">Ask the community ${arrow}</a></div>
    <div class="reveal">${faqs.map(f => `<details><summary>${esc(f.q)}</summary><p>${esc(f.a)}</p></details>`).join('')}</div>
  </div>
</section>

${ctaBand({ title: 'Be part of the rebuild.', text: 'Join as a member, or raise your hand for a role. Either way, we are glad you are here.', primary: ['join.html', 'Join the club'], secondary: ['index.html#find-your-place', 'Find your place'] })}
`;

export default {
  path: 'about.html', nav: 'about', title: 'About & Team',
  description: 'Meet the GDG on Campus GITAM team, our mission, 12-month roadmap and what we expect from each other. A student-run tech community at GITAM.',
  body,
  jsonld: [{ '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: faqs.map(f => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })) }]
};
