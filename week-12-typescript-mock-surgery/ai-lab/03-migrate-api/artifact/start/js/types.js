/*
 * types.ts — every shape this app passes around, and the checks that still run after
 * compiling. Written FIRST: everything else returns something described here.
 */
/** An object with string keys — and not null, and not an array. */
export function isRecord(value) {
    return typeof value === 'object' && value !== null && !Array.isArray(value);
}
/**
 * The guard. Types are gone after compiling; this is still there, because what is in
 * localStorage was written by an earlier version of the app and nobody checked it.
 */
export function isEntry(value) {
    if (!isRecord(value))
        return false;
    return (typeof value.id === 'string' &&
        typeof value.title === 'string' &&
        typeof value.added === 'string');
}
/**
 * A catalogue row the list can draw. Strict on what the list breaks without — an id, a
 * real title, the page count it divides — and tolerant on what it shows conditionally:
 * a missing year is `null`, and the row still shows. (Cycle 1's "you do".)
 */
export function isBook(value) {
    if (!isRecord(value))
        return false;
    return (typeof value.id === 'string' &&
        value.id !== '' &&
        typeof value.title === 'string' &&
        value.title !== '' &&
        typeof value.pages === 'number' &&
        typeof value.author === 'string' &&
        (value.year === null || typeof value.year === 'number'));
}
