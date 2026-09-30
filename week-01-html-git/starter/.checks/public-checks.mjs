/**
 * Week 1 — the CORE-TIER public check set that runs in the student's own repo.
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
 * HTML I (week 1 of the restructured course): no form check here — the form and the
 * accessibility pass are HTML II (week 2). This set mirrors the core automatic rows of
 * grading/specs/week-01.mjs one to one: document-basics · h1-single · landmarks ·
 * nav-links · images-alt · links-quality · paths-portable · finished (CODE HERE).
 */

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
    title: 'שלד המסמך שלם, ול-`title` יש תוכן משלך',
    expected: '`<!doctype html>`, `lang` על `<html>`, `<meta charset>`, `<meta name="viewport">`, ו-`title` שאינו "CHANGE ME".',
    run: async (page) =>
      page.evaluate(() => {
        const title = (document.title || '').trim();
        return (
          document.doctype?.name === 'html' &&
          /^[a-z]{2}([-_][A-Za-z]+)?$/.test(document.documentElement.getAttribute('lang') || '') &&
          !!document.querySelector('meta[charset]') &&
          !!document.querySelector('meta[name="viewport"]') &&
          title.length >= 3 &&
          !/change me|your name here/i.test(title) &&
          !/^(document|untitled( document)?)$/i.test(title)
        );
      }),
  },
  {
    title: 'בעמוד כותרת ראשית אחת בדיוק (`<h1>`)',
    expected: 'לכל עמוד `<h1>` יחיד שמתאר על מה העמוד. `<h1>` הוא לא "טקסט גדול".',
    run: async (page) => (await page.locator('h1').count()) === 1,
  },
  {
    title: 'העמוד בנוי מ-`header`, `nav`, `main` ו-`footer`, ו-`main` מופיע פעם אחת',
    expected: '`<div class="header">` הוא לא `<header>`. `main` יחיד לכל מסמך.',
    run: async (page) =>
      page.evaluate(
        () =>
          !!document.querySelector('header') &&
          !!document.querySelector('nav') &&
          document.querySelectorAll('main').length === 1 &&
          !!document.querySelector('footer'),
      ),
  },
  {
    title: 'ה-`nav` מכיל רשימת קישורים אמיתית',
    expected: '`<nav>` ובתוכו `<ul>` עם `<li>` וקישורים — לפחות שניים.',
    run: async (page) => (await page.locator('nav ul li a').count()) >= 2,
  },
  {
    title: 'לכל תמונה יש `alt`, ולפחות אחת מתוארת באמת',
    expected: '`alt` חסר אינו החלטה. `alt=""` הוא החלטה: "התמונה לא נושאת מידע".',
    run: async (page) =>
      page.evaluate(() => {
        const images = [...document.querySelectorAll('img')];
        if (images.length === 0) return false;
        if (!images.every((el) => el.hasAttribute('alt'))) return false;
        // Same rule as the grader: not blank, not a generic word, not a file name.
        return images.some((el) => {
          const t = (el.getAttribute('alt') || '').trim();
          if (!t || /^(image|picture|photo|img|תמונה)$/i.test(t)) return false;
          return t.length >= 8 || !/\.(png|jpe?g|gif|svg|webp|avif|bmp)$/i.test(t);
        });
      }),
  },
  {
    title: 'הקישורים מתארים את היעד, ויש קישור פנימי',
    expected: '"לחץ כאן" חסר משמעות מחוץ להקשר. לפחות שלושה קישורים, ואחד מהם לתוך העמוד (`href="#about"`).',
    run: async (page) =>
      page.evaluate(() => {
        const links = [...document.querySelectorAll('a[href]')];
        if (links.length < 3) return false;
        const vague = /^\s*(click here|here|link|read more|this|לחץ כאן|כאן|קישור|לחצו כאן)\s*$/i;
        if (links.some((a) => vague.test(a.textContent || ''))) return false;
        return links.some((a) => !/^(https?:|mailto:|tel:|file:)/i.test(a.getAttribute('href') || ''));
      }),
  },
  {
    title: 'הנתיבים נוסעים: אין נתיב מקומי מוחלט, וכל תמונה נטענה באמת',
    expected: '`file:///Users/…` ו-`C:\\Users\\…` עובדים רק על מחשב אחד. הנתיב נספר מהקובץ: `images/x.png`. פתח את Network — שורה אדומה היא תמונה שלא קיימת.',
    run: async (page) =>
      page.evaluate(() => {
        const images = [...document.querySelectorAll('img')];
        if (images.length === 0) return false;
        const refs = [...document.querySelectorAll('a[href], img[src]')].map(
          (el) => el.getAttribute('href') || el.getAttribute('src') || '',
        );
        if (refs.some((v) => /^file:/i.test(v) || /^[A-Za-z]:[\\/]/.test(v) || v.includes('\\'))) return false;
        return images.every((img) => img.complete && img.naturalWidth > 0);
      }),
  },
  {
    title: 'לא נשארו בקובץ סימוני `CODE HERE`',
    expected: 'כל מקום שסומן `CODE HERE` הוא מקום שבו אתה כותב. מחק את הסימון אחרי שכתבת.',
    /* The FILE is read, not the DOM: a comment above <html> is outside documentElement,
       and the grader reads the file. Same rule as the grader (grading/lib/checks.mjs,
       markersLeft): a marker tagged {stretch}, {challenge} or {optional} may stay — see markersLeft above. */
    run: async (page) =>
      clean(
        await page.evaluate(async () => {
          try {
            return await (await fetch(location.href)).text();
          } catch {
            return null;
          }
        }),
      ),
  },
];
