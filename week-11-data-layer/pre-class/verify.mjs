#!/usr/bin/env node
/**
 * pre-class/verify.mjs — week 11: is the assignment's starting point in place and pushed?
 *
 *   node <materials>/week-11-data-layer/pre-class/verify.mjs      (from the ROOT of your semester repo)
 *
 * Five checks, five ✓. No dependencies, nothing installed, nothing written. Run it as many
 * times as you like. Each ✗ says what is wrong and what to do. Hebrew output; the checks
 * themselves are plain Node.
 *
 * Week 11's assignment window is half an hour (145–175) and it starts with part א — the
 * storage layer, on the starter AS IT SHIPS. So before the block: Node is there, the folder
 * is a git repo with a remote, `week-11/` holds the starter with `js/storage.js` and
 * `js/api.js` still skeletons and `data/catalogue.json` readable, and it is pushed.
 */
import { existsSync, readFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import path from 'node:path';

const WEEK = 'week-11';
const STARTER = ['index.html', 'item.html', 'summary.html', 'js/app.js', 'js/state.js', 'js/render.js', 'js/events.js', 'js/items.js', 'js/storage.js', 'js/api.js', 'data/catalogue.json', 'vendor/tailwind.js'];
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

// 3 · the starter files, with the two layers still skeletons (part א starts on them in class)
{
  const missing = STARTER.filter((f) => !existsSync(path.join(cwd, WEEK, f)));
  if (missing.length) bad(`${WEEK}/`, `חסרים: ${missing.join(', ')}`, `העתק את כל התוכן של week-11-data-layer/starter/ מהחומרים לתוך ${WEEK}/ — כולל js/, data/ ו-vendor/.`);
  else {
    const storage = readFileSync(path.join(cwd, WEEK, 'js/storage.js'), 'utf8');
    if (!/pantry:v1/.test(storage)) bad(`${WEEK}/`, 'js/storage.js אינו השלד שנשלח (אין בו pantry:v1)', 'העתק שוב את js/storage.js מהחומרים. את השכבה כותבים בכיתה, בחלק א — אחרי מחזורים 1 ו-2.');
    else ok(`${WEEK}/`, 'שלושת העמודים, js/ עם שני השלדים, data/catalogue.json ו-vendor/tailwind.js במקום');
  }
}

// 4 · the recorded catalogue is JSON (it is the offline path, and the checks replay it)
{
  const file = path.join(cwd, WEEK, 'data/catalogue.json');
  if (!existsSync(file)) bad('data/catalogue.json', 'הקובץ חסר', `העתק את data/ מהחומרים לתוך ${WEEK}/.`);
  else {
    try {
      const parsed = JSON.parse(readFileSync(file, 'utf8'));
      if (parsed === null || typeof parsed !== 'object') throw new Error('not an object');
      ok('data/catalogue.json', 'JSON תקין — התשובה המוקלטת של הקטלוג');
    } catch {
      bad('data/catalogue.json', 'הקובץ אינו JSON תקין', 'העתק אותו שוב מהחומרים — אל תערוך אותו ביד: הוא תשובה מוקלטת.');
    }
  }
}

// 5 · the last commit is pushed (and week-11 is in it)
{
  const head = git('rev-parse', 'HEAD');
  if (head.status !== 0) bad('קומיט', 'אין עדיין אף קומיט במאגר', `git add ${WEEK} && git commit -m "week-11: starter, untouched" && git push`);
  else {
    const tracked = git('ls-files', WEEK);
    if (!tracked.stdout.trim()) bad('קומיט', `${WEEK}/ עדיין לא בקומיט`, `git add ${WEEK} && git commit -m "week-11: starter, untouched" && git push`);
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

console.log(`\n  שבוע 11 — האם נקודת ההתחלה של שכבת הנתונים במקום ודחופה?\n`);
for (const r of results) {
  console.log(`  ${r.ok ? '✓' : '✗'} ${r.what}${r.detail ? ' — ' + r.detail : ''}`);
  if (!r.ok) console.log(`      → ${r.fix}`);
}
const failed = results.filter((r) => !r.ok).length;
console.log(failed ? `\n  ${failed} מתוך ${results.length} לא עברו. תקן לפי החצים והרץ שוב.\n` : `\n  ${results.length}/${results.length} — מוכן. נתראה בשיעור.\n`);
process.exit(failed ? 1 : 0);
