/*
 * ============================================================================
 * cache.js — the data layer, and one of the two files you write today.
 *
 * ── WHAT A CACHE IS, AND WHAT IT IS NOT
 *
 * It is NOT "save the answer so we do not have to ask again". That is a database with
 * no way to be wrong, and it is how an application ends up showing somebody yesterday's
 * temperature as though it were now.
 *
 * A cache is TWO facts stored together: the answer, AND WHEN IT WAS TRUE. Everything
 * interesting follows from the second one:
 *
 *   fresh   inside the TTL. Use it, say nothing.
 *   stale   outside the TTL. Use it if you must, AND SAY SO.
 *   absent  never asked, or the key was cleared.
 *
 * Reading the age is what turns "I have data" into "I have data from four minutes ago",
 * and that difference is the whole assignment.
 *
 * ── THE RULES, AND FIVE OF THE SIX ARE WEEK 11's
 *
 *   1. ONE KEY, NAMESPACED AND VERSIONED. `ruppin.weather.v1`.
 *   2. EVERY ACCESS TO `localStorage` IS INSIDE A `try` — the ACCESS, not just the
 *      parse. `getItem` itself throws when a browser has blocked storage for this
 *      origin, and an unguarded one on the boot path is a blank page.
 *   3. ABSENT IS NOT CORRUPT. A first visit is the normal case.
 *   4. VALID JSON IS NOT VALID DATA. Parse, THEN check the shape.
 *   5. WRITE ONLY WHAT CANNOT BE RECOMPUTED.
 *   6. AND THE NEW ONE: **A CACHED VALUE IS ONLY AS GOOD AS ITS TIMESTAMP.** An entry
 *      with no `fetchedAt` is not a cache entry, it is a rumour, and this file refuses
 *      to return one.
 *
 * ── WHY THE TIMESTAMP IS A NUMBER AND NOT A `Date`
 *
 * Week 11's field, one assignment later. `JSON.stringify(new Date())` produces an ISO
 * string and `JSON.parse` has no idea it was ever anything else — so an application
 * that keeps `Date` objects works perfectly until the first reload, and then
 * `entry.fetchedAt.getTime is not a function` is thrown from inside `render`.
 *
 * `Date.now()` is a number. It survives the round trip as a number, it subtracts
 * without ceremony, and there is nothing to forget.
 * ============================================================================
 */

/** The key. Namespace, name, version — see rule 1 and week 11. */
const KEY = 'ruppin.weather.v1';

/** The shape version written into every payload. */
const VERSION = 1;

/**
 * How long an answer is worth believing.
 *
 * TEN MINUTES, AND THE NUMBER IS A DECISION RATHER THAN A FACT: this endpoint updates
 * about every fifteen, so anything shorter is asking a question whose answer cannot
 * have changed. A TTL is always a claim about how fast the underlying thing moves, and
 * that is worth saying out loud rather than picking a round number.
 */
export const TTL_MS = 10 * 60 * 1000;

/** Is storage usable at all? The only honest test is a WRITE. See week 11. */
const available = (() => {
  try {
    localStorage.setItem('__probe__', '1');
    localStorage.removeItem('__probe__');
    return true;
  } catch {
    return false;
  }
})();

/**
 * Is this thing an entry we are willing to believe? RULE 4 and RULE 6, in code.
 *
 * Deliberately shallow: the four fields this application actually READS, with the types
 * it actually assumes. A validator that mirrors the whole schema is a second definition
 * of the entry, and two definitions is the thing this course spends a semester removing.
 */
const isEntry = (value) =>
  // CODE HERE — an object, with four finite numbers on it. `typeof null === 'object'`,
  //             so test for null. And `fetchedAt` is not optional: see rule 6.
  false;

/**
 * Turn whatever was on disk into the map this version expects, or an empty one.
 *
 * Three answers — the form on week 11's spine ("Six requests at once, and a shape
 * from last year", minute 145) and demo 20, on this cache's map of entries:
 *   the current envelope   take the entries, dropping any that fail `isEntry`
 *   a bare object          what version 0 wrote, before there was a version. Adopt it.
 *   anything else          `{}` — a version from the future, or nonsense. Start over.
 */
function migrate(parsed) {
  // CODE HERE — three answers, the form week 11's spine showed at minute 145.
  return {};
}

/**
 * Read the whole cache. NEVER THROWS — it runs before the first paint.
 *
 * Returns a map, never `null`: an empty cache and a blocked browser mean the same thing
 * to every caller ("you have nothing"), and collapsing them here is what keeps the rest
 * of the application free of the distinction.
 *
 * @returns {Record<string, { fetchedAt: number, temperature: number, wind: number, code: number }>}
 */
export function readAll() {
  // CODE HERE
  return {};
}

/**
 * Write one entry, keeping everything else.
 *
 * READ-MODIFY-WRITE, and that is not laziness: `localStorage` holds one string per key,
 * so "update one city" is unavoidably "read all six, change one, write all six". Six
 * keys would avoid it and would cost six reads on every boot plus a way to enumerate
 * them, which is worse.
 *
 * @returns {boolean} whether it was written. The caller may want to say so.
 */
export function writeOne(cityId, entry) {
  // CODE HERE — read, change one, write. And return whether it worked.
  return false;
}

/** Forget everything this application has cached. Not `localStorage.clear()`, ever. */
export function clearCache() {
  // CODE HERE. NOT `localStorage.clear()`, ever — that empties the whole origin.
  return false;
}

/**
 * How old is this entry, and is it still worth believing?
 *
 * THE FUNCTION THE WHOLE ASSIGNMENT TURNS ON, and it is four lines. `now` is a
 * parameter rather than a call to `Date.now()` inside, for one reason: that makes it
 * PURE, and a pure function of two numbers is one the grader — and you — can test
 * without waiting ten minutes.
 *
 * An entry stamped in the FUTURE (a clock moved backwards) is not an error: it is
 * `fresh`, with `ageMs` 0 — `Math.max(0, now - fetchedAt)` — never negative, never NaN.
 *
 * @param {{ fetchedAt: number } | undefined} entry
 * @param {number} now
 * @returns {{ status: 'absent' | 'fresh' | 'stale', ageMs: number }} `ageMs` is always
 *   a finite number >= 0; a future stamp gives `{ status: 'fresh', ageMs: 0 }`.
 */
export function freshness(entry, now = Date.now()) {
  // CODE HERE — four lines, and they are the four lines the whole assignment turns on.
  //
  // `now` is a PARAMETER and not a call to Date.now() inside, on purpose: that makes
  // this pure, and a pure function of two numbers is one you can test without waiting
  // ten minutes. The grader tests it exactly that way.
  //
  // Mind the entry stamped in the FUTURE — a user whose clock moved backwards. It is
  // not an error in your code, and `NaN` where a number of minutes should be is.
  return { status: 'absent', ageMs: 0 };
}

/** "לפני 4 דקות", from a number of milliseconds. Display only; nothing depends on it. */
export function describeAge(ageMs) {
  const minutes = Math.floor(ageMs / 60000);
  if (minutes < 1) return 'לפני פחות מדקה';
  if (minutes === 1) return 'לפני דקה';
  if (minutes < 60) return `לפני ${minutes} דקות`;
  const hours = Math.floor(minutes / 60);
  if (hours === 1) return 'לפני שעה';
  if (hours < 24) return `לפני ${hours} שעות`;
  const days = Math.floor(hours / 24);
  return days === 1 ? 'אתמול' : `לפני ${days} ימים`;
}
