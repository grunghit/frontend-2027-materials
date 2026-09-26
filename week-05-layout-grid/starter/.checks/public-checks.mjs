/**
 * Week 5 — the CORE-TIER public check set that runs in the student's own repo.
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
 * EVERYTHING HERE IS MEASURED ON THE RENDERED PAGE. For Grid that means reading
 * the USED track list out of getComputedStyle — the pixel widths the layout
 * resolved to, never the string the student typed. `repeat(auto-fit, …)` comes
 * back as something like "310px 310px 0px 0px", so there is no phrase to guess.
 *
 * Two boxes count as sharing a row when their vertical ranges OVERLAP, and as
 * sharing a column when their horizontal ranges do — never by comparing edges,
 * because items of different sizes in one row have different tops.
 *
 * This file cannot import the private grading library, so the little grouping it
 * needs is re-implemented inline. Keep it in step with grading/lib/checks.mjs
 * §2b and §2c if either changes.
 */

const at = async (page, width) => {
  await page.setViewportSize({ width, height: 900 });
  await page.waitForTimeout(180);
};

/**
 * Run a check against warmup.html and then PUT THE PAGE BACK.
 *
 * The runner hands every check the same page object, already loaded at the entry
 * file — it does not re-navigate between checks the way the private grader does.
 * So a check that wanders off to the other page and does not return leaves every
 * check after it looking at the wrong document, and they all fail for a reason
 * that has nothing to do with the student's work. The `finally` is the whole
 * point of this helper.
 */
const onWarmup = async (page, ctx, fn) => {
  const response = await page
    .goto(`${ctx.serverUrl}/warmup.html`, { waitUntil: 'networkidle' })
    .catch(() => null);
  if (!response || !response.ok()) return false;
  try {
    await page.waitForTimeout(150);
    return await fn(page);
  } finally {
    await page.setViewportSize({ width: 1280, height: 900 });
    await page
      .goto(`${ctx.serverUrl}/${ctx.entry ?? 'index.html'}`, { waitUntil: 'networkidle' })
      .catch(() => null);
    await page.waitForTimeout(150);
  }
};

export const publicChecks = [
  {
    title: 'שני העמודים קיימים וטוענים את אותו גליון סגנונות',
    expected: '`index.html` ו-`warmup.html`, שניהם עם `<link rel="stylesheet" href="styles.css">`.',
    run: async (page, ctx) => {
      const here = await page.evaluate(() =>
        Boolean(document.querySelector('link[rel="stylesheet"]')),
      );
      if (!here) return false;
      return onWarmup(page, ctx, (p) =>
        p.evaluate(() => {
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
      );
    },
  },

  {
    title: 'הציור הוא Grid של ארבע עמודות על ארבע שורות',
    expected: 'שתי רשימות מסלולים על `.mondrian` — אחת לעמודות ואחת לשורות, ארבעה מסלולים בכל אחת.',
    run: async (page, ctx) =>
      onWarmup(page, ctx, (p) =>
        p.evaluate(() => {
          const el = document.querySelector('.mondrian');
          if (!el) return false;
          const s = getComputedStyle(el);
          if (!/grid/.test(s.display)) return false;
          const n = (v) => (v && v !== 'none' ? v.trim().split(/\s+/).length : 0);
          return n(s.gridTemplateColumns) === 4 && n(s.gridTemplateRows) === 4;
        }),
      ),
  },

  {
    title: 'הציור נשאר ריבועי ובאותן פרופורציות גם ברוחב של נייד',
    expected:
      'המסלולים נכתבים כיחסים ולא כפיקסלים, והריבועיות מגיעה מ-`aspect-ratio` ולא מגובה קבוע. נמדד ב-375 וב-1280.',
    run: async (page, ctx) =>
      onWarmup(page, ctx, async (p) => {
        const ratios = [];
        for (const width of [375, 1280]) {
          await at(p, width);
          const r = await p.evaluate(() => {
            const el = document.querySelector('.mondrian');
            if (!el) return null;
            const s = getComputedStyle(el);
            const box = el.getBoundingClientRect();
            const nums = (v) => (v && v !== 'none' ? v.trim().split(/\s+/).map(parseFloat) : []);
            const cols = nums(s.gridTemplateColumns);
            if (cols.length !== 4 || box.height === 0) return null;
            return { first: cols[0] / cols[3], square: box.width / box.height };
          });
          if (!r || Math.abs(r.square - 1) > 0.06) return false;
          ratios.push(r.first);
        }
        /* 320 / 50 is 6.4. If the tracks were written in pixels the ratio holds
           but the box stops being square, and if the box was given a fixed width
           the ratio at 375 collapses — either way one of the two widths fails. */
        return ratios.every((r) => Math.abs(r - 6.4) < 0.8);
      }),
  },

  {
    title: 'הציור מורכב מתשעה אזורים ממוקמים שמכסים את כל התאים',
    expected: 'תשעה ילדים ב-`.mondrian`, כל אחד עם מיקום משלו, יחד מכסים את שישה עשר התאים.',
    run: async (page, ctx) =>
      onWarmup(page, ctx, (p) =>
        p.evaluate(() => {
          const el = document.querySelector('.mondrian');
          if (!el) return false;
          const kids = [...el.children];
          if (kids.length !== 9) return false;
          const box = el.getBoundingClientRect();
          const area = kids.reduce((sum, k) => {
            const r = k.getBoundingClientRect();
            return sum + r.width * r.height;
          }, 0);
          return area / (box.width * box.height) > 0.8;
        }),
      ),
  },

  {
    title: 'הלוח הוא שמונה על שמונה, והמשבצות ריבועיות',
    expected: 'שמונה מסלולים שווים, ומשבצת שנשארת ריבועית בכל רוחב — לא `width` ו-`height` קבועים.',
    run: async (page, ctx) =>
      onWarmup(page, ctx, async (p) => {
        await at(p, 900);
        return p.evaluate(() => {
          const board = document.querySelector('.board');
          if (!board) return false;
          const cells = [...board.children];
          if (cells.length !== 64) return false;
          const cols = getComputedStyle(board).gridTemplateColumns;
          if (!cols || cols === 'none' || cols.trim().split(/\s+/).length !== 8) return false;
          const r = cells[0].getBoundingClientRect();
          return r.height > 0 && Math.abs(r.width / r.height - 1) < 0.06;
        });
      }),
  },

  {
    title: 'הצבעים בלוח מתחלפים כמו בלוח שחמט, גם בין שורה לשורה',
    expected:
      'שכנה בשורה בצבע אחר, וגם המשבצת שמתחת בצבע אחר. אם המשבצת שמתחת באותו צבע — קיבלת פסים אנכיים, וזה בדיוק מה ש-`:nth-child(odd)` עושה על לוח ברוחב זוגי.',
    run: async (page, ctx) =>
      onWarmup(page, ctx, (p) =>
        p.evaluate(() => {
          const cells = [...(document.querySelector('.board')?.children ?? [])];
          if (cells.length !== 64) return false;
          const bg = (i) => getComputedStyle(cells[i]).backgroundColor;
          return bg(0) !== bg(1) && bg(0) !== bg(8) && bg(0) === bg(2);
        }),
      ),
  },

  {
    title: 'שלד העמוד הוא Grid עם אזורים בשמות',
    expected: '`grid-template-areas` על `.layout`, וכל אחד מחמשת האזורים תובע שם עם `grid-area`.',
    run: async (page) =>
      page.evaluate(() => {
        const el = document.querySelector('.layout');
        if (!el || !/grid/.test(getComputedStyle(el).display)) return false;
        const areas = getComputedStyle(el).gridTemplateAreas;
        if (!areas || areas === 'none') return false;
        const named = ['.site-header', '.side-nav', '.main', '.activity', '.site-footer'].every(
          (sel) => {
            const node = document.querySelector(sel);
            if (!node) return false;
            const area = getComputedStyle(node).gridArea || '';
            return area && !/^auto/.test(area);
          },
        );
        return named;
      }),
  },

  {
    title: 'השלד נראה אחרת בשלושה רוחבים, ואותם חמישה אזורים שורדים בכולם',
    expected:
      'עמודה אחת ב-375 ושלוש ב-1280. מה שקורה באמצע הוא שלך. שום אזור לא נעלם בדרך — הם רק מסתדרים מחדש.',
    run: async (page) => {
      const seen = [];
      for (const width of [375, 768, 1280]) {
        await at(page, width);
        const shape = await page.evaluate(() => {
          const el = document.querySelector('.layout');
          if (!el) return null;
          const value = getComputedStyle(el).gridTemplateAreas;
          if (!value || value === 'none') return null;
          const rows = (value.match(/"[^"]*"/g) ?? []).map((r) =>
            r.replace(/"/g, '').trim().split(/\s+/),
          );
          const names = new Set(rows.flat().filter((n) => n !== '.'));
          return { value, columns: rows[0]?.length ?? 0, names: names.size };
        });
        if (!shape || shape.names !== 5) return false;
        seen.push(shape);
      }
      const distinct = new Set(seen.map((s) => s.value));
      return seen[0].columns === 1 && seen[2].columns === 3 && distinct.size >= 2;
    },
  },

  {
    title: 'השלד נפרס בשלוש נקודות שבירה, וכולן min-width',
    expected:
      'העמוד נבנה מהקטן כלפי מעלה, כך שכל שאילתה מוסיפה ואף אחת לא מבטלת. שאילתת `max-width` אחת מפילה את הבדיקה — וגם שלד שלא משנה סידור, כי אז אין מה להוסיף עליו.',
    /* PAIRED. The starter already ships two GIVEN min-width queries (the warm-up
       page chrome and the side-nav column), so "every width query is min-width"
       was true before the student wrote anything. What the constraint protects is
       that the shell is built up from the small end — so assert the shell actually
       re-arranges. Mirrors `mobile-first` in grading/specs/week-05.mjs. */
    run: async (page) => {
      const allMin = await page.evaluate(() => {
        let ok = true;
        const walk = (rules) => {
          for (const rule of rules) {
            if (rule.media) {
              const text = (rule.conditionText || rule.media.mediaText || '').toLowerCase();
              if (/\bwidth\b/.test(text)) {
                const isMin = /min-width/.test(text) || /\bwidth\s*>=?/.test(text);
                if (!isMin) ok = false;
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
        return ok;
      });
      if (!allMin) return false;

      const seen = new Set();
      for (const width of [375, 768, 1280]) {
        await at(page, width);
        const value = await page.evaluate(() => {
          const el = document.querySelector('.layout');
          if (!el) return null;
          const areas = getComputedStyle(el).gridTemplateAreas;
          return areas && areas !== 'none' ? areas : null;
        });
        if (!value) return false;
        seen.add(value);
      }
      return seen.size >= 2;
    },
  },

  {
    title: 'שורת הכרטיסים משנה מספר עמודות לבד',
    expected:
      'עמודה אחת בנייד ויותר מאחת במסך רחב, בלי שאילתת מדיה על השורה עצמה. `auto-fit` יחד עם `minmax` עושה את זה.',
    run: async (page) => {
      await at(page, 375);
      const narrow = await page.evaluate(() => {
        const boxes = [...document.querySelectorAll('.kpi')].map((el) =>
          el.getBoundingClientRect(),
        );
        if (boxes.length < 6) return null;
        /* Group into visual columns by HORIZONTAL overlap. */
        const cols = [];
        for (const b of boxes) {
          const c = cols.find((g) => g.some((o) => b.left < o.right - 1 && b.right > o.left + 1));
          if (c) c.push(b);
          else cols.push([b]);
        }
        return cols.length;
      });

      await at(page, 1280);
      const wide = await page.evaluate(() => {
        const grid = document.querySelector('.kpis');
        if (!grid || !/grid/.test(getComputedStyle(grid).display)) return null;
        const value = getComputedStyle(grid).gridTemplateColumns;
        if (!value || value === 'none') return null;
        /* Collapsed auto-fit tracks report as 0px and are not columns you can see. */
        return value
          .trim()
          .split(/\s+/)
          .map(parseFloat)
          .filter((n) => n > 0.5).length;
      });

      return narrow === 1 && wide !== null && wide >= 2;
    },
  },

  {
    title: 'לא נשארו סימוני CODE HERE בגליון הסגנונות',
    expected: 'כשאין יותר סימונים מעל שכבת ההרחבה — סיימת את שכבת הליבה.',
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
