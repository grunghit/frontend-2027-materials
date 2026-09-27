import type { Book, LookupKind } from './types.js';

const CATALOGUE = 'data/books.json';

export class LookupError extends Error {
  constructor(kind: LookupKind, messageHe: string) {
    super(messageHe);
    this.name = 'LookupError';
    // @ts-ignore - kind is assigned at runtime
    this.kind = kind;
  }
}

export async function loadCatalogue(): Promise<{ books: Book[]; skipped: number }> {
  let res: Response;
  try {
    res = await fetch(CATALOGUE);
  } catch (error: any) {
    throw new LookupError('offline', 'הקטלוג לא נטען: אין חיבור.');
  }
  if (!res.ok) throw new LookupError('status', `הקטלוג החזיר שגיאה (${res.status}).`);

  const payload: any = await res.json();
  if (!Array.isArray(payload.books)) {
    throw new LookupError('shape', 'הקטלוג הגיע בפורמט לא מוכר.');
  }
  // The response is typed now, so every entry is a Book.
  const books = payload.books as Book[];
  return { books, skipped: 0 };
}
