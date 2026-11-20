/* Tech Atlas — wander the map, or get guided by interests */
(function () {
  'use strict';
  const { $, $$, store, toast, closeDrawer } = window.GDG;
  const data = JSON.parse($('#atlas-data').textContent);
  const R = Object.fromEntries(data.roles.map(r => [r.id, r]));
  const CL = Object.fromEntries(data.clusters.map(c => [c.id, c]));
  const esc = (s) => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  const map = $('#map'), drawer = $('#drawer'), scrim = $('#scrim'), guide = $('#guide');
  let guided = false, selected = new Set(), social = 1, saved = new Set(store.get('atlas-saved', []));
  let current = null, opener = null;

  // ---------- scoring ----------
  function score(role) {
    if (!selected.size) return 0;
    let got = 0, max = 0;
    selected.forEach(i => { got += (role.traits[i] || 0); max += 3; });
    let s = got / max;
    // teamwork preference: closer to role's social level = small bonus
    s = s * 0.85 + (1 - Math.abs(role.social - social) / 3) * 0.15;
    return Math.round(s * 100);
  }

  // ---------- map ----------
  function renderMap() {
    const scored = Object.fromEntries(data.roles.map(r => [r.id, score(r)]));
    const top = [...data.roles].sort((a, b) => scored[b.id] - scored[a.id]).slice(0, 3).filter(r => scored[r.id] > 0);
    const topIds = new Set(selected.size ? top.map(r => r.id) : []);
    map.classList.toggle('guided', guided && selected.size > 0);
    map.innerHTML = data.clusters.map(c => `
      <div class="cluster ${c.color}" role="group" aria-label="${esc(c.name)}"><h3>${esc(c.name)}</h3><div class="orbs">
      ${data.roles.filter(r => r.cluster === c.id).map((r, i) => {
        const sc = scored[r.id]; const size = guided && selected.size ? (0.8 + sc / 100 * 0.55).toFixed(2) : 1;
        const cls = ['orb', c.color, saved.has(r.id) ? 'saved' : '', guided && selected.size && !topIds.has(r.id) && sc < 40 ? 'dim' : '', topIds.has(r.id) ? 'top' : ''].join(' ');
        return `<button class="${cls}" data-role="${r.id}" style="--s:${size};--d:${(i * 0.7).toFixed(1)}s" aria-label="${esc(r.name)}${guided && selected.size ? ', ' + sc + '% match' : ''}"><span class="og">${GDG_ICON(r.glyph, 30)}</span><span class="on">${esc(r.name.replace(' Developer', ' Dev').replace(' Engineer', ' Eng.'))}</span><span class="pct">${sc}%</span></button>`;
      }).join('')}
      </div></div>`).join('');
    const tl = $('#top-list');
    tl.innerHTML = top.length ? '<b>Top matches:</b> ' + top.map(r => `<button class="chip ${CL[r.cluster].color}" data-role="${r.id}">${esc(r.name)} · ${scored[r.id]}%</button>`).join('') : '<span style="font:500 .85rem var(--mono);color:var(--ink-2)">Pick a few interests above to see your matches.</span>';
    renderTray();
    store.set('atlas-state', { interests: [...selected], mode: guided ? 'guided' : 'free', top: top.map(r => r.id) });
  }

  function renderTray() {
    const tray = $('#tray'); tray.hidden = !saved.size;
    $('#tray-items').innerHTML = [...saved].map(id => `<span class="chip ${CL[R[id].cluster].color}"><button data-role="${id}" style="font:inherit;text-transform:inherit;letter-spacing:inherit">${esc(R[id].name)}</button><button data-unsave="${id}" aria-label="Remove ${esc(R[id].name)}">×</button></span>`).join('');
  }

  // ---------- drawer ----------
  function openRole(id, from) {
    const r = R[id]; if (!r) return; current = id; opener = from || document.activeElement;
    const c = CL[r.cluster]; const sc = score(r);
    drawer.className = 'drawer open c-' + c.color;
    drawer.setAttribute('aria-hidden', 'false');
    drawer.innerHTML = `
      <div class="drawer-head"><button class="modal-x" data-close aria-label="Close">×</button>
        <div class="og">${GDG_ICON(r.glyph, 44)}</div><h2>${esc(r.name)}</h2><p style="margin:0">${esc(r.tagline)}</p>
        <div style="display:flex;gap:8px;margin-top:12px;flex-wrap:wrap"><span class="chip ${c.color}">${esc(c.name)}</span>${guided && selected.size ? `<span class="chip">${sc}% match for you</span>` : ''}</div>
      </div>
      <div class="drawer-body">
        <section><h4>A day in this life</h4><ul class="dlist">${r.day.map(d => `<li>${esc(d)}</li>`).join('')}</ul></section>
        <section><h4>What it takes</h4>${r.skills.map(([n, l]) => `<div class="skill"><span>${esc(n)}</span><span class="pips" aria-label="level ${l} of 3">${[1, 2, 3].map(k => `<i class="${k <= l ? 'on' : ''}"></i>`).join('')}</span></div>`).join('')}</section>
        <section><h4>How to get there</h4><ol class="road">${r.path.map(([w, t]) => `<li><b>${esc(w)}</b>${esc(t)}</li>`).join('')}</ol></section>
        <section><h4>Try this tonight</h4><div class="tonight">${esc(r.tonight)}</div></section>
        <section><h4>Where to start (free)</h4><div class="res">${r.start.map(([n, u]) => `<a href="${esc(u)}" target="_blank" rel="noopener">${esc(n)}</a>`).join('')}</div></section>
        <section><h4>Voices</h4>${r.voices.map(v => `<div class="card" style="padding:18px;box-shadow:var(--shadow-sm)"><blockquote style="--c:var(--${c.color})">${esc(v.quote)}</blockquote><p style="margin:10px 0 0;font:500 .8rem var(--mono);color:var(--ink-3)">${esc(v.name)} · ${esc(v.line)} <span class="sample-tag">Sample</span></p></div>`).join('')}</section>
        <section><h4>How GDG GITAM helps</h4><p style="margin:0">Workshops and a project squad in <a class="link" href="domains.html#${r.domain}">this domain</a>, mentors who've done it, and a community board to ask questions.</p></section>
      </div>
      <div class="drawer-actions">
        <button class="btn ${saved.has(id) ? 'btn-yellow' : 'btn-ink'} btn-sm" data-save="${id}">${saved.has(id) ? '★ Saved' : '☆ Save to shortlist'}</button>
        <a class="btn btn-ghost btn-sm" href="index.html#find-your-place">Plan with GDG</a>
        <a class="btn btn-ghost btn-sm" href="events.html">Find an event</a>
      </div>`;
    scrim.classList.add('open'); history.replaceState(null, '', '#' + id);
    // preventScroll: focusing a button inside the (still sliding) panel must not scroll the clipping layer sideways
    setTimeout(() => $('[data-close]', drawer)?.focus({ preventScroll: true }), 50);
  }
  function close() { drawer.classList.remove('open'); drawer.setAttribute('aria-hidden', 'true'); scrim.classList.remove('open'); history.replaceState(null, '', location.pathname); opener && opener.focus && opener.focus(); }

  // ---------- events ----------
  document.addEventListener('click', (e) => {
    const t = e.target;
    const roleBtn = t.closest('[data-role]'); if (roleBtn) { e.preventDefault(); openRole(roleBtn.dataset.role, roleBtn); return; }
    const open = t.closest('[data-open]'); if (open) { e.preventDefault(); openRole(open.dataset.open, open); return; }
    if (t.closest('[data-close]') || t === scrim) { close(); return; }
    const sv = t.closest('[data-save]');
    if (sv) { toggleSave(sv.dataset.save); openRole(sv.dataset.save, opener); return; }
    const us = t.closest('[data-unsave]'); if (us) { toggleSave(us.dataset.unsave); }
  });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && drawer.classList.contains('open')) close(); });

  function toggleSave(id) {
    saved.has(id) ? (saved.delete(id), toast('Removed from shortlist')) : (saved.add(id), toast('Saved to your shortlist ★'));
    store.set('atlas-saved', [...saved]); renderMap();
  }

  // mode switch
  const mw = $('#mode-wander'), mg = $('#mode-guide');
  function setMode(g) {
    guided = g; mw.setAttribute('aria-pressed', !g); mg.setAttribute('aria-pressed', g); guide.hidden = !g; renderMap();
  }
  mw.addEventListener('click', () => setMode(false)); mg.addEventListener('click', () => setMode(true));
  $('#interest-chips').addEventListener('change', (e) => { e.target.checked ? selected.add(e.target.value) : selected.delete(e.target.value); renderMap(); });
  $('#social').addEventListener('input', (e) => { social = +e.target.value; renderMap(); });

  // deep link #role-id
  renderMap();
  const h = location.hash.slice(1); if (R[h]) openRole(h);
})();
