/* Events: filtering, registration (one-click for members, full form for guests), seat meter, calendar export */
(function () {
  'use strict';
  const G = window.GDG; const { $, $$, store, openModal, closeModal, downloadICS, esc } = G;
  const events = JSON.parse($('#events-data').textContent);
  const byId = Object.fromEntries(events.map(e => [e.id, e]));
  const modal = $('#reg-modal'), form = $('#reg-guest'), wrap = $('#reg-form-wrap'), success = $('#reg-success');
  const gate = $('#reg-gate'), pending = $('#reg-pending'), memberBox = $('#reg-member'), quick = $('#reg-quick');
  let current = null, auth = null;

  // Filters
  $$('[data-filter]').forEach(btn => btn.addEventListener('click', () => {
    const f = btn.dataset.filter;
    $$('[data-filter]').forEach(b => { const on = b === btn; b.classList.toggle('on', on); b.setAttribute('aria-pressed', on); });
    let shown = 0;
    $$('#ev-list .event').forEach(c => { const ok = f === 'all' || c.dataset.type === f; c.hidden = !ok; if (ok) shown++; });
    $('#ev-empty').hidden = shown > 0;
  }));

  // Seat meter: real totals from the API when it is available, otherwise this device's registrations
  let taken = null;
  const localRegs = () => store.get('regs', {});
  function paintSeats() {
    events.forEach(e => {
      const n = Math.min(e.seats, taken ? (taken[e.id] || 0) : (localRegs()[e.id] || 0));
      const bar = $(`[data-seats="${e.id}"]`), lab = $(`[data-seatlabel="${e.id}"]`);
      if (bar) bar.style.width = Math.round((n / e.seats) * 100) + '%';
      if (lab) lab.textContent = n >= e.seats ? 'Full' : n ? `${e.seats - n} of ${e.seats} seats left` : `${e.seats} seats`;
    });
  }
  paintSeats();
  async function loadSeats() {
    if (!auth || !auth.enabled) return;
    const r = await auth.api('GET', '/seats'); if (r.ok) { taken = r.data; paintSeats(); }
  }

  // ---- event-specific questions (everything else comes from the member's profile) ----
  function renderQuestions(list) {
    const box = $('#reg-questions'); box.innerHTML = '';
    (list || []).forEach((q, i) => {
      const id = 'q-' + q.id, req = q.required ? ' required' : '';
      let ctl = '';
      if (q.type === 'radio') ctl = `<div class="choice">${(q.options || []).map((o, j) => `<input type="radio" id="${id}-${j}" name="${esc(q.id)}" value="${esc(o)}"${req}${j === 0 && q.required ? ' checked' : ''}><label for="${id}-${j}">${esc(o)}</label>`).join('')}</div>`;
      else if (q.type === 'select') ctl = `<select id="${id}" name="${esc(q.id)}"${req}><option value="">Select…</option>${(q.options || []).map(o => `<option>${esc(o)}</option>`).join('')}</select>`;
      else if (q.type === 'textarea') ctl = `<textarea id="${id}" name="${esc(q.id)}" style="min-height:70px"${req}></textarea>`;
      else ctl = `<input id="${id}" name="${esc(q.id)}"${req}>`;
      const div = document.createElement('div'); div.className = 'field';
      div.innerHTML = `<label${q.type === 'radio' ? '' : ` for="${id}"`}>${esc(q.label)}${q.required ? '' : ' <small>(optional)</small>'}</label>${ctl}`;
      box.appendChild(div);
    });
  }

  // Which version of the dialog applies: signed-in member, signed-in but not yet a member, or guest
  function decide() {
    const me = auth && auth.enabled ? auth.me : null;
    const signedIn = !!me, member = signedIn && me.user.onboarded;
    gate.hidden = !(auth && auth.enabled && !signedIn);
    pending.hidden = !(signedIn && !member);
    memberBox.hidden = !member;
    form.hidden = signedIn; // guests keep the classic form; members never see the big form
    if (member) {
      const u = me.user;
      $('#reg-who').innerHTML = `<div class="who">${u.photoUrl ? `<img src="${esc(u.photoUrl)}" alt="" width="40" height="40" referrerpolicy="no-referrer">` : ''}<div><b>${esc(u.name)}</b><small>${esc(u.email)}</small></div><a class="link" href="profile.html">Edit details</a></div><p class="reg-hint">We'll use your profile details. Just answer the question${(current.questions || []).length === 1 ? '' : 's'} below.</p>`;
      renderQuestions(current.questions);
      const already = me.registrations.find(r => r.eventId === current.id);
      if (already) showSuccess(already.ticketCode, true);
    }
  }

  function open(id) {
    current = byId[id]; if (!current) return;
    $('#reg-title').textContent = current.title;
    $('#reg-sub').textContent = `${current.date} · ${current.time} · ${current.venue}`;
    form.elements.event_id.value = current.id; form.elements.event_title.value = current.title;
    wrap.hidden = false; success.hidden = true; $('.form-done', form).hidden = true; $('#reg-quick-error').hidden = true;
    const saved = store.get('profile', {});
    ['name', 'email', 'phone', 'reg_no', 'year', 'branch'].forEach(k => { if (saved[k] && form.elements[k]) form.elements[k].value = saved[k]; });
    history.replaceState(null, '', '#' + id);
    decide(); openModal(modal);
  }

  async function showSuccess(code, already) {
    wrap.hidden = true; success.hidden = false;
    $('#reg-success-msg').textContent = already ? "You're already registered. Here is your ticket." : "You're registered! Show this QR at the desk. It's also saved in your profile.";
    const t = $('#reg-ticket'); t.hidden = false;
    const svg = await G.qrSvg('GDG:' + code).catch(() => '');
    t.innerHTML = `<div class="tk-qr-img" role="img" aria-label="Ticket QR code">${svg}</div><code>${esc(code)}</code>`;
    $('#reg-after').textContent = 'View my tickets'; $('#reg-after').setAttribute('href', 'profile.html#tickets');
  }

  document.addEventListener('click', (e) => {
    const b = e.target.closest('.js-register'); if (b) open(b.dataset.id);
    const g = e.target.closest('#reg-gate [data-google]'); if (g && auth) auth.openSignIn('Sign in with Google to register in one click.');
  });

  // member one-click registration
  quick.addEventListener('submit', async (e) => {
    e.preventDefault();
    const err = $('#reg-quick-error'); err.hidden = true;
    if (!quick.checkValidity()) { quick.reportValidity(); return; }
    const answers = {}; new FormData(quick).forEach((v, k) => { answers[k] = v; });
    const btn = $('button[type=submit]', quick); btn.disabled = true;
    const r = await auth.api('POST', `/me/events/${current.id}/register`, { answers });
    btn.disabled = false;
    if (r.ok) { await auth.refresh(); loadSeats(); showSuccess(r.data.ticketCode, false); G.toast("You're registered!"); return; }
    if (r.data && r.data.code === 'NOT_ONBOARDED') { try { sessionStorage.setItem('gdg:next', location.href); } catch { /* ignore */ } location.href = 'join.html#member'; return; }
    err.textContent = (r.data && r.data.error) || 'Could not register. Please try again.'; err.hidden = false;
  });

  // guest registration (classic form)
  form.addEventListener('gdg:submitted', () => {
    const p = {}; ['name', 'email', 'phone', 'reg_no', 'year', 'branch'].forEach(k => p[k] = form.elements[k].value); store.set('profile', p);
    const r = localRegs(); r[current.id] = (r[current.id] || 0) + 1; store.set('regs', r); paintSeats();
    wrap.hidden = true; success.hidden = false; $('#reg-ticket').hidden = true;
    $('#reg-success-msg').textContent = "We'll email you reminders. Add it to your calendar so it doesn't slip by.";
  });
  $('#add-cal').addEventListener('click', () => current && downloadICS(current));

  G.authReady.then((a) => {
    auth = a; loadSeats();
    if (a && a.enabled) a.on(() => { if (modal.classList.contains('open') && !wrap.hidden) decide(); });
    // Deep link: events.html#event-id opens the card
    if (location.hash && byId[location.hash.slice(1)]) {
      const el = document.getElementById(location.hash.slice(1)); el && el.scrollIntoView({ block: 'center' });
      el && el.animate([{ boxShadow: '5px 5px 0 #4285F4' }, { boxShadow: '5px 5px 0 #1D1B26' }], { duration: 1400 });
    }
  });
})();
