/* Tickets: QR ticket dialog + "Access ticket" buttons for events the member registered for. */
(function () {
  'use strict';
  const G = window.GDG; const { $, $$, esc } = G;

  const fmtDate = (iso) => new Date(iso + 'T00:00:00').toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });
  const todayLocal = () => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`; };

  function modal() {
    let m = $('#ticket-modal'); if (m) return m;
    m = document.createElement('div'); m.className = 'modal'; m.id = 'ticket-modal'; m.setAttribute('role', 'dialog'); m.setAttribute('aria-modal', 'true'); m.setAttribute('aria-labelledby', 'tk-title');
    m.innerHTML = '<div class="modal-box ticket-box"><button class="modal-x" aria-label="Close">×</button><div id="tk-body"></div></div>';
    document.body.appendChild(m); return m;
  }

  // reg = { eventId, ticketCode, event: { id, title, date, time, endTime, venue, color } }
  G.openTicket = async function openTicket(reg, user) {
    const m = modal(); const e = reg.event;
    const svg = await G.qrSvg('GDG:' + reg.ticketCode).catch(() => '');
    $('#tk-body', m).innerHTML = `
      <div class="ticket c-${esc(e.color || 'blue')}">
        <div class="tk-top"><span class="chip ${esc(e.color || 'blue')}">Your ticket</span><h3 id="tk-title">${esc(e.title)}</h3>
          <ul class="tk-meta"><li>${window.GDG_ICON('calendar', 16)} ${esc(fmtDate(e.date))}</li><li>${window.GDG_ICON('clock', 16)} ${esc(e.time)}${e.endTime && e.endTime !== e.time ? '–' + esc(e.endTime) : ''}</li><li>${window.GDG_ICON('map-pin', 16)} ${esc(e.venue)}</li></ul></div>
        <div class="tk-cut" aria-hidden="true"></div>
        <div class="tk-qr"><div class="tk-qr-img" role="img" aria-label="Ticket QR code">${svg}</div>
          <code>${esc(reg.ticketCode)}</code>${user ? `<p>${esc(user.name)}</p>` : ''}
          <small>Show this at the registration desk. The organizer scans it to check you in.</small></div>
      </div>
      <div class="tk-actions"><button class="btn btn-yellow btn-sm" id="tk-cal">${window.GDG_ICON('calendar-check', 18)} Add to calendar</button><a class="btn btn-ghost btn-sm" href="profile.html#tickets">All my tickets</a></div>`;
    $('#tk-cal', m).addEventListener('click', () => G.downloadICS({ id: e.id, title: e.title, date: e.date, time: e.time, end: e.endTime || e.time, venue: e.venue, blurb: '' }));
    G.openModal(m);
  };

  // Home / events: turn "Save your seat" into "Access ticket" for registered members.
  function paintButtons(me) {
    const today = todayLocal();
    $$('[data-ticket-event]').forEach((el) => {
      const label = $('[data-ticket-label]', el) || el;
      if (!el.dataset.orig) { el.dataset.orig = label.innerHTML; const a = $('svg.arr', label); el.dataset.arrow = a ? a.outerHTML : ''; }
      const arrow = el.dataset.arrow || '';
      const reg = me && me.registrations.find((r) => r.eventId === el.dataset.ticketEvent);
      el.onclick = null;
      const pill = (on) => { if (label !== el) label.classList.toggle('pill', on); };
      if (!reg) { pill(true); label.innerHTML = el.dataset.orig; if (el.dataset.href) el.setAttribute('href', el.dataset.href); return; }
      if (!el.dataset.href) el.dataset.href = el.getAttribute('href') || '';
      if (el.dataset.ticketDate === today) {
        pill(true);
        label.innerHTML = `${window.GDG_ICON('ticket', 18)} Access ticket ${arrow}`;
        el.setAttribute('href', 'profile.html#tickets');
        el.onclick = (ev) => { ev.preventDefault(); G.openTicket(reg, me.user); };
      } else {
        pill(false);
        label.innerHTML = `${window.GDG_ICON('check', 18)} You're registered ${arrow}`;
        el.setAttribute('href', 'profile.html#tickets');
      }
    });
  }

  G.authReady.then((auth) => { if (!auth || !auth.enabled) return; paintButtons(auth.me); auth.on(paintButtons); });
})();
