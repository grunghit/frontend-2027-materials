/**
 * Week 2 — the CORE-TIER public check set that runs in the student's own repo.
 *
 * The publisher copies this file to  starter/.checks/public-checks.mjs  and it is
 * executed by .checks/run-checks.mjs on every push (tools/ci-template/check.yml).
 *
 * RULES (tools/ci-template/checks/public-checks.mjs):
 *   · CORE TIER ONLY. Stretch and challenge checks stay private in grading/specs/.
 *   · No point values, no grading criteria — students learn "does it work", not
 *     "which string does the grader look for".
 *   · `run` returns a plain boolean. `expected` is a hint, never the answer.
 *
 * `page` is already loaded at the entry file, viewport 1280×900.
 *
 * HTML II (week 2 of the restructured course): the form, the table, the time, the skip
 * link, the marked nav link and the CODE HERE markers. `headings-order` is deliberately
 * NOT here: the starter already passes it, and a public check that is green before the
 * student starts teaches nothing (tools/audit-ci-checks.mjs would also refuse it).
 * axe's WCAG run is not here either — it needs the browser-side axe bundle the shared
 * runner does not ship; Lighthouse in DevTools is the student's copy of it.
 */

const FIELDS = 'form input:not([type="submit"]):not([type="button"]):not([type="hidden"]), form textarea, form select';

export const publicChecks = [
  {
    title: 'הטופס: `fieldset` עם `legend`, ארבעה שדות לפחות, כל שדה עם `label` שה-`for` שלו תואם ל-`id`, שדה `required` וכפתור שליחה',
    expected: '`placeholder` הוא לא תווית. לחיצה על המילים חייבת להזיז את הסמן לתוך השדה — תלחץ ותראה.',
    run: async (page) =>
      page.evaluate((sel) => {
        const fields = [...document.querySelectorAll(sel)];
        return (
          !!document.querySelector('form fieldset legend') &&
          fields.length >= 4 &&
          fields.every((el) => !!el.id && !!document.querySelector(`label[for="${CSS.escape(el.id)}"]`)) &&
          !!document.querySelector('form [required]') &&
          !!document.querySelector('form button[type="submit"], form input[type="submit"]')
        );
      }, FIELDS),
  },
  {
    title: 'לכל שדה בטופס יש `name`',
    expected: '`id` הוא לעמוד, `name` הוא לשרת. לחץ Send: כל `name` מופיע בשורת הכתובת. שדה בלי `name` נעלם.',
    run: async (page) =>
      page.evaluate((sel) => {
        const fields = [...document.querySelectorAll(sel)];
        return fields.length > 0 && fields.every((el) => (el.getAttribute('name') || '').trim().length > 0);
      }, FIELDS),
  },
  {
    title: 'שני סוגי קלט לפחות שאינם `text`, ואחד מהם `type="email"`',
    expected: '`email`, `tel`, `number`, `date`, `radio` — כל אחד מביא ולידציה ומקלדת משלו. הדפדפן מסרב לשלוח מייל בלי @.',
    run: async (page) =>
      page.evaluate(() => {
        const types = new Set(
          [...document.querySelectorAll('form input')]
            .map((i) => (i.getAttribute('type') || 'text').toLowerCase())
            .filter((t) => !['text', 'submit', 'button', 'hidden', 'reset'].includes(t)),
        );
        return types.has('email') && types.size >= 2;
      }),
  },
  {
    title: 'טבלה עם `caption`, `thead` שכולו `th scope="col"`, ו-`tbody` עם שתי שורות לפחות',
    expected: '`td` מודגש הוא תא, לא כותרת — פתח את לשונית Accessibility ותראה `cell` במקום `columnheader`.',
    run: async (page) =>
      page.evaluate(
        () =>
          !!document.querySelector('table caption') &&
          document.querySelectorAll('table thead th[scope="col"]').length >= 2 &&
          [...document.querySelectorAll('table thead tr > *')].every((c) => c.tagName === 'TH') &&
          document.querySelectorAll('table tbody tr').length >= 2,
      ),
  },
  {
    title: 'תאריך ב-`time` עם `datetime` בפורמט מכונה',
    expected: 'שנה-חודש-יום: `2027-11-02`. לא "2 Nov 2027", לא רווחים. הטקסט בפנים — איך שתרצה.',
    run: async (page) =>
      page.evaluate(() =>
        [...document.querySelectorAll('time[datetime]')].some((t) => /^\d{4}(-\d{2}(-\d{2})?)?([T ]\d{2}:\d{2})?$/.test(t.getAttribute('datetime') || '')),
      ),
  },
  {
    title: 'קישור דילוג ראשון בעמוד אל `main`, ו-`main` עם `id` ו-`tabindex="-1"`',
    expected: 'לחץ בשורת הכתובת ואז Tab: הדבר הראשון שמסומן הוא הקישור. Enter, ואז `document.activeElement` בקונסול — `main`.',
    run: async (page) =>
      page.evaluate(() => {
        const link = document.querySelector('a[href^="#"]');
        if (!link) return false;
        const target = document.getElementById(link.getAttribute('href').slice(1));
        return !!target && target.tagName === 'MAIN' && target.getAttribute('tabindex') === '-1';
      }),
  },
  {
    title: 'בניווט בדיוק קישור אחד עם `aria-current="page"`, והוא מוביל לעמוד הזה',
    expected: 'הקישור לעמוד שאתה נמצא בו, ורק הוא. ב-`about.html` — הקישור ל-`about.html`.',
    run: async (page) =>
      page.evaluate(() => {
        const here = location.pathname.split('/').pop() || 'index.html';
        const marked = [...document.querySelectorAll('nav a[aria-current="page"]')];
        if (marked.length !== 1) return false;
        const href = (marked[0].getAttribute('href') || '').split('#')[0];
        return ['', '.', './', here, `./${here}`].includes(href);
      }),
  },
  {
    title: 'לא נשארו סימוני `CODE HERE` — לא ב-`index.html` ולא ב-`about.html`',
    expected: 'כל מקום שסומן `CODE HERE` הוא מקום שבו אתה כותב. מחק את הסימון אחרי שכתבת, בשני הקבצים.',
    run: async (page) => {
      const here = await page.evaluate(() => {
        const walker = document.createTreeWalker(document.documentElement, NodeFilter.SHOW_COMMENT);
        while (walker.nextNode()) if (/CODE HERE/.test(walker.currentNode.nodeValue || '')) return false;
        return true;
      });
      if (!here) return false;
      const about = await page.evaluate(async () => {
        try {
          const res = await fetch('about.html');
          if (!res.ok) return false;
          return !/CODE HERE/.test(await res.text());
        } catch {
          return false;
        }
      });
      return about;
    },
  },
];
