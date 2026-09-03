/**
 * referee.js — GIVEN. Do not edit it, and you do not need to read it.
 *
 * It runs each of the five functions and reports what it got against what it expected.
 * It deliberately does NOT say which line is wrong.
 *
 * THREE OF THE CHECKS ARE NOT ABOUT A RETURN VALUE. "It did not throw on rubbish",
 * "it did not change what it was given", and "what it produced survives a round trip"
 * are the three questions this week is made of, and none of them is visible in the
 * value a function returns.
 */
import { parseSafely, readCollection, toPayload, isItem, stampCreated } from './warmup.js';

const ITEMS = [
  { id: 'a1', title: 'קמח', number: 2 },
  { id: 'a2', title: 'שמן', number: 1 },
];

const shape = (items) => items.map((item) => `${item.id}:${item.title}:${item.number}`).join(' | ');

const checks = [
  {
    name: 'parseSafely',
    what: 'returns the value, and returns null instead of throwing on rubbish',
    run() {
      const good = parseSafely('{"a":1}');
      if (good === null || good.a !== 1) {
        return { pass: false, expected: '{ a: 1 }', got: JSON.stringify(good) };
      }
      let threw = null;
      let out;
      try {
        out = parseSafely('{{{ not json');
      } catch (err) {
        threw = err.constructor.name;
      }
      if (threw !== null) {
        return { pass: false, expected: 'null', got: `it threw ${threw}` };
      }
      if (out !== null) {
        return { pass: false, expected: 'null', got: JSON.stringify(out) };
      }
      return { pass: true, got: 'parsed the good one, returned null for the bad one' };
    },
  },

  {
    name: 'readCollection',
    what: 'tells "nothing was ever saved" apart from "the user saved nothing"',
    run() {
      if (readCollection(null) !== null) {
        return {
          pass: false,
          expected: 'null for a key that does not exist',
          got: 'something else',
        };
      }
      if (readCollection('{{{ nope') !== null) {
        return {
          pass: false,
          expected: 'null for a string that is not JSON',
          got: 'something else',
        };
      }

      const full = readCollection(JSON.stringify({ v: 1, items: ITEMS }));
      if (!Array.isArray(full) || full.length !== 2) {
        return { pass: false, expected: '2 items', got: JSON.stringify(full) };
      }

      /* THE ONE THAT MATTERS. An empty saved collection is an ANSWER. Report it as
         "nothing here" and a user who deleted everything gets the demo data back on
         the next reload — and you cannot find that by testing, because you have to
         clear everything and THEN reload, in that order. */
      const empty = readCollection(JSON.stringify({ v: 1, items: [] }));
      if (empty === null) {
        return {
          pass: false,
          expected: 'an empty array — the user deleted everything',
          got: 'null — which the caller reads as "nothing was ever saved"',
        };
      }
      if (!Array.isArray(empty) || empty.length !== 0) {
        return { pass: false, expected: 'an empty array', got: JSON.stringify(empty) };
      }
      return { pass: true, got: 'null, null, 2 items, and an empty array' };
    },
  },

  {
    name: 'toPayload',
    what: 'produces the STRING that setItem is willing to keep',
    run() {
      const payload = toPayload(ITEMS);
      if (typeof payload !== 'string') {
        return {
          pass: false,
          expected: 'a string',
          got: `${typeof payload} — setItem would store "${String(payload)}"`,
        };
      }
      let back;
      try {
        back = JSON.parse(payload);
      } catch (err) {
        return { pass: false, expected: 'valid JSON', got: `parsing it threw ${err.message}` };
      }
      if (!Array.isArray(back.items) || shape(back.items) !== shape(ITEMS)) {
        return { pass: false, expected: shape(ITEMS), got: JSON.stringify(back) };
      }
      if (typeof back.v !== 'number') {
        return {
          pass: false,
          expected: 'a version beside the collection',
          got: JSON.stringify(back),
        };
      }
      return { pass: true, got: `${payload.length} characters, and they parse back` };
    },
  },

  {
    name: 'isItem',
    what: 'accepts a real item and refuses four things that are not one',
    run() {
      if (!isItem(ITEMS[0])) {
        return { pass: false, expected: 'true for a real item', got: 'false' };
      }
      const refusals = [
        ['null', null],
        ['a string', 'קמח'],
        ['an item with no id', { title: 'קמח', number: 2 }],
        ['an item whose number is a string', { id: 'a1', title: 'קמח', number: '2' }],
      ];
      for (const [label, value] of refusals) {
        if (isItem(value)) {
          return { pass: false, expected: `false for ${label}`, got: 'true' };
        }
      }
      return { pass: true, got: 'true for the item, false for all four' };
    },
  },

  {
    name: 'stampCreated',
    what: 'stamps a NEW item, with something that survives a round trip',
    run() {
      const original = { id: 'a1', title: 'קמח', number: 2 };
      const copy = { ...original };
      const stamped = stampCreated(original);

      if (stamped === original) {
        return { pass: false, expected: 'a new object', got: 'the object it was given' };
      }
      if (JSON.stringify(original) !== JSON.stringify(copy)) {
        return {
          pass: false,
          expected: 'the original is untouched',
          got: `it now has ${Object.keys(original).join(', ')}`,
        };
      }
      if (stamped.created === undefined) {
        return { pass: false, expected: 'a `created` field', got: 'nothing' };
      }

      /* THE ROUND TRIP. This is the whole point of the function: whatever went into
         the field has to come back out as the same KIND of thing, because tomorrow it
         will have been through storage. */
      const before = typeof stamped.created;
      const after = typeof JSON.parse(JSON.stringify(stamped)).created;
      if (before !== after) {
        return {
          pass: false,
          expected: `the same type on both sides (${before})`,
          got: `${before} went in, ${after} came back`,
        };
      }
      if (Number.isNaN(new Date(stamped.created).getTime())) {
        return { pass: false, expected: 'a readable timestamp', got: String(stamped.created) };
      }
      return { pass: true, got: `${before}, and it survives the round trip` };
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
