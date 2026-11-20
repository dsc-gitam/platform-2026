/* Join page: tabs (hash-driven), prefill from query string */
(function () {
  'use strict';
  const { $, $$, store } = window.GDG;
  const tabs = $$('[data-tab]'), ids = tabs.map(t => t.dataset.tab);

  function show(id, push) {
    if (!ids.includes(id)) id = 'member';
    tabs.forEach(t => { const on = t.dataset.tab === id; t.setAttribute('aria-selected', on); t.tabIndex = on ? 0 : -1; });
    $$('.tabpanel').forEach(p => p.hidden = p.id !== 'panel-' + id);
    if (push) history.replaceState(null, '', '#' + id);
  }
  tabs.forEach(t => {
    t.addEventListener('click', () => show(t.dataset.tab, true));
    t.addEventListener('keydown', (e) => {
      const i = ids.indexOf(t.dataset.tab);
      if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') { const n = tabs[(i + (e.key === 'ArrowRight' ? 1 : -1) + tabs.length) % tabs.length]; n.focus(); show(n.dataset.tab, true); }
    });
  });
  show(location.hash.slice(1));
  window.addEventListener('hashchange', () => show(location.hash.slice(1)));

  // Optional photo on the story form: resized in the browser, sent with the story
  $$('input[data-photo-for]').forEach(inp => inp.addEventListener('change', async () => {
    const hidden = document.getElementById(inp.dataset.photoFor), prev = inp.closest('.photo-pick').querySelector('.photo-prev');
    const f = inp.files[0]; hidden.value = ''; prev.style.backgroundImage = 'none';
    if (!f) return;
    try { const url = await window.GDG.resizePhoto(f); hidden.value = url; prev.style.backgroundImage = `url(${url})`; }
    catch { window.GDG.toast('That image could not be read. Try a different photo.'); }
  }));

  // ?role=tech or ?domain=web prefills
  const q = new URLSearchParams(location.search);
  if (q.get('role')) { const s = $('#c-role'); if (s) s.value = q.get('role'); }
  if (q.get('domain')) { const c = $(`#panel-member input[name=domains][id$="-${q.get('domain')}"]`); if (c) c.checked = true; }

  // prefill from saved profile
  const p = store.get('profile', {});
  $$('form[data-form]').forEach(f => {
    ['name', 'email', 'phone', 'reg_no', 'branch', 'year'].forEach(k => { if (p[k] && f.elements[k] && !f.elements[k].value) f.elements[k].value = p[k]; });
    f.addEventListener('gdg:submitted', (e) => {
      const d = e.detail.data; const keep = {}; ['name', 'email', 'phone', 'reg_no', 'branch', 'year'].forEach(k => { if (d[k]) keep[k] = d[k]; });
      store.set('profile', { ...store.get('profile', {}), ...keep });
    });
  });

  // Quiz hand-off: ?from=find shows a hint
  if (q.get('from') === 'find') {
    const hint = document.createElement('p'); hint.className = 'chip yellow'; hint.style.marginBottom = '18px'; hint.textContent = 'Recommended for you from "Find your place"';
    $('.tabs').before(hint);
  }
})();
