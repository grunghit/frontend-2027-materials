/*
 * print.js — GIVEN. Not this week's material, and nothing in it is graded.
 *
 * It puts one row on the page for every value app.js prints, so the page shows what the
 * console would, and the checkpoint image can be compared by eye. It uses two things
 * week 9 teaches properly — document.querySelector and textContent — and that is all.
 */
const out = document.querySelector('#out');

/** How a value looks on the page: strings in quotes, arrays with their items, the nothings by name. */
export function show(value) {
  if (typeof value === 'string') return `"${value}"`;
  if (Array.isArray(value)) return `[${value.map(show).join(', ')}]`;
  if (value === null) return 'null';
  if (typeof value === 'object') return JSON.stringify(value);
  return String(value);
}

function row(label, text, kind) {
  const tr = document.createElement('tr');
  const name = document.createElement('th');
  name.scope = 'row';
  name.textContent = label;
  const value = document.createElement('td');
  value.textContent = text;
  if (kind) value.className = kind;
  tr.append(name, value);
  out.append(tr);
}

/** One row: the label, and the value as `show` writes it. */
export function print(label, value) {
  row(label, show(value));
}

/** Runs `fn` and prints what it returned — or the error it threw, without stopping the page. */
export function attempt(label, fn) {
  try {
    row(label, show(fn()));
  } catch (error) {
    row(label, `${error.name}: ${error.message}`, 'threw');
  }
}
