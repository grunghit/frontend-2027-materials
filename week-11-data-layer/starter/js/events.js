/*
 * ============================================================================
 * events.js — LAYER 3 OF 5. The user acts; this file says what is now true.
 *
 * THE STARTER. What is marked CODE HERE is yours; everything else is given.
 *
 * READ IT LOOKING FOR SOMETHING THAT IS NOT THERE — and this week there are three
 * things.
 *
 * The first is drawing: no `createElement`, no `append`, no `hidden`, no `remove()`.
 * Unchanged from week 10.
 *
 * The second is the storage half's: THERE IS NO `localStorage` IN THIS FILE, AND NO `JSON`.
 * Handlers change the collection — add, +1, remove, and the two you write: edit (part
 * ב) and the one that adopts an item that came off the network (part ה) — and not one of
 * them saves anything. THE LAST ONE IS THE PROOF: it never mentions `storage.js`, and
 * what it adds is on disk after a reload, because `app.js` subscribed `persist` once.
 *
 * The third is new and it is the shape of the whole week: THERE MUST BE NO `fetch` IN
 * THIS FILE EITHER, AND NO URL. What belongs here is the ORCHESTRATION — when to ask,
 * when to stop asking, and what is true while the asking is happening. `api.js` knows
 * HTTP; this file knows the user.
 *
 * ── THE THREE FACTS ABOUT AN AWAIT THAT THIS FILE IS BUILT AROUND
 *
 *   1. THE WORLD MOVES WHILE YOU WAIT. Between the `await` and the line after it, the
 *      user typed four more letters, clicked something and possibly navigated. Nothing
 *      you read before the await is still guaranteed true after it.
 *   2. RESPONSES DO NOT ARRIVE IN THE ORDER THEY WERE ASKED FOR. Two requests, and the
 *      slow one is the OLD one — so the last answer to arrive is the wrong answer.
 *   3. AN ABORT ARRIVES AS A REJECTION. Which means the naive `catch` treats your own
 *      cancellation as a failure, and paints an error panel once per keystroke.
 *
 * ── THE FORM IS THE ONE PLACE THIS FILE TOUCHES ELEMENTS, AND IT IS DELIBERATE
 *
 * `readForm` reads the fields, `fillForm` writes them, and `fail` marks one. All
 * three are the same documented exception, which week 10 already carried: THE FORM'S
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
import { getState, selectEditing, setState } from './state.js';
import { SEED_ITEMS } from './items.js';
import { ApiError, searchOffline, searchTitles } from './api.js';

/**
 * Never reuse an id, even for an item that was removed — and never collide with one
 * that came off disk.
 *
 * `Date.now()` in base 36 plus a counter. It has to be unique across SESSIONS now,
 * which a plain counter starting at 100 is not: week 10's `a101` was gone when the
 * tab closed, and this week it is still there tomorrow morning waiting to be
 * duplicated by the first item you add.
 *
 * `crypto.randomUUID()` is the real answer in production and it is one line; this is
 * shorter to read on a slide and short enough to type into a `data-id`.
 */
let counter = 0;
const newId = () => `i${Date.now().toString(36)}${(counter += 1)}`;

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

/* ==========================================================================
   CODE HERE — THE SEARCH. Three variables, one function, and every hard part of
   the week is in that function.
   ========================================================================== */

/*
 * CODE HERE — the three module-level variables, and be able to say what each is for.
 *
 *   a debounce timer     so that typing a six-letter word is ONE request and not six.
 *                        300ms is the number the industry settled on: below ~150ms you
 *                        are still sending one per character, above ~500ms the box
 *                        feels broken.
 *
 *   an AbortController   ONE per search box, not one per request-ever. Starting a new
 *                        search aborts the previous one, which is both the fix for the
 *                        stale-response race AND the reason the network is not carrying
 *                        five answers nobody is waiting for.
 *
 *   a sequence number    up by one on every search. Everything after the first `await`
 *                        checks it before writing anything.
 *
 * ── "WHY BOTH AN ABORT AND A NUMBER?"
 *
 * The abort cancels the NETWORK. The number cancels the WRITE. They are not the same
 * thing, and the gap between them is real: `abort()` is synchronous, but the `await` it
 * interrupts resumes on a later microtask, and a response that had ALREADY arrived and
 * resolved before the abort landed still runs its continuation — with the state of a
 * search that no longer exists.
 *
 * The number is also THE ONLY FIX AVAILABLE for anything you cannot cancel: a
 * `setTimeout` whose handle you did not keep, a third-party SDK, a promise from a
 * library that takes no signal. Learn the shape.
 */

/**
 * CODE HERE — ask, and say what is true while the asking happens.
 *
 * ── THE FIVE STEPS IN ORDER, AND EVERY ONE OF THEM IS LOAD-BEARING
 *
 *   1. Abort whatever is open. The user has moved on.
 *   2. Take a ticket from the sequence number.
 *   3. Say "loading" — BEFORE the `await`, not after. The state has to be true DURING
 *      the wait, and the code after an `await` does not run during the wait. It runs
 *      when the waiting is over.
 *      Clear the previous error at the same time: a panel that is loading AND red is a
 *      screen that means nothing.
 *   4. `await`, and let `api.js` decide what went wrong.
 *   5. Write the result — ONLY IF YOUR TICKET IS STILL THE CURRENT NUMBER.
 *
 * ── THE TWO THINGS IN THE `catch`, IN THIS ORDER
 *
 *   · AN ABORT IS NOT AN ERROR. `error.name === 'AbortError'` means YOU cancelled this,
 *     one keystroke ago. `return`, and touch nothing. This is the single most common
 *     defect in a search box that has just had `AbortController` added to it: the panel
 *     goes red once per character while the user types a word that works.
 *     `return`, and not `throw`: the caller here is a timer, and a rejected promise
 *     nobody awaits is an unhandled rejection in the console.
 *   · Then the ticket check again, and then the SENTENCE into state — never the
 *     exception. `render` is not allowed to decide what a failure says, and
 *     `error.message` on anything that is not an `ApiError` is a stack-trace fragment in
 *     a language the user does not read. Log the whole thing to the console; the console
 *     is for you.
 *
 * @param {string} query
 * @param {{ offline?: boolean }} [options] `offline: true` asks the bundled catalogue
 */
async function runSearch(query, { offline = false } = {}) {
  // CODE HERE
}

/**
 * CODE HERE — the user typed. Wait for them to stop, then ask.
 *
 * AN EMPTY BOX IS NOT A SEARCH FOR NOTHING — it is the ABSENCE of a search. Go back to
 * `idle` immediately, cancel anything in flight, and ask nobody anything. A search box
 * that sends a request for the empty string sends a request for the whole catalogue, on
 * every backspace to the end of the word.
 */
function scheduleSearch(query) {
  // CODE HERE
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

      /* CREATE. A new array, and `created` stamped once, here, as an ISO string —
         never as a Date. See render.js on why. */
      const item = { id: newId(), ...fields, created: new Date().toISOString() };
      setState({ items: [...state.items, item] });

      /* CODE HERE — ONE FORM, TWO JOBS (part ב). When a row is open for editing
         (`selectEditing(state)` is not null) this submit is an UPDATE and not a
         CREATE, and the two differ in exactly two fields: an update keeps the item's
         `id` and its `created`, and replaces the rest.

         `.map` with a spread — every other item is the object it already was — and
         then leave edit mode (`editingId: null`). Do NOT mutate the item you found:
         `found.title = ...` works on screen and is the habit that breaks everything
         downstream of it. Cycle 1's "you do" typed the same update on another page. */

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

      /* CODE HERE — the edit branch (part ב). `button.edit` is already in every row
         (render.js draws it). Put the item's values INTO the form (`fillForm` above),
         record which row is being edited (`editingId`), and move the cursor into the
         first field. It changes nothing about the item itself — editing has not
         happened yet, only the offer to edit. */

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
   * CODE HERE — CLEAR ALL (`#clear-all`, the challenge part), and the ONE place in
   * this application that asks "are you sure?".
   *
   * Week 10's rule was: prefer undo to a confirmation, and confirm only what CANNOT be
   * undone. This is the thing that cannot be undone. `confirm()` returns a boolean and
   * blocks until the user answers; what is being taught is WHERE a confirmation
   * belongs, not how to style one.
   *
   * Clearing is one `setState` with an empty array, and `persist` writes it. Nothing
   * in this file calls storage.js — the reload after clearing must show the same empty
   * pantry, with its sentence.
   */

  /*
   * The offer inside the empty state: load the demo data. GIVEN.
   *
   * THE ONLY WAY THE SAMPLE ITEMS EVER ARRIVE. A first visit is an empty pantry — the
   * project's rule, and the exam's: a boot that seeds whenever the read comes back
   * empty cannot tell "nothing saved" from "the read failed". So the six samples are a
   * user's choice, one `setState`, and once your `persist` is subscribed it writes
   * them like any other change.
   *
   * It lives inside `#empty`, which `render` hides and shows but never replaces, so
   * this listener survives every redraw. That is the week-10 rule still earning its
   * keep: a listener goes on something the painter does not throw away.
   */
  const reset = document.querySelector('#reset-demo');
  if (reset) {
    reset.addEventListener('click', () => {
      setState({ items: SEED_ITEMS.map((item) => ({ ...item })) });
    });
  }

  /* ========================================================================
     CODE HERE — THE SEARCH PANEL. Five listeners, and four of them are one line.
     ======================================================================== */

  /*
   * CODE HERE — `#api-query`, on `input`.
   *
   * `input` and not `change`: `change` fires when the field loses focus, which for a
   * search box is never.
   *
   * TWO THINGS HAPPEN PER KEYSTROKE AND THEY HAPPEN AT DIFFERENT SPEEDS. The state can
   * be updated NOW; the REQUEST is scheduled for 300ms from now. Debouncing the whole
   * handler, including the part that costs nothing, is what makes a debounced box feel
   * laggy.
   */

  /*
   * CODE HERE — `#api-query`, on `keydown`: ENTER SKIPS THE WAIT.
   *
   * The panel is inside no `<form>`, so there is no submit to prevent. A user who has
   * pressed Enter has told you they have finished typing, and making them wait another
   * 300ms is making them wait for a guess you no longer have to make.
   */

  /*
   * CODE HERE — `#api-retry`: ask the same question again.
   */

  /*
   * CODE HERE — `#api-offline`: ask the BUNDLED catalogue instead.
   *
   * THE OFFLINE PATH IS OFFERED, NOT TAKEN. The application could fall back silently
   * the moment the network fails, and it would look better in a demo. It would also be
   * lying: the user asked to search the catalogue, the catalogue was not reachable, and
   * showing them a frozen copy without saying so is how somebody ends up trusting a
   * result that is two years old. The failure says what happened, the button says what
   * is available, and `#api-source` says which one answered.
   */

  /*
   * CODE HERE — ONE listener on `#api-results` for every suggestion that will ever
   * exist. Delegation, on an element render() empties but never replaces — week 9's
   * rule and week 10's rule, and neither of them changes because the data arrived over a
   * network.
   *
   * Read the row's identity off `dataset.title`, then look the DATA up in
   * `state.search.results`. FROM STATE, NOT FROM THE SCREEN: scraping `textContent`
   * back out of the row works today and breaks the first time somebody truncates a
   * sentence with CSS.
   *
   * Then add an item to the collection in YOUR application's shape — your `number`,
   * your `category`, your `id` — carrying whatever the catalogue gave you that is worth
   * keeping. And then look at what you have just written: it is five lines, it has
   * never heard of `localStorage`, and after a reload the item is still there.
   */
}
