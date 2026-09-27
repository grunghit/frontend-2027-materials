/*
 * ============================================================================
 * warmup.js — five functions. Four of them are wrong.
 *
 * Ten minutes. Not graded, not submitted, no git.
 *
 * Every one of these RUNS. None of them throws. Each returns something that looks
 * like an answer, and four of them are quietly the wrong answer — which is the
 * whole point of the week: JavaScript's expensive failures do not announce
 * themselves. The referee at the bottom of the page names each one that is still
 * wrong and shows you what it got against what it should have got.
 *
 * The one that is already correct is there so that "fix everything" is not a
 * strategy. Find out which before you change anything.
 * ============================================================================
 */

/** 1. Is this collection empty? */
export function isEmpty(items) {
  return !items;
}

/** 2. The cheapest price in the list. The caller keeps its own order. */
export function cheapest(prices) {
  return prices.sort((a, b) => a - b)[0];
}

/** 3. The titles, in alphabetical order. */
export function sortedTitles(items) {
  return [...items].map((item) => item.title).sort();
}

/** 4. Double every number. */
export function doubled(numbers) {
  return numbers.map((n) => {
    n * 2;
  });
}

/** 5. The display name, falling back when there is none. */
export function displayName(item) {
  return item.nickname ?? item.title;
}
