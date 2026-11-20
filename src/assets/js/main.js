/* GDG GITAM — shared behaviour */
(function () {
  'use strict';
  const CFG = window.GDG_CONFIG || {};
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => Array.from(el.querySelectorAll(s));

  // ---------- storage (safe) ----------
  const store = {
    get(k, d) { try { const v = localStorage.getItem('gdg:' + k); return v ? JSON.parse(v) : d; } catch { return d; } },
    set(k, v) { try { localStorage.setItem('gdg:' + k, JSON.stringify(v)); } catch { /* private mode */ } document.dispatchEvent(new CustomEvent('gdg:store', { detail: { key: k } })); }
  };

  // ---------- toast ----------
  let toastT;
  function toast(msg) {
    const t = $('#toast'); if (!t) return;
    t.textContent = msg; t.classList.add('show');
    clearTimeout(toastT); toastT = setTimeout(() => t.classList.remove('show'), 3200);
  }

  // ---------- modal ----------
  let lastFocus = null;
  function openModal(el) {
    lastFocus = document.activeElement;
    el.classList.add('open'); document.body.style.overflow = 'hidden';
    const f = $('input:not([type=hidden]), select, textarea, button.modal-x', el); f && setTimeout(() => f.focus(), 30);
  }
  function closeModal(el) {
    el.classList.remove('open'); document.body.style.overflow = '';
    lastFocus && lastFocus.focus && lastFocus.focus();
  }
  document.addEventListener('click', (e) => {
    const m = e.target.closest('.modal');
    if (m && (e.target === m || e.target.closest('.modal-x'))) closeModal(m);
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') { $$('.modal.open').forEach(closeModal); closeDrawer(); }
  });
  function closeDrawer() { const d = $('.drawer.open'); if (d) { d.classList.remove('open'); $('.scrim')?.classList.remove('open'); } }

  // ---------- tiny helpers: lazy scripts + QR codes ----------
  const loaded = {};
  function loadScript(src) {
    return loaded[src] || (loaded[src] = new Promise((res, rej) => { const s = document.createElement('script'); s.src = src; s.onload = res; s.onerror = rej; document.head.appendChild(s); }));
  }
  async function qrSvg(text) {
    await loadScript('https://cdnjs.cloudflare.com/ajax/libs/qrcode-generator/1.4.4/qrcode.min.js');
    const q = window.qrcode(0, 'M'); q.addData(text); q.make();
    return q.createSvgTag({ cellSize: 4, margin: 2, scalable: true });
  }
  const esc = (s) => String(s ?? '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  // The auth module (auth.js) resolves this once it knows whether anyone is signed in.
  let authResolve; const authReady = new Promise(r => { authResolve = r; });

  // ---------- busy feedback: a slim top bar while the site talks to the server, a spinner on the button that was pressed ----------
  const busy = (() => {
    let inflight = 0, bar = null, pressed = null, pressedAt = 0, clearT; const marked = new Set();
    const bar_ = () => bar || (bar = Object.assign(document.createElement('div'), { className: 'topbar', role: 'progressbar', ariaLabel: 'Loading' }), document.body.appendChild(bar), bar);
    const btnOf = (t) => t && t.closest && t.closest('button, a.btn, [role="button"]');
    document.addEventListener('click', (e) => { const b = btnOf(e.target); if (b) { pressed = b; pressedAt = Date.now(); } }, true);
    document.addEventListener('submit', (e) => { if (e.submitter) { pressed = e.submitter; pressedAt = Date.now(); } }, true);
    function start() {
      inflight++; clearTimeout(clearT); bar_().classList.add('on');
      // the button that triggered this work (pressed a moment ago) shows a spinner until everything has finished
      if (!marked.size && pressed && pressed.isConnected && Date.now() - pressedAt < 600) { pressed.classList.add('is-loading'); pressed.setAttribute('aria-busy', 'true'); marked.add(pressed); }
    }
    function end() {
      inflight = Math.max(0, inflight - 1);
      if (inflight) return;
      clearTimeout(clearT);
      clearT = setTimeout(() => { if (inflight) return; bar_().classList.remove('on'); marked.forEach((b) => { b.classList.remove('is-loading'); b.removeAttribute('aria-busy'); }); marked.clear(); }, 250);
    }
    // full-screen "please wait" card for things that take a while (signing in)
    function overlay(text) {
      const o = document.createElement('div'); o.className = 'busy-overlay'; o.setAttribute('role', 'status'); o.setAttribute('aria-live', 'polite');
      o.innerHTML = '<div class="busy-card"><i class="spin" aria-hidden="true"></i><span></span></div>'; $('span', o).textContent = text; document.body.appendChild(o);
      return { set(t) { $('span', o).textContent = t; }, close() { o.remove(); } };
    }
    // wrap any promise-returning job: bar + (optional) button spinner
    async function wrap(job, btn) { start(); if (btn) { btn.classList.add('is-loading'); btn.setAttribute('aria-busy', 'true'); } try { return await job(); } finally { if (btn) { btn.classList.remove('is-loading'); btn.removeAttribute('aria-busy'); } end(); } }
    return { start, end, overlay, wrap };
  })();

  // ---------- photos: crop to a square, resize and return a small JPEG data URL (<= ~240 KB) ----------
  async function resizePhoto(file, size = 480) {
    const bmp = await createImageBitmap(file); const side = Math.min(bmp.width, bmp.height);
    const c = document.createElement('canvas'); c.width = c.height = size;
    c.getContext('2d').drawImage(bmp, (bmp.width - side) / 2, (bmp.height - side) / 2, side, side, 0, 0, size, size);
    let q = 0.88, url = c.toDataURL('image/jpeg', q);
    while (url.length * 0.75 > 240000 && q > 0.4) { q -= 0.1; url = c.toDataURL('image/jpeg', q); }
    return url;
  }

  // ---------- submit (backend API, form endpoint or local fallback) ----------
  async function submitData(kind, data) {
    if (CFG.apiBase) {
      const auth = await authReady;
      if (auth && auth.enabled) {
        if (!auth.me || auth.me.user.guest) { auth.openSignIn('Sign in with Google to send this'); throw new Error('Sign in required'); }
        const photo = data.photo_data; const clean = { ...data }; delete clean.photo_data;
        const r = await auth.api('POST', '/applications', photo ? { type: kind, data: clean, photo } : { type: kind, data: clean });
        if (!r.ok) throw new Error((r.data && r.data.error) || 'Request failed');
        if (kind === 'member') await auth.refresh();
        return r.data;
      }
    }
    const payload = { kind, ...data, page: location.pathname, ts: new Date().toISOString() };
    if (CFG.formEndpoint) {
      const res = await fetch(CFG.formEndpoint, { method: 'POST', headers: { 'Content-Type': 'text/plain;charset=utf-8' }, body: JSON.stringify(payload) });
      if (!res.ok) throw new Error('Request failed');
    } else {
      const all = store.get('submissions', []); all.push(payload); store.set('submissions', all);
    }
    return payload;
  }

  function handleForms() {
    $$('form[data-form]').forEach((form) => {
      form.addEventListener('submit', async (e) => {
        if (form.dataset.manual) return; // the page handles this form itself (e.g. guest registration)
        e.preventDefault();
        if (form.dataset.busy) return;
        if (!form.checkValidity()) { form.reportValidity(); return; }
        const kind = form.dataset.form;
        const fd = new FormData(form); const data = {};
        for (const [k, v] of fd.entries()) { if (typeof v !== 'string') continue; data[k] = data[k] ? data[k] + ', ' + v : v; } // files are sent separately (photo_data)
        if (form.honeypot?.value) return; // spam trap
        const btn = $('button[type=submit]', form); const label = btn?.textContent;
        form.dataset.busy = '1'; if (btn) { btn.disabled = true; btn.textContent = 'Sending…'; }
        $('.form-error', form)?.remove();
        try {
          await submitData(kind, data);
          const done = $('.form-done', form);
          if (done) { done.hidden = false; }
          form.dispatchEvent(new CustomEvent('gdg:submitted', { bubbles: true, detail: { kind, data } }));
          if (form.dataset.reset !== 'no') form.reset();
          toast(form.dataset.toast || 'Done! We\'ve got it.');
        } catch (err) {
          const p = document.createElement('p'); p.className = 'form-error';
          p.textContent = 'Something went wrong. Please try again in a moment.'; form.appendChild(p);
        } finally {
          delete form.dataset.busy; if (btn) { btn.disabled = false; btn.textContent = label; }
        }
      });
    });
  }

  // ---------- nav ----------
  function nav() {
    const btn = $('.menu-btn'), n = $('#nav'); if (!btn) return;
    btn.addEventListener('click', () => {
      const open = n.classList.toggle('open'); btn.setAttribute('aria-expanded', open);
    });
    $$('a', n).forEach(a => a.addEventListener('click', () => { n.classList.remove('open'); btn.setAttribute('aria-expanded', false); }));
  }

  // ---------- reveal ----------
  function reveal() {
    const els = $$('.reveal');
    if (!('IntersectionObserver' in window)) { els.forEach(e => e.classList.add('in')); return; }
    const io = new IntersectionObserver((ents) => ents.forEach(en => { if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); } }), { threshold: .12, rootMargin: '0px 0px -40px 0px' });
    els.forEach((e, i) => { e.style.transitionDelay = (e.dataset.delay || ((i % 4) * 70)) + 'ms'; io.observe(e); });
  }

  // ---------- ICS calendar ----------
  function icsFor(ev) {
    const pad = (n) => String(n).padStart(2, '0');
    const [y, m, d] = ev.date.split('-'); const [h, mi] = (ev.time || '10:00').split(':');
    const [eh, emi] = (ev.end || ev.time || '11:00').split(':');
    const start = `${y}${m}${d}T${h}${mi}00`; let endDate = ev.date;
    if (ev.end && ev.end === ev.time) { const dt = new Date(Date.UTC(+y, +m - 1, +d + 1)); endDate = `${dt.getUTCFullYear()}-${pad(dt.getUTCMonth() + 1)}-${pad(dt.getUTCDate())}`; }
    const [ey, em, ed] = endDate.split('-');
    const end = `${ey}${em}${ed}T${eh}${emi}00`;
    return ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//GDG GITAM//EN', 'BEGIN:VEVENT', `UID:${ev.id}@gdg-gitam`, `DTSTAMP:${start}`, `DTSTART;TZID=Asia/Kolkata:${start}`, `DTEND;TZID=Asia/Kolkata:${end}`, `SUMMARY:${ev.title}`, `LOCATION:${ev.venue}`, 'END:VEVENT', 'END:VCALENDAR'].join('\r\n');
  }
  function downloadICS(ev) {
    const blob = new Blob([icsFor(ev)], { type: 'text/calendar' });
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = ev.id + '.ics'; a.click(); setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  }

  function init() {
    document.documentElement.classList.remove('no-js');
    $$('[data-year]').forEach(e => e.textContent = new Date().getFullYear());
    nav(); reveal(); handleForms();
    // Gallery lightbox
    $$('[data-lightbox]').forEach((el) => el.addEventListener('click', () => {
      const lb = $('#lightbox'); if (!lb) return;
      $('.lb-body', lb).innerHTML = el.outerHTML; openModal(lb);
    }));
  }

  window.GDG = { $, $$, store, toast, openModal, closeModal, closeDrawer, submitData, downloadICS, loadScript, qrSvg, esc, authReady, resizePhoto, busy, _authResolve: authResolve };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
