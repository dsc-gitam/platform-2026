/* Community board — local-first. Swap `backend` for a real API when forumEndpoint is set. */
(function () {
  'use strict';
  const { $, $$, store, toast } = window.GDG;
  const CFG = window.GDG_CONFIG || {};
  const seed = JSON.parse($('#forum-seed').textContent);
  const CATS = { ask: ['Question', 'red'], show: ['Show & tell', 'green'], idea: ['Idea', 'yellow'], resource: ['Resource', 'blue'] };
  const esc = (s) => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const ago = (iso) => {
    const s = (Date.now() - new Date(iso)) / 1000;
    if (s < 60) return 'just now'; if (s < 3600) return Math.floor(s / 60) + 'm ago'; if (s < 86400) return Math.floor(s / 3600) + 'h ago';
    return new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
  };

  // ----- data layer (local; replace with fetch() to CFG.forumEndpoint later) -----
  const local = { mine: store.get('posts', []), votes: store.get('votes', {}), replies: store.get('replies', {}) };
  const all = () => [...local.mine, ...seed].map(p => ({ ...p, replies: [...(p.replies || []), ...(local.replies[p.id] || [])], votes: p.votes + (local.votes[p.id] ? 1 : 0) }))
    .sort((a, b) => new Date(b.ts) - new Date(a.ts));

  let cat = 'all';
  const list = $('#posts');
  function render() {
    const posts = all().filter(p => cat === 'all' || p.cat === cat);
    if (!posts.length) { list.innerHTML = '<p class="empty">No posts here yet. Be the first!</p>'; return; }
    list.innerHTML = posts.map(p => {
      const [label, color] = CATS[p.cat] || ['Post', 'blue'];
      return `<article class="card post" data-id="${esc(p.id)}">
        <div class="meta"><span class="chip ${color}">${label}</span><span>${esc(p.author)}</span><span>${ago(p.ts)}</span></div>
        <h3>${esc(p.title)}</h3><p style="margin:0;color:var(--ink-2)">${esc(p.body)}</p>
        ${p.replies.length ? `<div class="replies">${p.replies.map(r => `<div class="reply"><b>${esc(r.author)}</b><small>${ago(r.ts)}</small><br>${esc(r.body)}</div>`).join('')}</div>` : ''}
        <div class="post-actions"><button class="vote ${local.votes[p.id] ? 'voted' : ''}" data-vote="${esc(p.id)}" aria-pressed="${!!local.votes[p.id]}">▲ <span>${p.votes}</span></button></div>
        <form class="reply-form" data-reply="${esc(p.id)}"><label class="sr" for="r-${esc(p.id)}">Reply</label><input id="r-${esc(p.id)}" placeholder="Write a reply…" maxlength="400" required><button class="btn btn-sm btn-ghost" type="submit">Reply</button></form>
      </article>`;
    }).join('');
  }

  // filters
  $$('[data-cat]').forEach(b => b.addEventListener('click', () => {
    cat = b.dataset.cat; $$('[data-cat]').forEach(x => { x.classList.toggle('on', x === b); x.setAttribute('aria-pressed', x === b); }); render();
  }));

  // votes & replies (delegated)
  list.addEventListener('click', (e) => {
    const v = e.target.closest('[data-vote]'); if (!v) return;
    const id = v.dataset.vote; local.votes[id] = !local.votes[id]; if (!local.votes[id]) delete local.votes[id]; store.set('votes', local.votes); render();
  });
  list.addEventListener('submit', (e) => {
    const f = e.target.closest('[data-reply]'); if (!f) return; e.preventDefault();
    const input = $('input', f); const body = input.value.trim(); if (!body) return;
    const id = f.dataset.reply; const prof = store.get('profile', {});
    (local.replies[id] = local.replies[id] || []).push({ author: prof.name || $('#p-name').value || 'Guest', ts: new Date().toISOString(), body });
    store.set('replies', local.replies); render(); toast('Reply posted');
  });

  // new post
  const pf = $('#post-form');
  const prof = store.get('profile', {}); if (prof.name) pf.elements.author.value = prof.name;
  pf.addEventListener('submit', (e) => {
    e.preventDefault(); if (!pf.checkValidity()) { pf.reportValidity(); return; }
    const d = Object.fromEntries(new FormData(pf));
    const post = { id: 'm' + Date.now(), cat: d.cat, author: d.author.trim(), ts: new Date().toISOString(), title: d.title.trim(), body: d.body.trim(), votes: 0, replies: [] };
    local.mine.unshift(post); store.set('posts', local.mine);
    store.set('profile', { ...store.get('profile', {}), name: post.author });
    pf.elements.title.value = ''; pf.elements.body.value = ''; cat = 'all';
    $$('[data-cat]').forEach(x => { x.classList.toggle('on', x.dataset.cat === 'all'); x.setAttribute('aria-pressed', x.dataset.cat === 'all'); });
    render(); toast('Posted! Welcome to the conversation.'); list.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });

  if (!CFG.forumEndpoint) $('#local-note').hidden = false;

  // browser notifications (opt-in, local demo until push backend exists)
  const pb = $('#push-btn');
  if (!('Notification' in window)) pb.hidden = true;
  else {
    const paint = () => { pb.textContent = Notification.permission === 'granted' ? 'Browser alerts are on ✓' : 'Enable browser alerts'; };
    paint();
    pb.addEventListener('click', async () => {
      if (Notification.permission === 'denied') { toast('Alerts are blocked in your browser settings.'); return; }
      const res = await Notification.requestPermission(); paint();
      if (res === 'granted') { new Notification('GDG GITAM', { body: 'You\'re set. We\'ll ping you about events.' }); store.set('push', true); }
    });
  }
  render();
})();
