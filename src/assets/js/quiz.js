/* Find your place — weighted quiz → personalised path */
(function () {
  'use strict';
  const { $, $$, store } = window.GDG;
  const paths = JSON.parse($('#paths-data').textContent);
  const P = Object.fromEntries(paths.map(p => [p.id, p]));
  const root = $('#quiz');
  const esc = (s) => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

  const Q = [
    { t: 'Where are you with tech right now?', o: [
      ['Brand new. I\'m just curious.', 'Never written code, or only in class.', { explorer: 3 }],
      ['I\'ve tried a few things.', 'Tutorials, small projects, some confusion.', { learner: 3, explorer: 1 }],
      ['I build or create regularly.', 'Code, design, video or hardware. I make stuff.', { builder: 3, learner: 1 }],
      ['I\'ve led teams or events.', 'Clubs, internships, organising, managing people.', { leader: 3, builder: 1 }],
      ['I\'ve shipped things and love teaching.', 'I could explain what I know to others.', { speaker: 3, leader: 1, builder: 1 }]] },
    { t: 'What do you want out of this?', o: [
      ['Understand what tech is about', 'And meet some nice people.', { explorer: 2, learner: 1 }],
      ['Level up a specific skill', 'With guidance and practice.', { learner: 2 }],
      ['Build a project with a team', 'Something I can show off.', { builder: 2 }],
      ['Run things and make decisions', 'Shape what the club becomes.', { leader: 2 }],
      ['Share what I know', 'On stage, in writing, or one on one.', { speaker: 2 }]] },
    { t: 'How much time can you give?', o: [
      ['A few hours a month', 'I\'ll come when I can.', { explorer: 1, learner: 1, speaker: 1 }],
      ['A few hours a week', 'Regular, but not all-in.', { learner: 1, builder: 2 }],
      ['5+ hours a week', 'I want to really be part of it.', { leader: 2, builder: 1 }]] },
    { t: 'What\'s your style?', o: [
      ['Watch and listen first', 'Let me get a feel for things.', { explorer: 2 }],
      ['Hands-on with guidance', 'Show me, then let me try.', { learner: 2 }],
      ['Figure it out with a team', 'Chaos is fine, as long as we ship.', { builder: 2 }],
      ['Take the wheel', 'Plan it, assign it, make it happen.', { leader: 2 }],
      ['On stage or on the page', 'I like explaining and telling stories.', { speaker: 2 }]] }
  ];

  let step = 0, scores = {}, picks = [];
  const COLORS = ['blue', 'red', 'yellow', 'green'];

  function question() {
    const q = Q[step];
    root.innerHTML = `
      <div class="q-progress" aria-label="Step ${step + 1} of ${Q.length}">${Q.map((_, i) => `<i class="${i < step ? 'done' : ''}" style="--c:var(--${COLORS[i % 4]})"></i>`).join('')}</div>
      <p class="eyebrow"><i class="dot"></i>Question ${step + 1} of ${Q.length}</p>
      <h2 class="q-title">${q.t}</h2>
      <div class="q-opts">${q.o.map((o, i) => `<button class="q-opt" data-i="${i}" style="--c:var(--${COLORS[i % 4]})"><span class="k" ${COLORS[i % 4] === 'yellow' ? 'style="color:var(--ink)"' : ''}>${'ABCDE'[i]}</span><span><b>${esc(o[0])}</b><small>${esc(o[1])}</small></span></button>`).join('')}</div>
      <div class="q-nav">${step ? '<button class="btn btn-ghost btn-sm" data-back>← Back</button>' : '<span></span>'}<a class="link" href="explore.html">Rather explore freely? Try the Tech Atlas</a></div>`;
    $('.q-opt', root).focus({ preventScroll: true });
  }

  root.addEventListener('click', (e) => {
    const opt = e.target.closest('.q-opt');
    if (opt) { picks[step] = +opt.dataset.i; step++; step < Q.length ? question() : result(); const top = root.getBoundingClientRect().top; if (top < 90 || top > innerHeight * 0.6) window.scrollTo({ top: scrollY + top - 110, behavior: 'smooth' }); return; }
    if (e.target.closest('[data-back]')) { step--; question(); return; }
    if (e.target.closest('[data-restart]')) { step = 0; picks = []; question(); }
  });

  function compute() {
    scores = Object.fromEntries(Object.keys(P).map(k => [k, 0]));
    picks.forEach((p, qi) => Object.entries(Q[qi].o[p][2]).forEach(([k, v]) => scores[k] += v));
    const lvl = Q[0].o[picks[0]][2]; // tie-break by level answer
    return Object.entries(scores).sort((a, b) => b[1] - a[1] || (lvl[b[0]] || 0) - (lvl[a[0]] || 0));
  }

  function result() {
    const ranked = compute(); const [topId] = ranked[0]; const second = ranked[1][0]; const p = P[topId], s = P[second];
    const max = Math.max(...ranked.map(r => r[1])) || 1;
    store.set('place', topId);
    root.innerHTML = `
    <div class="result reveal in">
      <div class="result-top c-${p.color}"><span class="big-glyph" aria-hidden="true">${GDG_ICON(p.glyph, 190)}</span>
        <p class="eyebrow"><i class="dot"></i>Your place</p>
        <h2>${esc(p.name)}</h2><p class="lead" style="max-width:52ch">${esc(p.line)}</p>
        <p style="max-width:56ch">${esc(p.why)}</p>
        <div style="display:flex;gap:12px;flex-wrap:wrap;margin-top:18px">
          <a class="btn btn-ink" href="join.html?from=find#${p.tab}">${esc(p.cta)} →</a>
          <a class="btn btn-ghost" href="${p.extra[0]}">${esc(p.extra[1])}</a>
        </div>
      </div>
      <div class="grid g2" style="align-items:start">
        <div class="card"><h3>Your first 30 days</h3><ol class="steps c-${p.color}">${p.steps.map(([w, t]) => `<li><div><b>${esc(w)}</b><span>${esc(t)}</span></div></li>`).join('')}</ol></div>
        <div class="card"><h3>How you matched</h3><div class="match-bars">${ranked.map(([id, v], i) => `<div class="mb c-${P[id].color}"><span>${esc(P[id].name.replace('The ', ''))}</span><i><b data-w="${Math.round(v / max * 100)}"></b></i><span>${Math.round(v / max * 100)}%</span></div>`).join('')}</div>
          <p style="margin:16px 0 0;font-size:.95rem">You also have a bit of <a class="link" href="join.html?from=find#${s.tab}">${esc(s.name)}</a> in you.</p></div>
      </div>
      <div style="display:flex;gap:12px;flex-wrap:wrap;align-items:center"><button class="btn btn-ghost btn-sm" data-restart>Retake the quiz</button><button class="btn btn-ghost btn-sm" id="share">Copy link to my result</button><a class="link" href="explore.html">Still curious which tech path? Open the Tech Atlas</a></div>
    </div>`;
    requestAnimationFrame(() => $$('.mb i b', root).forEach(b => b.style.width = b.dataset.w + '%'));
    $('#share').addEventListener('click', () => { const u = location.origin + location.pathname + '?result=' + topId; (navigator.clipboard?.writeText(u) || Promise.reject()).then(() => window.GDG.toast('Link copied!')).catch(() => window.GDG.toast(u)); });
  }

  // Direct link to a result: ?result=builder
  const r = new URLSearchParams(location.search).get('result');
  if (r && P[r]) { picks = [0, 0, 0, 0]; scores = {}; sharedResult(r); } else question();

  function sharedResult(id) {
    // Build a minimal view without scores
    picks = []; const p = P[id];
    root.innerHTML = `<div class="result"><div class="result-top c-${p.color}"><span class="big-glyph" aria-hidden="true">${GDG_ICON(p.glyph, 190)}</span><p class="eyebrow"><i class="dot"></i>A friend found their place</p><h2>${esc(p.name)}</h2><p class="lead" style="max-width:52ch">${esc(p.line)}</p><div style="display:flex;gap:12px;flex-wrap:wrap;margin-top:18px"><button class="btn btn-ink" data-restart>Find mine →</button><a class="btn btn-ghost" href="join.html#${p.tab}">${esc(p.cta)}</a></div></div></div>`;
  }
})();
