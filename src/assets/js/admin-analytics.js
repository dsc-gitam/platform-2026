/* Admin: per-event analytics (plain SVG/CSS charts, no libraries).
   GDGCharts.render(event, registrations) returns the HTML for the Analytics tab of the registrations dialog. */
(function () {
  'use strict';
  const esc = (s) => String(s ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const PALETTE = ['var(--blue)', 'var(--red)', 'var(--yellow)', 'var(--green)'];
  const pct = (n, t) => (t ? Math.round((n / t) * 100) : 0);
  const pad = (n) => String(n).padStart(2, '0');
  const ymd = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  const short = (iso) => new Date(iso + 'T00:00:00').toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
  const count = (arr, key) => arr.reduce((m, x) => { const k = key(x); m[k] = (m[k] || 0) + 1; return m; }, {});
  const sorted = (obj) => Object.entries(obj).sort((a, b) => b[1] - a[1]);

  // ---- charts ----
  // Horizontal bars: items = [[label, n]]
  function bars(items, total, empty = 'No data yet.') {
    if (!items.length) return `<p class="an-empty">${empty}</p>`;
    const max = Math.max(...items.map((i) => i[1]), 1);
    return `<div class="bar-list">${items.map(([label, n], i) => `<div class="bar-row"><span class="bl" title="${esc(label)}">${esc(label)}</span><i><b style="width:${Math.max(4, Math.round((n / max) * 100))}%;background:${PALETTE[i % 4]}"></b></i><span class="bv">${n} · ${pct(n, total)}%</span></div>`).join('')}</div>`;
  }

  // Donut: parts = [{ label, n, color }]
  function donut(parts, centre, sub) {
    const total = parts.reduce((s, p) => s + p.n, 0);
    const R = 52, C = 2 * Math.PI * R; let off = 0;
    const arcs = total ? parts.filter((p) => p.n > 0).map((p) => {
      const len = (p.n / total) * C; const seg = `<circle cx="70" cy="70" r="${R}" fill="none" stroke="${p.color}" stroke-width="22" stroke-dasharray="${len.toFixed(2)} ${(C - len).toFixed(2)}" stroke-dashoffset="${(-off).toFixed(2)}" transform="rotate(-90 70 70)"/>`;
      off += len; return seg;
    }).join('') : '';
    return `<div class="donut"><svg viewBox="0 0 140 140" role="img" aria-label="${esc(parts.map((p) => `${p.label}: ${p.n}`).join(', '))}"><circle cx="70" cy="70" r="${R}" fill="none" stroke="#EEECF4" stroke-width="22"/>${arcs}<circle cx="70" cy="70" r="${R + 11}" fill="none" stroke="var(--ink)" stroke-width="2"/><circle cx="70" cy="70" r="${R - 11}" fill="none" stroke="var(--ink)" stroke-width="2"/><text x="70" y="68" text-anchor="middle" class="d-big">${esc(centre)}</text><text x="70" y="86" text-anchor="middle" class="d-sub">${esc(sub || '')}</text></svg>
      <ul class="legend">${parts.map((p) => `<li><i style="background:${p.color}"></i>${esc(p.label)} <b>${p.n}</b> <small>${pct(p.n, total)}%</small></li>`).join('')}</ul></div>`;
  }

  // Daily bars + cumulative line. days = [{ d, n, cum }]
  function timeline(days, seats) {
    const W = 720, H = 200, L = 34, B = 26, T = 12, R = 10;
    const iw = W - L - R, ih = H - T - B, n = days.length;
    const maxN = Math.max(...days.map((x) => x.n), 1), maxC = Math.max(days[n - 1].cum, 1);
    const bw = Math.min(46, iw / n), step = n > 1 ? (iw - bw) / (n - 1) : 0;
    const x = (i) => L + (n > 1 ? i * step : (iw - bw) / 2);
    const bar = days.map((d, i) => { const h = Math.max(d.n ? 3 : 0, (d.n / maxN) * ih); return `<rect x="${x(i).toFixed(1)}" y="${(T + ih - h).toFixed(1)}" width="${(bw * 0.8).toFixed(1)}" height="${h.toFixed(1)}" rx="3" fill="var(--blue)" stroke="var(--ink)" stroke-width="1.5"><title>${short(d.d)}: ${d.n} registered</title></rect>`; }).join('');
    const pts = days.map((d, i) => `${(x(i) + bw * 0.4).toFixed(1)},${(T + ih - (d.cum / maxC) * ih).toFixed(1)}`).join(' ');
    const dots = days.map((d, i) => `<circle cx="${(x(i) + bw * 0.4).toFixed(1)}" cy="${(T + ih - (d.cum / maxC) * ih).toFixed(1)}" r="3.5" fill="var(--yellow)" stroke="var(--ink)" stroke-width="1.5"><title>${short(d.d)}: ${d.cum} in total</title></circle>`).join('');
    const ticks = [0, 0.5, 1].map((f) => `<line x1="${L}" x2="${W - R}" y1="${(T + ih - f * ih).toFixed(1)}" y2="${(T + ih - f * ih).toFixed(1)}" stroke="#E5E2EE" stroke-dasharray="3 4"/><text x="${L - 6}" y="${(T + ih - f * ih + 4).toFixed(1)}" text-anchor="end" class="ax">${Math.round(f * maxC)}</text>`).join('');
    const lab = [0, Math.floor((n - 1) / 2), n - 1].filter((v, i, a) => a.indexOf(v) === i).map((i) => `<text x="${(x(i) + bw * 0.4).toFixed(1)}" y="${H - 6}" text-anchor="middle" class="ax">${short(days[i].d)}</text>`).join('');
    return `<svg viewBox="0 0 ${W} ${H}" class="timeline" role="img" aria-label="Registrations per day with running total">${ticks}${bar}<polyline points="${pts}" fill="none" stroke="var(--ink)" stroke-width="2.5" stroke-linejoin="round"/>${dots}${lab}</svg>
      <p class="an-key"><span><i style="background:var(--blue)"></i>per day</span><span><i style="background:var(--yellow)"></i>running total${seats ? ` (of ${seats} seats)` : ''}</span></p>`;
  }

  // ---- analysis + render ----
  function render(ev, regs) {
    const total = regs.length;
    if (!total) return '<div class="an-card"><p class="an-empty" style="margin:0">No registrations yet. Charts appear as soon as people register.</p></div>';
    const checked = regs.filter((r) => r.checkedInAt).length, guests = regs.filter((r) => r.user.guest).length, members = total - guests;
    const now = Date.now(), last24 = regs.filter((r) => now - new Date(r.registeredAt) < 864e5).length;
    const asked = ev.questions || [];

    // registrations per day, filling the gaps up to today / the event date
    const perDay = count(regs, (r) => ymd(new Date(r.registeredAt)));
    const keys = Object.keys(perDay).sort();
    const start = new Date(keys[0] + 'T00:00:00'), lastKey = keys[keys.length - 1];
    const end = new Date(Math.max(Date.parse(lastKey + 'T00:00:00'), Math.min(now, Date.parse(ev.date + 'T00:00:00'))));
    const days = []; let cum = 0;
    for (let d = new Date(start), i = 0; d <= end && i < 120; d.setDate(d.getDate() + 1), i++) { const k = ymd(d); cum += perDay[k] || 0; days.push({ d: k, n: perDay[k] || 0, cum }); }

    // who is coming
    const branches = sorted(count(regs, (r) => (r.user.branch || '').trim().toUpperCase() || 'Not given'));
    const branchTop = branches.slice(0, 7); const rest = branches.slice(7).reduce((s, b) => s + b[1], 0); if (rest) branchTop.push(['Other', rest]);
    const yearOrder = ['1st', '2nd', '3rd', '4th', 'Other', 'Not given'];
    const yc = count(regs, (r) => r.user.year || 'Not given');
    const years = yearOrder.filter((y) => yc[y]).map((y) => [y, yc[y]]);

    // check-ins by half hour
    const ci = regs.filter((r) => r.checkedInAt);
    const slots = sorted(count(ci, (r) => { const d = new Date(r.checkedInAt); return `${pad(d.getHours())}:${d.getMinutes() < 30 ? '00' : '30'}`; })).sort((a, b) => a[0].localeCompare(b[0]));

    // answers to the event's own questions
    const qCards = asked.map((q) => {
      const vals = regs.map((r) => (r.answers || {})[q.id]).filter((v) => v !== undefined && v !== '');
      if (q.type === 'radio' || q.type === 'select') {
        const c = sorted(count(regs, (r) => (r.answers || {})[q.id] || 'No answer'));
        return `<section class="an-card"><h4>${esc(q.label)}</h4>${bars(c, total)}</section>`;
      }
      return `<section class="an-card"><h4>${esc(q.label)}</h4>${vals.length ? `<ul class="an-quotes">${vals.slice(0, 8).map((v) => `<li>${esc(v)}</li>`).join('')}</ul>${vals.length > 8 ? `<p class="an-empty">+ ${vals.length - 8} more in the CSV export</p>` : ''}` : '<p class="an-empty">No responses.</p>'}</section>`;
    }).join('');

    return `
      <div class="an-tiles">
        <div class="a-tile"><b>${total}</b><span>Registered${ev.seats ? ` of ${ev.seats}` : ''}</span></div>
        <div class="a-tile"><b>${ev.seats ? pct(total, ev.seats) + '%' : '–'}</b><span>Seats filled</span></div>
        <div class="a-tile"><b>${checked}</b><span>Checked in</span></div>
        <div class="a-tile"><b>${pct(checked, total)}%</b><span>Attendance</span></div>
        <div class="a-tile"><b>${last24}</b><span>Last 24 hours</span></div>
      </div>
      <section class="an-card"><h4>Registrations over time</h4>${timeline(days, ev.seats)}</section>
      <div class="an-grid">
        <section class="an-card"><h4>Branch</h4>${bars(branchTop, total)}</section>
        <section class="an-card"><h4>Year</h4>${bars(years, total)}</section>
        <section class="an-card"><h4>Members and guests</h4>${donut([{ label: 'Members', n: members, color: 'var(--blue)' }, { label: 'Guests', n: guests, color: 'var(--yellow)' }], String(total), 'people')}</section>
        <section class="an-card"><h4>Attendance</h4>${donut([{ label: 'Checked in', n: checked, color: 'var(--green)' }, { label: 'Not yet', n: total - checked, color: '#C9C6D8' }], pct(checked, total) + '%', 'checked in')}</section>
      </div>
      ${slots.length ? `<section class="an-card"><h4>Check-ins by time</h4>${bars(slots.map(([t, n]) => [t, n]), checked)}</section>` : ''}
      ${qCards ? `<h3 class="an-h">Answers to your questions</h3><div class="an-grid">${qCards}</div>` : ''}`;
  }

  window.GDGCharts = { render };
})();
