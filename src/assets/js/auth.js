/* Accounts: Firebase Auth (Google sign-in), API client, navbar account badge, sign-in dialog,
   first-sign-in redirect, Tech Atlas / quiz sync and push-notification registration.
   Loaded as an ES module on every page. Without apiBase + Firebase config it stays dormant and the
   site behaves as a plain static site. */
const G = window.GDG;
const CFG = window.GDG_CONFIG || {};
const API = String(CFG.apiBase || '').replace(/\/$/, '');
const FB_VERSION = '11.0.2';
const FB = `https://www.gstatic.com/firebasejs/${FB_VERSION}/`;
const enabled = !!(API && (CFG.firebase || CFG.devAuth));
const { $, $$, store, esc } = G;
const onJoin = /\/join\.html$/.test(location.pathname);

// While previewing locally the badge is always visible, so the design can be reviewed before the backend is connected.
const PREVIEW = ['localhost', '127.0.0.1', ''].includes(location.hostname);
const listeners = new Set();
const auth = {
  enabled, me: null,
  on(fn) { listeners.add(fn); return () => listeners.delete(fn); },
  can(perm) { return !!auth.me && auth.me.user.perms.includes(perm); },
};
const emit = () => listeners.forEach((fn) => { try { fn(auth.me); } catch (e) { console.error(e); } });

// ---------- Firebase (lazy) ----------
let fa = null, fbMod = null;
async function initFirebase() {
  if (!CFG.firebase) return;
  const [appMod, authMod] = await Promise.all([import(FB + 'firebase-app.js'), import(FB + 'firebase-auth.js')]);
  fbMod = authMod;
  fa = authMod.getAuth(appMod.initializeApp(CFG.firebase));
  auth.firebaseApp = appMod.getApp();
}

async function token() {
  if (fa && fa.currentUser) return fa.currentUser.getIdToken();
  return null;
}

// ---------- API client ----------
auth.api = async function api(method, path, body, opts = {}) {
  const loud = !opts.quiet; // background calls (seat counts, syncing picks) stay silent
  if (loud) G.busy.start();
  try {
    const headers = { 'content-type': 'application/json' };
    const t = await token();
    if (t) headers.authorization = 'Bearer ' + t;
    else if (CFG.devAuth && store.get('devuser')) headers['x-dev-user'] = store.get('devuser');
    try {
      const res = await fetch(API + '/api' + path, { method, headers, body: body === undefined ? undefined : JSON.stringify(body) });
      const text = await res.text();
      let data = null; try { data = text ? JSON.parse(text) : null; } catch { data = { error: text }; }
      if (!res.ok && loud && !opts.noToast) G.toast((data && data.error && String(data.error).slice(0, 160)) || 'Something went wrong. Please try again.');
      return { ok: res.ok, status: res.status, data };
    } catch (e) {
      if (loud && !opts.noToast) G.toast('Could not reach the server. Check your connection and try again.');
      return { ok: false, status: 0, data: { error: 'Could not reach the server' } };
    }
  } finally { if (loud) G.busy.end(); }
};

// Fetch an image that needs sign-in (e.g. a private story photo) and return an object URL for <img src>.
auth.blobUrl = async function blobUrl(path) {
  const headers = {}; const t = await token();
  if (t) headers.authorization = 'Bearer ' + t; else if (CFG.devAuth && store.get('devuser')) headers['x-dev-user'] = store.get('devuser');
  try { const res = await fetch(API + '/api' + path, { headers }); return res.ok ? URL.createObjectURL(await res.blob()) : ''; } catch { return ''; }
};

auth.refresh = async function refresh(quiet) {
  const r = await auth.api('GET', '/me', undefined, { quiet: !!quiet, noToast: true });
  auth.me = r.ok ? r.data : null;
  if (!r.ok && r.status === 401) store.set('devuser', null);
  paintBadge(); emit();
  return auth.me;
};

// ---------- Sign in / out ----------
auth.signIn = async function signIn() {
  if (fa) {
    const provider = new fbMod.GoogleAuthProvider();
    provider.setCustomParameters({ prompt: 'select_account' });
    await fbMod.signInWithPopup(fa, provider);
    const ov = G.busy.overlay('Signing you in…'); // the popup is done; fetching the profile can take a moment
    try { await auth.refresh(); } finally { ov.close(); }
  }
  return auth.me;
};
auth.signOut = async function signOut() {
  if (fa) await fbMod.signOut(fa);
  store.set('devuser', null);
  auth.me = null; paintBadge(); emit();
  if (/\/(profile|admin)\.html$/.test(location.pathname)) location.href = 'index.html';
};

// ---------- Guests: anonymous session + "access my ticket" email link ----------
// Registering without an account creates a Firebase anonymous user. Its tickets are reachable on another device by
// signing in with the same email through a passwordless email link; the API then merges the guest into that account.
auth.ensureGuest = async function ensureGuest() {
  if (auth.me) return auth.me;
  if (fa) { await fbMod.signInAnonymously(fa); }
  else if (CFG.devAuth) store.set('devuser', 'anon:' + Math.random().toString(36).slice(2, 8) + '|Guest');
  return auth.refresh();
};

auth.sendTicketLink = async function sendTicketLink(email) {
  email = String(email || '').trim().toLowerCase();
  if (CFG.devAuth && !fa) { store.set('devuser', email); await auth.refresh(); return { dev: true }; }
  if (!fa) throw new Error('Sign-in is not configured');
  await fbMod.sendSignInLinkToEmail(fa, email, { url: new URL('profile.html', location.href).href, handleCodeInApp: true });
  store.set('email-for-signin', email);
  return { sent: true };
};

// Runs on every page load: finishes a sign-in when the visitor arrives through the emailed link.
async function completeEmailLink() {
  if (!fa || !fbMod.isSignInWithEmailLink(fa, location.href)) return;
  let email = store.get('email-for-signin', '');
  if (!email) email = (window.prompt('Please confirm the email you used to request the link') || '').trim().toLowerCase();
  if (!email) return;
  const href = location.href;
  const ov = G.busy.overlay('Signing you in…');
  try {
    const cur = fa.currentUser;
    if (cur && cur.isAnonymous) {
      try { await fbMod.linkWithCredential(cur, fbMod.EmailAuthProvider.credentialWithLink(email, href)); await cur.getIdToken(true); }
      catch { await fbMod.signInWithEmailLink(fa, email, href); } // email already belongs to another account: sign in to that one
    } else await fbMod.signInWithEmailLink(fa, email, href);
    store.set('email-for-signin', '');
    history.replaceState(null, '', location.pathname + '#tickets');
    await auth.refresh();
    G.toast('You are in. Your tickets are here.');
    if (!/\/profile\.html$/.test(location.pathname)) location.href = 'profile.html#tickets';
  } catch (e) {
    console.warn('Email link sign-in failed', e);
    G.toast('That sign-in link has expired or was already used. Request a new one.');
  } finally { ov.close(); }
}

// ---------- Sign-in dialog ----------
const GOOGLE_G = '<svg width="20" height="20" viewBox="0 0 48 48" aria-hidden="true"><path fill="#EA4335" d="M24 9.5c3.5 0 6.6 1.2 9.1 3.6l6.8-6.8C35.8 2.4 30.3 0 24 0 14.6 0 6.5 5.4 2.6 13.2l7.9 6.1C12.4 13.6 17.7 9.5 24 9.5z"/><path fill="#4285F4" d="M46.5 24.5c0-1.6-.1-3.1-.4-4.5H24v9h12.7c-.6 3-2.3 5.5-4.8 7.2l7.6 5.9c4.5-4.1 7-10.2 7-17.6z"/><path fill="#FBBC05" d="M10.5 28.7c-.5-1.4-.8-3-.8-4.7s.3-3.2.8-4.7l-7.9-6.1C.9 16.4 0 20.1 0 24s.9 7.6 2.6 10.8l7.9-6.1z"/><path fill="#34A853" d="M24 48c6.5 0 11.9-2.1 15.9-5.8l-7.6-5.9c-2.1 1.4-4.9 2.3-8.3 2.3-6.3 0-11.6-4.1-13.5-9.8l-7.9 6.1C6.5 42.6 14.6 48 24 48z"/></svg>';
auth.googleButton = (label = 'Continue with Google') => `<button type="button" class="btn-google" data-google>${GOOGLE_G}<span>${esc(label)}</span></button>`;

function ensureModal() {
  let m = $('#auth-modal'); if (m) return m;
  m = document.createElement('div'); m.className = 'modal'; m.id = 'auth-modal'; m.setAttribute('role', 'dialog'); m.setAttribute('aria-modal', 'true'); m.setAttribute('aria-labelledby', 'auth-title');
  m.innerHTML = `<div class="modal-box auth-box"><button class="modal-x" aria-label="Close">×</button>
    <img class="auth-logo" src="assets/gdg-logo.png" width="72" height="41" alt="">
    <h3 id="auth-title">Sign in to GDG GITAM</h3>
    <p id="auth-sub" class="auth-sub">Register for events, collect points and badges, and keep your Tech Atlas picks, all in one place.</p>
    ${CFG.firebase ? auth.googleButton() : ''}
    ${!CFG.firebase && CFG.devAuth ? `<form id="dev-signin" class="dev-signin"><p class="chip yellow">Dev sign-in (local testing)</p><div class="field"><label for="dev-email">Email</label><input id="dev-email" type="email" required placeholder="you@test.dev"></div><div class="field"><label for="dev-name">Name</label><input id="dev-name" placeholder="Your name"></div><button class="btn btn-blue" type="submit">Sign in</button></form>` : ''}
    <p class="auth-err" id="auth-err" role="alert" hidden></p>
    <p class="fine">We only use your name, email and photo to set up your member profile.</p></div>`;
  document.body.appendChild(m);
  const err = (t) => { const e = $('#auth-err', m); e.textContent = t; e.hidden = !t; };
  m.addEventListener('click', async (e) => {
    if (!e.target.closest('[data-google]')) return;
    err('');
    const gbtn = e.target.closest('[data-google]');
    try { await G.busy.wrap(() => auth.signIn(), gbtn); G.closeModal(m); afterSignIn(true); }
    catch (x) { if (x && x.code !== 'auth/popup-closed-by-user' && x.code !== 'auth/cancelled-popup-request') err('Sign-in failed. Please try again.'); }
  });
  const dev = $('#dev-signin', m);
  if (dev) dev.addEventListener('submit', async (e) => {
    e.preventDefault();
    store.set('devuser', `${$('#dev-email', m).value.trim().toLowerCase()}|${$('#dev-name', m).value.trim()}`);
    const ov = G.busy.overlay('Signing you in…'); try { await auth.refresh(); } finally { ov.close(); }
    G.closeModal(m); afterSignIn(true);
  });
  return m;
}
// Opens the sign-in dialog and resolves true once someone is signed in (false if they close it first).
auth.signInThen = (message) => new Promise((resolve) => {
  const m = ensureModal();
  const done = (ok) => { obs.disconnect(); off(); resolve(ok); };
  const obs = new MutationObserver(() => { if (!m.classList.contains('open')) done(!!auth.me && !auth.me.user.guest); });
  const off = auth.on((me) => { if (me && !me.user.guest) setTimeout(() => done(true), 0); });
  obs.observe(m, { attributes: true, attributeFilter: ['class'] });
  auth.openSignIn(message);
});
auth.openSignIn = (message) => {
  const m = ensureModal();
  if (message) $('#auth-sub', m).textContent = message;
  G.openModal(m);
};

// Signing in is joining: name, email and photo come from the Google account and the rest of the profile is asked
// at the first event registration (or filled in from the profile page). Nobody is sent to another page.
function afterSignIn() {
  if (!auth.me) return;
  G.toast(`Welcome${auth.me.user.createdAt && Date.now() - Date.parse(auth.me.user.createdAt) > 60000 ? ' back' : ''}, ${auth.me.user.name.split(' ')[0]}!`);
  syncExploration(); pushSaveToken();
}

// ---------- Navbar badge ----------
function initials(n) { return (n || '?').split(/\s+/).map((w) => w[0]).slice(0, 2).join('').toUpperCase(); }
function paintBadge() {
  const box = $('#acct'); if (!box) return;
  box.hidden = !(enabled || PREVIEW);
  const btn = $('.acct-btn', box), menu = $('.acct-menu', box);
  const u = auth.me && auth.me.user;
  if (!auth.settled && enabled) { btn.innerHTML = '<i class="spin" aria-hidden="true"></i>'; btn.setAttribute('aria-label', 'Checking your sign-in'); return; }
  if (!u) {
    btn.innerHTML = window.GDG_ICON('user', 20);
    btn.setAttribute('aria-label', 'Sign in'); btn.classList.remove('has-user'); menu.hidden = true; return;
  }
  btn.classList.add('has-user'); btn.setAttribute('aria-label', 'Account menu for ' + u.name);
  btn.innerHTML = u.photoUrl ? `<img src="${esc(u.photoUrl)}" alt="" referrerpolicy="no-referrer" width="36" height="36">` : `<span class="acct-initials">${esc(initials(u.name))}</span>`;
  const staff = u.perms.length > 0;
  menu.innerHTML = `<div class="acct-head"><b>${esc(u.name)}</b><small>${esc(u.email || 'Guest on this device')}</small>${u.guest ? '<span class="chip yellow">guest</span>' : u.role !== 'MEMBER' ? `<span class="chip blue">${esc(u.role.toLowerCase())}</span>` : ''}</div>
    ${u.guest ? '' : `<a href="profile.html">${window.GDG_ICON('user', 18)} My profile</a>`}
    <a href="profile.html#tickets">${window.GDG_ICON('ticket', 18)} My tickets</a>
    ${staff ? `<a href="admin.html">${window.GDG_ICON('shield-check', 18)} Admin panel</a>` : ''}
    <button type="button" data-signout>${window.GDG_ICON('log-out', 18)} Sign out</button>`;
}
function initBadge() {
  const box = $('#acct'); if (!box) return;
  const btn = $('.acct-btn', box), menu = $('.acct-menu', box);
  btn.addEventListener('click', () => {
    if (!auth.me) { if (enabled) auth.openSignIn(); else G.toast('Sign-in switches on once the backend is connected (see the README).'); return; }
    menu.hidden = !menu.hidden; btn.setAttribute('aria-expanded', String(!menu.hidden));
  });
  menu.addEventListener('click', (e) => { if (e.target.closest('[data-signout]')) auth.signOut(); });
  document.addEventListener('click', (e) => { if (!box.contains(e.target)) { menu.hidden = true; btn.setAttribute('aria-expanded', 'false'); } });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') { menu.hidden = true; } });
  paintBadge();
}

function prefillForms() {
  if (!auth.me || auth.me.user.guest) return;
  const u = auth.me.user;
  $$('form[data-form]').forEach((f) => {
    const map = { name: u.name, email: u.email, phone: u.phone, reg_no: u.regNo, branch: u.branch, year: u.year };
    for (const [k, v] of Object.entries(map)) if (v && f.elements[k] && !f.elements[k].value) f.elements[k].value = v;
    if (f.elements.email && u.email) f.elements.email.readOnly = true;
  });
}
// ---------- Sign-in nudges on forms (when signed out) ----------
function formGate() {
  if (!onJoin) return;
  $$('.tabpanel').forEach((panel) => {
    if (panel.id === 'panel-story' || panel.id === 'panel-suggest') return; // these work without a Google account
    let bar = $('.signin-bar', panel);
    if (auth.me && !auth.me.user.guest) { if (bar) bar.remove(); return; }
    if (bar) return;
    bar = document.createElement('div'); bar.className = 'signin-bar';
    bar.innerHTML = `<div><b>Sign in to send this</b><small>Your answers are linked to your member profile, so we can reply and track your progress.</small></div>${auth.googleButton()}`;
    panel.prepend(bar);
    $('[data-google]', bar).addEventListener('click', () => auth.openSignIn());
  });
}

// ---------- Tech Atlas / quiz sync ----------
let syncT;
function localExploration() {
  const st = store.get('atlas-state', {});
  return {
    atlas: { interests: st.interests || [], saved: store.get('atlas-saved', []), top: st.top || [], mode: st.mode || '' },
    quiz: { result: store.get('place', ''), second: store.get('place-second', '') },
  };
}
function syncExploration() {
  if (!auth.me) return;
  const l = localExploration();
  const remote = auth.me.exploration || { atlas: {}, quiz: {} };
  const hasLocal = l.atlas.interests.length || l.atlas.saved.length || l.quiz.result;
  if (!hasLocal) { // adopt what the account already knows
    if (remote.atlas?.saved?.length) store.set('atlas-saved', remote.atlas.saved);
    if (remote.quiz?.result) store.set('place', remote.quiz.result);
    return;
  }
  clearTimeout(syncT);
  syncT = setTimeout(async () => { const r = await auth.api('PUT', '/me/exploration', l, { quiet: true }); if (r.ok && auth.me) auth.me.exploration = r.data.exploration; }, 1200);
}
document.addEventListener('gdg:store', (e) => { if (['atlas-saved', 'atlas-state', 'place', 'place-second'].includes(e.detail.key)) syncExploration(); });

// ---------- Push notifications ----------
const push = {
  supported: 'Notification' in window && 'serviceWorker' in navigator,
  status: () => ('Notification' in window ? Notification.permission : 'unsupported'),
  async enable() {
    if (!push.supported) return 'unsupported';
    const perm = await Notification.requestPermission();
    if (perm !== 'granted') return perm;
    if (CFG.firebase && CFG.firebase.vapidKey && auth.firebaseApp) {
      try {
        const m = await import(FB + 'firebase-messaging.js');
        const reg = await navigator.serviceWorker.register('firebase-messaging-sw.js');
        const t = await m.getToken(m.getMessaging(auth.firebaseApp), { vapidKey: CFG.firebase.vapidKey, serviceWorkerRegistration: reg });
        if (t) { store.set('fcm', t); await pushSaveToken(); }
      } catch (e) { console.warn('Push registration failed', e); }
    }
    return perm;
  },
};
async function pushSaveToken() {
  const t = store.get('fcm', ''); if (!t || !auth.me) return;
  await auth.api('POST', '/me/fcm-token', { token: t }, { quiet: true });
}
auth.push = push;

// ---------- Boot ----------
G.auth = auth;
function boot() {
  initBadge();
  if (!enabled) { auth.settled = true; G._authResolve(auth); return; }
  const done = async () => {
    prefillForms(); formGate();
    if (auth.me) { syncExploration(); pushSaveToken(); }
  };
  auth.on(() => { prefillForms(); formGate(); });
  (async () => {
    try {
      await initFirebase();
      if (fa) {
        await new Promise((resolve) => { const off = fbMod.onAuthStateChanged(fa, async (u) => { if (u) await auth.refresh(true); else { auth.me = null; paintBadge(); emit(); } off(); resolve(); }); });
        // keep in step with later sign-ins / sign-outs (other tabs)
        fbMod.onAuthStateChanged(fa, async (u) => { if (u && !auth.me) await auth.refresh(); if (!u && auth.me) { auth.me = null; paintBadge(); emit(); } });
      } else if (store.get('devuser')) await auth.refresh(true);
      else { paintBadge(); }
    } catch (e) { console.error('Auth init failed', e); paintBadge(); }
    await completeEmailLink();
    await done();
    auth.settled = true; paintBadge();
    G._authResolve(auth);
  })();
}
if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot); else boot();
