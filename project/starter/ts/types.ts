/*
 * ============================================================================
 * types.ts — the shape of your item, and the guard that checks it at runtime.
 *
 * This is the project's ONE required TypeScript module (brief, requirements 22–24).
 * It compiles to js/types.js and the browser loads the OUTPUT, never this file:
 *
 *     npx tsc -p tsconfig.json          # from the project/ folder
 *
 * ── READ THE OUTPUT ONCE. IT IS THE POINT.
 *
 * Every `interface` and every `type` below vanishes in compilation. Open js/types.js
 * after your first build and you will find only `isItem` — the types are gone.
 *
 * That is the legacy line worth keeping — "TypeScript never changes the runtime
 * behavior of JavaScript code" — and it is exactly why requirement 23 asks for a
 * GUARD and not just types. Types describe what SHOULD be in localStorage. The guard
 * is the only thing that finds out what actually is. Storage cannot be type-checked,
 * because the value in it was put there by a previous version of your code, or by a
 * user with a console.
 *
 * ── ONE CONSTRAINT, AND IT IS NOT ARBITRARY
 *
 * `tsc --noEmit` is also run over this file WITHOUT this folder's tsconfig, using
 * tsc's default lib (ES5). So nothing here may use a post-ES5 library method:
 * `Array.prototype.includes`, `Object.entries`, `String.prototype.startsWith` are all
 * unavailable to that pass even though every browser has them. `typeof`,
 * `Array.isArray` and `indexOf` are fine — and the guard reads better for it.
 * ============================================================================
 */

/**
 * The four states every data-backed region must have.
 *
 * These are the state machine's real member names, not a slide's vocabulary — the
 * switch in render.js has one branch per arm, so adding a fifth state means adding it
 * here first. Leave this alone.
 */
export type LoadState = 'empty' | 'loading' | 'error' | 'success';

/** Where a set of results came from. Shown to the user, not just logged. */
export type ResultSource = 'live' | 'offline';

/**
 * ONE item in your collection.
 *
 * Fill this in from section 3 of your PROJECT_PLAN.md. Three rules:
 *
 *   · `id` is a `string`, even when your endpoint returns a number. It ends up in a
 *     URL and in an object key, and both are strings. Convert once, in api.js.
 *   · A field that can be absent is `| null`, never `0` and never `'unknown'`. An item
 *     with no year is not from the year zero, and it has to sort last in both
 *     directions.
 *   · A field you neither display nor filter by does not belong here. Fields added
 *     "just in case" are what make rendering miserable.
 */
export interface Item {
  id: string;
  // CODE HERE — your fields
}

/**
 * Does this look like one of your items?
 *
 * Be STRICT about the fields the UI would break without (`id`, and whatever you use
 * as a title) and TOLERANT about the ones you render conditionally. A guard that
 * rejects a whole item because its optional year is missing has thrown away data the
 * user could still have used.
 *
 * `isRecord` first: `typeof null === 'object'` and `typeof [] === 'object'`, so the
 * three-part check is not paranoia — it is the minimum.
 */
function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

export function isItem(value: unknown): value is Item {
  if (!isRecord(value)) return false;
  if (typeof value.id !== 'string' || value.id === '') return false;
  // CODE HERE — check the fields you cannot render without
  return true;
}

/*
 * A note on numbers you may need:
 *
 *   if (typeof n !== 'number' || n % 1 !== 0 || n < 0 || n > 5) return false;
 *
 * Check an integer in a RANGE, not membership of a literal union. A union like
 * `0 | 1 | 2 | 3 | 4 | 5` is a compile-time idea; by the time this function runs, all
 * that is left is a number that came out of somebody's localStorage.
 */
