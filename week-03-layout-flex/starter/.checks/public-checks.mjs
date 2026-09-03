/**
 * Week 3 — the CORE-TIER public check set that runs in the student's own repo.
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
 * `page` is already loaded at the entry file, viewport 1280×900, served over http.
 *
 * EVERYTHING HERE IS MEASURED ON THE RENDERED PAGE. This week that mostly means
 * GEOMETRY — where the boxes ended up at 375 and 1280 — because that is the only
 * honest way to check a layout. A student who reaches three-across a different
 * way passes; one who writes `display: flex` on a container whose children then
 * wrap wrongly does not.
 *
 * Two boxes count as sharing a row when their vertical ranges OVERLAP, never by
 * comparing top edges: `align-items: center` gives side-by-side items of
 * different heights different tops, and a top-edge test would call a correct
 * layout broken.
 */

/** Group elements into visual rows by vertical overlap. Injected into the page. */
const ROW_HELPER = `
  const rowsOf = (els) => {
    const boxes = els.map((el) => el.getBoundingClientRect());
    const rows = [];
    for (const b of boxes) {
      const row = rows.find((r) => r.some((o) => b.top < o.bottom - 1 && b.bottom > o.top + 1));
      if (row) row.push(b); else rows.push([b]);
    }
    return rows;
  };
`;

const at = async (page, width) => {
  await page.setViewportSize({ width, height: 900 });
  await page.waitForTimeout(180);
};

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
    title: 'שורת הניווט היא שורה: המותג והתפריט זה לצד זה',
    expected: '`display: flex` על הניווט, ו-`align-items: center` כדי שהשניים יהיו באותו גובה.',
    run: async (page) => {
      await at(page, 1280);
      return page.evaluate(() => {
        const nav = document.querySelector('.site-nav') ?? document.querySelector('header nav');
        const brand = document.querySelector('.brand');
        const menu =
          document.querySelector('.nav-disclosure') ?? document.querySelector('.nav-links');
        if (!nav || !brand || !menu) return false;
        if (!/flex/.test(getComputedStyle(nav).display)) return false;
        const a = brand.getBoundingClientRect();
        const b = menu.getBoundingClientRect();
        /* vertical ranges overlap, and the menu starts at or after the brand ends */
        return a.top < b.bottom - 1 && a.bottom > b.top + 1 && b.left >= a.right - 1;
      });
    },
  },
  {
    title: 'רשימת הקישורים היא שורה בלי תבליטים',
    expected:
      '`ul` מגיעה עם תבליטים, ריפוד וצורת ערימה. שלושתם עיצוב של רשימה, לא פריסה — הסר אותם.',
    run: async (page) => {
      await at(page, 1280);
      return page.evaluate(() => {
        const ul = document.querySelector('.nav-links');
        if (!ul) return false;
        const s = getComputedStyle(ul);
        return /flex/.test(s.display) && s.flexDirection === 'row' && s.listStyleType === 'none';
      });
    },
  },
  {
    title: 'הדפוס לנייד עובד לשני הכיוונים',
    expected:
      'ברוחב 375 יש פקד לפתיחה והקישורים מוסתרים; ברוחב 1280 הקישורים מוצגים והפקד נעלם. זו השאילתה היחידה שמותרת השבוע.',
    run: async (page) => {
      const state = async () =>
        page.evaluate(() => {
          const visible = (el) =>
            Boolean(el) && el.checkVisibility({ checkVisibilityCSS: true, checkOpacity: true });
          return {
            toggle: visible(
              document.querySelector('.nav-toggle') ?? document.querySelector('summary'),
            ),
            links: visible(document.querySelector('.nav-links')),
          };
        });

      await at(page, 375);
      const phone = await state();
      await at(page, 1280);
      const desktop = await state();

      return phone.toggle && !phone.links && !desktop.toggle && desktop.links;
    },
  },
  {
    title: 'ה-hero הוא שתי עמודות במסך רחב ועמודה אחת בנייד',
    expected: '`flex-wrap: wrap` ו-`flex-basis` על הטקסט. בלי שאילתת מדיה — זה מה ש-wrap עושה.',
    run: async (page) => {
      const beside = async () =>
        page.evaluate(() => {
          const text = document.querySelector('.hero-text');
          const art = document.querySelector('.hero-art');
          if (!text || !art) return null;
          const a = text.getBoundingClientRect();
          const b = art.getBoundingClientRect();
          return a.top < b.bottom - 1 && a.bottom > b.top + 1 && b.left >= a.right - 1;
        });

      await at(page, 1280);
      const wide = await beside();
      await at(page, 375);
      const narrow = await beside();
      return wide === true && narrow === false;
    },
  },
  {
    title: 'שלושת הכרטיסים בשורה אחת במסך רחב, ונערמים בנייד',
    expected: 'מה קורה ב-768 הוא שיקול שלך. מה שנבדק הוא שהמעבר קורה לבד, בלי שאילתת מדיה.',
    run: async (page) => {
      const rows = async () =>
        page.evaluate(
          new Function(
            `${ROW_HELPER} return rowsOf([...document.querySelectorAll('.card')]).length;`,
          ),
        );

      await at(page, 1280);
      const wide = await rows();
      await at(page, 375);
      const narrow = await rows();
      return wide === 1 && narrow === 3;
    },
  },
  {
    title: 'כרטיסים שחולקים שורה הם באותו גובה',
    expected:
      'זו ברירת המחדל `align-items: stretch`. שים לב שקיבלת אותה בחינם — float לא היה נותן.',
    run: async (page) => {
      await at(page, 1280);
      return page.evaluate(
        new Function(`${ROW_HELPER}
          const rows = rowsOf([...document.querySelectorAll('.card')]);
          if (!rows.some((r) => r.length >= 2)) return false;
          return rows.every((row) => {
            if (row.length < 2) return true;
            const hs = row.map((b) => Math.round(b.height));
            return Math.max(...hs) - Math.min(...hs) <= 2;
          });
        `),
      );
    },
  },
  {
    title:
      'העמוד בנוי ב-Flexbox, ובתוך מגבלות השבוע: בלי Grid, בלי float, ולכל היותר שאילתת רוחב אחת',
    expected:
      '`display: grid` הוא שבוע 4, float הוא ארכיאולוגיה, `!important` אינו תיקון, ושאילתת המדיה היחידה שמותרת היא זו של שורת הניווט.',
    run: async (page) =>
      page.evaluate(() => {
        /* THE POSITIVE HALF, and it is why this row is not a free pass.
           "No Grid, no float, no !important, at most one width query" is ALL TRUE
           of a stylesheet that lays nothing out at all — as two separate negative
           rows, this handed a bare starter two green ticks. The week's actual
           requirement is that the page IS laid out, in Flexbox, and stayed inside
           the constraints while doing it. */
        let flexContainers = 0;
        for (const el of document.querySelectorAll('body *')) {
          const s = getComputedStyle(el);
          if (/flex/.test(s.display)) flexContainers += 1;
          if (/grid/.test(s.display)) return false;
          if (s.float && s.float !== 'none') return false;
        }
        if (flexContainers < 3) return false;

        let widthQueries = 0;
        for (const sheet of document.styleSheets) {
          let rules;
          try {
            rules = sheet.cssRules;
          } catch {
            continue;
          }
          const walk = (list) => {
            for (const rule of list) {
              const text = rule.conditionText ?? rule.media?.mediaText ?? '';
              if (rule.media && /width/.test(text)) widthQueries += 1;
              if (rule.cssRules && !rule.style) {
                if (!walk(rule.cssRules)) return false;
                continue;
              }
              if (!rule.style) continue;
              for (const prop of rule.style) {
                if (rule.style.getPropertyPriority(prop) === 'important') return false;
              }
            }
            return true;
          };
          if (!walk(rules)) return false;
        }
        return widthQueries <= 1;
      }),
  },
  {
    title: 'לא נשארו סימוני `CODE HERE` ב-`styles.css`',
    expected: 'כל מקום שסומן `CODE HERE` הוא מקום שבו אתה כותב. מחק את הסימון אחרי שכתבת.',
    run: async (page) =>
      page.evaluate(async () => {
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
