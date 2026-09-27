/*
 * api.js — layer 5: the world outside.
 * No element and no setState: it asks, and it returns suggestions — or throws.
 *
 * WHY OPEN LIBRARY (cycle 3's "you do", the four questions, checked in the browser):
 *   no key?         yes — nothing to hide, nothing in the page source to leak
 *   open to CORS?   yes — access-control-allow-origin: * on the answer (Network tab)
 *   knows books?    yes — titles and first publication years
 *   one request?    yes — one search.json per search
 * BLOCKED: he.wikipedia.org/w/api.php without origin=* → TypeError: Failed to fetch,
 *   and the console says "blocked by CORS policy". With origin=* the header comes back.
 *   If I had to use an API that never sends it: a server of my own in the middle.
 */
const ENDPOINT = 'https://openlibrary.org/search.json';
const TIMEOUT_MS = 8000; // fetch has no timeout of its own, and never had one
const CATALOGUE = 'data/catalogue.json'; // relative to the PAGE, not to this file

/* A failure this layer understood, with the SENTENCE for the user already in it. */
export class CatalogueError extends Error {
  constructor(kind, sentence) {
    super(sentence);
    this.name = 'CatalogueError';
    this.kind = kind; // 'status' | 'shape' | 'timeout' | 'offline'
    this.sentence = sentence;
  }
}

/* The one place a catalogue answer becomes this application's shape. Take only what the
   page reads: every field copied is a field you now maintain, and it is somebody else's. */
function toSuggestions(body) {
  return (body.docs ?? []).map((doc) => ({ title: doc.title, year: doc.first_publish_year ?? null }));
}

export async function searchCatalogue(term) {
  const url = new URL(ENDPOINT); // never '?q=' + term: that breaks on the first '&'
  url.searchParams.set('q', term);
  url.searchParams.set('fields', 'key,title,first_publish_year');
  url.searchParams.set('limit', '8');
  let res;
  try {
    res = await fetch(url, { signal: AbortSignal.timeout(TIMEOUT_MS) });
  } catch (error) {
    if (error.name === 'TimeoutError') {
      throw new CatalogueError('timeout', 'הקטלוג לא ענה בזמן. נסה שוב, או חפש בקטלוג המקומי.');
    }
    throw new CatalogueError('offline', 'אין חיבור לקטלוג. אפשר לחפש בקטלוג המקומי.');
  }
  /* fetch rejects only when no answer arrived. A 404, a 422, a 500 ARE answers: the
     promise resolves, res.ok is false, and the body is an error document. */
  if (!res.ok) throw new CatalogueError('status', `הקטלוג החזיר שגיאה (${res.status}), ולכן אין תוצאות להציג.`);
  /* A second await, and a second thing that can fail: a 200 whose body is HTML (a Wi-Fi
     login page) passes res.ok and dies here. */
  let body;
  try {
    body = await res.json();
  } catch {
    throw new CatalogueError('shape', 'הקטלוג החזיר תשובה שאינה JSON.');
  }
  return toSuggestions(body);
}

/* THE OFFLINE PATH: a recorded answer of the same catalogue, shipped with the page, through
   the SAME toSuggestions — so the day the shape drifts, both paths drift together. It is
   still a fetch, and still checked: a renamed folder is a 404 here too. Served over http
   only — from file:// the page's own modules do not even load. */
export async function searchOffline(term) {
  const res = await fetch(CATALOGUE);
  if (!res.ok) throw new CatalogueError('status', 'הקטלוג המקומי לא נמצא.');
  const body = await res.json();
  const needle = term.trim().toLowerCase();
  return toSuggestions(body).filter((suggestion) => suggestion.title.toLowerCase().includes(needle));
}
