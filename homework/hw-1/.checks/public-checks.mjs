/**
 * Home assignment 1 — the CORE-TIER public check set that runs in the student's own repo.
 *
 * The publisher copies this file to  starter/.checks/public-checks.mjs  and it is
 * executed by .checks/run-checks.mjs on every push (tools/ci-template/check.yml).
 *
 * RULES (tools/ci-template/checks/public-checks.mjs):
 *   · CORE TIER ONLY. Stretch and challenge checks stay private in grading/specs/.
 *   · No point values, no grading criteria.
 *   · `run` returns a plain boolean. `expected` is a hint, never the answer.
 *
 * `run(page, ctx)` — the page is loaded at index.html, viewport 1280×900, served over
 * http. `ctx.serverUrl` is the origin, which is what makes the cross-page checks below
 * possible. THE RUNNER DOES NOT RE-NAVIGATE BETWEEN CHECKS, so any check that visits
 * another page must come back to index.html before it returns — see `onPage`.
 */

const PAGES = ['index.html', 'about.html', 'notes.html'];

/** Visit `rel`, run `fn`, and always return the page to index.html afterwards. */
async function onPage(page, ctx, rel, fn) {
  try {
    await page.goto(`${ctx.serverUrl}/${rel}`, { waitUntil: 'networkidle' });
    return await fn();
  } finally {
    await page.goto(`${ctx.serverUrl}/index.html`, { waitUntil: 'networkidle' });
  }
}

/** The four values that decide whether two pages look like one site. */
const groundOf = () => ({
  family: getComputedStyle(document.body).fontFamily,
  background: getComputedStyle(document.body).backgroundColor,
  color: getComputedStyle(document.body).color,
  size: getComputedStyle(document.body).fontSize,
});

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
    title: 'שלושת העמודים קיימים, וכל אחד מקשר לשני האחרים',
    expected:
      'אותו `nav` בשלושת העמודים, עם קישור יחסי לכל אחד משלושתם. `index.html` · `about.html` · `notes.html`.',
    run: async (page, ctx) => {
      for (const rel of PAGES) {
        const links = await onPage(page, ctx, rel, () =>
          page.evaluate(() =>
            /* Resolved against the page, as the grader does: `about.html`,
               `./about.html` and `/about.html` are the same link; `./` is home. */
            [...document.querySelectorAll('nav a[href]')].map((a) => {
              const url = new URL(a.getAttribute('href') || '', location.href);
              if (url.origin !== location.origin) return url.href;
              const dir = location.pathname.slice(0, location.pathname.lastIndexOf('/') + 1);
          if (!url.pathname.startsWith(dir)) return url.pathname; // another folder is another page
          return url.pathname.slice(dir.length) || 'index.html';
            }),
          ),
        );
        if (!PAGES.every((target) => links.includes(target))) return false;
      }
      return true;
    },
  },
  {
    title: 'יש בדיוק גליון סגנונות אחד, והוא מחובר לשלושת העמודים',
    expected: 'קובץ `.css` אחד. אין `<style>` ואין `style=""`. שורת `link` זהה בשלושת העמודים.',
    run: async (page, ctx) => {
      for (const rel of PAGES) {
        const report = await onPage(page, ctx, rel, () =>
          page.evaluate(() => {
            const sheets = [...document.querySelectorAll('link[rel="stylesheet"]')].map(
              (l) => (l.getAttribute('href') || '').split('?')[0],
            );
            let rules = 0;
            for (const sheet of document.styleSheets) {
              try {
                rules += sheet.cssRules.length;
              } catch {
                /* cross-origin */
              }
            }
            return { sheets, inline: document.querySelectorAll('style').length, rules };
          }),
        );
        if (report.sheets.length !== 1) return false;
        if (report.inline > 0) return false;
        if (report.rules < 10) return false;
      }
      return true;
    },
  },
  {
    title: 'שלושת העמודים נראים כמו אתר אחד',
    expected:
      'אותו גופן, אותו רקע, אותו צבע טקסט ואותו גודל בסיס בשלושתם — כי כולם מצביעים על אותו קובץ.',
    run: async (page, ctx) => {
      const grounds = [];
      for (const rel of PAGES) {
        grounds.push(await onPage(page, ctx, rel, () => page.evaluate(groundOf)));
      }
      const [first] = grounds;
      if (/rgba\(0, 0, 0, 0\)|transparent/.test(first.background)) return false;
      return grounds.every((g) => JSON.stringify(g) === JSON.stringify(first));
    },
  },
  {
    title: 'קיימת ערכת טוקנים על `:root`',
    expected:
      'לפחות חמישה `--color-*`, חמישה `--space-*`, שני `--radius-*` ושלושה `--font-*`, כולם בבלוק `:root`.',
    run: async (page) =>
      page.evaluate(() => {
        const names = new Set();
        for (const sheet of document.styleSheets) {
          let rules;
          try {
            rules = sheet.cssRules;
          } catch {
            continue;
          }
          for (const rule of rules) {
            if (!rule.style || !rule.selectorText) continue;
            if (
              !/(^|,)\s*:root\s*(,|$)/.test(rule.selectorText) &&
              rule.selectorText.trim() !== 'html'
            )
              continue;
            for (const prop of rule.style) if (prop.startsWith('--')) names.add(prop);
          }
        }
        const count = (prefix) => [...names].filter((n) => n.startsWith(prefix)).length;
        return (
          count('--color-') >= 5 &&
          count('--space-') >= 5 &&
          count('--radius-') >= 2 &&
          count('--font-') >= 3
        );
      }),
  },
  {
    title: 'לכל עמוד מבנה סמנטי מלא',
    expected: '`header`, `nav`, `main` יחיד, `footer`, וכותרת ראשית אחת בדיוק.',
    run: async (page, ctx) => {
      for (const rel of PAGES) {
        const ok = await onPage(page, ctx, rel, () =>
          page.evaluate(
            () =>
              !!document.querySelector('header') &&
              !!document.querySelector('nav ul li a') &&
              document.querySelectorAll('main').length === 1 &&
              !!document.querySelector('footer') &&
              document.querySelectorAll('h1').length === 1,
          ),
        );
        if (!ok) return false;
      }
      return true;
    },
  },
  {
    title: 'העמוד השלישי מכיל תוכן אמיתי',
    expected:
      'שני `section` עם `h2`, שני `article` לפחות, `blockquote` אחד לפחות, ו-`time` עם `datetime`. וכותרת עמוד משלך.',
    run: async (page, ctx) =>
      onPage(page, ctx, 'notes.html', () =>
        page.evaluate(() => {
          const title = (document.title || '').trim();
          if (title.length < 3 || /change me|untitled/i.test(title)) return false;
          return (
            document.querySelectorAll('main section h2').length >= 2 &&
            document.querySelectorAll('article').length >= 2 &&
            document.querySelectorAll('blockquote').length >= 1 &&
            document.querySelectorAll('time[datetime]').length >= 1
          );
        }),
      ),
  },
  {
    title: '`box-sizing: border-box` וסולם טיפוגרפי',
    expected:
      'שלוש שורות האיפוס בראש הגליון, `h1` גדולה מ-`h2`, וגובה שורה צפוף יותר לכותרות מאשר לגוף הטקסט.',
    run: async (page) =>
      page.evaluate(() => {
        if (getComputedStyle(document.body).boxSizing !== 'border-box') return false;
        const read = (sel) => {
          const el = document.querySelector(sel);
          if (!el) return null;
          const s = getComputedStyle(el);
          const size = parseFloat(s.fontSize);
          return { size, leading: parseFloat(s.lineHeight) / size };
        };
        const body = read('body');
        const h1 = read('h1');
        const h2 = read('h2');
        if (!body || !h1 || !h2) return false;
        return h1.size > h2.size && h2.size >= body.size && h1.leading < body.leading;
      }),
  },
  {
    title:
      'שלושת העמודים מעוצבים מטוקנים, ובתוך המגבלות: בלי Flexbox, בלי Grid, בלי מיקום ובלי `!important`',
    expected: 'הכול בזרימה רגילה. `display: flex` הוא שבוע 4, `display: grid` הוא שבוע 5.',
    run: async (page, ctx) => {
      for (const rel of PAGES) {
        const ok = await onPage(page, ctx, rel, () =>
          page.evaluate(() => {
            /* THE POSITIVE HALF, and it is why this row is not a free pass. "No
               Flexbox, no Grid, no positioning, no !important" is ALL TRUE of a
               page with no CSS whatsoever. What is being marked is that the page
               IS styled — from a token set — and stayed inside the constraints
               while doing it. Checked on every page, so a student who styled one
               and left the others bare is caught here too. */
            const tokens = new Set();
            for (const sheet of document.styleSheets) {
              let rules;
              try {
                rules = sheet.cssRules;
              } catch {
                continue;
              }
              for (const rule of rules) {
                if (!rule.style || !rule.selectorText) continue;
                if (
                  !/(^|,)\s*:root\s*(,|$)/.test(rule.selectorText) &&
                  rule.selectorText.trim() !== 'html'
                )
                  continue;
                for (const prop of rule.style) if (prop.startsWith('--')) tokens.add(prop);
              }
            }
            if (tokens.size < 8) return false;

            for (const el of document.querySelectorAll('body *')) {
              const s = getComputedStyle(el);
              if (/flex|grid/.test(s.display)) return false;
              if (['absolute', 'fixed', 'sticky'].includes(s.position)) return false;
            }
            if (document.querySelectorAll('[style]').length > 0) return false;
            for (const sheet of document.styleSheets) {
              let rules;
              try {
                rules = sheet.cssRules;
              } catch {
                continue;
              }
              for (const rule of rules) {
                if (!rule.style) continue;
                for (const prop of rule.style) {
                  if (rule.style.getPropertyPriority(prop) === 'important') return false;
                }
              }
            }
            return true;
          }),
        );
        if (!ok) return false;
      }
      return true;
    },
  },
  {
    title: 'לא נשארו סימוני `CODE HERE` של הליבה באף קובץ',
    expected: 'כל מקום שסומן `CODE HERE` הוא מקום שבו אתה כותב. מחק את הסימון אחרי שכתבת. כל סימון `CODE HERE` של הליבה חייב להיעלם; סימון שבשורה שלו כתוב גם שם השכבה בסוגריים מסולסלים (`stretch`, `challenge` או `optional`) מותר להשאיר אם דילגת על החלק הזה.',
    /* The FILES are read, not the DOM: a comment above <html> is outside documentElement,
       and the grader reads the files. Same rule as the grader (grading/lib/checks.mjs,
       markersLeft): a marker tagged {stretch}, {challenge} or {optional} may stay — see markersLeft above. */
    run: async (page, ctx) => {
      for (const rel of PAGES) {
        const texts = await onPage(page, ctx, rel, () =>
          page.evaluate(async () => {
            const link = document.querySelector('link[rel="stylesheet"]');
            if (!link) return [null];
            try {
              return [await (await fetch(location.href)).text(), await (await fetch(link.href)).text()];
            } catch {
              return [null];
            }
          }),
        );
        if (!texts.every(clean)) return false;
      }
      return true;
    },
  },
];
