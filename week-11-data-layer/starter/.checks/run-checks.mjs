/**
 * .checks/run-checks.mjs — the REDUCED PUBLIC check set (CLAUDE_CODE_BRIEF.md §7.1).
 *
 * Shipped inside every published starter. Runs in the student's own repo on every push,
 * and locally with `node .checks/run-checks.mjs` before they push.
 *
 * WHAT IS DELIBERATELY *NOT* HERE:
 *   stretch-tier checks · point values · design and quality criteria · anything manually
 *   graded. Those live in the private grading/specs/ and never reach a student repo.
 *   Students learn "does it work", not "which string does the grader look for".
 *
 * Green CI is the FLOOR, not the grade. It proves the thing runs.
 */
import { readFile, readdir, access } from 'node:fs/promises';
import { appendFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const CHECKS_DIR = path.dirname(fileURLToPath(import.meta.url));

/**
 * The folder being checked.
 *
 * Two layouts have to work, and they disagree about where .checks lives:
 *   · a published per-week starter — .checks sits INSIDE the assignment folder, so '..'
 *     is the assignment;
 *   · the semester repo — ONE .checks at the repo root and twelve assignment folders, so
 *     '..' is the repo and there is no index.html there at all. The workflow names the
 *     folder that changed in CHECK_TARGET.
 */
const ROOT = process.env.CHECK_TARGET
  ? path.resolve(process.cwd(), process.env.CHECK_TARGET)
  : path.resolve(CHECKS_DIR, '..');

/**
 * A week may ship its own core-tier checks and its own config next to its own files.
 * Prefer those over the shared ones, so week 10's checks never run against week 1.
 */
const LOCAL_CHECKS = path.join(ROOT, '.checks');
const CONFIG_DIR = existsSync(path.join(LOCAL_CHECKS, 'public-checks.mjs')) ? LOCAL_CHECKS : CHECKS_DIR;

const LABEL = process.env.WEEK_LABEL || 'המטלה';

const results = [];
/** @param {'pass'|'fail'|'skip'} status */
const add = (status, title, expected = '') => results.push({ status, title, expected });

// ─────────────────────────────────────────────────────────────────────────────
// Small helpers
// ─────────────────────────────────────────────────────────────────────────────
const exists = async (p) => {
  try {
    await access(p);
    return true;
  } catch {
    return false;
  }
};

async function walk(dir, out = []) {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    if (['node_modules', '.git', '.checks', 'dist'].includes(entry.name)) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) await walk(full, out);
    else out.push(full);
  }
  return out;
}

const files = await walk(ROOT);
const byExt = (ext) => files.filter((f) => f.endsWith(ext));

// ─────────────────────────────────────────────────────────────────────────────
// 1. Required files present
// ─────────────────────────────────────────────────────────────────────────────
let config = { requiredFiles: ['index.html'], entry: 'index.html' };
if (await exists(path.join(CONFIG_DIR, 'config.json'))) {
  config = { ...config, ...JSON.parse(await readFile(path.join(CONFIG_DIR, 'config.json'), 'utf8')) };
}

for (const rel of config.requiredFiles) {
  (await exists(path.join(ROOT, rel)))
    ? add('pass', `הקובץ \`${rel}\` קיים`)
    : add('fail', `הקובץ \`${rel}\` קיים`, `הקובץ חייב להיות בשם הזה ובמיקום הזה. בדוק אותיות גדולות/קטנות.`);
}

// ─────────────────────────────────────────────────────────────────────────────
// 2. HTML validity
// ─────────────────────────────────────────────────────────────────────────────
{
  const html = byExt('.html');
  if (html.length === 0) {
    add('skip', 'ולידציה של HTML', 'לא נמצאו קבצי HTML.');
  } else {
    // --config is explicit and points at the config shipped IN this folder. Without it
    // html-validate searches upward from each file and finds nothing in a student repo,
    // so it falls back to defaults whose style rules contradict Prettier — and students
    // get "DOCTYPE should be uppercase" on a file Prettier just formatted for them.
    const r = spawnSync('npx', ['html-validate', '--config', path.join(CHECKS_DIR, 'htmlvalidate.json'), ...html], {
      cwd: CHECKS_DIR,
      encoding: 'utf8',
    });
    if (r.status === 0) {
      add('pass', `ולידציה של HTML (${html.length} קבצים)`);
    } else {
      const lines = (r.stdout || '')
        .split('\n')
        .filter((l) => /error/.test(l))
        .slice(0, 5)
        .map((l) => l.trim());
      add(
        'fail',
        'ולידציה של HTML',
        `ה-HTML לא תקין. ${lines.length ? 'לדוגמה: ' + lines[0] : ''} — פתח את הקובץ ותקן את התגיות.`,
      );
    }
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 3. JavaScript parses / TypeScript compiles
// ─────────────────────────────────────────────────────────────────────────────
{
  const js = byExt('.js').concat(byExt('.mjs'));
  const bad = js.filter((f) => spawnSync(process.execPath, ['--check', f], { encoding: 'utf8' }).status !== 0);
  if (js.length === 0) add('skip', 'שגיאות תחביר ב-JavaScript', 'לא נמצאו קבצי JS.');
  else if (bad.length === 0) add('pass', `שגיאות תחביר ב-JavaScript (${js.length} קבצים)`);
  else
    add(
      'fail',
      'שגיאות תחביר ב-JavaScript',
      `לקובץ \`${path.relative(ROOT, bad[0])}\` יש שגיאת תחביר — הוא לא ירוץ בכלל בדפדפן.`,
    );
}

if (await exists(path.join(ROOT, 'tsconfig.json'))) {
  const r = spawnSync('npx', ['tsc', '--noEmit', '-p', ROOT], { cwd: CHECKS_DIR, encoding: 'utf8' });
  r.status === 0
    ? add('pass', 'הידור TypeScript (`tsc --noEmit`)')
    : add('fail', 'הידור TypeScript', `הקומפיילר מצא שגיאות טיפוסים. הרץ \`npx tsc --noEmit\` מקומית כדי לראות אותן.`);
}

// ─────────────────────────────────────────────────────────────────────────────
// 4–5. Boot with zero console errors, and render at 375 / 768 / 1280
// ─────────────────────────────────────────────────────────────────────────────
const entryPath = path.join(ROOT, config.entry);
if (!(await exists(entryPath))) {
  add('skip', 'טעינת העמוד בדפדפן', `\`${config.entry}\` לא נמצא, אז לא הרצנו את העמוד.`);
} else {
  const { startServer } = await import('./static-server.mjs');
  const { chromium } = await import('playwright');

  const server = await startServer({ root: ROOT });

  // Launching the browser is INFRASTRUCTURE, not the student's code. If it fails
  // (missing shared libraries, a half-downloaded browser, an OOM runner) the student
  // must not see a red X on work that was never tested. Bail out green with a clearly
  // labelled infrastructure summary — same contract as the workflow's infra guard.
  let browser;
  try {
    browser = await chromium.launch();
  } catch (err) {
    await server.close();
    const msg = [
      '## ⚙️ תקלת תשתית — לא נכשלת בבדיקה',
      '',
      'הדפדפן האוטומטי לא הצליח לעלות, ולכן הקוד שלך לא נבדק בכלל.',
      'זו תקלה בסביבת ההרצה, **לא בעיה בקוד שלך, וזה לא משפיע על הציון.**',
      '',
      'מה לעשות: לחץ **Re-run jobs**. אם זה חוזר פעמיים — כתוב לי.',
      '',
      `<sub>${String(err.message).split('\n')[0].slice(0, 160)}</sub>`,
    ].join('\n');
    console.log(msg);
    if (process.env.GITHUB_STEP_SUMMARY) await appendFile(process.env.GITHUB_STEP_SUMMARY, msg + '\n');
    process.exit(0);
  }

  try {
    const page = await browser.newPage();
    const errors = [];
    page.on('console', (m) => m.type() === 'error' && errors.push(m.text()));
    page.on('pageerror', (e) => errors.push(e.message));

    await page.goto(`${server.url}/${config.entry}`, { waitUntil: 'networkidle', timeout: 20000 });
    await page.waitForTimeout(400);

    errors.length === 0
      ? add('pass', 'העמוד נטען בלי שגיאות בקונסול')
      : add(
          'fail',
          'העמוד נטען בלי שגיאות בקונסול',
          `יש ${errors.length} שגיאות. הראשונה: ${errors[0].slice(0, 120)} — פתח DevTools ← Console.`,
        );

    for (const width of [375, 768, 1280]) {
      await page.setViewportSize({ width, height: 900 });
      await page.waitForTimeout(200);
      const overflow = await page.evaluate(
        () => document.documentElement.scrollWidth > document.documentElement.clientWidth + 1,
      );
      overflow
        ? add(
            'fail',
            `אין גלילה אופקית ברוחב ${width}px`,
            `משהו רחב מהמסך. חפש רוחב קבוע בפיקסלים, תמונה בלי \`max-width: 100%\`, או טקסט ארוך שלא נשבר.`,
          )
        : add('pass', `אין גלילה אופקית ברוחב ${width}px`);
    }

    // 6. The week's own CORE-tier checks, if the week shipped any.
    if (await exists(path.join(CONFIG_DIR, 'public-checks.mjs'))) {
      const { publicChecks } = await import(pathToFileURL(path.join(CONFIG_DIR, 'public-checks.mjs')).href);
      await page.setViewportSize({ width: 1280, height: 900 });
      await page.goto(`${server.url}/${config.entry}`, { waitUntil: 'networkidle' });

      for (const check of publicChecks) {
        try {
          const ok = await check.run(page, { serverUrl: server.url });
          ok ? add('pass', check.title) : add('fail', check.title, check.expected);
        } catch (err) {
          add('fail', check.title, check.expected || `הבדיקה לא הצליחה לרוץ: ${String(err.message).slice(0, 100)}`);
        }
      }
    }
  } finally {
    await browser.close();
    await server.close();
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Hebrew summary. No stack traces as feedback.
// ─────────────────────────────────────────────────────────────────────────────
const passed = results.filter((r) => r.status === 'pass').length;
const failed = results.filter((r) => r.status === 'fail');
const skipped = results.filter((r) => r.status === 'skip').length;

const icon = { pass: '✅', fail: '❌', skip: '➖' };
const lines = [];

lines.push(`## ${failed.length === 0 ? '✅' : '❌'} בדיקות אוטומטיות — ${LABEL}`);
lines.push('');
lines.push(`**${passed} עברו · ${failed.length} נכשלו${skipped ? ` · ${skipped} לא רלוונטיות` : ''}**`);
lines.push('');
lines.push('| | בדיקה |');
lines.push('|---|---|');
for (const r of results) lines.push(`| ${icon[r.status]} | ${r.title} |`);
lines.push('');

if (failed.length) {
  lines.push('### מה צריך לתקן');
  lines.push('');
  for (const r of failed) {
    lines.push(`**${r.title}**`);
    lines.push(`> ${r.expected}`);
    lines.push('');
  }
}

lines.push('---');
lines.push('');
lines.push(
  'ℹ️ הבדיקות האלה הן **הרצפה, לא הציון**. הן מוכיחות שהדבר רץ. ' +
    'הנקודות מגיעות מהחלקים שמכונה לא יכולה לשפוט — עיצוב, נגישות, איכות הקוד וההיגיון שמאחוריו. ' +
    'ירוק זה תנאי הכרחי, לא מספיק.',
);

const summary = lines.join('\n');
console.log(summary);
if (process.env.GITHUB_STEP_SUMMARY) await appendFile(process.env.GITHUB_STEP_SUMMARY, summary + '\n');

process.exit(failed.length === 0 ? 0 : 1);
