#!/usr/bin/env node
/**
 * pre-class/verify.mjs — week 2: is the page from week 1 where this week's work starts?
 *
 *   node <materials>/week-02-html-forms-a11y/pre-class/verify.mjs      (from the ROOT of your semester repo)
 *
 * Four checks, four ✓. No dependencies, nothing installed, nothing written. Run it as many
 * times as you like. Each ✗ says what is wrong and what to do — in the same words the brief
 * uses. Hebrew output; the checks themselves are plain Node.
 *
 * Week 2 grows week 1's page. So before the block: Node is there, `npx html-validate@9`
 * answers, `week-02/index.html` and `week-02/about.html` exist (copied from week-01/), and
 * the last commit that holds them is pushed. The five minutes this used to take at the top
 * of the assignment window now happen at home.
 */
import { existsSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import path from 'node:path';

const WEEK = 'week-02';
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

// 2 · the validator the course pins answers
{
  const r = spawnSync('npx', ['html-validate@9', '--version'], { cwd, encoding: 'utf8', shell: process.platform === 'win32', timeout: 120000 });
  const v = (r.stdout || '').trim().split('\n').pop();
  if (r.status !== 0 || !/(^|-)9\./.test(v || '')) bad('הוולידטור', 'npx html-validate@9 לא ענה, או ענה בגרסה אחרת', 'ודא שיש רשת ו-Node; הפקודה מורידה את הגרסה בפעם הראשונה. אם נתקע — הרץ אותה פעם אחת ביד ובדוק את הפלט.');
  else ok('הוולידטור', `html-validate ${v.replace(/^html-validate-/, '')}`);
}

// 3 · week-02/index.html + about.html exist (copied from week-01/)
{
  const inRepo = git('rev-parse', '--show-toplevel');
  if (inRepo.status !== 0) bad('מאגר git', 'התיקייה הנוכחית אינה בתוך מאגר git', 'הרץ את הסקריפט מהשורש של מאגר הסמסטר שלך (frontend-2027-<תעודת הזהות>).');
  else if (path.resolve(inRepo.stdout.trim()) !== path.resolve(cwd)) bad('מאגר git', `אתה ב-${cwd}, והשורש של המאגר הוא ${inRepo.stdout.trim()}`, `cd "${inRepo.stdout.trim()}" ואז הרץ שוב.`);
  else {
    const index = path.join(cwd, WEEK, 'index.html');
    const about = path.join(cwd, WEEK, 'about.html');
    const w1 = path.join(cwd, 'week-01', 'index.html');
    if (!existsSync(index)) bad(`${WEEK}/index.html`, 'הקובץ לא נמצא', existsSync(w1) ? `העתק את week-01/index.html, week-01/about.html ו-week-01/images/ לתוך ${WEEK}/.` : `אין גם week-01/index.html — העתק את התוכן של starter/ לתוך ${WEEK}/ והפוך את הטקסט לשלך.`);
    else if (!existsSync(about)) bad(`${WEEK}/about.html`, 'הקובץ לא נמצא', `העתק גם את about.html לתוך ${WEEK}/ — העמוד השני מקבל השבוע שלוש שורות.`);
    else ok(`${WEEK}/`, 'index.html ו-about.html במקום');
  }
}

// 4 · the last commit is pushed (and week-02 is in it)
{
  const head = git('rev-parse', 'HEAD');
  if (head.status !== 0) bad('קומיט', 'אין עדיין אף קומיט במאגר', `git add ${WEEK} && git commit -m "week-02: start from week 1" && git push`);
  else {
    const tracked = git('ls-files', WEEK);
    if (!tracked.stdout.trim()) bad('קומיט', `${WEEK}/ עדיין לא בקומיט`, `git add ${WEEK} && git commit -m "week-02: start from week 1" && git push`);
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

console.log(`\n  שבוע 2 — האם העמוד שלך מוכן?\n`);
for (const r of results) {
  console.log(`  ${r.ok ? '✓' : '✗'} ${r.what}${r.detail ? ' — ' + r.detail : ''}`);
  if (!r.ok) console.log(`      → ${r.fix}`);
}
const failed = results.filter((r) => !r.ok).length;
console.log(failed ? `\n  ${failed} מתוך ${results.length} לא עברו. תקן לפי החצים והרץ שוב.\n` : `\n  ${results.length}/${results.length} — מוכן. נתראה בשיעור.\n`);
process.exit(failed ? 1 : 0);
