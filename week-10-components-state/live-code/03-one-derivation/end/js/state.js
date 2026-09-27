/*
 * state.js — layer 1: the truth, and the one door into it.
 * It never touches the page: no element, no query, nothing about how anything looks.
 */
function initialState() {
  return {
    books: [],
    query: '', // what the user typed
    genre: 'all', // what the user chose
    order: 'title', // what the user picked
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

/* THE derivation: what the list shows. A function of state, stored nowhere — so there is
   nothing to keep in step, and nothing that can go stale. */
export function selectVisible(state) {
  const query = state.query.trim();
  return state.books
    .filter((book) => book.title.includes(query))
    .filter((book) => state.genre === 'all' || book.genre === state.genre)
    .sort((a, b) =>
      state.order === 'copies' ? b.copies - a.copies : a.title.localeCompare(b.title, 'he'),
    );
}

/* The genres the filter offers — from the books themselves, no duplicates, sorted.
   Remove the last book of a genre and its option disappears; nobody writes that line. */
export function selectGenres(state) {
  return [...new Set(state.books.map((book) => book.genre))].sort((a, b) => a.localeCompare(b, 'he'));
}
