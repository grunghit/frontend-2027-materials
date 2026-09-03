/**
 * warmup.js — ten minutes, no git, no grade.
 *
 * Five tiny functions that touch the DOM. FOUR OF THEM ARE WRONG AND ONE IS ALREADY
 * CORRECT, so "change everything" is not a strategy — you have to know which.
 *
 * Open index.html with Live Server. The referee runs all five and tells you, for each,
 * what it expected and what it got. It does NOT tell you which line is wrong.
 *
 * None of them is a syntax error. Every one of them runs.
 */

/**
 * Build one row.
 *
 * @param {string} text the text to show. It comes from a user, so it may be anything.
 * @returns {HTMLLIElement} an <li> whose visible text is exactly `text`
 */
export function makeRow(text) {
  const li = document.createElement('li');
  li.innerHTML = text;
  return li;
}

/**
 * Fill a list with one row per item, replacing whatever was there before.
 *
 * @param {HTMLUListElement} list
 * @param {string[]} items
 */
export function fillList(list, items) {
  for (const item of items) {
    list.append(makeRow(item));
  }
}

/**
 * Which remove button does this click belong to?
 *
 * The buttons look like `<button class="remove"><span>הסר</span></button>`, so the
 * click usually lands on the span.
 *
 * @param {MouseEvent} event
 * @returns {HTMLButtonElement | null} the button, or null when the click was not on one
 */
export function findRemoveButton(event) {
  if (event.target.classList.contains('remove')) return event.target;
  return null;
}

/**
 * How many rows does this list have?
 *
 * @param {HTMLUListElement} list
 * @returns {number}
 */
export function countRows(list) {
  return list.querySelectorAll(':scope > li').length;
}

/**
 * Mark a row as done, or unmark it. The stylesheet already knows what `.done` looks like.
 *
 * @param {HTMLLIElement} row
 */
export function toggleDone(row) {
  row.style.textDecoration = row.style.textDecoration === 'line-through' ? 'none' : 'line-through';
}
