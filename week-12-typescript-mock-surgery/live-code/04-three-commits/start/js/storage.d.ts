import type { ShelfEntry } from './types.js';
/** What load() hands back: the entries it could read, and a count of the rest. */
export interface Shelf {
    entries: ShelfEntry[];
    skipped: number;
}
export declare function load(): Shelf;
export declare function save(entries: readonly ShelfEntry[]): void;
