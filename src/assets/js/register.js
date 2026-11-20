/* Registration dialog (Home + Events): one click for members, a short form for guests, "Already have a ticket?" access.
   Pages that include the dialog also embed the upcoming events as JSON in #events-data. */
(function () {
  'use strict';
  const G = window.GDG; const { $, $$, store, openModal, closeModal, downloadICS, esc } = G;
  const dataEl = $('#events-data'), modal = $('#reg-modal');
  if (!dataEl || !modal) return;
  const events = JSON.parse(dataEl.textContent);
  const byId = Object.fromEntries(events.map(e => [e.id, e]));
  const form = $('#reg-guest'), wrap = $('#reg-form-wrap'), success = $('#reg-success');
  const gate = $('#reg-gate'), pending = $('#reg-pending'), memberBox = $('#reg-member'), quick = $('#reg-quick');
  let current = null, auth = null;
  const tell = (extra) => document.dispatchEvent(new CustomEvent('gdg:registered', { detail: { eventId: current.id, ...extra } }));

  // ---- event-specific questions (everything else comes from the member's profile) ----
  function renderQuestions(list, box = $('#reg-questions'), pre = 'q') {
    box.innerHTML = '';
    (list || []).forEach((q, i) => {
      const id = pre + '-' + q.id, req = q.required ? ' required' : '';
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

  // First registration: Google gave us name, email and photo; ask for the rest once (year is required) and save it to the profile.
  const PROFILE_KEYS = ['year', 'branch', 'reg_no', 'phone'];
  function renderProfile(u) {
    const box = $('#reg-profile'); box.innerHTML = '';
    box.hidden = !u || !!u.year; // already complete: nothing to ask
    if (box.hidden) return;
    box.innerHTML = `<p class="reg-hint" style="margin-bottom:12px">A few details so we can run the event well. You'll only be asked once.</p>
      <div class="row2"><div class="field"><label for="rp-year">Year</label><select id="rp-year" name="year" required><option value="">Select…</option>${['1st', '2nd', '3rd', '4th', 'Other'].map(y => `<option${u.year === y ? ' selected' : ''}>${y}</option>`).join('')}</select></div>
      <div class="field"><label for="rp-branch">Branch / department <small>(optional)</small></label><input id="rp-branch" name="branch" placeholder="e.g. CSE, ECE, B.Des" value="${esc(u.branch || '')}"></div></div>
      <div class="row2"><div class="field"><label for="rp-reg">Registration no. <small>(optional)</small></label><input id="rp-reg" name="reg_no" value="${esc(u.regNo || '')}"></div>
      <div class="field"><label for="rp-phone">WhatsApp number <small>(optional)</small></label><input id="rp-phone" name="phone" type="tel" value="${esc(u.phone || '')}"></div></div>`;
  }

  // Which version of the dialog applies: signed-in member, guest with a saved session, signed-in but not yet a member, or new guest
  function decide() {
    const me = auth && auth.enabled ? auth.me : null;
    const signedIn = !!me, guest = signedIn && me.user.guest, member = signedIn && (guest ? !!me.user.email : true);
    gate.hidden = !(auth && auth.enabled && !signedIn);
    pending.hidden = true;
    memberBox.hidden = !member;
    form.hidden = member || (signedIn && !guest);
    $('#reg-have').hidden = !(auth && auth.enabled && (!signedIn || guest));
    renderQuestions(current.questions, $('#reg-guest-q'), 'g');
    const have = signedIn && me.registrations.find(r => r.eventId === current.id);
    if (have && !member) { showSuccess(have.ticketCode, true, false); return; } // e.g. a guest ticket just claimed with an email link
    if (member) {
      const u = me.user;
      $('#reg-who').innerHTML = `<div class="who">${u.photoUrl ? `<img src="${esc(u.photoUrl)}" alt="" width="40" height="40" referrerpolicy="no-referrer">` : ''}<div><b>${esc(u.name)}</b><small>${esc(u.email)}${guest ? ' · guest' : ''}</small></div>${guest ? '' : '<a class="link" href="profile.html">Edit details</a>'}</div><p class="reg-hint">We'll use ${guest ? 'the details you gave earlier' : 'your profile details'}. Just answer the question${(current.questions || []).length === 1 ? '' : 's'} below.</p>`;
      renderProfile(guest ? null : u);
      renderQuestions(current.questions);
      const already = me.registrations.find(r => r.eventId === current.id);
      if (already) showSuccess(already.ticketCode, true, guest);
    }
  }

  function open(id) {
    current = byId[id]; if (!current) return;
    $('#reg-title').textContent = current.title;
    $('#reg-sub').textContent = `${current.date} · ${current.time} · ${current.venue}`;
    form.elements.event_id.value = current.id; form.elements.event_title.value = current.title;
    wrap.hidden = false; success.hidden = true; $('.form-done', form).hidden = true; $('#reg-quick-error').hidden = true;
    $('#reg-access-form').hidden = true; $('#reg-access-msg').hidden = true;
    const saved = store.get('profile', {});
    ['name', 'email', 'phone', 'reg_no', 'year', 'branch'].forEach(k => { if (saved[k] && form.elements[k]) form.elements[k].value = saved[k]; });
    history.replaceState(null, '', '#' + id);
    decide(); openModal(modal);
  }

  async function showSuccess(code, already, guest) {
    wrap.hidden = true; success.hidden = false;
    $('#reg-success-msg').textContent = already ? "You're already registered. Here is your ticket."
      : guest ? "You're registered! Show this QR at the desk. It's saved on this device; to open it elsewhere, use \"Already have a ticket?\" with the email you just entered."
      : "You're registered! Show this QR at the desk. It's also saved in your profile.";
    const t = $('#reg-ticket'); t.hidden = false;
    const svg = await G.qrSvg('GDG:' + code).catch(() => '');
    t.innerHTML = `<div class="tk-qr-img" role="img" aria-label="Ticket QR code">${svg}</div><code>${esc(code)}</code>`;
    $('#reg-after').textContent = 'View my tickets'; $('#reg-after').setAttribute('href', 'profile.html#tickets');
  }

  document.addEventListener('click', (e) => {
    const b = e.target.closest('.js-register'); if (b && byId[b.dataset.id]) { e.preventDefault(); open(b.dataset.id); }
    const g = e.target.closest('#reg-gate [data-google]'); if (g && auth) auth.openSignIn('Sign in with Google to register in one click.');
  });

  // member one-click registration
  quick.addEventListener('submit', async (e) => {
    e.preventDefault();
    const err = $('#reg-quick-error'); err.hidden = true;
    if (!quick.checkValidity()) { quick.reportValidity(); return; }
    const answers = {}, profile = {}; new FormData(quick).forEach((v, k) => { (PROFILE_KEYS.includes(k) ? profile : answers)[k] = v; });
    const btn = $('button[type=submit]', quick); btn.disabled = true;
    const r = await auth.api('POST', `/me/events/${current.id}/register`, Object.keys(profile).length ? { answers, profile } : { answers });
    btn.disabled = false;
    if (r.ok) { await auth.refresh(); tell(); showSuccess(r.data.ticketCode, false, auth.me.user.guest); G.toast("You're registered!"); return; }
    err.textContent = (r.data && r.data.error) || 'Could not register. Please try again.'; err.hidden = false;
  });

  // guest registration with the backend: anonymous session + details saved on it
  form.addEventListener('submit', async (e) => {
    if (!auth || !auth.enabled) return; // no backend: the classic handler (main.js) takes over
    e.preventDefault();
    const err = $('#reg-guest-error'); err.hidden = true;
    if (!form.checkValidity()) { form.reportValidity(); return; }
    if (form.elements.honeypot.value) return;
    const f = form.elements; const profile = { name: f.name.value, email: f.email.value, phone: f.phone.value, reg_no: f.reg_no.value, year: f.year.value, branch: f.branch.value };
    const answers = {}; new FormData(form).forEach((v, k) => { if (/^g-/.test(k) === false && !(k in profile) && !['event_id', 'event_title', 'honeypot'].includes(k)) answers[k] = v; });
    const btn = $('button[type=submit]', form); btn.disabled = true;
    try {
      await auth.ensureGuest();
      const r = await auth.api('POST', `/me/events/${current.id}/register`, { profile, answers });
      if (r.ok) { store.set('profile', profile); await auth.refresh(); tell(); showSuccess(r.data.ticketCode, false, true); G.toast("You're registered!"); }
      else { err.textContent = (r.data && r.data.error) || 'Could not register. Please try again.'; err.hidden = false; }
    } catch (x) { console.warn(x); err.textContent = 'Could not start a guest session. Please try again.'; err.hidden = false; }
    btn.disabled = false;
  });

  // "Already have a ticket? Access it here": passwordless email link
  $('#reg-access').addEventListener('click', () => { const f = $('#reg-access-form'); f.hidden = !f.hidden; if (!f.hidden) $('#reg-access-email').focus(); });
  $('#reg-access-form').addEventListener('submit', async (e) => {
    e.preventDefault(); const msg = $('#reg-access-msg'); const email = $('#reg-access-email');
    if (!email.checkValidity()) { email.reportValidity(); return; }
    const btn = $('button', e.target); btn.disabled = true; msg.hidden = true;
    try {
      const r = await auth.sendTicketLink(email.value);
      msg.textContent = r.dev ? 'Dev mode: signed in as ' + email.value : `We emailed a sign-in link to ${email.value}. Open it on this device or any other to see your ticket.`;
      if (r.dev) decide();
    } catch (x) { console.warn(x); msg.textContent = 'Could not send the link. Check the email and try again.'; }
    msg.hidden = false; btn.disabled = false;
  });

  // guest registration without a backend (classic form)
  form.addEventListener('gdg:submitted', () => {
    const p = {}; ['name', 'email', 'phone', 'reg_no', 'year', 'branch'].forEach(k => p[k] = form.elements[k].value); store.set('profile', p);
    tell({ local: true });
    wrap.hidden = true; success.hidden = false; $('#reg-ticket').hidden = true;
    $('#reg-success-msg').textContent = "We'll email you reminders. Add it to your calendar so it doesn't slip by.";
  });
  $('#add-cal').addEventListener('click', () => current && downloadICS(current));

  G.authReady.then((a) => {
    auth = a; if (a && a.enabled) form.dataset.manual = '1';
    if (a && a.enabled) a.on(() => { if (modal.classList.contains('open') && !wrap.hidden && current) decide(); });
  });
})();
