#!/usr/bin/env node
/**
 * pre-class/verify.mjs — week 12: can this machine compile TypeScript, and is the assignment's
 * starting point in place and pushed?
 *
 *   node <materials>/week-12-typescript-mock-surgery/pre-class/verify.mjs      (from the ROOT of your semester repo)
 *
 * Five checks, five ✓. No dependencies, nothing installed, nothing written. Run it as many
 * times as you like. Each ✗ says what is wrong and what to do. Hebrew output; the checks
 * themselves are plain Node.
 *
 * Week 12 runs `npx tsc` from minute 10, and the semester repo has no package.json and no
 * node_modules — so the compiler has to be a global install, found by `npx` offline. The
 * assignment window is ten minutes (mock surgery 2 takes fifty of the block) and it starts
 * with the spec, so `week-12/` must already hold the starter, compiling as it ships, with
 * `js/api.js` still JavaScript.
 */
import { existsSync, readFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import path from 'node:path';

const WEEK = 'week-12';
const STARTER = ['index.html', 'item.html', 'summary.html', 'tsconfig.json', 'specs/ts-migration.md', 'ts/types.ts', 'ts/dom.ts', 'js/api.js', 'js/app.js', 'js/state.js', 'js/render.js', 'js/events.js', 'js/storage.js', 'js/items.js', 'data/catalogue.json', 'vendor/tailwind.js'];
const cwd = process.cwd();
const results = [];
const ok = (what, detail = '') => results.push({ ok: true, what, detail });
const bad = (what, detail, fix) => results.push({ ok: false, what, detail, fix });
const git = (...args) => spawnSync('git', args, { cwd, encoding: 'utf8' });
/* `--offline`: find a tsc that is already installed, never download one. */
const npxTsc = (...args) => spawnSync('npx', ['--offline', 'tsc', ...args], { cwd, encoding: 'utf8', shell: process.platform === 'win32' });

// 1 · Node
{
  const major = Number(process.versions.node.split('.')[0]);
  if (major >= 18) ok('Node', `גרסה ${process.versions.node}`);
  else bad('Node', `גרסה ${process.versions.node} — ישנה מדי`, 'התקן Node 18 ומעלה (מדריך ההתקנה, סעיף 4).');
}

// 2 · a git repo, at its root, with a remote
{
  const inRepo = git('rev-parse', '--show-toplevel');
  if (inRepo.status !== 0) bad('מאגר git', 'התיקייה הנוכחית אינה בתוך מאגר git', 'הרץ את הסקריפט מהשורש של מאגר הסמסטר שלך (frontend-2027-<תעודת הזהות>).');
  else if (path.resolve(inRepo.stdout.trim()) !== path.resolve(cwd)) bad('מאגר git', `אתה ב-${cwd}, והשורש של המאגר הוא ${inRepo.stdout.trim()}`, `cd "${inRepo.stdout.trim()}" ואז הרץ שוב.`);
  else {
    const remote = git('remote', 'get-url', 'origin');
    if (remote.status !== 0) bad('מאגר git', 'למאגר אין remote בשם origin', 'git remote add origin <כתובת המאגר בגיטהאב> (מדריך ההתקנה, סעיף 7).');
    else ok('מאגר git', `origin = ${remote.stdout.trim()}`);
  }
}

// 3 · the compiler, installed once and found offline
{
  const v = npxTsc('--version');
  const m = /Version (\d+)\.(\d+)/.exec(v.stdout ?? '');
  if (v.status !== 0 || !m) bad('TypeScript', 'npx לא מצא את tsc מותקן', 'npm install --global typescript@5.9.3 — פעם אחת. ואם npx מציע להוריד חבילה בשם tsc — לא: זו גרסה ישנה ונטושה, לא המהדר.');
  else if (Number(m[1]) < 5) bad('TypeScript', `נמצא ${v.stdout.trim()} — ישן מדי`, 'npm install --global typescript@5.9.3');
  else ok('TypeScript', `${v.stdout.trim()} — נמצא בלי רשת`);
}

// 4 · the starter, untouched, and compiling as it ships
{
  const missing = STARTER.filter((f) => !existsSync(path.join(cwd, WEEK, f)));
  if (missing.length) bad(`${WEEK}/`, `חסרים: ${missing.join(', ')}`, `העתק את כל התוכן של week-12-typescript-mock-surgery/starter/ מהחומרים לתוך ${WEEK}/ — כולל ts/, js/, specs/, data/ ו-vendor/.`);
  else if (existsSync(path.join(cwd, WEEK, 'ts/api.ts'))) bad(`${WEEK}/`, 'כבר יש ts/api.ts', 'המטלה מתחילה במפרט, לפני כל קוד: מחק את ts/api.ts (או העתק שוב את התיקייה). ההעברה היא אחרי המפרט.');
  else {
    const spec = readFileSync(path.join(cwd, WEEK, 'specs/ts-migration.md'), 'utf8');
    const t = npxTsc('-p', path.join(WEEK, 'tsconfig.json'), '--noEmit');
    if (!/CODE HERE/.test(spec)) bad(`${WEEK}/`, 'specs/ts-migration.md כבר מולא', 'בשמחה — אבל ודא שהקומיט שלו נפרד מהקומיט של ts/: ההיסטוריה היא הראיה שהמפרט נכתב ראשון.');
    else if (t.status !== 0) bad(`${WEEK}/`, `tsc נכשל על קבצי הפתיחה: ${(t.stdout ?? '').split('\n')[0].slice(0, 90)}`, 'קבצי הפתיחה מתקמפלים כמו שהם נשלחו. העתק שוב את ts/ ואת tsconfig.json מהחומרים.');
    else ok(`${WEEK}/`, 'הקבצים במקום, js/api.js עדיין JavaScript, והמהדר עובר על הפתיחה בלי שגיאה');
  }
}

// 5 · the last commit is pushed (and week-12 is in it)
{
  const head = git('rev-parse', 'HEAD');
  if (head.status !== 0) bad('קומיט', 'אין עדיין אף קומיט במאגר', `git add ${WEEK} && git commit -m "week-12: starter, untouched" && git push`);
  else {
    const tracked = git('ls-files', WEEK);
    if (!tracked.stdout.trim()) bad('קומיט', `${WEEK}/ עדיין לא בקומיט`, `git add ${WEEK} && git commit -m "week-12: starter, untouched" && git push`);
    else {
      const upstream = git('rev-parse', '--abbrev-ref', '--symbolic-full-name', '@{u}');
      if (upstream.status !== 0) bad('דחיפה', 'לענף הנוכחי אין ענף מרוחק', 'git push -u origin main (או שם הענף שלך).');
      else {
        const ahead = git('rev-list', '--count', '@{u}..HEAD');
        const n = Number(ahead.stdout.trim());
        if (n > 0) bad('דחיפה', `${n} קומיט(ים) עדיין לא נדחפו`, 'git push');
        else ok('דחיפה', `HEAD ${head.stdout.trim().slice(0, 7)} נדחף ל-${upstream.stdout.trim()}`);
      }
    }
  }
}

console.log(`\n  שבוע 12 — האם המהדר מותקן, ונקודת ההתחלה של ההעברה במקום ודחופה?\n`);
for (const r of results) {
  console.log(`  ${r.ok ? '✓' : '✗'} ${r.what}${r.detail ? ' — ' + r.detail : ''}`);
  if (!r.ok) console.log(`      → ${r.fix}`);
}
const failed = results.filter((r) => !r.ok).length;
console.log(failed ? `\n  ${failed} מתוך ${results.length} לא עברו. תקן לפי החצים והרץ שוב.\n` : `\n  ${results.length}/${results.length} — מוכן. נתראה בשיעור.\n`);
process.exit(failed ? 1 : 0);
