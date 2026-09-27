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
    storageNote: null, // a sentence from the storage layer, or null
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

/* What came off disk, put in once at boot — a copy of each book. No seed here: an empty
   array is an empty library, and the samples arrive only from the button. */
export function hydrate(books) {
  setState({ books: books.map((book) => ({ ...book })) });
}

/* One book by id, or null. */
export function selectOne(state, id) {
  return state.books.find((book) => book.id === id) ?? null;
}

/* THE derivation: what the list shows. Stored nowhere. */
export function selectVisible(state) {
  const query = state.query.trim();
  return state.books
    .filter((book) => book.title.includes(query))
    .filter((book) => state.genre === 'all' || book.genre === state.genre)
    .sort((a, b) =>
      state.order === 'copies' ? b.copies - a.copies : a.title.localeCompare(b.title, 'he'),
    );
}

/* The genres the filter offers — from the books themselves. */
export function selectGenres(state) {
  return [...new Set(state.books.map((book) => book.genre))].sort((a, b) => a.localeCompare(b, 'he'));
}
