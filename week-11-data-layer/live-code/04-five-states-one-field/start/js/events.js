/*
 * events.js — layer 3: a user action becomes a change of state.
 * wire() is called once, by app.js. Never from render().
 */
import { BOOKS } from './data.js';
import { getState, setState } from './state.js';
import { searchCatalogue, searchOffline } from './api.js';

/* Unique ACROSS SESSIONS. Week 10's `let nextId = 100` was unique while the tab was
   open, which was as long as the data lived. From this week the data outlives the tab,
   and a counter that starts at 100 again tomorrow collides with yesterday's b101. */
let counter = 0;
const newId = () => `b${Date.now().toString(36)}${(counter += 1)}`;

function readForm() {
  const title = document.querySelector('#f-title').value.trim();
  const copies = Number(document.querySelector('#f-copies').value);
  const genre = document.querySelector('#f-genre').value.trim();
  const message = document.querySelector('#form-msg');
  if (title.length < 2 || genre.length < 2 || !Number.isInteger(copies) || copies < 1) {
    message.textContent = 'שם ומדור של שני תווים לפחות, ומספר עותקים שלם מ-1 ומעלה.';
    return null;
  }
  message.textContent = '';
  return { id: newId(), title, copies, genre };
}

/* Replace the whole search object — one field, changed in one place. */
const patchSearch = (patch) => setState({ search: { ...getState().search, ...patch } });

/* Ask, and say what came back. api.js knows HTTP; this knows the user. An empty box is
   not a search. The SENTENCE goes into state, never the exception. */
async function runSearch(term, { offline = false } = {}) {
  if (term.trim() === '') {
    patchSearch({ term: '', status: 'idle', results: [], error: null });
    return;
  }
  patchSearch({ term, source: offline ? 'local' : 'live' });
  try {
    const results = offline ? await searchOffline(term) : await searchCatalogue(term);
    patchSearch({ status: 'done', results, error: null });
  } catch (error) {
    patchSearch({ status: 'error', results: [], error: error.sentence ?? 'החיפוש נכשל. נסה שוב.' });
  }
}

export function wire() {
  const form = document.querySelector('#book-form');
  if (form) {
    form.addEventListener('submit', (event) => {
      event.preventDefault();
      const book = readForm();
      if (book === null) return;
      setState({ books: [...getState().books, book] });
      form.reset();
    });
  }

  /* Both row buttons describe what is now true, by id, in a NEW array. */
  const list = document.querySelector('#books');
  if (list) {
    list.addEventListener('click', (event) => {
      const row = event.target.closest('li[data-id]');
      if (!row) return;
      const id = row.dataset.id;
      const books = getState().books;
      if (event.target.closest('button.add-copy')) {
        setState({ books: books.map((book) => (book.id === id ? { ...book, copies: book.copies + 1 } : book)) });
        return;
      }
      if (event.target.closest('button.drop')) {
        setState({ books: books.filter((book) => book.id !== id) });
      }
    });
  }

  /* The view controls: one line each. They change what you SEE, never what EXISTS. */
  const query = document.querySelector('#q');
  if (query) query.addEventListener('input', () => setState({ query: query.value }));
  const genre = document.querySelector('#genre');
  if (genre) genre.addEventListener('change', () => setState({ genre: genre.value }));
  const order = document.querySelector('#order');
  if (order) order.addEventListener('change', () => setState({ order: order.value }));

  /* Cycle 1's "you do": rename on the book page — an update by id, in a NEW array.
     No save anywhere: persist is subscribed, and the new name is on disk. */
  const rename = document.querySelector('#rename');
  if (rename) {
    rename.addEventListener('submit', (event) => {
      event.preventDefault();
      const id = new URLSearchParams(location.search).get('id');
      const title = document.querySelector('#new-title').value.trim();
      if (title.length < 2) return;
      setState({ books: getState().books.map((book) => (book.id === id ? { ...book, title } : book)) });
      rename.reset();
    });
  }

  /* The catalogue box: every keystroke asks (cycle 4's "you do" is the fix for that),
     and the offer inside the error region asks the local copy instead. */
  const catQuery = document.querySelector('#cat-q');
  if (catQuery) catQuery.addEventListener('input', () => runSearch(catQuery.value));
  const offline = document.querySelector('#cat-offline');
  if (offline) offline.addEventListener('click', () => runSearch(getState().search.term, { offline: true }));

  /* The samples offer, inside the empty state: a copy of each, one setState. */
  const samples = document.querySelector('#samples');
  if (samples) samples.addEventListener('click', () => setState({ books: BOOKS.map((book) => ({ ...book })) }));
}
