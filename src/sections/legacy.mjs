// Legacy sections, shared by the Legacy page and the Home page.
import { timeline, achievements, stories, gallery, milestones } from '../data/site.mjs';
import { esc, photo, avatar, sample } from '../lib.mjs';

export const legacyStory = (tint = false) => `
<section class="section${tint ? ' tint' : ''}" id="our-story">
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
</section>`;

export const milestoneStrip = () => `<div class="gallery-strip milestones reveal">${milestones.map(m => photo(m.year + ' · ' + m.label, m.color).replace('<figure', '<figure data-lightbox tabindex="0"')).join('')}</div>`;

export const legacyMilestones = (tint = false) => `
<section class="section${tint ? ' tint' : ''}" id="milestones">
  <div class="container">
    <div class="section-head reveal">
      <p class="eyebrow"><i class="dot"></i>Milestones ${sample('Photos coming')}</p>
      <h2>The moments that <span class="hl">mattered</span>.</h2>
      <p>The firsts, the wins and the nights people still talk about. Click a photo to enlarge.</p>
    </div>
    ${milestoneStrip()}
  </div>
</section>`;

export const legacyGallery = (tint = true) => `
<section class="section${tint ? ' tint' : ''}" id="gallery">
  <div class="container">
    <div class="section-head reveal">
      <p class="eyebrow"><i class="dot"></i>Gallery ${sample('Photos coming')}</p>
      <h2>Everything else, <span class="hl">in frames</span>.</h2>
      <p>The workshops, late nights and in-between moments. Click any photo to enlarge. We'll replace these with real shots from past events.</p>
    </div>
    <div class="gallery reveal">
      ${gallery.map(g => photo(g.label, g.color, g.size).replace('<figure', '<figure data-lightbox tabindex="0"')).join('')}
    </div>
  </div>
</section>`;

export const legacyAchievements = (tint = false) => `
<section class="section${tint ? ' tint' : ''}" id="achievements">
  <div class="container">
    <div class="section-head reveal">
      <p class="eyebrow"><i class="dot"></i>Achievements ${sample()}</p>
      <h2>The numbers we're <span class="hl">proud</span> of.</h2>
    </div>
    <div class="grid g4">
      ${achievements.map(a => `<div class="card stat c-${a.color} reveal" style="padding:24px"><b>${esc(a.n)}</b><span>${esc(a.label)}</span></div>`).join('')}
    </div>
  </div>
</section>`;

export const legacyStories = (tint = true) => `
<section class="section${tint ? ' tint' : ''}" id="stories">
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
</section>`;

export const lightbox = `<div class="modal lightbox" id="lightbox" role="dialog" aria-modal="true" aria-label="Photo viewer"><div class="modal-box"><button class="modal-x" aria-label="Close">×</button><div class="lb-body"></div></div></div>`;
