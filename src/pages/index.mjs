import { site, updates, events, domains, achievements, gallery, team, roadmap, typeLabels } from '../data/site.mjs';
import { legacyStory, milestoneStrip, legacyGallery, legacyStories, lightbox } from '../sections/legacy.mjs';
import { icon } from '../icons.mjs';
import { findSection } from '../sections/find.mjs';
import { speakerPills, socialLinks, fmtDate, arrow, dateParts, esc, photo, avatar, ctaBand, sample } from '../lib.mjs';

const latest = [...updates].sort((a, b) => (b.pinned - a.pinned) || b.date.localeCompare(a.date)).slice(0, 3);
const up = events.filter(e => e.status === 'upcoming').slice(0, 3);
const marquee = domains.map((d, i) => `<span style="--c:var(--${['blue', 'red', 'yellow', 'green'][i % 4]})">${esc(d.name)}</span>`).join('');

const body = `
<section class="hero hero-bento">
  <div class="container">
    <div class="hb-head">
      <p class="eyebrow"><i class="dot"></i>GDG on Campus · GITAM</p>
      <h1><span class="w1">Learn</span> it. <span class="w2">Build</span> it. <span class="u-wrap"><span class="w4">Ship</span> it<svg class="squig" viewBox="0 0 200 12" preserveAspectRatio="none" aria-hidden="true"><path d="M2 8c14-9 24 7 38-1s24 7 38-1 24 7 38-1 24 7 38-1 24 7 44 0" stroke="#FBBC04" stroke-width="5" fill="none" stroke-linecap="round"/></svg></span> — together.</h1>
      <p class="lead">A student-run tech community at GITAM, rebuilt from scratch. No gatekeeping, no prerequisites. Just people who want to learn real things and make real stuff.</p>
      <div class="hero-cta">
        <a class="btn btn-blue" href="join.html">Join the club ${arrow}</a>
        <a class="btn btn-ghost" href="events.html">See what's coming</a>
      </div>
      <div class="hero-meta">
        <span class="chip blue">Free to join</span><span class="chip red">Beginner friendly</span><span class="chip yellow">All branches welcome</span>
      </div>
    </div>
    <div class="bento">
      <div class="bt bt-term" aria-hidden="true">
        <div class="term">
          <div class="term-bar"><i></i><i></i><i></i><span>gdg-gitam.js</span></div>
          <div class="term-body" id="term-body"></div>
        </div>
      </div>
      <a class="bt bt-event" href="events.html" data-ticket-event="${up[0].id}" data-ticket-date="${up[0].date}">
        <span class="bt-label">Next up</span>
        <div class="bt-date"><b>${dateParts(up[0].date).d}</b><span>${dateParts(up[0].date).mon}</span></div>
        <h2>${esc(up[0].title)}</h2>
        <p>${esc(up[0].venue)} · <span data-countdown="${up[0].date}">coming soon</span></p>
        <span class="bt-go" data-ticket-label>Save your seat ${arrow}</span>
      </a>
      <a class="bt bt-find" href="#find-your-place">
        <span class="bt-label">2-minute quiz</span>
        <h3>Not sure where you fit?</h3>
        <span class="bt-go">Find your place ${arrow}</span>
      </a>
      <a class="bt bt-atlas" href="explore.html">
        <span class="bt-label">Tech Atlas</span>
        <h3>Confused about tech? Explore it.</h3>
        <span class="bt-go">Start exploring ${arrow}</span>
      </a>
    </div>
  </div>
</section>

<div class="marquee" aria-hidden="true"><div class="marquee-track">${marquee}${marquee}</div></div>

<section class="section">
  <div class="container">
    <div class="section-head reveal">
      <p class="eyebrow"><i class="dot"></i>What we stand for</p>
      <h2>A club that measures <span class="hl">impact</span>, not head-count.</h2>
      <p>We are starting over, which means we get to do it right. Fewer slides, more shipping. Fewer sign-ups, more people who actually grew.</p>
    </div>
    <div class="grid g3">
      <article class="card pillar reveal"><div class="badge">${icon('graduation-cap', 26)}</div><h3>Learn without fear</h3><p>Every event has a path for total beginners. Ask the "silly" question. Someone else was wondering too.</p></article>
      <article class="card pillar reveal"><div class="badge">${icon('hammer', 26)}</div><h3>Build real things</h3><p>Project squads, hackathons and demo days, so your portfolio is stuff you made, not stuff you watched.</p></article>
      <article class="card pillar reveal"><div class="badge">${icon('users', 26)}</div><h3>Belong somewhere</h3><p>Find your people: mentors, teammates, friends who push you. This is what makes a campus feel like yours.</p></article>
    </div>
  </div>
</section>

<section class="section tint">
  <div class="container">
    <div class="section-head reveal">
      <p class="eyebrow"><i class="dot"></i>Up next</p>
      <h2>Come to one. <span class="hl">See how it feels.</span></h2>
    </div>
    ${up.map(e => { const d = dateParts(e.date); return `
    <article class="card event c-${e.color} reveal">
      <div class="date-block"><b>${d.d}</b><span>${d.mon}</span></div>
      <div>
        <div class="ev-meta"><span class="chip ${e.color}">${typeLabels[e.type]}</span><span>${e.time} · ${esc(e.venue)}</span></div>
        <h3>${esc(e.title)}</h3><p>${esc(e.blurb)}</p>
        ${speakerPills(e.speakers)}
      </div>
      <div class="ev-act"><a class="btn btn-ink btn-sm" href="events.html#${e.id}" data-ticket-event="${e.id}" data-ticket-date="${e.date}">Register ${arrow}</a></div>
    </article>`; }).join('')}
    <p class="reveal"><a class="link" href="events.html">All upcoming events →</a></p>
  </div>
</section>

<section class="section">
  <div class="container">
    <div class="board-home">
      <div class="section-head reveal" style="margin-bottom:0">
        <p class="eyebrow"><i class="dot"></i>Noticeboard</p>
        <h2>What's <span class="hl">new</span> at the club.</h2>
        <p>The latest announcements, applications and opportunities. Pinned notes stay on top.</p>
        <p style="margin-top:22px"><a class="btn btn-ghost" href="community.html">View all ${arrow}</a></p>
      </div>
      <div class="card board-card reveal">
        ${latest.map(u => `<div class="update"><div class="d">${fmtDate(u.date).slice(5, 11)}</div><div><span class="chip ${u.color}">${esc(u.tag)}</span> ${u.pinned ? '<span class="pin">📌 pinned</span>' : ''}<h4>${esc(u.title)}</h4><p>${esc(u.body)}</p></div></div>`).join('')}
        <p class="board-more"><a class="link" href="community.html">View all announcements →</a></p>
      </div>
    </div>
  </div>
</section>

${findSection}

<section class="section">
  <div class="container">
    <div class="section-head reveal">
      <p class="eyebrow"><i class="dot"></i>Domains</p>
      <h2>Eight ways to get your hands <span class="hl">dirty</span>.</h2>
    </div>
    <div class="grid g4">
      ${domains.map(d => `<a class="dom-tile reveal c-${d.color}" href="domains.html#${d.id}"><span class="g">${icon(d.glyph, 28)}</span><b>${esc(d.name)}</b><small>${esc(d.tools.slice(0, 2).join(' · '))}</small></a>`).join('')}
    </div>
  </div>
</section>

<section class="section tint">
  <div class="container">
    <div class="section-head reveal">
      <p class="eyebrow"><i class="dot"></i>Warm-up corner</p>
      <h2>Two minutes. <span class="hl">Zero pressure.</span></h2>
      <p>Tiny brain-teasers while you decide what to join. Come back for new ones each month.</p>
    </div>
    <div class="play">
      <div class="card play-card reveal" id="quiz-go">
        <h3>Guess the output</h3>
        <div class="code-q"></div>
        <div class="opts"></div>
        <div class="play-foot"><span class="qfoot">Pick one</span><span>Score: <b class="score">0</b></span></div>
        <button class="btn btn-sm btn-yellow q-next" style="margin-top:12px" hidden>Next one ${arrow}</button>
      </div>
      <div class="card play-card reveal">
        <div id="riddle"><h3>Name that tech</h3><div class="emoji-q"></div><div class="opts"></div><p class="play-foot rfoot"></p></div>
        <hr style="border:0;border-top:2px dashed rgba(29,27,38,.25);margin:20px 0">
        <div id="bracket-toy"><h3>Poke the brackets</h3><div class="bracket-toy"><button aria-label="Left bracket" style="color:var(--blue)">&lt;</button><button aria-label="Dot one" style="color:var(--yellow)">•</button><button aria-label="Dot two" style="color:var(--green)">•</button><button aria-label="Right bracket" style="color:var(--red)">&gt;</button></div><p class="toy-say" style="text-align:center;font:500 .95rem var(--mono);min-height:1.6em;margin:0" aria-live="polite">Go on, click one.</p></div>
      </div>
    </div>
  </div>
</section>

<section class="section">
  <div class="container">
    <div class="section-head reveal">
      <p class="eyebrow"><i class="dot"></i>The next 12 months ${sample('Draft plan')}</p>
      <h2>Reboot. Build. Grow. <span class="hl">Shine.</span></h2>
    </div>
    <div class="roadmap">
      ${roadmap.map(r => `<div class="quarter c-${r.color} ${r.color === 'yellow' ? 'y' : ''} reveal"><header><small>${r.q} · ${r.months}</small><h3>${r.title}</h3></header><ul>${r.goals.slice(0, 3).map(g => `<li>${esc(g)}</li>`).join('')}</ul></div>`).join('')}
    </div>
    <p style="margin-top:28px" class="reveal"><a class="link" href="about.html#roadmap">See the full plan and what we expect from each other →</a></p>
  </div>
</section>

<section class="section tint">
  <div class="container">
    <div class="section-head reveal">
      <p class="eyebrow"><i class="dot"></i>Legacy &amp; wins ${sample()}</p>
      <h2>This club has done it <span class="hl">before</span>. Let's do it again.</h2>
    </div>
    <div class="grid g4" style="margin-bottom:46px">
      ${achievements.map(a => `<div class="stat c-${a.color} reveal"><b>${esc(a.n)}</b><span>${esc(a.label)}</span></div>`).join('')}
    </div>
    ${milestoneStrip()}
    <p style="margin-top:34px" class="reveal"><a class="link" href="legacy.html">Relive the legacy, meet the members it changed →</a></p>
  </div>
</section>

${legacyStory(false)}
${legacyGallery(true)}
${legacyStories(false)}

<section class="section crew">
  <div class="container">
    <div class="section-head reveal">
      <p class="eyebrow"><i class="dot"></i>The crew</p>
      <h2>Students running it. A mentor <span class="hl">backing</span> them.</h2>
    </div>
    <div class="team-grid">
      ${[...team.organizers, team.mentor].map(p => `<article class="card person reveal">${avatar(p.name, p.color, p.photo)}<h3>${esc(p.name)}</h3><div class="role">${esc(p.role)}</div>${socialLinks(p)}</article>`).join('')}
    </div>
    <h3 class="reveal crew-sub">Core team</h3>
  </div>
  <div class="crew-marquee" role="region" aria-label="The GDG GITAM core team">
    <div class="crew-track">
      ${[0, 1].map(half => [0, 1, 2].map(rep => team.core.map(p => `<article class="crew-card"${half || rep ? ' aria-hidden="true"' : ''}>${avatar(p.name, p.color, p.photo)}<div><h3>${esc(p.name)}</h3><div class="role">${esc(p.role)}</div>${socialLinks(p)}</div></article>`).join('')).join('')).join('')}
    </div>
  </div>
  <div class="container">
    <p style="margin-top:28px" class="reveal"><a class="link" href="about.html#team">Meet the team, and the roles that need you →</a></p>
  </div>
</section>

${ctaBand({ title: 'Join us. It really is that simple.', text: 'Become a member, get notified about events, and bring a friend. The only requirement is curiosity.', primary: ['join.html', 'Join the club'], secondary: ['community.html', 'Visit the community board'] })}
${lightbox}
`;

export default {
  path: 'index.html', nav: 'home', title: 'Home',
  description: 'GDG on Campus GITAM is a student-run tech community for learning, building and shipping with Google technologies. Free events, workshops, hackathons and mentors — beginners welcome.',
  scripts: ['home.js', 'quiz.js'],
  body,
  jsonld: [{ '@context': 'https://schema.org', '@type': 'WebSite', name: site.name, url: site.url + '/' }]
};
