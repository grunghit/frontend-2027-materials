/*
 * render.js — draws the two lists. It reads nothing but its arguments.
 */

const PAGES_PER_HOUR = 40;

function readingTime(pages) {
  return `כ-${Math.ceil(pages / PAGES_PER_HOUR)} שעות קריאה`;
}

export function renderCatalogue(list, books, onShelf) {
  list.replaceChildren();
  const sorted = [...books].sort((a, b) => a.title.localeCompare(b.title, 'he'));
  for (const book of sorted) {
    const row = document.createElement('li');
    row.dataset.id = book.id;
    row.className = 'flex flex-wrap items-center gap-3 rounded-lg border border-edge bg-card p-3';

    const title = document.createElement('span');
    title.className = 'font-semibold';
    title.textContent = book.title;

    const meta = document.createElement('span');
    meta.className = 'text-sm text-soft';
    meta.textContent = `${book.author} · ${book.year ?? 'שנה לא ידועה'} · ${readingTime(book.pages)}`;

    const add = document.createElement('button');
    add.type = 'button';
    add.dataset.action = 'add';
    add.className = 'ms-auto rounded-md bg-accent px-3 py-1 text-sm font-semibold text-accent-ink disabled:opacity-60';
    add.disabled = onShelf.has(book.id);
    add.textContent = onShelf.has(book.id) ? 'כבר במדף' : '+ למדף';

    row.append(title, meta, add);
    list.append(row);
  }
}

export function renderShelf(list, entries, books) {
  list.replaceChildren();
  for (const entry of entries) {
    const book = books.find((b) => b.id === entry.id);
    const row = document.createElement('li');
    row.dataset.id = entry.id;
    row.className = 'flex flex-wrap items-center gap-3 rounded-lg border border-edge bg-card p-3';

    const title = document.createElement('span');
    title.className = 'font-semibold';
    title.textContent = entry.title;

    const meta = document.createElement('span');
    meta.className = 'text-sm text-soft';
    meta.textContent = book === undefined
      ? shelfNote(entry, book)
      : `${shelfNote(entry, book)} · ${readingTime(book.pages)}`;

    const remove = document.createElement('button');
    remove.type = 'button';
    remove.dataset.action = 'remove';
    remove.className = 'ms-auto rounded-md border border-edge px-3 py-1 text-sm';
    remove.textContent = 'הסר';

    row.append(title, meta, remove);
    list.append(row);
  }
}

function shelfNote(entry, book) {
  if (book !== undefined) {
    if (entry.added !== '') {
      return `נשמר ב-${entry.added}`;
    } else {
      return 'נשמר';
    }
  } else {
    return 'הספר כבר לא בקטלוג';
  }
}
