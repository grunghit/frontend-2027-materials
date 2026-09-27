/*
 * ============================================================================
 * events.js — LAYER 3 OF 5. The user acts; this file says what is now true.
 *
 * INSTRUCTOR MATERIAL, and the file students read after grading.
 *
 * READ IT LOOKING FOR SOMETHING THAT IS NOT THERE — and this week there are three
 * things.
 *
 * The first is drawing: no `createElement`, no `append`, no `hidden`, no `remove()`.
 * Unchanged from week 10.
 *
 * The second is the storage half's: THERE IS NO `localStorage` IN THIS FILE, AND NO `JSON`.
 * Five handlers now change the collection — add, edit, +1, remove, and the one added
 * this week that adds an item that came off the network — and not one of them saves
 * anything. THE FIFTH ONE IS THE PROOF: a handler written this week, by somebody who
 * has not looked at storage.js, and its result is on disk. That is what a layer buys.
 *
 * The third is new and it is the shape of the whole week: THERE IS NO `fetch` IN THIS
 * FILE EITHER, AND NO URL. What is here is the ORCHESTRATION — when to ask, when to
 * stop asking, and what is true while the asking is happening. `api.js` knows HTTP;
 * this file knows the user.
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
   THE SEARCH. Three variables, one function, and every hard part of the week.
   ========================================================================== */

/**
 * How long to wait after the last keystroke before asking anybody anything.
 *
 * 300ms is the number the industry settled on because it is roughly the gap between
 * "still typing" and "stopped typing" for a competent typist. Below ~150ms you are
 * still sending a request per character; above ~500ms the box feels broken.
 *
 * WITHOUT THIS LINE, TYPING "פפריקה" IS SEVEN REQUESTS. Six of them are for a prefix
 * nobody wanted an answer to, and all seven arrive.
 */
const DEBOUNCE_MS = 300;

/** The timer for the above. One, module-wide: there is one search box. */
let debounceTimer = null;

/**
 * The controller for the request that is currently open, or `null`.
 *
 * ONE PER SEARCH BOX AND NOT ONE PER REQUEST-EVER: starting a new search aborts the
 * previous one, which is both the fix for the stale-response race AND the reason the
 * network is not carrying six answers nobody is waiting for.
 */
let searchController = null;

/**
 * A number that goes up by one every time a search starts.
 *
 * ── WHY THIS EXISTS WHEN THERE IS ALREADY AN ABORT
 *
 * The abort cancels the NETWORK. This cancels the WRITE. They are not the same thing,
 * and the gap between them is real: `controller.abort()` is synchronous, but the
 * `await` it interrupts resumes on a later microtask, and a response that had ALREADY
 * arrived and resolved before the abort lands still runs its `then` — with the state of
 * a search that no longer exists.
 *
 * So the rule is: the abort is what stops the request, and the token is what decides
 * whether the answer is still wanted. Six characters and it removes a whole class of
 * bug, including the ones from the offline path, which has nothing to abort at all.
 *
 * IT IS ALSO THE ONLY FIX AVAILABLE for anything you cannot cancel — a `setTimeout`
 * you did not keep the handle to, a third-party SDK, a promise from a library that
 * takes no signal. Learn the shape; you will need it where `AbortController` is not
 * offered.
 */
let searchSeq = 0;

/** Replace the whole `search` object. See the note in state.js on why it is one field. */
const patchSearch = (patch) => setState({ search: { ...getState().search, ...patch } });

/**
 * Ask, and say what is true while the asking happens.
 *
 * ── THE FIVE THINGS IN ORDER, AND EVERY ONE OF THEM IS LOAD-BEARING
 *
 *   1. Abort whatever is open. The user has moved on.
 *   2. Take a ticket. Everything after the first `await` checks it before writing.
 *   3. Say "loading" BEFORE the await, not after. The state has to be true during the
 *      wait, and the code after an `await` does not run during the wait — it runs when
 *      the waiting is over.
 *   4. Await, and let `api.js` decide what went wrong.
 *   5. Write the result — ONLY IF THE TICKET IS STILL THE CURRENT ONE.
 *
 * @param {string} query
 * @param {{ offline?: boolean }} [options]
 */
async function runSearch(query, { offline = false } = {}) {
  /* 1. */
  searchController?.abort();

  const controller = new AbortController();
  searchController = controller;

  /* 2. */
  searchSeq += 1;
  const ticket = searchSeq;

  /* 3. `error: null` is not decoration: leaving the previous failure in place gives a
        panel that is loading AND red, which is a screen that means nothing. */
  patchSearch({
    query,
    status: 'loading',
    error: null,
    source: offline ? 'local' : 'live',
  });

  try {
    /* 4. */
    const results = offline
      ? await searchOffline(query)
      : await searchTitles(query, { signal: controller.signal });

    /* 5. STALE. A newer search started while this one was in flight, so this answer is
          right about a question nobody is asking. Drop it — silently, because there is
          nothing to tell the user and nothing has gone wrong. */
    if (ticket !== searchSeq) return;

    patchSearch({ status: 'done', results, error: null });
  } catch (error) {
    /*
     * AN ABORT IS NOT AN ERROR. This is the single most common defect in a search box
     * that has just had `AbortController` added to it: every keystroke cancels the
     * previous request, every cancellation lands here, and the panel goes red once per
     * character. The user sees a flicker of failure while typing a word that works.
     *
     * `return`, not `throw`: the caller of `runSearch` is a timer, and a rejected
     * promise nobody awaits is an unhandled rejection in the console.
     */
    if (error.name === 'AbortError') return;

    if (ticket !== searchSeq) return;

    /*
     * The SENTENCE goes into state, never the exception. `render` is not allowed to
     * decide what a failure says, an `Error` is not something to put on a screen, and
     * `error.message` on anything that is not an `ApiError` is a stack-trace fragment
     * in a language the user does not read.
     *
     * The console still gets the whole thing, because the console is for me.
     */
    console.error('[search]', error);
    patchSearch({
      status: 'error',
      results: [],
      error:
        error instanceof ApiError
          ? { kind: error.kind, messageHe: error.messageHe }
          : { kind: 'shape', messageHe: 'משהו השתבש בחיפוש. נסה שוב.' },
    });
  }
}

/**
 * The user typed. Wait for them to stop, then ask.
 *
 * AN EMPTY BOX IS NOT A SEARCH FOR NOTHING — it is the absence of a search, so it goes
 * back to `idle` immediately, cancels anything in flight, and asks nobody anything. A
 * search box that sends a request for `''` is a request for the whole catalogue, on
 * every backspace to the end of the word.
 */
function scheduleSearch(query) {
  clearTimeout(debounceTimer);

  if (query.trim() === '') {
    searchController?.abort();
    searchSeq += 1;
    patchSearch({ query: '', status: 'idle', results: [], error: null });
    return;
  }

  debounceTimer = setTimeout(() => runSearch(query), DEBOUNCE_MS);
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
      const editing = selectEditing(state);

      if (editing === null) {
        /* CREATE. A new array, and `created` stamped once, here, as an ISO string —
           never as a Date. See render.js on why. */
        const item = { id: newId(), ...fields, created: new Date().toISOString() };
        setState({ items: [...state.items, item] });
      } else {
        /*
         * UPDATE — the letter of CRUD that was missing until today, and the one that
         * makes persistence worth anything. `.map` with a spread: every other item is
         * the object it already was, and the one being edited is a NEW object with
         * the typed fields on top.
         *
         * `id` and `created` come from the spread of the old item and are NOT in
         * `fields`, so neither can be edited by a form that does not offer them.
         */
        setState({
          items: state.items.map((item) =>
            item.id === editing.id ? { ...item, ...fields } : item,
          ),
          editingId: null,
        });
      }

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

      if (event.target.closest('button.edit')) {
        const item = items.find((entry) => entry.id === id);
        if (item === undefined) return;
        fillForm(item);
        setState({ editingId: id });
        document.querySelector('#field-title').focus();
        return;
      }

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
   * CLEAR ALL — the ONE place in this application that asks "are you sure?".
   *
   * Week 10's rule was: prefer undo to a confirmation, and confirm only what cannot be
   * undone. This is the thing that cannot be undone. Everything else on this page is
   * one item; this is all of them, and after the write that follows there is no copy
   * of them left anywhere.
   *
   * NOTE WHAT IT DOES NOT CALL: nothing in storage.js. Clearing is `setState` with an
   * empty array, and `persist` writes `[]` — so the reload after it shows the same
   * empty pantry, with its sentence. (Under the project's contract an absent key is
   * ALSO an empty pantry, so removing the key would look the same today; saving the
   * empty array is still the honest answer, because it says "the user emptied it"
   * rather than "nobody has been here".)
   *
   * `confirm()` is a blocking modal and in a real product you would build your own.
   * What is being taught here is WHERE a confirmation belongs, not how to style one.
   */
  const clearButton = document.querySelector('#clear-all');
  if (clearButton) {
    clearButton.addEventListener('click', () => {
      if (!confirm('לנקות את כל הפריטים? הפעולה הזאת אינה הפיכה.')) return;
      fillForm(null);
      setState({ items: [], editingId: null, query: '', category: 'all' });
    });
  }

  /*
   * The offer inside the empty state: load the demo data.
   *
   * THE ONLY WAY THE SAMPLE ITEMS EVER ARRIVE. A first visit is an empty pantry — the
   * project's rule, and the exam's: a boot that seeds whenever the read comes back
   * empty cannot tell "nothing saved" from "the read failed". So the six samples are a
   * user's choice, one `setState`, and `persist` writes them like any other change.
   * A copy of each, so a `+1` never edits the constant in items.js.
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
     THE SEARCH PANEL. Four listeners, and three of them are one line.
     ======================================================================== */

  /*
   * The box. `input`, not `change`: `change` fires when the field loses focus, which
   * for a search box is never.
   *
   * TWO THINGS HAPPEN PER KEYSTROKE AND THEY HAPPEN AT DIFFERENT SPEEDS. The state is
   * updated NOW, so `render` can echo what was typed without waiting; the REQUEST is
   * scheduled for 300ms from now. Conflating them is what makes a debounced box feel
   * laggy — people debounce the whole handler, including the part that has no cost.
   */
  const apiQuery = document.querySelector('#api-query');
  if (apiQuery) {
    apiQuery.addEventListener('input', () => scheduleSearch(apiQuery.value));
  }

  /*
   * ENTER SKIPS THE WAIT. The panel is inside no <form>, so there is no submit to
   * prevent — a user who has finished typing and pressed Enter has told you they have
   * finished typing, and making them wait another 300ms for a debounce is making them
   * wait for a guess you no longer need to make.
   */
  if (apiQuery) {
    apiQuery.addEventListener('keydown', (event) => {
      if (event.key !== 'Enter') return;
      clearTimeout(debounceTimer);
      if (apiQuery.value.trim() !== '') runSearch(apiQuery.value);
    });
  }

  /* Try the same thing again. Offered for a timeout and for a network failure, and
     NOT for a status — asking a 500 the same question gets the same answer. */
  const retry = document.querySelector('#api-retry');
  if (retry) {
    retry.addEventListener('click', () => runSearch(getState().search.query));
  }

  /*
   * THE OFFLINE PATH, AND IT IS OFFERED RATHER THAN TAKEN.
   *
   * The application could silently fall back to the bundled catalogue the moment the
   * network fails, and it would look better in a demo. It would also be lying: the user
   * asked to search the catalogue, the catalogue was not reachable, and showing them a
   * frozen copy from August without saying so is how somebody ends up trusting a result
   * that is two years old.
   *
   * So the failure says what happened, the button says what is available, and
   * `#api-source` says which one answered. One extra click, and the user knows what
   * they are looking at.
   */
  const offline = document.querySelector('#api-offline');
  if (offline) {
    offline.addEventListener('click', () => runSearch(getState().search.query, { offline: true }));
  }

  /*
   * ONE listener for every suggestion that will ever exist, on the <ul> — which
   * render() empties but never replaces. Week 9's delegation, week 10's rule about
   * where a listener goes, and this week it is what makes a list built from a network
   * response no different from a list built from anything else.
   */
  const suggestions = document.querySelector('#api-results');
  if (suggestions) {
    suggestions.addEventListener('click', (event) => {
      const button = event.target.closest('button.adopt');
      if (!button) return;

      const row = event.target.closest('li[data-title]');
      if (!row) return;

      const state = getState();
      const suggestion = state.search.results.find((entry) => entry.title === row.dataset.title);
      /*
       * FROM STATE, NOT FROM THE SCREEN. The title is read off the row because that is
       * the row's identity, and then the DATA is looked up in `state.search.results` —
       * because week 10's third law does not stop applying just because the data arrived
       * over a network. Scraping `textContent` back out of the row would work today and
       * would break the first time somebody truncates a sentence with CSS.
       */
      if (suggestion === undefined) return;

      /*
       * THE HANDLER THAT PROVES THE WHOLE ARGUMENT. It is five lines, it was written
       * this week, it has never heard of `localStorage` — and what it adds is on disk
       * before the row finishes painting, because `app.js` subscribed `persist` for
       * part א and nothing since has had to know.
       *
       * `number: 1` and `category: 'מהקטלוג'` are this application's fields, invented
       * here; `title`, `note` and `source` came from outside. The item that lands in the
       * collection is in THIS application's shape, always — which is what `api.js`
       * normalising at the boundary bought.
       */
      setState({
        items: [
          ...state.items,
          {
            id: newId(),
            title: suggestion.title,
            number: 1,
            category: 'מהקטלוג',
            created: new Date().toISOString(),
            note: suggestion.note,
            source: suggestion.url,
          },
        ],
      });
    });
  }
}
