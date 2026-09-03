/*
 * ============================================================================
 * state.js — THE SINGLE SOURCE OF TRUTH, and every question you can ask it.
 *
 * This is the file the surgery exam is written against. Three rules, and they are
 * the only three:
 *
 *   1. THE STATE OBJECT IS THE ONLY PLACE ANYTHING IS TRUE. If it is on screen, it
 *      came from here. If it is not here, it is not real.
 *   2. NOTHING OUTSIDE THIS FILE MUTATES IT. `setState` is the one door. Handlers
 *      describe a change; they do not perform one.
 *   3. ANYTHING DERIVABLE IS DERIVED. The `select*` functions are pure: state in,
 *      value out. No DOM, no writes, no `new Date()`.
 *
 * Rule 3 is the one people lose points on, and it fails silently. A `filteredItems`
 * field beside `items` works perfectly in every demo — and goes stale the moment
 * something changes `items` without remembering to recompute it. What gets forgotten
 * is exactly what is on screen.
 *
 * This file is a SKELETON. The plumbing that has to be right is written for you
 * (`setState`, `subscribe`, `commitItems`); the shape of your collection and every
 * derivation is yours.
 * ============================================================================
 */
import { load, save } from './storage.js';

/**
 * The starting state.
 *
 * A function, not an object literal, so every call gets a fresh one — a shared
 * literal lets one page's mutation leak into the next.
 *
 * Fill this in from section 7 of your PROJECT_PLAN.md. Two things that are already
 * right and worth keeping:
 *
 *   · `search.status` is ONE field holding one of four values, not three booleans.
 *     `isLoading` + `hasError` + `isEmpty` allows eight combinations, four of which
 *     are meaningless, and one of those four will happen.
 *   · `search.error` is a SENTENCE for the user, not an error object. The stack trace
 *     goes to the console; "TypeError: Failed to fetch" is not information.
 */
function initialState() {
  return {
    /* Your collection. One array of one kind of thing. */
    items: [],

    /* The list page's own controls. Add or rename as your plan requires. */
    query: '',
    // CODE HERE — the filter field(s) your topic needs, e.g. `category: 'all'`
    sort: '',

    /* The region backed by the network. Leave this shape alone. */
    search: {
      term: '',
      status: 'empty', // 'empty' | 'loading' | 'error' | 'success'
      results: [],
      error: null,
      source: null,
    },
  };
}

let state = initialState();

/** @type {Set<Function>} */
const listeners = new Set();

/** Read the current state. Returns the live object — see rule 2 for why that is safe. */
export const getState = () => state;

/**
 * Apply a shallow patch and tell everyone who is listening.
 *
 * SHALLOW, on purpose. To change something nested you spread it at the call site:
 *
 *   setState({ search: { ...getState().search, status: 'loading' } });
 *
 * More typing than a deep merge, and worth it: the spread is visible where it
 * happens, so nobody has to hold a merge algorithm in their head to know what a
 * handler did.
 */
export function setState(patch) {
  state = { ...state, ...patch };
  for (const listener of listeners) listener(state);
}

/**
 * Subscribe to changes. Returns an unsubscribe function.
 *
 * The whole render layer is ONE subscriber (see app.js). That is what makes
 * "re-render on every change" a property of the wiring rather than something each
 * handler has to remember — and forgetting to re-render is the most common bug in an
 * application written without this shape.
 */
export function subscribe(listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

/** Load the collection from storage into state. Called once, by app.js, at boot. */
export function hydrate() {
  const result = load();
  setState({ items: result.items });
  return { dropped: result.dropped, reason: result.reason };
}

/**
 * Replace the collection and write it through to storage in one step.
 *
 * Every mutation in events.js goes through here, which is why there is no path that
 * changes what is on screen without trying to persist it. The storage result is
 * returned rather than swallowed: a failed write is something the user is told about.
 */
export function commitItems(items) {
  setState({ items });
  return save(items);
}

/* ==========================================================================
   Derivations. Pure functions: state in, value out.

   Every one of these is a function you will be asked to CHANGE in week 13, so
   keep them small and keep them honest. If a `select*` function reads the DOM,
   the exam task "make the filter also match the note field" becomes impossible.
   ========================================================================== */

/**
 * The collection as it should appear: filtered, then sorted.
 *
 * THIS FUNCTION IS THE FEATURE. "Search", "filter" and "sort" are not three
 * behaviours bolted onto a list — they are one derivation, and the list on screen is
 * its output.
 *
 * Two things to get right:
 *   · `.filter` returns a NEW array, so the `.sort` after it is safe. Sorting
 *     `state.items` directly would reorder your stored data every time the user
 *     changes the view.
 *   · Compare strings with `localeCompare(a, b, 'he')`, never with `<`. `<` compares
 *     character codes, which is not alphabetical order in Hebrew or in English.
 */
export function selectVisible(state) {
  // CODE HERE — filter by state.query (and your own filter fields), then sort by state.sort
  return state.items;
}

/**
 * One item by id, or null.
 *
 * Used by the detail page. `null` is a real answer — an id that is not in the
 * collection is an EMPTY state, not an error (see the brief, requirement 9).
 */
export function selectOne(state, id) {
  // CODE HERE
  return null;
}

/**
 * The values available in your filter control, derived from the collection.
 *
 * Derived and not stored, and this is the smallest demonstration of why that
 * matters: remove the last item of a category and the option disappears by itself.
 * A stored list would have needed a line in the remove handler to stay honest, and
 * that is the line nobody writes.
 */
export function selectFilterValues(state) {
  // CODE HERE
  return [];
}

/**
 * Everything the third page shows, computed from the collection and nothing else.
 *
 * The third page has no data of its own and no fetch. It is a second view of the
 * same object, which is the cheapest possible proof that the architecture is
 * earning its keep.
 *
 * Return `null` for an average with nothing to average — `0` is a claim, and
 * "nothing yet" is the truth.
 */
export function selectSummary(state) {
  // CODE HERE
  return { total: state.items.length };
}
