/* Events page: filters, seat meter, deep links. (Registration itself lives in register.js.) */
(function () {
  'use strict';
  const G = window.GDG; const { $, $$, store } = G;
  const events = JSON.parse($('#events-data').textContent);
  const byId = Object.fromEntries(events.map(e => [e.id, e]));
  let auth = null;

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

  // After a registration (made in the dialog) refresh the meter
  document.addEventListener('gdg:registered', (e) => {
    if (e.detail && e.detail.local) { const r = localRegs(); r[e.detail.eventId] = (r[e.detail.eventId] || 0) + 1; store.set('regs', r); paintSeats(); }
    else loadSeats();
  });

  G.authReady.then((a) => {
    auth = a; loadSeats();
    // Deep link: events.html#event-id highlights the card
    if (location.hash && byId[location.hash.slice(1)]) {
      const el = document.getElementById(location.hash.slice(1)); el && el.scrollIntoView({ block: 'center' });
      el && el.animate([{ boxShadow: '5px 5px 0 #4285F4' }, { boxShadow: '5px 5px 0 #1D1B26' }], { duration: 1400 });
    }
  });
})();
