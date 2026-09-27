#!/usr/bin/env node
/**
 * pre-class/verify.mjs — week 9: is the assignment folder in place, the Debug Challenge included?
 *
 *   node <materials>/week-09-dom-debug/pre-class/verify.mjs      (from the ROOT of your semester repo)
 *
 * Four checks, four ✓. No dependencies, nothing installed, nothing written. Run it as many
 * times as you like. Each ✗ says what is wrong and what to do. Hebrew output; the checks
 * themselves are plain Node.
 *
 * Week 9 ends on the Debug Challenge: 35 minutes, alone, from minute 140. So before the block:
 * Node is there, the folder is a git repo with a remote, `week-09/` holds the starter — the
 * project pages, `js/`, `vendor/`, and the broken `debug/` application with its worksheet —
 * and the last commit that holds them is pushed. Nobody spends the challenge copying files.
 */
import { existsSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import path from 'node:path';

const WEEK = 'week-09';
const STARTER = [
  'index.html',
  'item.html',
  'summary.html',
  'js/app.js',
  'js/items.js',
  'js/summary.js',
  'vendor/tailwind.js',
  'debug-he.md',
  'debug/index.html',
  'debug/js/app.js',
  'debug/js/guests.js',
];
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

// 3 · the starter, the Debug Challenge included
{
  const missing = STARTER.filter((f) => !existsSync(path.join(cwd, WEEK, f)));
  if (missing.length) bad(`${WEEK}/`, `חסרים: ${missing.join(', ')}`, `העתק את כל התוכן של week-09-dom-debug/starter/ מהחומרים לתוך ${WEEK}/ — כולל js/, vendor/ ו-debug/.`);
  else ok(`${WEEK}/`, 'שלושת העמודים, js/, vendor/, debug/ ו-debug-he.md במקום');
}

// 4 · the last commit is pushed (and week-09 is in it)
{
  const head = git('rev-parse', 'HEAD');
  if (head.status !== 0) bad('קומיט', 'אין עדיין אף קומיט במאגר', `git add ${WEEK} && git commit -m "week-09: starter" && git push`);
  else {
    const tracked = git('ls-files', WEEK);
    if (!tracked.stdout.trim()) bad('קומיט', `${WEEK}/ עדיין לא בקומיט`, `git add ${WEEK} && git commit -m "week-09: starter" && git push`);
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

console.log(`\n  שבוע 9 — האם התיקייה מוכנה, כולל אתגר הניפוי?\n`);
for (const r of results) {
  console.log(`  ${r.ok ? '✓' : '✗'} ${r.what}${r.detail ? ' — ' + r.detail : ''}`);
  if (!r.ok) console.log(`      → ${r.fix}`);
}
const failed = results.filter((r) => !r.ok).length;
console.log(failed ? `\n  ${failed} מתוך ${results.length} לא עברו. תקן לפי החצים והרץ שוב.\n` : `\n  ${results.length}/${results.length} — מוכן. נתראה בשיעור.\n`);
process.exit(failed ? 1 : 0);
