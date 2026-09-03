/*
 * ============================================================================
 * state.js — LAYER 1 OF 5. The single source of truth.
 *
 * INSTRUCTOR MATERIAL, and also the file students read after grading.
 *
 * THIS FILE IS WEEK 10's, WITH ONE FIELD ADDED AND ONE DERIVATION. Diff it against last
 * week's: `search` is new, `selectSearchView` is new, and nothing else moved.
 *
 * NOTHING ABOUT SAVING APPEARS HERE, AND NOTHING ABOUT THE NETWORK EITHER. The truth
 * does not know where it is written down and it does not know where it came from. What
 * it knows is that a request is IN one of four conditions, and that is a fact about the
 * application rather than about HTTP.
 *
 * THE ONE FIELD IS A NESTED OBJECT, AND THAT IS DELIBERATE. Five loose fields —
 * `searchQuery`, `searching`, `searchResults`, `searchError`, `searchSource` — are five
 * things that have to be changed together and can therefore be changed apart. The bug
 * that produces is the one every application has once: a spinner and an error message
 * on screen at the same time, because `searching` was set and `searchError` was not
 * cleared. One object, replaced whole, cannot do that.
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
 * Seven fields, and the case for each is still that it cannot be computed from the
 * others. `items` is the collection. `query`, `category` and `sort` are what the user
 * typed and chose. `editingId` is which row is open in the form. `storageError` is what
 * the disk said. `search` is new this week, and it is the only one that describes
 * something that is HAPPENING rather than something that IS.
 *
 * WHAT BELONGS IN STATE, WHAT BELONGS ON DISK, AND WHAT BELONGS ON THE WIRE ARE THREE
 * DIFFERENT QUESTIONS, and this object is where all three are visible: seven fields
 * live here, exactly one of them is written to disk, and exactly one of them came off
 * the network.
 */
function initialState() {
  return {
    items: [],
    query: '',
    category: 'all',
    sort: 'title',
    editingId: null,
    storageError: null,

    /*
     * THE REQUEST, AS A FACT ABOUT THE APPLICATION.
     *
     *   query    what was asked. Not the same as `query` above, which filters the
     *            collection you already have — this one is what was sent.
     *   status   'idle' before anybody asked · 'loading' while a request is open ·
     *            'done' when one finished · 'error' when one failed. FOUR VALUES IN
     *            ONE FIELD, and that is the whole design: a field with four values
     *            cannot be in two of them, and two booleans can.
     *   results  what came back. Replaced whole, never appended to.
     *   error    { kind, messageHe } or null. The SENTENCE is stored, not the
     *            exception: `render` may not decide what a failure says, and an
     *            `Error` object is not something you want to put on a screen.
     *   source   'live' or 'local'. The user is entitled to know which catalogue
     *            answered them.
     *
     * WHAT IS NOT HERE IS `empty`. See `selectSearchView` at the bottom of this file.
     *
     * AND NONE OF IT IS SAVED. `storage.js` writes `state.items` and nothing else, so
     * this whole object is invisible to it — which is why that file was not opened this
     * week. A saved "loading" is a page that boots with a spinner it can never clear.
     */
    search: {
      query: '',
      status: 'idle',
      results: [],
      error: null,
      source: 'live',
    },
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
 * THE ONE DOOR, and this week a second subscriber walks through it. In week 9 the
 * only listener was `render`; now `persist` is one too, and it was added by ONE LINE
 * in app.js, without a single handler learning that persistence exists.
 */
export function setState(patch) {
  state = { ...state, ...patch };
  for (const listener of listeners) listener(state);
}

/**
 * Subscribe to changes. Returns an unsubscribe function.
 *
 * A `Set` rather than one slot, which cost nothing last week and is what makes this
 * week one line. Two subscribers, both pure consumers of the same object: one paints
 * it, one writes it down.
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
 * One line, and it is what keeps `editingId` honest: the form is not handed an item
 * to remember, it is handed an ID and looks the item up every time it draws. Edit a
 * row, then press `+1` on it from somewhere else, and the form is already showing the
 * new number — because there is only one copy of it.
 */
export function selectEditing(state) {
  return state.editingId === null ? null : selectOne(state, state.editingId);
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

/**
 * WHICH OF THE FIVE VIEWS THE SEARCH PANEL IS SHOWING.
 *
 * THE MOST IMPORTANT FOUR LINES IN THE WEEK, and they are here rather than in
 * `render.js` for the same reason every other derivation is: it is a fact about the
 * state, not a fact about the screen, and the day a second page wants it there is
 * nothing to copy.
 *
 * Week 6 named four states every UI must have — empty, loading, error, success. Two of
 * them have had nothing to do all semester, because reading an array from memory is
 * instant and reading it from disk cannot fail halfway. A request can do both, and this
 * is where all four finally exist at once:
 *
 *   'idle'      nobody has asked anything yet. NOT the same as empty.
 *   'loading'   a request is open.
 *   'error'     one failed, and there is a sentence to show.
 *   'empty'     one succeeded and matched nothing.
 *   'results'   one succeeded and matched something.
 *
 * `empty` IS DERIVED AND `loading` IS STORED, and the difference is the whole rule:
 * "did anything come back" is a question about `results`, so storing the answer creates
 * a second copy of it that can disagree. "Is a request open" is not derivable from
 * anything — nothing on the screen or in the collection tells you — so it is stored.
 *
 * THE BUG THIS SHAPE MAKES IMPOSSIBLE: a spinner and "nothing found" on screen
 * together. With `isLoading` and `isEmpty` as two booleans it takes one forgotten
 * `isEmpty = false` to produce, and it is the single most common report in an
 * application like this one.
 *
 * @returns {'idle' | 'loading' | 'error' | 'empty' | 'results'}
 */
export function selectSearchView(state) {
  const { status, results } = state.search;
  if (status === 'loading') return 'loading';
  if (status === 'error') return 'error';
  if (status === 'idle') return 'idle';
  return results.length === 0 ? 'empty' : 'results';
}

/**
 * Which suggestions are worth offering: the ones that are not already in the pantry.
 *
 * Derived, so a row disappears from the suggestions the moment it is added, without a
 * single line in the handler that adds it. Compare with the version that removes the
 * clicked row by hand: that one is correct until the item is removed again from the
 * list below, at which point the suggestion does not come back.
 */
export function selectNewSuggestions(state) {
  const have = new Set(state.items.map((item) => item.title));
  return state.search.results.filter((suggestion) => !have.has(suggestion.title));
}
