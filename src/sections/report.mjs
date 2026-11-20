// Printable event report, generated from the event's data. Only sections that have data are rendered,
// so the Documentation team just fills in `src/data/site.mjs` and the PDF takes shape.
import { site, typeLabels } from '../data/site.mjs';
import { esc, fmtDate, eventPage, logoMark } from '../lib.mjs';

export const reportPage = (e) => {
  const r = e.report || {};
  const has = (a) => Array.isArray(a) && a.length > 0;
  const real = (e.speakers || []).filter(x => !x.tba);
  const photos = (e.photos || []).filter(p => p.src);
  const links = (e.resources || []).filter(x => x.url);
  const stats = [{ label: 'Attended', value: e.attendees }, ...(r.stats || []).filter(x => x.label !== 'Attended')].filter(x => x.value);
  const colors = ['blue', 'red', 'yellow', 'green'];

  const body = `
<div class="rpt-bar no-print">
  <a class="btn btn-ghost btn-sm" href="${eventPage(e)}">← Back to event</a>
  <button class="btn btn-ink btn-sm" id="rpt-print" type="button">Save as PDF</button>
  <span>Tip: in the print dialog choose <b>Save as PDF</b> and turn on <b>Background graphics</b>.</span>
</div>
<main class="rpt">
  <header class="rpt-head c-${e.color}">
    <div class="rpt-brand">${logoMark(54)}<div><b>GDG on Campus</b><small>GITAM · Event report</small></div></div>
    <span class="rpt-type">${esc(typeLabels[e.type])}</span>
    <h1>${esc(e.title)}</h1>
    <p>${esc(e.blurb)}</p>
    <div class="rpt-strip" aria-hidden="true"><i></i><i></i><i></i><i></i></div>
  </header>

  <section class="rpt-meta">
    <div><small>Date</small><b>${fmtDate(e.date)}</b></div>
    <div><small>Time</small><b>${esc(e.time)}–${esc(e.end)}</b></div>
    <div><small>Venue</small><b>${esc(e.venue)}</b></div>
    <div><small>Format</small><b>${esc(typeLabels[e.type])}</b></div>
  </section>

  ${stats.length ? `<section class="rpt-stats">${stats.map((x, i) => `<div class="c-${colors[i % 4]}"><b>${esc(x.value)}</b><span>${esc(x.label)}</span></div>`).join('')}</section>` : ''}

  ${has(e.about) ? `<section class="rpt-sec"><h2>Summary</h2>${e.about.map(t => `<p>${esc(t)}</p>`).join('')}</section>` : ''}

  ${has(r.highlights) ? `<section class="rpt-sec"><h2>Highlights</h2><ul class="rpt-list">${r.highlights.map(t => `<li>${esc(t)}</li>`).join('')}</ul></section>` : ''}

  ${real.length ? `<section class="rpt-sec"><h2>Speakers</h2><div class="rpt-people">${real.map(x => `<div><b>${esc(x.name)}</b><span>${esc(x.role)}</span></div>`).join('')}</div></section>` : ''}

  ${has(e.takeaways) ? `<section class="rpt-sec"><h2>Key takeaways</h2><ol class="rpt-take">${e.takeaways.map((t, i) => `<li class="c-${colors[i % 4]}"><span>${i + 1}</span><p>${esc(t)}</p></li>`).join('')}</ol></section>` : ''}

  ${has(r.feedback) ? `<section class="rpt-sec"><h2>What attendees said</h2><div class="rpt-quotes">${r.feedback.map((q, i) => `<blockquote class="c-${colors[i % 4]}">“${esc(q.quote)}”<cite>${esc(q.by)}</cite></blockquote>`).join('')}</div></section>` : ''}

  ${photos.length ? `<section class="rpt-sec"><h2>Photos</h2><div class="rpt-photos">${photos.slice(0, 6).map(p => `<figure><img src="${esc(p.src)}" alt="${esc(p.label)}"><figcaption>${esc(p.label)}</figcaption></figure>`).join('')}</div></section>` : ''}

  ${links.length ? `<section class="rpt-sec"><h2>Resources</h2><ul class="rpt-list">${links.map(x => `<li><b>${esc(x.label)}</b><br><span class="rpt-url">${esc(x.url)}</span></li>`).join('')}</ul></section>` : ''}

  ${r.thanks ? `<section class="rpt-sec rpt-thanks"><h2>Thank you</h2><p>${esc(r.thanks)}</p></section>` : ''}

  <footer class="rpt-foot">
    <span>${r.preparedBy ? 'Prepared by ' + esc(r.preparedBy) + ' · ' : ''}${esc(site.name)}</span>
    <span>${esc(site.url.replace(/^https?:\/\//, ''))}</span>
  </footer>
</main>`;
  return {
    path: `event-${e.id.replace(/^past-/, '')}-report.html`, bare: true, nav: 'events',
    title: `GDG GITAM Event Report - ${e.title}`, description: `Event report for ${e.title}.`, noindex: true,
    scripts: ['report.js'], body
  };
};
