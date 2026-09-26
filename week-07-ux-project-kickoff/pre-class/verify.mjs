#!/usr/bin/env node
/**
 * pre-class/verify.mjs — week 7: is the assignment folder in place, and is a topic on the table?
 *
 *   node <materials>/week-07-ux-project-kickoff/pre-class/verify.mjs      (from the ROOT of your semester repo)
 *
 * Five checks, five ✓. No dependencies, nothing installed, nothing written. Run it as many
 * times as you like. Each ✗ says what is wrong and what to do. Hebrew output; the checks
 * themselves are plain Node.
 *
 * Week 7 audits a page, rebuilds one region of it and starts the project. So before the
 * block: Node is there, the folder is a git repo with a remote, `week-07/` holds the five
 * starter files, PROJECT_PLAN.md's topic row names at least one candidate topic (the
 * decision is made in class; arriving with none costs the AI cycle), and the last commit
 * that holds them is pushed.
 */
import { existsSync, readFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import path from 'node:path';

const WEEK = 'week-07';
const STARTER = ['bad-page.html', 'redesign.html', 'audit-he.md', 'PROJECT_PLAN.md', 'vendor/tailwind.js'];
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

// 3 · the five starter files
{
  const missing = STARTER.filter((f) => !existsSync(path.join(cwd, WEEK, f)));
  if (missing.length) bad(`${WEEK}/`, `חסרים: ${missing.join(', ')}`, `העתק את כל התוכן של week-07-ux-project-kickoff/starter/ מהחומרים לתוך ${WEEK}/ — כולל vendor/ ו-images/.`);
  else ok(`${WEEK}/`, 'bad-page.html, redesign.html, audit-he.md, PROJECT_PLAN.md ו-vendor/tailwind.js במקום');
}

// 4 · at least one candidate topic in PROJECT_PLAN.md
{
  const plan = path.join(cwd, WEEK, 'PROJECT_PLAN.md');
  if (!existsSync(plan)) bad('נושא מועמד', 'אין PROJECT_PLAN.md', `ראה בדיקה 3.`);
  else {
    const row = readFileSync(plan, 'utf8').split('\n').find((l) => /\*\*נושא/.test(l)) ?? '';
    const cell = (row.split('|')[2] ?? '').replace(/<!--[\s\S]*?-->/g, '').trim();
    if (!cell) bad('נושא מועמד', 'שורת "נושא מהמאגר / נושא עצמאי" בטבלה שבראש PROJECT_PLAN.md ריקה', 'כתוב בה נושא אחד או שניים מ-project-topics-he.md (מספר ושם). ההחלטה נסגרת בכיתה — אבל מגיעים עם מועמד.');
    else ok('נושא מועמד', cell.slice(0, 60));
  }
}

// 5 · the last commit is pushed (and week-07 is in it)
{
  const head = git('rev-parse', 'HEAD');
  if (head.status !== 0) bad('קומיט', 'אין עדיין אף קומיט במאגר', `git add ${WEEK} && git commit -m "week-07: starter and candidate topic" && git push`);
  else {
    const tracked = git('ls-files', WEEK);
    if (!tracked.stdout.trim()) bad('קומיט', `${WEEK}/ עדיין לא בקומיט`, `git add ${WEEK} && git commit -m "week-07: starter and candidate topic" && git push`);
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

console.log(`\n  שבוע 7 — האם התיקייה מוכנה, ויש נושא על השולחן?\n`);
for (const r of results) {
  console.log(`  ${r.ok ? '✓' : '✗'} ${r.what}${r.detail ? ' — ' + r.detail : ''}`);
  if (!r.ok) console.log(`      → ${r.fix}`);
}
const failed = results.filter((r) => !r.ok).length;
console.log(failed ? `\n  ${failed} מתוך ${results.length} לא עברו. תקן לפי החצים והרץ שוב.\n` : `\n  ${results.length}/${results.length} — מוכן. נתראה בשיעור.\n`);
process.exit(failed ? 1 : 0);
