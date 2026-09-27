#!/usr/bin/env node
/**
 * pre-class/verify.mjs — week 10: is the refactor's starting point in place, untouched, and pushed?
 *
 *   node <materials>/week-10-components-state/pre-class/verify.mjs      (from the ROOT of your semester repo)
 *
 * Four checks, four ✓. No dependencies, nothing installed, nothing written. Run it as many
 * times as you like. Each ✗ says what is wrong and what to do. Hebrew output; the checks
 * themselves are plain Node.
 *
 * Week 10's assignment window is fifteen minutes (mock surgery 1 takes forty of the block),
 * and it starts with part א.1 — the four sequences, on the starter AS IT SHIPS. So before the
 * block: Node is there, the folder is a git repo with a remote, `week-10/` holds the starter
 * with its monolith still whole, and the commit that holds it is pushed.
 */
import { existsSync, readFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import path from 'node:path';

const WEEK = 'week-10';
const STARTER = ['index.html', 'item.html', 'summary.html', 'observations-he.md', 'js/app.js', 'js/state.js', 'js/render.js', 'js/events.js', 'js/items.js', 'js/summary.js', 'vendor/tailwind.js'];
const cwd = process.cwd();
const results = [];
const ok = (what, detail = '') => results.push({ ok: true, what, detail });
const bad = (what, detail, fix) => results.push({ ok: false, what, detail, fix });
const git = (...args) => spawnSync('git', args, { cwd, encoding: 'utf8' });

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

// 3 · the starter files, with the monolith still whole (part א.1 runs on it)
{
  const missing = STARTER.filter((f) => !existsSync(path.join(cwd, WEEK, f)));
  if (missing.length) bad(`${WEEK}/`, `חסרים: ${missing.join(', ')}`, `העתק את כל התוכן של week-10-components-state/starter/ מהחומרים לתוך ${WEEK}/ — כולל js/ ו-vendor/.`);
  else {
    const app = readFileSync(path.join(cwd, WEEK, 'js/app.js'), 'utf8');
    if (!/addEventListener/.test(app)) bad(`${WEEK}/`, 'js/app.js כבר לא המונוליט', 'חלק א.1 רץ על הקובץ כמו שהוא נשלח: העתק שוב את js/app.js מהחומרים. מפרקים אחרי התצפיות, בכיתה.');
    else ok(`${WEEK}/`, 'שלושת העמודים, js/ עם המונוליט השלם, observations-he.md ו-vendor/tailwind.js במקום');
  }
}

// 4 · the last commit is pushed (and week-10 is in it)
{
  const head = git('rev-parse', 'HEAD');
  if (head.status !== 0) bad('קומיט', 'אין עדיין אף קומיט במאגר', `git add ${WEEK} && git commit -m "week-10: starter, untouched" && git push`);
  else {
    const tracked = git('ls-files', WEEK);
    if (!tracked.stdout.trim()) bad('קומיט', `${WEEK}/ עדיין לא בקומיט`, `git add ${WEEK} && git commit -m "week-10: starter, untouched" && git push`);
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

console.log(`\n  שבוע 10 — האם נקודת ההתחלה של הריפקטור במקום, שלמה ודחופה?\n`);
for (const r of results) {
  console.log(`  ${r.ok ? '✓' : '✗'} ${r.what}${r.detail ? ' — ' + r.detail : ''}`);
  if (!r.ok) console.log(`      → ${r.fix}`);
}
const failed = results.filter((r) => !r.ok).length;
console.log(failed ? `\n  ${failed} מתוך ${results.length} לא עברו. תקן לפי החצים והרץ שוב.\n` : `\n  ${results.length}/${results.length} — מוכן. נתראה בשיעור.\n`);
process.exit(failed ? 1 : 0);
