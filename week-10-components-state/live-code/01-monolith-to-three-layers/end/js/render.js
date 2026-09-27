/*
 * render.js — layer 2: state in, screen out.
 * It never changes state, never adds a listener, never reads the screen to decide.
 */

/* Moved from app.js as it was — including data-index. Cycle 2 is about that line. */
export function bookRow(book, index) {
  const li = document.createElement('li');
  li.dataset.index = index;
  li.className = 'flex items-center gap-3 rounded-lg border border-edge bg-card p-3';

  const title = document.createElement('span');
  title.className = 'book-title flex-1 font-semibold';
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

/* The one entry point. Each region returns at once when its mount is not on the page. */
export function render(state) {
  renderList(state);
}
