/**
 * Week 7 (UX/UI + project kickoff; week 6 until batch 04) — the CORE-TIER public check set that runs in the student's own repository.
 *
 * The publisher copies this to  starter/.checks/public-checks.mjs  and
 * .checks/run-checks.mjs executes it on every push (tools/ci-template/check.yml).
 *
 * RULES (tools/ci-template/checks/public-checks.mjs):
 *   · CORE TIER ONLY. Nothing here about the audit's CONTENT, the severities, or whether
 *     the plan describes a buildable project — all of that is manual and stays private.
 *   · No point values, no grading criteria. `expected` is a hint, never the answer.
 *   · EVERY NEGATIVE IS PAIRED WITH A POSITIVE. A check phrased "you did not use a
 *     bracketed value" is true of a student who wrote nothing at all, so on its own it
 *     turns green on an untouched starter.
 *   · Do not re-check what the runner already does: required files, HTML validity,
 *     console cleanliness, and horizontal scroll at 375 / 768 / 1280.
 *
 * `page` is already loaded at redesign.html, viewport 1280x900, served over http.
 *
 * ── TWO THINGS THAT ARE DIFFERENT THIS WEEK
 *
 * 1. THE ENTRY IS redesign.html, NOT bad-page.html. The audit target is required to fail
 *    every accessibility check in this file — that is the assignment. Pointing CI at it
 *    would make a correct submission red.
 *
 * 2. THE STARTER IS UNSTYLED, NOT UGLY. Its stylesheet was removed when the section was
 *    lifted out, so black-on-white text PASSES contrast and the default focus ring is
 *    present. That means a naive contrast check is green on a submission where nothing was
 *    built — which is the Run 5 trap in this week's clothing. Every check below is
 *    therefore paired with something that can only be true if work happened: the markers
 *    are gone, the status cells read, the heading out-ranks the body.
 */

const at = async (page, width) => {
  await page.setViewportSize({ width, height: 900 });
  await page.waitForTimeout(200);
};

/** WCAG contrast of an element's text against the colour actually painted behind it. */
const worstContrast = (page) =>
  page.evaluate(() => {
    const lum = ([r, g, b]) => {
      const f = (c) => {
        const s = c / 255;
        return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
      };
      return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
    };
    const rgb = (v) => (v.match(/[\d.]+/g) ?? []).slice(0, 3).map(Number);
    const ground = (el) => {
      let n = el;
      while (n) {
        const bg = getComputedStyle(n).backgroundColor;
        const a = Number((bg.match(/[\d.]+/g) ?? [])[3] ?? 1);
        if (a > 0) return rgb(bg);
        n = n.parentElement;
      }
      return [255, 255, 255];
    };
    const ratio = (a, b) => {
      const [hi, lo] = [lum(a), lum(b)].sort((x, y) => y - x);
      return (hi + 0.05) / (lo + 0.05);
    };
    let worst = 21;
    for (const el of document.querySelectorAll('h1, h2, h3, p, dt, dd, a, td, th, caption, li')) {
      const ownText = [...el.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim());
      if (!ownText) continue;
      const r = ratio(rgb(getComputedStyle(el).color), ground(el));
      if (r < worst) worst = r;
    }
    return worst;
  });

export const publicChecks = [
  {
    title: 'לא נשארו סימני `CODE-HERE` בקובץ',
    expected: 'כל מקום שסומן הוא מקום שאתה כותב בו. כשסיימת עם אלמנט - מחק את הסימן.',
    run: async (page) => (await page.locator('.CODE-HERE').count()) === 0,
  },
  {
    title: 'Tailwind נטען ובלוק הטוקנים קומפל',
    expected:
      'הטוקנים ב-`@theme` צריכים להסתדר. אם `--color-ink` לא מוגדר, או ש-`vendor/tailwind.js` נמחק, העמוד מרונדר בלי עיצוב - וזה נראה בדיוק כמו מי שלא כתב מחלקות.',
    run: async (page) =>
      (await page.evaluate(() =>
        getComputedStyle(document.documentElement).getPropertyValue('--color-ink').trim(),
      )) !== '',
  },
  {
    /*
     * THE CENTRAL CHECK, and the one that cannot be green by accident: the starter's status
     * cells are empty spans. Colour alone is not a cue.
     */
    title: 'הזמינות נקראת כטקסט, לא רק כצבע',
    expected:
      'לכל אחד מחמשת החוגים צריך להיות טקסט שאומר אם יש מקומות. דמיין את העמוד בשחור-לבן: מה נשאר?',
    run: async (page) =>
      (await page.evaluate(() => {
        const rows = [...document.querySelectorAll('li, tr')];
        return rows.filter((r) => /פנוי|מלא|זמין|המתנה/.test(r.innerText)).length;
      })) >= 5,
  },
  {
    /*
     * Contrast, PAIRED. An unstyled starter is black on white and passes on its own, so the
     * pairing is that something was actually styled: the body must not be the default
     * transparent background any more.
     */
    title: 'כל טקסט עובר 4.5:1 - והעמוד באמת עוצב',
    expected:
      'שני חצאים. הניגודיות נמדדת על כל צומת טקסט מול הרקע שמצויר מאחוריו; והרקע עצמו צריך להיות מוגדר, אחרת לא עוצב כלום.',
    run: async (page) => {
      const worst = await worstContrast(page);
      const painted = await page.evaluate(() => {
        const bg = getComputedStyle(document.body).backgroundColor;
        const alpha = Number((bg.match(/[\d.]+/g) ?? [])[3] ?? 1);
        return alpha > 0 && bg !== 'rgba(0, 0, 0, 0)';
      });
      return worst >= 4.5 && painted;
    },
  },
  {
    title: 'הכותרת הראשית בולטת מעל גוף הטקסט',
    expected:
      'גודל כפול משקל, לפחות 1.6 יחסית לפסקה. אותו גודל ואותו משקל פירושו שאין דבר אחד שנקרא ראשון.',
    run: async (page) =>
      page.evaluate(() => {
        const read = (sel) => {
          const el = document.querySelector(sel);
          if (!el) return null;
          const s = getComputedStyle(el);
          return { size: parseFloat(s.fontSize), weight: Number(s.fontWeight) };
        };
        const h1 = read('h1');
        const p = read('main p');
        if (!h1 || !p) return false;
        return (h1.size / p.size) * (h1.weight / p.weight) >= 1.6;
      }),
  },
  {
    /*
     * No bracketed values, PAIRED with "utilities were actually written". The negative half
     * is true of an empty file.
     */
    title: 'הכול מהסולם - ובאמת נכתבו utilities',
    expected:
      'שני חצאים. אין ערכים בסוגריים מרובעים כמו `p-[13px]`, ואין `style=`; ומצד שני יש מספר סביר של מחלקות על העמוד. הסולם קיים כדי שלא תבחר מספרים.',
    run: async (page) =>
      page.evaluate(() => {
        const withClass = [...document.querySelectorAll('[class]')];
        const brackets = withClass.filter((el) => /\[[^\]]+\]/.test(el.className)).length;
        const inline = document.querySelectorAll('[style]').length;
        /*
         * COUNT REAL UTILITIES, NOT THE MARKERS.
         *
         * The starter carries 58 `class="CODE-HERE"` attributes, so a plain class count is
         * already past any threshold before one utility is written — and this check turned
         * green on an untouched starter. That is the Run 5 rule in this week's clothing: a
         * negative ("no bracketed values") paired with something the scaffold satisfies by
         * itself is not paired at all.
         */
        const classes = withClass.reduce(
          (n, el) =>
            n +
            String(el.className)
              .split(/\s+/)
              .filter((c) => c && c !== 'CODE-HERE').length,
          0,
        );
        return brackets === 0 && inline === 0 && classes >= 30;
      }),
  },
  {
    title: 'העמוד נפתר בסימון ובכלי utilities, בלי JavaScript',
    expected: 'השבוע הוא סימון ו-utilities. אם הפתרון שלך דורש מאזין - זה פתרון של שבוע 8 או 9.',
    run: async (page) =>
      page.evaluate(() => {
        const scripts = [...document.querySelectorAll('script')].filter(
          (s) => !(s.src || '').includes('tailwind'),
        );
        if (scripts.length > 0) return false;

        /* THE POSITIVE HALF. "There is no JavaScript" is true of a page nobody has
           touched, so on its own this row was a free pass. What is being marked is
           that the page was solved WITH MARKUP AND UTILITIES — so it has to have
           some. The untouched starter carries one distinct class; the reference
           answer carries sixty. */
        const classes = new Set();
        for (const el of document.querySelectorAll('[class]')) {
          for (const c of el.classList) classes.add(c);
        }
        return classes.size >= 12;
      }),
  },
  {
    title: 'לכל תמונה `alt` שאומר משהו, או `alt=""` מכוון',
    expected:
      '`alt="image"` ו-`alt="תמונה"` קיימים ואינם אומרים דבר. `alt` חסר גורם לקורא מסך להקריא את שם הקובץ. `alt=""` הוא תשובה נכונה לתמונה שלא מוסיפה מידע.',
    run: async (page) =>
      page.evaluate(() =>
        [...document.querySelectorAll('img')].every((img) => {
          const alt = img.getAttribute('alt');
          if (alt === null) return false;
          if (alt === '') return true;
          return !/^(image|images?|pic\d*|תמונה|photo)([.\-_a-z0-9]*)$/i.test(alt.trim());
        }),
      ),
  },
  {
    title: 'לקישור יש טבעת פוקוס שאתה בחרת, לא זו של הדפדפן',
    expected:
      'לחץ Tab. אם אתה לא רואה איפה הפוקוס - `outline: none` נמצא שם, או ש-`focus-visible:` חסר. אם ברירת המחדל לא מוצאת חן, החלף אותה; אל תמחק.',
    run: async (page) => {
      await page.keyboard.press('Tab');
      return page.evaluate(() => {
        const el = document.activeElement;
        if (!el || el === document.body) return false;
        const s = getComputedStyle(el);
        const visible =
          (s.outlineStyle !== 'none' && parseFloat(s.outlineWidth) > 0) || s.boxShadow !== 'none';
        if (!visible) return false;

        /* THE POSITIVE HALF. Every browser draws a focus ring of its own, so a page
           with no focus styling at all passed this — it was measuring the user
           agent, not the student. A `focus-visible:` utility compiles into a real
           `:focus-visible` rule, so requiring one asks for an authored decision.
           Untouched starter: 0 such rules. Reference answer: 3. */
        for (const sheet of document.styleSheets) {
          let rules;
          try {
            rules = sheet.cssRules;
          } catch {
            continue;
          }
          const walk = (list) => {
            for (const rule of list) {
              if (rule.selectorText && /:focus/.test(rule.selectorText)) return true;
              if (rule.cssRules && walk(rule.cssRules)) return true;
            }
            return false;
          };
          if (walk(rules)) return true;
        }
        return false;
      });
    },
  },
  {
    /*
     * The responsive check the runner does NOT do: the runner asserts the page has no
     * horizontal scroll, and this asserts the ARRANGEMENT actually changes — a single
     * column at every width has no overflow either.
     */
    title: 'הפריסה מתארגנת מחדש בין 375 ל-1280',
    expected:
      'בטלפון עמודה אחת, במסך רחב יותר מאחת. פריסה שנראית זהה בשני הרוחבים לא הסתגלה - היא פשוט צרה.',
    run: async (page) => {
      const perRow = async (width) => {
        await at(page, width);
        return page.evaluate(() => {
          const items = [...document.querySelectorAll('main li')].map((el) =>
            el.getBoundingClientRect(),
          );
          if (items.length < 2) return 0;
          const rows = [];
          for (const box of items) {
            const row = rows.find((r) =>
              r.some((o) => box.top < o.bottom - 1 && box.bottom > o.top + 1),
            );
            if (row) row.push(box);
            else rows.push([box]);
          }
          return Math.max(...rows.map((r) => r.length));
        });
      };
      const narrow = await perRow(375);
      const wide = await perRow(1280);
      await at(page, 1280);
      return narrow === 1 && wide > 1;
    },
  },
  {
    title: '`bad-page.html` לא שונה',
    expected:
      'העמוד שאתה מבקר נשאר כמו שהוא. ביקורת על עמוד שכבר תיקנת אינה ביקורת - והממצאים אמורים לתאר את מה שהיה שם.',
    run: async (page) => {
      /*
       * Structural fingerprint rather than a hash: whitespace and a Prettier pass must not
       * fail this. These four are the faults the audit is written against, so if they are
       * gone the page was repaired.
       */
      /*
       * ABSOLUTE URL, resolved off the page's own location.
       *
       * `page.request.get('bad-page.html')` needs a `baseURL` on the browser context, and
       * the CI runner does not set one — so a relative path here silently failed for BOTH
       * the starter and the solution, which is how it was caught: a check that fails on the
       * reference answer is broken, not strict.
       */
      const res = await page.request.get(new URL('bad-page.html', page.url()).href);
      if (!res.ok()) return false;
      const src = await res.text();
      return (
        src.includes('outline: none') &&
        src.includes('#a8a8a8') &&
        src.includes('width: 560px') &&
        src.includes('tabindex="3"')
      );
    },
  },
];
