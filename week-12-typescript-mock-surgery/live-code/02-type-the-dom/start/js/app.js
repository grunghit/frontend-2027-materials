/*
 * app.js — the wiring. Loads the catalogue and the shelf, draws both, and turns clicks
 * into changes to the shelf.
 */
import { LookupError, loadCatalogue } from './api.js';
import { load, save } from './storage.js';
import { renderCatalogue, renderShelf } from './render.js';

const status = document.querySelector('#status');
const shelfList = document.querySelector('#shelf');
const shelfEmpty = document.querySelector('#shelf-empty');
const catalogueList = document.querySelector('#catalogue');
const search = document.querySelector('#q');

let books = [];
let { entries, skipped } = load();

function lostNote(lost) {
  if (lost === 0) return '';
  return lost === 1 ? ' · שורה אחת לא נקראה' : ` · ${lost} שורות לא נקראו`;
}

function draw() {
  const query = search.value.trim();
  const shown = books.filter((book) => book.title.includes(query));
  renderCatalogue(catalogueList, shown, new Set(entries.map((entry) => entry.id)));
  renderShelf(shelfList, entries, books);
  shelfEmpty.hidden = entries.length > 0;
}

catalogueList.addEventListener('click', (event) => {
  const row = event.target.closest('li[data-id]');
  if (row === null || event.target.dataset.action !== 'add') return;
  const book = books.find((b) => b.id === row.dataset.id);
  const added = new Date().toISOString().slice(0, 10);
  entries = [...entries, { id: book.id, title: book.title, added }];
  save(entries);
  draw();
});

shelfList.addEventListener('click', (event) => {
  const row = event.target.closest('li[data-id]');
  if (row === null || event.target.dataset.action !== 'remove') return;
  entries = entries.filter((entry) => entry.id !== row.dataset.id);
  save(entries);
  draw();
});

search.addEventListener('input', draw);

try {
  const catalogue = await loadCatalogue();
  books = catalogue.books;
  status.textContent = `${books.length} ספרים בקטלוג` + lostNote(catalogue.skipped + skipped);
} catch (error) {
  status.textContent = error instanceof LookupError ? error.message : 'הקטלוג לא נטען.';
}
draw();
