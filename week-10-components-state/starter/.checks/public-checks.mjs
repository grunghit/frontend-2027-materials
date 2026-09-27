/**
 * .checks/public-checks.mjs — week 10 (state/render; week 9 before the §0.6 renumber). CORE-TIER functional checks, and nothing else.
 *
 * RULES, because this file ships to student repositories:
 *   · CORE tier only (parts א and ב). Parts ג and ד stay in the private grading spec.
 *   · No point values. No grading criteria. `expected` is a hint, never the answer.
 *   · PAIR EVERY NEGATIVE CHECK WITH A POSITIVE ONE.
 *   · DO NOT RE-CHECK WHAT THE RUNNER ALREADY CHECKS — required files, HTML validity,
 *     `node --check`, console cleanliness on the ENTRY page, and no horizontal scroll.
 *
 * ── THE WEEK-10 TRAP, AND IT IS THE OPPOSITE OF EVERY PREVIOUS WEEK'S
 *
 * In weeks 5 to 9 the starter did nothing, so an assertion phrased as an absence was
 * free. THIS WEEK THE STARTER WORKS: it renders rows, it adds, it removes, it searches,
 * its console is clean and its markup validates. So "there are rows on screen" and
 * "adding an item adds a row" are worth nothing here — the file the student was asked
 * to take apart passes both before a single line moves.
 *
 * Every check below is therefore one of exactly two kinds:
 *   (a) it CALLS THE STUDENT'S OWN MODULES — `import('./js/state.js')` and
 *       `import('./js/render.js')` — which a monolith does not have, or
 *   (b) it reproduces one of the four faults, which are precisely the behaviours a
 *       working monolith gets wrong.
 *
 * Verified by `npm run audit:ci`: 8 checks, 0 green on the starter, 8 green on the
 * solution.
 *
 * ── WHY `import()` INSIDE THE PAGE IS THE HONEST TOOL HERE
 *
 * A URL that is already in the browser's module map returns the SAME module instance
 * the application is running on. So `setState` called from a check IS the application's
 * `setState`, and what appears on screen afterwards is the real answer rather than a
 * simulation of one. A missing module or a missing export throws, the evaluate rejects,
 * and the check is red — which is exactly what an un-refactored submission is.
 *
 * The three import lines are repeated in each check rather than factored into a helper.
 * Playwright serialises the function it is given, so a shared helper would have to ship
 * source code as a string and rebuild it at the far end — and a check nobody can read
 * is a check nobody re-reads.
 *
 * The page arrives loaded at `index.html`, 1280x900, over http.
 */

/** Add one item through the form. Returns what is on screen afterwards. */
const addItem = (page, title, number, category) =>
  page.evaluate(
    async (a) => {
      const form = document.querySelector('#item-form');
      const titleField = document.querySelector('#field-title');
      const numberField = document.querySelector('#field-number');
      const categoryField = document.querySelector('#field-category');
      if (!form || !titleField || !numberField || !categoryField) return null;
      titleField.value = a.title;
      numberField.value = String(a.number);
      categoryField.value = a.category;
      form.requestSubmit();
      await new Promise((resolve) => setTimeout(resolve, 140));
      return {
        titles: [...document.querySelectorAll('#list .item-title')].map((el) => el.textContent),
        numbers: [...document.querySelectorAll('#list .item-number')].map((el) => el.textContent),
      };
    },
    { title, number, category },
  );

/** Set a control's value, fire the event the application listens for, report the list. */
const setControl = (page, selector, value, type) =>
  page.evaluate(
    async (a) => {
      const control = document.querySelector(a.selector);
      if (!control) return null;
      control.value = a.value;
      control.dispatchEvent(new Event(a.type, { bubbles: true }));
      await new Promise((resolve) => setTimeout(resolve, 120));
      return {
        titles: [...document.querySelectorAll('#list .item-title')].map((el) => el.textContent),
        numbers: [...document.querySelectorAll('#list .item-number')].map((el) => el.textContent),
      };
    },
    { selector, value, type },
  );

/** Click the innermost element of a row's button, which is what a real pointer hits. */
const clickRowButton = (page, rowSelector, buttonSelector) =>
  page.evaluate(
    async (a) => {
      const row = document.querySelector(a.rowSelector);
      const button = row?.querySelector(a.buttonSelector);
      const target = button?.querySelector('*') ?? button;
      if (!target) return null;
      const title = row.querySelector('.item-title')?.textContent ?? '';
      target.dispatchEvent(new MouseEvent('click', { bubbles: true }));
      await new Promise((resolve) => setTimeout(resolve, 140));
      return title;
    },
    { rowSelector, buttonSelector },
  );

/** Fetch a source file that sits beside the page. */
const sourceOf = async (page, relative) => {
  const res = await page.request.get(new URL(relative, page.url()).href).catch(() => null);
  if (!res || !res.ok()) return null;
  return res.text();
};

/** Strip comments and string literals, so a rule is never matched inside prose. */
const code = (text) =>
  text
    .replace(/\/\*[\s\S]*?\*\//g, ' ')
    .replace(/(^|[^:])\/\/[^\n]*/g, '$1 ')
    .replace(/'(?:[^'\\\n]|\\.)*'/g, "''")
    .replace(/"(?:[^"\\\n]|\\.)*"/g, '""')
    .replace(/`(?:[^`\\]|\\.)*`/g, '``');

/**
 * Reload the entry page.
 *
 * EVERY CHECK BELOW STARTS WITH THIS, and it is not politeness. The runner hands all
 * eight checks the SAME page, so without it check 5 is searching a collection that
 * checks 1 to 4 have already added to, removed from and replaced — and a row that
 * measures the student's work becomes a row that measures the order it happens to run
 * in. It cost three false failures on the reference answer before it was added.
 */
const fresh = async (page, ctx) => {
  await page.goto(`${ctx.serverUrl}/index.html`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(120);
};

export const publicChecks = [
  {
    /*
     * THE ROW THIS WEEK EXISTS FOR, and the one that cannot be passed by accident. It
     * does not look for a function called `render` or a variable called `state`: it
     * puts an item into the state object and asks the screen about it.
     */
    title: 'המסך הוא פונקציה של האובייקט — הזרקת פריט ל-state מציגה אותו',
    expected:
      '`js/state.js` מייצא `getState` ו-`setState`, `js/render.js` מייצא `render(state)`, וקריאה לשניהם מציגה פריט חדש בלי שאף מטפל אירועים רץ.',
    run: async (page, ctx) => {
      await fresh(page, ctx);
      const result = await page
        .evaluate(async () => {
          const state = await import('./js/state.js');
          const view = await import('./js/render.js');
          const titles = () =>
            [...document.querySelectorAll('#list .item-title')].map((el) => el.textContent);

          const before = titles().length;
          state.setState({
            items: [
              ...state.getState().items,
              { id: 'ci-inject-1', title: 'שורה מוזרקת', number: 7, category: 'בדיקה' },
            ],
          });
          view.render(state.getState());
          await new Promise((resolve) => setTimeout(resolve, 80));
          return { before, after: titles().length, has: titles().includes('שורה מוזרקת') };
        })
        .catch(() => null);
      return result !== null && result.has && result.after === result.before + 1;
    },
  },

  {
    /*
     * Fault 1, and the difference between a refactor and a file move. A handler that
     * removed the row from the screen left it in the collection, so the NEXT draw brings
     * it back. A handler that removed it from BOTH passes the first half and still fails
     * here, because the check draws twice — and two copies that are both updated are
     * still two copies.
     */
    title: 'מטפל משנה state ולא מצייר — אחרי הסרה, ציור נוסף לא מחזיר את השורה',
    expected:
      'המטפל של כפתור ההסרה קורא ל-`setState` עם אוסף חדש, ואינו מסיר את השורה מהמסך בעצמו.',
    run: async (page, ctx) => {
      await fresh(page, ctx);
      /*
       * The collection is REPLACED with two known items first, and the check refuses to
       * continue unless exactly those two are on screen. That is the pairing: a render
       * that does nothing at all would otherwise pass the second half for free, because
       * a screen nobody redraws never brings anything back.
       */
      const seeded = await page
        .evaluate(async () => {
          const state = await import('./js/state.js');
          const view = await import('./js/render.js');
          state.setState({
            items: [
              { id: 'ci-a', title: 'ראשון', number: 1, category: 'בדיקה' },
              { id: 'ci-b', title: 'שני', number: 2, category: 'בדיקה' },
            ],
            query: '',
            category: 'all',
          });
          view.render(state.getState());
          await new Promise((resolve) => setTimeout(resolve, 80));
          return [...document.querySelectorAll('#list .item-title')].map((el) => el.textContent);
        })
        .catch(() => null);
      if (seeded === null || seeded.length !== 2 || !seeded.includes('ראשון')) return false;

      const removed = await clickRowButton(page, '#list li', 'button.remove');
      if (removed === null || removed === '') return false;

      const result = await page
        .evaluate(async (gone) => {
          const state = await import('./js/state.js');
          const view = await import('./js/render.js');
          const titles = () =>
            [...document.querySelectorAll('#list .item-title')].map((el) => el.textContent);

          const afterClick = titles();
          view.render(state.getState());
          await new Promise((resolve) => setTimeout(resolve, 80));
          return { afterClick, afterDraw: titles(), gone };
        }, removed)
        .catch(() => null);
      if (result === null) return false;
      return (
        result.afterClick.length === 1 &&
        !result.afterClick.includes(removed) &&
        result.afterDraw.length === 1 &&
        !result.afterDraw.includes(removed)
      );
    },
  },

  {
    /*
     * Fault 3. Both halves in one row, because each is free without the other: a
     * monolith can carry `data-id` and still index into the collection, and a page with
     * no rows carries no `data-index` either.
     */
    title: 'מזהה ולא אינדקס — הסרה אחרי סינון מסירה את הפריט שנלחץ',
    expected:
      'לכל שורה `data-id` עם המזהה של הפריט, והמטפל מוצא את הפריט לפי המזהה הזה ולא לפי מקומו ברשימה.',
    run: async (page, ctx) => {
      await fresh(page, ctx);
      const shape = await page.evaluate(() => {
        const rows = [...document.querySelectorAll('#list li')];
        return {
          rows: rows.length,
          withId: rows.filter((li) => li.dataset.id).length,
          withIndex: rows.filter((li) => li.dataset.index !== undefined).length,
          unique: new Set(rows.map((li) => li.dataset.id)).size,
        };
      });
      if (shape.rows < 3 || shape.withId !== shape.rows || shape.withIndex > 0) return false;
      if (shape.unique !== shape.rows) return false;

      /* Narrow to one row that is NOT first in the collection, remove it, clear the
         search, and ask which one actually went. */
      const narrowed = await setControl(page, '#query', 'כמון', 'input');
      if (!narrowed || narrowed.titles.length !== 1) return false;
      const victim = narrowed.titles[0];

      const clicked = await clickRowButton(page, '#list li', 'button.remove');
      if (clicked === null) return false;

      const cleared = await setControl(page, '#query', '', 'input');
      return cleared !== null && !cleared.titles.includes(victim) && cleared.titles.length >= 4;
    },
  },

  {
    /*
     * Fault 4, and the reason a sort handler is one line. The starter reorders the rows
     * that happen to be on screen, so the very next draw throws the order away.
     */
    title: 'המיון נגזר — הוא מזיז שורות, והוא שורד הוספה',
    expected: 'המטפל של פקד המיון שומר את הבחירה ב-state; מי שממיין הוא הפונקציה שמחשבת מה מוצג.',
    run: async (page, ctx) => {
      await fresh(page, ctx);
      const ascending = (list) => list.every((n, i) => i === 0 || Number(list[i - 1]) <= Number(n));
      const sorted = await setControl(page, '#sort', 'number', 'change');
      if (!sorted || sorted.numbers.length < 4 || !ascending(sorted.numbers)) return false;

      const after = await addItem(page, 'פריט ביניים', 3, 'בדיקה');
      return (
        after !== null &&
        after.numbers.length === sorted.numbers.length + 1 &&
        ascending(after.numbers)
      );
    },
  },

  {
    /*
     * Paired in both directions: narrowing alone is true of a monolith, and returning to
     * the full list alone is true of a control nobody wired. The two together are only
     * true of a list that is recomputed from what the user typed.
     */
    title: 'החיפוש מצמצם, והוא נגזר — `state.query` לבדו קובע מה מוצג',
    expected:
      'המטפל שומר את מה שהוקלד ב-state; הסינון עצמו קורה בפונקציה שמחשבת מה מוצג — ולכן שינוי השדה ישירות, בלי לגעת בתיבה, מצמצם גם הוא.',
    run: async (page, ctx) => {
      await fresh(page, ctx);
      const before = await page.evaluate(() => document.querySelectorAll('#list li').length);
      if (before < 3) return false;

      /* Half one: the control is wired. */
      const typed = await setControl(page, '#query', 'כמון', 'input');
      if (!typed || typed.titles.length === 0 || typed.titles.length >= before) return false;

      /*
       * Half two, and the half a working monolith cannot pass: the SAME narrowing
       * happens when the field is changed in state and the screen redrawn, with no
       * event and nobody's handler running. A list stored beside the collection does
       * not move.
       */
      const derived = await page
        .evaluate(async () => {
          const state = await import('./js/state.js');
          const view = await import('./js/render.js');
          const titles = () =>
            [...document.querySelectorAll('#list .item-title')].map((el) => el.textContent);

          state.setState({ query: '' });
          view.render(state.getState());
          await new Promise((resolve) => setTimeout(resolve, 80));
          const wide = titles().length;

          state.setState({ query: 'כמון' });
          view.render(state.getState());
          await new Promise((resolve) => setTimeout(resolve, 80));
          return { wide, narrow: titles().length };
        })
        .catch(() => null);
      return (
        derived !== null && derived.wide === before && derived.narrow < before && derived.narrow > 0
      );
    },
  },

  {
    title: 'רשימת המדפים בפקד הסינון נבנתה מהנתונים',
    expected:
      'ה-`<option>`ים מגיעים מפונקציה שקוראת את האוסף. אף שם מדף אינו כתוב ב-`index.html` חוץ מהאפשרות הראשונה.',
    run: async (page, ctx) => {
      await fresh(page, ctx);
      const result = await page
        .evaluate(async () => {
          const state = await import('./js/state.js');
          await import('./js/render.js');
          return {
            options: [...document.querySelectorAll('#category option')].map((o) => o.value),
            shelves: [...new Set(state.getState().items.map((item) => item.category))],
          };
        })
        .catch(() => null);
      if (result === null) return false;

      const derived = result.options.filter((value) => value !== 'all');
      if (derived.length < 2 || derived.length !== result.shelves.length) return false;
      if (!result.shelves.every((shelf) => derived.includes(shelf))) return false;

      const total = await page.evaluate(() => document.querySelectorAll('#list li').length);
      const filtered = await setControl(page, '#category', result.shelves[0], 'change');
      return filtered !== null && filtered.titles.length > 0 && filtered.titles.length < total;
    },
  },

  {
    /*
     * The stored-derivation check. It replaces the whole collection through `setState`
     * and then asks three different derived things at once — the counter, the filter's
     * options, and the rows. A `visible` array beside `items` fails the third; a stored
     * shelf list fails the second; a hand-maintained counter fails the first.
     */
    title: 'אין גזירה שמורה — החלפת האוסף מעדכנת את המונה, את הפקד ואת הרשימה',
    expected: 'המונה ורשימת המדפים הם פונקציות של האוסף, ואף אחד לא שומר אותם בשדה.',
    run: async (page, ctx) => {
      await fresh(page, ctx);
      const result = await page
        .evaluate(async () => {
          const state = await import('./js/state.js');
          const view = await import('./js/render.js');

          state.setState({
            items: [
              { id: 'z1', title: 'אלף', number: 1, category: 'מדף חדש' },
              { id: 'z2', title: 'בית', number: 2, category: 'מדף חדש' },
            ],
            query: '',
            category: 'all',
          });
          view.render(state.getState());
          await new Promise((resolve) => setTimeout(resolve, 80));

          return {
            titles: [...document.querySelectorAll('#list .item-title')].map((el) => el.textContent),
            count: (document.querySelector('#count')?.textContent ?? '').trim(),
            options: [...document.querySelectorAll('#category option')].map((o) => o.value),
          };
        })
        .catch(() => null);
      if (result === null) return false;
      return (
        result.titles.length === 2 &&
        result.count === '2' &&
        result.options.length === 2 &&
        result.options.includes('מדף חדש')
      );
    },
  },

  {
    /*
     * The two source rules, PAIRED with the fact that the modules actually work — a
     * `js/state.js` with no `document` in it is free on an empty file, and a
     * `js/events.js` with no `createElement` is free on one too. The pairing is the
     * first half: the application has to be running on those modules before the absences
     * mean anything.
     */
    title: 'השכבות נקיות — אין DOM בשכבת האמת, ואין ציור בשכבת האירועים',
    expected:
      '`js/state.js` בלי `document`. `js/events.js` בלי `createElement`, `append` או `innerHTML`. שני הקבצים בשימוש בפועל.',
    run: async (page, ctx) => {
      await fresh(page, ctx);
      const alive = await page
        .evaluate(async () => {
          const state = await import('./js/state.js');
          const view = await import('./js/render.js');
          const events = await import('./js/events.js');
          if (typeof events.wire !== 'function') return null;

          /* The pairing. Two absences in two files are free on two empty files, so the
             application has to be demonstrably RUNNING on those modules first. */
          state.setState({
            items: [{ id: 'ci-live', title: 'חי', number: 1, category: 'בדיקה' }],
            query: '',
            category: 'all',
          });
          view.render(state.getState());
          await new Promise((resolve) => setTimeout(resolve, 80));
          return {
            titles: [...document.querySelectorAll('#list .item-title')].map((el) => el.textContent),
          };
        })
        .catch(() => null);
      if (alive === null || alive.titles.length !== 1 || alive.titles[0] !== 'חי') return false;

      const state = await sourceOf(page, 'js/state.js');
      const events = await sourceOf(page, 'js/events.js');
      if (state === null || events === null) return false;

      const stateCode = code(state);
      const eventsCode = code(events);
      if (/\bdocument\b/.test(stateCode)) return false;
      if (/\b(createElement|appendChild|replaceChildren|innerHTML)\b/.test(eventsCode))
        return false;
      /* Assignment to `hidden` is the quietest way a handler paints. The form's error
         sentence is allowed to be written directly — the form is not rendered from
         state — which is why `textContent` is not refused here. */
      if (/\.hidden\s*=/.test(eventsCode)) return false;
      return /\bsetState\b/.test(eventsCode);
    },
  },
];
