/*
 * app.js — one file, written the way week 9 taught, and it works.
 *
 * Every DOM call here is correct: rows are built with createElement, text goes in with
 * textContent, both row buttons are handled by ONE delegated listener on the <ul>.
 *
 * Before you change anything: remove a book, then add one. The removed book is back.
 * Nothing in this file is an API mistake. The mistake is the shape.
 */
import { BOOKS } from './data.js';

let books = BOOKS.map((book) => ({ ...book }));
let nextId = 100;

const form = document.querySelector('#book-form');
const list = document.querySelector('#books');
const shown = document.querySelector('#shown');
const none = document.querySelector('#none');

function bookRow(book, index) {
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

function render() {
  list.replaceChildren(...books.map(bookRow));
  shown.textContent = books.length;
  none.hidden = books.length > 0;
}

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

form.addEventListener('submit', (event) => {
  event.preventDefault();
  const book = readForm();
  if (book === null) return;
  books.push(book);
  form.reset();
  render();
});

list.addEventListener('click', (event) => {
  const row = event.target.closest('li');
  if (!row) return;

  if (event.target.closest('button.add-copy')) {
    const book = books[Number(row.dataset.index)];
    book.copies += 1;
    row.querySelector('.book-copies').textContent = book.copies;
    return;
  }

  if (event.target.closest('button.drop')) {
    row.remove();
    shown.textContent = list.children.length;
    none.hidden = list.children.length > 0;
  }
});

render();
