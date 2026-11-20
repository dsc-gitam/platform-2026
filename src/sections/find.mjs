// "Find your place" — quiz + paths. Lives on the home page (#find-your-place).
import { esc } from '../lib.mjs';
import { icon } from '../icons.mjs';

export const paths = [
  { id: 'explorer', name: 'The Curious Explorer', color: 'blue', glyph: 'compass', tab: 'member', cta: 'Join as a member',
    line: 'You are at the best part: everything is new. Your job is simply to show up and sample.',
    why: 'You said you are new or exploring. The fastest way to find what clicks is to attend a few events with no pressure.',
    steps: [['This week', 'Join as a member so you get alerts and early registration.'], ['This month', 'Attend the kickoff and one beginner workshop. Sit near friendly faces.'], ['Next', 'Try the Tech Atlas to see which roles sound like you.']],
    extra: ['events.html', 'See upcoming events'] },
  { id: 'learner', name: 'The Learner', color: 'green', glyph: 'trending-up', tab: 'member', cta: 'Join & hop on the board',
    line: 'You have started. Now you need structure, buddies and a reason to keep going.',
    why: 'You have dabbled and want to level up. Study jams and the community board give you guided practice and people to ask.',
    steps: [['This week', 'Join as a member and introduce yourself on the community board.'], ['This month', 'Do a Study Jam and finish one small project with a buddy.'], ['Next', 'Suggest a session on something you want to learn. Others do too.']],
    extra: ['join.html#suggest', 'Suggest a session'] },
  { id: 'builder', name: 'The Builder', color: 'yellow', glyph: 'hammer', tab: 'volunteer', cta: 'Volunteer with us',
    line: 'You make things. We have problems, events and teammates waiting for exactly that.',
    why: 'You build regularly or have a strong skill. Volunteering puts it to work on real club projects, and builds your portfolio at the same time.',
    steps: [['This week', 'Tell us your skill on the volunteer form. We will match you to a project.'], ['This month', 'Join a project squad or help run a hackathon or design sprint.'], ['Next', 'Demo what you built, and consider a core team role.']],
    extra: ['domains.html', 'Browse domains'] },
  { id: 'leader', name: 'The Organizer', color: 'red', glyph: 'flag', tab: 'core', cta: 'Apply for a core role',
    line: 'You lead naturally: teams, events, communities. This club needs people who finish things.',
    why: 'You have organised, led or managed before and have the time to commit. A core team seat lets you shape the club\'s direction.',
    steps: [['This week', 'Apply for the role closest to your strengths.'], ['This month', 'Shadow an organizer, then own one event end to end.'], ['Next', 'Build a small team under you. Train your own successor.']],
    extra: ['about.html#team', 'See open roles'] },
  { id: 'speaker', name: 'The Sharer', color: 'blue', glyph: 'mic', tab: 'speaker', cta: 'Propose a talk',
    line: 'You know something worth teaching. Someone in the audience needs it more than you realise.',
    why: 'You have shipped real things and enjoy explaining. Speaking cements your knowledge and gives others a head-start.',
    steps: [['This week', 'Propose a topic. A rough title and three bullet points is enough.'], ['This month', 'Get coached on structure, then give a 20-minute talk or workshop.'], ['Next', 'Mentor a junior, or record a series for the site.']],
    extra: ['join.html#story', 'Share your story'] }
];

export const findSection = `
<section class="section find" id="find-your-place">
  <div class="container">
    <div class="find-grid">
      <div class="find-intro reveal">
        <p class="eyebrow"><i class="dot"></i>Find your place</p>
        <h2>Tell us a bit. <span class="hl">We'll point the way.</span></h2>
        <p class="lead">Four quick questions, no sign-up. We'll suggest where you fit, whether that's attending, learning, building, leading or speaking.</p>
        <ul class="find-points">
          <li>${icon('compass', 22)}<span><b>Takes about a minute.</b> Pick the answer closest to you; there are no wrong ones.</span></li>
          <li>${icon('trending-up', 22)}<span><b>Get a 30-day plan.</b> Concrete steps for this week, this month and what comes next.</span></li>
          <li>${icon('users', 22)}<span><b>Nothing is stored on a server.</b> Your result stays in your browser.</span></li>
        </ul>
        <p class="find-note">Prefer to browse? The five paths are right below.</p>
      </div>
      <div class="quiz" id="quiz" aria-live="polite">
        <noscript>
          <p>Turn on JavaScript to take the quiz. Or pick a path directly:</p>
          <ul>${paths.map(p => `<li><a href="join.html#${p.tab}">${esc(p.name)}</a>: ${esc(p.line)}</li>`).join('')}</ul>
        </noscript>
      </div>
    </div>
    <div class="section-head reveal" style="margin-top:clamp(48px,6vw,80px)"><p class="eyebrow"><i class="dot"></i>The five paths</p><h2>Everyone has a <span class="hl">place</span> here.</h2></div>
    <div class="grid g3">
      ${paths.map(p => `<article class="card c-${p.color} reveal"><div class="badge" style="--c:var(--${p.color})">${icon(p.glyph, 26)}</div><h3>${esc(p.name)}</h3><p style="color:var(--ink-2)">${esc(p.line)}</p><a class="link" href="join.html#${p.tab}">${esc(p.cta)} →</a></article>`).join('')}
    </div>
    <script type="application/json" id="paths-data">${JSON.stringify(paths)}</script>
  </div>
</section>`;
