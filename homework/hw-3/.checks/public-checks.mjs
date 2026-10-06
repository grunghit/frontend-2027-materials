/**
 * .checks/public-checks.mjs — home assignment 3. CORE-TIER checks, and nothing else.
 *
 * RULES, because this file ships to student repositories:
 *   · CORE tier only. The stretch and challenge rows stay in the private grading spec.
 *   · No point values. No grading criteria. `expected` is a hint, never the answer.
 *   · PAIR EVERY NEGATIVE CHECK WITH A POSITIVE ONE. This week's version of the trap:
 *     an empty page has no hard-coded pads, no `innerHTML`, and a round counter that
 *     agrees with its zero rows. Every such assertion below also requires that the
 *     thing was actually built.
 *   · DO NOT RE-CHECK WHAT THE RUNNER ALREADY CHECKS — required files, HTML validity,
 *     `node --check`, console cleanliness on load, and no horizontal scroll.
 *
 * ON MEASURING SOUND: a headless browser plays nothing. What is measured instead is
 * that `new Audio(...)` was constructed with the RIGHT PATH — which also catches the
 * submission that wired all seven pads to the same file.
 */

/** Replace `window.Audio` with a recorder, and clear whatever it recorded before. */
const armAudioSpy = (page) =>
  page.evaluate(() => {
    if (!window.__realAudio) {
      window.__realAudio = window.Audio;
      window.Audio = function (src) {
        window.__played.push(src);
        const audio = new window.__realAudio(src);
        audio.play = () => Promise.resolve();
        return audio;
      };
    }
    window.__played = [];
  });

const played = (page) => page.evaluate(() => window.__played);

export const publicChecks = [
  {
    /*
     * Both halves in one row: an empty #pads has no hand-written pads either, so
     * "nothing is in the markup" is free until something has been built.
     */
    title: 'שבעת הפדים נבנו מ-JavaScript, בסדר של PADS',
    expected:
      'שבעה כפתורים ב-`#pads`, כל אחד עם `data-key` משלו — ואף אחד מהם אינו כתוב ב-index.html.',
    run: async (page) => {
      const built = await page.evaluate(async () => {
        const { PADS } = await import('./js/data.js');
        const buttons = [...document.querySelectorAll('#pads button')];
        return {
          count: buttons.length,
          expected: PADS.length,
          keys: buttons.map((b) => b.dataset.key),
          wanted: PADS.map((p) => p.key),
        };
      });
      const src = await (await page.request.get(page.url())).text();
      /* The FILE, parsed: a button written inside #pads is a hand-written pad. Any other
         button you add elsewhere on the page is not a pad and is not counted. */
      const handWritten = await page.evaluate(
        (html) =>
          new DOMParser().parseFromString(html, 'text/html').querySelectorAll('#pads button')
            .length,
        src,
      );
      return (
        built.count === built.expected &&
        JSON.stringify(built.keys) === JSON.stringify(built.wanted) &&
        handWritten === 0
      );
    },
  },

  {
    title: 'לחיצה על פד מנגנת את הצליל שלו, ולא של אחר',
    expected:
      'הצליל נלקח מהאיבר ב-PADS שה-`data-key` שלו תואם. שלושה פדים שונים, שלושה צלילים שונים.',
    run: async (page) => {
      const pads = await page.evaluate(async () => {
        const { PADS } = await import('./js/data.js');
        return PADS.map((p) => ({ key: p.key, sound: p.sound }));
      });
      if (pads.length === 0) return false;
      await armAudioSpy(page);
      for (const pad of [pads[0], pads[3], pads[6]]) {
        const clicked = await page.evaluate((key) => {
          const button = document.querySelector(`#pads button[data-key="${key}"]`);
          if (!button) return false;
          const target = button.querySelector('*') ?? button;
          target.dispatchEvent(new MouseEvent('click', { bubbles: true }));
          return true;
        }, pad.key);
        if (!clicked) return false;
      }
      await page.waitForTimeout(200);
      const heard = await played(page);
      return (
        heard.length === 3 &&
        heard[0].endsWith(pads[0].sound) &&
        heard[1].endsWith(pads[3].sound) &&
        heard[2].endsWith(pads[6].sound)
      );
    },
  },

  {
    title: 'הפד מהבהב אחרי מכה, וההבהוב חולף',
    expected: 'המחלקה `hit` נוספת, ומוסרת אחרי כמאה וחמישים מילישניות. אותה פונקציה, לא עותק ממנה.',
    run: async (page) => {
      const result = await page.evaluate(async () => {
        const button = document.querySelector('#pads button');
        if (!button) return null;
        const target = button.querySelector('*') ?? button;
        target.dispatchEvent(new MouseEvent('click', { bubbles: true }));
        await new Promise((r) => setTimeout(r, 40));
        const during = button.classList.contains('hit');
        await new Promise((r) => setTimeout(r, 400));
        return { during, after: button.classList.contains('hit') };
      });
      return result !== null && result.during === true && result.after === false;
    },
  },

  {
    title: 'המקש עושה אותו דבר — ולא פועל בזמן הקלדה בשדה',
    expected: 'מאזין `keydown` על המסמך, ו-`event.key` באותיות קטנות. בשדה טקסט המקש שייך לשדה.',
    run: async (page) => {
      const first = await page.evaluate(async () => {
        const { PADS } = await import('./js/data.js');
        return PADS[0];
      });
      await armAudioSpy(page);
      await page.evaluate(() => document.body.focus());
      await page.keyboard.press(first.key);
      await page.waitForTimeout(150);
      const fromKey = await played(page);

      await armAudioSpy(page);
      await page.focus('#player-one');
      await page.keyboard.press(first.key);
      await page.waitForTimeout(150);
      const whileTyping = await played(page);
      await page.evaluate(() => document.activeElement.blur());

      return fromKey.length === 1 && fromKey[0].endsWith(first.sound) && whileTyping.length === 0;
    },
  },

  {
    title: 'גלגול מחליף את שתי התמונות לפי הערך שיצא',
    expected: '`DICE_FACES[value - 1]` היא התמונה של `value`. המערך מתחיל באפס והקובייה באחת.',
    run: async (page) => {
      const faces = await page.evaluate(async () => (await import('./js/data.js')).DICE_FACES);
      const seen = new Set();
      for (let i = 0; i < 12; i += 1) {
        await page.click('#roll');
        await page.waitForTimeout(60);
        const srcs = await page.evaluate(() => [
          document.querySelector('#die-one').getAttribute('src'),
          document.querySelector('#die-two').getAttribute('src'),
        ]);
        for (const src of srcs) {
          if (!faces.includes(src)) return false;
          seen.add(src);
        }
      }
      /* Twelve rolls, twenty-four dice: a correct implementation reaches at least
         three distinct faces essentially always. One that never changes reaches one. */
      return seen.size >= 3;
    },
  },

  {
    title: 'ההיסטוריה, המונה והמצב הריק נגזרים מהנתונים',
    expected:
      'כל גלגול מוסיף שורה, `#round-count` שווה למספר השורות, ו-`#history-empty` מוצג רק כשאין אף אחת.',
    run: async (page) => {
      await page.reload({ waitUntil: 'networkidle' });
      const start = await page.evaluate(() => ({
        rows: document.querySelectorAll('#history li').length,
        emptyHidden: document.querySelector('#history-empty').hidden,
      }));
      if (start.rows !== 0 || start.emptyHidden !== false) return false;

      for (let i = 0; i < 3; i += 1) {
        await page.click('#roll');
        await page.waitForTimeout(60);
      }
      const after = await page.evaluate(() => ({
        rows: document.querySelectorAll('#history li').length,
        count: (document.querySelector('#round-count').textContent || '').trim(),
        emptyHidden: document.querySelector('#history-empty').hidden,
        shaped: [...document.querySelectorAll('#history li')].every(
          (li) =>
            li.dataset.id && li.querySelector('.round-text') && li.querySelector('button.remove'),
        ),
      }));
      return after.rows === 3 && after.count === '3' && after.emptyHidden === true && after.shaped;
    },
  },

  {
    title: 'אין innerHTML בקובץ שבונה את העמוד',
    expected:
      '`createElement` ו-`textContent` בכל מקום. קובץ שלא בונה כלום גם הוא נקי, ולכן נדרש שהפדים קיימים.',
    run: async (page) => {
      const base = page.url().replace(/\/[^/]*$/, '');
      const source = await (await page.request.get(`${base}/js/app.js`)).text();
      const code = source.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '');
      const pads = await page.evaluate(() => document.querySelectorAll('#pads button').length);
      return !/\binnerHTML\b/.test(code) && pads === 7;
    },
  },
];
