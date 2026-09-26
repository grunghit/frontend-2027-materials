/**
 * .checks/public-checks.mjs — the PROJECT's reduced public check set, and the
 * PRE-SUBMISSION SELF-CHECK.
 *
 * A student runs it from `project/` before they push; CI runs the same file on every
 * push after it:
 *
 *     node .checks/run-checks.mjs
 *
 * ── THE CONSTRAINT THAT SHAPES EVERY LINE BELOW, AND IT IS NOT A PREFERENCE
 *
 * THE PROJECT BRIEF FIXES NO DOM CONTRACT. Weeks 10 and 11 could grade thirty different
 * applications because each week's brief nailed down one thing — `#list`, `[data-id]`,
 * `#api-panel[data-state]` — and graded around it. The project brief nails down NONE of
 * that: it fixes the layer file names, the architecture, and the behaviours, and it
 * leaves every id, class and element to the student. That was the right call for a spec
 * with topic freedom, and it means a check here may not name a selector. Not one.
 *
 * So every check below is one of exactly two kinds:
 *
 *   MODULE-LEVEL   it imports the student's own `state.js` and `render.js` and drives
 *                  them from outside. Those module names and their exports ARE fixed by
 *                  the brief, and they are the only interface this file may assume.
 *   SOURCE-LEVEL   it reads the layer files and checks a PROHIBITION the brief states
 *                  in words: render may not listen, events may not paint, api may not
 *                  touch the DOM.
 *
 * The behavioural check therefore measures REDRAWING, not structure: vandalise the page,
 * change the state, and see whether the damage is undone. That works for a table, a grid
 * of cards, a list, or anything a student invents — which is exactly the point.
 *
 * ── TWO THINGS ARE MISSING FROM HERE ON PURPOSE, AND THE CHECKLIST SAYS SO
 *
 * "The data survives a reload" and "corrupt storage does not take the page down" are
 * among the most important things to check before submitting, and NEITHER CAN BE WRITTEN
 * HERE. Both need to put one item into the collection, and the shape of an item is the
 * student's — so a bare object would be legitimately rejected by a good guard, and a
 * cloned one needs a non-empty collection that the brief never requires. Guessing a
 * field name would fail correct projects.
 *
 * So they are in `SUBMISSION_CHECKLIST-he.md` as two things the student does by hand,
 * with the exact steps. That is the honest place for them, and the checklist says which
 * rows a machine checked and which it did not.
 *
 * ── WHAT IS DELIBERATELY *NOT* HERE
 *
 * Every point value, every design criterion, every manually-graded row, and the whole
 * stretch tier. Those stay private. Green here is worth zero points and red here is
 * worth zero points: red means something the grader will look at is broken in a way you
 * can fix in ten minutes, and green means the submission is worth grading.
 *
 * RULES for editing this file: no point values; pair every negative with a positive; and
 * do not re-check what the shared runner already does — required files, HTML validity,
 * `node --check`, `tsc --noEmit`, console cleanliness, and no horizontal scroll.
 *
 * Verified by `npm run audit:ci`, which runs this file twice — against the scaffold
 * students receive and against a complete build — and fails if any check is green on the
 * first or red on the second.
 */

/** Fetch a file that sits beside the page. */
const fileAt = async (page, ctx, relative) => {
  const res = await page.request.get(`${ctx.serverUrl}/${relative}`).catch(() => null);
  if (!res || !res.ok()) return null;
  return res.text();
};

/** Comments and string literals removed, so a rule never matches inside prose. */
const code = (text) =>
  text
    .replace(/\/\*[\s\S]*?\*\//g, ' ')
    .replace(/(^|[^:])\/\/[^\n]*/g, '$1 ')
    .replace(/'(?:[^'\\\n]|\\.)*'/g, "''")
    .replace(/"(?:[^"\\\n]|\\.)*"/g, '""')
    .replace(/`(?:[^`\\]|\\.)*`/g, '``');

const fresh = async (page, ctx) => {
  await page.goto(`${ctx.serverUrl}/index.html`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(200);
};

/**
 * HALF ONE of every source-level check below.
 *
 * The scaffold ships with the layer files already present and already obeying every
 * prohibition — an empty `render.js` does not listen, and an empty `api.js` does not
 * touch the DOM. So "no addEventListener in render.js" is TRUE of a folder nobody
 * opened, and a check that stopped there would tell a student who has written nothing
 * that their architecture is sound.
 *
 * What is NOT true of the scaffold is that its markers are gone. That is the cheapest
 * honest proof that there is work here to check.
 */
async function notStillTheScaffold(page, ctx) {
  for (const rel of [
    'js/state.js',
    'js/render.js',
    'js/events.js',
    'js/storage.js',
    'js/api.js',
    'ts/types.ts',
  ]) {
    const text = await fileAt(page, ctx, rel);
    if (text === null) return false;
    if (/CODE HERE/.test(text)) return false;
  }
  return true;
}

/** Everything the page currently says, as one string. No selector, on purpose. */
const pageText = (page) => page.evaluate(() => document.body.innerText.replace(/\s+/g, ' ').trim());

export const publicChecks = [
  {
    /*
     * THE FLOOR, AND THE PAIR FOR EVERYTHING BELOW. The three exports named here are
     * fixed by the brief's architecture requirement — they are the only interface this
     * whole file is allowed to assume, so if they are missing every later check would
     * fail for a reason that has nothing to do with what it is measuring.
     */
    title: 'שכבת ה-state מייצאת את החוזה — `getState` · `setState` · `subscribe`',
    expected:
      'שלושת השמות האלה קבועים מאז שבוע 10, והם היחידים שהבודק מניח עליהם משהו. כל id, כל class וכל שם שדה — שלך.',
    run: async (page, ctx) => {
      if (!(await notStillTheScaffold(page, ctx))) return false;
      await fresh(page, ctx);
      return page.evaluate(async () => {
        try {
          const m = await import('./js/state.js');
          return (
            typeof m.getState === 'function' &&
            typeof m.setState === 'function' &&
            typeof m.subscribe === 'function'
          );
        } catch {
          return false;
        }
      });
    },
  },

  {
    /*
     * THE CHECK THE EXAM RESTS ON, and the one place this file earns its keep.
     *
     * It cannot look for a row, because no selector is fixed. So it asks the question a
     * different way: it VANDALISES the page — rewriting the text of every leaf element
     * inside <main> — and then changes the state and waits. If the screen is a function
     * of the state, at least one of those vandalised elements is redrawn and the damage
     * is undone. If the screen is a pile of markup that handlers poke at, nothing comes
     * back.
     *
     * That is law 2 from week 10 — ONE PAINTER — expressed as something a machine can
     * see, and it works for a table, a grid of cards, a list, or anything a student
     * invents. Measured: 1 element restored on a complete build, 0 on the scaffold.
     */
    title: '**המסך הוא פונקציה של ה-state** — שינוי ב-state מצייר מחדש ומבטל נזק ידני',
    expected:
      'הבדיקה משנה בכוח את הטקסט של האלמנטים בעמוד, ואז קוראת ל-`setState` שלך. אם `render` מנוי על ה-state, לפחות אחד מהם חוזר לעצמו. אם שום דבר לא חוזר — משהו אחר מצייר, וזו בדיוק המטלה הראשונה במבחן.',
    run: async (page, ctx) => {
      if (!(await notStillTheScaffold(page, ctx))) return false;
      await fresh(page, ctx);
      return page.evaluate(async () => {
        try {
          const state = await import('./js/state.js');
          if (typeof state.setState !== 'function') return false;

          const leaves = [...document.querySelectorAll('main *')]
            .filter((el) => el.children.length === 0 && el.textContent.trim().length > 0)
            .slice(0, 20);
          if (leaves.length === 0) return false;

          const mark = 'ZZ-SELFCHECK-ZZ';
          for (const el of leaves) el.textContent = mark;

          /* An empty patch is still a state change: `setState` replaces the object and
             notifies every subscriber, which is exactly what is being measured. */
          state.setState({});
          await new Promise((resolve) => setTimeout(resolve, 300));

          return leaves.some((el) => el.textContent !== mark);
        } catch {
          return false;
        }
      });
    },
  },

  {
    title: '`render.js` לא מאזין, ו-`events.js` לא מצייר',
    expected:
      'שתי האיסורים שמגדירים את שתי השכבות, משבוע 10. הבדיקה קוראת את המקור בלי תגובות: `addEventListener` ב-`render.js`, ו-`innerHTML` או `createElement` ב-`events.js`.',
    run: async (page, ctx) => {
      if (!(await notStillTheScaffold(page, ctx))) return false;
      const render = await fileAt(page, ctx, 'js/render.js');
      const events = await fileAt(page, ctx, 'js/events.js');
      if (render === null || events === null) return false;

      /* Paired with the positive each file exists FOR: render must build something, and
         events must register something. An empty file breaks no rule at all. */
      const r = code(render);
      const e = code(events);
      const renderPaints =
        /createElement|replaceChildren|innerHTML|insertAdjacentHTML|append\(/.test(r);
      const eventsListen = /addEventListener/.test(e);
      const renderListens = /addEventListener/.test(r);
      const eventsPaint = /innerHTML|createElement|insertAdjacentHTML/.test(e);

      return renderPaints && eventsListen && !renderListens && !eventsPaint;
    },
  },

  {
    title: '`api.js` ו-`storage.js` לא נוגעים ב-DOM',
    expected:
      'אותה בדיקה, שכבה אחת החוצה. `document` או `window` בשכבת נתונים פירושו שהיא יודעת על מסך — וזו בדיוק השכבה שצריכה לעבוד בלי אחד.',
    run: async (page, ctx) => {
      if (!(await notStillTheScaffold(page, ctx))) return false;
      const api = await fileAt(page, ctx, 'js/api.js');
      const storage = await fileAt(page, ctx, 'js/storage.js');
      if (api === null || storage === null) return false;

      const usesDom = (text) => /\bdocument\b|\bwindow\.document\b/.test(code(text));
      /* Paired: each file must actually do its job. */
      const apiFetches = /\bfetch\s*\(/.test(code(api));
      const storagePersists = /localStorage/.test(code(storage));

      return apiFetches && storagePersists && !usesDom(api) && !usesDom(storage);
    },
  },

  {
    title: 'אין ספרייה חיצונית ואין CDN — **ו-Tailwind נטען מהעותק המקומי**',
    expected:
      'משולב בכוונה: "אין `http` בשום `src`" נכון לגמרי גם בעמוד שלא טוען כלום. הבדיקה דורשת גם ש-`vendor/tailwind.js` נטען בפועל. בשבוע 13 אין רשת, ו-CDN פירושו עמוד לבן בחדר המבחן.',
    run: async (page, ctx) => {
      if (!(await notStillTheScaffold(page, ctx))) return false;
      await fresh(page, ctx);
      const assets = await page.evaluate(() =>
        [...document.querySelectorAll('script[src], link[href]')].map(
          (el) => el.getAttribute('src') ?? el.getAttribute('href') ?? '',
        ),
      );
      const remote = assets.filter((url) => /^https?:\/\//.test(url)).length;
      const local = assets.some((url) => /vendor\/tailwind\.js$/.test(url));
      return remote === 0 && local;
    },
  },
  {
    title: 'הדפדפן טוען את **הפלט** של `tsc`, והפלט מחויב לגיט',
    expected:
      'הרץ עצמו כבר בדק ש-`tsc --noEmit` עובר. כאן נבדק הצד השני: יש מקור ב-`ts/`, הפלט שלו ב-`js/` **קיים בריפו**, אין בו תחביר טיפוסים, ויש בו פונקציה — כי טיפוסים נמחקים ושומר בזמן ריצה לא. בשבוע 13 אין `node_modules` ואין רשת.',
    run: async (page, ctx) => {
      if (!(await notStillTheScaffold(page, ctx))) return false;
      const source = await fileAt(page, ctx, 'ts/types.ts');
      if (source === null) return false;
      /* Paired: the source has to contain a real type, not an empty file that compiles. */
      if (!/(?:interface|type)\s+\w+/.test(code(source))) return false;

      const emitted = await fileAt(page, ctx, 'js/types.js');
      if (emitted === null) return false;
      const out = code(emitted);
      if (/\binterface\s+\w+|:\s*unknown\b|\bimport\s+type\b|\w+\s+is\s+\w+\s*\{/.test(out))
        return false;
      if (!/function\s+\w+\s*\(/.test(out)) return false;

      await fresh(page, ctx);
      const bad = await page.evaluate(
        () =>
          [...document.querySelectorAll('script[src]')].filter((s) => s.src.endsWith('.ts')).length,
      );
      return bad === 0;
    },
  },

  {
    title: 'ארבעת המסמכים אינם תבנית ריקה',
    expected:
      '`PROJECT_PLAN.md` · `PROMPTS.md` · `AI_USAGE.md` · `README.md`. אף `CODE HERE` שנשאר, ולכל אחד תוכן. **מה שכתוב בהם נקרא בעיניים** — מה שנבדק כאן הוא רק שהם לא ריקים, וזו הרצפה ולא הציון.',
    run: async (page, ctx) => {
      for (const name of ['PROJECT_PLAN.md', 'PROMPTS.md', 'AI_USAGE.md', 'README.md']) {
        const text = await fileAt(page, ctx, name);
        if (text === null) return false;
        if (/CODE HERE/.test(text)) return false;
        const body = text.replace(/<!--[\s\S]*?-->/g, '').replace(/[#\s|>*-]/g, '');
        if (body.length < 250) return false;
      }
      return true;
    },
  },
];
