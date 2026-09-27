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
      setState({ books: [...getState().books, book] });
      form.reset();
    });
  }

  /* Moved as they were. Both of these still paint, and cycle 2 is about them. */
  const list = document.querySelector('#books');
  if (list) {
    list.addEventListener('click', (event) => {
      const row = event.target.closest('li');
      if (!row) return;

      if (event.target.closest('button.add-copy')) {
        const book = getState().books[Number(row.dataset.index)];
        book.copies += 1;
        row.querySelector('.book-copies').textContent = book.copies;
        return;
      }

      if (event.target.closest('button.drop')) {
        row.remove();
        document.querySelector('#shown').textContent = list.children.length;
        document.querySelector('#none').hidden = list.children.length > 0;
      }
    });
  }
}
