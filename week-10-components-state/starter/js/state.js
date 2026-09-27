/*
 * ============================================================================
 * state.js — LAYER 1 OF 3. The single source of truth, and every question you can
 * ask it.
 *
 * THE THREE LAWS OF THE ONE-WAY LOOP, and they are the whole architecture:
 *
 *   1. ONE TRUTH.    If it is on screen, it came from this object. If it is not in
 *                    this object, it is not real.
 *   2. ONE PAINTER.  Only render(state) writes to the screen. This file never
 *                    touches the DOM — no querySelector, no textContent, nothing.
 *   3. ONE DIRECTION. Handlers change state and the screen follows. Nothing reads
 *                    the screen to find out what is true.
 *
 * Law 3 has a consequence that is the point of the whole week: ANYTHING DERIVABLE IS
 * DERIVED. A `visible` array stored beside `items` works perfectly in every demo and
 * goes stale the moment something changes `items` without remembering to recompute
 * it — and what gets forgotten is exactly what is on screen. You have seen that
 * happen; it is fault 2 in js/app.js.
 *
 * The plumbing that has to be right is written for you. The shape of your state and
 * every derivation are yours.
 * ============================================================================
 */

/**
 * The starting state.
 *
 * A function, not an object literal, so every page load gets a fresh one.
 *
 * Note what is IN it and what is not. `items` is in it: it cannot be computed from
 * anything. `query`, `category` and `sort` are in it: they are what the user chose,
 * and nothing else knows. The filtered list, the count, the shelf names and every
 * number on the summary page are NOT in it, because all of them are functions of
 * these four.
 */
function initialState() {
  return {
    items: [],
    // CODE HERE — the three view controls. What did the user type, choose and pick?
    //             Three fields, all of them strings, all of them with a sensible
    //             starting value.
  };
}

let state = initialState();

/** @type {Set<Function>} */
const listeners = new Set();

/** Read the current state. GIVEN. */
export const getState = () => state;

/**
 * Apply a shallow patch and tell everyone who is listening. GIVEN.
 *
 * This is the ONE DOOR. Nothing outside this file assigns to `state`, which is why
 * "did anybody change the collection without re-rendering?" is a question with a
 * permanent answer of no.
 */
export function setState(patch) {
  state = { ...state, ...patch };
  for (const listener of listeners) listener(state);
}

/**
 * Subscribe to changes. Returns an unsubscribe function. GIVEN.
 *
 * The whole render layer is ONE subscriber — see js/app.js. That is what makes
 * "re-render on every change" a property of the wiring rather than something each
 * handler has to remember, and forgetting to re-render is the most common bug in an
 * application written without this shape.
 */
export function subscribe(listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

/**
 * Put the seed data in. Called once, by js/app.js, at boot.
 *
 * `.map(item => ({ ...item }))` and not the array itself: a module-level array
 * shared between the seed file and the state is one object with two owners.
 */
export function seed(items) {
  setState({ items: items.map((item) => ({ ...item })) });
}

/* ==========================================================================
   DERIVATIONS. Pure functions: state in, value out. No DOM. No writing.

   Every one of these is a function you could be asked to CHANGE under time
   pressure — "make the search also match the shelf name" is a one-line edit if
   it lives here and a hunt if it does not.
   ========================================================================== */

/**
 * The collection as it should appear: filtered by the query, then by the shelf,
 * then sorted.
 *
 * THIS FUNCTION IS THE FEATURE. Search, filter and sort are not three behaviours
 * bolted onto a list — they are one derivation, and the list on screen is its output.
 *
 * Two things to get right:
 *   · `.filter` returns a NEW array, so the `.sort` after it is safe. Sorting
 *     `state.items` directly reorders your stored data every time somebody changes
 *     the view — which is fault 4 in js/app.js, in its honest form.
 *   · Compare strings with `localeCompare(a, b, 'he')`, never with `<`. `<` compares
 *     character codes, which is not alphabetical order in Hebrew or in English.
 */
export function selectVisible(state) {
  // CODE HERE
  return state.items;
}

/**
 * The shelf names available in the filter control, derived from the collection.
 *
 * Sorted, with no duplicates. This is the smallest demonstration in the assignment
 * of why derived beats stored: remove the last item of a shelf and the option
 * disappears by itself. A stored list would have needed a line in the remove handler
 * to stay honest, and that is the line nobody writes.
 */
export function selectCategories(state) {
  // CODE HERE
  return [];
}

/**
 * One item by id, or null. Used by the detail page (part ג).
 *
 * `null` is a real answer. An id that is not in the collection is an EMPTY STATE
 * with a way back, not an error and not a blank page.
 */
export function selectOne(state, id) {
  // CODE HERE
  return null;
}

/**
 * Everything the summary page shows (part ג), computed from the collection and
 * nothing else.
 *
 * Return the total number of items, your second measure, and one row per shelf with
 * its count. The summary page has no data of its own and no script of its own — it
 * is a second view of the same object.
 */
export function selectSummary(state) {
  // CODE HERE
  return { total: state.items.length, extra: 0, byCategory: [] };
}
