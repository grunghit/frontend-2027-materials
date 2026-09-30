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

/**
 * CODE HERE markers left at the core tier — the grader's rule (grading/lib/checks.mjs,
 * markersLeft at CORE_ROW). A marker tagged {stretch} / {challenge} / {optional} (or
 * data-tier="…") may stay: on its own line, on the opening tag it sits inside (Prettier
 * moves `data-tier` onto a line of its own), or by a next non-empty line that is only
 * `<!-- {stretch} -->` (Prettier moves a trailing comment there).
 */
const SKIP = ['stretch', 'challenge', 'optional'];
const tierTagged = (text) =>
  SKIP.some((t) => text.includes(`{${t}}`) || new RegExp(`data-tier\\s*=\\s*["']${t}["']`).test(text));
const tierCommentOnly = (line) => {
  const m = line.match(/^\s*<!--\s*\{([a-z]+)\}\s*-->\s*$/);
  return m !== null && SKIP.includes(m[1]);
};
function enclosingTag(text, at, end) {
  const lt = text.lastIndexOf('<', at);
  if (lt === -1 || !/[a-zA-Z]/.test(text[lt + 1] || '')) return null;
  if (text.lastIndexOf('>', at) > lt) return null;
  const gt = text.indexOf('>', end);
  const after = text.indexOf('<', end);
  if (gt === -1 || (after !== -1 && after < gt)) return null;
  return text.slice(lt, gt + 1);
}
function markersLeft(src) {
  const all = src.split(/\r?\n/);
  let count = 0;
  let offset = 0;
  all.forEach((line, i) => {
    const start = offset;
    offset += line.length + (src[start + line.length] === '\r' ? 2 : 1);
    if (!/CODE HERE/.test(line) || tierTagged(line)) return;
    const next = all.slice(i + 1).find((l) => l.trim() !== '');
    if (next !== undefined && tierCommentOnly(next)) return;
    for (const m of line.matchAll(/CODE HERE/g)) {
      const at = start + m.index;
      const tag = enclosingTag(src, at, at + m[0].length);
      if (tag === null || !tierTagged(tag)) count++;
    }
  });
  return count;
}
/** True when no core marker is left in `text` (a fetch that failed is never clean). */
const clean = (text) => typeof text === 'string' && markersLeft(text) === 0;

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
      page.evaluate(() => {
        // The same forms the grader accepts (the HTML standard's valid datetime strings):
        // month, date, yearless date, time, local and global date-time, offset, week,
        // year, and a duration — so `19:30` is green here as it is in the grade.
        const TIME = '\\d{2}:\\d{2}(:\\d{2}(\\.\\d{1,3})?)?';
        const OFFSET = '(Z|[+-]\\d{2}:?\\d{2})';
        const valid = new RegExp(
          '^(' +
            [
              '\\d{4,}-\\d{2}',
              '\\d{4,}-\\d{2}-\\d{2}',
              '(--)?\\d{2}-\\d{2}',
              TIME,
              `\\d{4,}-\\d{2}-\\d{2}[T ]${TIME}`,
              OFFSET,
              `\\d{4,}-\\d{2}-\\d{2}[T ]${TIME}${OFFSET}`,
              '\\d{4,}-W\\d{2}',
              '(?=\\d*[1-9])\\d{4,}',
              'P(?=.)(\\d+D)?(T(?=.)(\\d+H)?(\\d+M)?(\\d+(\\.\\d{1,3})?S)?)?',
              '\\d+(\\.\\d{1,3})?[wdhms](\\s+\\d+(\\.\\d{1,3})?[wdhms])*',
            ].join('|') +
            ')$',
        );
        return [...document.querySelectorAll('time[datetime]')].some((t) => valid.test(t.getAttribute('datetime') || ''));
      }),
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
    title: 'לא נשארו סימוני `CODE HERE` של הליבה — לא ב-`index.html` ולא ב-`about.html`',
    expected: 'כל מקום שסומן `CODE HERE` הוא מקום שבו אתה כותב. מחק את הסימון אחרי שכתבת, בשני הקבצים. כל סימון `CODE HERE` של הליבה חייב להיעלם; סימון שבשורה שלו כתוב גם שם השכבה בסוגריים מסולסלים (`stretch`, `challenge` או `optional`) מותר להשאיר אם דילגת על החלק הזה.',
    /* The FILES are read, not the DOM: a comment above <html> is outside documentElement,
       and the grader reads the files. Same rule as the grader (grading/lib/checks.mjs,
       markersLeft): a marker tagged {stretch}, {challenge} or {optional} may stay — see markersLeft above. */
    run: async (page) => {
      const texts = await page.evaluate(async () => {
        const out = [];
        for (const url of [location.href, 'about.html']) {
          try {
            const res = await fetch(url);
            out.push(res.ok ? await res.text() : null);
          } catch {
            out.push(null);
          }
        }
        return out;
      });
      return texts.every(clean);
    },
  },
];
