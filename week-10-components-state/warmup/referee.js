/**
 * referee.js — GIVEN. Do not edit it, and you do not need to read it.
 *
 * It runs each of the five functions and reports what it got against what it expected.
 * It deliberately does NOT say which line is wrong: finding that is the exercise, and it
 * is the same thing the mini-surgery after the break asks for, on an application instead
 * of on five functions.
 *
 * Four of the five checks are about the LAWS rather than about the output. "It did not
 * change what it was given" and "it returned something you can call" are the questions
 * this week is made of, and neither of them is visible in a return value.
 */
import { selectVisible, itemRow, selectCounts, bumpOne, subscribe } from './warmup.js';

const ITEMS = [
  { id: 'a1', title: 'קמח', n: 2 },
  { id: 'a2', title: 'שמן', n: 1 },
  { id: 'a3', title: 'קינמון', n: 4 },
];

const clone = (items) => items.map((item) => ({ ...item }));
const shape = (items) => items.map((item) => `${item.id}:${item.title}:${item.n}`).join(' | ');

const checks = [
  {
    name: 'selectVisible',
    what: 'filters by the query and sorts by title, without touching what it was given',
    run() {
      const state = { items: clone(ITEMS), query: 'ק' };
      const before = shape(state.items);
      const out = selectVisible(state);
      const titles = out.map((item) => item.title);

      if (shape(state.items) !== before) {
        return {
          pass: false,
          expected: 'the collection is unchanged',
          got: 'it was reordered or edited',
        };
      }
      if (titles.length !== 2) {
        return {
          pass: false,
          expected: '2 items match',
          got: `${titles.length}: ${titles.join(', ')}`,
        };
      }
      const wanted = ['קינמון', 'קמח'];
      if (titles.join(',') !== wanted.join(',')) {
        return { pass: false, expected: wanted.join(', '), got: titles.join(', ') };
      }
      return { pass: true, got: titles.join(', ') };
    },
  },
  {
    name: 'itemRow',
    what: 'builds a row that carries the ITEM, not its position',
    run() {
      const row = itemRow(ITEMS[2], 0);
      if (!(row instanceof HTMLLIElement)) {
        return { pass: false, expected: 'an <li>', got: String(row) };
      }
      if (row.dataset.id !== 'a3') {
        return { pass: false, expected: 'data-id="a3"', got: `data-id="${row.dataset.id}"` };
      }
      if (row.querySelector('.title')?.textContent !== 'קינמון') {
        return { pass: false, expected: 'the title inside .title', got: row.textContent };
      }
      return { pass: true, got: `data-id="${row.dataset.id}"` };
    },
  },
  {
    name: 'selectCounts',
    what: 'derives both numbers, and agrees with selectVisible',
    run() {
      const state = { items: clone(ITEMS), query: 'ק' };
      const out = selectCounts(state);
      const shown = selectVisible({ items: clone(ITEMS), query: 'ק' }).length;
      if (out.total !== 3) {
        return { pass: false, expected: 'total 3', got: `total ${out.total}` };
      }
      if (out.shown !== shown) {
        return { pass: false, expected: `shown ${shown}`, got: `shown ${out.shown}` };
      }
      return { pass: true, got: `total ${out.total}, shown ${out.shown}` };
    },
  },
  {
    name: 'bumpOne',
    what: 'returns a NEW collection, and leaves the old one alone',
    run() {
      const items = clone(ITEMS);
      const before = shape(items);
      const out = bumpOne(items, 'a2');

      if (out === items) {
        return { pass: false, expected: 'a new array', got: 'the same array it was given' };
      }
      if (shape(items) !== before) {
        return { pass: false, expected: 'the original is unchanged', got: shape(items) };
      }
      const bumped = out.find((item) => item.id === 'a2');
      if (bumped?.n !== 2) {
        return { pass: false, expected: 'a2 has 2', got: `a2 has ${bumped?.n}` };
      }
      return { pass: true, got: shape(out) };
    },
  },
  {
    name: 'subscribe',
    what: 'returns something you can CALL to unsubscribe',
    run() {
      const listeners = new Set();
      const listener = () => {};
      const off = subscribe(listeners, listener);

      if (listeners.size !== 1) {
        return { pass: false, expected: '1 listener registered', got: `${listeners.size}` };
      }
      if (typeof off !== 'function') {
        return { pass: false, expected: 'a function', got: typeof off };
      }
      off();
      if (listeners.size !== 0) {
        return { pass: false, expected: '0 listeners after calling it', got: `${listeners.size}` };
      }
      return { pass: true, got: 'registered, then removed' };
    },
  },
];

const board = document.querySelector('#board');
const tally = document.querySelector('#tally');
let passed = 0;

for (const check of checks) {
  let result;
  try {
    result = check.run();
  } catch (err) {
    result = { pass: false, expected: 'it runs', got: `it threw: ${err.message}` };
  }
  if (result.pass) passed += 1;

  const li = document.createElement('li');
  li.className = result.pass ? 'ok' : 'no';

  const name = document.createElement('code');
  name.textContent = check.name;

  const what = document.createElement('span');
  what.className = 'what';
  what.textContent = check.what;

  const said = document.createElement('span');
  said.className = 'said';
  said.textContent = result.pass
    ? `got: ${result.got}`
    : `expected: ${result.expected}  ·  got: ${result.got}`;

  li.append(name, what, said);
  board.append(li);
}

tally.textContent = `${passed} of ${checks.length}`;
tally.className = passed === checks.length ? 'tally ok' : 'tally no';
