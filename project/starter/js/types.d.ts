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
}
export declare function isItem(value: unknown): value is Item;
