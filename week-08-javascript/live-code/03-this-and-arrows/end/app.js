import { print, attempt } from './print.js';

// Cycle 3 — this and arrows. The shelf object is GIVEN; the rest is typed.
const shelf = {
  label: 'Reading list',
  books: [{ title: 'The Hobbit' }, { title: 'dune' }, { title: 'מיכאל שלי' }],

  // 2 · a method: `this` is whatever stands before the dot WHEN it is called
  count() {
    return `${this.label}: ${this.books.length} books`;
  },

  // 3 · a callback inside a method: an ARROW, so it keeps the method's `this`
  tagged() {
    return this.books.map((book) => `${this.label} · ${book.title}`);
  },
};

// 1 · a function is a value — handed to map by name, NOT called
const toTitle = (book) => book.title;
print('shelf.books.map(toTitle)', shelf.books.map(toTitle));
attempt('shelf.books.map(toTitle())', () => shelf.books.map(toTitle()));

print('shelf.count()', shelf.count());
const count = shelf.count;
attempt('count(), no dot', () => count());

print('shelf.tagged()', shelf.tagged());
