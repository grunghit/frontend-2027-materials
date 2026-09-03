/*
 * ============================================================================
 * storage.js — localStorage, and nothing else. It does not know what your items look
 * like on screen and it never touches the DOM.
 *
 * Everything in here is about the three ways localStorage actually fails, none of
 * which show up while you are building on your own machine:
 *
 *   1. THE VALUE IS NOT WHAT YOU LEFT THERE. A key is a public, editable string in
 *      the user's browser. It can hold last week's shape, half a write, or whatever
 *      somebody typed into the console. `JSON.parse` throws on the last one and —
 *      much worse — succeeds on the first two.
 *   2. THE WRITE CAN FAIL. Quota is finite, and private mode has historically thrown
 *      on the first `setItem`. An application that assumes the save worked shows the
 *      user a collection that will not be there tomorrow.
 *   3. THE API CAN BE ABSENT. Blocked cookies and hardened profiles make the property
 *      access itself throw, before any key is read.
 *
 * So: `load()` always returns an object with an array in it, `save()` always returns
 * a result, and neither ever throws. A caller never has to guard.
 *
 * Requirements 14–16 in the brief are this file. Requirement 15 is graded by feeding
 * your application three specific bad values, so read the comments before writing.
 * ============================================================================
 */
import { isItem } from './types.js';

/*
 * THE KEY IS NAMESPACED AND VERSIONED, and both halves earn their place.
 *
 * The prefix, because localStorage is per-ORIGIN, not per-page. On `127.0.0.1:5500`
 * every project anyone has ever served with Live Server shares one store — so a bare
 * key like `items` is a collision waiting to happen, and the bug it produces
 * (somebody else's data in your application) is bewildering to debug.
 *
 * The `:v1`, because the shape in here is a contract with a version of your code.
 * When the shape changes, new code reads `:v2` and simply does not see `:v1` — an
 * empty collection, which is recoverable. Reading old data with new code is not.
 */
const KEY = 'CODE-HERE:v1'; // CODE HERE — replace CODE-HERE with your app's name, in English

/**
 * Is localStorage usable at all?
 *
 * Feature-detected by USING it, not by checking that the property exists: in a
 * blocked profile `window.localStorage` is present and throws on access, so
 * `'localStorage' in window` answers the wrong question.
 *
 * This one is written for you — it is plumbing, not the assignment.
 */
export function isAvailable() {
  try {
    const probe = `${KEY}:probe`;
    localStorage.setItem(probe, '1');
    localStorage.removeItem(probe);
    return true;
  } catch {
    return false;
  }
}

/**
 * Read the collection.
 *
 * @returns {{ items: unknown[], dropped: number, reason: string|null }}
 *
 * The return shape is deliberately not a bare array. A silent recovery is still a
 * data loss, and the caller is the only layer that can decide whether to tell the
 * user — so the facts travel with the value instead of going to the console where
 * nobody looks.
 *
 * FOUR CASES, and the grader feeds you the middle three:
 */
export function load() {
  const empty = { items: [], dropped: 0, reason: null };

  let raw;
  try {
    raw = localStorage.getItem(KEY);
  } catch {
    return { ...empty, reason: 'הדפדפן חוסם אחסון מקומי, ולכן הנתונים לא נשמרים בין ביקורים.' };
  }

  /* Case 1: nothing saved yet. Not an error — a first visit. */
  if (raw === null) return empty;

  /* Case 2: not JSON at all.
   *
   * DO NOT DELETE THE BAD VALUE. It is the only copy of whatever the user had, and
   * a developer looking at this later would rather find it than a clean slate. The
   * application starts empty; the bad value stays put. The grader checks this. */
  // CODE HERE — parse inside try/catch, and return a reason on failure

  /* Case 3: valid JSON that is not an array.
   *
   * `JSON.parse('7')` is 7 and `JSON.parse('null')` is null. Both are valid JSON and
   * neither is a collection, so this is a check on a call that SUCCEEDED. */
  // CODE HERE

  /* Case 4: an array with one bad row in it.
   *
   * Row by row, not all-or-nothing: one entry written by an older version of your
   * code should cost that one entry, not the other forty. `isItem` from types.js is
   * the runtime half of your TypeScript module — the types themselves check nothing
   * at runtime, which is exactly why the guard exists. */
  // CODE HERE — filter with isItem, count how many were dropped, and report it

  return empty;
}

/**
 * Write the collection.
 *
 * @returns {{ ok: boolean, reason: string|null }}
 *
 * Never throws, and never lies: a caller that gets `ok: false` knows the collection
 * on screen and the collection on disk have diverged, and can say so.
 *
 * `QuotaExceededError` deserves its own message because the user can act on it —
 * deleting something frees space. Everything else is one message: it did not save.
 * Check `err.name` rather than `instanceof DOMException`; the constructor differs
 * between engines and the name does not.
 */
export function save(items) {
  // CODE HERE — setItem inside try/catch, and distinguish the quota error
  return { ok: false, reason: 'save() עדיין לא ממומש.' };
}

/**
 * Forget everything.
 *
 * Separate from `save([])` on purpose: an empty array is a collection with no items,
 * and removing the key is a browser with no collection. They look identical today,
 * and on the day a `:v2` migration reads this store they will not.
 */
export function clear() {
  try {
    localStorage.removeItem(KEY);
    return { ok: true, reason: null };
  } catch {
    return { ok: false, reason: 'לא ניתן למחוק את הנתונים השמורים בדפדפן הזה.' };
  }
}
