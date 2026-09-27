import type { Book, LookupKind } from './types.js';
export declare class LookupError extends Error {
    readonly kind: LookupKind;
    constructor(kind: LookupKind, messageHe: string);
}
/** What loadCatalogue() hands back: the rows it could read, and a count of the rest. */
export interface Catalogue {
    books: Book[];
    skipped: number;
}
export declare function loadCatalogue(): Promise<Catalogue>;
