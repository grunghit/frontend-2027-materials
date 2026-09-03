/**
 * warmup.js — five small functions, and four of them are wrong.
 *
 * TEN MINUTES. No git, no submission, no marks.
 *
 * Every one of them is a piece of the architecture the lecture just named, in
 * miniature: a derivation, a component, a reducer over the collection, a patch, and a
 * subscription. None of them is a syntax error and all five run.
 *
 * FOUR ARE WRONG AND ONE IS ALREADY CORRECT. "Change everything" is not a strategy.
 *
 * Read the JSDoc before you read the body. Three of the four wrong ones do exactly what
 * their comment says, apart from one word.
 */

/**
 * The visible slice of a collection: keep the items whose `title` contains `query`,
 * then sort them by `title` in Hebrew alphabetical order.
 *
 * MUST NOT change the array it was given.
 *
 * @param {{ items: Array<{id: string, title: string, n: number}>, query: string }} state
 * @returns {Array<object>} a new array
 */
export function selectVisible(state) {
  state.items.sort((a, b) => a.title.localeCompare(b.title, 'he'));
  return state.items.filter((item) => item.title.includes(state.query));
}

/**
 * Build ONE row and return it, unattached.
 *
 * The row must carry the item's IDENTITY, so that a handler can find the item again
 * after the list has been sorted or filtered.
 *
 * @param {{id: string, title: string, n: number}} item
 * @param {number} index its position in the list being drawn
 * @returns {HTMLLIElement}
 */
export function itemRow(item, index) {
  const li = document.createElement('li');
  li.dataset.id = index;
  const title = document.createElement('span');
  title.className = 'title';
  title.textContent = item.title;
  const n = document.createElement('span');
  n.className = 'n';
  n.textContent = item.n;
  li.append(title, n);
  return li;
}

/**
 * How many items there are in total, and how many of them match the query.
 *
 * Both numbers are DERIVED from what it is given. Neither is remembered anywhere.
 *
 * @param {{ items: Array<object>, query: string }} state
 * @returns {{ total: number, shown: number }}
 */
export function selectCounts(state) {
  return {
    total: state.items.length,
    shown: selectVisible(state).length,
  };
}

/**
 * Return a NEW collection in which the item with this id has one more, and every other
 * item is the object it already was.
 *
 * @param {Array<{id: string, n: number}>} items
 * @param {string} id
 * @returns {Array<object>} a new array
 */
export function bumpOne(items, id) {
  const item = items.find((candidate) => candidate.id === id);
  item.n += 1;
  return items;
}

/**
 * Register a listener and return a function that removes it again.
 *
 * @param {Set<Function>} listeners
 * @param {Function} listener
 * @returns {Function} unsubscribe
 */
export function subscribe(listeners, listener) {
  listeners.add(listener);
  return listeners.delete(listener);
}
