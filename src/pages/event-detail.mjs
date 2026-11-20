// One page per past event: description, speakers, takeaways, resources, recording, photos and report.
import { events, typeLabels, site } from '../data/site.mjs';
import { lightbox } from '../sections/legacy.mjs';
import { icon } from '../icons.mjs';
import { esc, fmtDate, photo, ctaBand, eventPage, eventReportPage, sample, arrow } from '../lib.mjs';
import { reportPage } from '../sections/report.mjs';
import { avatar } from '../lib.mjs';

const past = events.filter(e => e.status === 'past' && e.ready);
const kindIcon = { slides: 'file-text', code: 'external-link', link: 'external-link' };

const resource = (r) => r.url
  ? `<a class="res" href="${esc(r.url)}" target="_blank" rel="noopener">${icon(kindIcon[r.kind] || 'external-link', 20)}<span>${esc(r.label)}</span>${arrow}</a>`
  : `<div class="res off">${icon(kindIcon[r.kind] || 'external-link', 20)}<span>${esc(r.label)}</span><em>Coming soon</em></div>`;

const video = (e) => e.recording.youtubeId
  ? `<div class="video"><iframe src="https://www.youtube-nocookie.com/embed/${esc(e.recording.youtubeId)}" title="${esc(e.title)} recording" loading="lazy" allow="accelerometer; encrypted-media; picture-in-picture" allowfullscreen></iframe></div>`
  : `<div class="video placeholder c-${e.color}"><div class="play">${icon('play', 34)}</div><p>${esc(e.recording.note)}</p></div>`;

const report = (e) => `<div class="card report-card c-${e.color}">
  <div class="badge">${icon('file-text', 24)}</div>
  <div><h3>Get the event report</h3><p>A tidy, shareable PDF built from this event's details: summary, speakers, takeaways and more. It opens a print-ready page, so choose <b>Save as PDF</b> in the print dialog.</p></div>
  <a class="btn btn-ink" href="${eventReportPage(e)}?print=1">${icon('download', 18)} Download report (PDF)</a>
</div>`;

const page = (e, i) => {
  const others = past.filter(x => x !== e); const next = others[i % Math.max(others.length, 1)];
  const real = e.speakers.filter(x => !x.tba);
  const sections = [['about', 'About'], ['speakers', 'Speakers'], ['takeaways', 'Takeaways'], ['resources', 'Resources'], ['recording', 'Recording'], ['photos', 'Photos'], ['report', 'Report']];
  const body = `
<section class="page-hero ph-${e.color}">
  <div class="container">
    <p class="crumb"><a href="events.html#past">${icon('arrow-left', 16)} All events</a></p>
    <p class="eyebrow"><i class="dot"></i>${esc(typeLabels[e.type])} · Past event ${sample()}</p>
    <h1>${esc(e.title)}</h1>
    <p class="lead">${esc(e.blurb)}</p>
    <div class="ev-facts">
      <span>${icon('calendar', 18)} ${fmtDate(e.date)}</span>
      <span>${icon('clock', 18)} ${esc(e.time)}–${esc(e.end)}</span>
      <span>${icon('map-pin', 18)} ${esc(e.venue)}</span>
      <span>${icon('users', 18)} ${esc(e.attendees)} attended</span>
    </div>
  </div>
  <div class="hero-shapes" aria-hidden="true"><i class="s s1"></i><i class="s s2"></i><i class="s s3"></i></div>
</section>

<nav class="ev-subnav" aria-label="On this page"><div class="container">${sections.map(([id, l]) => `<a href="#${id}">${l}</a>`).join('')}</div></nav>

<section class="section" id="about">
  <div class="container split">
    <div class="reveal"><p class="eyebrow"><i class="dot"></i>About the event</p><h2>What <span class="hl">happened</span>.</h2>
      ${e.about.map((t, n) => `<p${n === 0 ? ' class="lead" style="max-width:none"' : ''}>${esc(t)}</p>`).join('')}</div>
    <aside class="card c-${e.color} reveal facts-card"><h3>At a glance</h3>
      <dl><dt>Format</dt><dd>${esc(typeLabels[e.type])}</dd><dt>Date</dt><dd>${fmtDate(e.date)}</dd><dt>Venue</dt><dd>${esc(e.venue)}</dd><dt>Attendance</dt><dd>${esc(e.attendees)}</dd><dt>Speakers</dt><dd>${e.speakers.length}</dd></dl>
    </aside>
  </div>
</section>

<section class="section tint" id="speakers">
  <div class="container">
    <div class="section-head reveal"><p class="eyebrow"><i class="dot"></i>Speakers</p><h2>Who we <span class="hl">learned from</span>.</h2></div>
    <div class="grid g3">${e.speakers.map(sp => `<article class="card person reveal">${avatar(sp.name, sp.color || e.color, sp.photo)}<h3>${esc(sp.name)}</h3><div class="role">${esc(sp.role)}</div></article>`).join('')}</div>
  </div>
</section>

<section class="section" id="takeaways">
  <div class="container">
    <div class="section-head reveal"><p class="eyebrow"><i class="dot"></i>Key takeaways</p><h2>What you'd have <span class="hl">taken home</span>.</h2></div>
    <div class="grid g2">${e.takeaways.map((t, n) => `<div class="card take c-${['blue', 'red', 'yellow', 'green'][n % 4]} reveal"><div class="badge">${icon('lightbulb', 24)}</div><p>${esc(t)}</p></div>`).join('')}</div>
  </div>
</section>

<section class="section tint" id="resources">
  <div class="container">
    <div class="section-head reveal"><p class="eyebrow"><i class="dot"></i>Resources</p><h2>Keep <span class="hl">learning</span>.</h2><p>Slides, code and links from the session.</p></div>
    <div class="res-list reveal">${e.resources.map(resource).join('')}</div>
  </div>
</section>

<section class="section" id="recording">
  <div class="container">
    <div class="section-head reveal"><p class="eyebrow"><i class="dot"></i>Watch on demand</p><h2>Missed it? <span class="hl">Press play</span>.</h2></div>
    <div class="reveal">${video(e)}</div>
  </div>
</section>

<section class="section tint" id="photos">
  <div class="container">
    <div class="section-head reveal"><p class="eyebrow"><i class="dot"></i>Photos ${sample('Photos coming')}</p><h2>Moments from the <span class="hl">day</span>.</h2><p>Click any photo to enlarge.</p></div>
    <div class="gallery reveal">${e.photos.map(g => photo(g.label, g.color, g.size, g.src).replace('<figure', '<figure data-lightbox tabindex="0"')).join('')}</div>
  </div>
</section>

<section class="section" id="report">
  <div class="container">
    <div class="section-head reveal"><p class="eyebrow"><i class="dot"></i>Event report</p><h2>The official <span class="hl">write-up</span>.</h2></div>
    <div class="reveal">${report(e)}</div>
  </div>
</section>

${ctaBand({ title: 'Come to the next one.', text: 'Every event has a beginner track. See what is coming up and save your seat.', primary: ['events.html', 'Upcoming events'], secondary: next ? [eventPage(next), 'Also: ' + next.title] : undefined })}
${lightbox}
`;
  return {
    path: eventPage(e), nav: 'events', title: e.title,
    description: `${e.title} at GDG on Campus GITAM: what happened, speakers, key takeaways, resources, the recording and photos.`,
    body,
    jsonld: [{
      '@context': 'https://schema.org', '@type': 'Event', name: e.title, description: e.blurb, startDate: `${e.date}T${e.time}:00+05:30`,
      eventStatus: 'https://schema.org/EventScheduled', eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
      location: { '@type': 'Place', name: e.venue, address: site.location },
      organizer: { '@type': 'Organization', name: site.name, url: site.url },
      ...(real.length ? { performer: real.map(x => ({ '@type': 'Person', name: x.name })) } : {})
    }]
  };
};

export default [...past.map(page), ...past.map(reportPage)];
