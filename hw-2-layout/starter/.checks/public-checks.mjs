/**
 * Home assignment 2 — the CORE-TIER public check set that runs in the student's
 * own repo.
 *
 * RULES (tools/ci-template/checks/public-checks.mjs):
 *   · CORE TIER ONLY. Stretch and challenge checks stay private in grading/specs/.
 *   · No point values, no grading criteria.
 *   · `run` returns a plain boolean. `expected` is a hint, never the answer.
 *
 * `page` is already loaded at the entry file, viewport 1280×900, served over http.
 * The runner navigates ONCE before the loop, so a check that changes the viewport
 * must not assume it starts at 1280 — each one sets what it needs.
 *
 * Everything is measured on the rendered page.
 */

const at = async (page, width, height = 900) => {
  await page.setViewportSize({ width, height });
  await page.waitForTimeout(180);
};

/** Do two elements sit side by side? Vertical ranges overlap AND one starts after
 *  the other ends. Never a top-edge comparison — centred items of different
 *  heights have different tops, and that would call a correct layout broken. */
const sideBySide = (page, a, b) =>
  page.evaluate(
    ([aSel, bSel]) => {
      const first = document.querySelector(aSel);
      const second = document.querySelector(bSel);
      if (!first || !second) return false;
      const r1 = first.getBoundingClientRect();
      const r2 = second.getBoundingClientRect();
      const overlap = r1.top < r2.bottom - 1 && r1.bottom > r2.top + 1;
      return overlap && r2.left >= r1.right - 1;
    },
    [a, b],
  );

export const publicChecks = [
  {
    title: 'העמוד טוען גליון סגנונות חיצוני, והגליון באמת הגיע',
    expected:
      'שורת `<link rel="stylesheet" href="styles.css">` ב-`head`, וקובץ `styles.css` לידו עם כללים בפנים.',
    run: async (page) =>
      page.evaluate(() => {
        if (!document.querySelector('link[rel="stylesheet"]')) return false;
        let rules = 0;
        for (const sheet of document.styleSheets) {
          try {
            rules += sheet.cssRules.length;
          } catch {
            /* cross-origin sheet: not ours */
          }
        }
        return rules >= 20;
      }),
  },

  {
    title: 'השלד ממלא את החלון, והכותרת התחתונה סוגרת אותו',
    expected:
      'זה מה שהחליף את `min-height: 95vh` מהתרגיל המקורי. שלוש שורות, שורת האמצע ב-`1fr`, וגובה מינימלי של מסך אחד ב-`dvh` — מדויק, ולא ניחוש של אחוז.',
    /* Measure the SHELL, not the footer's distance from the bottom of the window.
       Those look equivalent and are not: if the content is taller than the probe
       viewport the footer sits below the fold, the difference goes negative, and a
       "<= 2" comparison passes a page with no layout at all. The starter is 2567px
       tall unstyled, which is why the probe is 3200. */
    run: async (page) => {
      await at(page, 1280, 3200);
      return page.evaluate(() => {
        const site = document.querySelector('.site');
        const footer = document.querySelector('.site-footer');
        if (!site || !footer) return false;
        const shell = site.getBoundingClientRect();
        const foot = footer.getBoundingClientRect();
        const fillsWindow = shell.height >= document.documentElement.clientHeight - 2;
        const footerIsLast = Math.abs(shell.bottom - foot.bottom) <= 2;
        return fillsWindow && footerIsLast;
      });
    },
  },

  {
    title: 'ה-hero נערם בנייד ומתפצל לשתי עמודות במסך רחב',
    expected: 'ב-375 הטקסט מעל התמונה, וב-1280 זה לצד זה. איפה בדיוק המעבר קורה זו החלטה שלך.',
    run: async (page) => {
      await at(page, 1280);
      const wide = await sideBySide(page, '.hero-text', '.hero-figure');
      await at(page, 375);
      const narrow = await sideBySide(page, '.hero-text', '.hero-figure');
      return wide && !narrow;
    },
  },

  {
    title: 'שורת הכרטיסים משנה מספר עמודות לבד',
    expected:
      'עמודה אחת ב-375 ושלוש ב-1280, בלי שאילתת מדיה על השורה. `auto-fit` יחד עם `minmax` עושה את זה.',
    run: async (page) => {
      const columns = async () =>
        page.evaluate(() => {
          const boxes = [...document.querySelectorAll('.card')].map((el) =>
            el.getBoundingClientRect(),
          );
          if (boxes.length < 3) return 0;
          const cols = [];
          for (const b of boxes) {
            const c = cols.find((g) => g.some((o) => b.left < o.right - 1 && b.right > o.left + 1));
            if (c) c.push(b);
            else cols.push([b]);
          }
          return cols.length;
        });
      await at(page, 375);
      const narrow = await columns();
      await at(page, 1280);
      const wide = await columns();
      return narrow === 1 && wide === 3;
    },
  },

  {
    title: 'רשימת העבודות והסרגל נערמים בנייד ויושבים זה לצד זה במסך רחב',
    expected: 'ועמודת הרשימה צריכה רשות להתכווץ מתחת לרוחב התוכן שלה, אחרת תקבל גלילה אופקית.',
    run: async (page) => {
      await at(page, 1280);
      const wide = await sideBySide(page, '.work-list', '.sidebar');
      await at(page, 375);
      const narrow = await sideBySide(page, '.work-list', '.sidebar');
      return wide && !narrow;
    },
  },

  {
    title: 'הפריסה בנויה ב-Grid ולא ב-float',
    expected:
      'שתי העמודות בתרגיל המקורי היו `float: left` ו-`float: right`. זה מה ש-Grid החליף — אז נבדק גם שאין float וגם ששורת הכרטיסים באמת נפרסה.',
    /* PAIRED. "There is no float" is true of a page with no CSS at all, so on its
       own this turned green on an untouched starter. What the constraint protects
       is that the two-column work was done with Grid — so assert that too. */
    run: async (page) => {
      const noFloat = await page.evaluate(() => {
        for (const el of document.querySelectorAll('body *')) {
          const float = getComputedStyle(el).float;
          if (float && float !== 'none') return false;
        }
        return true;
      });
      if (!noFloat) return false;

      await at(page, 1280);
      return page.evaluate(() => {
        const row = document.querySelector('.feature-row');
        if (!row || !/grid/.test(getComputedStyle(row).display)) return false;
        const value = getComputedStyle(row).gridTemplateColumns;
        if (!value || value === 'none') return false;
        return (
          value
            .trim()
            .split(/\s+/)
            .map(parseFloat)
            .filter((n) => n > 0.5).length >= 2
        );
      });
    },
  },

  {
    title: 'יש לפחות שתי נקודות שבירה, וכולן min-width',
    expected:
      'התרגיל המקורי השתמש ב-`@media (max-width: 680px)` והיה חייב לבטל את עצמו. שאילתה אחת בכיוון הלא נכון מפילה את הבדיקה — וגם עמוד בלי שאילתות בכלל, כי אז לא בנית פריסה רספונסיבית.',
    /* PAIRED. "Every width query is min-width" is vacuously true when there are no
       width queries, which is exactly the state of an untouched starter. The
       constraint only means something once there is something to compose. */
    run: async (page) =>
      page.evaluate(() => {
        const conditions = new Set();
        let allMin = true;
        const walk = (rules) => {
          for (const rule of rules) {
            if (rule.media) {
              const text = (rule.conditionText || rule.media.mediaText || '').toLowerCase();
              if (/\bwidth\b/.test(text)) {
                conditions.add(text);
                const isMin = /min-width/.test(text) || /\bwidth\s*>=?/.test(text);
                if (!isMin) allMin = false;
              }
            }
            if (rule.cssRules) walk(rule.cssRules);
          }
        };
        for (const sheet of document.styleSheets) {
          try {
            walk(sheet.cssRules);
          } catch {
            /* unreadable sheet */
          }
        }
        return allMin && conditions.size >= 2;
      }),
  },

  {
    title: 'לא נשארו סימוני CODE HERE של הליבה בגליון הסגנונות',
    expected: 'כל סימון `CODE HERE` של הליבה חייב להיעלם; סימון שבשורה שלו כתוב גם שם השכבה בסוגריים מסולסלים (`stretch`, `challenge` או `optional`) מותר להשאיר אם דילגת על החלק הזה.',
    run: async (page) =>
      page.evaluate(async () => {
        const link = document.querySelector('link[rel="stylesheet"]');
        if (!link) return false;
        try {
          const source = await (await fetch(link.href)).text();
          /* The grader's rule (grading/lib/checks.mjs, markersLeft): a marker whose line
             is tagged {stretch}, {challenge} or {optional} is an optional part and may stay. */
          return !source
            .split('\n')
            .some((line) => /CODE HERE/.test(line) && !/\{(?:stretch|challenge|optional)\}/.test(line));
        } catch {
          return false;
        }
      }),
  },
];
