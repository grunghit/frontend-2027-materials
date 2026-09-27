/*
 * storage.js — layer 4: the books leave memory.
 * It never touches the page. It turns the one array the application believes in into
 * the one string the browser is willing to keep, and back.
 */
import { setState } from './state.js';

/* <app>:v1 — the project's key shape: a name, a colon, the version of what is inside.
   Every Live Server project on this machine shares ONE origin, so `books` would be a key
   three of your applications are already fighting over. */
const KEY = 'library:v1';

/* Read the books. A key that is not there is a first visit: an EMPTY library, never the
   sample books. (Cycle 2 makes this survive a value it cannot read.) */
export function load() {
  const raw = localStorage.getItem(KEY);
  return raw === null ? [] : JSON.parse(raw);
}

/* Write the books — the array itself. A failed write returns a sentence, never nothing. */
export function save(books) {
  try {
    localStorage.setItem(KEY, JSON.stringify(books));
    return { ok: true, reason: null };
  } catch {
    return { ok: false, reason: 'השינוי לא נשמר בדפדפן הזה, ולא ישרוד רענון.' };
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
