/**
 * referee.js — GIVEN. Do not edit it, and you do not need to read it.
 *
 * It runs each of the five functions and reports what it got against what it expected.
 * It deliberately does NOT say which line is wrong.
 *
 * TWO OF THE CHECKS ARE NOT ABOUT A RETURN VALUE. "It did not throw on a payload with
 * no results" and "five calls in fifty milliseconds became one call, with the last
 * argument" — and the second of those is the reason this referee is the first in the
 * course that has to `await` anything. Which is the week, in one file.
 */
import { classify, toSuggestions, isAbort, debounce, viewOf } from './warmup.js';

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/** Build the two DOMExceptions the browser actually gives you, by name. */
const abortError = () => new DOMException('The user aborted a request.', 'AbortError');
const timeoutError = () => new DOMException('signal timed out', 'TimeoutError');

const checks = [
  {
    name: 'classify',
    what: 'uses res.ok, not status === 200',
    async run() {
      const cases = [
        [{ ok: true, status: 200 }, 'ok'],
        [{ ok: true, status: 201 }, 'ok'],
        [{ ok: true, status: 204 }, 'ok'],
        [{ ok: false, status: 404 }, 'error'],
        [{ ok: false, status: 500 }, 'error'],
      ];
      for (const [response, want] of cases) {
        const got = classify(response);
        if (got !== want) {
          return {
            pass: false,
            expected: `"${want}" for status ${response.status}`,
            got: `"${got}"`,
          };
        }
      }
      return { pass: true, got: 'five statuses, five right answers — including 201 and 204' };
    },
  },

  {
    name: 'toSuggestions',
    what: 'an answer with no results is an empty array, not a crash',
    async run() {
      const full = toSuggestions({ results: [{ title: 'קמח' }, { title: 'סוכר' }] });
      if (!Array.isArray(full) || full.length !== 2 || full[0].title !== 'קמח') {
        return { pass: false, expected: 'two suggestions', got: JSON.stringify(full) };
      }

      const empty = toSuggestions({ results: [] });
      if (!Array.isArray(empty) || empty.length !== 0) {
        return { pass: false, expected: 'an empty array', got: JSON.stringify(empty) };
      }

      /* THE ONE. Many APIs answer "nothing matched" by leaving the key out entirely. */
      let missing;
      try {
        missing = toSuggestions({});
      } catch (error) {
        return {
          pass: false,
          expected: 'an empty array for a payload with no results key',
          got: `it threw ${error.constructor.name}: ${error.message}`,
        };
      }
      if (!Array.isArray(missing) || missing.length !== 0) {
        return { pass: false, expected: 'an empty array', got: JSON.stringify(missing) };
      }

      return { pass: true, got: 'three payloads, three arrays, and nothing thrown' };
    },
  },

  {
    name: 'isAbort',
    what: 'tells your own cancellation apart from a failure',
    async run() {
      if (isAbort(abortError()) !== true) {
        return { pass: false, expected: 'true for an AbortError', got: 'false' };
      }
      if (isAbort(timeoutError()) !== false) {
        return {
          pass: false,
          expected: 'false for a TimeoutError — it is a failure, and the user must be told',
          got: 'true',
        };
      }
      if (isAbort(new TypeError('Failed to fetch')) !== false) {
        return { pass: false, expected: 'false for a TypeError', got: 'true' };
      }
      return { pass: true, got: 'AbortError yes, TimeoutError no, TypeError no' };
    },
  },

  {
    name: 'debounce',
    what: 'five calls in fifty milliseconds become ONE call, with the LAST argument',
    async run() {
      const seen = [];
      const debounced = debounce((value) => seen.push(value), 120);

      for (const value of ['פ', 'פפ', 'פפר', 'פפרי', 'פפריק']) {
        debounced(value);
        await sleep(10);
      }
      await sleep(300);

      if (seen.length !== 1) {
        return {
          pass: false,
          expected: '1 call',
          got: `${seen.length} calls: ${seen.join(', ')}`,
        };
      }
      if (seen[0] !== 'פפריק') {
        return { pass: false, expected: 'the last argument', got: `"${seen[0]}"` };
      }

      /* And it has to still WORK after the quiet period — a debounce that fires once
         and then never again is a search box that answers the first word only. */
      debounced('כמון');
      await sleep(300);
      if (seen.length !== 2 || seen[1] !== 'כמון') {
        return {
          pass: false,
          expected: 'a second call after a pause',
          got: `${seen.length} calls in total`,
        };
      }

      return {
        pass: true,
        got: 'five became one, the last argument won, and it still works after',
      };
    },
  },

  {
    name: 'viewOf',
    what: 'idle and empty are different states',
    async run() {
      const cases = [
        [{ status: 'idle', results: [] }, 'idle'],
        [{ status: 'loading', results: [] }, 'loading'],
        [{ status: 'error', results: [] }, 'error'],
        [{ status: 'done', results: [] }, 'empty'],
        [{ status: 'done', results: [{ title: 'קמח' }] }, 'results'],
      ];
      for (const [search, want] of cases) {
        const got = viewOf(search);
        if (got !== want) {
          return {
            pass: false,
            expected: `"${want}" for status "${search.status}" with ${search.results.length} results`,
            got: `"${got}"`,
          };
        }
      }
      return { pass: true, got: 'five states, five right answers' };
    },
  },
];

/* ── Reporting. Nothing below is worth reading. ─────────────────────────────── */

const board = document.querySelector('#board');
const tally = document.querySelector('#tally');

/*
 * THE FIRST REFEREE IN THIS COURSE THAT HAS TO AWAIT ANYTHING, and it is worth a
 * glance: `debounce` cannot be tested without letting time pass, so the whole run is
 * asynchronous and the tally appears about a second and a half after the page does.
 * Every earlier warm-up could print its verdict before the first paint.
 */
tally.textContent = 'running…';
tally.className = 'tally';

let passed = 0;

for (const check of checks) {
  let result;
  try {
    result = await check.run();
  } catch (error) {
    /* A function that throws where the referee did not expect it to still gets a row:
       "it crashed" is a result, and a blank screen is not. */
    result = {
      pass: false,
      expected: 'it to return something',
      got: `it threw ${error.constructor.name}: ${error.message}`,
    };
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

  tally.textContent = `${passed} of ${checks.length} so far…`;
}

tally.textContent = `${passed} of ${checks.length}`;
tally.className = passed === checks.length ? 'tally ok' : 'tally no';
