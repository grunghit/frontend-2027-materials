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
