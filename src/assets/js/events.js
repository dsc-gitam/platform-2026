/* Events: filtering, registration modal, seat meter, calendar export */
(function () {
  'use strict';
  const { $, $$, store, openModal, closeModal, downloadICS } = window.GDG;
  const events = JSON.parse($('#events-data').textContent);
  const byId = Object.fromEntries(events.map(e => [e.id, e]));
  const modal = $('#reg-modal'), form = $('form', modal), wrap = $('#reg-form-wrap'), success = $('#reg-success');
  let current = null;

  // Filters
  $$('[data-filter]').forEach(btn => btn.addEventListener('click', () => {
    const f = btn.dataset.filter;
    $$('[data-filter]').forEach(b => { const on = b === btn; b.classList.toggle('on', on); b.setAttribute('aria-pressed', on); });
    let shown = 0;
    $$('#ev-list .event').forEach(c => { const ok = f === 'all' || c.dataset.type === f; c.hidden = !ok; if (ok) shown++; });
    $('#ev-empty').hidden = shown > 0;
  }));

  // Seat meter — counts registrations made on this device only, until a backend returns real totals
  const regs = () => store.get('regs', {});
  function paintSeats() {
    const r = regs();
    events.forEach(e => {
      const taken = Math.min(e.seats, r[e.id] || 0);
      const bar = $(`[data-seats="${e.id}"]`), lab = $(`[data-seatlabel="${e.id}"]`);
      if (bar) bar.style.width = Math.round((taken / e.seats) * 100) + '%';
      if (lab) lab.textContent = taken ? `${e.seats - taken} of ${e.seats} seats left` : `${e.seats} seats`;
    });
  }
  paintSeats();

  function open(id) {
    current = byId[id]; if (!current) return;
    $('#reg-title').textContent = current.title;
    $('#reg-sub').textContent = `${current.date} · ${current.time} · ${current.venue}`;
    form.elements.event_id.value = current.id; form.elements.event_title.value = current.title;
    wrap.hidden = false; success.hidden = true; $('.form-done', form).hidden = true;
    // remember details between registrations
    const saved = store.get('profile', {});
    ['name', 'email', 'phone', 'reg_no', 'year', 'branch'].forEach(k => { if (saved[k] && form.elements[k]) form.elements[k].value = saved[k]; });
    history.replaceState(null, '', '#' + id);
    openModal(modal);
  }

  document.addEventListener('click', (e) => { const b = e.target.closest('.js-register'); if (b) open(b.dataset.id); });
  form.addEventListener('gdg:submitted', () => {
    const p = {}; ['name', 'email', 'phone', 'reg_no', 'year', 'branch'].forEach(k => p[k] = form.elements[k].value); store.set('profile', p);
    const r = regs(); r[current.id] = (r[current.id] || 0) + 1; store.set('regs', r); paintSeats();
    wrap.hidden = true; success.hidden = false;
  });
  $('#add-cal').addEventListener('click', () => current && downloadICS(current));

  // Deep link: events.html#event-id opens the card
  if (location.hash && byId[location.hash.slice(1)]) {
    const el = document.getElementById(location.hash.slice(1)); el && el.scrollIntoView({ block: 'center' });
    el && el.animate([{ boxShadow: '5px 5px 0 #4285F4' }, { boxShadow: '5px 5px 0 #1D1B26' }], { duration: 1400 });
  }
})();
