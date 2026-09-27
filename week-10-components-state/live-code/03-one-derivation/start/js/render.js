/*
 * render.js — layer 2: state in, screen out.
 * It never changes state, never adds a listener, never reads the screen to decide.
 */
import { selectOne } from './state.js';

/* A component: book in, element out. The row carries WHO it is, not WHERE it sits. */
export function bookRow(book) {
  const li = document.createElement('li');
  li.dataset.id = book.id;
  li.className = 'flex items-center gap-3 rounded-lg border border-edge bg-card p-3';

  const title = document.createElement('a');
  title.className = 'book-title flex-1 font-semibold text-accent underline underline-offset-4';
  title.href = `book.html?id=${encodeURIComponent(book.id)}`;
  title.textContent = book.title;

  const genre = document.createElement('span');
  genre.className = 'book-genre text-sm text-soft';
  genre.textContent = book.genre;

  const copies = document.createElement('span');
  copies.className = 'book-copies w-8 text-center';
  copies.textContent = book.copies;

  const more = document.createElement('button');
  more.type = 'button';
  more.className = 'add-copy rounded-md border border-edge px-2 py-1 text-sm';
  more.textContent = '+1';
  more.setAttribute('aria-label', `עוד עותק של ${book.title}`);

  const drop = document.createElement('button');
  drop.type = 'button';
  drop.className = 'drop rounded-md border border-edge px-2 py-1 text-sm';
  drop.textContent = 'הסר';
  drop.setAttribute('aria-label', `הסר את ${book.title}`);

  li.append(title, genre, copies, more, drop);
  return li;
}

function renderList(state) {
  const list = document.querySelector('#books');
  if (!list) return;
  list.replaceChildren(...state.books.map(bookRow));
  document.querySelector('#shown').textContent = state.books.length;
  document.querySelector('#none').hidden = state.books.length > 0;
}

/* The second page. The id comes from the address; an id that is not there is an empty
   state with a way back, not an error and not a blank page. */
function renderBook(state) {
  const mount = document.querySelector('#book');
  if (!mount) return;

  const id = new URLSearchParams(location.search).get('id');
  const book = selectOne(state, id);

  const heading = document.createElement('h1');
  heading.className = 'text-2xl font-bold';

  if (book === null) {
    heading.textContent = 'הספר לא נמצא';
    const explain = document.createElement('p');
    explain.className = 'mt-2 text-soft';
    explain.textContent = 'אין בספרייה ספר עם המזהה שבכתובת. אולי הוא הוסר.';
    const back = document.createElement('a');
    back.href = 'index.html';
    back.className = 'mt-2 inline-block text-accent underline underline-offset-4';
    back.textContent = 'חזרה לרשימה';
    mount.replaceChildren(heading, explain, back);
    return;
  }

  heading.textContent = book.title;
  const facts = document.createElement('p');
  facts.className = 'mt-2 text-soft';
  facts.textContent = `${book.genre} · עותקים: ${book.copies}`;
  mount.replaceChildren(heading, facts);
}

/* The undo offer, drawn from state — nothing when there is nothing to undo. */
function renderUndo(state) {
  const bar = document.querySelector('#undo-bar');
  if (!bar) return;
  if (state.undo === null) {
    bar.replaceChildren();
    return;
  }
  const text = document.createElement('span');
  text.className = 'text-soft';
  text.textContent = `"${state.undo.title}" הוסר. `;
  const button = document.createElement('button');
  button.type = 'button';
  button.dataset.action = 'undo';
  button.className = 'rounded-md border border-edge px-2 py-1 text-sm font-semibold';
  button.textContent = 'בטל';
  bar.replaceChildren(text, button);
}

/* The one entry point. Each region returns at once when its mount is not on the page. */
export function render(state) {
  renderList(state);
  renderUndo(state);
  renderBook(state);
}
