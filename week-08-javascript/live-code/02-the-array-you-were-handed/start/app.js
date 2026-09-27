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
