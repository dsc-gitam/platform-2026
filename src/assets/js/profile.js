/* Profile: tickets & QR, points, badges, leaderboard, exploration, details and photo upload */
(function () {
  'use strict';
  const G = window.GDG; const { $, $$, esc } = G;
  const roles = Object.fromEntries(JSON.parse($('#roles-data').textContent).map(r => [r.id, r]));
  const placeNames = JSON.parse($('#paths-names').textContent);
  const root = $('#p-app');
  const ICON = (n, s) => window.GDG_ICON(n, s || 20);
  const fmtDate = (iso) => new Date(iso + 'T00:00:00').toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });
  const initials = (n) => (n || '?').split(/\s+/).map(w => w[0]).slice(0, 2).join('').toUpperCase();
  const teamLinks = JSON.parse($('#team-links').textContent);
  // People already on the team page have their links in the site data; use them until the account has its own.
  const fromTeam = (u) => teamLinks.find(t => t.name.trim().toLowerCase() === (u.name || '').trim().toLowerCase()) || {};
  let auth;

  function ticketCard(r, me) {
    const e = r.event; const today = me.today;
    const live = e.date >= today && !r.checkedInAt;
    return `<article class="card event c-${esc(e.color)}">
      <div class="date-block"><b>${esc(e.date.slice(8))}</b><span>${new Date(e.date + 'T00:00:00').toLocaleString('en', { month: 'short' })}</span></div>
      <div><h3>${esc(e.title)}</h3><div class="ev-meta"><span>${esc(e.time)}</span><span>${esc(e.venue)}</span>${r.checkedInAt ? '<span class="chip green">Attended</span>' : ''}</div></div>
      <div class="ev-act">${live ? `<button class="btn btn-ink btn-sm" data-ticket="${esc(r.eventId)}">${ICON('qr-code', 18)} Show ticket</button>` : `<span class="chip">${r.checkedInAt ? 'Checked in' : 'Past'}</span>`}</div>
    </article>`;
  }

  function render(me) {
    const u = me.user;
    const today = me.today;
    const upcoming = me.registrations.filter(r => r.event.date >= today && !r.checkedInAt).sort((a, b) => a.event.date.localeCompare(b.event.date));
    const past = me.registrations.filter(r => !(r.event.date >= today && !r.checkedInAt));
    const earned = new Set(me.badges.map(b => b.id));
    const atlas = me.exploration.atlas || {}, quiz = me.exploration.quiz || {};
    const place = placeNames[quiz.result];
    const inTop = me.leaderboard.some(l => l.userId === u.id);
    const tl = fromTeam(u);
    const missing = [!u.year && 'year', !u.branch && 'branch', !u.regNo && 'registration number', !u.phone && 'WhatsApp number'].filter(Boolean);
    const li = u.linkedin || tl.linkedin || '', gh = u.github || tl.github || '';

    root.innerHTML = `
    <div class="p-head card c-blue">
      <div class="p-avatar">${u.photoUrl ? `<img src="${esc(u.photoUrl)}" alt="" width="96" height="96" referrerpolicy="no-referrer">` : `<span>${esc(initials(u.name))}</span>`}
        <label class="p-photo" title="Change photo">${ICON('camera', 16)}<input type="file" accept="image/*" id="p-photo-in" hidden></label></div>
      <div class="p-id"><h2>${esc(u.name)}</h2><p>${esc(u.email)}</p>
        <div class="chips">${u.role !== 'MEMBER' ? `<span class="chip blue">${esc(u.role.toLowerCase())}</span>` : ''}${u.teamKind ? `<span class="chip green">on the team page</span>` : ''}${u.perms.length ? '<a class="chip yellow" href="admin.html">Admin panel →</a>' : ''}</div></div>
      <div class="p-stats">
        <div><b>${me.points}</b><span>Points</span></div>
        <div><b>${me.rank ? '#' + me.rank : '–'}</b><span>Rank</span></div>
        <div><b>${me.attended.length}</b><span>Attended</span></div>
        <div><b>${me.badges.length}</b><span>Badges</span></div>
      </div>
    </div>

    ${missing.length ? `<div class="card c-yellow p-complete"><div><h3>Finish your profile</h3><p>Add your ${missing.length > 1 ? missing.slice(0, -1).join(', ') + ' and ' + missing[missing.length - 1] : missing[0]} so registering for events takes a single click. <a class="link" href="#details">Complete it below →</a></p></div></div>` : ''}

    <nav class="p-nav" aria-label="Profile sections"><a href="#tickets">Tickets</a><a href="#badges">Badges</a><a href="#leaderboard">Leaderboard</a><a href="#exploration">Exploration</a><a href="#details">Details</a></nav>

    <section id="tickets" class="p-sec"><h2>Your <span class="hl">tickets</span></h2>
      ${upcoming.length ? upcoming.map(r => ticketCard(r, me)).join('') : `<div class="card"><p style="margin:0">No upcoming events yet. <a class="link" href="events.html">Find one to join →</a></p></div>`}
      ${past.length ? `<h3 class="p-sub">Past events</h3>${past.map(r => ticketCard(r, me)).join('')}` : ''}
    </section>

    <section id="badges" class="p-sec"><h2>Badges & <span class="hl">points</span></h2>
      <p class="p-note">Earn points by attending events (+10 each) and from organizers during sessions: asking great questions, winning icebreakers, helping others.</p>
      <div class="badge-grid">${me.allBadges.map(b => `<div class="bdg c-${esc(b.color)} ${earned.has(b.id) ? 'on' : 'off'}"><div class="badge">${ICON(b.icon, 24)}</div><b>${esc(b.name)}</b><small>${esc(b.desc)}</small></div>`).join('')}</div>
    </section>

    <section id="leaderboard" class="p-sec"><h2>The <span class="hl">leaderboard</span></h2>
      ${me.leaderboard.length ? `<ol class="lb">${me.leaderboard.map(l => `<li class="${l.userId === u.id ? 'me' : ''}"><span class="rk">${l.rank}</span>${l.photoUrl ? `<img src="${esc(l.photoUrl)}" alt="" width="36" height="36" referrerpolicy="no-referrer">` : `<span class="ini">${esc(initials(l.name))}</span>`}<b>${esc(l.name)}${l.userId === u.id ? ' (you)' : ''}</b><span class="pts">${l.points} pts</span></li>`).join('')}</ol>
        ${!inTop && me.rank ? `<p class="p-note">You're currently <b>#${me.rank}</b> with ${me.points} points.</p>` : ''}`
        : '<div class="card"><p style="margin:0">No points awarded yet. Come to an event and be the first on the board.</p></div>'}
    </section>

    <section id="exploration" class="p-sec"><h2>Your <span class="hl">exploration</span></h2>
      <div class="grid g2">
        <div class="card c-yellow"><h3>Find your place</h3>${place ? `<p style="margin:0 0 10px">You matched: <b>${esc(place.name)}</b>.</p><a class="link" href="join.html#${esc(place.tab)}">${esc(place.cta)} →</a>` : `<p style="margin:0">You haven't taken the quiz yet.</p><a class="link" href="index.html#find-your-place">Take the 1-minute quiz →</a>`}</div>
        <div class="card c-green"><h3>Tech Atlas</h3>
          ${(atlas.saved || []).length ? `<p style="margin:0 0 10px">Roles you saved:</p><div class="chips">${atlas.saved.map(id => roles[id] ? `<a class="chip green" href="explore.html#${esc(id)}">${esc(roles[id].name)}</a>` : '').join('')}</div>` : `<p style="margin:0">No saved roles yet.</p><a class="link" href="explore.html">Explore the Tech Atlas →</a>`}
          ${(atlas.top || []).length ? `<p style="margin:14px 0 6px"><small>Top matches from your last session</small></p><div class="chips">${atlas.top.map(id => roles[id] ? `<span class="chip">${esc(roles[id].name)}</span>` : '').join('')}</div>` : ''}
        </div>
      </div>
    </section>

    <section id="details" class="p-sec"><h2>Your <span class="hl">details</span></h2>
      <form id="p-form" class="card" novalidate>
        <div class="row2"><div class="field"><label for="pf-name">Full name</label><input id="pf-name" name="name" required value="${esc(u.name)}"></div><div class="field"><label for="pf-phone">WhatsApp number</label><input id="pf-phone" name="phone" type="tel" value="${esc(u.phone || '')}"></div></div>
        <div class="row2"><div class="field"><label for="pf-reg">Registration no.</label><input id="pf-reg" name="regNo" value="${esc(u.regNo || '')}"></div><div class="field"><label for="pf-branch">Branch</label><input id="pf-branch" name="branch" value="${esc(u.branch || '')}"></div></div>
        <div class="row2"><div class="field"><label for="pf-year">Year</label><select id="pf-year" name="year">${['', '1st', '2nd', '3rd', '4th', 'Other'].map(y => `<option${u.year === y ? ' selected' : ''}>${y}</option>`).join('')}</select></div><div class="field"><label for="pf-email">Email</label><input id="pf-email" value="${esc(u.email)}" readonly></div></div>
        <div class="field"><label for="pf-bio">A line about you <small>(shown on the team page if you join the team)</small></label><textarea id="pf-bio" name="bio" maxlength="400" style="min-height:80px">${esc(u.bio || '')}</textarea></div>
        <div class="row2"><div class="field"><label for="pf-li">LinkedIn URL</label><input id="pf-li" name="linkedin" type="url" value="${esc(li)}"></div><div class="field"><label for="pf-gh">GitHub URL</label><input id="pf-gh" name="github" type="url" value="${esc(gh)}"></div></div>
        <p class="form-error" id="pf-err" role="alert" hidden></p>
        <button class="btn btn-blue" type="submit">Save changes</button>
        ${u.showOnSite ? '<p class="p-note" style="margin-top:14px">Your name, photo, bio and links appear on the public team page. Saving updates the website automatically (it can take a few minutes).</p>' : ''}
      </form>
      <p style="margin-top:22px"><button class="btn btn-ghost btn-sm" id="p-signout">${ICON('log-out', 18)} Sign out</button></p>
    </section>`;

    // tickets
    $$('[data-ticket]', root).forEach(b => b.addEventListener('click', () => { const r = me.registrations.find(x => x.eventId === b.dataset.ticket); if (r) G.openTicket(r, u); }));
    $('#p-signout').addEventListener('click', () => auth.signOut());

    // details
    $('#p-form').addEventListener('submit', async (e) => {
      e.preventDefault(); const f = e.target; const err = $('#pf-err'); err.hidden = true;
      if (!f.checkValidity()) { f.reportValidity(); return; }
      const body = Object.fromEntries(new FormData(f)); delete body.email;
      const btn = $('button[type=submit]', f); btn.disabled = true;
      const r = await auth.api('PATCH', '/me', body); btn.disabled = false;
      if (r.ok) { await auth.refresh(); G.toast('Profile saved'); } else { err.textContent = (r.data && r.data.error) || 'Could not save'; err.hidden = false; }
    });

    // photo: resize in the browser to 400x400 JPEG, then upload
    $('#p-photo-in').addEventListener('change', async (e) => {
      const file = e.target.files[0]; if (!file) return;
      try {
        const bmp = await createImageBitmap(file); const s = Math.min(bmp.width, bmp.height);
        const c = document.createElement('canvas'); c.width = c.height = 400;
        c.getContext('2d').drawImage(bmp, (bmp.width - s) / 2, (bmp.height - s) / 2, s, s, 0, 0, 400, 400);
        let q = 0.88, url = c.toDataURL('image/jpeg', q);
        while (url.length * 0.75 > 240000 && q > 0.4) { q -= 0.1; url = c.toDataURL('image/jpeg', q); }
        const r = await auth.api('PUT', '/me/photo', { dataUrl: url });
        if (r.ok) { await auth.refresh(); G.toast('Photo updated'); } else G.toast((r.data && r.data.error) || 'Could not upload photo');
      } catch { G.toast('That image could not be read'); }
    });
  }

  function paint() {
    const me = auth && auth.me;
    $('#p-loading').hidden = true;
    $('#p-off').hidden = !(auth && !auth.enabled);
    $('#p-out').hidden = !(auth && auth.enabled && !me);
    root.hidden = !me;
    if (me) { render(me); if (location.hash) { const t = document.getElementById(location.hash.slice(1)); t && t.scrollIntoView(); } }
  }

  G.authReady.then((a) => {
    auth = a; paint();
    if (a && a.enabled) a.on(paint);
    const so = $('#p-out [data-google]'); if (so) so.addEventListener('click', () => a.openSignIn());
  });
})();
