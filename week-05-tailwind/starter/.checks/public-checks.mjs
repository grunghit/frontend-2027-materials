/**
 * Week 5 — the CORE-TIER public check set that runs in the student's own repo.
 *
 * The publisher copies this file to  starter/.checks/public-checks.mjs  and it is
 * executed by .checks/run-checks.mjs on every push (tools/ci-template/check.yml).
 *
 * RULES (tools/ci-template/checks/public-checks.mjs):
 *   · CORE TIER ONLY. Stretch and challenge checks stay private in grading/specs/.
 *     So: nothing here about the component gallery's cross-page consistency, nothing
 *     about the AI review, nothing about TinDog.
 *   · No point values, no grading criteria — students learn "does it work", not
 *     "which string does the grader look for".
 *   · `run` returns a plain boolean. `expected` is a hint, never the answer.
 *   · EVERY NEGATIVE IS PAIRED WITH A POSITIVE.
 *   · Do not re-check what the runner already does (required files, HTML validity,
 *     console cleanliness, horizontal scroll at all three widths).
 *
 * `page` is already loaded at the entry file, viewport 1280x900, served over http.
 *
 * ── TWO THINGS THAT ARE DIFFERENT THIS WEEK, AND BOTH MATTER
 *
 * 1. THE ONLY STYLESHEET IN THE DOCUMENT IS TAILWIND'S OWN. It contains a rule for
 *    every utility that appeared anywhere in the markup. So nothing here asks the
 *    CSSOM a question about the student's intent — a check for "all the media
 *    queries are min-width" would pass on any submission whatsoever, because
 *    Tailwind's are. Everything below measures the rendered page instead.
 *
 * 2. AN UNSTYLED PAGE IS THE DEFAULT FAILURE MODE, not a broken one. If Tailwind
 *    does not load, or no classes were written, every page still renders, still
 *    validates, and still logs nothing. That is why the first check exists and why
 *    it is phrased positively: "rules were generated", not "the script tag is there".
 *
 * Two boxes count as sharing a row when their vertical ranges OVERLAP, never by
 * comparing top edges — items of different heights in one row have different tops,
 * and a top-edge test calls a correct layout broken.
 *
 * This file cannot import the private grading library, so the small amount of
 * geometry it needs is re-implemented inline. Keep it in step with
 * grading/lib/checks.mjs §2d if that changes.
 */

const at = async (page, width) => {
  await page.setViewportSize({ width, height: 900 });
  await page.waitForTimeout(200);
};

/** How many boxes share a row, on average, at this width. */
const perRow = (page, selector) =>
  page.evaluate((sel) => {
    const boxes = [...document.querySelectorAll(sel)].map((el) => {
      const r = el.getBoundingClientRect();
      return { top: r.top, bottom: r.bottom };
    });
    if (boxes.length === 0) return 0;
    const rows = [];
    for (const box of boxes) {
      const row = rows.find((r) => r.some((o) => box.top < o.bottom - 1 && box.bottom > o.top + 1));
      if (row) row.push(box);
      else rows.push([box]);
    }
    return boxes.length / rows.length;
  }, selector);

/**
 * Visit another page of the submission and then PUT THE PAGE BACK.
 *
 * The runner loads the entry file ONCE and hands every check the same page — unlike
 * the private grader, which gives each check a fresh context. A check that wanders
 * off and does not return leaves every check after it looking at the wrong document,
 * and they fail for a reason that has nothing to do with the student's work. Week 4
 * learned this the hard way, on its own solution. The `finally` is the whole point.
 */
const onPage = async (page, ctx, relative, fn) => {
  const response = await page
    .goto(`${ctx.serverUrl}/${relative}`, { waitUntil: 'networkidle' })
    .catch(() => null);
  if (!response || !response.ok()) return false;
  try {
    await page.waitForTimeout(200);
    return await fn(page);
  } finally {
    await page.setViewportSize({ width: 1280, height: 900 });
    await page
      .goto(`${ctx.serverUrl}/${ctx.entry ?? 'index.html'}`, { waitUntil: 'networkidle' })
      .catch(() => null);
    await page.waitForTimeout(200);
  }
};

/** Has this element been given real styling, or is it still a bare box? */
const styled = (page, selector) =>
  page.evaluate((sel) => {
    const el = document.querySelector(sel);
    if (!el) return false;
    const cs = getComputedStyle(el);
    const px = (v) => parseFloat(v) || 0;
    const signs = [
      !/rgba\(0, 0, 0, 0\)|transparent/.test(cs.backgroundColor),
      px(cs.paddingTop) > 0 || px(cs.paddingLeft) > 0,
      px(cs.borderTopLeftRadius) > 0,
      px(cs.borderTopWidth) > 0,
      px(cs.rowGap) > 0 || px(cs.columnGap) > 0,
    ];
    return signs.filter(Boolean).length >= 3;
  }, selector);

export const publicChecks = [
  {
    title: 'Tailwind נטען ומייצר כללים, ואין גיליון סגנון משלך',
    expected:
      'שני חצאים. חיובי: הסקריפט `vendor/tailwind.js` טעון ונוצרו ממנו כללי CSS בפועל. שלילי: אין `<link rel="stylesheet">` ואין בלוק `<style>` משלך. הבלוק היחיד שמותר הוא `<style type="text/tailwindcss">` — זה ה-`@theme`, והוא ניתן לך.',
    run: async (page) =>
      page.evaluate(() => {
        /* Tailwind's OUTPUT is a plain <style> with no attributes, injected at run
           time. It is recognised by its opening — a banner comment and then @layer
           declarations — because the `type` attribute is on the SOURCE block, not on
           the output. */
        const isGenerated = (style) => {
          const head = (style.textContent || '').replace(/^\s*(?:\/\*[\s\S]*?\*\/\s*)*/, '');
          return /^@layer\b/.test(head);
        };

        if (document.querySelector('link[rel="stylesheet"]')) return false;
        const authored = [...document.querySelectorAll('style')].filter(
          (s) => (s.getAttribute('type') || '') !== 'text/tailwindcss' && !isGenerated(s),
        );
        if (authored.length > 0) return false;

        let rules = 0;
        for (const sheet of document.styleSheets) {
          try {
            const walk = (list) => {
              for (const rule of list) {
                if (rule.selectorText) rules += 1;
                if (rule.cssRules) walk(rule.cssRules);
              }
            };
            walk(sheet.cssRules);
          } catch {
            /* not ours to read */
          }
        }
        return rules >= 30;
      }),
  },

  {
    title: 'לא נשארו סימוני `CODE-HERE`, והשלד באמת נפרס לשלוש עמודות',
    expected:
      'שני חצאים, ובכוונה. שלילי: אף אלמנט לא נושא עוד את המחלקה `CODE-HERE` — בשני העמודים. חיובי: ברוחב 1280 תפריט הצד, העמודה הראשית ואזור הפעילות נמצאים זה לצד זה. מחיקת הסימונים בלי לבנות כלום לא מספיקה.',
    run: async (page, ctx) => {
      const markersHere = await page.evaluate(
        () => document.querySelectorAll('[class*="CODE-HERE"]').length,
      );
      if (markersHere > 0) return false;

      const markersThere = await onPage(page, ctx, 'components.html', (p) =>
        p.evaluate(() => document.querySelectorAll('[class*="CODE-HERE"]').length),
      );
      if (markersThere !== 0) return false;

      await at(page, 1280);
      const threeUp = await page.evaluate(() => {
        const box = (sel) => {
          const el = document.querySelector(sel);
          if (!el) return null;
          const r = el.getBoundingClientRect();
          return { top: r.top, bottom: r.bottom, left: r.left };
        };
        const nav = box('.side-nav');
        const main = box('.main');
        const activity = box('.activity');
        if (!nav || !main || !activity) return false;
        /* Overlapping vertical ranges, never equal tops. */
        const together = (a, b) => a.top < b.bottom - 1 && a.bottom > b.top + 1;
        return together(nav, main) && together(main, activity);
      });
      await at(page, 1280);
      return threeUp;
    },
  },

  {
    title: 'העמוד נפרס אחרת בשלושה רוחבים',
    expected:
      'ב-375 הכול בעמודה אחת, והעמודה הראשית מופיעה **לפני** תפריט הצד. ב-768 תפריט הצד והראשית זה לצד זה. איפה בדיוק נמצאות נקודות השבירה — שלך.',
    run: async (page) => {
      const positions = async () =>
        page.evaluate(() => {
          const box = (sel) => {
            const el = document.querySelector(sel);
            if (!el) return null;
            const r = el.getBoundingClientRect();
            return { top: r.top, bottom: r.bottom };
          };
          return { nav: box('.side-nav'), main: box('.main') };
        });

      await at(page, 375);
      const narrow = await positions();
      if (!narrow.nav || !narrow.main) return false;
      const sideBySide = (a, b) => a.top < b.bottom - 1 && a.bottom > b.top + 1;
      if (sideBySide(narrow.nav, narrow.main)) return false;
      if (narrow.main.top >= narrow.nav.top) return false;

      await at(page, 768);
      const middle = await positions();
      const ok = sideBySide(middle.nav, middle.main);
      await at(page, 1280);
      return ok;
    },
  },

  {
    title: 'שורת הכרטיסים משנה מספר עמודות בין נייד למסך רחב',
    expected:
      'עמודה אחת ב-375, יותר מאחת ב-1280. איך הגעת לשם לא נבדק — רק מה שרואים.',
    run: async (page) => {
      await at(page, 375);
      const narrow = await perRow(page, '.kpi');
      await at(page, 1280);
      const wide = await perRow(page, '.kpi');
      return narrow === 1 && wide > 1;
    },
  },

  {
    title: 'מצב כהה משנה את העמוד',
    expected:
      'רקע העמוד וצבע הטקסט חייבים להיות שונים בין המצבים. `dark:` הוא `@media (prefers-color-scheme: dark)` — הבדיקה מדמה את ההעדפה, ואין צורך בכפתור.',
    run: async (page, ctx) => {
      const read = async () => {
        await page.goto(`${ctx.serverUrl}/${ctx.entry ?? 'index.html'}`, {
          waitUntil: 'networkidle',
        });
        await page.waitForTimeout(200);
        return page.evaluate(() => {
          const cs = getComputedStyle(document.body);
          return cs.backgroundColor + '|' + cs.color;
        });
      };
      try {
        await page.emulateMedia({ colorScheme: 'light' });
        const light = await read();
        await page.emulateMedia({ colorScheme: 'dark' });
        const dark = await read();
        return light !== dark;
      } finally {
        /* Reset AND reload: leaving the emulation on, or leaving the document in the
           state it was last painted in, makes every later check read a page that is
           mid-repaint. */
        await page.emulateMedia({ colorScheme: null });
        await page
          .goto(`${ctx.serverUrl}/${ctx.entry ?? 'index.html'}`, { waitUntil: 'networkidle' })
          .catch(() => {});
        await page.waitForTimeout(200);
      }
    },
  },

  {
    title: 'לקישורי תפריט הצד יש מצב ריחוף ומצב פוקוס נראה',
    expected:
      'ריחוף אמיתי חייב לשנות משהו, ומעבר במקלדת חייב להשאיר סימן שרואים. `hover:` ו-`focus-visible:` — שניהם, ולא רק הראשון.',
    run: async (page) => {
      const link = page.locator('.side-nav a:not(.is-current)').first();
      if ((await link.count()) === 0) return false;

      const read = () => link.evaluate((el) => getComputedStyle(el).backgroundColor);
      const before = await read();
      await link.hover();
      await page.waitForTimeout(220);
      const hovered = await read();
      await page.mouse.move(0, 0);

      await link.focus();
      await page.waitForTimeout(150);
      const ring = await link.evaluate((el) => {
        const cs = getComputedStyle(el);
        return (
          (parseFloat(cs.outlineWidth) > 0 && cs.outlineStyle !== 'none') ||
          (cs.boxShadow && cs.boxShadow !== 'none')
        );
      });
      await page.evaluate(() => document.activeElement?.blur()).catch(() => {});

      return before !== hovered && ring;
    },
  },

  {
    title: 'סט הרכיבים קיים ב-`components.html` ובאמת מעוצב',
    expected:
      'כפתור, כרטיס, תג ושדה טופס — כל אחד עם `data-component`, וכל אחד מעוצב בפועל ולא רק קיים בסימון. הקובץ הזה הוא המקור היחיד לכל רכיב חוזר בשאר העמודים.',
    run: async (page, ctx) =>
      onPage(page, ctx, 'components.html', async (p) => {
        const families = await p.evaluate(() => {
          const found = new Set(
            [...document.querySelectorAll('[data-component]')].map((el) =>
              el.dataset.component.split('-')[0],
            ),
          );
          return ['button', 'card', 'badge', 'field'].filter((f) => found.has(f));
        });
        if (families.length < 4) return false;

        for (const selector of [
          '[data-component="card"]',
          '[data-component="button-primary"]',
        ]) {
          if (!(await styled(p, selector))) return false;
        }
        return true;
      }),
  },
];
