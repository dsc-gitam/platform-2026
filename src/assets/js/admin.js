/* Admin panel: analytics, events, registrations, post-event uploads, QR scanner & points,
   requests (member / volunteer / core / speaker / session / story), users & roles, notifications, publishing.
   Every call is authorised by the API; the UI only hides what a role can't use. */
(function () {
  'use strict';
  const G = window.GDG; const { $, $$, esc } = G;
  const ICON = (n, s) => window.GDG_ICON(n, s || 18);
  const root = $('#a-app');
  let auth, tab = 'overview';

  const TYPES = { MEMBER: 'Members', VOLUNTEER: 'Volunteers', CORE: 'Core team', SPEAKER: 'Speakers', SESSION: 'Session ideas', STORY: 'Stories' };
  const TABS = [
    ['overview', 'Overview', 'chart-column', 'analytics:read'],
    ['events', 'Events', 'calendar', 'registrations:read'],
    ['scan', 'Scan & points', 'scan-line', 'checkin'],
    ['requests', 'Requests', 'send', 'requests:read'],
    ['users', 'Users & roles', 'users', 'users:read'],
    ['notify', 'Notifications', 'bell', 'notify:send'],
    ['publish', 'Publishing', 'refresh-cw', 'content:sync'],
  ];
  const can = (p) => auth.can(p);
  const toast = (m) => G.toast(m);
  const api = async (m, p, b) => { const r = await auth.api(m, '/admin' + p, b, { noToast: true }); if (!r.ok) toast((r.data && r.data.error) || 'Something went wrong'); return r; };
  const fmt = (iso) => iso ? new Date(iso).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }) : '';
  const lines = (s) => String(s || '').split('\n').map((x) => x.trim()).filter(Boolean);

  // ---------- generic dialog ----------
  function dialog(html, onMount) {
    const m = document.createElement('div'); m.className = 'modal a-modal'; m.setAttribute('role', 'dialog'); m.setAttribute('aria-modal', 'true');
    m.innerHTML = `<div class="modal-box"><button class="modal-x" aria-label="Close">×</button>${html}</div>`;
    document.body.appendChild(m);
    const close = () => { G.closeModal(m); setTimeout(() => m.remove(), 250); };
    m.addEventListener('click', (e) => { if (e.target === m || e.target.closest('.modal-x')) setTimeout(() => m.remove(), 250); });
    G.openModal(m); onMount && onMount(m, close); return { m, close };
  }

  // ---------- shell ----------
  function shell() {
    const u = auth.me.user;
    const allowed = TABS.filter((t) => can(t[3]));
    if (!allowed.some((t) => t[0] === tab)) tab = allowed[0][0];
    root.innerHTML = `<div class="a-shell">
      <nav class="a-side" aria-label="Admin sections"><div class="who"><b>${esc(u.name)}</b><small>${esc(u.role.toLowerCase())}</small></div>
        ${allowed.map((t) => `<button data-tab="${t[0]}" aria-current="${t[0] === tab}">${ICON(t[2])} ${t[1]}</button>`).join('')}</nav>
      <div class="a-main" id="a-main"></div></div>`;
    $$('[data-tab]', root).forEach((b) => b.addEventListener('click', () => { tab = b.dataset.tab; stopScan(); shell(); }));
    ({ overview, events, scan, requests, users, notify, publish })[tab]($('#a-main'));
  }

  // ---------- Overview ----------
  async function overview(el) {
    el.innerHTML = '<h2>Overview</h2><p class="loading-row"><i class="spin"></i> Loading…</p>';
    const r = await api('GET', '/stats'); if (!r.ok) return;
    const { totals: t, events, signups, applications } = r.data;
    const max = Math.max(1, ...signups.map((s) => s.n));
    const byType = {}; applications.forEach((a) => { (byType[a.type] ||= { PENDING: 0, APPROVED: 0, REJECTED: 0 })[a.status] = a.n; });
    el.innerHTML = `<h2>Overview</h2>
      <div class="a-tiles">
        <div class="a-tile"><b>${t.users}</b><span>Sign-ups</span></div><div class="a-tile"><b>${t.members}</b><span>Members</span></div>
        <div class="a-tile"><b>${t.registrations}</b><span>Registrations</span></div><div class="a-tile"><b>${t.checkins}</b><span>Check-ins</span></div>
        <div class="a-tile"><b>${t.attendanceRate}%</b><span>Attendance rate</span></div><div class="a-tile"><b>${t.pointsAwarded}</b><span>Points awarded</span></div></div>
      <div class="a-card"><h3>Sign-ups, last 30 days</h3>${signups.length ? `<div class="a-spark" role="img" aria-label="Daily sign-ups">${signups.map((s) => `<span title="${s.d}: ${s.n}" style="height:${Math.max(6, Math.round(s.n / max * 100))}%"></span>`).join('')}</div>` : '<p>No sign-ups yet.</p>'}</div>
      <div class="a-card"><h3>Registrations by event</h3><div class="a-bars">${events.map((e) => `<div class="a-bar"><span>${esc(e.title)}</span><i><b style="width:${Math.min(100, Math.round(e.registered / e.seats * 100))}%"></b><u style="width:${Math.min(100, Math.round(e.checkedIn / e.seats * 100))}%"></u></i><span>${e.registered}/${e.seats} · ${e.checkedIn} in</span></div>`).join('') || '<p>No events yet.</p>'}</div>
        <p class="p-note" style="margin-top:10px"><span class="chip blue">registered</span> <span class="chip green">checked in</span></p></div>
      <div class="a-card"><h3>Requests</h3><div class="a-table-wrap"><table class="a-table"><tr><th>Type</th><th>Pending</th><th>Approved</th><th>Rejected</th></tr>${Object.entries(TYPES).map(([k, v]) => `<tr><td>${v}</td><td>${byType[k]?.PENDING || 0}</td><td>${byType[k]?.APPROVED || 0}</td><td>${byType[k]?.REJECTED || 0}</td></tr>`).join('')}</table></div></div>`;
  }

  // ---------- Events ----------
  async function events(el) {
    el.innerHTML = '<h2>Events</h2><p class="loading-row"><i class="spin"></i> Loading…</p>';
    const r = await api('GET', '/events'); if (!r.ok) return;
    const list = r.data.events;
    el.innerHTML = `<div style="display:flex;justify-content:space-between;align-items:center;gap:12px;flex-wrap:wrap"><h2>Events</h2>${can('events:write') ? `<button class="btn btn-blue btn-sm" id="ev-new">${ICON('plus')} New event</button>` : ''}</div>
      <div class="a-table-wrap"><table class="a-table a-stack"><tr><th>Event</th><th>Date</th><th>Registered</th><th>Status</th><th></th></tr>
      ${list.map((e) => `<tr><td class="st-title"><b>${esc(e.title)}</b><br><small>${esc(e.type)} · ${esc(e.venue)}</small></td><td data-label="Date">${esc(e.date)} <small>${esc(e.time)}</small></td><td data-label="Registered">${e.registered}/${e.seats}</td>
        <td data-label="Status">${e.published ? '' : '<span class="chip">unpublished</span> '}<span class="chip ${e.status === 'PAST' ? '' : 'green'}">${e.status.toLowerCase()}</span> ${e.status === 'PAST' ? `<span class="chip ${e.ready ? 'blue' : 'yellow'}">${e.ready ? 'report live' : 'no report'}</span>` : ''}</td>
        <td class="st-act"><div class="a-actions"><button class="btn btn-ghost btn-sm" data-regs="${e.id}">Registrations</button>${can('events:write') ? `<button class="btn btn-ghost btn-sm" data-edit="${e.id}">Edit</button>` : ''}${can('postevent:write') ? `<button class="btn btn-ghost btn-sm" data-post="${e.id}">Post-event data</button>` : ''}</div></td></tr>`).join('')}</table></div>`;
    const byId = Object.fromEntries(list.map((e) => [e.id, e]));
    const nw = $('#ev-new', el); if (nw) nw.addEventListener('click', () => eventForm(null));
    $$('[data-edit]', el).forEach((b) => b.addEventListener('click', () => eventForm(byId[b.dataset.edit])));
    $$('[data-regs]', el).forEach((b) => b.addEventListener('click', () => registrations(byId[b.dataset.regs])));
    $$('[data-post]', el).forEach((b) => b.addEventListener('click', () => postEvent(byId[b.dataset.post])));
  }

  function eventForm(e) {
    const ev = e || { type: 'workshop', color: 'blue', seats: 100, free: true, published: true, tags: [], speakers: [], questions: [{ id: 'level', label: 'Your experience with this topic', type: 'radio', options: ['Total beginner', 'Tried a bit', 'Pretty comfortable'], required: true }] };
    const sel = (name, opts, v) => `<select name="${name}">${opts.map((o) => `<option${o === v ? ' selected' : ''}>${o}</option>`).join('')}</select>`;
    dialog(`<h3>${e ? 'Edit' : 'New'} event</h3><form class="a-form" id="ev-form" novalidate>
      <div class="field"><label>Title</label><input name="title" required value="${esc(ev.title || '')}"></div>
      <div class="grid2"><div class="field"><label>Type</label>${sel('type', ['meetup', 'workshop', 'studyjam', 'hackathon', 'talk'], ev.type)}</div><div class="field"><label>Colour</label>${sel('color', ['blue', 'red', 'yellow', 'green'], ev.color)}</div></div>
      <div class="grid2"><div class="field"><label>Date</label><input name="date" type="date" required value="${esc(ev.date || '')}"></div><div class="field"><label>Seats</label><input name="seats" type="number" min="1" value="${ev.seats}"></div></div>
      <div class="grid2"><div class="field"><label>Starts</label><input name="time" type="time" required value="${esc(ev.time || '')}"></div><div class="field"><label>Ends</label><input name="endTime" type="time" value="${esc(ev.endTime || '')}"></div></div>
      <div class="field"><label>Venue</label><input name="venue" required value="${esc(ev.venue || '')}"></div>
      <div class="field"><label>Short description</label><textarea name="blurb" required style="min-height:80px">${esc(ev.blurb || '')}</textarea></div>
      <div class="field"><label>Tags <small>(comma separated)</small></label><input name="tags" value="${esc((ev.tags || []).join(', '))}"></div>
      <fieldset><legend>Speakers / hosts</legend><div id="sp-rows"></div><button type="button" class="btn btn-ghost btn-sm" id="sp-add">${ICON('plus')} Add speaker</button><p class="p-note" style="margin:8px 0 0"><small>Leave empty for "Speaker to be announced".</small></p></fieldset>
      <fieldset><legend>Registration questions</legend><div id="q-rows"></div><button type="button" class="btn btn-ghost btn-sm" id="q-add">${ICON('plus')} Add question</button><p class="p-note" style="margin:8px 0 0"><small>Name, email, phone, branch and year come from the member's profile, so ask only what's specific to this event.</small></p></fieldset>
      <label class="check chk-row"><input type="checkbox" name="published"${ev.published ? ' checked' : ''}> Published (visible on the website)</label>
      <p class="form-error" id="ef-err" hidden></p>
      <div class="a-actions"><button class="btn btn-blue" type="submit">Save event</button>${e && can('events:write') ? '<button class="btn btn-sm danger" type="button" id="ev-del">Delete</button>' : ''}</div>
      <p class="p-note" style="margin-top:10px"><small>Saving publishes the change to GitHub, and the site redeploys within a few minutes.</small></p></form>`, (m, close) => {
      const sp = $('#sp-rows', m), qr = $('#q-rows', m);
      const spRow = (s = {}) => { const d = document.createElement('div'); d.className = 'rowx sprow'; d.innerHTML = `<div class="field"><label>Name</label><input data-k="name" value="${esc(s.name || '')}"></div><div class="field"><label>Role</label><input data-k="role" value="${esc(s.role || '')}"></div><button type="button" class="btn btn-ghost btn-sm q-del" aria-label="Remove speaker">${ICON('x')} Remove</button>`; $('.q-del', d).onclick = () => d.remove(); sp.appendChild(d); };
      const qRow = (q = {}) => { const d = document.createElement('div'); d.className = 'rowx qrow'; d.innerHTML = `<div class="field q-label"><label>Question</label><input data-k="label" value="${esc(q.label || '')}"></div><div class="field q-type"><label>Type</label><select data-k="type">${['radio', 'select', 'text', 'textarea'].map((t) => `<option${q.type === t ? ' selected' : ''}>${t}</option>`).join('')}</select></div><div class="field q-opts"><label>Options</label><input data-k="options" placeholder="comma separated" value="${esc((q.options || []).join(', '))}"></div><label class="check q-req"><input type="checkbox" data-k="required"${q.required ? ' checked' : ''}> Required</label><button type="button" class="btn btn-ghost btn-sm q-del" aria-label="Remove question">${ICON('x')} Remove</button>`; $('.q-del', d).onclick = () => d.remove(); qr.appendChild(d); };
      (ev.speakers || []).filter((s) => !s.tba).forEach(spRow); (ev.questions || []).forEach(qRow);
      $('#sp-add', m).onclick = () => spRow(); $('#q-add', m).onclick = () => qRow();
      const del = $('#ev-del', m); if (del) del.onclick = async () => { if (!confirm('Delete this event?')) return; const r = await api('DELETE', '/events/' + ev.id); if (r.ok) { close(); toast('Event deleted'); events($('#a-main')); } };
      $('#ev-form', m).addEventListener('submit', async (x) => {
        x.preventDefault(); const f = x.target; const err = $('#ef-err', m); err.hidden = true;
        const rows = (box, ks) => $$('.rowx', box).map((d) => Object.fromEntries(ks.map((k) => { const i = $(`[data-k=${k}]`, d); return [k, i.type === 'checkbox' ? i.checked : i.value]; })));
        const body = {
          title: f.title.value, type: f.type.value, color: f.color.value, date: f.date.value, time: f.time.value, endTime: f.endTime.value, venue: f.venue.value, seats: f.seats.value, blurb: f.blurb.value,
          tags: f.tags.value.split(',').map((s) => s.trim()).filter(Boolean), published: f.published.checked,
          speakers: rows(sp, ['name', 'role']).filter((s) => s.name), questions: rows(qr, ['label', 'type', 'options', 'required']).filter((q) => q.label).map((q) => ({ ...q, options: q.options.split(',').map((s) => s.trim()).filter(Boolean) })),
        };
        const spk = body.speakers.length ? body.speakers : [{ name: 'Speaker to be announced', role: '', tba: true }]; body.speakers = spk;
        const r = e ? await auth.api('PUT', '/admin/events/' + ev.id, body) : await auth.api('POST', '/admin/events', body);
        if (r.ok) { close(); toast('Saved. Publishing to the site…'); events($('#a-main')); } else { err.textContent = (r.data && r.data.error) || 'Could not save'; err.hidden = false; }
      });
    });
  }

  async function registrations(ev) {
    const r = await api('GET', `/events/${ev.id}/registrations`); if (!r.ok) return;
    const regs = r.data.registrations;
    const checked = regs.filter((x) => x.checkedInAt).length;
    const row = (g) => `<tr><td><b>${esc(g.user.name)}</b>${g.user.guest ? ' <span class="chip">guest</span>' : ''}</td><td>${esc(g.user.regNo || '')}</td><td>${esc(g.user.branch || '')} ${esc(g.user.year || '')}</td><td>${esc(g.user.email)}<br><small>${esc(g.user.phone || '')}</small></td><td><small>${esc(Object.values(g.answers || {}).join(' · '))}</small></td><td>${g.checkedInAt ? '<span class="chip green">in</span>' : '<span class="chip">registered</span>'}</td></tr>`;
    dialog(`<h3>${esc(ev.title)}</h3><p class="p-note" style="margin-top:-6px">${esc(ev.date)} · ${esc(ev.venue)}</p>
      <div class="a-tabs" role="tablist"><button class="chip on" role="tab" aria-pressed="true" data-v="an">Analytics</button><button class="chip" role="tab" aria-pressed="false" data-v="list">Attendees (${regs.length})</button></div>
      <div id="v-an">${window.GDGCharts.render(ev, regs)}</div>
      <div id="v-list" hidden>
        <div class="a-toolbar"><input id="at-q" type="search" placeholder="Search name, email, reg. no." autocomplete="off"><select id="at-f" aria-label="Filter"><option value="">All (${regs.length})</option><option value="in">Checked in (${checked})</option><option value="out">Not checked in (${regs.length - checked})</option></select><button class="btn btn-ghost btn-sm" id="csv">${ICON('send')} Export CSV</button></div>
        <div class="a-table-wrap"><table class="a-table"><thead><tr><th>Name</th><th>Reg. no.</th><th>Branch / year</th><th>Contact</th><th>Answers</th><th>Status</th></tr></thead><tbody id="at-body"></tbody></table></div>
        <p class="p-note" id="at-count"></p>
      </div>`, (m) => {
      const paint = () => {
        const q = $('#at-q', m).value.trim().toLowerCase(), f = $('#at-f', m).value;
        const list = regs.filter((g) => (!f || (f === 'in') === !!g.checkedInAt) && (!q || [g.user.name, g.user.email, g.user.regNo, g.user.branch].some((v) => String(v || '').toLowerCase().includes(q))));
        $('#at-body', m).innerHTML = list.map(row).join('') || '<tr><td colspan="6">No one matches.</td></tr>';
        $('#at-count', m).textContent = `${list.length} of ${regs.length} shown`;
      };
      $$('[data-v]', m).forEach((b) => b.addEventListener('click', () => {
        $$('[data-v]', m).forEach((x) => { const on = x === b; x.classList.toggle('on', on); x.setAttribute('aria-pressed', on); });
        $('#v-an', m).hidden = b.dataset.v !== 'an'; $('#v-list', m).hidden = b.dataset.v !== 'list';
      }));
      $('#at-q', m).addEventListener('input', paint); $('#at-f', m).addEventListener('change', paint); paint();
      $('#csv', m).onclick = () => {
        const head = ['name', 'email', 'phone', 'reg_no', 'branch', 'year', 'type', 'ticket', 'registered_at', 'checked_in_at', 'answers'];
        const q = (v) => '"' + String(v ?? '').replace(/"/g, '""') + '"';
        const csv = [head.join(','), ...regs.map((g) => [g.user.name, g.user.email, g.user.phone, g.user.regNo, g.user.branch, g.user.year, g.user.guest ? 'guest' : 'member', g.ticketCode, g.registeredAt, g.checkedInAt || '', JSON.stringify(g.answers)].map(q).join(','))].join('\n');
        const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' })); a.download = ev.id + '-registrations.csv'; a.click();
      };
    });
  }

  // ---------- Post-event data ----------
  function postEvent(ev) {
    const d = ev.details || {}; const rp = d.report || {};
    dialog(`<h3>Post-event data: ${esc(ev.title)}</h3><form class="a-form" id="pe-form">
      <p class="p-note">Fill in what you have. Anything left empty is left out of the event page and the PDF report. Tick "Publish" to switch on the "Explore this event" page.</p>
      <div class="field"><label>Attendance</label><input name="attendees" placeholder="e.g. 120" value="${esc(d.attendees || '')}"></div>
      <div class="field"><label>About the event <small>(one paragraph per line)</small></label><textarea name="about" style="min-height:100px">${esc((d.about || []).join('\n'))}</textarea></div>
      <div class="field"><label>Key takeaways <small>(one per line)</small></label><textarea name="takeaways" style="min-height:90px">${esc((d.takeaways || []).join('\n'))}</textarea></div>
      <div class="field"><label>Resources <small>(one per line: Label | URL | slides/code/link)</small></label><textarea name="resources" style="min-height:80px">${esc((d.resources || []).map((r) => `${r.label} | ${r.url} | ${r.kind}`).join('\n'))}</textarea></div>
      <div class="grid2"><div class="field"><label>YouTube video ID</label><input name="yt" placeholder="e.g. dQw4w9WgXcQ" value="${esc(d.recording?.youtubeId || '')}"></div><div class="field"><label>Photos <small>(one per line: Caption | image path or URL)</small></label><textarea name="photos" style="min-height:60px">${esc((d.photos || []).map((p) => `${p.label} | ${p.src || ''}`).join('\n'))}</textarea></div></div>
      <fieldset><legend>For the PDF report</legend>
        <div class="field"><label>Stats <small>(one per line: Label | Value)</small></label><textarea name="stats" style="min-height:70px">${esc((rp.stats || []).map((s) => `${s.label} | ${s.value}`).join('\n'))}</textarea></div>
        <div class="field"><label>Highlights <small>(one per line)</small></label><textarea name="highlights" style="min-height:70px">${esc((rp.highlights || []).join('\n'))}</textarea></div>
        <div class="field"><label>Attendee feedback <small>(one per line: Quote | Who)</small></label><textarea name="feedback" style="min-height:70px">${esc((rp.feedback || []).map((f) => `${f.quote} | ${f.by}`).join('\n'))}</textarea></div>
        <div class="grid2"><div class="field"><label>Thank-you note</label><input name="thanks" value="${esc(rp.thanks || '')}"></div><div class="field"><label>Prepared by</label><input name="preparedBy" value="${esc(rp.preparedBy || '')}"></div></div></fieldset>
      <label class="check chk-row"><input type="checkbox" name="ready"${ev.ready ? ' checked' : ''}> Publish the event page and report</label>
      <p class="form-error" id="pe-err" hidden></p><button class="btn btn-blue" type="submit">Save post-event data</button></form>`, (m, close) => {
      $('#pe-form', m).addEventListener('submit', async (x) => {
        x.preventDefault(); const f = x.target; const split = (s) => lines(s).map((l) => l.split('|').map((p) => p.trim()));
        const details = {
          attendees: f.attendees.value, about: lines(f.about.value), takeaways: lines(f.takeaways.value),
          resources: split(f.resources.value).map(([label, url, kind]) => ({ label, url: url || '', kind: kind || 'link' })),
          recording: { youtubeId: f.yt.value.trim(), note: '' },
          photos: split(f.photos.value).map(([label, src], i) => ({ label, src: src || undefined, color: ['blue', 'red', 'yellow', 'green'][i % 4], size: ['wide', 'sq', 'sq', 'tall'][i % 4] })),
          report: { stats: split(f.stats.value).map(([label, value]) => ({ label, value })), highlights: lines(f.highlights.value), feedback: split(f.feedback.value).map(([quote, by]) => ({ quote, by })), thanks: f.thanks.value, preparedBy: f.preparedBy.value },
        };
        const r = await auth.api('PUT', `/admin/events/${ev.id}/details`, { details, ready: f.ready.checked });
        if (r.ok) { close(); toast(f.ready.checked ? 'Saved. Publishing the event page…' : 'Saved'); events($('#a-main')); } else { const e = $('#pe-err', m); e.textContent = (r.data && r.data.error) || 'Could not save'; e.hidden = false; }
      });
    });
  }

  // ---------- Scanner & points ----------
  let stream = null, scanTimer = null, scanned = null;
  function stopScan() { clearInterval(scanTimer); if (stream) stream.getTracks().forEach((t) => t.stop()); stream = null; }
  const PRESETS = [['Speaker question', 10], ['Icebreaker winner', 15], ['Quiz winner', 25], ['Helped others', 10], ['Demo / showcase', 20]];

  function scan(el) {
    scanned = null;
    el.innerHTML = `<h2>Scan & points</h2><div class="a-scan">
      <div><div class="a-video"><video id="scan-v" playsinline muted></video><div class="hint" id="scan-hint">Camera off</div></div>
        <div class="a-actions" style="margin-top:12px"><button class="btn btn-blue btn-sm" id="scan-start">${ICON('camera')} Start camera</button></div>
        <form id="scan-manual" style="margin-top:14px;display:flex;gap:8px"><input id="scan-code" placeholder="or type ticket code" style="flex:1" autocomplete="off"><button class="btn btn-ghost btn-sm" type="submit">Look up</button></form></div>
      <div id="scan-result"><div class="card"><p style="margin:0">Scan an attendee's ticket QR to check them in and award points.</p></div></div></div>`;
    $('#scan-manual', el).addEventListener('submit', (e) => { e.preventDefault(); lookup($('#scan-code', el).value); });
    $('#scan-start', el).addEventListener('click', () => startCamera(el));
  }
  async function startCamera(el) {
    const v = $('#scan-v', el), hint = $('#scan-hint', el);
    try {
      await G.loadScript('https://unpkg.com/jsqr@1.4.0/dist/jsQR.js');
      stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      v.srcObject = stream; await v.play(); hint.textContent = 'Point at a ticket QR';
      const c = document.createElement('canvas'); const x = c.getContext('2d', { willReadFrequently: true });
      scanTimer = setInterval(() => {
        if (v.readyState < 2) return; c.width = v.videoWidth; c.height = v.videoHeight; x.drawImage(v, 0, 0);
        const q = window.jsQR(x.getImageData(0, 0, c.width, c.height).data, c.width, c.height);
        if (q && q.data && /^GDG:/i.test(q.data) && (!scanned || scanned.code !== q.data)) { scanned = { code: q.data }; lookup(q.data); }
      }, 350);
    } catch { hint.textContent = 'Camera unavailable. Type the ticket code instead.'; }
  }
  async function lookup(code) {
    const box = $('#scan-result'); if (!code.trim()) return;
    const r = await auth.api('POST', '/admin/scan', { code });
    if (!r.ok) { box.innerHTML = `<div class="card c-red"><p style="margin:0">${esc((r.data && r.data.error) || 'Ticket not found')}</p></div>`; return; }
    showPerson(r.data, code);
  }
  function showPerson(p, code) {
    const box = $('#scan-result');
    box.innerHTML = `<div class="card c-green"><div class="a-person">${p.user.photoUrl ? `<img src="${esc(p.user.photoUrl)}" alt="" referrerpolicy="no-referrer">` : `<span class="ini">${esc(p.user.name[0])}</span>`}
      <div><h3 style="margin:0">${esc(p.user.name)}</h3><small>${esc(p.user.regNo || '')} ${esc(p.user.branch || '')} ${esc(p.user.year || '')}</small><br><small>${esc(p.event.title)}</small></div></div>
      <p>${p.checkedInAt ? `<span class="chip green">Checked in ${esc(fmt(p.checkedInAt))}</span>` : '<span class="chip yellow">Not checked in yet</span>'} <span class="chip">${p.eventPoints} pts this event</span> <span class="chip blue">${p.totalPoints} pts total</span></p>
      ${!p.checkedInAt ? `<button class="btn btn-blue" id="do-checkin">${ICON('badge-check')} Check in (+10)</button>` : ''}
      ${can('points:award') ? `<h3 style="margin-top:18px">Award points</h3><div class="pts-presets">${PRESETS.map(([l, n]) => `<button class="btn btn-ghost btn-sm" data-pre="${n}" data-reason="${esc(l)}">${esc(l)} +${n}</button>`).join('')}</div>
        <form id="pts-form" class="a-actions" style="align-items:end"><div class="field" style="margin:0"><label>Points</label><input name="points" type="number" min="-50" max="100" value="10" style="width:90px"></div><div class="field" style="margin:0;flex:1"><label>Reason</label><input name="reason" value="Session points"></div><button class="btn btn-ink btn-sm" type="submit">Award</button></form>` : ''}</div>`;
    const ci = $('#do-checkin', box); if (ci) ci.onclick = async () => { const r = await auth.api('POST', '/admin/checkin', { code: p.ticketCode }); if (r.ok) { toast('Checked in'); showPerson(r.data, code); } else toast((r.data && r.data.error) || 'Failed'); };
    $$('[data-pre]', box).forEach((b) => b.addEventListener('click', () => award(p, +b.dataset.pre, b.dataset.reason)));
    const pf = $('#pts-form', box); if (pf) pf.addEventListener('submit', (e) => { e.preventDefault(); award(p, +pf.points.value, pf.reason.value); });
  }
  async function award(p, points, reason) {
    const r = await auth.api('POST', '/admin/points', { code: p.ticketCode, points, reason });
    if (r.ok) { toast(`${points > 0 ? '+' : ''}${points} for ${p.user.name}`); showPerson(r.data, p.ticketCode); } else toast((r.data && r.data.error) || 'Failed');
  }

  // ---------- Requests ----------
  let reqType = 'STORY', reqStatus = 'PENDING';
  async function requests(el) {
    el.innerHTML = `<h2>Requests</h2><div class="a-tabs">${Object.entries(TYPES).map(([k, v]) => `<button class="chip ${k === reqType ? 'on' : ''}" data-type="${k}" aria-pressed="${k === reqType}">${v}</button>`).join('')}</div>
      <div class="a-tabs">${['PENDING', 'APPROVED', 'REJECTED', ''].map((s) => `<button class="chip ${s === reqStatus ? 'on' : ''}" data-status="${s}" aria-pressed="${s === reqStatus}">${s ? s.toLowerCase() : 'all'}</button>`).join('')}</div><div id="req-list"><p class="loading-row"><i class="spin"></i> Loading…</p></div>`;
    $$('[data-type]', el).forEach((b) => b.addEventListener('click', () => { reqType = b.dataset.type; requests(el); }));
    $$('[data-status]', el).forEach((b) => b.addEventListener('click', () => { reqStatus = b.dataset.status; requests(el); }));
    const r = await api('GET', `/applications?type=${reqType}${reqStatus ? '&status=' + reqStatus : ''}`); if (!r.ok) return;
    const list = r.data.applications; const box = $('#req-list', el);
    box.innerHTML = list.length ? list.map((a) => `<article class="a-req" data-id="${a.id}"><header><div style="display:flex;gap:12px;align-items:center">${a.hasPhoto ? `<img class="a-photo" data-photo="${a.id}" alt="" width="64" height="64">` : ''}<div><b>${esc(a.name)}</b> <small>${esc(a.email)}</small><br><small>${esc(fmt(a.createdAt))}</small></div></div>
      <div><span class="chip ${a.status === 'APPROVED' ? 'green' : a.status === 'REJECTED' ? 'red' : 'yellow'}">${a.status.toLowerCase()}</span>${a.featured ? ' <span class="chip blue">featured</span>' : ''}${a.user?.showOnSite ? ' <span class="chip green">on site</span>' : ''}</div></header>
      <dl>${Object.entries(a.data || {}).filter(([k]) => !['name', 'email', 'honeypot'].includes(k)).map(([k, v]) => `<dt>${esc(k.replace(/_/g, ' '))}</dt><dd>${esc(v)}</dd>`).join('')}</dl>
      ${can('requests:review') && a.type !== 'MEMBER' ? `<div class="a-actions">${a.type === 'STORY' ? `<button class="btn btn-blue btn-sm" data-act="feature">Approve & feature on site</button><button class="btn btn-ghost btn-sm" data-act="edit">Edit text</button>` : (a.type === 'CORE' || a.type === 'VOLUNTEER') ? `<button class="btn btn-blue btn-sm" data-act="team">Approve & add to team page</button><button class="btn btn-ghost btn-sm" data-act="approve">Approve only</button>` : '<button class="btn btn-blue btn-sm" data-act="approve">Approve</button>'}<button class="btn btn-sm danger" data-act="reject">Reject</button></div>` : ''}</article>`).join('') : '<div class="card"><p style="margin:0">Nothing here.</p></div>';
    const byId = Object.fromEntries(list.map((a) => [a.id, a]));
    $$('img[data-photo]', box).forEach(async (img) => { img.src = await auth.blobUrl(`/admin/applications/${img.dataset.photo}/photo`); });
    $$('[data-act]', box).forEach((b) => b.addEventListener('click', () => reviewAct(byId[b.closest('.a-req').dataset.id], b.dataset.act, el)));
  }
  async function patch(a, body, el, msg) {
    const r = await api('PATCH', '/applications/' + a.id, body);
    if (r.ok) { toast(r.data.publishing ? (msg || 'Saved. Publishing to GitHub; the site redeploys in a few minutes.') : 'Saved'); requests(el); }
  }
  function reviewAct(a, act, el) {
    if (act === 'approve') return patch(a, { status: 'APPROVED' }, el);
    if (act === 'reject') return patch(a, { status: 'REJECTED', featured: false }, el);
    if (act === 'feature') return patch(a, { status: 'APPROVED', featured: true }, el, 'Story approved. Publishing to GitHub; the site redeploys in a few minutes.');
    if (act === 'edit') {
      const d = a.data || {};
      return dialog(`<h3>Edit story before featuring</h3><form class="a-form" id="st-form">${['before', 'after', 'now', 'batch', 'quote'].map((k) => `<div class="field"><label>${k}</label><textarea name="${k}" style="min-height:60px">${esc(d[k] || '')}</textarea></div>`).join('')}
        <div class="field"><label>Photo ${a.hasPhoto ? '<small>(one was uploaded with the story; choose a file to replace it)</small>' : '<small>(optional)</small>'}</label><div class="photo-pick"><span class="photo-prev" id="ph-prev"></span><div><input id="ph-file" type="file" accept="image/*">${a.hasPhoto ? '<label class="check" style="margin-top:8px"><input type="checkbox" id="ph-remove"> Remove the photo</label>' : ''}</div></div><input type="hidden" id="ph-data"></div>
        <button class="btn btn-blue" type="submit">Save & feature</button></form>`, (m, close) => {
        const prev = $('#ph-prev', m);
        if (a.hasPhoto) auth.blobUrl(`/admin/applications/${a.id}/photo`).then((u) => { prev.style.backgroundImage = `url(${u})`; });
        $('#ph-file', m).addEventListener('change', async (e) => { const f = e.target.files[0]; $('#ph-data', m).value = ''; if (!f) return; try { const url = await G.resizePhoto(f); $('#ph-data', m).value = url; prev.style.backgroundImage = `url(${url})`; } catch { toast('That image could not be read'); } });
        $('#st-form', m).addEventListener('submit', async (e) => {
          e.preventDefault(); const fd = new FormData(e.target); const data = {}; fd.forEach((v, k) => { if (typeof v === 'string' && ['before', 'after', 'now', 'batch', 'quote'].includes(k)) data[k] = v; });
          const photo = $('#ph-data', m).value; const removePhoto = !!($('#ph-remove', m) && $('#ph-remove', m).checked);
          close(); await patch(a, { status: 'APPROVED', featured: true, data, ...(photo ? { photo } : {}), ...(removePhoto && !photo ? { removePhoto: true } : {}) }, el, 'Story saved and featured. Publishing…');
        });
      });
    }
    if (act === 'team') {
      return dialog(`<h3>Add ${esc(a.name)} to the team page</h3><form class="a-form" id="tm-form">
        <div class="field"><label>Title shown on the site</label><input name="title" value="${a.type === 'CORE' ? 'Core Team' : 'Volunteer'}"></div>
        <div class="field"><label>Short bio</label><textarea name="blurb" style="min-height:70px">${esc(a.data?.why || '')}</textarea></div>
        <div class="field"><label>Card colour</label><select name="color"><option>blue</option><option>red</option><option>yellow</option><option>green</option></select></div>
        <p class="p-note">${a.type === 'CORE' ? 'They also get the CORE role (scan tickets, award points).' : ''} Their profile photo and links are used automatically.</p>
        <button class="btn btn-blue" type="submit">Approve & publish</button></form>`, (m, close) => {
        $('#tm-form', m).addEventListener('submit', async (e) => { e.preventDefault(); const team = Object.fromEntries(new FormData(e.target)); close(); await patch(a, { status: 'APPROVED', team }, el, 'Approved. Publishing the team page to GitHub…'); });
      });
    }
  }

  // ---------- Users & roles ----------
  async function users(el) {
    el.innerHTML = `<h2>Users & roles</h2><form id="u-search" style="display:flex;gap:8px;margin-bottom:14px"><input id="u-q" placeholder="Search name or email" style="flex:1"><button class="btn btn-ghost btn-sm">Search</button></form><div id="u-list"><p class="loading-row"><i class="spin"></i> Loading…</p></div>`;
    $('#u-search', el).addEventListener('submit', (e) => { e.preventDefault(); load($('#u-q', el).value); });
    const load = async (q = '') => {
      const r = await api('GET', '/users?q=' + encodeURIComponent(q)); if (!r.ok) return;
      $('#u-list', el).innerHTML = `<div class="a-table-wrap"><table class="a-table a-stack"><tr><th>Person</th><th>Joined</th><th>Team</th><th>Role</th></tr>${r.data.users.map((u) => `<tr><td class="st-title"><b>${esc(u.name)}</b><br><small>${esc(u.email)}</small></td><td data-label="Joined">${esc(fmt(u.createdAt))} <small>${u.onboarded ? 'member' : 'not onboarded'} · ${u._count.registrations} regs</small></td><td data-label="Team">${u.teamKind ? `${esc(u.teamKind.toLowerCase())}${u.showOnSite ? ' · on site' : ''}` : '–'}</td>
        <td data-label="Role">${can('roles:write') ? `<select data-role="${u.id}">${['MEMBER', 'CORE', 'DOCS', 'ORGANIZER', 'ADMIN'].map((r) => `<option${r === u.role ? ' selected' : ''}>${r}</option>`).join('')}</select>` : esc(u.role)}</td></tr>`).join('')}</table></div>
        <p class="p-note" style="margin-top:12px"><b>Roles:</b> MEMBER (no admin access) · CORE (scan tickets, award points) · DOCS (post-event data, analytics) · ORGANIZER (events, requests, notifications, analytics, users) · ADMIN (everything, incl. roles).</p>`;
      $$('[data-role]', el).forEach((s) => s.addEventListener('change', async () => { const r2 = await api('PATCH', `/users/${s.dataset.role}/role`, { role: s.value }); if (r2.ok) toast('Role updated' + (r2.data.claimSynced ? '' : ' (Firebase claim not synced; the database role is authoritative)')); else load($('#u-q', el).value); }));
    };
    load();
  }

  // ---------- Notifications ----------
  async function notify(el) {
    const evs = (await api('GET', '/events')).data?.events || [];
    el.innerHTML = `<h2>Notifications</h2><form class="a-form a-card" id="n-form" style="max-width:640px">
      <div class="field"><label>Title</label><input name="title" maxlength="80" required></div>
      <div class="field"><label>Message</label><textarea name="body" maxlength="200" required style="min-height:70px"></textarea></div>
      <div class="field"><label>Link <small>(optional)</small></label><input name="url" placeholder="https://… or events.html"></div>
      <div class="field"><label>Send to</label><select name="eventId"><option value="">Everyone who enabled notifications</option>${evs.filter((e) => e.status === 'UPCOMING').map((e) => `<option value="${esc(e.id)}">Registered for: ${esc(e.title)}</option>`).join('')}</select></div>
      <button class="btn btn-blue" type="submit">${ICON('send')} Send</button></form>`;
    $('#n-form', el).addEventListener('submit', async (e) => { e.preventDefault(); const r = await api('POST', '/notify', Object.fromEntries(new FormData(e.target))); if (r.ok) toast(`Sent to ${r.data.sent} of ${r.data.recipients} devices`); });
  }

  // ---------- Publishing ----------
  async function publish(el) {
    el.innerHTML = '<h2>Publishing</h2><p class="loading-row"><i class="spin"></i> Loading…</p>';
    const r = await api('GET', '/sync-log'); if (!r.ok) return;
    el.innerHTML = `<h2>Publishing</h2><p class="p-note">Approved stories, team changes, events and profile updates are committed to GitHub automatically, which triggers the site deploy. Use this if you need to force one.</p>
      <p><button class="btn btn-blue" id="sync-now">${ICON('refresh-cw')} Publish now</button></p>
      <div class="a-table-wrap"><table class="a-table"><tr><th>When</th><th>Reason</th><th>Result</th></tr>${r.data.log.map((l) => `<tr><td>${esc(fmt(l.createdAt))}</td><td>${esc(l.reason)}</td><td><span class="chip ${l.ok ? 'green' : 'red'}">${l.ok ? (l.commitSha ? 'committed ' + l.commitSha.slice(0, 7) : 'no changes') : 'failed'}</span><br><small>${esc(l.message || '')}</small></td></tr>`).join('') || '<tr><td colspan="3">Nothing published yet.</td></tr>'}</table></div>`;
    $('#sync-now', el).addEventListener('click', async () => { const x = await api('POST', '/sync'); if (x.ok) { toast(x.data.message); publish(el); } });
  }

  // ---------- boot ----------
  function paint() {
    $('#a-loading').hidden = true;
    const msg = $('#a-msg'); const me = auth && auth.me;
    $('#a-out').hidden = !(auth && auth.enabled && !me);
    msg.hidden = true; root.hidden = true;
    if (auth && !auth.enabled) { msg.hidden = false; msg.innerHTML = '<h3>Backend not connected</h3><p>Set GDG_API_BASE and the Firebase config at build time to use the admin panel.</p>'; return; }
    if (!me) return;
    if (!me.user.perms.length) { msg.hidden = false; msg.innerHTML = `<h3>No admin access</h3><p>Your account (${esc(me.user.email)}) doesn't have a role yet. Ask an admin to give you one.</p>`; return; }
    root.hidden = false; shell();
  }
  G.authReady.then((a) => {
    auth = a; paint(); if (a && a.enabled) a.on(() => { if (!root.hidden && a.me) return; paint(); });
    const g = $('#a-out [data-google]'); if (g) g.addEventListener('click', () => a.openSignIn());
  });
})();
