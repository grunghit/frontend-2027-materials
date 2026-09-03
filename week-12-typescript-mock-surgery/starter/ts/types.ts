/*
 * ============================================================================
 * types.ts — the shape of your item, and the guard that checks it at runtime.
 *
 * THE FIRST FILE. Write this one before you touch api.ts: everything there returns
 * something described here, and a migration that starts at the network end spends its
 * first ten minutes inventing names it then has to change.
 *
 *     npx tsc -p tsconfig.json          # from the folder above this one
 *
 * ── READ THE OUTPUT ONCE, TODAY. IT IS THE POINT.
 *
 * Every `interface` and every `type` below VANISHES in compilation. Open js/types.js
 * after your first build and count what is left: the guards, and nothing else.
 *
 * That is the legacy line worth keeping — *"TypeScript never changes the runtime
 * behaviour of JavaScript code"* — and it is exactly why part ב asks for a GUARD and
 * not only for types. Types describe what SHOULD be in localStorage and what SHOULD
 * come back from the API. The guard is the only thing that finds out what actually did.
 * ============================================================================
 */

/**
 * The four answers a request can be in, as ONE field with four values.
 *
 * A union of string literals, not `string`. That is the difference between a field the
 * compiler can check every branch of and a field that accepts `'loadng'`.
 */
export type RequestStatus = 'idle' | 'loading' | 'done' | 'error';

/**
 * Why a request failed. The caller puts a different sentence on screen for each, which
 * is exactly why this is a union and not a `string`.
 */
// CODE HERE — the four kinds api.js already throws. Look at ApiError in js/api.js.
export type ErrorKind = never;

/**
 * ONE item in your collection.
 *
 * Copy the field names from `js/items.js` — they already exist and the rest of the
 * application already uses them. Three rules:
 *
 *   · `id` is a `string`, even if something upstream gives you a number. It ends up in
 *     `dataset.id`, and `dataset` is always strings.
 *   · `created` is a `string` — an ISO 8601 one. NOT a `Date`. A `Date` does not survive
 *     `JSON.stringify` as a `Date`, and js/items.js says so at length.
 *   · A field that can be absent is `| null`, never `0` and never `'unknown'`.
 */
export interface Item {
  id: string;
  // CODE HERE — your fields
}

/**
 * ONE suggestion, as it comes back from your API AFTER normalisation.
 *
 * This is the shape `toSuggestion` produces, not the shape your endpoint sends. The
 * endpoint's shape is somebody else's and it belongs in api.ts, described once, right
 * where the response is opened.
 */
export interface Suggestion {
  // CODE HERE — what a row in the suggestions list actually needs
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

/**
 * Does this look like one of your items?
 *
 * `isRecord` first: `typeof null === 'object'` and `typeof [] === 'object'`, so the
 * three-part check is not paranoia — it is the minimum.
 *
 * Be STRICT about the fields the UI would break without and TOLERANT about the ones you
 * render conditionally. A guard that rejects a whole item because one optional field is
 * missing has thrown away data the user could still have used.
 *
 * The `value is Item` return type is what makes this worth writing: after
 * `if (isItem(x))`, the compiler treats `x` as an `Item` for the rest of the block. That
 * is NARROWING, and it is the only bridge from `unknown` to a type that the compiler
 * accepts.
 */
export function isItem(value: unknown): value is Item {
  if (!isRecord(value)) return false;
  if (typeof value.id !== 'string' || value.id === '') return false;
  // CODE HERE — check the fields you cannot render without
  return true;
}
