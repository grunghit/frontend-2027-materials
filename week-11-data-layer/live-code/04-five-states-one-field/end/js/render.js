/*
 * render.js — layer 2: state in, screen out.
 * It never changes state, never adds a listener, never reads the screen to decide.
 */
import { selectCatalogueView, selectGenres, selectNewSuggestions, selectOne, selectVisible } from './state.js';

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

/* The list, its counter, and the empty state. The samples offer belongs to an EMPTY
   LIBRARY only — never to a search that matched nothing. */
function renderList(state) {
  const list = document.querySelector('#books');
  if (!list) return;
  const shown = selectVisible(state);
  list.replaceChildren(...shown.map(bookRow));
  document.querySelector('#shown').textContent = shown.length;
  const empty = state.books.length === 0;
  document.querySelector('#none').hidden = shown.length > 0;
  document.querySelector('#none-text').textContent = empty
    ? 'הספרייה ריקה. הוסף ספר בטופס, או טען ספרים לדוגמה.'
    : 'שום ספר לא מתאים לחיפוש ולסינון.';
  document.querySelector('#samples').hidden = !empty;
}

/* The genre filter's options, derived from the books. The one exception to "never read
   the screen": a <select> whose children are replaced loses its selection. */
function renderGenres(state) {
  const select = document.querySelector('#genre');
  if (!select) return;
  const kept = select.value;
  const every = document.createElement('option');
  every.value = 'all';
  every.textContent = 'הכול';
  select.replaceChildren(
    every,
    ...selectGenres(state).map((genre) => {
      const option = document.createElement('option');
      option.value = genre;
      option.textContent = genre;
      return option;
    }),
  );
  select.value = kept;
  if (select.value === '') select.value = 'all';
}

/* The second page: the id from the address; an unknown id is an empty state. */
function renderBook(state) {
  const mount = document.querySelector('#book');
  if (!mount) return;
  const id = new URLSearchParams(location.search).get('id');
  const book = selectOne(state, id);
  const heading = document.createElement('h1');
  heading.className = 'text-2xl font-bold';
  if (book === null) {
    heading.textContent = 'הספר לא נמצא';
    const back = document.createElement('a');
    back.href = 'index.html';
    back.className = 'mt-2 inline-block text-accent underline underline-offset-4';
    back.textContent = 'חזרה לרשימה';
    mount.replaceChildren(heading, back);
    return;
  }
  heading.textContent = book.title;
  const facts = document.createElement('p');
  facts.className = 'mt-2 text-soft';
  facts.textContent = `${book.genre} · עותקים: ${book.copies}`;
  mount.replaceChildren(heading, facts);
}

/* A sentence from the storage layer, drawn from state — nothing when there is none. */
function renderNote(state) {
  const note = document.querySelector('#storage-note');
  if (!note) return;
  note.hidden = state.storageNote === null;
  note.textContent = state.storageNote ?? '';
}

/* One suggestion from the catalogue: title and year. A component, like bookRow — that
   the data came over a network changes nothing about how it is drawn. textContent only:
   this string was written by someone you do not know. */
export function suggestionRow(suggestion) {
  const li = document.createElement('li');
  li.dataset.title = suggestion.title;
  li.className = 'flex items-center gap-3 rounded-lg border border-edge bg-card p-3';
  const title = document.createElement('span');
  title.className = 'cat-title flex-1 font-semibold';
  title.textContent = suggestion.title;
  const year = document.createElement('span');
  year.className = 'cat-year text-sm text-soft';
  year.textContent = suggestion.year ?? '—';
  const adopt = document.createElement('button');
  adopt.type = 'button';
  adopt.className = 'adopt rounded-md border border-edge bg-paper px-2 py-1 text-sm font-semibold';
  adopt.textContent = 'הוסף לספרייה';
  adopt.setAttribute('aria-label', `הוסף לספרייה את ${suggestion.title}`);
  li.append(title, year, adopt);
  return li;
}

/* The catalogue panel. The view is computed ONCE, it goes on the panel as data-state, and
   each region is shown or hidden from that one word — not from its own condition. */
function renderCatalogue(state) {
  const panel = document.querySelector('#cat-panel');
  if (!panel) return;
  const view = selectCatalogueView(state);
  panel.dataset.state = view;
  document.querySelector('#cat-idle').hidden = view !== 'idle';
  document.querySelector('#cat-loading').hidden = view !== 'loading';
  document.querySelector('#cat-empty').hidden = view !== 'empty';
  document.querySelector('#cat-error').hidden = view !== 'error';
  document.querySelector('#cat-error-text').textContent = state.search.error ?? '';
  const shown = view === 'results' ? selectNewSuggestions(state) : [];
  document.querySelector('#cat-results').replaceChildren(...shown.map(suggestionRow));
  document.querySelector('#cat-source').hidden = !(view === 'results' && state.search.source === 'local');
}

/* The one entry point. Each region returns at once when its mount is not on the page. */
export function render(state) {
  renderGenres(state);
  renderList(state);
  renderBook(state);
  renderNote(state);
  renderCatalogue(state);
}
