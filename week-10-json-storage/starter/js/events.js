/*
 * ============================================================================
 * events.js — LAYER 3 OF 4. The user acts; this file says what is now true.
 *
 * READ IT LOOKING FOR SOMETHING THAT IS NOT THERE — and today there are two things.
 *
 * The first is drawing: no `createElement`, no `append`, no `hidden`, no `remove()`.
 * Unchanged from week 9.
 *
 * The second is new and it is the point of the week. WHEN YOU HAVE FINISHED, THERE IS
 * STILL NO `localStorage` IN THIS FILE AND NO `JSON`. Four handlers will change the
 * collection — add, edit, +1, remove — and not one of them will save anything. They
 * cannot forget to, because they were never told: app.js subscribes the storage layer
 * to the same door `render` is subscribed to, once.
 *
 * COMPARE WITH THE VERSION EVERYBODY WRITES FIRST, in which every handler ends with a
 * call to `save()`. It works. It also means the day somebody adds a fifth handler
 * there is a fifth chance to forget — and the bug is invisible until a reload, which
 * is not something you do while you are testing the thing you just wrote. A handler
 * here that calls anything in storage.js loses points, and it is the same point week
 * 9 made about handlers that draw.
 *
 * ── THE FORM IS THE ONE PLACE THIS FILE TOUCHES ELEMENTS, AND IT IS DELIBERATE
 *
 * `readForm` reads the fields, `fillForm` writes them, and `fail` marks one. All
 * three are the same documented exception, which week 9 already carried: THE FORM'S
 * FIELDS ARE NOT DRAWN FROM STATE. They cannot be — `render` runs on every keystroke
 * in the search box, and a field whose value is reassigned while somebody is typing
 * in it is a field that fights the user.
 *
 * So the form is owned by this layer, and what `render` draws is only the form's
 * MODE: the button label, the cancel button, and the mark on the row being edited.
 * The dividing line is worth saying out loud, because it is the one students get
 * wrong in their projects: DATA IS DRAWN FROM STATE; A CONTROL'S OWN VALUE IS NOT.
 * ============================================================================
 */
import { getState, setState } from './state.js';
// CODE HERE — `#reset-demo` needs one function from './storage.js'

/**
 * Never reuse an id, even for an item that was removed — and never collide with one
 * that came off disk.
 *
 * `Date.now()` in base 36 plus a counter. It has to be unique across SESSIONS now,
 * which a plain counter starting at 100 is not: last week's `a101` was gone when the
 * tab closed, and this week it is still there tomorrow morning waiting to be
 * duplicated by the first item you add.
 *
 * `crypto.randomUUID()` is the real answer in production and it is one line; this is
 * shorter to read on a slide and short enough to type into a `data-id`.
 */
let counter = 0;
const newId = () => `i${Date.now().toString(36)}${(counter += 1)}`;

/* WEEK 9's VERSION OF THIS WAS `let nextId = 100`, AND IT IS NOW WRONG. It was
   unique for as long as the tab was open, which was as long as the data lived.
   From today the data outlives the tab: tomorrow morning the counter starts at 100
   again and the first item you add collides with `a101`, which is still on disk. Two
   rows with the same id, and every handler edits the first one. */

/**
 * Read the add/edit form, or say what is wrong with it.
 *
 * Returns the FIELDS the user typed, without an id and without a created date — the
 * caller decides whether this is a new item or a replacement for an old one, and
 * those two answers differ in exactly those two fields.
 *
 * @returns {{ title: string, number: number, category: string } | null}
 */
function readForm() {
  const titleField = document.querySelector('#field-title');
  const numberField = document.querySelector('#field-number');
  const categoryField = document.querySelector('#field-category');

  const title = titleField.value.trim();
  /* Converted at the boundary. Everything downstream is a number and nothing
     downstream has to remember that — including `JSON.stringify`, which would
     otherwise write `"number": "3"` and hand a string back tomorrow. */
  const number = Number(numberField.value);
  const category = categoryField.value.trim();

  for (const field of [titleField, numberField, categoryField]) {
    field.setAttribute('aria-invalid', 'false');
  }

  if (title.length < 2) return fail(titleField, 'לשם צריכים להיות לפחות שני תווים.');

  /* `Number('')` is 0, not NaN — so an empty field passes any test phrased as "is it
     a number". The emptiness is checked first, on the string. */
  if (numberField.value.trim() === '' || !Number.isInteger(number) || number < 0) {
    return fail(numberField, 'הכמות חייבת להיות מספר שלם שאינו שלילי.');
  }

  if (category.length < 2) return fail(categoryField, 'למדף צריכים להיות לפחות שני תווים.');

  document.querySelector('#form-error').textContent = '';
  return { title, number, category };
}

/**
 * Put an item's values into the form, or empty it. The inverse of `readForm`, and the
 * exception described in the header.
 */
function fillForm(item) {
  document.querySelector('#field-title').value = item === null ? '' : item.title;
  document.querySelector('#field-number').value = item === null ? '' : item.number;
  document.querySelector('#field-category').value = item === null ? '' : item.category;
  document.querySelector('#form-error').textContent = '';
  for (const selector of ['#field-title', '#field-number', '#field-category']) {
    document.querySelector(selector).setAttribute('aria-invalid', 'false');
  }
}

/**
 * Report a failed field: a sentence that names the rule, a mark on the field, and the
 * cursor moved into it.
 *
 * @returns {null} so the caller can `return fail(...)`.
 */
function fail(field, message) {
  document.querySelector('#form-error').textContent = message;
  field.setAttribute('aria-invalid', 'true');
  field.focus();
  return null;
}

/** Leave edit mode without changing anything. */
function stopEditing() {
  fillForm(null);
  setState({ editingId: null });
}

/**
 * Register every listener. Called ONCE, by app.js, at boot — never from render().
 *
 * Every listener is on something render() empties but never replaces, so none of them
 * dies when the screen is redrawn.
 */
export function wire() {
  const form = document.querySelector('#item-form');
  if (form) {
    form.addEventListener('submit', (event) => {
      /* Without it the browser serialises the form into the URL and reloads. Which,
         as of this week, is survivable — the collection comes back off disk. That is
         not a reason to leave it out; it is a reason it is now HARDER to notice. */
      event.preventDefault();

      const fields = readForm();
      if (fields === null) return;

      const state = getState();

      /* CREATE. A new array, and `created` stamped once, here, as an ISO STRING and
         never as a `Date` — a `Date` does not survive the round trip through storage,
         and the crash arrives tomorrow, inside render. See js/items.js. */
      const item = { id: newId(), ...fields, created: new Date().toISOString() };
      setState({ items: [...state.items, item] });

      /* CODE HERE — ONE FORM, TWO JOBS. When a row is open for editing this submit is
         an UPDATE and not a CREATE, and the two differ in exactly two fields: an
         update keeps the item's `id` and its `created`, and replaces the rest.

         `.map` with a spread — every other item is the object it already was — and
         then leave edit mode. Do NOT mutate the item you found: `found.title = ...`
         works on screen and is the habit that breaks everything downstream of it. */

      fillForm(null);
      document.querySelector('#field-title').focus();
    });
  }

  const cancel = document.querySelector('#form-cancel');
  if (cancel) cancel.addEventListener('click', stopEditing);

  const queryField = document.querySelector('#query');
  if (queryField) {
    queryField.addEventListener('input', () => setState({ query: queryField.value }));
  }

  const categorySelect = document.querySelector('#category');
  if (categorySelect) {
    categorySelect.addEventListener('change', () => setState({ category: categorySelect.value }));
  }

  const sortSelect = document.querySelector('#sort');
  if (sortSelect) {
    /* Note what it does NOT do: it does not sort anything, and it does not save. */
    sortSelect.addEventListener('change', () => setState({ sort: sortSelect.value }));
  }

  /* ONE listener for every row button that will ever exist, on the <ul> — which
     render() empties but never replaces. `closest` rather than a check against
     `event.target`, because the click lands on the <span> inside the button most of
     the time. */
  const list = document.querySelector('#list');
  if (list) {
    list.addEventListener('click', (event) => {
      const row = event.target.closest('li[data-id]');
      if (!row) return;
      const id = row.dataset.id;
      const items = getState().items;

      if (event.target.closest('button.plus')) {
        setState({
          items: items.map((item) =>
            item.id === id ? { ...item, number: item.number + 1 } : item,
          ),
        });
        return;
      }

      /* CODE HERE — the edit branch. Put the item's values INTO the form (there is a
         helper above for that), record which row is being edited, and move the cursor
         into the first field. It changes nothing about the item itself — editing has
         not happened yet, only the offer to edit. */

      if (event.target.closest('button.remove')) {
        setState({
          items: items.filter((item) => item.id !== id),
          /* Removing the row that is open in the form leaves `editingId` pointing at
             nothing. `selectEditing` would return `null` and the form would quietly
             go back to adding, which is right — but only by accident, and one line
             here says it on purpose. */
          editingId: getState().editingId === id ? null : getState().editingId,
        });
      }
    });
  }

  /*
   * CODE HERE — CLEAR ALL, and the ONE place in this application that asks
   * "are you sure?".
   *
   * Week 9's rule was: prefer undo to a confirmation, and confirm only what CANNOT be
   * undone. This is the thing that cannot be undone. Everything else on this page is
   * one item; this is all of them, and after the write that follows there is no copy
   * of them left anywhere.
   *
   * `confirm()` returns a boolean and blocks until the user answers. What is being
   * taught here is WHERE a confirmation belongs, not how to style one.
   *
   * ONE TRAP, and it is this week's best bug: DO NOT DELETE THE KEY. Clearing the
   * user's data means SAVING AN EMPTY COLLECTION — an absent key means "this browser
   * has never been here", and the next boot will helpfully put the demo items back.
   * Forty real items gone, six fake ones on screen, and it passes every manual test,
   * because nobody reloads immediately after clearing.
   */

  /*
   * CODE HERE — the offer inside the empty state: bring the demo data back.
   *
   * THE ONLY PLACE WHERE DELETING THE KEY IS THE RIGHT THING, because this control
   * means exactly "pretend I have never been here". Delete it, then reload the page,
   * so that the same code path that runs for a genuinely new visitor runs for this
   * one.
   *
   * `#reset-demo` lives inside `#empty`, which render() hides and shows but never
   * replaces — so a listener on it survives every redraw. That is week 9's rule still
   * earning its keep.
   */
}
