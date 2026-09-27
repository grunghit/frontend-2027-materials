// filter-and-sort.js — implements specs/filter-and-sort.md
// A pure function in its own module: it reads `books` and returns a NEW array on every
// path, including the empty query. No DOM, nothing else exported.

const COMPARE = {
  title: (a, b) => (a.title ?? '').localeCompare(b.title ?? '', 'he'),
  year: (a, b) => (a.year ?? Infinity) - (b.year ?? Infinity),
};

/**
 * @param {Array<{ title: string | null, year: number | null }>} books
 * @param {string} query
 * @param {'none' | 'title' | 'year'} sortKey
 * @returns {Array<{ title: string | null, year: number | null }>} a new array
 */
export function filterAndSort(books, query, sortKey) {
  const term = query.trim().toLowerCase();

  const visible =
    term === ''
      ? [...books]
      : books.filter((book) => (book.title ?? '').toLowerCase().includes(term));

  const compare = Object.hasOwn(COMPARE, sortKey) ? COMPARE[sortKey] : null;
  return compare ? visible.sort(compare) : visible;
}
