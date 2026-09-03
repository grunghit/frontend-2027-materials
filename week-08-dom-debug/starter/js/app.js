/**
 * app.js — parts ב, ג and ד.
 *
 * WHAT YOU ARE BUILDING
 *
 *   ב  The list on screen is drawn from the `items` array. Nothing is written into
 *      index.html by hand any more, and the empty state and the counter follow.
 *   ג  The form adds an item to the array; the "הסר" button removes one. Both of
 *      them then redraw. The removal must keep working on a row that did not exist
 *      when the page loaded — which is the whole point of today.
 *   ד  A submit that cannot be honoured says what is wrong, marks the field, and
 *      puts the cursor in it. It never adds a half-item and it never reloads.
 *
 * THE FOUR RULES THIS ASSIGNMENT IS MARKED AGAINST
 *
 *   1. `items` is the truth. If it is not in the array it is not on screen, and if
 *      it is in the array it IS on screen. Never change one without the other.
 *   2. `render()` empties #list and rebuilds it. Do not patch rows in place.
 *   3. ONE listener for all the remove buttons, on a container that render() never
 *      touches. Not one per button.
 *   4. Convert at the boundary. `input.value` is a string; the moment it enters
 *      `items` it is the type it claims to be.
 *
 * Every `CODE HERE` is a place you write. Delete the marker when you are done.
 */
import { SEED_ITEMS } from './items.js';

/** The one source of truth. */
let items = SEED_ITEMS.map((item) => ({ ...item }));

/** Never reuse an id, even for an item that was removed. */
let nextId = items.length + 1;

const form = document.querySelector('#item-form');
const titleField = document.querySelector('#field-title');
const numberField = document.querySelector('#field-number');
const formError = document.querySelector('#form-error');
const list = document.querySelector('#list');
const empty = document.querySelector('#empty');
const count = document.querySelector('#count');

/**
 * Build ONE row and return it. It is not attached to anything yet.
 *
 * The shape the grader and your CI expect:
 *   <li data-id="…">
 *     <span class="item-title">…</span>
 *     <span>…the number…</span>
 *     <button type="button" class="remove"><span>הסר</span></button>
 *   </li>
 *
 * Use `createElement` and `textContent`. Not `innerHTML` — the titles come from a
 * form, and a title someone typed is exactly the string that must never be parsed
 * as HTML.
 *
 * @param {{ id: string, title: string, number: number }} item
 * @returns {HTMLLIElement}
 */
function itemRow(item) {
  // CODE HERE — build and return the <li>
}

/**
 * Draw everything that depends on `items`: the rows, the empty state, the counter.
 *
 * Start by emptying #list. `list.replaceChildren()` is the one line that does it.
 */
function render() {
  // CODE HERE — empty the list, build a row per item, show or hide #empty, set #count
}

/**
 * Decide whether a submit can be honoured.
 *
 * Return the item to add, or `null` after having said what is wrong. Saying what is
 * wrong means three things and all three are marked:
 *   · a sentence in #form-error naming the FIELD and the RULE,
 *   · `aria-invalid="true"` on that field (and "false" on the one that is fine),
 *   · focus moved into it.
 *
 * The rules: a title of at least two characters after trimming, and a number that is
 * a whole number. Remember what `Number('')` is before you write the second one.
 *
 * @returns {{ id: string, title: string, number: number } | null}
 */
function readForm() {
  // CODE HERE — validate, report, and return the new item or null
}

/* ── The events ──────────────────────────────────────────────────────────────
 *
 * Two listeners. Not more.
 *
 *   · `submit` on the form. The FIRST line of the handler is the one that stops the
 *     page reloading; without it everything below runs and is then thrown away.
 *   · `click` on a container OUTSIDE #list's own rows — #list itself is fine, since
 *     render() replaces its children and not the <ul>. Inside, find the button the
 *     click belongs to. `event.target` is often the <span>.
 */

// CODE HERE — the submit listener

// CODE HERE — the delegated click listener

render();
