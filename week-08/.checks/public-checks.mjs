/**
 * .checks/public-checks.mjs — week 8. CORE-TIER functional checks, and nothing else.
 *
 * RULES, because this file ships to student repositories:
 *   · CORE tier only. Stretch and challenge checks stay in the private grading spec.
 *   · No point values. No grading criteria. `expected` is a hint, never the answer.
 *   · PAIR EVERY NEGATIVE CHECK WITH A POSITIVE ONE. Week 8's version of the trap is
 *     sharper than any before it: `js/exercises.js` ships with bodies that return
 *     their own argument, so "it did not mutate the input" is TRUE of a file nobody
 *     has touched. A function that does nothing has certainly not mutated anything.
 *     Every non-mutation assertion below therefore also asserts that the function
 *     returns the right answer.
 *   · DO NOT RE-CHECK WHAT THE RUNNER ALREADY CHECKS — required files, HTML validity,
 *     `node --check`, console cleanliness, and no horizontal scroll at 375/768/1280.
 *
 * ALSO DELIBERATELY ABSENT: a "the three pages link to each other" check. The starter
 * ships them already linked, so it would be green before any work was done and would
 * teach the wrong thing about what green means. It is graded privately.
 *
 * The page arrives loaded at `index.html`, 1280x900, over http. Two checks navigate
 * to `exercises.html`; both restore the entry page in a `finally`, because the runner
 * loads the entry ONCE and hands the same page to every check after it.
 */

/** Import a module from the submission and call one export, in the page. */
const call = (page, relPath, fnName, args) =>
  page.evaluate(
    async ({ relPath, fnName, args }) => {
      const mod = await import(`./${relPath}`);
      if (typeof mod[fnName] !== 'function') return { missing: true };
      try {
        return { value: mod[fnName](...args) };
      } catch (err) {
        return { threw: `${err.name}: ${err.message}` };
      }
    },
    { relPath, fnName, args },
  );

const ITEMS = [
  { id: 'a1', title: 'Kid A', artist: 'Radiohead', year: 2000, rating: 5 },
  { id: 'a2', title: 'אביב גפן', artist: 'אביב גפן', year: 1993, rating: 3 },
  { id: 'a3', title: 'OK Computer', artist: 'Radiohead', year: 1997, rating: 5 },
  { id: 'a4', title: 'Debut', artist: 'Björk', rating: 0 },
];

const titles = (list) => (Array.isArray(list) ? list.map((i) => i && i.title) : null);
const same = (a, b) => JSON.stringify(a) === JSON.stringify(b);

/**
 * CODE HERE markers left at the stretch tier — the grader's rule (grading/lib/checks.mjs,
 * markersLeft at STRETCH_ROW). A marker tagged {challenge} / data-tier="challenge" (or
 * optional) may stay: on its own line, on the opening tag it sits inside (Prettier moves
 * `data-tier` onto a line of its own), or by a next non-empty line that is only
 * `<!-- {challenge} -->` (Prettier moves a trailing comment there).
 */
const SKIP = ['challenge', 'optional'];
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
function markersLeft(html) {
  const all = html.split(/\r?\n/);
  let count = 0;
  let offset = 0;
  all.forEach((line, i) => {
    const start = offset;
    offset += line.length + (html[start + line.length] === '\r' ? 2 : 1);
    if (!/CODE-HERE|CODE HERE/.test(line) || tierTagged(line)) return;
    const next = all.slice(i + 1).find((l) => l.trim() !== '');
    if (next !== undefined && tierCommentOnly(next)) return;
    for (const m of line.matchAll(/CODE-HERE|CODE HERE/g)) {
      const at = start + m.index;
      const tag = enclosingTag(html, at, at + m[0].length);
      if (tag === null || !tierTagged(tag)) count++;
    }
  });
  return count;
}

export const publicChecks = [
  {
    /*
     * The export names are asserted INSIDE this row rather than as one of their own.
     * The starter already exports all four — they are stubs — so a standalone
     * "the four functions are exported" row is green before any work is done. The
     * audit found it; this is the pairing.
     */
    title: 'filterByQuery מתעלמת מאותיות גדולות וקטנות ומרווחים מסביב',
    expected:
      'נרמל את מה שהוקלד פעם אחת, בשורה הראשונה, ואל תדאג לזה שוב. השמות המיוצאים הם בדיוק אלה שב-JSDoc.',
    run: async (page) => {
      const found = await page.evaluate(async () => Object.keys(await import('./js/exercises.js')));
      const named = ['filterByQuery', 'sortItems', 'countByArtist', 'summarise'].every((n) =>
        found.includes(n),
      );
      const a = await call(page, 'js/exercises.js', 'filterByQuery', [ITEMS, '  KID a  ']);
      const b = await call(page, 'js/exercises.js', 'filterByQuery', [ITEMS, 'אביב']);
      return named && same(titles(a.value), ['Kid A']) && same(titles(b.value), ['אביב גפן']);
    },
  },

  {
    /*
     * Paired. "An empty query returns everything" is true of a body that returns its
     * own argument, which is what the starter ships — so the row also requires that a
     * real query returns FEWER. The audit found the unpaired version green on the
     * untouched starter.
     */
    title: 'חיפוש ריק מחזיר הכול, וחיפוש אמיתי מצמצם',
    expected:
      'חיפוש ריק פירושו "בלי סינון", ושדה שרק רווחים הוקלדו בו הוא ריק גם הוא. וחיפוש שכן הוקלד בו משהו מחזיר פחות.',
    run: async (page) => {
      const empty = await call(page, 'js/exercises.js', 'filterByQuery', [ITEMS, '']);
      const spaces = await call(page, 'js/exercises.js', 'filterByQuery', [ITEMS, '   ']);
      const real = await call(page, 'js/exercises.js', 'filterByQuery', [ITEMS, 'radio']);
      return (
        empty.value &&
        empty.value.length === 4 &&
        spaces.value &&
        spaces.value.length === 4 &&
        real.value &&
        real.value.length === 0
      );
    },
  },

  {
    title: 'sortItems ממיינת נכון — וגם משאירה את המערך שקיבלה בסדר שבו הגיע',
    expected:
      'שתי הדרישות יחד. `sort` ממיין במקום ומחזיר את אותו מערך, ולכן צריך למיין עותק. ומיון טקסט בעברית דורש משווה.',
    run: async (page) => {
      const order = await page.evaluate(async (items) => {
        const { sortItems } = await import('./js/exercises.js');
        const before = items.map((i) => i.title);
        const sorted = sortItems(items, 'title');
        return { before, after: items.map((i) => i.title), sorted: sorted.map((i) => i.title) };
      }, ITEMS);

      const untouched = same(order.before, order.after);
      const correct = same(order.sorted, ['אביב גפן', 'Debut', 'Kid A', 'OK Computer']);
      return untouched && correct;
    },
  },

  {
    title: 'summarise מבדילה בין "אף אחד לא דירג" לבין "כולם קיבלו אפס"',
    expected:
      'הממוצע מתעלם מפריטים שלא דורגו. אוסף שאף פריט בו לא דורג מחזיר `null` בשדה הממוצע, לא 0.',
    run: async (page) => {
      const a = await call(page, 'js/exercises.js', 'summarise', [ITEMS]);
      const b = await call(page, 'js/exercises.js', 'summarise', [
        [{ id: 'z', title: 'z', artist: 'z', rating: 0 }],
      ]);
      return (
        a.value &&
        a.value.rated === 3 &&
        a.value.average === 4.3 &&
        b.value &&
        b.value.average === null
      );
    },
  },

  {
    title: 'הפונקציה שתוקנה בחלק ג מחזירה את אותה תשובה, ולא נוגעת במערך',
    expected:
      'התיקון הוא שינוי אחד וקטן. ערך ההחזרה חייב להישאר בדיוק מה שהיה — אם הוא השתנה, תוקן משהו אחר.',
    run: async (page) => {
      const out = await page.evaluate(async (items) => {
        const { topRated } = await import('./js/review.js');
        const before = items.map((i) => i.title);
        const got = topRated(items, 2);
        return { before, after: items.map((i) => i.title), got: got.map((i) => i.title) };
      }, ITEMS);
      return same(out.before, out.after) && same(out.got, ['Kid A', 'OK Computer']);
    },
  },

  {
    title: 'לא נשארו סימני CODE HERE בשלושת העמודים, ויש בהם תוכן',
    expected:
      'מחק את הסימן כשסיימת עם המקום שהוא מסמן. ברשימה צריכים להיות לפחות שלושה פריטים שכתבת בעצמך. `item.html` ו-`summary.html` הם שכבת האתגר: סימון שבשורה שלו כתוב גם `challenge` בסוגריים מסולסלים או ב-`data-tier` מותר להשאיר אם דילגת על החלק הזה.',
    run: async (page, ctx) => {
      const base = page.url().replace(/\/[^/]*$/, '');
      let clean = true;
      for (const name of ['index.html', 'item.html', 'summary.html']) {
        const res = await page.request.get(`${base}/${name}`);
        const html = await res.text();
        if (markersLeft(html) > 0) clean = false;
      }
      const rows = await page.evaluate(() => {
        const mount = document.querySelector('#list') || document.querySelector('main ul');
        return mount ? mount.querySelectorAll(':scope > li').length : 0;
      });
      return clean && rows >= 3;
    },
  },

  {
    title: 'שדה החיפוש ובורר המיון נמצאים מחוץ לאזור הרשימה',
    expected:
      'בשבוע 10 אזור הרשימה מתרוקן ומתמלא מחדש בכל שינוי. פקד שנהרס בזמן שמקלידים בו מאבד את הטקסט ואת הפוקוס.',
    run: async (page) => {
      const report = await page.evaluate(() => {
        const mount = document.querySelector('#list') || document.querySelector('main ul');
        if (!mount) return null;
        return {
          inside: mount.querySelectorAll('input, select, textarea').length,
          /* The whole page, like the grader: a toolbar in <header> counts too. */
          total: document.querySelectorAll('input, select').length,
          rows: mount.querySelectorAll(':scope > li').length,
        };
      });
      if (report === null) return false;
      /* Paired: an empty list contains no controls either. */
      return report.inside === 0 && report.total > 0 && report.rows >= 3;
    },
  },

  {
    title: 'המספר בעמוד הסיכום מסכים עם מספר השורות ברשימה',
    expected:
      'עמוד הסיכום אינו מחזיק נתונים משלו — כל מספר בו נספר מהרשימה. אם כתבת ארבעה פריטים, הוא אומר 4 (בספרות, לבד או בתוך משפט).',
    run: async (page, ctx) => {
      const entry = page.url();
      try {
        const listed = await page.evaluate(() => {
          const mount = document.querySelector('#list') || document.querySelector('main ul');
          return mount ? mount.querySelectorAll(':scope > li').length : 0;
        });
        if (listed === 0) return false;

        await page.goto(`${ctx.serverUrl}/summary.html`, { waitUntil: 'networkidle' });
        /* Every whole number in digits inside main — "4" and "4 פריטים" both count. */
        const numbers = await page.evaluate(() => {
          const root = document.querySelector('main');
          if (!root) return [];
          const found = [];
          const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
          for (let node = walker.nextNode(); node; node = walker.nextNode()) {
            for (const token of node.nodeValue.match(/\d+(?:[.,]\d+)*/g) ?? []) {
              if (/^\d+$/.test(token)) found.push(Number(token));
            }
          }
          return found;
        });
        return numbers.includes(listed);
      } finally {
        /* The runner hands the SAME page to every check after this one. */
        await page.goto(entry, { waitUntil: 'networkidle' });
      }
    },
  },
];

export default publicChecks;
