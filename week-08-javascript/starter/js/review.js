/*
 * ============================================================================
 * review.js — PART ג. Three functions I did not write.
 *
 * I opened a new conversation and asked for three small helpers for a collection
 * app. What is below is what came back, unedited — the code AND the explanation
 * that came with each one, quoted exactly as it was given to me.
 *
 * ONE OF THE THREE DOES NOT DO WHAT ITS OWN EXPLANATION CLAIMS IT DOES.
 *
 * The other two are correct. Do not "improve" them: `review-he.md` asks which one
 * you found, and a submission that changed all three has not shown me anything.
 * The grader checks that the two correct ones are exactly as they arrived.
 *
 * It is not a typo, it is not a crash, and it is not something the runner on
 * `exercises.html` will catch by looking at a return value. Every one of the three
 * returns the right answer. Read them the way you will have to read the code you
 * approve for the rest of your career: assume it runs, and ask what ELSE it does.
 * ============================================================================
 */

/**
 * Claude said, word for word:
 *
 *   "This returns the highest-rated items, limited to `howMany`. I use `slice`
 *    rather than `splice` because `slice` returns a new array and leaves the
 *    original untouched, so the caller's data is safe."
 *
 * @param {Array<object>} items
 * @param {number} howMany
 * @returns {Array<object>}
 */
export function topRated(items, howMany) {
  const ranked = items.sort((a, b) => b.rating - a.rating);
  return ranked.slice(0, howMany);
}

/**
 * Claude said, word for word:
 *
 *   "This builds initials from a person's or band's name. It splits on whitespace,
 *    drops any empty pieces that a double space would produce, takes the first
 *    character of each remaining word and upper-cases it."
 *
 * @param {string} name
 * @returns {string}
 */
export function initials(name) {
  return name
    .split(' ')
    .filter((word) => word !== '')
    .map((word) => word[0].toUpperCase())
    .join('');
}

/**
 * Claude said, word for word:
 *
 *   "This formats a rating for display. A rating of 0 means nobody has rated the
 *    item yet, so it gets a dash rather than a misleading zero; anything else is
 *    shown as N out of 5."
 *
 * @param {number} rating
 * @returns {string}
 */
export function formatRating(rating) {
  if (rating === 0) {
    return '—';
  }
  return `${rating} / 5`;
}
