/*
 * events.js — layer 3: a user action becomes a change of state.
 * wire() is called once, by app.js. Never from render().
 */
import { getState, setState } from './state.js';

let nextId = 100;

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
  nextId += 1;
  return { id: `b${nextId}`, title, copies, genre };
}

export function wire() {
  const form = document.querySelector('#book-form');
  if (form) {
    form.addEventListener('submit', (event) => {
      event.preventDefault();
      const book = readForm();
      if (book === null) return;
      setState({ books: [...getState().books, book], undo: null });
      form.reset();
    });
  }

  /* Both row buttons describe what is now true, by id, in a NEW array. Neither of them
     touches an element: render() is subscribed, and it draws. */
  const list = document.querySelector('#books');
  if (list) {
    list.addEventListener('click', (event) => {
      const row = event.target.closest('li[data-id]');
      if (!row) return;
      const id = row.dataset.id;
      const books = getState().books;

      if (event.target.closest('button.add-copy')) {
        setState({
          books: books.map((book) => (book.id === id ? { ...book, copies: book.copies + 1 } : book)),
        });
        return;
      }

      if (event.target.closest('button.drop')) {
        const gone = books.find((book) => book.id === id);
        setState({ books: books.filter((book) => book.id !== id), undo: { books, title: gone.title } });
      }
    });
  }

  /* Undo puts back the array that was replaced. One assignment, because one object
     holds everything. */
  const undoBar = document.querySelector('#undo-bar');
  if (undoBar) {
    undoBar.addEventListener('click', (event) => {
      if (!event.target.closest('[data-action="undo"]')) return;
      const undo = getState().undo;
      if (undo !== null) setState({ books: undo.books, undo: null });
    });
  }
}
