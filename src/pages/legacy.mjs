import { timeline, achievements, stories, gallery } from '../data/site.mjs';
import { esc, photo, avatar, pageHero, ctaBand, sample } from '../lib.mjs';

const body = `
${pageHero({ eyebrow: 'Legacy', title: 'A club worth <span class="hl">bringing back</span>.', lead: 'Before the quiet years, this community filled rooms, won challenges and changed careers. This page is the proof, and the reason we are rebuilding.', color: 'red' })}

<section class="section">
  <div class="container split">
    <div class="reveal">
      <p class="eyebrow"><i class="dot"></i>Our story ${sample()}</p>
      <h2>From a handful of students to a campus <span class="hl">movement</span>.</h2>
      <p class="lead">Clubs fade when the people who held them together graduate. Ours did too. But what they built, the skills, friendships and careers, did not.</p>
      <p>We are bringing it back with a simple belief: a club should outlive its batch. So we are building habits, documentation and a mentoring chain, not just events.</p>
    </div>
    <div class="timeline reveal">
      ${timeline.map(t => `<div class="tl-item c-${t.color}"><span class="yr">${esc(t.year)}</span><h3>${esc(t.title)}</h3><p>${esc(t.text)}</p></div>`).join('')}
    </div>
  </div>
</section>

<section class="section tint" id="gallery">
  <div class="container">
    <div class="section-head reveal">
      <p class="eyebrow"><i class="dot"></i>Gallery ${sample('Photos coming')}</p>
      <h2>How it looked when it <span class="hl">worked</span>.</h2>
      <p>Click any photo to enlarge. We'll replace these with real moments from past events.</p>
    </div>
    <div class="gallery reveal">
      ${gallery.map(g => photo(g.label, g.color, g.size).replace('<figure', '<figure data-lightbox tabindex="0"')).join('')}
    </div>
  </div>
</section>

<section class="section" id="achievements">
  <div class="container">
    <div class="section-head reveal">
      <p class="eyebrow"><i class="dot"></i>Achievements ${sample()}</p>
      <h2>The numbers we're <span class="hl">proud</span> of.</h2>
    </div>
    <div class="grid g4">
      ${achievements.map(a => `<div class="card stat c-${a.color} reveal" style="padding:24px"><b>${esc(a.n)}</b><span>${esc(a.label)}</span></div>`).join('')}
    </div>
  </div>
</section>

<section class="section tint" id="stories">
  <div class="container">
    <div class="section-head reveal">
      <p class="eyebrow"><i class="dot"></i>Stories ${sample()}</p>
      <h2>Before the club. <span class="hl">After the club.</span></h2>
      <p>Real members, real starting points. If you are at "before" right now, that is exactly where they started.</p>
    </div>
    <div class="grid g3">
      ${stories.map(s => `<article class="card story c-${s.color} reveal">
        <div class="who">${avatar(s.name, s.color)}<div><b>${esc(s.name)}</b><small>${esc(s.batch)} · ${esc(s.now)}</small></div></div>
        <div class="ba"><div><small>Before</small>${esc(s.before)}</div><div><small>After</small>${esc(s.after)}</div></div>
        <blockquote>${esc(s.quote)}</blockquote>
      </article>`).join('')}
    </div>
    <div class="card c-yellow reveal" style="margin-top:34px;display:flex;gap:20px;align-items:center;justify-content:space-between;flex-wrap:wrap">
      <div><h3 style="margin:0 0 4px">Learnt something here? Tell us.</h3><p style="margin:0">Your story could be the one that convinces a first-year to walk in.</p></div>
      <a class="btn btn-ink" href="join.html#story">Share your story</a>
    </div>
  </div>
</section>

${ctaBand({ title: 'Help write the next chapter.', text: 'The legacy is not a museum. It is what the next batch builds on.', primary: ['find-your-place.html', 'Find your place'], secondary: ['events.html', 'Upcoming events'] })}

<div class="modal lightbox" id="lightbox" role="dialog" aria-modal="true" aria-label="Photo viewer"><div class="modal-box"><button class="modal-x" aria-label="Close">×</button><div class="lb-body"></div></div></div>
`;

export default {
  path: 'legacy.html', nav: 'legacy', title: 'Legacy, Gallery & Stories',
  description: 'Relive the legacy of GDG on Campus GITAM: our history, event photos, member achievements and stories of students who grew through the club.',
  body
};
