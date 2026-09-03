/*
 * ============================================================================
 * state.js — LAYER 1 OF 4. The single source of truth.
 *
 * THIS IS WEEK 9's FILE, WITH ONE RENAME AND TWO GAPS.
 *
 * The rename: `seed` is now `hydrate`, because from this week the data it is handed
 * is usually NOT the seed — it is whatever came off disk. One word, and it is the
 * only name in the architecture that changes all semester.
 *
 * The two gaps are two new fields, and NEITHER OF THEM IS ABOUT SAVING. Nothing about
 * storage appears in this file at all, today or ever: the truth does not know where it
 * is written down. If you find yourself importing `./storage.js` here, stop.
 *
 * THE THREE LAWS OF THE ONE-WAY LOOP:
 *   1. ONE TRUTH.     If it is on screen it came from `state`.
 *   2. ONE PAINTER.   Only render(state) writes to the screen.
 *   3. ONE DIRECTION. Handlers change state; the screen follows. Nothing reads the
 *                     screen to find out what is true.
 *
 * And the fourth that follows from them: ANYTHING DERIVABLE IS DERIVED.
 * ============================================================================
 */

/**
 * The starting state.
 *
 * Four fields today, six when you are finished. The case for each is still that it
 * cannot be computed from the others.
 *
 * WHAT BELONGS IN STATE AND WHAT BELONGS IN STORAGE ARE TWO DIFFERENT QUESTIONS, and
 * this object is where the difference becomes visible: six fields will live here, and
 * exactly ONE of them is ever written to disk.
 */
function initialState() {
  return {
    items: [],
    query: '',
    category: 'all',
    sort: 'title',
    // CODE HERE — which row is currently open in the form. One field, and `null`
    //             when the form is adding rather than editing.
    // CODE HERE — the only field in this object that describes the world outside the
    //             tab rather than the user's data: did the last write FAIL, and how.
    //             `null` when everything is fine, which is almost always.
  };
}

let state = initialState();

/** @type {Set<Function>} */
const listeners = new Set();

/** Read the current state. */
export const getState = () => state;

/**
 * Apply a shallow patch and tell everyone who is listening.
 *
 * THE ONE DOOR, and this week a SECOND SUBSCRIBER walks through it. In week 9 the
 * only listener was `render`. Today one more is added, in app.js, by one line — and
 * not a single handler in events.js learns that persistence exists.
 */
export function setState(patch) {
  state = { ...state, ...patch };
  for (const listener of listeners) listener(state);
}

/**
 * Subscribe to changes. Returns an unsubscribe function.
 *
 * A `Set` rather than one slot. It cost nothing last week and it is what makes this
 * week one line: two subscribers, both pure consumers of the same object — one paints
 * it, one writes it down — and neither knows the other exists.
 */
export function subscribe(listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

/**
 * Put a collection in. Called once, by app.js, at boot — with what came off disk if
 * anything did, and with the seed data if not.
 *
 * The copy is not decoration. Whatever is handed in came from either a module-level
 * constant or `JSON.parse`, and in the first case sharing the objects would let a
 * `+1` edit the seed for the rest of the session.
 */
export function hydrate(items) {
  setState({ items: items.map((item) => ({ ...item })) });
}

/* ==========================================================================
   DERIVATIONS. Pure functions: state in, value out.
   ========================================================================== */

/**
 * The collection as it should appear: filtered by the query, then by the shelf, then
 * sorted.
 *
 * Unchanged from week 9, and it is the reason the three view controls are still one
 * line each. Search, filter and sort are ONE derivation.
 */
export function selectVisible(state) {
  const query = state.query.trim();
  return state.items
    .filter((item) => item.title.includes(query))
    .filter((item) => state.category === 'all' || item.category === state.category)
    .sort((a, b) =>
      state.sort === 'number' ? a.number - b.number : a.title.localeCompare(b.title, 'he'),
    );
}

/**
 * The shelf names available in the filter control. Derived, so removing the last item
 * of a shelf removes the option without anybody writing a line.
 */
export function selectCategories(state) {
  return [...new Set(state.items.map((item) => item.category))].sort((a, b) =>
    a.localeCompare(b, 'he'),
  );
}

/** One item by id, or null. `null` is a real answer; `undefined` is a second word for it. */
export function selectOne(state, id) {
  return state.items.find((item) => item.id === id) ?? null;
}

/**
 * The item currently open in the form, or `null` when the form is adding rather than
 * editing.
 *
 * ONE LINE, and it is what keeps the new field honest: the form is not handed an item
 * to remember, it is handed an ID and looks the item up every time. Store the item
 * itself and you have a second copy of it — which is week 9's whole subject, and it
 * goes wrong the first time somebody presses `+1` on the row being edited.
 */
export function selectEditing(state) {
  // CODE HERE
  return null;
}

/** Everything the summary page shows, computed from the collection and nothing else. */
export function selectSummary(state) {
  const byCategory = selectCategories(state).map((category) => ({
    category,
    count: state.items.filter((item) => item.category === category).length,
  }));

  return {
    total: state.items.length,
    extra: state.items.reduce((sum, item) => sum + item.number, 0),
    byCategory,
  };
}
