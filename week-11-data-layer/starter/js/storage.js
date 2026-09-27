/*
 * ============================================================================
 * storage.js — LAYER 4 OF 5. THE FIRST FILE OF THE WEEK (part א).
 *
 * A skeleton with a contract and no implementation. `app.js` already calls it —
 * `hydrate(load())` at boot and `subscribe(persist)` after — so the page runs today,
 * forgets everything on a reload, and starts working the moment these three functions
 * do what their comments say.
 *
 * ── THE CONTRACT: THE PROJECT'S RULES, AND THE ONE THE EXAM ADDS
 *
 * The project brief (requirements 14–16: rules 1–3 and 5–7 below) and the week-13
 * exam (which also needs rule 4 — the brief does not spell it out) read your storage the
 * same way, so write this file to their rules — you will copy it into `project/`:
 *
 *   1. ONE KEY, `<app>:v1`. Here `pantry:v1` (below). Every Live Server project on this
 *      machine shares http://127.0.0.1:5500 — ONE origin — so a key like `items` is one
 *      three of your own applications are already fighting over.
 *   2. THE VALUE IS THE ARRAY. `JSON.stringify(items)`, nothing wrapped around it.
 *   3. ONE READ PATH. Exactly one `getItem` call in this file, and it reads the
 *      collection.
 *   4. ABSENT IS EMPTY. No key = a browser that has never been here = `[]`. NOT the
 *      demo data: the samples arrive only from `#reset-demo` (events.js, given).
 *   5. VALID JSON IS NOT VALID DATA. Parse, then check it is an array, then keep the
 *      rows that are items and drop only the ones that are not.
 *   6. NEVER DELETE WHAT YOU COULD NOT READ. It is the only copy of the user's data.
 *   7. A FAILED WRITE IS SAID — in a sentence, which `render` already knows how to show
 *      (`#storage-note`, from `state.storageNote`).
 *
 * AND WHAT IS NOT HERE: no `document`, no element. This layer is the twin of state.js.
 * EVERY access to `localStorage` goes inside a `try` — the access, not only the parse:
 * `getItem` itself throws in a browser that blocks storage for this site.
 * ============================================================================
 */
import { setState } from './state.js';

/** The key — `<app>:v1`. Keep the shape; the name before the colon is yours. */
const KEY = 'pantry:v1';

/**
 * Read the collection. NEVER THROWS, and never returns `null`.
 *
 * @returns {{ items: Array<{id: string, title: string, number: number, category: string}>, reason: string | null }}
 *   `items` is always an array. `reason` is a Hebrew sentence when something was
 *   wrong, `null` when nothing was.
 *
 * FIVE CASES (cycle 2 typed all five on the library):
 *   getItem throws             blocked storage        → []  + a sentence
 *   getItem returns null       a first visit          → []  and NO sentence
 *   JSON.parse throws          not JSON               → []  + a sentence; the value STAYS
 *   parsed, not an array       `null`, `{"not":"an array"}` → []  + a sentence
 *   an array with a bad row    keep the good rows, drop the bad one, + a sentence
 */
export function load() {
  // CODE HERE
  return { items: [], reason: null };
}

/**
 * Write the collection — THE ARRAY, and only the array. Never throws, never lies.
 *
 * @returns {{ ok: boolean, reason: string | null }}
 *
 * `setItem` is the one call that fails on a healthy browser — over the quota. Do not
 * swallow it: an empty `catch {}` here is an application that looks like it saves and
 * does not. Return a sentence the user can act on.
 */
export function save(items) {
  // CODE HERE
  return { ok: false, reason: null };
}

/**
 * THE SUBSCRIBER. `app.js` already hands it to `subscribe()` — that one line is the
 * entire wiring of persistence. No handler calls it.
 *
 * It saves `state.items`, and when the sentence CHANGED it puts it in state
 * (`setState({ storageNote: … })`) so `render` can say it.
 *
 * TWO GUARDS, and cycle 1 typed both:
 *   · nothing to write when `state.items` is the array you wrote last time (keep it in a
 *     module-level variable) — otherwise every keystroke in the search box is a write;
 *   · `setState` ONLY WHEN THE SENTENCE CHANGED. `persist` → `setState` → every
 *     subscriber, `persist` included → `setState` → … Without this test the page dies
 *     with "Maximum call stack size exceeded" on the first click.
 */
export function persist(state) {
  // CODE HERE
}
