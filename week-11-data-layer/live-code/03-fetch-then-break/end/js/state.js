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
    /* The catalogue search: what was asked, how it went, what came back, and which
       catalogue answered. status: 'idle' | 'done' | 'error' (cycle 4 adds one more). */
    search: { term: '', status: 'idle', results: [], error: null, source: 'live' },
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

/* What came off disk, put in once at boot: load()'s answer, { books, reason }. A copy of
   each book, and the sentence (if any) into state so render can say it. No seed here. */
export function hydrate({ books, reason }) {
  setState({ books: books.map((book) => ({ ...book })), storageNote: reason });
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
