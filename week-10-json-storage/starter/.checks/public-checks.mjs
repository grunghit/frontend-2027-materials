/**
 * .checks/public-checks.mjs — week 10. CORE-TIER functional checks, and nothing else.
 *
 * RULES, because this file ships to student repositories:
 *   · CORE tier only (parts א, ב and ג). Parts ד and ה stay in the private spec.
 *   · No point values. No grading criteria. `expected` is a hint, never the answer.
 *   · PAIR EVERY NEGATIVE CHECK WITH A POSITIVE ONE.
 *   · DO NOT RE-CHECK WHAT THE RUNNER ALREADY CHECKS — required files, HTML validity,
 *     `node --check`, console cleanliness on the ENTRY page, and no horizontal scroll.
 *
 * ── THE WEEK-10 TRAP, AND IT IS SHARPER THAN WEEK 9's
 *
 * Week 9's trap was that the starter WORKS, so positive assertions were free. That is
 * still true here. But this week has one of its own, and it is the reason every
 * robustness check below is written in two halves:
 *
 *     AN APPLICATION THAT NEVER READS localStorage PASSES EVERY TEST ABOUT WHAT
 *     HAPPENS WHEN localStorage CONTAINS RUBBISH.
 *
 * "The page still loads when the key holds garbage" is completely true of the starter,
 * which has never opened the key. So the order is always:
 *
 *   1. add an item, DIFF localStorage, and learn the key the student chose,
 *   2. write the student's own string back into it and require the item on screen,
 *   3. and ONLY THEN corrupt it and require the page to survive.
 *
 * ── HOW THIS FILE GRADES A KEY IT DOES NOT KNOW
 *
 * It never guesses a key name and never assumes a payload shape. `capture()` diffs
 * localStorage across one real add, so the key is whatever the student picked, and
 * every payload written later is built by transforming the student's own string. A
 * student who stores `{ version, rows }` and a student who stores `{ v, items }` are
 * doing the same thing, and this file cannot tell them apart — which is correct.
 *
 * Verified by `npm run audit:ci`: 0 green on the starter, all green on the solution.
 *
 * The page arrives loaded at `index.html`, 1280x900, over http.
 */

/** The item this file adds. Distinctive, so it can be recognised inside a payload. */
const MARKER = 'מלפפון חמוץ';

/** Reload the entry page. Every check starts here — the runner shares one page. */
const fresh = async (page, ctx) => {
  await page.goto(`${ctx.serverUrl}/index.html`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(120);
};

/** What the list page says about itself right now. */
const listOf = (page) =>
  page.evaluate(() => ({
    titles: [...document.querySelectorAll('#list .item-title')].map((el) => el.textContent.trim()),
    numbers: [...document.querySelectorAll('#list .item-number')].map((el) =>
      el.textContent.trim(),
    ),
    ids: [...document.querySelectorAll('#list li')].map((li) => li.dataset.id ?? null),
    emptyHidden: document.querySelector('#empty')?.hidden ?? null,
    emptyText: (document.querySelector('#empty')?.textContent ?? '').trim(),
    body: document.body.innerText.trim().length,
  }));

/** Add one item through the form. */
const addItem = (page, title, number, category) =>
  page.evaluate(
    async (a) => {
      const form = document.querySelector('#item-form');
      const fields = ['#field-title', '#field-number', '#field-category'].map((s) =>
        document.querySelector(s),
      );
      if (!form || fields.some((f) => !f)) return false;
      fields[0].value = a.title;
      fields[1].value = String(a.number);
      fields[2].value = a.category;
      form.requestSubmit();
      await new Promise((resolve) => setTimeout(resolve, 180));
      return true;
    },
    { title, number, category },
  );

/** Click the innermost element of a row's button, which is what a real pointer hits. */
const clickRow = (page, buttonSelector) =>
  page.evaluate(async (selector) => {
    const row = document.querySelector('#list li');
    const button = row?.querySelector(selector);
    const target = button?.querySelector('*') ?? button;
    if (!target) return null;
    const out = {
      title: row.querySelector('.item-title')?.textContent.trim() ?? '',
      id: row.dataset.id ?? null,
    };
    target.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    await new Promise((resolve) => setTimeout(resolve, 180));
    return out;
  }, buttonSelector);

/** Read the whole of this origin's localStorage, without ever throwing. */
const dump = (page) =>
  page.evaluate(() => {
    const out = {};
    try {
      for (let i = 0; i < localStorage.length; i += 1) {
        const key = localStorage.key(i);
        out[key] = localStorage.getItem(key);
      }
    } catch {
      /* blocked — an empty dump is the honest answer */
    }
    return out;
  });

/**
 * Add one item and diff localStorage. Returns the key the application chose and the
 * exact string it wrote, or null if it wrote nothing at all.
 */
async function capture(page, ctx) {
  await fresh(page, ctx);
  const before = await dump(page);
  if (!(await addItem(page, MARKER, 7, 'בדיקה'))) return null;
  const after = await dump(page);

  const changed = Object.keys(after).filter((key) => after[key] !== before[key]);
  if (changed.length === 0) return null;
  const mentioning = changed.filter((key) => after[key].includes(MARKER));
  const key = (mentioning.length ? mentioning : changed)[0];
  return { key, raw: after[key] };
}

/** Put an exact string under an exact key, reload, and report what is on screen. */
async function bootWith(page, ctx, key, value) {
  const errors = [];
  const onError = (e) => errors.push(e.message);
  page.on('pageerror', onError);
  await page.evaluate(
    ({ key, value }) => {
      try {
        if (value === null) localStorage.removeItem(key);
        else localStorage.setItem(key, value);
      } catch {
        /* blocked */
      }
    },
    { key, value },
  );
  await page.goto(`${ctx.serverUrl}/index.html`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(200);
  const state = await listOf(page);
  page.off('pageerror', onError);
  return { ...state, errors };
}

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

export const publicChecks = [
  {
    /*
     * THE ROW THIS WEEK EXISTS FOR, and the only one that needs no pairing: adding an
     * item and reloading is a claim no un-persisted application can pass by accident.
     */
    title: 'פריט שנוסף שורד רענון של העמוד',
    expected:
      'הוספת פריט דרך הטופס, טעינה מחדש של העמוד, והפריט עדיין ברשימה. אם הוא נעלם — או שאף אחד לא כתב, או שאף אחד לא קרא.',
    run: async (page, ctx) => {
      await fresh(page, ctx);
      const before = await listOf(page);
      if (!(await addItem(page, MARKER, 7, 'בדיקה'))) return false;
      const added = await listOf(page);
      if (!added.titles.includes(MARKER)) return false;

      await page.goto(`${ctx.serverUrl}/index.html`, { waitUntil: 'networkidle' });
      await page.waitForTimeout(220);
      const after = await listOf(page);
      return after.titles.includes(MARKER) && after.titles.length === before.titles.length + 1;
    },
  },

  {
    title: 'המפתח משויך לפרויקט ונושא גרסה',
    expected:
      'כל פרויקט שלך מוגש מ-http://127.0.0.1:5500 — אותו origin — ולכן `items` הוא מפתח שכמה יישומים שלך חולקים. נדרש מפריד וסימון גרסה.',
    run: async (page, ctx) => {
      const found = await capture(page, ctx);
      if (found === null) return false;
      const key = found.key;
      return key.length >= 6 && /[.:_/-]/.test(key) && (/v\.?\d/i.test(key) || /\d+$/.test(key));
    },
  },

  {
    /*
     * The U of CRUD. Both halves in one check, because each is free without the other:
     * a form that fills itself and never saves passes the first, and a submit that
     * always adds passes the second while adding a row.
     */
    title: 'עריכה — הכפתור פותח את הפריט בטופס, והשמירה משנה אותו ולא מוסיפה חדש',
    expected:
      'לכל שורה `button.edit`. לחיצה עליו ממלאת את הטופס בערכי הפריט; שליחה מחליפה את הפריט הקיים — אותו `data-id`, אותה כמות שורות.',
    run: async (page, ctx) => {
      await fresh(page, ctx);
      const before = await listOf(page);
      if (before.titles.length < 2) return false;

      const target = await clickRow(page, 'button.edit');
      if (target === null) return false;

      const filled = await page.evaluate(() => document.querySelector('#field-title')?.value ?? '');
      if (filled !== target.title) return false;

      await page.evaluate(async () => {
        document.querySelector('#field-number').value = '42';
        document.querySelector('#item-form').requestSubmit();
        await new Promise((resolve) => setTimeout(resolve, 180));
      });

      const after = await listOf(page);
      const index = after.ids.indexOf(target.id);
      return (
        after.titles.length === before.titles.length &&
        index !== -1 &&
        after.numbers[index] === '42'
      );
    },
  },

  {
    title: 'עריכה והסרה שורדות רענון',
    expected:
      'ההסרה היא הפעולה שהכי קל לשכוח לשמור, כי על המסך היא נראית מיד. שתי הפעולות, ואז טעינה מחדש.',
    run: async (page, ctx) => {
      await fresh(page, ctx);
      const before = await listOf(page);
      if (before.titles.length < 2) return false;

      const edited = await clickRow(page, 'button.edit');
      if (edited === null) return false;
      await page.evaluate(async () => {
        document.querySelector('#field-number').value = '77';
        document.querySelector('#item-form').requestSubmit();
        await new Promise((resolve) => setTimeout(resolve, 180));
      });

      const removed = await page.evaluate(async () => {
        const rows = [...document.querySelectorAll('#list li')];
        const row = rows[rows.length - 1];
        const button = row?.querySelector('button.remove');
        const target = button?.querySelector('*') ?? button;
        if (!target) return null;
        const title = row.querySelector('.item-title')?.textContent.trim() ?? '';
        target.dispatchEvent(new MouseEvent('click', { bubbles: true }));
        await new Promise((resolve) => setTimeout(resolve, 180));
        return title;
      });
      if (removed === null) return false;

      await page.goto(`${ctx.serverUrl}/index.html`, { waitUntil: 'networkidle' });
      await page.waitForTimeout(220);
      const after = await listOf(page);
      const index = after.ids.indexOf(edited.id);
      return (
        index !== -1 &&
        after.numbers[index] === '77' &&
        !after.titles.includes(removed) &&
        after.titles.length === before.titles.length - 1
      );
    },
  },

  {
    /*
     * PAIRED, and this is the pairing the week turns on. Half one proves the key is
     * read at all — without it, an application that has never opened localStorage
     * passes "survives garbage" perfectly.
     */
    title: 'זבל במפתח לא מפיל את היישום — והיישום באמת קורא את המפתח',
    expected:
      'כתיבה חזרה של המחרוזת שהיישום עצמו ייצר מחזירה את הפריט; ואז מחרוזת פגומה באותו מפתח, והעמוד עדיין עולה ומצייר.',
    run: async (page, ctx) => {
      const found = await capture(page, ctx);
      if (found === null) return false;

      const restored = await bootWith(page, ctx, found.key, found.raw);
      if (!restored.titles.includes(MARKER)) return false;

      const garbage = await bootWith(page, ctx, found.key, '{{{ not json at all');
      return garbage.errors.length === 0 && garbage.body > 0;
    },
  },

  {
    title: 'JSON תקין שאינו הנתונים שלך גם הוא לא מפיל את היישום',
    expected:
      '`JSON.parse` שהצליח אומר שהמחרוזת תקינה, ולא כלום על המבנה. גם `null` הוא JSON תקין, וגם `JSON.parse(null)` אינו זורק.',
    run: async (page, ctx) => {
      const found = await capture(page, ctx);
      if (found === null) return false;
      const restored = await bootWith(page, ctx, found.key, found.raw);
      if (!restored.titles.includes(MARKER)) return false;

      for (const payload of ['null', '{"items":"שלום"}', '[1,2,3]', '{"items":[{"nope":true}]}']) {
        const boot = await bootWith(page, ctx, found.key, payload);
        if (boot.errors.length > 0 || boot.body === 0) return false;
      }
      return true;
    },
  },

  {
    title: 'ניקוי הכול שואל קודם, ומה שנוקה נשאר נקי אחרי רענון',
    expected:
      'ביטול האישור לא משנה כלום; אישור מרוקן; ורענון אחריו לא מחזיר את נתוני הדוגמה. מי שמחק את המפתח במקום לשמור אוסף ריק נופל בשלישי.',
    run: async (page, ctx) => {
      await fresh(page, ctx);
      if ((await page.locator('#clear-all').count()) === 0) return false;

      const before = await listOf(page);
      if (before.titles.length === 0) return false;

      const dismiss = (dialog) => dialog.dismiss();
      page.on('dialog', dismiss);
      await page.locator('#clear-all').click();
      await page.waitForTimeout(200);
      const afterDismiss = await listOf(page);
      page.off('dialog', dismiss);
      if (afterDismiss.titles.length !== before.titles.length) return false;

      const accept = (dialog) => dialog.accept();
      page.on('dialog', accept);
      await page.locator('#clear-all').click();
      await page.waitForTimeout(200);
      const afterAccept = await listOf(page);
      page.off('dialog', accept);
      if (afterAccept.titles.length !== 0) return false;
      if (afterAccept.emptyHidden !== false || afterAccept.emptyText.length <= 8) return false;

      await page.goto(`${ctx.serverUrl}/index.html`, { waitUntil: 'networkidle' });
      await page.waitForTimeout(220);
      const afterReload = await listOf(page);
      return afterReload.titles.length === 0 && afterReload.emptyHidden === false;
    },
  },

  {
    /*
     * The three source rules, PAIRED with the fact that persistence works. "There is no
     * localStorage in render.js" is free on every application that has not started, and
     * so is "there is no document in storage.js" on a file that is still a skeleton.
     */
    title: 'השכבות נקיות — האחסון לא נוגע ב-DOM, והציור והאירועים לא יודעים ששומרים',
    expected:
      '`js/storage.js` בלי `document`. `js/render.js` ו-`js/events.js` בלי `localStorage` ובלי `JSON`, ובלי קריאה ל-save. כל שלושת הקבצים בשימוש בפועל.',
    run: async (page, ctx) => {
      const found = await capture(page, ctx);
      if (found === null) return false;
      const restored = await bootWith(page, ctx, found.key, found.raw);
      if (!restored.titles.includes(MARKER)) return false;

      const [storage, render, events] = await Promise.all([
        sourceOf(page, 'js/storage.js'),
        sourceOf(page, 'js/render.js'),
        sourceOf(page, 'js/events.js'),
      ]);
      if (storage === null || render === null || events === null) return false;

      const storageCode = code(storage);
      const renderCode = code(render);
      const eventsCode = code(events);

      if (/\bdocument\b|querySelector/.test(storageCode)) return false;
      if (/localStorage|sessionStorage|JSON\s*\./.test(renderCode)) return false;
      if (/localStorage|sessionStorage|JSON\s*\./.test(eventsCode)) return false;
      /* A handler that saves by hand works, and it is the habit this week removes:
         the day somebody adds a fifth handler there is a fifth chance to forget. */
      if (/\b(save|persist)\s*\(/.test(eventsCode)) return false;
      return /\bsetState\b/.test(eventsCode);
    },
  },
];
