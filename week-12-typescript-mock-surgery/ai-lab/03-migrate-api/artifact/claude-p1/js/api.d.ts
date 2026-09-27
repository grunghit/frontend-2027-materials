import type { Book, LookupKind } from './types.js';
export declare class LookupError extends Error {
    constructor(kind: LookupKind, messageHe: string);
}
export declare function loadCatalogue(): Promise<{
    books: Book[];
    skipped: number;
}>;
