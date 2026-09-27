import { print } from './print.js';

// Cycle 2 — the array you were handed. The shelf is GIVEN; the functions are typed.
const shelf = [
  { title: 'The Hobbit', year: 1937 },
  { title: 'מיכאל שלי', year: 1968 },
  { title: 'dune', year: 1965 },
  { title: 'Field notes', year: null },
  { title: 'Emma', year: 1815 },
];

// One line per book — "title (year)", and "?" where the year is missing.
const titles = (list) => list.map((book) => `${book.title} (${book.year ?? '?'})`);

print('shelf, as handed', titles(shelf));

// 1 · sort by year — a copy, and a missing year goes LAST
print('null - 1815', null - 1815);

function byYear(list) {
  return [...list].sort((a, b) => (a.year ?? Infinity) - (b.year ?? Infinity));
}

print('byYear(shelf)', titles(byYear(shelf)));

// 2 · sort by title — a comparator that returns a NUMBER, in Hebrew and English
const names = shelf.map((book) => book.title);
print('[...names].sort()', [...names].sort());

function byTitle(list) {
  return [...list].sort((a, b) => a.title.localeCompare(b.title, 'he'));
}

print('byTitle(shelf)', titles(byTitle(shelf)));
print('shelf, afterwards', titles(shelf));
