/*
 * api.js — the catalogue, from a file somebody else's program wrote.
 *
 * Two answers only: the books, or a LookupError that says which of three things went
 * wrong. Never a half-answer, and never a row nobody checked — `data/books.json` is an
 * export, and exports carry rows with a missing title.
 */
const CATALOGUE = 'data/books.json';

export class LookupError extends Error {
  /**
   * @param {'offline' | 'status' | 'shape'} kind what went wrong, in one word
   * @param {string} messageHe a whole Hebrew sentence, safe to show
   */
  constructor(kind, messageHe) {
    super(messageHe);
    this.name = 'LookupError';
    this.kind = kind;
  }
}

/* A row the list can draw: an id and a title that is really there. */
function isBook(value) {
  return (
    typeof value === 'object' &&
    value !== null &&
    typeof value.id === 'string' &&
    typeof value.title === 'string' &&
    value.title !== '' &&
    typeof value.pages === 'number'
  );
}

export async function loadCatalogue() {
  let res;
  try {
    res = await fetch(CATALOGUE);
  } catch {
    throw new LookupError('offline', 'הקטלוג לא נטען: אין חיבור.');
  }
  if (!res.ok) throw new LookupError('status', `הקטלוג החזיר שגיאה (${res.status}).`);

  const payload = await res.json();
  if (!Array.isArray(payload.books)) {
    throw new LookupError('shape', 'הקטלוג הגיע בפורמט לא מוכר.');
  }
  const books = payload.books.filter(isBook);
  return { books, skipped: payload.books.length - books.length };
}
