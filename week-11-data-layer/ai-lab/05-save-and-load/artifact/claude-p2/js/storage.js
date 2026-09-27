/*
 * storage.js — layer 4: the books leave memory. (P2's answer — see transcript.md.)
 * It never touches the page. It turns the one array the application believes in into
 * the one string the browser is willing to keep, and back.
 */
import { setState } from './state.js';

/* <app>:v1 — the project's key shape: a name, a colon, the version of what is inside.
   Every Live Server project on this machine shares ONE origin, so `books` would be a key
   three of your applications are already fighting over. */
const KEY = 'library:v1';

/* Is this a book we are willing to believe? The four fields the page reads, with the
   types it assumes — and nothing more: a second full definition of a book would drift. */
const isBook = (value) =>
  value !== null &&
  typeof value === 'object' &&
  typeof value.id === 'string' &&
  typeof value.title === 'string' &&
  Number.isInteger(value.copies) &&
  typeof value.genre === 'string';

/* Read the books. It NEVER throws and never returns null: `books` is always an array,
   and `reason` is a sentence when something was wrong. ONE read path — one getItem —
   the project's rule, and the line the week-13 exam plants its fault on. */
export function load() {
  let text;
  try {
    text = localStorage.getItem(KEY); // the access itself throws when storage is blocked
  } catch {
    return { books: [], reason: 'הדפדפן חוסם שמירה באתר הזה, ולכן הספרייה לא תישמר.' };
  }
  if (text === null) return { books: [], reason: null }; // a first visit: EMPTY, not the samples

  let value;
  try {
    value = JSON.parse(text);
  } catch {
    /* Not JSON. Leave it on disk — it is the only copy of whatever the user had. */
    return { books: [], reason: 'מה שנשמר לא היה קריא, ולכן הספרייה נטענה ריקה. שום דבר לא נמחק.' };
  }
  /* Valid JSON is not valid data: null and {"not":"an array"} both parse. */
  if (!Array.isArray(value)) {
    return { books: [], reason: 'מה שנשמר לא היה רשימה, ולכן הספרייה נטענה ריקה.' };
  }
  /* Row by row: one old row costs that row, not the other forty. */
  const books = value.filter(isBook);
  const dropped = value.length - books.length;
  if (dropped === 0) return { books, reason: null };
  return {
    books,
    reason: dropped === 1 ? 'רשומה שמורה אחת לא הייתה ספר, והושמטה.' : `${dropped} רשומות שמורות לא היו ספרים, והושמטו.`,
  };
}

/* Write the books — the array itself. A failed write returns a sentence, never nothing. */
export function save(books) {
  try {
    localStorage.setItem(KEY, JSON.stringify(books));
    return { ok: true, reason: null };
  } catch (error) {
    /* A full quota is a sentence the user can act on; anything else is "not saved". */
    const full = error instanceof Error && error.name === 'QuotaExceededError';
    return {
      ok: false,
      reason: full ? 'אין מקום פנוי לשמירה. הסר ספרים כדי לפנות מקום.' : 'השינוי לא נשמר בדפדפן הזה, ולא ישרוד רענון.',
    };
  }
}

/* The last array written, by reference: handlers build NEW arrays, so `===` says exactly
   whether the books changed. Typing in the search box is not a change to save. */
let lastSaved = null;

/* THE SUBSCRIBER. app.js hands it to subscribe() once; no handler calls it. */
export function persist(state) {
  if (state.books === lastSaved) return;
  const result = save(state.books);
  if (result.ok) lastSaved = state.books;
  /* Only a CHANGE of the sentence is news. Without this test: persist -> setState ->
     persist -> setState -> ... "Maximum call stack size exceeded". */
  if (result.reason !== state.storageNote) setState({ storageNote: result.reason });
}
