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
 *
 * Same rule as the grader (grading/lib/checks.mjs, markersLeft): a line tagged
 * {stretch} (ts/dom.ts is part ד), {challenge} or {optional} may keep its marker.
 */
const CORE_MARKER = (text) =>
  text.split('\n').some((line) => /CODE HERE/.test(line) && !/\{(?:stretch|challenge|optional)\}/.test(line));

function migrationHappened(files) {
  const present = Object.entries(files).filter(([, text]) => text !== null);
  if (present.length === 0) return { ok: false, why: 'אין אף קובץ ב-ts/' };

  const marked = present.filter(([, text]) => CORE_MARKER(text)).map(([name]) => name);
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

/* ── The guard, read as the grader reads it (grading/specs/week-12.mjs) ──────
 * A copy, because this file ships alone to a student repository. If one changes,
 * change both: this check must never be greener than the grader's row. */
const IDENT = '[A-Za-z_$][\\w$]*';

function braceBody(source, from) {
  let depth = 1;
  for (let i = from; i < source.length; i += 1) {
    if (source[i] === '{') depth += 1;
    else if (source[i] === '}') {
      depth -= 1;
      if (depth === 0) return source.slice(from, i);
    }
  }
  return null;
}

function expressionBody(source, from) {
  let depth = 0;
  for (let i = from; i < source.length; i += 1) {
    const c = source[i];
    if (c === '(' || c === '[' || c === '{') depth += 1;
    else if (c === ')' || c === ']' || c === '}') {
      if (depth === 0) return source.slice(from, i);
      depth -= 1;
    } else if ((c === ';' || c === ',') && depth === 0) return source.slice(from, i);
  }
  return source.slice(from);
}

/** Every `x is T` guard — declaration, arrow or function expression — as { name, param, body }. */
function narrowingPredicates(source) {
  const out = [];
  const heads = [
    { re: new RegExp(`\\bfunction\\s+(${IDENT})\\s*(?:<[^>]*>)?\\s*\\(([^)]*)\\)\\s*:\\s*${IDENT}\\s+is\\s+`, 'g'), arrow: false },
    {
      re: new RegExp(`\\b(?:const|let|var)\\s+(${IDENT})\\s*=\\s*(?:async\\s+)?function\\b[^(]*\\(([^)]*)\\)\\s*:\\s*${IDENT}\\s+is\\s+`, 'g'),
      arrow: false,
    },
    { re: new RegExp(`\\b(?:const|let|var)\\s+(${IDENT})\\s*=\\s*(?:async\\s+)?(?:<[^>]*>\\s*)?\\(([^)]*)\\)\\s*:\\s*${IDENT}\\s+is\\s+`, 'g'), arrow: true },
  ];
  for (const { re, arrow } of heads) {
    for (const m of source.matchAll(re)) {
      let depth = 0;
      let typeRead = false;
      let at = -1;
      let kind = null;
      for (let k = m.index + m[0].length; k < source.length; k += 1) {
        const c = source[k];
        if (depth === 0 && typeRead && !arrow && c === '{') { at = k + 1; kind = 'brace'; break; }
        if (depth === 0 && typeRead && arrow && c === '=' && source[k + 1] === '>') { at = k + 2; kind = 'arrow'; break; }
        if (depth === 0 && c === ';') break;
        if ('{(<['.includes(c)) depth += 1;
        else if ('})>]'.includes(c)) depth -= 1;
        if (!/\s/.test(c)) typeRead = true;
      }
      if (at < 0) continue;
      let body;
      if (kind === 'brace') body = braceBody(source, at);
      else {
        while (/\s/.test(source[at] ?? '')) at += 1;
        body = source[at] === '{' ? braceBody(source, at + 1) : expressionBody(source, at);
      }
      if (body !== null) out.push({ name: m[1], param: (m[2].match(new RegExp(IDENT)) ?? [''])[0], body });
    }
  }
  return out;
}

/** `typeof value.id ===`, `typeof value['id'] !==`, or `typeof id ===` on a destructured name. */
function fieldTypeofChecks({ param, body }) {
  let n = 0;
  const re = new RegExp(`typeof\\s+(${IDENT})((?:\\s*\\??\\.\\s*${IDENT}|\\s*\\[[^\\]]+\\])*)\\s*[!=]==?`, 'g');
  for (const m of body.matchAll(re)) if (m[2].trim() !== '' || m[1] !== param) n += 1;
  return n;
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
      'המילה `is` בטיפוס ההחזרה היא כל ההבדל — כפונקציה, כ-arrow או כביטוי פונקציה. הבדיקה גם דורשת שבגוף השומרים יהיו יחד לפחות שלוש בדיקות `typeof` על שדות — שומר שמחזיר `true` מיד מהדר מצוין ולא שומר על כלום.',
    run: async (page, ctx) => {
      const files = await sources(page, ctx);
      if (!migrationHappened(files).ok) return false;
      const all = Object.values(files).filter(Boolean).map(code).join('\n');
      /* The grader's rule (grading/specs/week-12.mjs, row 4): the typeof checks are
         counted INSIDE the guard bodies only — not across the folder, where ts/api.ts
         has typeof checks of its own that would make a `return true` guard green. */
      const found = narrowingPredicates(all);
      const checks = found.reduce((n, p) => n + fieldTypeofChecks(p), 0);
      return found.length >= 1 && checks >= 3;
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
      if (text === null || CORE_MARKER(text)) return false;
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
