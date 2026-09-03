/*
 * shared/compiler.js — render REAL compiler output on a page that cannot run a compiler.
 *
 * `tsc` does not run in a browser, and a hand-typed "error TS2322: …" on a slide is
 * exactly the kind of plausible-looking fiction this course spends twelve weeks teaching
 * students to distrust. So every message shown by these demos was produced by running
 * the compiler over the real file in `demos/tsc-cases/`, captured into
 * `demos/tsc-output.json` by `demos/capture-tsc.mjs`, and is loaded from there.
 *
 * `demos/capture-tsc.mjs --check` fails if a case was edited without re-capturing, and
 * tools/test/week-12-demos.test.mjs runs it in that mode. What is on screen is what the
 * compiler said.
 */

let cache = null;

/** The whole capture, loaded once. */
export async function capture() {
  if (cache === null) {
    const res = await fetch('../tsc-output.json');
    if (!res.ok) throw new Error(`could not load tsc-output.json (${res.status})`);
    cache = await res.json();
  }
  return cache;
}

/** One case: `{ source, messages }`. */
export async function caseNamed(name) {
  const all = await capture();
  const found = all.cases[name];
  if (!found) throw new Error(`no captured case named ${name}`);
  return found;
}

/**
 * Draw a source listing with the compiler's diagnostics attached to their real lines.
 *
 * `from`/`to` slice the listing, because a slide has room for eight lines and a case
 * file has thirty. The line NUMBERS stay absolute so they still match the messages.
 */
export function renderSource(mount, entry, { from = 1, to = Infinity } = {}) {
  /*
   * The listing scrolls sideways, so it has to be focusable — a region a mouse can scroll
   * and a keyboard cannot reach is unreadable without a mouse, and axe says so
   * (`scrollable-region-focusable`). `role="group"` plus a label is what turns it from an
   * anonymous focus stop into something a screen reader can announce.
   */
  mount.tabIndex = 0;
  mount.setAttribute('role', 'group');
  mount.setAttribute('aria-label', 'source listing with compiler diagnostics');

  const lines = entry.source.split('\n');
  const byLine = new Map();
  for (const m of entry.messages) {
    if (!byLine.has(m.line)) byLine.set(m.line, []);
    byLine.get(m.line).push(m);
  }

  mount.replaceChildren();
  lines.forEach((text, i) => {
    const n = i + 1;
    if (n < from || n > to) return;

    const row = document.createElement('div');
    row.className = 'src-line' + (byLine.has(n) ? ' src-line--bad' : '');

    const num = document.createElement('span');
    num.className = 'src-num';
    num.textContent = String(n);

    const body = document.createElement('span');
    body.className = 'src-text';
    body.textContent = text === '' ? ' ' : text;

    row.append(num, body);
    mount.append(row);

    for (const m of byLine.get(n) ?? []) {
      const note = document.createElement('div');
      note.className = 'src-msg';
      note.textContent = `${m.code}: ${m.text}`;
      mount.append(note);
    }
  });
}

/** The one-line verdict a slide can point at: how many diagnostics, and where. */
export function verdictFor(entry) {
  if (entry.messages.length === 0) return 'the compiler said nothing at all';
  const where = entry.messages.map((m) => `line ${m.line}`).join(', ');
  const n = entry.messages.length;
  return `${n} ${n === 1 ? 'error' : 'errors'} — ${where}`;
}
