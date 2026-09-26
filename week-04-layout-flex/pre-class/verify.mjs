#!/usr/bin/env node
/**
 * pre-class/verify.mjs — week 4: is the machine ready for Tuesday?
 *
 *   node <materials>/week-04-layout-flex/pre-class/verify.mjs      (from the ROOT of your semester repo)
 *
 * Four checks, four ✓. No dependencies, nothing installed, nothing written. Run it as many
 * times as you like. Each ✗ says what is wrong and what to do — in the same words the
 * setup guide uses. Hebrew output; the checks themselves are plain Node.
 *
 * Why this exists: until this week the first five minutes of every assignment window went
 * on "make the folder, copy the starter, open it". Those minutes now happen at home, and
 * this script is how you prove they did.
 */
import { existsSync, readFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import path from 'node:path';

const WEEK = 'week-04';
const cwd = process.cwd();
const results = [];
const ok = (what, detail = '') => results.push({ ok: true, what, detail });
const bad = (what, detail, fix) => results.push({ ok: false, what, detail, fix });
const git = (...args) => spawnSync('git', args, { cwd, encoding: 'utf8' });

// 1 · Node
{
  const major = Number(process.versions.node.split('.')[0]);
  if (major >= 18) ok('Node', `גרסה ${process.versions.node}`);
  else bad('Node', `גרסה ${process.versions.node} — ישנה מדי`, 'התקן Node 18 ומעלה (מדריך ההתקנה, סעיף Node).');
}

// 2 · a git repo, with a remote
{
  const top = git('rev-parse', '--show-toplevel');
  if (top.status !== 0) bad('מאגר git', 'התיקייה הנוכחית אינה בתוך מאגר git', 'הרץ את הסקריפט מהשורש של מאגר הסמסטר שלך (frontend-2027-<תעודת הזהות>).');
  else {
    const root = top.stdout.trim();
    if (path.resolve(root) !== path.resolve(cwd)) bad('מאגר git', `אתה ב-${cwd}, והשורש של המאגר הוא ${root}`, `cd "${root}" ואז הרץ שוב.`);
    else {
      const remote = git('remote', '-v');
      if (!remote.stdout.trim()) bad('מאגר git', 'המאגר קיים אבל אין לו remote', 'git remote add origin <כתובת ה-repo שלך ב-GitHub> — מדריך ההתקנה, סעיף SSH.');
      else ok('מאגר git', `remote: ${remote.stdout.split('\n')[0].split(/\s+/)[1] ?? ''}`);
    }
  }
}

// 3 · week-04/index.html + styles.css, and the html links the stylesheet
{
  const html = path.join(cwd, WEEK, 'index.html');
  const css = path.join(cwd, WEEK, 'styles.css');
  if (!existsSync(html)) bad(`${WEEK}/index.html`, 'הקובץ לא נמצא', `העתק את התוכן של starter/ לתוך ${WEEK}/ — הקובץ צריך להיות ${WEEK}/index.html, לא ${WEEK}/starter/index.html.`);
  else if (!existsSync(css)) bad(`${WEEK}/styles.css`, 'הקובץ לא נמצא', `העתק גם את styles.css מ-starter/ לתוך ${WEEK}/.`);
  else {
    const text = readFileSync(html, 'utf8');
    if (!/<link[^>]+rel="stylesheet"[^>]+href="styles\.css"/.test(text) && !/<link[^>]+href="styles\.css"[^>]+rel="stylesheet"/.test(text))
      bad(`${WEEK}/index.html`, 'ה-HTML לא מקשר ל-styles.css', 'ודא שהעתקת את index.html של תיקיית הפתיחה כמו שהוא — שורת ה-link כבר כתובה בו.');
    else if (!existsSync(path.join(cwd, WEEK, 'images', 'hero.svg'))) bad(`${WEEK}/images/`, 'images/hero.svg חסר', 'העתק גם את תיקיית images/ מ-starter/.');
    else ok(`${WEEK}/`, 'index.html, styles.css ו-images/ במקום, והגליון מקושר');
  }
}

// 4 · the last commit is pushed (and week-04 is in it)
{
  const head = git('rev-parse', 'HEAD');
  if (head.status !== 0) bad('קומיט', 'אין עדיין אף קומיט במאגר', 'git add week-04 && git commit -m "week-04: starter" && git push');
  else {
    const tracked = git('ls-files', WEEK);
    if (!tracked.stdout.trim()) bad('קומיט', `${WEEK}/ עדיין לא בקומיט`, 'git add week-04 && git commit -m "week-04: starter" && git push');
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

console.log(`\n  שבוע 4 — האם המכונה מוכנה?\n`);
for (const r of results) {
  console.log(`  ${r.ok ? '✓' : '✗'} ${r.what}${r.detail ? ' — ' + r.detail : ''}`);
  if (!r.ok) console.log(`      → ${r.fix}`);
}
const failed = results.filter((r) => !r.ok).length;
console.log(failed ? `\n  ${failed} מתוך ${results.length} לא עברו. תקן לפי החצים והרץ שוב.\n` : `\n  ${results.length}/${results.length} — מוכן. נתראה בשיעור.\n`);
process.exit(failed ? 1 : 0);
