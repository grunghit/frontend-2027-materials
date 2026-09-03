/**
 * .checks/public-checks.mjs — week 12. CORE-TIER functional checks, and nothing else.
 *
 * RULES, because this file ships to student repositories:
 *   · CORE tier only (parts א, ב and ג). Part ד and part ה stay in the private spec.
 *   · No point values. No grading criteria. `expected` is a hint, never the answer.
 *   · PAIR EVERY NEGATIVE CHECK WITH A POSITIVE ONE.
 *   · DO NOT RE-CHECK WHAT THE RUNNER ALREADY CHECKS — required files, HTML validity,
 *     `node --check`, `tsc --noEmit` (the runner already runs it when a tsconfig.json is
 *     present), console cleanliness on the ENTRY page, and no horizontal scroll.
 *
 * ── THE WEEK-12 TRAP, AND IT IS THE SHARPEST ONE THE COURSE HAS
 *
 *     AN APPLICATION THAT DOES NOTHING TYPE-CHECKS PERFECTLY.
 *
 * `tsc --noEmit` — which the shared runner runs, for free, before any of these — exits 0
 * on the untouched starter. It exits 0 on a `ts/` folder full of `any`. It exits 0 on a
 * guard whose body is `return true`. A green compiler is not evidence of a migration,
 * and this is the one week where the runner's own headline check is the least
 * informative line on the page.
 *
 * So every check below asks first whether the migration HAPPENED — the `CODE HERE`
 * markers are gone, and there are real annotated signatures — and only then asks whether
 * it was done well. The untouched starter is red on all of them, which is the point.
 *
 * ── AND ONE THING THAT IS DELIBERATELY *NOT* CHECKED HERE
 *
 * Behaviour preservation against last week's file. It is a private-spec row, because
 * making it public would hand students the exact list of network conditions the grader
 * replays. What IS public is "the page still boots and a search still reaches the
 * screen", which is what a student needs to know before pushing.
 *
 * Verified by `npm run audit:ci`: 0 green on the starter, all green on the solution.
 *
 * The page arrives loaded at `index.html`, 1280x900, over http.
 */

/** Fetch a file that sits beside the page. */
const fileAt = async (page, ctx, relative) => {
  const res = await page.request.get(`${ctx.serverUrl}/${relative}`).catch(() => null);
  if (!res || !res.ok()) return null;
  return res.text();
};

/** Comments gone, string literals KEPT — a union of string literals is string literals. */
const bare = (text) => text.replace(/\/\*[\s\S]*?\*\//g, ' ').replace(/(^|[^:])\/\/[^\n]*/g, '$1 ');

/** Comments and string literals gone, so a keyword is never matched inside prose. */
const code = (text) =>
  bare(text)
    .replace(/'(?:[^'\\\n]|\\.)*'/g, "''")
    .replace(/"(?:[^"\\\n]|\\.)*"/g, '""')
    .replace(/`(?:[^`\\]|\\.)*`/g, '``');

/** The .ts sources this week is about. Missing ones come back as null. */
async function sources(page, ctx) {
  const names = ['types.ts', 'api.ts', 'dom.ts'];
  const out = {};
  for (const name of names) out[name] = await fileAt(page, ctx, `ts/${name}`);
  return out;
}

/**
 * HALF ONE of every check here.
 *
 * `CODE HERE` in a `ts/` file is the shortest honest proof that the migration did not
 * happen — and it is the one thing that is NOT true of the untouched starter, which
 * compiles cleanly and contains no `any` at all.
 */
function migrationHappened(files) {
  const present = Object.entries(files).filter(([, text]) => text !== null);
  if (present.length === 0) return { ok: false, why: 'אין אף קובץ ב-ts/' };

  const marked = present.filter(([, text]) => /CODE HERE/.test(text)).map(([name]) => name);
  if (marked.length) return { ok: false, why: `נשארו סימני CODE HERE ב-${marked.join(', ')}` };

  const annotated = present.reduce(
    (n, [, text]) =>
      n +
      (code(text).match(/\)\s*:\s*(?:Promise<|[A-Z]\w*|void|string|number|boolean)/g) ?? []).length,
    0,
  );
  if (annotated < 3) return { ok: false, why: `רק ${annotated} חתימות מוקלדות ב-ts/` };
  return { ok: true, why: '' };
}

export const publicChecks = [
  {
    /*
     * THE ROW THE WEEK EXISTS FOR, and the one that fails a green compiler. It reads the
     * source rather than trusting the exit code, for the reason in the header.
     */
    title: 'ההעברה קרתה — אין `CODE HERE` ב-ts/, ויש חתימות מוקלדות',
    expected:
      'מהדר ירוק אינו ראיה: `tsc` עובר גם על תיקייה שאיש לא נגע בה. מה שכן ראיה הוא שהסימנים נעלמו ושיש טיפוסי החזרה על הפונקציות.',
    run: async (page, ctx) => migrationHappened(await sources(page, ctx)).ok,
  },

  {
    title: 'השומר מצמצם — `value is Item` ולא `boolean`',
    expected:
      'המילה `is` בטיפוס ההחזרה היא כל ההבדל. הבדיקה גם דורשת שהגוף באמת בודק שדות — שומר שמחזיר `true` מיד מהדר מצוין ולא שומר על כלום.',
    run: async (page, ctx) => {
      const files = await sources(page, ctx);
      if (!migrationHappened(files).ok) return false;
      const all = Object.values(files).filter(Boolean).map(code).join('\n');
      const predicate = /function\s+\w+\s*\([^)]*\)\s*:\s*\w+\s+is\s+\w+/.test(all);
      const checks = (all.match(/typeof\s+\w+(?:\.\w+|\[[^\]]+\])\s*[!=]==/g) ?? []).length;
      return predicate && checks >= 3;
    },
  },

  {
    title: 'אין `any` באף קובץ ב-ts/',
    expected:
      '`unknown` מותר ורצוי. `any` מכבה את המהדר בדיוק במקום שבו הוא שווה משהו. תגובות ומחרוזות אינן נספרות.',
    run: async (page, ctx) => {
      const files = await sources(page, ctx);
      if (!migrationHappened(files).ok) return false;
      return Object.values(files)
        .filter(Boolean)
        .every((text) => !/(?::\s*any\b|as\s+any\b|<any>|any\[\])/.test(code(text)));
    },
  },

  {
    title: '`unknown` בגבול, ולא `as` — התשובה מהרשת אינה מוקלדת בהצהרה',
    expected:
      '`res.json()` מוחזר כ-`any` בטיפוסי ה-DOM, ולכן בלי הצהרה מפורשת המהדר שותק. `(await res.json()) as X` מהדר, קצר יותר, ובודק בדיוק כלום.',
    run: async (page, ctx) => {
      const api = await fileAt(page, ctx, 'ts/api.ts');
      if (api === null) return false;
      const src = code(api);
      const declared = /:\s*unknown\b/.test(src);
      const cast =
        /res\.json\(\)\s*\)?\s*as\s+(?!unknown)\w/.test(src) ||
        /await\s+res\.json\(\)\s*as\s+(?!unknown)\w/.test(src);
      return declared && !cast;
    },
  },

  {
    title: '`js/api.js` הוא הפלט של המהדר, ולא הקובץ הישן שנשאר לידו',
    expected:
      'אותו נתיב בדיוק, ולכן `render.js` ו-`events.js` לא צריכים לדעת שקרה משהו. הבדיקה מוודאת שאין תחביר טיפוסים בפלט.',
    run: async (page, ctx) => {
      const ts = await fileAt(page, ctx, 'ts/api.ts');
      const js = await fileAt(page, ctx, 'js/api.js');
      if (ts === null || js === null) return false;
      if (!migrationHappened(await sources(page, ctx)).ok) return false;
      return !/\binterface\s+\w+|:\s*Promise<|\bimport\s+type\b/.test(code(js));
    },
  },

  {
    title: '`strict` עדיין דלוק ב-tsconfig.json',
    expected:
      'כיבוי `strict` הופך את כל השאר לקישוט: `value.id` על `unknown` מהדר, והשומרים מפסיקים לשמור. השורה משולבת עם "ההעברה קרתה" כדי שקובץ שאיש לא נגע בו לא יזכה בה.',
    run: async (page, ctx) => {
      if (!migrationHappened(await sources(page, ctx)).ok) return false;
      const cfg = await fileAt(page, ctx, 'tsconfig.json');
      return cfg !== null && /"strict"\s*:\s*true/.test(cfg);
    },
  },

  {
    title: 'המפרט מלא — `specs/ts-migration.md`, חמישה סעיפים, בלי סימנים שנשארו',
    expected:
      'מפרט שנכתב אחרי הקוד תמיד מסכים איתו. הבדיקה רואה רק שהוא מלא; מה שכתוב בו נקרא בעיניים.',
    run: async (page, ctx) => {
      const text = await fileAt(page, ctx, 'specs/ts-migration.md');
      if (text === null || /CODE HERE/.test(text)) return false;
      const sections = text
        .replace(/<!--[\s\S]*?-->/g, '')
        .split(/^## /m)
        .slice(1);
      return (
        sections.length >= 5 &&
        sections.every((s) => s.replace(/^[^\n]*\n/, '').replace(/[|\-\s]/g, '').length >= 20)
      );
    },
  },

  {
    title: 'היישום עדיין עובד — חיפוש מגיע למסך',
    expected:
      'ההעברה היא שינוי משמר-התנהגות. הבדיקה מוכיחה קודם שההעברה קרתה, ואז מקלידה בתיבה ודורשת שהפאנל יגיע ל-`results`. אין כאן רשת: הבדיקה עונה לבקשה שלך בתוכן של `data/catalogue.json` שלך עצמך.',
    run: async (page, ctx) => {
      if (!migrationHappened(await sources(page, ctx)).ok) return false;

      const bytes = await fileAt(page, ctx, 'data/catalogue.json');
      if (bytes === null) return false;

      await page.route('**/*', async (route) => {
        const url = route.request().url();
        if (url.startsWith(ctx.serverUrl)) return route.continue();
        return route.fulfill({ status: 200, contentType: 'application/json', body: bytes });
      });

      await page.goto(`${ctx.serverUrl}/index.html`, { waitUntil: 'networkidle' });
      const box = page.locator('#api-query');
      if ((await box.count()) === 0) {
        await page.unroute('**/*').catch(() => {});
        return false;
      }
      await box.click();
      await box.pressSequentially('קמח', { delay: 40 });
      await page.waitForTimeout(1400);

      const view = await page.evaluate(() => ({
        state: document.querySelector('#api-panel')?.dataset.state ?? null,
        rows: document.querySelectorAll('#api-results li').length,
      }));
      await page.unroute('**/*').catch(() => {});
      return view.state === 'results' && view.rows > 0;
    },
  },
];
