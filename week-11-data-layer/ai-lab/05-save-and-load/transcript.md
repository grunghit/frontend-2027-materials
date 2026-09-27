# תמליל — "שמור ב-localStorage, וחפש ב-Open Library": שלושה מכשולים בשכבת נתונים אחת

model: claude-opus-5-5 · captured: 2026-09-27 · how: סשן הכתיבה של הקורס ב-Claude Code — אותו מודל עונה על P1 ועל P2 כפי שצ'אט היה עונה, עם הקבצים מ-`artifact/start/js/` מודבקים כהקשר. **זה אינו צילום מהצ'אט בדפדפן:** התשובות למטה נכתבו בסשן הכתיבה עצמו, על ידי המודל שכתב את השבוע. לפני השיעור: הרץ את P1 פעם אחת בצ'אט, והדבק את התשובה במקום זו שלמטה, עם התאריך. כל תשובה הודבקה כמו שהיא לתוך עותק של `artifact/start/` — `artifact/claude-p1/` ו-`artifact/claude-p2/` — וכל מספר בהערות נמדד ב-Chromium, על הקבצים האלה, כשכל בקשה ל-Open Library נענית בתשובה שהוקלטה מהשרת ב-27 בספטמבר 2026.

> **למה הקובץ הזה קיים.** פלט של מודל אינו דטרמיניסטי, ומודלים מתחלפים. המחזור רץ חי אם
> התשובה של החדר ל-P1 שוברת לפחות אחד משלושת הכללים של היום; אם החדר קיבל תשובה נקייה —
> פותחים את הקובץ הזה ומשווים. **ההשוואה בין מה שהחדר קיבל למה שכתוב כאן היא בעצמה השיעור.**
> ההערות המסומנות `> **מכשול**` הן של המרצה.

## You

יש לי אפליקציה של ספריית השאלה. שני דברים:
1. שהספרים יישמרו ב-localStorage, כדי שיהיו שם גם אחרי רענון.
2. שתיבת החיפוש עם id="cat-q" תחפש ספרים ב-Open Library תוך כדי הקלדה,
   ותציג את התוצאות ב-#cat-results.
הנה state.js, events.js ו-app.js.

`<js/state.js · js/events.js · js/app.js — מודבקים במלואם; הם הקבצים ב-artifact/start/js/>`

## Claude

בשמחה — שני הדברים יחד. אחלק את זה לשני קבצים קטנים חדשים ולכמה שורות בקבצים הקיימים.

**1. שמירה.** קובץ חדש, `js/storage.js`: טוען את מה שנשמר, ושומר — ומעדכן ב-state מתי נשמר
לאחרונה, כדי שתוכל להציג "נשמר" אם תרצה.

```js
// storage.js — saves the library in localStorage so it survives a reload
import { setState } from './state.js';

const KEY = 'books';

// Load the saved books (or null if nothing was saved yet)
export function load() {
  return JSON.parse(localStorage.getItem(KEY));
}

// Save the books, and record when we saved so the UI can show it
export function persist(state) {
  localStorage.setItem(KEY, JSON.stringify(state.books));
  setState({ savedAt: new Date().toISOString() });
}
```

כדי שכל שינוי יישמר אוטומטית ולא תצטרך לזכור לקרוא לשמירה בכל מטפל, הכי פשוט לשמור בתוך
`setState` — היא הדלת היחידה, אז שום שינוי לא יתפספס. ב-`state.js`: ה-import בראש הקובץ, שלושה
שדות חדשים ב-`initialState()` (אחרי `storageNote`), ושורה אחת בתוך `setState`:

```js
import { persist } from './storage.js';
```

```js
    suggestions: [],
    searchError: null,
    savedAt: null,
```

```js
export function setState(patch) {
  state = { ...state, ...patch };
  persist(state); // save on every change, so nothing is ever lost
  for (const listener of listeners) listener(state);
}
```

וב-`app.js`, מייבאים את `load`, וטוענים את מה שנשמר — ואם אין, את ספרי הדוגמה:

```js
import { load } from './storage.js';
```

```js
seed(load() ?? BOOKS);
```

> **מכשול 1 — `persist` בתוך `setState`, ו-`setState` בתוך `persist`.** "שום שינוי לא
> יתפספס" — נכון, וגם שום שינוי לא ייגמר: `setState` קוראת ל-`persist`, `persist` קוראת
> ל-`setState` כדי לרשום `savedAt`, וחוזר חלילה. נמדד על `artifact/claude-p1/`: **העמוד לא
> עולה** — 0 שורות, ובקונסול `RangeError: Maximum call stack size exceeded`, אחרי ש-`localStorage`
> נכתב **יותר מ-7,000 פעמים** בטעינה אחת (המספר המדויק משתנה מריצה לריצה). זה מחזור 1, צעד 3 — אותה טעות, בכתב יד
> אחר.

> **מכשול 2 — `JSON.parse` בלי `try`.** `load` מחזיר את מה ש-`JSON.parse` מחזיר, וזהו. נמדד:
> `{{{` במפתח `books` ← `SyntaxError` בשורה הראשונה של `app.js`, עוד **לפני** שהלולאה מתחילה,
> ו-0 שורות. ו-`{"not":"an array"}` היה עובר את ה-parse ונופל ב-`.map`. זה מחזור 2.

> **ועוד שניים, מחוזה הפרויקט:** המפתח `books` — לא `<app>:v1`, ושלושה פרויקטים שלך על אותו
> `127.0.0.1` כבר נלחמים עליו. ו-`load() ?? BOOKS` זורע כשהקריאה חוזרת ריקה — כלומר בשבוע 13,
> כשהקריאה תחזור ריקה בגלל התקלה, תראה שישה ספרי דוגמה ולא תדע ששום דבר לא נקרא.

**2. חיפוש ב-Open Library.** קובץ חדש, `js/api.js`:

```js
// api.js — searches the Open Library catalogue
export async function searchBooks(query) {
  const res = await fetch(`https://openlibrary.org/search.json?q=${query}&limit=8`);
  const data = await res.json();
  return (data.docs || []).map((doc) => ({ title: doc.title, year: doc.first_publish_year }));
}
```

ב-`events.js`, ה-import בראש הקובץ:

```js
import { searchBooks } from './api.js';
```

ובסוף `wire()`:

```js
  // Search Open Library as the user types
  const catQuery = document.querySelector('#cat-q');
  if (catQuery) {
    catQuery.addEventListener('input', async () => {
      try {
        const results = await searchBooks(catQuery.value);
        setState({ suggestions: results, searchError: null });
      } catch (error) {
        setState({ suggestions: [], searchError: 'Something went wrong' });
      }
    });
  }
```

וב-`render.js`, פונקציה שמציגה את התוצאות (לפני `render`):

```js
// Show the catalogue results
function renderSuggestions(state) {
  const list = document.querySelector('#cat-results');
  if (!list) return;
  list.replaceChildren(
    ...state.suggestions.map((s) => {
      const li = document.createElement('li');
      li.className = 'rounded-lg border border-edge bg-card p-3';
      li.textContent = `${s.title} (${s.year ?? '?'})`;
      return li;
    }),
  );
  const msg = document.querySelector('#cat-msg');
  if (state.searchError) msg.textContent = state.searchError;
  else if (document.querySelector('#cat-q').value && state.suggestions.length === 0) msg.textContent = 'לא נמצאו ספרים';
  else msg.textContent = '';
}
```

ושורה אחת בסוף `render(state)`, אחרי `renderNote(state);`:

```js
  renderSuggestions(state);
```

זהו. הספרים יישמרו בכל שינוי ויחזרו אחרי רענון, והחיפוש יעבוד תוך כדי הקלדה.

> **מכשול 3 — `fetch` בלי `res.ok`.** `await res.json()` מיד אחרי ה-`fetch`. נמדד: "ab" ←
> Open Library עונה **422** עם גוף JSON תקין (`{"detail":[{…"Query too short, must be at least 3
> characters"…}]}`) — `fetch` לא זורק, `data.docs` לא קיים, `|| []` הופך אותו לרשימה ריקה,
> ו-`searchBooks('ab')` **מסתיים בהצלחה עם `[]`**. העמוד היה אומר "לא נמצאו ספרים". הקטלוג סירב,
> והקוד לא שאל. זה מחזור 3, צעד 1.

> **ועוד אחד בדרך:** `?q=${query}` בשרשור. "rock & roll" נשלח כ-`q=rock%20&%20roll` — ה-`&`
> חתך את השאלה. ו-`render` קורא את `#cat-q` מהמסך כדי להחליט מה לכתוב — שבוע 10 אומר שלא.

## You

אותה אפליקציה, אותן שתי בקשות — עם הכללים האלה, וכל אחד מהם הוא דרישה:

אחסון, בקובץ חדש js/storage.js שלא נוגע ב-DOM:
1. המפתח הוא library:v1, והערך הוא מערך הספרים עצמו — JSON.stringify(books), בלי מעטפה.
2. load() לא זורק לעולם ולא מחזיר null: try סביב localStorage.getItem וסביב JSON.parse,
   Array.isArray, והשמטה של שורה שאינה ספר. הוא מחזיר { books, reason } — reason הוא משפט
   בעברית כשמשהו לא היה בסדר. קריאה אחת בלבד ל-getItem.
3. מפתח שאינו קיים הוא ספרייה ריקה. בלי נתוני דוגמה ב-app.js.
4. persist(state) הוא מנוי אחד — subscribe(persist) ב-app.js, ואף מטפל לא שומר.
   הוא לא כותב כשהמערך הוא זה שנכתב בפעם הקודמת, ו-setState בתוכו רק כשהמשפט השתנה.
   setState עצמה לא משתנה.

רשת, בקובץ חדש js/api.js שלא נוגע ב-DOM ולא קורא ל-setState:
5. הכתובת נבנית עם new URL ו-searchParams.
6. אחרי ה-fetch, בשורה הבאה, בדיקת res.ok. res.json() ב-try משלו. פסק זמן עם AbortSignal.timeout.
7. כל כישלון נזרק כשגיאה שנושאת משפט בעברית למשתמש.

תחזיר את הקבצים המלאים שמשתנים.

<js/state.js · js/events.js · js/render.js · js/app.js — מודבקים>

## Claude

הנה, לפי הכללים — שני קבצים חדשים במלואם, `app.js` במלואו, ומ-`state.js`, `events.js` ו-`render.js` רק מה שמשתנה, כדי שלא תקבל שלוש מאות שורות שכבר יש לך. `setState` לא נגעתי.

**`js/storage.js`** — מפתח `library:v1`, המערך עצמו, קריאה אחת, ו-`persist` עם שני שומרים:

```js
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
```

**`js/api.js`** — `new URL`, `res.ok` בשורה הבאה, `res.json()` ב-`try` משלו, פסק זמן, ומשפט לכל כישלון:

```js
/*
 * api.js — layer 5: the world outside.
 * No element and no setState: it asks, and it returns suggestions — or throws.
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
```

**`js/app.js`** — הדיסק קודם, לפני שמישהו מאזין; בלי נתוני דוגמה:

```js
/*
 * app.js — the entry point. Disk first, before anybody listens; then the screen and the
 * disk both follow every change. (P2's answer.)
 */
import { getState, hydrate, subscribe } from './state.js';
import { load, persist } from './storage.js';
import { render } from './render.js';
import { wire } from './events.js';

hydrate(load());
subscribe(render);
subscribe(persist);
wire();
render(getState());
```

**`js/state.js`** — שדה `search` אחד ב-`initialState()`, ו-`hydrate({ books, reason })` במקום `seed`:

```js
    storageNote: null, // a sentence from the storage layer, or null
    search: { term: '', status: 'idle', results: [], error: null },
```

```js
/* What came off disk, at boot: { books, reason } from load(). No seed — an empty
   array is an empty library; the samples come only from the button. */
export function hydrate({ books, reason }) {
  setState({ books: books.map((book) => ({ ...book })), storageNote: reason });
}
```

**`js/events.js`** — ה-import ועוזר אחד בראש הקובץ, ובתוך `wire()`, לפני כפתור הדוגמאות, המטפל של
התיבה: `loading` לפני ה-`await`, והמשפט של השגיאה אחריו:

```js
import { searchCatalogue } from './api.js';

/* One field for the search, replaced whole. */
const patchSearch = (patch) => setState({ search: { ...getState().search, ...patch } });
```

```js
  /* The catalogue box. No fetch here — api.js asks; this says what is true meanwhile. */
  const catQuery = document.querySelector('#cat-q');
  if (catQuery) {
    catQuery.addEventListener('input', async () => {
      const term = catQuery.value;
      if (term.trim() === '') {
        patchSearch({ term: '', status: 'idle', results: [], error: null });
        return;
      }
      patchSearch({ term, status: 'loading', results: [], error: null });
      try {
        patchSearch({ status: 'done', results: await searchCatalogue(term) });
      } catch (error) {
        patchSearch({ status: 'error', error: error.sentence ?? 'החיפוש נכשל. נסה שוב.' });
      }
    });
  }
```

**`js/render.js`** — התוצאות והמשפט נגזרים מ-`state.search` בלבד, ושורה אחת בסוף `render(state)`:

```js
/* The catalogue results, and one sentence — both from state.search, nothing read back
   from the page. */
function renderSuggestions(state) {
  const list = document.querySelector('#cat-results');
  if (!list) return;
  const { status, results, error } = state.search;
  list.replaceChildren(
    ...results.map((suggestion) => {
      const li = document.createElement('li');
      li.className = 'rounded-lg border border-edge bg-card p-3';
      li.textContent = `${suggestion.title} (${suggestion.year ?? '?'})`;
      return li;
    }),
  );
  const message = { loading: 'מחפש בקטלוג…', error: error ?? '' }[status];
  document.querySelector('#cat-msg').textContent =
    message ?? (status === 'done' && results.length === 0 ? 'לא נמצאו ספרים' : '');
}
```

```js
  renderSuggestions(state);
```

> **נמדד על `artifact/claude-p2/`:** עולה נקי לספרייה ריקה, עם ההצעה לטעון דוגמאות; דוגמאות, +1,
> בלי לולאה; הקלדת "שעון" ברשימה — **0 כתיבות**; רענון — שש שורות, והערך מתחיל ב-`[`; `{{{` במפתח
> ← עולה ריק, עם "מה שנשמר לא היה קריא…"; "ab" ← "הקטלוג החזיר שגיאה (422), ולכן אין תוצאות להציג.";
> "hobbit" ← 8 תוצאות. שלושת הכללים, ושני כללי החוזה, **כתובים בפרומפט** — וזה כל ההבדל בין P1 ל-P2.
