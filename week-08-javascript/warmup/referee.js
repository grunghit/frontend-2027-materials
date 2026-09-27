/*
 * ============================================================================
 * referee.js — GIVEN, AND IT IS THE ANSWER SHEET THAT DOES NOT TELL YOU THE ANSWER.
 *
 * It runs each of the five functions against cases it chooses, prints what came back
 * beside what should have come back, and counts how many are still wrong.
 *
 * It deliberately does NOT say which line to change or why. "cheapest reordered the
 * caller's array" is a symptom you can act on; "add a spread on line 2" is a diff you
 * can apply without reading. Ten minutes is enough for the first and too short to
 * learn anything from the second.
 * ============================================================================
 */
import { isEmpty, cheapest, sortedTitles, doubled, displayName } from './warmup.js';

const same = (a, b) => JSON.stringify(a) === JSON.stringify(b);

/** Each case runs the student's function and decides for itself whether it is right. */
const CASES = [
  {
    name: 'isEmpty',
    run() {
      const results = [isEmpty([]), isEmpty([{ id: 1 }])];
      return {
        ok: same(results, [true, false]),
        got: `isEmpty([]) → ${results[0]} · isEmpty([one item]) → ${results[1]}`,
        want: 'isEmpty([]) → true · isEmpty([one item]) → false',
      };
    },
  },
  {
    name: 'cheapest',
    run() {
      const prices = [30, 20, 10];
      const answer = cheapest(prices);
      return {
        ok: answer === 10 && same(prices, [30, 20, 10]),
        got: `returned ${answer}, and the caller's array is now [${prices.join(', ')}]`,
        want: "returned 10, and the caller's array is still [30, 20, 10]",
      };
    },
  },
  {
    name: 'sortedTitles',
    run() {
      const items = [{ title: 'banana' }, { title: 'Apple' }, { title: 'אבן' }];
      const answer = sortedTitles(items);
      return {
        ok: same(answer, ['אבן', 'Apple', 'banana']),
        got: `[${answer.join(', ')}]`,
        want: '[אבן, Apple, banana]',
      };
    },
  },
  {
    name: 'doubled',
    run() {
      const answer = doubled([1, 2, 3]);
      return {
        ok: same(answer, [2, 4, 6]),
        got: `[${answer.join(', ')}]`,
        want: '[2, 4, 6]',
      };
    },
  },
  {
    name: 'displayName',
    run() {
      const results = [
        displayName({ title: 'Kid A', nickname: null }),
        displayName({ title: 'Kid A', nickname: 'קיד איי' }),
      ];
      return {
        ok: same(results, ['Kid A', 'קיד איי']),
        got: `${results[0]} · ${results[1]}`,
        want: 'Kid A · קיד איי',
      };
    },
  },
];

const mount = document.getElementById('referee');
const tally = document.getElementById('tally');

const rows = CASES.map((c) => {
  try {
    return { name: c.name, ...c.run() };
  } catch (err) {
    return { name: c.name, ok: false, got: `זרק ${err.name}: ${err.message}`, want: '' };
  }
});

const broken = rows.filter((r) => !r.ok);

tally.textContent =
  broken.length === 0
    ? 'חמש מתוך חמש עובדות. סיימת.'
    : `${broken.length} מתוך ${rows.length} עדיין לא נכונות.`;
tally.className = broken.length === 0 ? 'tally ok' : 'tally';

mount.textContent = '';
for (const row of rows) {
  const item = document.createElement('li');
  item.className = row.ok ? 'ok' : 'no';

  const name = document.createElement('b');
  name.textContent = row.name;
  item.append(name);

  if (!row.ok) {
    const got = document.createElement('span');
    got.className = 'got';
    got.textContent = `קיבלתי: ${row.got}`;
    const want = document.createElement('span');
    want.className = 'want';
    want.textContent = `ציפיתי: ${row.want}`;
    item.append(got, want);
  }
  mount.append(item);
}
