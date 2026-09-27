const CATALOGUE = 'data/books.json';
export class LookupError extends Error {
    constructor(kind, messageHe) {
        super(messageHe);
        this.name = 'LookupError';
        // @ts-ignore - kind is assigned at runtime
        this.kind = kind;
    }
}
export async function loadCatalogue() {
    let res;
    try {
        res = await fetch(CATALOGUE);
    }
    catch (error) {
        throw new LookupError('offline', 'הקטלוג לא נטען: אין חיבור.');
    }
    if (!res.ok)
        throw new LookupError('status', `הקטלוג החזיר שגיאה (${res.status}).`);
    const payload = await res.json();
    if (!Array.isArray(payload.books)) {
        throw new LookupError('shape', 'הקטלוג הגיע בפורמט לא מוכר.');
    }
    // The response is typed now, so every entry is a Book.
    const books = payload.books;
    return { books, skipped: 0 };
}
