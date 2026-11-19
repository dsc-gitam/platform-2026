/* Home: hero terminal + warm-up corner activities */
(function () {
  'use strict';
  const { $, $$ } = window.GDG;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ---- Hero terminal ----
  const body = $('#term-body');
  if (body) {
    const scripts = [
      [['c1', 'gdg'], ['', '.'], ['c3', 'join'], ['', '('], ['c4', '"you"'], ['', ')'], ['dim', '  // free, always']],
      [['c1', 'learn'], ['', '.'], ['c3', 'start'], ['', '('], ['c4', '"anything"'], ['', ')'], ['dim', '  // from zero']],
      [['c1', 'build'], ['', '.'], ['c3', 'with'], ['', '('], ['c4', '"friends"'], ['', ')'], ['dim', '  // not alone']],
      [['c1', 'ship'], ['', '.'], ['c3', 'it'], ['', '('], ['c4', '"proudly"'], ['', ')'], ['dim', '  // demo day']]
    ];
    const lines = [];
    const render = (cur) => {
      body.innerHTML = lines.map(l => `<div><span class="c2">›</span> ${l}</div>`).join('') + (cur !== undefined ? `<div><span class="c2">›</span> ${cur}<span class="caret"></span></div>` : '<div><span class="c2">›</span> <span class="caret"></span></div>');
    };
    if (reduce) { scripts.forEach(s => lines.push(s.map(([c, t]) => `<span class="${c}">${t}</span>`).join(''))); render(); }
    else {
      (async function run() {
        for (;;) {
          for (const s of scripts) {
            let out = '';
            for (const [c, t] of s) {
              for (const ch of t) { out += `<span class="${c}">${ch === '<' ? '&lt;' : ch}</span>`; render(out); await new Promise(r => setTimeout(r, c === 'dim' ? 12 : 45)); }
            }
            lines.push(out); if (lines.length > 4) lines.shift(); render();
            await new Promise(r => setTimeout(r, 700));
          }
          await new Promise(r => setTimeout(r, 1400));
        }
      })();
    }
  }

  // ---- Activity 1: Guess the output ----
  const QS = [
    { code: 'console.log("5" + 3);', opts: ['8', '53', 'NaN', 'Error'], a: 1, why: 'JavaScript turns the 3 into text and glues them: "53".' },
    { code: 'print(len("GDG"))', opts: ['2', '3', '"GDG"', 'Error'], a: 1, why: 'len() counts characters: G, D, G.' },
    { code: 'console.log(0.1 + 0.2 === 0.3);', opts: ['true', 'false', 'undefined', 'Error'], a: 1, why: 'Floating-point maths: 0.1 + 0.2 is 0.30000000000000004.' },
    { code: 'print([1, 2, 3][-1])', opts: ['1', '3', 'Error', 'None'], a: 1, why: 'Python counts from the end with negative indexes.' },
    { code: 'console.log(typeof null);', opts: ['"null"', '"undefined"', '"object"', '"number"'], a: 2, why: 'A famous old JavaScript quirk.' }
  ];
  const quiz = $('#quiz-go');
  if (quiz) {
    let i = 0, score = 0, locked = false;
    const code = $('.code-q', quiz), opts = $('.opts', quiz), foot = $('.qfoot', quiz), next = $('.q-next', quiz);
    const load = () => {
      locked = false; const q = QS[i % QS.length];
      code.textContent = q.code; foot.textContent = 'Pick one 👆'; next.hidden = true;
      opts.innerHTML = q.opts.map((o, k) => `<button class="opt" data-k="${k}">${o.replace(/</g, '&lt;')}</button>`).join('');
    };
    opts.addEventListener('click', (e) => {
      const b = e.target.closest('.opt'); if (!b || locked) return; locked = true;
      const q = QS[i % QS.length]; const k = +b.dataset.k;
      $$('.opt', opts).forEach((o, idx) => { o.disabled = true; if (idx === q.a) o.classList.add('right'); });
      if (k === q.a) { score++; foot.textContent = '✓ Yes! ' + q.why; } else { b.classList.add('wrong'); foot.textContent = '✗ ' + q.why; }
      $('.score', quiz).textContent = score; next.hidden = false;
    });
    next.addEventListener('click', () => { i++; load(); });
    load();
  }

  // ---- Activity 2: Emoji riddles ----
  const RD = [
    { e: '🤖 + 📱', opts: ['Android', 'Flutter', 'Firebase'], a: 0 },
    { e: '🔥 + 🏗️', opts: ['Firebase', 'Kotlin', 'Colab'], a: 0 },
    { e: '♊ + ✨', opts: ['Gemini', 'Chrome', 'Maps'], a: 0 },
    { e: '🦋 + 🎯', opts: ['Dart', 'Docker', 'Go'], a: 0 },
    { e: '☁️ + 🏃', opts: ['Cloud Run', 'Sheets', 'Gmail'], a: 0 }
  ];
  const rid = $('#riddle');
  if (rid) {
    let i = 0, locked = false;
    const emo = $('.emoji-q', rid), box = $('.opts', rid), foot = $('.rfoot', rid);
    const load = () => {
      locked = false; const q = RD[i % RD.length]; emo.textContent = q.e; foot.textContent = 'Which Google tech am I?';
      const order = q.opts.map((o, k) => ({ o, k })).sort(() => Math.random() - .5);
      box.innerHTML = order.map(({ o, k }) => `<button class="opt" data-k="${k}">${o}</button>`).join('');
    };
    box.addEventListener('click', (e) => {
      const b = e.target.closest('.opt'); if (!b || locked) return; locked = true;
      const q = RD[i % RD.length]; const ok = +b.dataset.k === q.a;
      $$('.opt', box).forEach(o => { o.disabled = true; if (+o.dataset.k === q.a) o.classList.add('right'); });
      if (!ok) b.classList.add('wrong'); foot.textContent = ok ? '✓ Nailed it!' : '✗ Not quite.';
      setTimeout(() => { i++; load(); }, 1100);
    });
    load();
  }

  // ---- Activity 3: bracket toy ----
  const toy = $('#bracket-toy');
  if (toy) {
    const words = ['Hello, world!', 'It works on my machine', 'Have you tried turning it off and on?', 'Ship it!', 'git commit -m "fix"', 'No semicolons were harmed'];
    const say = $('.toy-say', toy); let n = 0;
    $$('button', toy).forEach(b => b.addEventListener('click', () => { say.textContent = words[n++ % words.length]; b.animate([{ transform: 'scale(1)' }, { transform: 'scale(1.18) rotate(-6deg)' }, { transform: 'scale(1)' }], { duration: 350 }); }));
  }
})();
