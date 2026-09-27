#!/usr/bin/env node
/**
 * pre-class/verify.mjs — week 8: is the assignment folder in place, and are the two project
 * templates where cycles 4 and 5 copy them from?
 *
 *   node <materials>/week-08-javascript/pre-class/verify.mjs      (from the ROOT of your semester repo)
 *
 * Five checks, five ✓. No dependencies, nothing installed, nothing written. Run it as many
 * times as you like. Each ✗ says what is wrong and what to do. Hebrew output; the checks
 * themselves are plain Node.
 *
 * Week 8 writes JavaScript in three typed cycles and then runs the AI loop on a spec. So before
 * the block: Node is there, the folder is a git repo with a remote, `week-08/` holds the starter
 * files (the modules and the bench), `project/templates/` holds FEATURE_SPEC.md and PROMPTS.md
 * (cycle 4 copies the first into specs/, cycle 5 the second into project/PROMPTS.md), and the
 * last commit that holds them is pushed.
 */
import { existsSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import path from 'node:path';

const WEEK = 'week-08';
const STARTER = ['exercises.html', 'js/exercises.js', 'js/review.js', 'js/runner.js', 'predict-he.md', 'review-he.md', 'FEATURE_SPEC.md', 'index.html', 'item.html', 'summary.html', 'vendor/tailwind.js'];
const TEMPLATES = ['project/templates/FEATURE_SPEC.md', 'project/templates/PROMPTS.md'];
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

// 3 · the starter files
{
  const missing = STARTER.filter((f) => !existsSync(path.join(cwd, WEEK, f)));
  if (missing.length) bad(`${WEEK}/`, `חסרים: ${missing.join(', ')}`, `העתק את כל התוכן של week-08-javascript/starter/ מהחומרים לתוך ${WEEK}/ — כולל js/ ו-vendor/.`);
  else ok(`${WEEK}/`, 'הספסל, שלושת קובצי ה-JavaScript, שני הגיליונות, המפרט ושלושת העמודים במקום');
}

// 4 · the two project templates
{
  const missing = TEMPLATES.filter((f) => !existsSync(path.join(cwd, f)));
  if (missing.length) bad('תבניות הפרויקט', `חסרים: ${missing.join(', ')}`, 'העתק את project/templates/ מהחומרים (הבריף של הפרויקט, שבוע 7) לתוך project/templates/ במאגר שלך. מחזור 4 מעתיק ממנה את FEATURE_SPEC.md, ומחזור 5 את PROMPTS.md.');
  else ok('תבניות הפרויקט', 'project/templates/FEATURE_SPEC.md ו-PROMPTS.md במקום');
}

// 5 · the last commit is pushed (and week-08 is in it)
{
  const head = git('rev-parse', 'HEAD');
  if (head.status !== 0) bad('קומיט', 'אין עדיין אף קומיט במאגר', `git add ${WEEK} project && git commit -m "week-08: starter and templates" && git push`);
  else {
    const tracked = git('ls-files', WEEK);
    if (!tracked.stdout.trim()) bad('קומיט', `${WEEK}/ עדיין לא בקומיט`, `git add ${WEEK} project && git commit -m "week-08: starter and templates" && git push`);
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

console.log(`\n  שבוע 8 — האם התיקייה מוכנה, והתבניות במקום?\n`);
for (const r of results) {
  console.log(`  ${r.ok ? '✓' : '✗'} ${r.what}${r.detail ? ' — ' + r.detail : ''}`);
  if (!r.ok) console.log(`      → ${r.fix}`);
}
const failed = results.filter((r) => !r.ok).length;
console.log(failed ? `\n  ${failed} מתוך ${results.length} לא עברו. תקן לפי החצים והרץ שוב.\n` : `\n  ${results.length}/${results.length} — מוכן. נתראה בשיעור.\n`);
process.exit(failed ? 1 : 0);
