/*
 * state.js — layer 1: the truth, and the one door into it.
 * It never touches the page: no element, no query, nothing about how anything looks.
 */
function initialState() {
  return {
    books: [],
    undo: null, // the array a removal replaced, kept whole (cycle 2's "you do")
  };
}

let state = initialState();
const listeners = new Set();

export const getState = () => state;

/* The one door. Two lines, in this order: the new state first, then everyone who is
   listening is told — so every listener is handed the state that is now true. */
export function setState(patch) {
  state = { ...state, ...patch };
  for (const listener of listeners) listener(state);
}

export function subscribe(listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

/* A copy, not the imported array: the seed file and the state must not be one object
   with two owners. */
export function seed(books) {
  setState({ books: books.map((book) => ({ ...book })) });
}

/* One book by id, or null. `find` says undefined; one word for "absent" is enough. */
export function selectOne(state, id) {
  return state.books.find((book) => book.id === id) ?? null;
}
