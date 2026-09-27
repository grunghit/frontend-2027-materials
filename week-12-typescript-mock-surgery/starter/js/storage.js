/*
 * ============================================================================
 * storage.js — LAYER 4 OF 5. The collection stops living in memory.
 *
 * INSTRUCTOR MATERIAL, and the file students read after grading.
 *
 * READ IT LOOKING FOR TWO THINGS.
 *
 * The first is what is NOT here: no `document`, no element, no decision about how
 * anything looks. This layer is the twin of state.js — it converts between the one
 * array the application believes in and the one string the browser is willing to
 * keep, and it knows nothing else.
 *
 * The second is that EVERY SINGLE ACCESS TO `localStorage` IS INSIDE A `try`. Not the
 * parse — the access. `localStorage.getItem` itself throws when the browser has
 * blocked storage for this origin ("block all cookies" in every browser today), and an
 * application whose first line of boot is an unguarded `getItem` does not render at
 * all in that browser.
 *
 * ── THE CONTRACT: THE PROJECT'S RULES, AND THE ONE THE EXAM ADDS
 *
 * The project brief (requirements 14–16: rules 1–3 and 5–7 below) and the week-13
 * exam (which also needs rule 4 — the brief does not spell it out) read your storage the
 * same way, so this file is written to their rules and not to taste:
 *
 *   1. ONE KEY, `<app>:v1`. Here `pantry:v1`. Every Live Server project on this
 *      machine shares http://127.0.0.1:5500 — ONE origin — so `items` is a key three
 *      of your own applications are already fighting over.
 *   2. THE VALUE IS THE ARRAY. `JSON.stringify(items)`, nothing wrapped around it.
 *   3. ONE READ PATH. Exactly one `localStorage.getItem(` in this file, and it reads
 *      the collection. The exam plants its version-ב fault on that line.
 *   4. ABSENT IS EMPTY. No key means a browser that has never been here, and its
 *      collection is `[]` — NOT the demo data. The demo data arrives only when the
 *      user asks for it (`#reset-demo`). A boot that seeds whenever the read comes
 *      back empty cannot tell "nothing saved" from "the read failed", and in week 13
 *      that is exactly the fault you are asked to find.
 *   5. VALID JSON IS NOT VALID DATA. Parse, THEN check that it is an array, THEN keep
 *      the rows that are items and drop only the ones that are not.
 *   6. NEVER DELETE WHAT YOU COULD NOT READ. It is the only copy of the user's data.
 *   7. A FAILED WRITE IS SAID. `save` returns a sentence; `persist` puts it in state;
 *      `render` shows it in `#storage-note`.
 * ============================================================================
 */
import { setState } from './state.js';

/**
 * The key. `<app>:v1` — the name of the application, a colon, and the version of the
 * SHAPE of what is inside. When the shape changes, new code reads `pantry:v2` and
 * simply does not see `pantry:v1`: an empty collection, which is recoverable. Reading
 * old data with new code is not.
 */
const KEY = 'pantry:v1';

/**
 * Is this thing an item we are willing to believe?
 *
 * Deliberately shallow: the four fields the application actually reads, with the
 * types it actually assumes. A validator that mirrors the whole schema is a second
 * definition of the item, and two definitions is the thing this course spends a
 * semester removing.
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
 * Read the collection. NEVER THROWS, and never returns `null`: `items` is always an
 * array, and `reason` is a Hebrew sentence when something was wrong, `null` when
 * nothing was.
 *
 * FIVE CASES, and the grader feeds you four of them:
 *
 *   getItem throws             blocked storage           []  + a sentence
 *   getItem returns null       a first visit             []  and no sentence
 *   JSON.parse throws          `{{{` — not JSON          []  + a sentence; the value STAYS
 *   parsed, not an array       `null`, `{"not":"an array"}`   []  + a sentence
 *   an array with a bad row    one old row among good ones   the good rows + a sentence
 *
 * @returns {{ items: Array<{id: string, title: string, number: number, category: string}>, reason: string | null }}
 */
export function load() {
  let raw;
  try {
    raw = localStorage.getItem(KEY);
  } catch {
    return { items: [], reason: 'הדפדפן חוסם שמירה מקומית באתר הזה, ולכן השינויים לא יישמרו.' };
  }

  /* A first visit. Not an error — and not a reason to invent a collection. */
  if (raw === null) return { items: [], reason: null };

  let parsed;
  try {
    parsed = JSON.parse(raw);
  } catch {
    /* Corrupt. LEAVE IT ALONE — the user has one copy of their data and a parse
       failure is the moment we understand it least. */
    return { items: [], reason: 'הנתונים השמורים לא היו קריאים, ולכן המזווה נטען ריק. שום דבר לא נמחק.' };
  }

  /* `JSON.parse('null')` is null and `JSON.parse('{"not":"an array"}')` is an object.
     Both calls SUCCEEDED; neither is a collection. */
  if (!Array.isArray(parsed)) {
    return { items: [], reason: 'הנתונים השמורים לא היו רשימה, ולכן המזווה נטען ריק.' };
  }

  /* Row by row, not all-or-nothing: one row written by an older version of this code
     costs that one row, not the other forty. */
  const items = parsed.filter(isItem);
  const dropped = parsed.length - items.length;
  return {
    items,
    reason:
      dropped === 0
        ? null
        : dropped === 1
          ? 'פריט שמור אחד לא היה בפורמט הנכון והושמט.'
          : `${dropped} פריטים שמורים לא היו בפורמט הנכון והושמטו.`,
  };
}

/**
 * Write the collection — THE ARRAY, and only the array. Never throws, never lies:
 * `ok: false` means the screen and the disk have diverged, and `reason` says so.
 *
 * `setItem` is the one call that fails on a healthy browser — when the write goes over
 * the ~5 MB per origin, which is shared by every project on 127.0.0.1.
 *
 * @returns {{ ok: boolean, reason: string | null }}
 */
export function save(items) {
  try {
    localStorage.setItem(KEY, JSON.stringify(items));
    return { ok: true, reason: null };
  } catch (error) {
    /* The name differs by engine (`QuotaExceededError`, `NS_ERROR_DOM_QUOTA_REACHED`),
       so it is matched loosely; everything else is one sentence: it did not save. */
    console.warn('[storage] write failed', error);
    const quota = error instanceof Error && /quota/i.test(error.name);
    return {
      ok: false,
      reason: quota
        ? 'אין מקום פנוי לשמירה, והשינוי האחרון לא נשמר. הסר פריטים כדי לפנות מקום.'
        : 'הדפדפן לא מאפשר לשמור באתר הזה, ולכן השינוי לא ישרוד רענון.',
    };
  }
}

/**
 * The last collection we wrote, by REFERENCE.
 *
 * Handlers build NEW arrays instead of editing the one in state (week 10), so
 * `state.items` is a different array exactly when the collection changed, and `===`
 * is an exact answer to "is there anything to save". Without it, every keystroke in
 * the search box is a synchronous write to disk: typing changes the state object, and
 * `persist` is subscribed to every change.
 */
let lastSaved = null;

/**
 * THE SUBSCRIBER. `app.js` hands it to `subscribe()` once, and that one line is the
 * entire wiring of persistence. No handler calls it, and no handler has to remember.
 *
 * TWO GUARDS, AND THE SECOND ONE IS WHY THIS DOES NOT LOOP FOREVER.
 *
 *   `state.items === lastSaved`   nothing to write — the search box, the sort, the
 *                                 form's mode. This is the write budget.
 *   `reason !== state.storageNote` `persist` calls `setState`, and `setState` calls
 *                                 every subscriber — including `persist`. Calling it
 *                                 unconditionally is `persist` → `setState` →
 *                                 `persist` → … until "Maximum call stack size
 *                                 exceeded". Only a CHANGE of the sentence is news;
 *                                 the second pass finds the same sentence already in
 *                                 state and stops.
 */
export function persist(state) {
  if (state.items === lastSaved) return;
  const result = save(state.items);
  if (result.ok) lastSaved = state.items;
  if (result.reason !== state.storageNote) setState({ storageNote: result.reason });
}
