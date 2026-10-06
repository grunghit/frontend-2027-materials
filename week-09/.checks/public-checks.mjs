/**
 * .checks/public-checks.mjs — week 9. CORE-TIER functional checks, and nothing else.
 *
 * RULES, because this file ships to student repositories:
 *   · CORE tier only. Stretch and challenge checks stay in the private grading spec.
 *   · No point values. No grading criteria. `expected` is a hint, never the answer.
 *   · PAIR EVERY NEGATIVE CHECK WITH A POSITIVE ONE. Week 9's version of the trap:
 *     an empty `#list` contains no `innerHTML`, no hard-coded rows and no controls,
 *     so every "there is no X" assertion here also requires that there are rows.
 *   · DO NOT RE-CHECK WHAT THE RUNNER ALREADY CHECKS — required files, HTML validity,
 *     `node --check`, console cleanliness on the ENTRY page, and no horizontal scroll.
 *
 * NOTHING HERE MENTIONS THE FIVE FAULTS OF THE DEBUG CHALLENGE BY NAME. Two checks
 * measure the repaired application's BEHAVIOUR — it boots quietly, every guest is in
 * one of the two lists, and the confirmation counter moves — which is what a student
 * can verify for themselves anyway by reading the five sentences at the top of the
 * file they are fixing. A red row here says "that behaviour is still wrong", never
 * "line 92".
 *
 * The page arrives loaded at `index.html`, 1280x900, over http.
 */

const rowsIn = (page, selector) =>
  page.evaluate((sel) => document.querySelectorAll(sel).length, selector);

/**
 * Add one item through the form and return how many rows there are afterwards.
 * `number` is a year; if `#field-number` has `min` / `max` and the year is outside
 * them (a rating 1–5, say), a number inside the range is sent instead.
 */
const addItem = (page, title, number) =>
  page.evaluate(
    async ({ title, number }) => {
      const form = document.querySelector('#item-form');
      const titleField = document.querySelector('#field-title');
      const numberField = document.querySelector('#field-number');
      if (!form || !titleField || !numberField) return { ok: false };
      const inRange = (preferred) => {
        if (preferred === '') return '';
        const bound = (text) => (text === '' ? NaN : Number(text));
        const lo = bound(numberField.getAttribute('min') ?? '');
        const hi = bound(numberField.getAttribute('max') ?? '');
        const n = Number(preferred);
        const outside = (Number.isFinite(lo) && n < lo) || (Number.isFinite(hi) && n > hi);
        if (!outside) return String(preferred);
        if (Number.isFinite(lo) && Number.isFinite(hi)) return String(Math.round((lo + hi) / 2));
        return String(Number.isFinite(lo) ? Math.ceil(lo) : Math.floor(hi));
      };
      titleField.value = title;
      titleField.dispatchEvent(new Event('input', { bubbles: true }));
      numberField.value = inRange(number);
      numberField.dispatchEvent(new Event('input', { bubbles: true }));
      form.requestSubmit();
      await new Promise((resolve) => setTimeout(resolve, 120));
      return {
        ok: true,
        rows: document.querySelectorAll('#list li').length,
        titles: [...document.querySelectorAll('#list .item-title')].map((el) => el.textContent),
        count: document.querySelector('#count')?.textContent ?? null,
        url: location.href,
      };
    },
    { title, number },
  );

export const publicChecks = [
  {
    /*
     * The rows and their shape in ONE row, because each half is free without the
     * other: an empty list has no hard-coded <li> either, and a file full of
     * hand-written <li> elements has plenty of `.item-title`.
     */
    title: 'הרשימה נבנית מ-JavaScript, ולשורות יש את הצורה שהמטלה מבקשת',
    expected:
      'לפחות שלוש שורות על המסך, לכל אחת `data-id` משלה ו-`.item-title` בתוכה — ואף `<li>` אינו כתוב ב-index.html.',
    run: async (page) => {
      const shape = await page.evaluate(() => {
        const rows = [...document.querySelectorAll('#list li')];
        const ids = rows.map((li) => li.dataset.id).filter(Boolean);
        return {
          rows: rows.length,
          withTitle: rows.filter((li) => li.querySelector('.item-title')).length,
          uniqueIds: new Set(ids).size,
          withButton: rows.filter((li) => li.querySelector('button.remove')).length,
        };
      });
      const src = await (await page.request.get(page.url())).text();
      const markup = src.replace(/<!--[\s\S]*?-->/g, '');
      const handWritten = (markup.match(/<li[\s>]/g) || []).length;
      return (
        shape.rows >= 3 &&
        shape.withTitle === shape.rows &&
        shape.withButton === shape.rows &&
        shape.uniqueIds === shape.rows &&
        handWritten === 0
      );
    },
  },

  {
    title: 'הוספה דרך הטופס מוסיפה שורה, והעמוד לא נטען מחדש',
    expected:
      'מאזין `submit` על הטופס, ובשורה הראשונה שלו `event.preventDefault()`. הכתובת בשורת הכתובת לא משתנה.',
    run: async (page) => {
      const before = await rowsIn(page, '#list li');
      const url = page.url();
      const after = await addItem(page, 'בדיקה אוטומטית', 2024);
      return (
        after.ok &&
        after.rows === before + 1 &&
        after.titles.includes('בדיקה אוטומטית') &&
        after.url === url
      );
    },
  },

  {
    /*
     * THE ROW THIS WEEK EXISTS FOR. A loop that attaches one listener per button at
     * load passes every other check here and fails this one, because the row being
     * removed did not exist when that loop ran.
     */
    title: 'אפשר להסיר שורה שנוספה אחרי הטעינה, בלחיצה על מה שבתוך הכפתור',
    expected:
      'מאזין אחד על אזור הרשימה, ובתוכו `closest` מהאלמנט שנלחץ אל הכפתור. מאזין לכל כפתור אינו מכיר שורה שנוצרה אחריו.',
    run: async (page) => {
      const added = await addItem(page, 'שורה זמנית', 2000);
      if (!added.ok) return false;
      const removed = await page.evaluate(async () => {
        const row = [...document.querySelectorAll('#list li')].at(-1);
        const button = row?.querySelector('button.remove');
        /* Click the INNERMOST element, which is what a real pointer hits. */
        const target = button?.querySelector('*') ?? button;
        if (!target) return null;
        target.dispatchEvent(new MouseEvent('click', { bubbles: true }));
        await new Promise((resolve) => setTimeout(resolve, 120));
        return {
          rows: document.querySelectorAll('#list li').length,
          titles: [...document.querySelectorAll('#list .item-title')].map((el) => el.textContent),
        };
      });
      return (
        removed !== null &&
        removed.rows === added.rows - 1 &&
        !removed.titles.includes('שורה זמנית')
      );
    },
  },

  {
    title: 'המונה והמצב הריק נגזרים מהנתונים',
    expected:
      'המספר ב-`#count` שווה למספר השורות אחרי כל שינוי, ו-`#empty` מוצג כשאין פריטים ומוסתר כשיש. שניהם מחושבים בתוך render.',
    run: async (page) => {
      const withItems = await page.evaluate(() => ({
        rows: document.querySelectorAll('#list li').length,
        count: Number(document.querySelector('#count')?.textContent),
        emptyHidden: document.querySelector('#empty')?.hidden,
      }));
      if (!withItems.rows || withItems.count !== withItems.rows || withItems.emptyHidden !== true)
        return false;

      const emptied = await page.evaluate(async () => {
        for (let guard = 0; guard < 40; guard += 1) {
          const row = document.querySelector('#list li');
          if (!row) break;
          const button = row.querySelector('button.remove');
          const target = button?.querySelector('*') ?? button;
          if (!target) return null;
          target.dispatchEvent(new MouseEvent('click', { bubbles: true }));
          await new Promise((resolve) => setTimeout(resolve, 60));
        }
        return {
          rows: document.querySelectorAll('#list li').length,
          count: Number(document.querySelector('#count')?.textContent),
          emptyHidden: document.querySelector('#empty')?.hidden,
        };
      });
      return (
        emptied !== null &&
        emptied.rows === 0 &&
        emptied.count === 0 &&
        emptied.emptyHidden === false
      );
    },
  },

  {
    title: 'אין innerHTML בקובץ שבונה את הרשימה',
    expected:
      'הכותרות מגיעות מטופס. `createElement` ו-`textContent` בכל מקום שנכנס בו טקסט שמישהו הקליד.',
    run: async (page) => {
      const base = page.url().replace(/\/[^/]*$/, '');
      const source = await (await page.request.get(`${base}/js/app.js`)).text();
      const code = source.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '');
      /* Paired: a file that does nothing also contains no innerHTML. */
      const rows = await rowsIn(page, '#list li');
      return !/\binnerHTML\b/.test(code) && rows >= 3;
    },
  },

  {
    title: 'יישום הניפוי עולה בשקט, וכל מוזמן נמצא באחת משתי הרשימות',
    expected:
      'חמישה מוזמנים בקובץ הנתונים. סכום השורות בשתי הרשימות שווה לחמש, ואף שגיאה לא נרשמת בטעינה.',
    run: async (page) => {
      const entry = page.url();
      const errors = [];
      const onConsole = (m) => {
        if (m.type() === 'error') errors.push(m.text());
      };
      const onPageError = (e) => errors.push(e.message);
      page.on('console', onConsole);
      page.on('pageerror', onPageError);
      try {
        await page.goto(entry.replace(/\/[^/]*$/, '/debug/index.html'), {
          waitUntil: 'networkidle',
        });
        await page.waitForTimeout(400);
        const state = await page.evaluate(() => ({
          seated: document.querySelectorAll('#seated-list li').length,
          waiting: document.querySelectorAll('#waiting-list li').length,
          shown: (document.querySelector('#guest-count')?.textContent || '').trim(),
        }));
        return errors.length === 0 && state.seated + state.waiting === 5 && state.shown === '5';
      } finally {
        page.off('console', onConsole);
        page.off('pageerror', onPageError);
        await page.goto(entry, { waitUntil: 'networkidle' });
      }
    },
  },

  {
    title: 'ביישום הניפוי: סימון אישור הגעה מזיז את המונה, וההסרה עובדת',
    expected:
      'שתי ההתנהגויות אחרי אותו תיקון: מאזין אחד ששורד רינדור מחדש, ואיתור הכפתור מהאלמנט שנלחץ.',
    run: async (page) => {
      const entry = page.url();
      try {
        await page.goto(entry.replace(/\/[^/]*$/, '/debug/index.html'), {
          waitUntil: 'networkidle',
        });
        await page.waitForTimeout(300);
        const result = await page.evaluate(async () => {
          const read = () => ({
            confirmed: Number(document.querySelector('#confirmed-count')?.textContent),
            rows:
              document.querySelectorAll('#seated-list li').length +
              document.querySelectorAll('#waiting-list li').length,
          });
          const before = read();

          const box = document.querySelector('#seated-list li input.confirm:not(:checked)');
          if (!box) return null;
          box.checked = true;
          box.dispatchEvent(new Event('change', { bubbles: true }));
          await new Promise((resolve) => setTimeout(resolve, 120));
          const ticked = read();

          const button = document.querySelector('#seated-list li button.remove');
          const target = button?.querySelector('*') ?? button;
          if (!target) return null;
          target.dispatchEvent(new MouseEvent('click', { bubbles: true }));
          await new Promise((resolve) => setTimeout(resolve, 120));
          const removed = read();

          return { before, ticked, removed };
        });
        return (
          result !== null &&
          result.ticked.confirmed === result.before.confirmed + 1 &&
          result.removed.rows === result.before.rows - 1
        );
      } finally {
        await page.goto(entry, { waitUntil: 'networkidle' });
      }
    },
  },
];
