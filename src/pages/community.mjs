import { updates, forumSeed, site } from '../data/site.mjs';
import { esc, pageHero, arrow, fmtDate } from '../lib.mjs';

const body = `
${pageHero({ eyebrow: 'Community', title: 'The <span class="hl">board</span>. Ask, share, hang out.', lead: 'Announcements from the team, questions from members, ideas for the club. A friendly forum that lives inside the site, with no account needed to read.', color: 'blue' })}

<section class="section">
  <div class="container board">
    <div>
      <div class="notice" id="local-note" hidden>Preview mode: posts are saved on this device only. Connect a backend in <code>site.mjs → client.forumEndpoint</code> to go live for everyone.</div>
      <div class="card c-yellow reveal" style="margin-bottom:28px">
        <h3>Start a conversation</h3>
        <form id="post-form" novalidate>
          <div class="row2">
            <div class="field"><label for="p-name">Your name</label><input id="p-name" name="author" required maxlength="40" autocomplete="name"></div>
            <div class="field"><label for="p-cat">Topic</label><select id="p-cat" name="cat"><option value="ask">Ask for help</option><option value="show">Show &amp; tell</option><option value="idea">Idea for the club</option><option value="resource">Share a resource</option></select></div>
          </div>
          <div class="field"><label for="p-title">Title</label><input id="p-title" name="title" required maxlength="120"></div>
          <div class="field"><label for="p-body">What's on your mind?</label><textarea id="p-body" name="body" required maxlength="1200"></textarea></div>
          <button class="btn btn-ink" type="submit">Post it ${arrow}</button>
        </form>
      </div>
      <div class="filters" role="group" aria-label="Filter posts">
        <button class="chip on" data-cat="all" aria-pressed="true">All</button>
        <button class="chip" data-cat="ask" aria-pressed="false">Questions</button>
        <button class="chip" data-cat="show" aria-pressed="false">Show &amp; tell</button>
        <button class="chip" data-cat="idea" aria-pressed="false">Ideas</button>
        <button class="chip" data-cat="resource" aria-pressed="false">Resources</button>
      </div>
      <div id="posts" aria-live="polite"></div>
    </div>

    <aside>
      <div class="card reveal" style="margin-bottom:26px">
        <h3>Latest updates</h3>
        ${updates.map(u => `<div class="update"><div class="d">${fmtDate(u.date).slice(5, 11)}</div><div><span class="chip ${u.color}">${esc(u.tag)}</span> ${u.pinned ? '<span class="pin">📌 pinned</span>' : ''}<h4>${esc(u.title)}</h4><p>${esc(u.body)}</p></div></div>`).join('')}
      </div>

      <div class="card c-blue reveal" style="margin-bottom:26px">
        <h3>Get notified</h3>
        <p style="font-size:.96rem">Pick how you want to hear about new events and updates.</p>
        <form class="sub-form" data-form="subscribe" novalidate style="margin-top:0">
          <label class="sr" for="n-email">Email</label><input id="n-email" type="email" name="email" placeholder="you@example.com" required>
          <input type="hidden" name="source" value="community">
          <button class="btn btn-ink btn-sm" type="submit">Email me</button>
          <p class="form-done" role="status" hidden>Subscribed!</p>
        </form>
        <button class="btn btn-ghost btn-sm" id="push-btn" style="margin-top:14px">Enable browser alerts</button>
        <p style="margin:14px 0 0;font-size:.92rem">Or join us on <a class="link" href="${site.social.whatsapp}">WhatsApp</a> · <a class="link" href="${site.social.discord}">Discord</a></p>
      </div>

      <div class="card c-green reveal">
        <h3>House rules</h3>
        <ul class="checks" style="--c:var(--green);font-size:.96rem"><li>Be kind. Always.</li><li>No question is silly.</li><li>Credit the people who helped you.</li><li>No spam or self-promo.</li></ul>
      </div>
    </aside>
  </div>
</section>
`;

export default {
  path: 'community.html', nav: 'community', title: 'Community Board & Updates',
  description: 'The GDG on Campus GITAM community board: announcements, questions, ideas, show-and-tell and notifications for events and opportunities.',
  scripts: ['forum.js'],
  body: body + `<script type="application/json" id="forum-seed">${JSON.stringify(forumSeed)}</script>`
};
