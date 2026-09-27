/*
 * ============================================================================
 * runner.js — GIVEN TO YOU COMPLETE. There is nothing to fill in here.
 *
 * It imports the functions you write in `exercises.js` and `review.js`, runs them
 * against a list of cases, and prints what happened. Open `exercises.html` with
 * Live Server and it runs itself; every time you save, refresh.
 *
 * TWO THINGS WORTH KNOWING, because they change how you work:
 *
 *   1. THIS FILE IS NOT THE GRADER. It runs the same KIND of case the grader runs,
 *      and it does not run the same cases. Making this page green is the floor, not
 *      the grade — exactly as green CI is the floor. If you find yourself writing
 *      code that satisfies this page rather than the brief, you are optimising the
 *      wrong thing and it will not survive.
 *
 *   2. IT REPORTS WHAT IT GOT, NOT ONLY THAT IT FAILED. A red row prints the input,
 *      what was expected and what came back. That is on purpose: "expected 2, got 5"
 *      is a debugging session and "failed" is a shrug.
 *
 * It is deliberately about sixty lines, and it uses exactly two things you have not
 * met yet: `JSON.stringify` to compare two values (week 11) and `.textContent` to put
 * a row on the screen (week 9). Both are one line each and neither is the point.
 * Everything else in here is this week's material. Read it — in week 9 you will write
 * something very like it, and by week 11 you will know why the comparison on line 28
 * is "enough for arrays of primitives and flat objects" rather than simply correct.
 * ============================================================================
 */

/** Deep-ish equality, enough for arrays of primitives and flat objects. */
function same(a, b) {
  return JSON.stringify(a) === JSON.stringify(b);
}

/**
 * Run one case and return a row describing what happened.
 *
 * @param {{name: string, run: () => unknown, expect: unknown}} testCase
 * @returns {{name: string, pass: boolean, detail: string}}
 */
function runOne(testCase) {
  let got;
  try {
    got = testCase.run();
  } catch (err) {
    return { name: testCase.name, pass: false, detail: `threw ${err.name}: ${err.message}` };
  }
  const pass = same(got, testCase.expect);
  return {
    name: testCase.name,
    pass,
    detail: pass ? '' : `expected ${JSON.stringify(testCase.expect)} · got ${JSON.stringify(got)}`,
  };
}

/**
 * Run every case in a group and paint the result into the page.
 *
 * @param {string} mountId
 * @param {Array<{name: string, run: () => unknown, expect: unknown}>} cases
 */
export function report(mountId, cases) {
  const mount = document.getElementById(mountId);
  if (mount === null) return;

  const rows = cases.map(runOne);
  const passed = rows.filter((row) => row.pass).length;

  mount.textContent = '';

  const summary = document.createElement('p');
  summary.className = passed === rows.length ? 'tally ok' : 'tally';
  summary.textContent = `${passed} of ${rows.length} passing`;
  mount.append(summary);

  const list = document.createElement('ul');
  list.className = 'cases';
  for (const row of rows) {
    const item = document.createElement('li');
    item.className = row.pass ? 'pass' : 'fail';

    const name = document.createElement('b');
    name.textContent = row.name;
    item.append(name);

    if (row.detail !== '') {
      const detail = document.createElement('span');
      detail.className = 'detail';
      detail.textContent = row.detail;
      item.append(detail);
    }
    list.append(item);
  }
  mount.append(list);
}
