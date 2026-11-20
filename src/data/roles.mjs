// Tech Atlas data. Traits are 0–3: how much the role leans on each interest.
export const interests = [
  { id: 'visual', label: 'Making things look great' },
  { id: 'logic', label: 'Solving puzzles' },
  { id: 'people', label: 'Understanding people' },
  { id: 'data', label: 'Numbers & patterns' },
  { id: 'security', label: 'Breaking & defending things' },
  { id: 'apps', label: 'Building things people use' },
  { id: 'hardware', label: 'Gadgets & circuits' },
  { id: 'explain', label: 'Explaining & teaching' },
  { id: 'strategy', label: 'Big-picture thinking' }
];

export const clusters = [
  { id: 'build', name: 'Build things', color: 'blue' },
  { id: 'data', name: 'Think with data', color: 'green' },
  { id: 'infra', name: 'Run & protect', color: 'red' },
  { id: 'people', name: 'Shape & share', color: 'yellow' }
];

export const roles = [
  {
    id: 'frontend', name: 'Frontend Developer', cluster: 'build', glyph: 'code-xml', domain: 'web',
    tagline: 'Turns designs into the websites and web apps you click every day.',
    traits: { visual: 3, logic: 2, apps: 2, people: 1 }, social: 1,
    day: ['Pick up a design from the team and translate it into responsive pages', 'Fix a bug that only shows up on one phone', 'Make a page 40% faster and accessible with a keyboard', 'Demo a feature and gather feedback'],
    skills: [['HTML & CSS', 3], ['JavaScript', 3], ['A framework (React/Angular)', 2], ['Accessibility', 2], ['Git', 2]],
    path: [['Weeks 0–4', 'HTML, CSS and a first static page. Ship it online.'], ['Months 1–2', 'JavaScript fundamentals; build a to-do app and a weather app.'], ['Months 3–4', 'Learn one framework; clone a real site you like.'], ['Months 5–6', 'Build and deploy a portfolio project. Get feedback in public.']],
    start: [['web.dev Learn', 'https://web.dev/learn'], ['The Odin Project', 'https://www.theodinproject.com'], ['MDN Web Docs', 'https://developer.mozilla.org']],
    tonight: 'Open any website, right-click, Inspect, and change a heading\'s colour live.',
    voices: [{ name: 'Placeholder Alum', line: 'Batch of 20XX · Frontend Engineer', quote: 'I began by breaking my own portfolio page, again and again, until it stuck.' }]
  },
  {
    id: 'backend', name: 'Backend Developer', cluster: 'build', glyph: 'server', domain: 'cloud',
    tagline: 'Builds the engine room: APIs, databases and logic that power apps.',
    traits: { logic: 3, data: 2, security: 1, apps: 1 }, social: 1,
    day: ['Design an API for a new feature', 'Debug a slow database query', 'Review a teammate\'s code', 'Add tests so nothing breaks tomorrow'],
    skills: [['A language (Python/Java/Go/Node)', 3], ['Databases & SQL', 3], ['APIs & HTTP', 3], ['Testing', 2], ['Cloud basics', 2]],
    path: [['Weeks 0–4', 'Pick one language and solve small problems daily.'], ['Months 1–2', 'Learn SQL and build a simple REST API.'], ['Months 3–4', 'Add authentication, tests and deploy it to the cloud.'], ['Months 5–6', 'Build a real product backend with a frontend friend.']],
    start: [['roadmap.sh Backend', 'https://roadmap.sh/backend'], ['freeCodeCamp', 'https://www.freecodecamp.org'], ['Google Cloud Skills Boost', 'https://www.cloudskillsboost.google']],
    tonight: 'Use a free public API (like a joke or weather API) and print the response in your terminal.',
    voices: [{ name: 'Placeholder Alum', line: 'Batch of 20XX · Backend Engineer', quote: 'Backend clicked when I built something my friends actually logged into.' }]
  },
  {
    id: 'mobile', name: 'Mobile App Developer', cluster: 'build', glyph: 'smartphone', domain: 'mobile',
    tagline: 'Creates the apps in people\'s pockets for Android, iOS or both.',
    traits: { apps: 3, visual: 2, logic: 2 }, social: 1,
    day: ['Build a new screen with Jetpack Compose or Flutter', 'Handle weird screen sizes and slow networks', 'Test on a real phone', 'Ship an update to users'],
    skills: [['Kotlin or Dart', 3], ['UI toolkit (Compose/Flutter)', 3], ['State & architecture', 2], ['APIs & storage', 2], ['Design sense', 2]],
    path: [['Weeks 0–4', 'Kotlin basics and your first running app.'], ['Months 1–2', 'Build 3 small apps: tips, notes, a quiz.'], ['Months 3–4', 'Networking, local storage and navigation.'], ['Months 5–6', 'Publish one app, even if just to a test group.']],
    start: [['Android Basics with Compose', 'https://developer.android.com/courses'], ['Flutter Codelabs', 'https://docs.flutter.dev/codelabs'], ['Google Developers Codelabs', 'https://codelabs.developers.google.com']],
    tonight: 'Install Android Studio and run the template app on an emulator.',
    voices: [{ name: 'Placeholder Member', line: 'Batch of 20XX · Android Developer', quote: 'Seeing my own app icon on my phone for the first time was addictive.' }]
  },
  {
    id: 'game', name: 'Game Developer', cluster: 'build', glyph: 'gamepad-2', domain: 'dsa',
    tagline: 'Makes worlds, rules and fun using code, maths and art.',
    traits: { visual: 2, logic: 3, apps: 2 }, social: 2,
    day: ['Tune how jumping feels', 'Fix a physics bug that sends the hero to space', 'Playtest with friends and rewrite level 2', 'Optimise to hit 60 fps'],
    skills: [['A game engine (Unity/Godot)', 3], ['C# or GDScript', 3], ['Maths & physics basics', 2], ['Game design', 2], ['Art & sound basics', 1]],
    path: [['Weeks 0–4', 'Make Pong or Flappy-bird in any engine.'], ['Months 1–2', 'Finish one tiny game completely.'], ['Months 3–4', 'Join a game jam with a team.'], ['Months 5–6', 'Publish a game on itch.io and gather feedback.']],
    start: [['Godot Docs', 'https://docs.godotengine.org'], ['Unity Learn', 'https://learn.unity.com'], ['itch.io game jams', 'https://itch.io/jams']],
    tonight: 'Download Godot and make a square move with arrow keys.',
    voices: [{ name: 'Placeholder Member', line: 'Batch of 20XX · Indie game dev', quote: 'My first game was awful, and I was proud of it. That feeling never gets old.' }]
  },
  {
    id: 'iot', name: 'IoT & Embedded Engineer', cluster: 'build', glyph: 'cpu', domain: 'dsa',
    tagline: 'Gives software a body: sensors, boards and smart devices.',
    traits: { hardware: 3, logic: 2, apps: 1 }, social: 0,
    day: ['Wire a sensor to a microcontroller', 'Read and debug signals on an oscilloscope', 'Make a device talk to the cloud', 'Shrink code to fit tiny memory'],
    skills: [['C / C++', 3], ['Electronics basics', 3], ['Microcontrollers (ESP32/Arduino)', 3], ['Protocols (I2C, MQTT)', 2], ['Debugging', 2]],
    path: [['Weeks 0–4', 'Blink an LED with an Arduino or ESP32.'], ['Months 1–2', 'Read sensors, show data on a screen.'], ['Months 3–4', 'Send data to the cloud and view it online.'], ['Months 5–6', 'Build a project that solves a campus problem.']],
    start: [['Arduino Docs', 'https://docs.arduino.cc'], ['Wokwi simulator', 'https://wokwi.com'], ['ESP-IDF Docs', 'https://docs.espressif.com']],
    tonight: 'Open Wokwi in the browser and blink a virtual LED, no hardware needed.',
    voices: [{ name: 'Placeholder Member', line: 'Batch of 20XX · Embedded Engineer', quote: 'The first time a sensor answered back, I was hooked.' }]
  },
  {
    id: 'ml', name: 'AI / ML Engineer', cluster: 'data', glyph: 'brain', domain: 'ai',
    tagline: 'Teaches computers to learn from data, and builds products around it.',
    traits: { data: 3, logic: 3, apps: 1 }, social: 1,
    day: ['Clean a messy dataset', 'Train and compare two models', 'Wrap a model in an API', 'Explain to a teammate why the model was wrong'],
    skills: [['Python', 3], ['Maths: linear algebra, stats', 2], ['ML libraries (scikit-learn, PyTorch)', 3], ['Data wrangling', 3], ['Prompting & APIs', 2]],
    path: [['Weeks 0–4', 'Python basics and a notebook that plots something.'], ['Months 1–2', 'Statistics refresher and your first scikit-learn model.'], ['Months 3–4', 'A real dataset project on Kaggle.'], ['Months 5–6', 'Build an app using an AI API and explain how it works.']],
    start: [['Kaggle Learn', 'https://www.kaggle.com/learn'], ['Google ML Crash Course', 'https://developers.google.com/machine-learning/crash-course'], ['Gemini API docs', 'https://ai.google.dev']],
    tonight: 'Open Google Colab and ask Gemini to explain what a variable is. Then change the prompt.',
    voices: [{ name: 'Placeholder Member', line: 'Batch of 20XX · ML Research Assistant', quote: 'I was scared of the maths. Projects first, theory right after worked for me.' }]
  },
  {
    id: 'analyst', name: 'Data Analyst', cluster: 'data', glyph: 'chart-column', domain: 'data',
    tagline: 'Finds answers hiding in numbers and tells the story clearly.',
    traits: { data: 3, explain: 2, strategy: 2, logic: 2 }, social: 2,
    day: ['Pull data with SQL', 'Build a dashboard for a manager', 'Spot an odd spike and chase it down', 'Present three insights in plain language'],
    skills: [['SQL', 3], ['Spreadsheets', 2], ['Python or R', 2], ['Visualisation', 3], ['Storytelling', 3]],
    path: [['Weeks 0–4', 'Spreadsheets and basic SQL queries.'], ['Months 1–2', 'Analyse a public dataset end to end.'], ['Months 3–4', 'Learn a BI tool; build two dashboards.'], ['Months 5–6', 'Publish a case study with recommendations.']],
    start: [['Google Data Analytics (Coursera)', 'https://www.coursera.org/professional-certificates/google-data-analytics'], ['Kaggle Datasets', 'https://www.kaggle.com/datasets'], ['Looker Studio', 'https://lookerstudio.google.com']],
    tonight: 'Pick any dataset (cricket scores, anyone?) and find the one number that surprises you.',
    voices: [{ name: 'Placeholder Alum', line: 'Batch of 20XX · Analyst', quote: 'Being the person who can explain the numbers made me useful on day one.' }]
  },
  {
    id: 'cloud', name: 'Cloud & DevOps Engineer', cluster: 'infra', glyph: 'cloud', domain: 'cloud',
    tagline: 'Keeps software running, scaling and shipping smoothly.',
    traits: { logic: 2, apps: 1, security: 1, strategy: 1 }, social: 1,
    day: ['Automate a deploy so nobody has to do it manually', 'Investigate why a service is slow', 'Reduce the cloud bill', 'Write a runbook for the next on-call'],
    skills: [['Linux & terminal', 3], ['Docker & containers', 3], ['A cloud (GCP/AWS)', 3], ['CI/CD', 2], ['Monitoring', 2]],
    path: [['Weeks 0–4', 'Get comfortable in the Linux terminal.'], ['Months 1–2', 'Containerise an app with Docker.'], ['Months 3–4', 'Deploy to the cloud and set up CI/CD.'], ['Months 5–6', 'Add monitoring and write up what you learnt.']],
    start: [['Google Cloud Skills Boost', 'https://www.cloudskillsboost.google'], ['roadmap.sh DevOps', 'https://roadmap.sh/devops'], ['Docker Getting Started', 'https://docs.docker.com/get-started']],
    tonight: 'Run a tiny web server in a Docker container on your laptop.',
    voices: [{ name: 'Placeholder Alum', line: 'Batch of 20XX · DevOps Engineer', quote: 'I like being the reason nothing breaks at 2 a.m.' }]
  },
  {
    id: 'security', name: 'Cybersecurity Analyst', cluster: 'infra', glyph: 'shield-check', domain: 'security',
    tagline: 'Thinks like an attacker to keep systems and people safe.',
    traits: { security: 3, logic: 3, people: 1 }, social: 0,
    day: ['Review an app for vulnerabilities', 'Investigate a suspicious login', 'Run a capture-the-flag challenge', 'Write a clear report for non-experts'],
    skills: [['Networking basics', 3], ['Linux', 3], ['Web security (OWASP)', 3], ['Scripting', 2], ['Report writing', 2]],
    path: [['Weeks 0–4', 'Networking basics and how the web actually works.'], ['Months 1–2', 'Beginner CTFs and Linux fluency.'], ['Months 3–4', 'OWASP Top 10 hands-on labs.'], ['Months 5–6', 'Join a CTF team and write up your solves.']],
    start: [['TryHackMe', 'https://tryhackme.com'], ['OWASP Top 10', 'https://owasp.org/www-project-top-ten'], ['PicoCTF', 'https://picoctf.org']],
    tonight: 'Create a free PicoCTF account and solve one General Skills challenge.',
    voices: [{ name: 'Placeholder Member', line: 'Batch of 20XX · Security Intern', quote: 'CTFs taught me more than any lecture because I had to get unstuck myself.' }]
  },
  {
    id: 'design', name: 'UI/UX Designer', cluster: 'people', glyph: 'palette', domain: 'design',
    tagline: 'Makes products clear, usable and a little delightful.',
    traits: { visual: 3, people: 3, apps: 2, strategy: 1 }, social: 2,
    day: ['Interview a user and find what actually confuses them', 'Sketch three layouts, pick one', 'Prototype in Figma and test it', 'Hand off to developers with clear specs'],
    skills: [['Figma', 3], ['User research', 3], ['Visual design', 2], ['Prototyping', 2], ['Communication', 3]],
    path: [['Weeks 0–4', 'Figma basics; redesign one screen.'], ['Months 1–2', 'Learn design principles; do a heuristic review of an app.'], ['Months 3–4', 'Run a small user test; write it up.'], ['Months 5–6', 'Publish two case studies showing your process.']],
    start: [['Figma Learn', 'https://help.figma.com'], ['Material Design', 'https://m3.material.io'], ['Google UX Design Certificate', 'https://grow.google/certificates/ux-design']],
    tonight: 'Take a screenshot of an app that annoys you and mark three things you\'d change.',
    voices: [{ name: 'Placeholder Member', line: 'Batch of 20XX · Design Intern', quote: 'Design is mostly listening. I just didn\'t know that before.' }]
  },
  {
    id: 'pm', name: 'Product Manager', cluster: 'people', glyph: 'compass', domain: 'design',
    tagline: 'Decides what to build and why, and rallies a team around it.',
    traits: { strategy: 3, people: 3, explain: 2, data: 1 }, social: 3,
    day: ['Talk to users and teammates', 'Prioritise what ships this sprint', 'Write a one-page spec', 'Check the numbers after launch'],
    skills: [['Communication', 3], ['Prioritisation', 3], ['Basic data skills', 2], ['Tech literacy', 2], ['Leadership', 3]],
    path: [['Weeks 0–4', 'Read two product case studies; critique an app you use.'], ['Months 1–2', 'Lead a small team project or a club event.'], ['Months 3–4', 'Write a spec and run a prototype test.'], ['Months 5–6', 'Ship something with a team and measure results.']],
    start: [['Google Product Management', 'https://grow.google/certificates'], ['Lenny\'s Newsletter', 'https://www.lennysnewsletter.com'], ['Product School blog', 'https://productschool.com/blog']],
    tonight: 'Pick a campus pain-point and write a one-paragraph "problem statement".',
    voices: [{ name: 'Placeholder Alum', line: 'Batch of 20XX · Associate PM', quote: 'Organising club events was my first product management job, I just didn\'t call it that.' }]
  },
  {
    id: 'devrel', name: 'Developer Advocate / Tech Writer', cluster: 'people', glyph: 'pen-line', domain: 'web',
    tagline: 'Helps developers learn: talks, tutorials, docs and community.',
    traits: { explain: 3, people: 3, apps: 1, visual: 1 }, social: 3,
    day: ['Write a tutorial with working code', 'Give a talk or livestream', 'Collect feedback and send it to the product team', 'Answer questions from the community'],
    skills: [['Technical depth in one area', 2], ['Writing', 3], ['Public speaking', 3], ['Community building', 3], ['Demos & video', 2]],
    path: [['Weeks 0–4', 'Write one "how I built it" post.'], ['Months 1–2', 'Give a 10-minute talk at a club session.'], ['Months 3–4', 'Start a series, a video, a blog or a thread.'], ['Months 5–6', 'Speak at a bigger event and mentor a beginner.']],
    start: [['Google Developer Style Guide', 'https://developers.google.com/style'], ['dev.to', 'https://dev.to'], ['GDG Community', 'https://gdg.community.dev']],
    tonight: 'Explain something you learnt this week in 5 sentences, as if to a friend. That is your first post.',
    voices: [{ name: 'Placeholder Member', line: 'Batch of 20XX · Community Lead', quote: 'Teaching it once made me understand it for good.' }]
  }
];
