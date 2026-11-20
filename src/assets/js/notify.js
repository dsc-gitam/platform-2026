/* Friendly "turn on notifications?" prompt shown shortly after a visit starts.
   The browser's own permission dialog only appears after the visitor says yes here. */
(function () {
  'use strict';
  const G = window.GDG; const { $, store } = G;
  if (!('Notification' in window)) return;
  if (Notification.permission !== 'default') return;
  const snooze = store.get('notif-snooze', 0);
  if (snooze && Date.now() < snooze) return;

  setTimeout(() => {
    if (Notification.permission !== 'default' || $('.notif-ask')) return;
    const box = document.createElement('div');
    box.className = 'notif-ask'; box.setAttribute('role', 'dialog'); box.setAttribute('aria-labelledby', 'na-title');
    box.innerHTML = `<div class="na-icon">${window.GDG_ICON('bell', 26)}</div>
      <div><h3 id="na-title">Never miss an event</h3><p>Turn on notifications and we'll ping you about new events, reminders and when tickets open. No spam.</p>
      <div class="na-actions"><button class="btn btn-blue btn-sm" data-yes>Turn on notifications</button><button class="btn btn-ghost btn-sm" data-no>Not now</button></div></div>`;
    document.body.appendChild(box);
    requestAnimationFrame(() => box.classList.add('show'));
    const close = () => { box.classList.remove('show'); setTimeout(() => box.remove(), 300); };
    $('[data-no]', box).addEventListener('click', () => { store.set('notif-snooze', Date.now() + 7 * 864e5); close(); });
    $('[data-yes]', box).addEventListener('click', async () => {
      close();
      const auth = await G.authReady;
      const res = auth && auth.push ? await auth.push.enable() : await Notification.requestPermission();
      if (res === 'granted') G.toast('Notifications are on. We will keep it useful.');
      else store.set('notif-snooze', Date.now() + 14 * 864e5);
    });
  }, 1800);
})();
