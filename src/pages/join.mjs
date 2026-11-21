import { team, domains } from '../data/site.mjs';
import { esc, pageHero, arrow } from '../lib.mjs';

const domainChoices = (name = 'domains') => `<div class="choice">${domains.map(d => `<input type="checkbox" id="${name}-${d.id}" name="${name}" value="${esc(d.name)}"><label for="${name}-${d.id}">${esc(d.name)}</label>`).join('')}</div>`;
const common = (p) => `
  <div class="row2">
    <div class="field"><label for="${p}-name">Full name</label><input id="${p}-name" name="name" required autocomplete="name"></div>
    <div class="field"><label for="${p}-email">Email</label><input id="${p}-email" type="email" name="email" required autocomplete="email"></div>
  </div>
  <div class="row2">
    <div class="field"><label for="${p}-phone">WhatsApp number</label><input id="${p}-phone" type="tel" name="phone" autocomplete="tel"></div>
    <div class="field"><label for="${p}-reg">Registration no.</label><input id="${p}-reg" name="reg_no"></div>
  </div>
  <div class="row2">
    <div class="field"><label for="${p}-branch">Branch / department</label><input id="${p}-branch" name="branch"></div>
    <div class="field"><label for="${p}-year">Year <small>(optional)</small></label><select id="${p}-year" name="year"><option value="">Select…</option><option>1st</option><option>2nd</option><option>3rd</option><option>4th</option><option>Alumni</option><option>Other</option></select></div>
  </div>`;
const hp = '<input type="text" name="honeypot" tabindex="-1" autocomplete="off" style="position:absolute;left:-9999px" aria-hidden="true">';
const done = (m) => `<p class="form-done" role="status" hidden>${m}</p>`;

const panel = (id, color, title, intro, form, aside) => `
<div class="tabpanel split" role="tabpanel" id="panel-${id}" aria-labelledby="tab-${id}" hidden>
  <div class="aside-note"><p class="eyebrow"><i class="dot"></i>${title}</p><h2>${intro[0]}</h2><p class="lead">${intro[1]}</p>
    <div class="card c-${color}"><h3 style="font-size:1.1rem">${aside[0]}</h3><ul class="checks" style="--c:var(--${color});font-size:.96rem">${aside[1].map(x => `<li>${x}</li>`).join('')}</ul></div>
  </div>
  <div class="card">${form}</div>
</div>`;

const body = `
${pageHero({ eyebrow: 'Join', title: 'Pick how you want to <span class="hl">show up</span>.', lead: 'One page, five ways in. Start small as a member, or raise your hand for something bigger. You can always level up later.', color: 'red' })}

<section class="section">
  <div class="container">
    <div class="role-guide reveal">
      <div class="rg-item c-green"><b>Volunteer</b><p>You're interested in <em>learning or working in a domain</em> and you'd like to help with the club's operational tasks: registration desks, crowd flow, technical support at events. No experience needed.</p></div>
      <div class="rg-item c-red"><b>Core team</b><p>You're <em>experienced and skilled</em> in an area and can <em>lead that domain</em>: own a track, mentor others and run events. Volunteers often grow into the core team.</p></div>
      <a class="rg-link" href="about.html#team-structure">Explore roles ${arrow}</a>
    </div>
    <div class="tabs" role="tablist" aria-label="Ways to join">
      <button class="tab" role="tab" id="tab-member" aria-controls="panel-member" aria-selected="true" data-tab="member">Become a member</button>
      <button class="tab" role="tab" id="tab-volunteer" aria-controls="panel-volunteer" aria-selected="false" data-tab="volunteer">Volunteer</button>
      <button class="tab" role="tab" id="tab-core" aria-controls="panel-core" aria-selected="false" data-tab="core">Core team</button>
      <button class="tab" role="tab" id="tab-speaker" aria-controls="panel-speaker" aria-selected="false" data-tab="speaker">Speak</button>
      <button class="tab" role="tab" id="tab-suggest" aria-controls="panel-suggest" aria-selected="false" data-tab="suggest">Suggest a session</button>
      <button class="tab" role="tab" id="tab-story" aria-controls="panel-story" aria-selected="false" data-tab="story">Share your story</button>
    </div>

    ${panel('member', 'blue', 'Member', ['Join the family.', 'Free. No commitment. You get event alerts, early registration, access to the community board and a mentor-matched first step.'],
      `<form data-form="member" novalidate>${common('m')}
        <div class="field"><label>What are you curious about? <small>(pick any)</small></label>${domainChoices()}</div>
        <div class="field"><label>Where are you right now?</label><div class="choice"><input type="radio" name="level" id="ml1" value="curious" checked><label for="ml1">Just curious</label><input type="radio" name="level" id="ml2" value="learning"><label for="ml2">Learning</label><input type="radio" name="level" id="ml3" value="building"><label for="ml3">Building</label><input type="radio" name="level" id="ml4" value="experienced"><label for="ml4">Experienced</label></div></div>
        ${hp}<button class="btn btn-blue" type="submit">Join GDG GITAM ${arrow}</button>${done('Welcome to the family! Check your inbox soon. 🎉')}</form>`,
      ['What members get', ['Event alerts + early registration', 'Access to the community board', 'A buddy for your first event', 'Starter pack of free learning links']])}

    ${panel('volunteer', 'green', 'Volunteer', ['Learn it. Help run it.', "Volunteers are students who want to learn or work in a domain (web, AI, design, cloud and more) and who pitch in with the club's operational tasks: registration desks, crowd flow, technical support and outreach. You don't need experience, just interest and a few hours."],
      `<form data-form="volunteer" novalidate>${common('v')}
        <div class="field"><label>How can you help?</label><div class="choice">${['Event logistics', 'Registration desk', 'Mentoring beginners', 'Photography & video', 'Social media', 'Building a project', 'Design & posters', 'Teaching a mini-session'].map((x, i) => `<input type="checkbox" name="help" id="vh${i}" value="${x}"><label for="vh${i}">${x}</label>`).join('')}</div></div>
        <div class="field"><label for="v-skill">Something you're good at <small>(a skill, a project, a link)</small></label><textarea id="v-skill" name="skill"></textarea></div>
        <div class="field"><label for="v-hours">Hours per month you can give</label><select id="v-hours" name="hours"><option>2–4</option><option>5–10</option><option>10+</option></select></div>
        ${hp}<button class="btn btn-green" type="submit">Count me in ${arrow}</button>${done('Thanks! We\'ll match you with something fun.')}</form>`,
      ['Why volunteer', ['Learn a domain by doing real work', 'Help at events and meet the team', 'A fast lane to the core team', 'Letters of recognition']])}

    ${panel('core', 'red', 'Core team', ['Lead a domain with us.', "The core team is for people who are experienced and good at something and can lead it: owning a track such as Frontend, Backend or GenAI/ML, design, media or research, mentoring others and running events. Roughly 4–6 hours a week. New here? Volunteering is the way in."],
      `<form data-form="core-application" novalidate>${common('c')}
        <div class="field"><label for="c-role">Role you're applying for</label><select id="c-role" name="role" required><option value="">Select a role…</option>${team.openRoles.map(r => `<option value="${r.id}">${esc(r.title)}</option>`).join('')}</select></div>
        <div class="field"><label for="c-why">Why this role? <small>(3–5 lines)</small></label><textarea id="c-why" name="why" required></textarea></div>
        <div class="field"><label for="c-exp">Anything you've built, organised or led</label><textarea id="c-exp" name="experience"></textarea></div>
        <div class="field"><label for="c-link">Portfolio / GitHub / LinkedIn</label><input id="c-link" type="url" name="link" placeholder="https://"></div>
        <div class="field"><label for="c-idea">One idea you'd bring to GDG GITAM</label><textarea id="c-idea" name="idea"></textarea></div>
        ${hp}<button class="btn btn-red" type="submit">Submit application ${arrow}</button>${done('Application received! We\'ll be in touch for a quick chat.')}</form>`,
      ['What we look for', ['Real skill or experience in the domain', 'Ability to lead and mentor others', 'Reliability and consistency', 'An idea you would bring to the club']])}

    ${panel('speaker', 'yellow', 'Speaker', ['Share what you know.', 'Built something? Cracked a hard problem? Interned somewhere? 20 minutes is enough, and we\'ll help you shape the talk.'],
      `<form data-form="speaker" novalidate>${common('s')}
        <div class="field"><label for="s-topic">Talk topic</label><input id="s-topic" name="topic" required></div>
        <div class="field"><label for="s-abs">Short abstract</label><textarea id="s-abs" name="abstract" required></textarea></div>
        <div class="row2"><div class="field"><label for="s-fmt">Format</label><select id="s-fmt" name="format"><option>Talk (20–30 min)</option><option>Lightning talk (5–10 min)</option><option>Hands-on workshop</option><option>Panel</option></select></div><div class="field"><label for="s-lvl">Audience level</label><select id="s-lvl" name="audience"><option>Beginners</option><option>Intermediate</option><option>Advanced</option></select></div></div>
        <div class="field"><label for="s-link">Past talk, blog or project link</label><input id="s-link" type="url" name="link" placeholder="https://"></div>
        ${hp}<button class="btn btn-yellow" type="submit">Propose my talk ${arrow}</button>${done('Thanks! The team will review and reply soon.')}</form>`,
      ['Speaker perks', ['Coaching on your first talk', 'A recording for your portfolio', 'A great audience that cheers', 'Recognition on the site']])}

    ${panel('suggest', 'blue', 'Suggest', ['Tell us what to run next.', 'A session you\'d love to attend or a domain we should open. The best events started as someone\'s "what if".'],
      `<form data-form="suggestion" novalidate>
        <div class="row2"><div class="field"><label for="g-name">Name</label><input id="g-name" name="name" autocomplete="name"></div><div class="field"><label for="g-email">Email <small>(optional)</small></label><input id="g-email" type="email" name="email"></div></div>
        <div class="field"><label for="g-topic">Your idea</label><input id="g-topic" name="topic" required placeholder="e.g. Intro to Rust, Figma for non-designers"></div>
        <div class="field"><label for="g-why">Why would it help students?</label><textarea id="g-why" name="why"></textarea></div>
        <div class="field"><label for="g-me">Would you help organise it?</label><div class="choice"><input type="radio" name="help" id="gh1" value="yes"><label for="gh1">Yes</label><input type="radio" name="help" id="gh2" value="maybe" checked><label for="gh2">Maybe</label><input type="radio" name="help" id="gh3" value="no"><label for="gh3">Just suggesting</label></div></div>
        ${hp}<button class="btn btn-blue" type="submit">Send suggestion ${arrow}</button>${done('Thanks! We read every one.')}</form>`,
      ['How it works', ['We review suggestions monthly', 'Popular ones go on the calendar', 'You get a shout-out', 'Offers to help get priority']])}

    ${panel('story', 'green', 'Story', ['Learnt something here? Tell us.', 'Your journey, however small, helps the next student see what\'s possible. We\'ll feature it on the Legacy page (with your permission).'],
      `<form data-form="story" novalidate>${common('st')}
        <div class="field"><label for="st-before">Where were you before?</label><textarea id="st-before" name="before" required></textarea></div>
        <div class="field"><label for="st-after">What changed?</label><textarea id="st-after" name="after" required></textarea></div>
        <div class="field"><label for="st-now">Where are you now? <small>(role, company, project)</small></label><input id="st-now" name="now"></div>
        <div class="field photo-field"><label for="st-photo">Your photo <small>(optional, shown with your story if it's featured)</small></label>
          <div class="photo-pick"><span class="photo-prev" id="st-prev" aria-hidden="true"></span><div><input id="st-photo" type="file" accept="image/*" data-photo-for="st-photo-data"><small>A clear, friendly photo of you. JPEG, PNG or a phone photo all work; we resize it.</small></div></div>
          <input type="hidden" name="photo_data" id="st-photo-data"></div>
        <div class="field"><label class="choice" style="gap:8px;font-weight:500"><input type="checkbox" name="consent" value="yes" required style="position:static;opacity:1;width:auto;pointer-events:auto"> I'm happy for GDG GITAM to feature my story.</label></div>
        ${hp}<button class="btn btn-green" type="submit">Share my story ${arrow}</button>${done('Thank you! This means a lot.')}</form>`,
      ['Why share', ['Inspire the next batch', 'Get featured on the site', 'Reconnect with the community', 'Possibly speak at an event']])}
  </div>
</section>
`;

export default {
  path: 'join.html', nav: 'join', title: 'Join, Apply, Volunteer & Speak',
  description: 'Join GDG on Campus GITAM as a member, volunteer, apply for a core team role, propose a talk or suggest a session. Free and beginner friendly.',
  scripts: ['join.js'],
  body
};
