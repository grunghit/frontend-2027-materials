#!/usr/bin/env node
/**
 * pre-class/verify.mjs — week 3: is the page from week 2 where this week's work starts?
 *
 *   node <materials>/week-03-css-foundations/pre-class/verify.mjs      (from the ROOT of your semester repo)
 *
 * Four checks, four ✓. No dependencies, nothing installed, nothing written. Run it as many
 * times as you like. Each ✗ says what is wrong and what to do — in the same words the brief
 * uses. Hebrew output; the checks themselves are plain Node.
 *
 * Week 3 styles week 2's page. So before the block: Node is there, the folder is a git repo
 * with a remote, `week-03/index.html`, `about.html` and `styles.css` exist and both pages
 * carry the <link>, and the last commit that holds them is pushed. The five minutes this
 * used to take at the top of the assignment window now happen at home.
 */
import { existsSync, readFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import path from 'node:path';

const WEEK = 'week-03';
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

// 3 · week-03/index.html + about.html + styles.css, and both pages link the stylesheet
{
  const index = path.join(cwd, WEEK, 'index.html');
  const about = path.join(cwd, WEEK, 'about.html');
  const css = path.join(cwd, WEEK, 'styles.css');
  const w2 = path.join(cwd, 'week-02', 'index.html');
  const links = (f) => /<link[^>]+rel=["']stylesheet["'][^>]+href=["']styles\.css["']|<link[^>]+href=["']styles\.css["'][^>]+rel=["']stylesheet["']/i.test(readFileSync(f, 'utf8'));
  if (!existsSync(index)) bad(`${WEEK}/index.html`, 'הקובץ לא נמצא', existsSync(w2) ? `העתק את week-02/index.html, week-02/about.html ו-week-02/images/ לתוך ${WEEK}/.` : `אין גם week-02/index.html — העתק את התוכן של starter/ לתוך ${WEEK}/.`);
  else if (!existsSync(about)) bad(`${WEEK}/about.html`, 'הקובץ לא נמצא', `העתק גם את about.html לתוך ${WEEK}/ — העמוד השני מקבל את אותו גיליון בחינם.`);
  else if (!existsSync(css)) bad(`${WEEK}/styles.css`, 'הקובץ לא נמצא', `צור ${WEEK}/styles.css ליד index.html — ריק, או עם ההערות מ-starter/styles.css.`);
  else if (!links(index) || !links(about)) bad(`${WEEK}/`, `אין שורת <link rel="stylesheet" href="styles.css"> ב-${!links(index) ? 'index.html' : 'about.html'}`, 'שורה אחת ב-head של כל עמוד, אחרי ה-title: <link rel="stylesheet" href="styles.css" />');
  else ok(`${WEEK}/`, 'index.html, about.html ו-styles.css במקום, ושני העמודים מצביעים על הגיליון');
}

// 4 · the last commit is pushed (and week-03 is in it)
{
  const head = git('rev-parse', 'HEAD');
  if (head.status !== 0) bad('קומיט', 'אין עדיין אף קומיט במאגר', `git add ${WEEK} && git commit -m "week-03: start from week 2" && git push`);
  else {
    const tracked = git('ls-files', WEEK);
    if (!tracked.stdout.trim()) bad('קומיט', `${WEEK}/ עדיין לא בקומיט`, `git add ${WEEK} && git commit -m "week-03: start from week 2" && git push`);
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

console.log(`\n  שבוע 3 — האם העמוד שלך מוכן?\n`);
for (const r of results) {
  console.log(`  ${r.ok ? '✓' : '✗'} ${r.what}${r.detail ? ' — ' + r.detail : ''}`);
  if (!r.ok) console.log(`      → ${r.fix}`);
}
const failed = results.filter((r) => !r.ok).length;
console.log(failed ? `\n  ${failed} מתוך ${results.length} לא עברו. תקן לפי החצים והרץ שוב.\n` : `\n  ${results.length}/${results.length} — מוכן. נתראה בשיעור.\n`);
process.exit(failed ? 1 : 0);
