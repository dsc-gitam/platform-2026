// Central site config. Edit here; everything else reads from it.
export const site = {
  name: 'GDG on Campus GITAM',
  short: 'GDG GITAM',
  tagline: 'Learn it. Build it. Ship it — together.',
  // TODO: replace with the real domain before launch (used for canonical URLs, sitemap, OG tags).
  url: 'https://gdg-gitam.example.com',
  email: 'gdg@gitam.example.edu',
  location: 'GITAM (Deemed to be University), Visakhapatnam',
  // Social links — placeholders
  social: {
    instagram: '#',
    linkedin: '#',
    youtube: '#',
    x: '#',
    discord: '#',
    whatsapp: '#',
    github: '#',
    community: '#' // gdg.community.dev chapter page
  },
  // When true, sample/placeholder sections show a small "Sample" tag so nothing fake looks real.
  showPlaceholderTags: true,
  // Client-side config (exposed to the browser as window.GDG_CONFIG)
  client: {
    // Paste a Google Apps Script web-app URL / Formspree / any POST endpoint to receive form submissions.
    // While empty, submissions are kept in the visitor's localStorage so the flow can be demoed.
    formEndpoint: '',
    // Same idea for the community board (Firebase / Supabase / Apps Script). Empty = local-only preview mode.
    forumEndpoint: ''
  }
};

export const team = {
  organizers: [
    { name: 'Gagana Bandaru', role: 'Co-Organizer', color: 'blue', blurb: 'Placeholder — a line about Gagana, what they care about and what they are building.', links: { linkedin: '#', github: '#' } },
    { name: 'Chaitanya Sameer', role: 'Co-Organizer', color: 'red', blurb: 'Placeholder — a line about Chaitanya, what they care about and what they are building.', links: { linkedin: '#', github: '#' } },
    { name: 'Satwika', role: 'Co-Organizer', color: 'green', blurb: 'Placeholder — a line about Satwika, what they care about and what they are building.', links: { linkedin: '#', github: '#' } }
  ],
  mentor: { name: 'Manas Malla', role: 'Faculty Advisor & Chapter Mentor', color: 'yellow', blurb: 'Placeholder — a line about Manas, the chapter\'s mentor and faculty advisor.', links: { linkedin: '#', github: '#' } },
  openRoles: [
    { id: 'tech', title: 'Tech Lead', color: 'blue', desc: 'Guide project squads, review code, run workshops.' },
    { id: 'design', title: 'Design Lead', color: 'red', desc: 'Own how GDG GITAM looks, feels and tells its story.' },
    { id: 'content', title: 'Content & Social', color: 'yellow', desc: 'Reels, posts, recaps, newsletters — the voice of the club.' },
    { id: 'events', title: 'Events & Ops', color: 'green', desc: 'Venues, schedules, speakers, and the chaos behind the calm.' },
    { id: 'community', title: 'Community Lead', color: 'blue', desc: 'Welcome newcomers, keep the board alive, grow the family.' },
    { id: 'outreach', title: 'Outreach & Partnerships', color: 'red', desc: 'Connect with clubs, companies and other GDG chapters.' },
    { id: 'web', title: 'Web & Dev Ops', color: 'green', desc: 'Keep this very website sharp and shipping.' }
  ]
};

export const events = [
  { id: 'reboot-kickoff', status: 'upcoming', type: 'meetup', color: 'blue', title: 'Reboot: GDG GITAM Kickoff', date: '2026-12-05', time: '10:00', end: '13:00', venue: 'Seminar Hall (placeholder)', seats: 200, free: true,
    blurb: 'The relaunch. Meet the team, see the plan for the next 12 months, try live demos and pick your first path.', tags: ['Beginner friendly', 'Free snacks'] },
  { id: 'android-101', status: 'upcoming', type: 'workshop', color: 'green', title: 'Android 101: Your first app in Kotlin', date: '2026-12-12', time: '14:00', end: '17:00', venue: 'CS Lab 3 (placeholder)', seats: 60, free: true,
    blurb: 'Bring a laptop. Leave with a real app on your phone. No prior experience needed.', tags: ['Hands-on', 'Laptop needed'] },
  { id: 'gemini-study-jam', status: 'upcoming', type: 'studyjam', color: 'red', title: 'Study Jam: Build with the Gemini API', date: '2027-01-09', time: '11:00', end: '14:00', venue: 'Innovation Lab (placeholder)', seats: 80, free: true,
    blurb: 'Guided codelabs in small groups. Go from "what is a prompt" to a tiny AI-powered tool.', tags: ['AI', 'Guided'] },
  { id: 'web-jam-24', status: 'upcoming', type: 'hackathon', color: 'yellow', title: 'Web Jam: 24-hour mini hackathon', date: '2027-01-23', time: '09:00', end: '09:00', venue: 'Main Block (placeholder)', seats: 120, free: true,
    blurb: 'Teams of 3–4, one theme, one night. Mentors on call, snacks on tap, demos at sunrise.', tags: ['Teams', 'Prizes'] },
  { id: 'campus-to-company', status: 'upcoming', type: 'talk', color: 'blue', title: 'Talk: From campus to Google (guest speaker)', date: '2027-02-06', time: '16:00', end: '17:30', venue: 'Auditorium (placeholder)', seats: 300, free: true,
    blurb: 'A graduate\'s honest story — the rejections, the projects that mattered, and what they would do again.', tags: ['Career', 'Q&A'] },
  { id: 'design-sprint', status: 'upcoming', type: 'workshop', color: 'red', title: 'Design Sprint: Idea to clickable prototype', date: '2027-02-20', time: '10:00', end: '16:00', venue: 'Design Studio (placeholder)', seats: 50, free: true,
    blurb: 'Pick a real campus problem, sketch it, prototype it in Figma, and test it with strangers by lunch.', tags: ['Design', 'Hands-on'] },
  // Past
  { id: 'past-devfest', status: 'past', type: 'talk', color: 'blue', title: 'DevFest GITAM (placeholder year)', date: '2025-11-15', venue: 'Main Auditorium', attendees: '400+', blurb: 'A full-day community conference with talks and demos.' },
  { id: 'past-cloud-jam', status: 'past', type: 'studyjam', color: 'green', title: 'Cloud Study Jam', date: '2025-09-20', venue: 'CS Lab', attendees: '120', blurb: 'Hands-on Google Cloud skills, completed in small crews.' },
  { id: 'past-hack', status: 'past', type: 'hackathon', color: 'yellow', title: 'Solution Challenge Sprint', date: '2025-03-08', venue: 'Innovation Lab', attendees: '90', blurb: 'Teams built for UN goals using Google tech.' }
];

export const typeLabels = { meetup: 'Meetup', workshop: 'Workshop', studyjam: 'Study Jam', hackathon: 'Hackathon', talk: 'Talk' };

export const updates = [
  { id: 'u1', pinned: true, date: '2026-11-18', tag: 'Announcement', color: 'blue', title: 'We\'re back. Reboot kickoff is on 5 December.', body: 'GDG GITAM is being rebuilt from the ground up, with students, for students. Registrations open now.' },
  { id: 'u2', pinned: false, date: '2026-11-16', tag: 'Applications', color: 'red', title: 'Core team applications are open', body: 'Seven roles, no gatekeeping. If you have energy and curiosity, apply — we will help with the rest.' },
  { id: 'u3', pinned: false, date: '2026-11-12', tag: 'Opportunity', color: 'green', title: 'Call for speakers: share what you learned', body: 'Built something? Cracked an internship? 20 minutes on stage is all it takes.' },
  { id: 'u4', pinned: false, date: '2026-11-08', tag: 'Resource', color: 'yellow', title: 'Starter pack: free Google learning links', body: 'Codelabs, Skills Boost and roadmaps, curated by the team for complete beginners.' }
];

export const forumSeed = [
  { id: 'p1', cat: 'ask', author: 'Placeholder Member', ts: '2026-11-19T10:00:00', title: 'Where do I start if I have never written code?', body: 'First year, CSE. I keep watching videos but never build anything. What would you do in my place?', votes: 12,
    replies: [{ author: 'Gagana B.', ts: '2026-11-19T11:30:00', body: 'Pick one tiny thing (a to-do app) and build it badly. Come to Android 101 or the kickoff — we\'ll pair you up.' }] },
  { id: 'p2', cat: 'show', author: 'Placeholder Member', ts: '2026-11-17T18:20:00', title: 'Show & tell: my first Flutter screen', body: 'It is just a login screen, but it runs on my phone. Feedback welcome!', votes: 21, replies: [] },
  { id: 'p3', cat: 'idea', author: 'Placeholder Member', ts: '2026-11-15T09:10:00', title: 'Idea: a "Study Buddy" matching board for exam weeks', body: 'Could we use the community board to find people learning the same topic? Maybe a project for the first hackathon.', votes: 17, replies: [] },
  { id: 'p4', cat: 'resource', author: 'Chaitanya S.', ts: '2026-11-14T14:00:00', title: 'Free: Google Cloud Skills Boost beginner path', body: 'Start with "Cloud Digital Leader" content, it makes everything else click. Link in the starter pack.', votes: 9, replies: [] }
];

export const domains = [
  { id: 'mobile', name: 'Mobile & Apps', color: 'green', glyph: 'smartphone', tools: ['Kotlin', 'Jetpack Compose', 'Flutter', 'Dart'], what: 'Apps that live in pockets. Android with Kotlin and Compose, or cross-platform with Flutter.', first: 'Build a tip-calculator app and run it on your own phone.', outcome: 'Publish-ready apps, a Play Store-quality portfolio.' },
  { id: 'web', name: 'Web & Chrome', color: 'blue', glyph: 'globe', tools: ['HTML/CSS/JS', 'Angular', 'Firebase', 'Chrome DevTools'], what: 'The open web: fast, accessible, beautiful sites and web apps used by everyone.', first: 'Ship a personal page on Firebase Hosting in an afternoon.', outcome: 'Deployed projects and a site you are proud to share.' },
  { id: 'ai', name: 'AI & Gemini', color: 'red', glyph: 'sparkles', tools: ['Gemini API', 'Python', 'TensorFlow', 'Colab'], what: 'Use and build with modern AI: prompts, APIs, small models and real products.', first: 'Make a tiny Gemini-powered study helper in Colab.', outcome: 'AI-enabled projects and a clear mental model of how it all works.' },
  { id: 'cloud', name: 'Cloud & DevOps', color: 'yellow', glyph: 'cloud', tools: ['Google Cloud', 'Cloud Run', 'Docker', 'GitHub Actions'], what: 'Where software actually runs. Deploy, scale and keep things healthy.', first: 'Containerise a small app and deploy it to Cloud Run.', outcome: 'Cloud-ready skills and industry-recognised badges.' },
  { id: 'data', name: 'Data & Analytics', color: 'green', glyph: 'chart-column', tools: ['SQL', 'Python', 'BigQuery', 'Looker Studio'], what: 'Turn messy numbers into answers: queries, dashboards and stories with data.', first: 'Analyse a public dataset and publish a one-page dashboard.', outcome: 'A portfolio of insights, not just charts.' },
  { id: 'design', name: 'Design (UI/UX)', color: 'red', glyph: 'palette', tools: ['Figma', 'Material Design', 'Prototyping', 'User research'], what: 'Make products people love to use, from sketches to tested prototypes.', first: 'Redesign one screen of an app you hate using.', outcome: 'Case studies that show your thinking.' },
  { id: 'security', name: 'Security', color: 'blue', glyph: 'shield-check', tools: ['CTFs', 'Web security', 'Linux', 'OWASP'], what: 'Think like an attacker so you can build like a defender. Capture-the-flag friendly.', first: 'Solve three beginner CTF challenges together.', outcome: 'Safer habits and a start on security careers.' },
  { id: 'dsa', name: 'DSA & Open Source', color: 'yellow', glyph: 'braces', tools: ['Data structures', 'Algorithms', 'Git', 'Open source'], what: 'The fundamentals that interviews love and the open-source habits that get you noticed.', first: 'Make your first pull request to a friendly project.', outcome: 'Strong problem-solving and a visible GitHub.' }
];

export const timeline = [
  { year: '20XX', color: 'blue', title: 'The first spark', text: 'Placeholder — a handful of students and a faculty mentor start the chapter.' },
  { year: '20XX', color: 'red', title: 'First flagship event', text: 'Placeholder — the first big workshop fills the room and then some.' },
  { year: '20XX', color: 'yellow', title: 'DevFest & beyond', text: 'Placeholder — DevFest, hackathons and study jams become campus fixtures.' },
  { year: '20XX', color: 'green', title: 'Quiet years', text: 'Placeholder — the team graduates, momentum fades and the club goes dormant.' },
  { year: '2026', color: 'blue', title: 'Reboot', text: 'A new crew steps up to rebuild it — not for numbers, for impact.' }
];

export const achievements = [
  { n: '12', label: 'Members placed in tech roles', color: 'blue' },
  { n: '5', label: 'Solution Challenge finalists', color: 'red' },
  { n: '30+', label: 'Workshops run over the years', color: 'yellow' },
  { n: '1', label: 'Member now at a Google office', color: 'green' }
];

export const stories = [
  { name: 'Placeholder Alum', batch: 'Batch of 20XX', color: 'blue', now: 'Software Engineer, Company', before: 'Had never opened a terminal before a GDG workshop.', after: 'Built three Android apps, one of them used by 2,000 students. Landed an offer through a referral from a club friend.', quote: 'The club gave me the first people who believed I could build things.' },
  { name: 'Placeholder Member', batch: 'Batch of 20XX', color: 'red', now: 'Design Intern', before: 'Thought design was "making things pretty".', after: 'Ran the design track for a hackathon and turned two sprints into a portfolio.', quote: 'I learnt to show my work, not just talk about it.' },
  { name: 'Placeholder Member', batch: 'Batch of 20XX', color: 'green', now: 'ML Research Assistant', before: 'Curious about AI, scared of the math.', after: 'Joined a Study Jam, finished the learning path, and gave their first ever talk.', quote: 'Teaching it once made me understand it for good.' }
];

// Key moments & milestones — shown in the Legacy sections.
export const milestones = [
  { id: 'm1', year: '2022', color: 'yellow', label: 'First meetup: 12 students, one projector', size: 'sq' },
  { id: 'm2', year: '2023', color: 'green', label: 'First hackathon winners', size: 'sq' },
  { id: 'm3', year: '2024', color: 'red', label: 'Google Cloud Study Jam cohort', size: 'sq' },
  { id: 'm4', year: '2025', color: 'blue', label: 'DevFest GITAM main stage', size: 'sq' },
  { id: 'm5', year: '2025', color: 'yellow', label: 'Demo day: 20 projects shipped', size: 'sq' }
];

// Everyday moments — shown in the Gallery (different from the milestones above).
export const gallery = [
  { id: 'g1', color: 'red', label: 'Android workshop', size: 'tall' },
  { id: 'g2', color: 'yellow', label: 'Hackathon at 3 a.m.', size: 'wide' },
  { id: 'g3', color: 'green', label: 'Pair programming in the lab', size: 'sq' },
  { id: 'g4', color: 'blue', label: 'Pizza break', size: 'sq' },
  { id: 'g5', color: 'red', label: 'Whiteboard brainstorm', size: 'wide' },
  { id: 'g6', color: 'green', label: 'Study jam crew', size: 'tall' },
  { id: 'g7', color: 'yellow', label: 'Speaker Q&A', size: 'sq' },
  { id: 'g8', color: 'blue', label: 'Swag & stickers', size: 'sq' },
  { id: 'g9', color: 'green', label: 'Volunteer crew', size: 'sq' },
  { id: 'g10', color: 'red', label: 'Quiz night', size: 'wide' },
  { id: 'g11', color: 'blue', label: 'Debugging together', size: 'sq' },
  { id: 'g12', color: 'yellow', label: 'Team photo', size: 'sq' }
];

export const roadmap = [
  { q: 'Q1', months: 'Dec – Feb', title: 'Reboot', color: 'blue', goals: ['Relaunch with the kickoff event', 'Run 6 events, each with a beginner track', 'Reach 150 active members, not just sign-ups', 'Open the community board and onboarding path'] },
  { q: 'Q2', months: 'Mar – May', title: 'Build', color: 'red', goals: ['Launch project squads across 4 domains', 'First campus hackathon with external judges', 'Mentor-a-junior programme begins', 'Publish 10 member-built projects'] },
  { q: 'Q3', months: 'Jun – Aug', title: 'Grow', color: 'yellow', goals: ['Summer bootcamps and open-source month', 'Collaborate with 3 other campus clubs', 'Train the next batch of core team leads', 'Join forces with nearby GDG chapters'] },
  { q: 'Q4', months: 'Sep – Nov', title: 'Shine', color: 'green', goals: ['Host DevFest GITAM', 'Demo day for every squad', 'Alumni talk series and placements corner', 'Handover to a bigger, stronger team'] }
];

export const values = [
  { t: 'Impact over numbers', d: 'We would rather help 50 people ship something real than collect 500 sign-ups.', color: 'blue' },
  { t: 'Beginners first', d: 'Every event has a path for someone who has never done this before. No gatekeeping.', color: 'red' },
  { t: 'Build in public', d: 'We share what we make, what broke, and what we learnt. It helps the next person.', color: 'yellow' },
  { t: 'Kind & curious', d: 'Questions are celebrated. Mistakes are material. Nobody is the smartest person in the room.', color: 'green' }
];

export const expectations = {
  fromUs: ['Honest, beginner-friendly events with real outcomes', 'Mentors who actually reply', 'A space to try, fail and try again', 'Credit and visibility for your work'],
  fromYou: ['Show up, even when you are unsure', 'Ask questions and answer them too', 'Share one thing you learnt, however small', 'Be kind. That is the whole code of conduct.']
};

export const faqs = [
  { q: 'Do I need to know coding to join?', a: 'No. Most of our events start from zero. There are also design, content, events and community roles that need no code at all.' },
  { q: 'Is it free?', a: 'Yes. Membership and almost all events are free for GITAM students.' },
  { q: 'I am not from GITAM. Can I attend?', a: 'Some events are open to other colleges. Each event page says who can register.' },
  { q: 'How much time will it take?', a: 'As little as one event a month, as much as you want. Core roles need roughly 4–6 hours a week.' }
];
