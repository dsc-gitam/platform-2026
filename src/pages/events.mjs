import { events, typeLabels, site } from '../data/site.mjs';
import { registerModal } from '../sections/register.mjs';
import { speakerRow, eventPage, esc, dateParts, fmtDate, pageHero, ctaBand, arrow, sample } from '../lib.mjs';

const upcoming = events.filter(e => e.status === 'upcoming');
const past = events.filter(e => e.status === 'past');

const card = (e) => { const d = dateParts(e.date); return `
<article class="card event c-${e.color} reveal" id="${e.id}" data-type="${e.type}">
  <div class="date-block"><b>${d.d}</b><span>${d.mon} ${d.y}</span></div>
  <div>
    <div class="ev-meta"><span class="chip ${e.color}">${typeLabels[e.type]}</span><span>${fmtDate(e.date)}</span><span>${e.time}${e.end && e.end !== e.time ? '–' + e.end : ' → next day'}</span><span>${esc(e.venue)}</span></div>
    <h3>${esc(e.title)}</h3>
    <p>${esc(e.blurb)}</p>
    ${speakerRow(e.speakers, e.speakerLabel)}
    <div class="ev-tags">${e.tags.map(t => `<span class="chip">${esc(t)}</span>`).join('')}${e.free ? '<span class="chip green">Free</span>' : ''}</div>
  </div>
  <div class="ev-act">
    <button class="btn btn-ink js-register" data-id="${e.id}">Register ${arrow}</button>
    <div class="seats"><div class="bar-seats" style="--c:var(--${e.color})"><i data-seats="${e.id}" style="width:0"></i></div><span data-seatlabel="${e.id}">${e.seats} seats</span></div>
  </div>
</article>`; };

const pastCard = (e) => { const d = dateParts(e.date); return `
<article class="card event is-past c-${e.color} reveal">
  <div class="date-block"><b>${d.d}</b><span>${d.mon} ${d.y}</span></div>
  <div><div class="ev-meta"><span class="chip ${e.color}">${typeLabels[e.type]}</span><span>${esc(e.venue)}</span><span>${esc(e.attendees)} attended</span></div><h3>${esc(e.title)}</h3><p>${esc(e.blurb)}</p>${speakerRow(e.speakers)}<p style="margin:14px 0 0">${e.ready ? `<a class="btn btn-ghost btn-sm" href="${eventPage(e)}">Explore this event ${arrow}</a>` : `<span class="btn btn-ghost btn-sm is-disabled" role="link" aria-disabled="true" tabindex="0" data-tip="Will be available within 12 hours" title="Will be available within 12 hours">Explore this event ${arrow}</span>`}</p></div>
</article>`; };

const ld = upcoming.map(e => ({
  '@context': 'https://schema.org', '@type': 'Event', name: e.title, description: e.blurb,
  startDate: `${e.date}T${e.time}:00+05:30`, eventStatus: 'https://schema.org/EventScheduled', eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
  location: { '@type': 'Place', name: e.venue, address: site.location },
  organizer: { '@type': 'Organization', name: site.name, url: site.url },
  ...(e.speakers && e.speakers.some(x => !x.tba) ? { performer: e.speakers.filter(x => !x.tba).map(x => ({ '@type': 'Person', name: x.name })) } : {}),
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'INR', availability: 'https://schema.org/InStock', url: `${site.url}/events.html#${e.id}` },
  isAccessibleForFree: true
}));

const body = `
${pageHero({ eyebrow: 'Events', title: 'Show up once. <span class="hl">See what happens.</span>', lead: 'Workshops, study jams, talks and hackathons, all free, all with a beginner track. Pick something and register in under a minute.', color: 'yellow' })}

<section class="section">
  <div class="container">
    <div class="filters reveal" role="group" aria-label="Filter events by type">
      <button class="chip on" data-filter="all" aria-pressed="true">All</button>
      ${Object.entries(typeLabels).map(([k, v]) => `<button class="chip" data-filter="${k}" aria-pressed="false">${v}</button>`).join('')}
    </div>
    <div id="ev-list">${upcoming.map(card).join('')}</div>
    <p class="empty" id="ev-empty" hidden>Nothing here yet. Check back soon, or <a class="link" href="join.html#suggest">suggest a session</a>.</p>
    <div class="card c-blue reveal" style="margin-top:30px;display:flex;gap:18px;align-items:center;justify-content:space-between;flex-wrap:wrap">
      <div><h3 style="margin:0 0 4px">Never miss one</h3><p style="margin:0">Get event alerts by email, or on the <a class="link" href="community.html">community board</a>.</p></div>
      <form class="sub-form" data-form="subscribe" style="margin:0" novalidate><label class="sr" for="ev-email">Email</label><input id="ev-email" type="email" name="email" placeholder="you@example.com" required><input type="hidden" name="source" value="events"><button class="btn btn-ink btn-sm" type="submit">Notify me</button><p class="form-done" role="status" hidden>You're in!</p></form>
    </div>
  </div>
</section>

<section class="section tint" id="past">
  <div class="container">
    <div class="section-head reveal"><p class="eyebrow"><i class="dot"></i>Past events ${sample()}</p><h2>What we have <span class="hl">already</span> done.</h2></div>
    ${past.map(pastCard).join('')}
  </div>
</section>

${ctaBand({ title: 'Have an idea for a session?', text: 'Want to learn (or teach) something we are not running? Tell us. The best events started as a suggestion.', primary: ['join.html#suggest', 'Suggest a session'], secondary: ['join.html#speaker', 'Speak at an event'] })}

${registerModal}
`;

export default {
  path: 'events.html', nav: 'events', title: 'Upcoming Events',
  description: 'Register for free GDG on Campus GITAM workshops, study jams, talks and hackathons. Beginner-friendly tech events at GITAM.',
  scripts: ['register.js', 'events.js'],
  body: body + `<script type="application/json" id="events-data">${JSON.stringify(upcoming)}</script>`,
  jsonld: ld
};
