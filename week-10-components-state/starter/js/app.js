/*
 * ============================================================================
 * app.js — THE FILE YOU ARE REFACTORING.
 *
 * This is a week-9 application and it is written the way week 9 taught. Every DOM
 * call in it is correct: rows are built with `createElement`, text goes in with
 * `textContent`, the remove and increment buttons are handled by ONE delegated
 * listener on the <ul>, the form calls `preventDefault` and converts at the
 * boundary. Nothing here is an API mistake.
 *
 * It also has four faults, and not one of them is visible in the code. They are
 * visible in the APPLICATION, and only if you do two things in the right order:
 *
 *     1. remove an item, then add one
 *     2. type something in the search box, then add an item that does NOT match it
 *     3. type something in the search box so that fewer rows are shown, press +1 on
 *        one of them, then clear the search box
 *     4. sort by quantity, then add anything
 *
 * There is also one thing that is simply missing rather than wrong: the shelf filter
 * has exactly one option, because nothing in this file ever builds the others.
 *
 * Do all four before you write a line. The brief asks you to write down what you saw,
 * and the answer is worth marks whether or not you can yet say why. Number 3 is the
 * one to sit with: the screen tells you the row you pressed went up by one, and it is
 * telling you the truth about the screen and a lie about the pantry.
 *
 * Your job today is NOT to patch these four. It is to change the shape of the file so
 * that all four become impossible. If you find yourself adding an `if` to fix one of
 * them, stop — that is the week-9 answer, and the week-9 answer is what produced them.
 *
 * WHEN YOU ARE FINISHED, THIS FILE IS ABOUT SIX LINES LONG. Everything in it will
 * have moved to js/state.js, js/render.js or js/events.js — each of which ships beside
 * it with its contract already written down.
 * ============================================================================
 */
import { SEED_ITEMS } from './items.js';

/* The collection. */
let items = SEED_ITEMS.map((item) => ({ ...item }));

/* What is on screen right now. Kept beside `items` so the render loop below has
   something short to iterate. */
let visible = items.slice();

let nextId = items.length + 1;

const form = document.querySelector('#item-form');
const titleField = document.querySelector('#field-title');
const numberField = document.querySelector('#field-number');
const categoryField = document.querySelector('#field-category');
const formError = document.querySelector('#form-error');
const queryField = document.querySelector('#query');
const categorySelect = document.querySelector('#category');
const sortSelect = document.querySelector('#sort');
const list = document.querySelector('#list');
const empty = document.querySelector('#empty');
const count = document.querySelector('#count');

/* Build one row. Position is recorded on the row so the handlers can find the item
   it came from. */
function itemRow(item, index) {
  const li = document.createElement('li');
  li.dataset.index = index;
  li.className = 'flex flex-wrap items-center gap-3 rounded-lg border border-line p-4';

  const title = document.createElement('span');
  title.className = 'item-title flex-1 font-semibold';
  title.textContent = item.title;

  const category = document.createElement('span');
  category.className = 'item-category rounded-md bg-panel px-2 py-1 text-sm text-muted';
  category.textContent = item.category;

  const number = document.createElement('span');
  number.className = 'item-number w-10 text-center text-sm text-muted';
  number.textContent = item.number;

  const plus = document.createElement('button');
  plus.type = 'button';
  plus.className =
    'plus rounded-md border border-line px-3 py-1 text-sm focus-visible:outline-2 focus-visible:outline-offset-2';
  plus.append(document.createTextNode('+1'));
  plus.setAttribute('aria-label', `הוסף אחד ל${item.title}`);

  const remove = document.createElement('button');
  remove.type = 'button';
  remove.className =
    'remove rounded-md border border-line px-3 py-1 text-sm hover:border-bad hover:text-bad focus-visible:outline-2 focus-visible:outline-offset-2';
  const removeText = document.createElement('span');
  removeText.textContent = 'הסר';
  remove.append(removeText);
  remove.setAttribute('aria-label', `הסר את ${item.title}`);

  li.append(title, category, number, plus, remove);
  return li;
}

/* Draw the list. */
function render() {
  list.replaceChildren();
  visible.forEach((item, index) => list.append(itemRow(item, index)));
  empty.hidden = visible.length > 0;
  count.textContent = visible.length;
}

/* Read the add form, or say what is wrong with it. */
function readForm() {
  const title = titleField.value.trim();
  const number = Number(numberField.value);
  const category = categoryField.value.trim();

  titleField.setAttribute('aria-invalid', 'false');
  numberField.setAttribute('aria-invalid', 'false');
  categoryField.setAttribute('aria-invalid', 'false');

  if (title.length < 2) return fail(titleField, 'לשם צריכים להיות לפחות שני תווים.');
  if (numberField.value.trim() === '' || !Number.isInteger(number) || number < 0) {
    return fail(numberField, 'הכמות חייבת להיות מספר שלם שאינו שלילי.');
  }
  if (category.length < 2) return fail(categoryField, 'למדף צריכים להיות לפחות שני תווים.');

  formError.textContent = '';
  return { id: `a${nextId}`, title, number, category };
}

function fail(field, message) {
  formError.textContent = message;
  field.setAttribute('aria-invalid', 'true');
  field.focus();
  return null;
}

form.addEventListener('submit', (event) => {
  event.preventDefault();

  const item = readForm();
  if (item === null) return;

  items.push(item);
  visible.push(item);
  nextId += 1;

  form.reset();
  titleField.focus();
  render();
});

/* Search. Narrows what is on screen. */
queryField.addEventListener('input', () => {
  const query = queryField.value.trim();
  visible = items.filter((item) => item.title.includes(query));
  render();
});

/* Filter by shelf. */
categorySelect.addEventListener('change', () => {
  const wanted = categorySelect.value;
  visible = wanted === 'all' ? items.slice() : items.filter((item) => item.category === wanted);
  render();
});

/* Sort. The rows are already on screen, so they are moved rather than rebuilt. */
sortSelect.addEventListener('change', () => {
  const key = sortSelect.value;
  const rows = [...list.children];
  rows.sort((a, b) => {
    if (key === 'number') {
      return (
        Number(a.querySelector('.item-number').textContent) -
        Number(b.querySelector('.item-number').textContent)
      );
    }
    return a
      .querySelector('.item-title')
      .textContent.localeCompare(b.querySelector('.item-title').textContent, 'he');
  });
  list.append(...rows);
});

/* One listener for both row buttons, on the <ul>, which render() empties but never
   replaces. */
list.addEventListener('click', (event) => {
  const row = event.target.closest('li');
  if (!row) return;

  if (event.target.closest('button.plus')) {
    const item = items[Number(row.dataset.index)];
    item.number += 1;
    row.querySelector('.item-number').textContent = item.number;
    return;
  }

  if (event.target.closest('button.remove')) {
    row.remove();
    count.textContent = list.children.length;
    empty.hidden = list.children.length > 0;
  }
});

render();
