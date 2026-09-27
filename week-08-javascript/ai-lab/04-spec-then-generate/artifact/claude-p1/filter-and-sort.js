// filter-and-sort.js — implements specs/filter-and-sort.md

const $ = (selector) => document.querySelector(selector);

/**
 * Filters the reading list by a search query, then sorts it.
 *
 * @param {Array<{ title: string | null, year: number | null }>} books
 * @param {string} query
 * @param {'none' | 'title' | 'year'} sortKey
 * @returns {Array<{ title: string | null, year: number | null }>} the books to show
 */
export function filterAndSort(books, query, sortKey) {
  const term = query.trim().toLowerCase();

  const visible =
    term === ''
      ? books
      : books.filter((book) => (book.title ?? '').toLowerCase().includes(term));

  if (sortKey === 'title') {
    return visible.sort((a, b) => (a.title ?? '').localeCompare(b.title ?? '', 'he'));
  }
  if (sortKey === 'year') {
    return visible.sort((a, b) => (a.year ?? Infinity) - (b.year ?? Infinity));
  }
  return visible;
}

/**
 * Optional: connects filterAndSort to the toolbar from §3 of the spec.
 * Call it once, with the list and your own render function.
 */
export function wireUp(books, render) {
  const update = () => render(filterAndSort(books, $('#search').value, $('#sort').value));
  $('#search').addEventListener('input', update);
  $('#sort').addEventListener('change', update);
  update();
}
