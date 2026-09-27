/** One book in the catalogue. `year` is there and may hold nothing. */
export interface Book {
    readonly id: string;
    title: string;
    author: string;
    year: number | null;
    pages: number;
}
/** One saved entry on the shelf. `added` is an ISO date string, never a Date. */
export interface ShelfEntry {
    readonly id: string;
    title: string;
    added: string;
}
/** Why the catalogue did not load. A union: it cannot be written as an interface. */
export type LookupKind = 'offline' | 'status' | 'shape';
/** An object with string keys — and not null, and not an array. */
export declare function isRecord(value: unknown): value is Record<string, unknown>;
/**
 * The guard. Types are gone after compiling; this is still there, because what is in
 * localStorage was written by an earlier version of the app and nobody checked it.
 */
export declare function isEntry(value: unknown): value is ShelfEntry;
/**
 * A catalogue row the list can draw. Strict on what the list breaks without — an id, a
 * real title, the page count it divides — and tolerant on what it shows conditionally:
 * a missing year is `null`, and the row still shows. (Cycle 1's "you do".)
 */
export declare function isBook(value: unknown): value is Book;
