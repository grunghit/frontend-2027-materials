/*
 * events.js — layer 3: a user action becomes a change of state.
 * wire() is called once, by app.js. Never from render().
 */
import { BOOKS } from './data.js';
import { getState, setState } from './state.js';
import { searchBooks } from './api.js';

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

  // Search Open Library as the user types
  const catQuery = document.querySelector('#cat-q');
  if (catQuery) {
    catQuery.addEventListener('input', async () => {
      try {
        const results = await searchBooks(catQuery.value);
        setState({ suggestions: results, searchError: null });
      } catch (error) {
        setState({ suggestions: [], searchError: 'Something went wrong' });
      }
    });
  }

  /* The samples offer, inside the empty state: a copy of each, one setState. */
  const samples = document.querySelector('#samples');
  if (samples) samples.addEventListener('click', () => setState({ books: BOOKS.map((book) => ({ ...book })) }));
}
