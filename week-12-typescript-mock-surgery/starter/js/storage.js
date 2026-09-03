/*
 * ============================================================================
 * storage.js — LAYER 4. The collection stops living in memory.
 *
 * INSTRUCTOR MATERIAL, and the file students read after grading.
 *
 * READ IT LOOKING FOR TWO THINGS.
 *
 * The first is what is NOT here: no `document`, no element, no decision about how
 * anything looks. This layer is the twin of state.js — it converts between the one
 * object the application believes in and the one string the browser is willing to
 * keep, and it knows nothing else.
 *
 * The second is that EVERY SINGLE ACCESS TO `localStorage` IS INSIDE A `try`.
 * Not the parse — the access. `localStorage.getItem` itself throws when the browser
 * has blocked storage for this origin (Safari's private mode historically, "block
 * all cookies" in every browser today, and a Chrome profile with third-party storage
 * partitioned off). An application whose FIRST line of boot is an unguarded
 * `localStorage.getItem` does not render at all in that browser, and the student
 * hears about it from one person in the class who cannot see anything.
 *
 * ── THE FIVE RULES THIS FILE IS BUILT FROM
 *
 *   1. ONE KEY, NAMESPACED AND VERSIONED. `ruppin.pantry.v1`. Every project any of
 *      us runs is served from http://127.0.0.1:5500 — SAME ORIGIN — so `items` is a
 *      key three of your own applications are already fighting over.
 *   2. EVERY ACCESS IS WRAPPED. See above.
 *   3. ABSENT IS NOT CORRUPT. `getItem` returns `null` on a first visit. That is the
 *      normal answer, not a failure, and it is the answer this file reports as
 *      "nothing saved" rather than as an error.
 *   4. VALID JSON IS NOT VALID DATA. `JSON.parse` succeeding tells you the string was
 *      well formed. It tells you nothing at all about the shape. Parse, THEN check.
 *   5. WRITE ONLY WHAT CANNOT BE RECOMPUTED. The collection is saved. The search box,
 *      the sort order and the row being edited are not — restoring a filter the user
 *      forgot they set is a bug that looks exactly like lost data.
 * ============================================================================
 */
import { setState } from './state.js';

/**
 * The key.
 *
 * Three parts and each earns its place:
 *
 *   ruppin   the namespace. localStorage is per ORIGIN, not per folder, and every
 *            Live Server project on this machine shares http://127.0.0.1:5500.
 *   pantry   what this is. A second application in the same course gets a second word.
 *   v1       the shape of what is inside. When the shape changes this becomes v2 and
 *            `migrate` below decides what to do with the v1 data still on disk.
 *
 * The instructor's own 2026 code already did this — `const STORAGE_KEY =
 * "users_cache_v1"` — which is where the `v1` half of this convention comes from.
 */
const KEY = 'ruppin.pantry.v1';

/** The shape version written into every payload. See `migrate`. */
const VERSION = 1;

/**
 * Is storage usable at all?
 *
 * The only honest test is a WRITE, because a browser that has blocked storage for
 * this origin still hands you a `localStorage` object — it throws when you touch it.
 * `typeof localStorage !== 'undefined'` and `'localStorage' in window` are both true
 * in exactly the browser this question is asked about.
 *
 * Computed once, at module load: whether storage works cannot change while the page
 * is open, and asking on every keystroke would mean two extra writes per keystroke.
 */
export const available = (() => {
  try {
    const probe = '__ruppin_probe__';
    localStorage.setItem(probe, '1');
    localStorage.removeItem(probe);
    return true;
  } catch {
    return false;
  }
})();

/**
 * Is this thing an item we are willing to believe?
 *
 * RULE 4, in code. The string on disk was written by an older version of this
 * application, or by a different application that picked the same key, or by a
 * student with the console open — and `JSON.parse` will happily hand back
 * `{ items: "hello" }` without a word of complaint. The crash arrives one line later,
 * inside `render`, where it looks like a rendering bug.
 *
 * The check is deliberately shallow: the four fields the application actually reads,
 * with the types it actually assumes. A validator that mirrors the whole schema is a
 * second definition of the item, and two definitions is the thing this course spends
 * a semester removing.
 */
const isItem = (value) =>
  value !== null &&
  typeof value === 'object' &&
  typeof value.id === 'string' &&
  value.id !== '' &&
  typeof value.title === 'string' &&
  Number.isFinite(value.number) &&
  typeof value.category === 'string';

/**
 * Turn whatever was on disk into the collection this version of the code expects, or
 * `null` if that is not possible.
 *
 * THE THREE ANSWERS, and a real migration has all three:
 *
 *   v1        the current envelope, `{ v: 1, items: [...] }`. Take the items.
 *   a bare
 *   array     what version 0 of this application wrote, before anybody thought about
 *             versions: `JSON.stringify(state.items)`. It is still perfectly good
 *             data and there is no reason to throw a user's collection away because
 *             we later got tidier. Adopt it.
 *   anything
 *   else      a version from the future, another application's key, or nonsense.
 *             `null`, and the caller seeds instead.
 *
 * THE BARE ARRAY IS NOT HYPOTHETICAL. It is what a student writes on their first
 * attempt, this week, before part ד — so the migration they are asked to write is a
 * migration of their own data, from their own morning.
 */
function migrate(parsed) {
  /* A bare array — version 0. `typeof null === 'object'`, so the array test comes
     first and the null test is implied by it. */
  if (Array.isArray(parsed)) return parsed.filter(isItem);

  if (parsed === null || typeof parsed !== 'object') return null;
  if (parsed.v === VERSION && Array.isArray(parsed.items)) return parsed.items.filter(isItem);

  /* A `v` we have never heard of. Refusing is the safe answer: data written by a
     NEWER version of the application may mean something different in every field, and
     a guess here silently corrupts the user's collection rather than losing it. */
  return null;
}

/**
 * Read the saved collection, or `null` if there is nothing trustworthy to read.
 *
 * FOUR WAYS TO GET `null` OUT OF THIS FUNCTION, and the caller does not care which:
 * storage is blocked, nothing has ever been saved, the string is not JSON, or the
 * JSON is not our shape. All four mean the same thing to the application — "start
 * from the seed" — and collapsing them here is what keeps app.js at one line.
 *
 * WHAT IT MUST NEVER DO IS THROW. This function runs before the first paint. A throw
 * here is a blank page, and a blank page from a storage bug looks exactly like a
 * blank page from a broken `render` — which is where the whole hour usually goes.
 *
 * @returns {Array<{id: string, title: string, number: number, category: string}> | null}
 */
export function load() {
  let raw;
  try {
    raw = localStorage.getItem(KEY);
  } catch {
    /* Storage is blocked. Not an error the user can do anything about, and not a
       reason to fail to draw a page. */
    return null;
  }

  /* RULE 3. `null` is a first visit. Note what this is NOT: it is not
     `JSON.parse(raw)` on a `null`, which does not throw either — it stringifies to
     "null" and parses back to `null`, and the crash arrives later at `.map`, a long
     way from here. */
  if (raw === null) return null;

  let parsed;
  try {
    parsed = JSON.parse(raw);
  } catch {
    /* Corrupt. LEAVE IT ALONE — do not delete it here. The user has one copy of their
       data and a parse failure is the moment we understand it least; `clearAll()` is
       one button away and it is the user's decision, not ours. */
    return null;
  }

  const items = migrate(parsed);
  /* An empty array is a real answer — "the user deleted everything" — and it must not
     be confused with "nothing saved", which would seed the pantry back to full every
     time somebody emptied it. `migrate` returns `null` for unusable, `[]` for empty. */
  return items;
}

/**
 * The last collection we wrote, by REFERENCE.
 *
 * This one line is the whole write budget, and it works only because of a rule from
 * week 9: handlers build NEW arrays instead of editing the one in state. So
 * `state.items` is a different array exactly when the collection changed, and
 * `!==` is an exact answer to "is there anything to save" — no comparison, no
 * timer, no stringify.
 *
 * Without it, `subscribe(save)` writes on every keystroke in the search box, because
 * typing changes the state object. Measured in demo 09: 14 writes to type "פפריקה".
 */
let lastSaved = null;

/**
 * Save the collection. Returns what happened, so the caller can say so on screen.
 *
 * ONLY `state.items`. The query, the sort, the category and `editingId` are all
 * either derivable or about this session, and a saved filter is the bug that reads
 * as "my data disappeared".
 *
 * @returns {'saved' | 'unchanged' | 'blocked' | 'full'}
 */
export function save(state) {
  if (!available) return 'blocked';
  if (state.items === lastSaved) return 'unchanged';

  try {
    localStorage.setItem(KEY, JSON.stringify({ v: VERSION, items: state.items }));
    lastSaved = state.items;
    return 'saved';
  } catch (error) {
    /*
     * QUOTA. `setItem` is the one call that fails on a healthy browser, and it fails
     * on the write that goes one byte over ~5MB per origin — which is not usually
     * this application's fault, because the quota is shared by every project on
     * 127.0.0.1.
     *
     * The name differs by browser (`QuotaExceededError` in Chromium and WebKit,
     * `NS_ERROR_DOM_QUOTA_REACHED` in Firefox), so the name is not what we branch on;
     * we branch on "the write failed", which is the only thing we actually know.
     *
     * WHAT MATTERS IS THAT IT IS VISIBLE. A silent `catch {}` here gives the user an
     * application that looks like it is saving and is not, and they find out when
     * they close the tab.
     */
    console.warn('[storage] write failed', error);
    return 'full';
  }
}

/**
 * THE SUBSCRIBER. `app.js` hands this to `subscribe()` once, and that one line is the
 * entire wiring of persistence.
 *
 * It saves, and then — only when the answer CHANGED — puts the problem into state so
 * that `render` can say something about it. Two questions people ask about this:
 *
 * DOES IT RECURSE? It calls `setState`, which notifies every subscriber, which calls
 * this function again. It terminates in one extra pass, by construction: the second
 * call computes the same `problem` that is now already in `state.storageError`, the
 * `!==` is false, and nothing further happens. On the happy path — `problem` is
 * `null` and `state.storageError` is already `null` — there is no second pass at all.
 *
 * WHY DOES STORAGE GET TO WRITE TO STATE? Because a failed write is an EVENT. This
 * layer is the only part of the application that talks to the world outside the tab,
 * and what came back is news. It reports it exactly the way events.js reports a
 * click: one `setState`, no drawing.
 */
export function persist(state) {
  const result = save(state);
  const problem = result === 'blocked' || result === 'full' ? result : null;
  if (problem !== state.storageError) setState({ storageError: problem });
}

/**
 * Delete this application's key entirely, so the next load behaves like a first visit.
 *
 * ── THIS IS NOT "CLEAR ALL", AND CONFUSING THE TWO IS THIS WEEK'S BEST BUG
 *
 * Emptying the user's collection means SAVING AN EMPTY COLLECTION. Deleting the key
 * means "this browser has never been here" — and an application that seeds demo data
 * on a first visit will helpfully put the demo data back. So a "clear all" button
 * wired to `removeItem` deletes forty real items, and after the next reload the six
 * fake ones are on screen. It passes every manual test, because nobody reloads
 * immediately after clearing.
 *
 * `removeItem` is therefore wired to the one control that MEANS "start over": the
 * offer to restore the demo data from the empty state.
 *
 * NOT `localStorage.clear()`, ever. That empties the whole ORIGIN — every other
 * project on 127.0.0.1, including the one being graded next week. It is one word
 * shorter and it is the most destructive line in this course.
 */
export function forget() {
  try {
    localStorage.removeItem(KEY);
    lastSaved = null;
    return true;
  } catch {
    return false;
  }
}

/** The key, for the parts of the UI that tell the user where their data lives. */
export const storageKey = KEY;
