import { domains } from '../data/site.mjs';
import { esc, pageHero, ctaBand, arrow } from '../lib.mjs';

const body = `
${pageHero({ eyebrow: 'Domains', title: 'Pick a lane. <span class="hl">Switch anytime.</span>', lead: 'Eight areas we run sessions, squads and projects in. You don\'t have to choose one forever. Most members try three before they find their thing.', color: 'green' })}

<section class="section">
  <div class="container">
    <div class="domain-tabs reveal" role="group" aria-label="Jump to a domain">
      ${domains.map(d => `<a class="chip ${d.color}" href="#${d.id}">${esc(d.name)}</a>`).join('')}
    </div>
    ${domains.map(d => `
    <article class="card dom-detail c-${d.color} reveal" id="${d.id}">
      <div class="dom-glyph" aria-hidden="true">${esc(d.glyph)}</div>
      <div>
        <h2 style="font-size:2rem;margin-bottom:.3em">${esc(d.name)}</h2>
        <p style="font-size:1.1rem">${esc(d.what)}</p>
        <div class="ev-tags" style="margin-bottom:14px">${d.tools.map(t => `<span class="chip">${esc(t)}</span>`).join('')}</div>
        <dl class="dl">
          <dt>Start with</dt><dd>${esc(d.first)}</dd>
          <dt>You get</dt><dd>${esc(d.outcome)}</dd>
          <dt>With us</dt><dd>Workshops, study jams and a project squad. <a class="link" href="events.html">See events</a></dd>
        </dl>
        <p style="margin:12px 0 0"><a class="btn btn-ink btn-sm" href="join.html?domain=${d.id}#member">I'm interested ${arrow}</a></p>
      </div>
    </article>`).join('')}
    <div class="card c-yellow reveal" style="margin-top:34px;display:flex;gap:20px;align-items:center;justify-content:space-between;flex-wrap:wrap">
      <div><h3 style="margin:0 0 4px">Not sure which one is yours?</h3><p style="margin:0">Try the Tech Atlas, an interactive map of tech careers with roadmaps and first steps.</p></div>
      <a class="btn btn-ink" href="explore.html">Open the Tech Atlas ${arrow}</a>
    </div>
  </div>
</section>

${ctaBand({ title: 'Want a domain we don\'t have yet?', text: 'Game dev, robotics, AR, anything. If three people want it, we\'ll start a squad.', primary: ['join.html#suggest', 'Suggest a domain'], secondary: ['find-your-place.html', 'Find your place'] })}
`;

export default {
  path: 'domains.html', nav: 'domains', title: 'Tech Domains',
  description: 'Explore the tech domains GDG on Campus GITAM covers: Android & Flutter, Web, AI & Gemini, Cloud, Data, UI/UX, Security and DSA & Open Source.',
  body
};
