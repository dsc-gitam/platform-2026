import { googleButton } from '../lib.mjs';

const body = `
<section class="section admin">
  <div class="container">
    <div id="a-loading" class="card" style="text-align:center">Loading…</div>
    <div id="a-msg" class="card c-yellow" hidden></div>
    <div id="a-out" class="card c-blue signin-card" hidden><h3>Admin sign-in</h3><p>Sign in with the Google account that has been given a role.</p>${googleButton()}</div>
    <div id="a-app" hidden></div>
  </div>
</section>
`;

export default {
  path: 'admin.html', nav: 'admin', title: 'Admin', noindex: true,
  description: 'GDG on Campus GITAM admin panel.',
  scripts: ['admin-analytics.js', 'admin.js'], body
};
