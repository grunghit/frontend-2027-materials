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
 * `page` is already loaded at the entry file, viewport 1280×900, served over http —
 * so fetch() and page.hover() both work.
 *
 * EVERYTHING HERE IS MEASURED ON THE RENDERED PAGE, not read out of the stylesheet.
 * There is no phrasing to guess at and no property name to copy: a student who gets
 * to the same result a different way passes, and one who writes the "right" text
 * without it taking effect does not.
 */

export const publicChecks = [
  {
    title: 'העמוד טוען גליון סגנונות חיצוני, והגליון באמת הגיע',
    expected:
      'שורת `<link rel="stylesheet" href="styles.css">` ב-`head`, וקובץ `styles.css` לידו עם כללים בפנים.',
    run: async (page) =>
      page.evaluate(() => {
        if (!document.querySelector('link[rel="stylesheet"]')) return false;
        /* A <link> that 404s still appears in document.styleSheets — with zero rules
           in it. Counting the rules is what tells you the file actually arrived. */
        let rules = 0;
        for (const sheet of document.styleSheets) {
          try {
            rules += sheet.cssRules.length;
          } catch {
            /* a cross-origin sheet: not ours, ignore it */
          }
        }
        return rules >= 10;
      }),
  },
  {
    title: '`box-sizing: border-box` חל על כל האלמנטים',
    expected: 'שלוש השורות בראש הגליון: `*, *::before, *::after { box-sizing: border-box; }`.',
    run: async (page) =>
      page.evaluate(() =>
        [document.body, document.querySelector('main'), document.querySelector('footer')]
          .filter(Boolean)
          .every((el) => getComputedStyle(el).boxSizing === 'border-box'),
      ),
  },
  {
    title: 'קיימת ערכת טוקנים על `:root`',
    expected:
      'לפחות חמישה `--color-*`, חמישה `--space-*`, שני `--radius-*` ושלושה `--font-*`, כולם מוגדרים בבלוק `:root`.',
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
    title: 'ל-`body` יש קרקע משלו: גופן, צבע, רקע, גובה שורה ומידה',
    expected:
      'משפחת גופנים שאינה ברירת המחדל, צבע טקסט ורקע משלך, `line-height` של 1.4 לפחות, ו-`max-width` שמגביל את אורך השורה.',
    run: async (page) =>
      page.evaluate(() => {
        const style = getComputedStyle(document.body);
        const family = style.fontFamily.toLowerCase();
        const notDefault = !/^times|^"?times new roman/.test(family) && family.length > 0;
        const leading = parseFloat(style.lineHeight) / parseFloat(style.fontSize);
        const hasBackground = style.backgroundColor !== 'rgba(0, 0, 0, 0)';
        /* The measure may live on body or on a wrapper region inside it. */
        const constrained = [
          document.body,
          document.querySelector('main'),
          document.querySelector('header'),
        ]
          .filter(Boolean)
          .some((el) => {
            const max = getComputedStyle(el).maxWidth;
            return max !== 'none' && parseFloat(max) > 0 && parseFloat(max) < 1200;
          });
        return notDefault && leading >= 1.4 && hasBackground && constrained;
      }),
  },
  {
    title: 'יש סולם טיפוגרפי: הכותרות יורדות בגודל, וגובה השורה שלהן צפוף משל גוף הטקסט',
    expected:
      '`h1` גדולה מ-`h2`, שגדולה מ-`h3`, שגדולה מגוף הטקסט — וגם `line-height` צפוף לכותרות. ' +
      'בגודל 2rem, גובה שורה של גוף טקסט פותח תהום בין שתי שורות של כותרת אחת.',
    run: async (page) =>
      page.evaluate(() => {
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
        const h3 = read('h3');
        if (!body || !h1 || !h2) return false;
        if (!(h1.size > h2.size)) return false;
        if (h3 && !(h2.size > h3.size)) return false;
        if (!((h3 || h2).size >= body.size)) return false;
        /* The part an unstyled page cannot pass: the browser gives every element the
           same `normal` line-height, so a tighter one on the headings is a decision
           somebody made. */
        return h1.leading < body.leading && h2.leading < body.leading;
      }),
  },
  {
    title: 'הקישורים נבדלים מהטקסט, ומשתנים במעבר עכבר',
    expected: 'צבע משלהם, ו-`a:hover` שמשנה משהו שרואים — צבע, קו תחתון, עובי.',
    run: async (page) => {
      const link = page.locator('main a[href], nav a[href]').first();
      if ((await link.count()) === 0) return false;

      const before = await link.evaluate((el) => {
        const s = getComputedStyle(el);
        return {
          color: s.color,
          bodyColor: getComputedStyle(document.body).color,
          decoration: s.textDecorationLine + ' ' + s.textDecorationThickness,
          background: s.backgroundColor,
        };
      });
      if (before.color === before.bodyColor) return false;

      await link.hover();
      await page.waitForTimeout(250);
      const after = await link.evaluate((el) => {
        const s = getComputedStyle(el);
        return {
          color: s.color,
          decoration: s.textDecorationLine + ' ' + s.textDecorationThickness,
          background: s.backgroundColor,
        };
      });
      return (
        after.color !== before.color ||
        after.decoration !== before.decoration ||
        after.background !== before.background
      );
    },
  },
  {
    title: 'רואים איפה הפוקוס כשמנווטים ב-Tab',
    expected: '`a:focus-visible` עם `outline` שרואים. `outline: none` בלי חלופה הוא פסילה.',
    run: async (page) => {
      await page.keyboard.press('Tab');
      await page.waitForTimeout(150);
      return page.evaluate(() => {
        const el = document.activeElement;
        if (!el || el === document.body) return false;
        const s = getComputedStyle(el);
        const outline = s.outlineStyle !== 'none' && parseFloat(s.outlineWidth) > 0;
        if (!outline && s.boxShadow === 'none') return false;

        /* THE POSITIVE HALF. Every browser draws a focus ring of its own, so
           "an indicator is visible" is already true of a page with no CSS at
           all — on its own this row was a free pass. What is being asked for is
           an AUTHORED one, so the page's own stylesheet has to say something
           about focus. */
        for (const sheet of document.styleSheets) {
          let rules;
          try {
            rules = sheet.cssRules;
          } catch {
            continue;
          }
          for (const rule of rules) {
            if (rule.selectorText && /:focus/.test(rule.selectorText)) return true;
          }
        }
        return false;
      });
    },
  },
  {
    title:
      'העמוד מעוצב מטוקנים, ובתוך מגבלות השבוע: בלי Flexbox, בלי Grid, בלי מיקום ובלי `!important`',
    expected:
      'הכול בזרימה רגילה. `display: flex` הוא שבוע 3, `display: grid` הוא שבוע 4, ו-`!important` הוא לא תיקון.',
    run: async (page) =>
      page.evaluate(() => {
        /* THE POSITIVE HALF, and it is why this row is not a free pass. "No
           Flexbox, no Grid, no positioning, no !important" is ALL TRUE of a page
           with no CSS whatsoever. The week's actual requirement is that the page
           IS styled — from a token set — and stayed inside the constraints while
           doing it. */
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
  },
  {
    title: 'לא נשארו סימוני `CODE HERE` ב-`styles.css`',
    expected: 'כל מקום שסומן `CODE HERE` הוא מקום שבו אתה כותב. מחק את הסימון אחרי שכתבת.',
    run: async (page) =>
      page.evaluate(async () => {
        /* CSS comments are stripped from the CSSOM, so the file itself has to be read.
           Same origin, so this is just a fetch. */
        const link = document.querySelector('link[rel="stylesheet"]');
        if (!link) return false;
        try {
          const source = await (await fetch(link.href)).text();
          return !/CODE HERE/.test(source);
        } catch {
          return false;
        }
      }),
  },
];
