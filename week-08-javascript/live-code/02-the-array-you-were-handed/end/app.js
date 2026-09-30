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

// 3 · three small ones Part B needs: search, count into an object, one decimal
function search(list, query) {
  const term = query.trim().toLowerCase();
  return list.filter((book) => (book.title ?? '').toLowerCase().includes(term));
}

function countByDecade(list) {
  const counts = {};
  for (const book of list) {
    const decade = book.year === null ? '?' : `${Math.floor(book.year / 10) * 10}s`;
    counts[decade] = (counts[decade] ?? 0) + 1;
  }
  return Object.entries(counts)
    .map(([label, count]) => ({ label, count }))
    .sort((a, b) => b.count - a.count || a.label.localeCompare(b.label, 'he'));
}

print("search(shelf, ' HO ')", titles(search(shelf, ' HO ')));
print('countByDecade(shelf)', countByDecade(shelf));

const years = shelf.map((book) => book.year).filter((year) => year !== null);
let sum = 0;
for (const year of years) sum += year;
const mean = sum / years.length;
print('mean · Math.round · toFixed', [mean, Math.round(mean * 10) / 10, mean.toFixed(1)]);

print('shelf, afterwards', titles(shelf));
