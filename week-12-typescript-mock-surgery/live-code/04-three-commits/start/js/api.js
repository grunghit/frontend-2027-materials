/*
 * api.ts — the catalogue, from a file somebody else's program wrote.
 *
 * Two answers only: the books, or a LookupError that says which of three things went
 * wrong. What comes out of res.json() is `unknown` until isRecord and isBook have looked
 * at it — the same checks the JavaScript made, now required by the compiler.
 */
import { isBook, isRecord } from './types.js';
const CATALOGUE = 'data/books.json';
export class LookupError extends Error {
    kind;
    constructor(kind, messageHe) {
        super(messageHe);
        this.name = 'LookupError';
        this.kind = kind;
    }
}
export async function loadCatalogue() {
    let res;
    try {
        res = await fetch(CATALOGUE);
    }
    catch {
        throw new LookupError('offline', 'הקטלוג לא נטען: אין חיבור.');
    }
    if (!res.ok)
        throw new LookupError('status', `הקטלוג החזיר שגיאה (${res.status}).`);
    const payload = await res.json();
    if (!isRecord(payload) || !Array.isArray(payload.books)) {
        throw new LookupError('shape', 'הקטלוג הגיע בפורמט לא מוכר.');
    }
    const books = payload.books.filter(isBook);
    return { books, skipped: payload.books.length - books.length };
}
