#!/usr/bin/env node
/**
 * pre-class/verify.mjs — week 1: is the machine ready for the first block?
 *
 *   node <materials>/week-01-html-git/pre-class/verify.mjs      (from any folder)
 *
 * Three checks, three ✓. No dependencies, nothing installed, nothing written. Run it as many
 * times as you like. Each ✗ says what is wrong and what to do — in the same words the setup
 * guide uses. Hebrew output; the checks themselves are plain Node.
 *
 * Week 1 has no repository and no page yet — both are built in class (cycle 5). What can be
 * done at home is the installation, and this is how you prove it was: Node, git (installed
 * and configured), and the `code` command that opens VS Code from a terminal.
 */
import { spawnSync } from 'node:child_process';

const results = [];
const ok = (what, detail = '') => results.push({ ok: true, what, detail });
const bad = (what, detail, fix) => results.push({ ok: false, what, detail, fix });
const run = (cmd, args) => spawnSync(cmd, args, { encoding: 'utf8', shell: process.platform === 'win32' });

// 1 · Node
{
  const major = Number(process.versions.node.split('.')[0]);
  if (major >= 18) ok('Node', `גרסה ${process.versions.node}`);
  else bad('Node', `גרסה ${process.versions.node} — ישנה מדי`, 'התקן Node 18 ומעלה (מדריך ההתקנה, סעיף 4).');
}

// 2 · git, installed and configured
{
  const v = run('git', ['--version']);
  if (v.status !== 0 || !v.stdout) bad('git', 'הפקודה git לא נמצאה', 'התקן git (מדריך ההתקנה, סעיף 5). ב-Windows סמן "Git from the command line".');
  else {
    const name = run('git', ['config', '--global', 'user.name']).stdout.trim();
    const email = run('git', ['config', '--global', 'user.email']).stdout.trim();
    if (!name || !email) bad('git', `${v.stdout.trim()} מותקן, אבל אין שם או מייל`, 'git config --global user.name "…" ו-git config --global user.email "…" — סעיף 5, "הגדרות שחייבים לעשות פעם אחת".');
    else ok('git', `${v.stdout.trim()} · ${name} <${email}>`);
  }
}

// 3 · the `code` command
{
  const c = run('code', ['--version']);
  if (c.status !== 0 || !c.stdout) bad('הפקודה code', 'הפקודה code לא נמצאה בטרמינל', 'macOS: פתח את VS Code, Cmd+Shift+P, "Shell Command: Install \'code\' command in PATH". Windows: התקן שוב עם "Add to PATH".');
  else ok('הפקודה code', `VS Code ${c.stdout.split('\n')[0]}`);
}

console.log(`\n  שבוע 1 — האם המכונה מוכנה?\n`);
for (const r of results) {
  console.log(`  ${r.ok ? '✓' : '✗'} ${r.what}${r.detail ? ' — ' + r.detail : ''}`);
  if (!r.ok) console.log(`      → ${r.fix}`);
}
const failed = results.filter((r) => !r.ok).length;
console.log(failed ? `\n  ${failed} מתוך ${results.length} לא עברו. תקן לפי החצים והרץ שוב.\n` : `\n  ${results.length}/${results.length} — מוכן. נתראה בשיעור.\n`);
process.exit(failed ? 1 : 0);
