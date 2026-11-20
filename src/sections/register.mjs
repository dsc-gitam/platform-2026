// Event registration dialog, shared by the Home and Events pages (behaviour lives in assets/js/register.js).
import { googleButton, arrow } from '../lib.mjs';

export const registerModal = `
<div class="modal" id="reg-modal" role="dialog" aria-modal="true" aria-labelledby="reg-title">
  <div class="modal-box">
    <button class="modal-x" aria-label="Close">×</button>
    <div id="reg-form-wrap">
      <p class="eyebrow" style="margin-bottom:8px"><i class="dot"></i>Register</p>
      <h3 id="reg-title">Event</h3>
      <p id="reg-sub" style="color:var(--ink-2)"></p>
      <div id="reg-have" class="reg-have" hidden>
        <p>Already have a ticket? <button type="button" class="link-btn" id="reg-access">Access it here</button></p>
        <form id="reg-access-form" hidden novalidate>
          <label class="sr" for="reg-access-email">The email you registered with</label>
          <input id="reg-access-email" type="email" required placeholder="The email you registered with" autocomplete="email">
          <button class="btn btn-ink btn-sm" type="submit">Email me a sign-in link</button>
          <p class="reg-access-msg" id="reg-access-msg" role="status" hidden></p>
        </form>
      </div>
      <div id="reg-gate" hidden>
        ${googleButton('Continue with Google')}
        <p class="or"><span>or register with the form below</span></p>
      </div>
      <div id="reg-pending" hidden>
        <div class="card c-yellow"><h3>One quick step first</h3><p>Join the club (it takes a minute) and registering becomes a single click.</p><a class="btn btn-ink btn-sm" href="join.html#member">Become a member</a></div>
      </div>
      <section id="reg-member" hidden>
        <div class="reg-who" id="reg-who"></div>
        <form id="reg-quick" novalidate>
          <div id="reg-questions"></div>
          <p class="form-error" id="reg-quick-error" role="alert" hidden></p>
          <button class="btn btn-blue" type="submit">Confirm my spot ${arrow}</button>
        </form>
      </section>
      <form id="reg-guest" data-form="event-registration" data-reset="no" data-toast="You're registered! See you there." novalidate>
        <input type="hidden" name="event_id"><input type="hidden" name="event_title">
        <div class="field"><label for="r-name">Full name</label><input id="r-name" name="name" required autocomplete="name"></div>
        <div class="row2">
          <div class="field"><label for="r-email">Email</label><input id="r-email" type="email" name="email" required autocomplete="email"></div>
          <div class="field"><label for="r-phone">WhatsApp number</label><input id="r-phone" type="tel" name="phone" autocomplete="tel"></div>
        </div>
        <div class="row2">
          <div class="field"><label for="r-reg">Registration no. <small>(GITAM students)</small></label><input id="r-reg" name="reg_no"></div>
          <div class="field"><label for="r-year">Year</label><select id="r-year" name="year" required><option value="">Select…</option><option>1st</option><option>2nd</option><option>3rd</option><option>4th</option><option>Other</option></select></div>
        </div>
        <div class="field"><label for="r-branch">Branch / department</label><input id="r-branch" name="branch" placeholder="e.g. CSE, ECE, B.Des, MBA"></div>
        <div id="reg-guest-q"></div>
        <input type="text" name="honeypot" tabindex="-1" autocomplete="off" style="position:absolute;left:-9999px" aria-hidden="true">
        <p class="form-error" id="reg-guest-error" role="alert" hidden></p>
        <button class="btn btn-blue" type="submit">Confirm my spot ${arrow}</button>
        <p class="form-done" role="status" hidden>You're in! 🎉</p>
      </form>
    </div>
    <div id="reg-success" hidden>
      <h3>You're in. See you there! 🎉</h3>
      <p id="reg-success-msg">We'll email you reminders. Add it to your calendar so it doesn't slip by.</p>
      <div id="reg-ticket" class="reg-ticket" hidden></div>
      <div style="display:flex;gap:12px;flex-wrap:wrap"><button class="btn btn-yellow" id="add-cal">Add to calendar</button><a class="btn btn-ghost" id="reg-after" href="community.html">Meet others going</a></div>
    </div>
  </div>
</div>
`;
