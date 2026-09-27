/*
 * ============================================================================
 * exercises.js — PART ב. Four pure functions.
 *
 * "Pure" means exactly three things, and all three are graded:
 *   · the same input always produces the same output;
 *   · it reads nothing outside its arguments — no DOM, no `new Date()`, no random;
 *   · IT CHANGES NOTHING IT WAS GIVEN. The array you were handed belongs to the
 *     caller and must come back in the order it arrived.
 *
 * These four are deliberately the shape of `selectVisible`, `selectSummary` and
 * friends in `project/starter-repo/js/state.js`. In week 10 you write those for
 * real, against your own data. Today you write them against mine, so that the
 * thing being marked is the JavaScript rather than your topic.
 *
 * Every `// CODE HERE` is a place you write. Delete the marker when you are done
 * with it — the grader checks that none are left.
 *
 * An item looks like this, and `year` may be missing:
 *   { id: 'a1', title: 'Kid A', artist: 'Radiohead', year: 2000, rating: 4 }
 * ============================================================================
 */

/**
 * Items whose title contains `query`, ignoring case and surrounding spaces.
 *
 * An empty query — or one that is only spaces — means "no filter", so every item
 * comes back. An item with a missing title must not crash the search.
 *
 * @param {Array<object>} items
 * @param {string} query
 * @returns {Array<object>} a NEW array; `items` is not touched
 */
export function filterByQuery(items, query) {
  // CODE HERE
  return items;
}

/**
 * A sorted copy of `items`.
 *
 * `key` is one of:
 *   'title'   — alphabetical, and it must be right in Hebrew as well as English
 *   'year'    — oldest first; an item with no year sorts to the END
 *   'rating'  — highest first, and ties are broken by title
 *
 * An unknown key returns the items in the order they arrived.
 *
 * @param {Array<object>} items
 * @param {string} key
 * @returns {Array<object>} a NEW array; `items` keeps its original order
 */
export function sortItems(items, key) {
  // CODE HERE
  return items;
}

/**
 * How many items there are per artist, most first, ties broken alphabetically.
 *
 * @param {Array<object>} items
 * @returns {Array<{label: string, count: number}>}
 */
export function countByArtist(items) {
  // CODE HERE
  return [];
}

/**
 * One object summarising the collection.
 *
 * `average` is the mean rating of the items that HAVE been rated, rounded to one
 * decimal place. An unrated item has a rating of 0 and must not drag the average
 * down. With nothing rated at all, `average` is `null` — not 0, because "nobody
 * has rated anything" and "everything scored zero" are different facts.
 *
 * @param {Array<object>} items
 * @returns {{total: number, rated: number, average: number | null}}
 */
export function summarise(items) {
  // CODE HERE
  return { total: 0, rated: 0, average: null };
}
