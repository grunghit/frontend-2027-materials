/*
 * ============================================================================
 * api.js — LAYER 5. The application stops being the only program in the room.
 *
 * INSTRUCTOR MATERIAL, and the file students read after grading.
 *
 * READ IT LOOKING FOR THREE THINGS.
 *
 * The first is what is NOT here: no `document`, no element, no `setState`, no decision
 * about what the user sees. This layer is the twin of storage.js one step further out —
 * storage.js converts between one object and one string, and this file converts between
 * one object and one HTTP response. Neither of them knows there is a screen.
 *
 * The second is that IT NEVER RETURNS A HALF-ANSWER. Every path out of this file is
 * either a real collection or a thrown `ApiError` carrying a whole Hebrew sentence.
 * There is no `return null` that means "something went wrong, work it out" — because
 * the caller has to put a different sentence on the screen for a timeout than for a
 * 500, and a `null` cannot say which.
 *
 * The third is the ONE NORMALISER, TWO SOURCES rule. `toSuggestions` is called by the
 * live search and by the offline catalogue, and that is why `data/catalogue.json` is a
 * RECORDED RESPONSE rather than a tidied-up file: two sources that go through two
 * parsers are two shapes, and the day the offline one drifts you find out in the exam
 * room.
 *
 * ── THE FIVE THINGS THIS FILE EXISTS TO GET RIGHT
 *
 * 1. `fetch` DOES NOT REJECT ON 404 OR 500. The promise RESOLVES and `res.ok` is
 *    false. It rejects for one reason only: the request never completed — DNS, no
 *    route, CORS, or an abort. So every response is checked, always, and the check is
 *    the first thing after the `await`.
 * 2. A REQUEST WITH NO TIMEOUT CAN HANG FOR EVER. A captive-portal wifi accepts the
 *    connection and never answers; the spinner spins until somebody reloads. There is
 *    no default timeout in `fetch` and there never has been.
 * 3. AN ABORT IS NOT AN ERROR. The caller cancels the previous search on every
 *    keystroke, and that cancellation arrives here as a rejection. Reporting it as a
 *    failure puts a red panel on the screen once per character typed.
 * 4. A RESPONSE IS NOT DATA. `await res.json()` is a SECOND, separately failing step,
 *    and what comes out of it was written by somebody else's program. Normalise at the
 *    boundary and everything downstream can trust its input.
 * 5. THE NETWORK IS ALLOWED TO BE ABSENT. Week 13's exam room has no internet, so
 *    "the catalogue is unreachable" is a state this application is REQUIRED to handle
 *    well rather than a rainy-day branch. `searchOffline` is a feature, and it is
 *    OFFERED to the user rather than swapped in silently — a page that quietly shows
 *    local data while claiming to have searched the internet is lying to its user.
 * ============================================================================
 */

/**
 * The endpoint. Hebrew Wikipedia's MediaWiki API.
 *
 * WHY THIS ONE, and the four questions to ask of any API before you build on it:
 *
 *   no key           nothing to register for, nothing to leak in a public repository.
 *                    A key in front-end JavaScript is a key you have published.
 *   CORS-open        it answers with `access-control-allow-origin: *` — WHEN ASKED with
 *                    `origin=*` (below). Without that parameter the same URL sends no
 *                    header and the browser refuses: TypeError: Failed to fetch. Measured
 *                    in Chromium on 27 Sep 2026 (cycle 3's you-do; demo 07).
 *   Hebrew           the pantry's items are in Hebrew, so the catalogue has to be.
 *   one request      `generator=search` with `prop=extracts` returns the matches AND a
 *                    sentence about each, in one round trip. Two requests per keystroke
 *                    is twice the budget for no extra information.
 *
 * `origin=*` is MediaWiki's own switch for anonymous cross-origin requests. It is part
 * of the API, not a trick.
 */
const ENDPOINT = 'https://he.wikipedia.org/w/api.php';

/**
 * The catalogue that ships with the application.
 *
 * IT IS A SAVED RESPONSE, BYTE FOR BYTE — twenty searches from the live endpoint,
 * merged. Not a tidied-up list of names, and that is deliberate: it goes through
 * `toSuggestions` exactly as the live payload does, so the offline path exercises the
 * same parser as the live one. A hand-written fixture in a nicer shape is a second
 * definition of the response, and the day it drifts from the real one you find out in
 * the room with no wifi.
 */
const CATALOGUE = 'data/catalogue.json';

/**
 * How long to wait before giving up.
 *
 * FOUR SECONDS, AND THE NUMBER IS A TRADE-OFF RATHER THAN A FACT. Long enough for a
 * slow phone on a lecture-hall network; short enough that the user has not yet decided
 * the page is broken. Set it to 30 and a dead connection looks like a hang; set it to
 * 1 and a working connection looks like an outage.
 *
 * With one retry the worst case a user waits is TWICE this plus the backoff, which is
 * the other half of the trade-off and the reason the retry count is 1 and not 3.
 */
const TIMEOUT_MS = 4000;

/**
 * Carries a sentence meant for a human, plus the machine detail for the console.
 *
 * `kind` exists so the caller can OFFER something rather than only apologise: an
 * offline failure gets the local catalogue, a timeout gets "try again", and a 500 gets
 * neither, because neither would help.
 */
export class ApiError extends Error {
  /**
   * @param {'offline' | 'timeout' | 'status' | 'shape'} kind what went wrong, in one word
   * @param {string} messageHe a complete Hebrew sentence, safe to render as text
   * @param {string} detail what actually happened, for the console only
   */
  constructor(kind, messageHe, detail) {
    super(detail);
    this.name = 'ApiError';
    this.kind = kind;
    this.messageHe = messageHe;
  }
}

/**
 * Turn one page out of the response into a suggestion, or `null` if it cannot be used.
 *
 * THE RESPONSE HAS ELEVEN FIELDS AND THIS APPLICATION USES THREE. Taking only what you
 * read is not tidiness: every field you copy into your own data is a field you have
 * promised to keep working, and this one is somebody else's schema.
 *
 * `thumbnail` is deliberately NOT taken, even though every page has one. It points at
 * `upload.wikimedia.org`, so an "offline" catalogue that rendered it would fire a
 * network request per row in the exact situation the offline path exists for — and it
 * would do it in an exam room with no route out. The field stays in the saved payload,
 * because the payload is a real response; the parser ignores it.
 *
 * @param {unknown} page
 * @returns {{ title: string, note: string, url: string, index: number } | null}
 */
function toSuggestion(page) {
  if (page === null || typeof page !== 'object') return null;
  const title = typeof page.title === 'string' && page.title !== '' ? page.title : null;
  if (title === null) return null;

  /*
   * `extract` is the first sentence of the article, in plain text (`explaintext=1`).
   * A page can have none — a disambiguation page, or one whose lead is a table — and
   * an empty string is a real answer rather than a reason to drop the row.
   */
  const note = typeof page.extract === 'string' ? page.extract.trim() : '';

  return {
    title,
    note,
    /*
     * The payload carries no article URL, so it is BUILT from the title. That is safe
     * exactly once — here, at the boundary — and `encodeURIComponent` is not optional:
     * a Hebrew title is not ASCII, and a title with a space or a slash in it produces a
     * different page or no page at all.
     */
    url: `https://he.wikipedia.org/wiki/${encodeURIComponent(title.replace(/ /g, '_'))}`,
    /*
     * The order. `query.pages` IS AN OBJECT KEYED BY PAGE ID, and an object's keys are
     * not the search ranking — they are numbers, so the browser hands them back in
     * numeric order, which is roughly "oldest article first". The endpoint puts the
     * ranking in `index`, one field per page, and a client that ignores it shows the
     * best match fourth. This is what "the response's shape is not your shape" means in
     * practice.
     */
    index: Number.isFinite(page.index) ? page.index : Number.MAX_SAFE_INTEGER,
  };
}

/**
 * Turn a whole payload — live or saved — into suggestions.
 *
 * ONE NORMALISER, TWO SOURCES. See the file header.
 *
 * THE EMPTY CASE IS THE INTERESTING ONE. When nothing matched, this endpoint answers
 * `{"batchcomplete":""}` — a 200, valid JSON, and NO `query` KEY AT ALL. So
 * `payload.query.pages` throws `TypeError: Cannot read properties of undefined`, from
 * inside a `try` that was written for the network and does not cover it. "No results"
 * is not an error and it is not a crash: it is an empty array.
 *
 * @param {unknown} payload
 * @returns {Array<{ title: string, note: string, url: string, index: number }>}
 * @throws {ApiError} only when the payload is not something this endpoint could produce
 */
function toSuggestions(payload) {
  if (payload === null || typeof payload !== 'object') {
    throw new ApiError('shape', 'הקטלוג החזיר תשובה בפורמט לא מוכר.', `payload is ${payload}`);
  }

  /* Nothing matched. Not an error, and not a crash — an empty collection. */
  const pages = payload.query?.pages;
  if (pages === undefined) return [];

  if (typeof pages !== 'object' || pages === null) {
    throw new ApiError(
      'shape',
      'הקטלוג החזיר תשובה בפורמט לא מוכר.',
      `expected query.pages to be an object, got ${typeof pages}`,
    );
  }

  return Object.values(pages)
    .map(toSuggestion)
    .filter((suggestion) => suggestion !== null)
    .sort((a, b) => a.index - b.index);
}

/**
 * Wait, and stop waiting if the caller loses interest.
 *
 * A bare `setTimeout` in a promise is un-cancellable, so a 600ms backoff between two
 * attempts is 600ms during which an abort does nothing at all. Rejecting on the signal
 * is what makes the retry loop as responsive as the rest of the file.
 */
const sleep = (ms, signal) =>
  new Promise((resolve, reject) => {
    if (signal?.aborted) return reject(signal.reason);
    const timer = setTimeout(resolve, ms);
    signal?.addEventListener(
      'abort',
      () => {
        clearTimeout(timer);
        reject(signal.reason);
      },
      { once: true },
    );
  });

/**
 * Search the live catalogue.
 *
 * @param {string} query
 * @param {{ signal?: AbortSignal, retries?: number }} [options]
 * @returns {Promise<Array<{ title: string, note: string, url: string }>>}
 * @throws {ApiError} on timeout, network failure, an HTTP error status, or a body that
 *   is not the shape this endpoint documents.
 * @throws {DOMException} named `AbortError`, and ONLY when the CALLER aborted. See
 *   rule 3 in the header: the caller has to be able to tell its own cancellation apart
 *   from a failure, and wrapping it in an `ApiError` takes that away.
 *
 * RESOLVING WITH AN EMPTY ARRAY AND THROWING ARE DIFFERENT OUTCOMES, and the caller
 * treats them differently: no results is the EMPTY state ("nothing matched"), a throw
 * is the ERROR state ("we could not ask"). Collapsing the two is how an application
 * ends up telling a user that their search found nothing when in fact the wifi is down.
 */
export async function searchTitles(query, { signal, retries = 1 } = {}) {
  const term = query.trim();
  if (term === '') return [];

  const url = new URL(ENDPOINT);
  for (const [key, value] of Object.entries({
    action: 'query',
    format: 'json',
    origin: '*',
    generator: 'search',
    gsrsearch: term,
    gsrlimit: '6',
    prop: 'extracts',
    exintro: '1',
    explaintext: '1',
    exsentences: '1',
  })) {
    /*
     * `searchParams.set` percent-encodes for us. Building the query string by hand with
     * `+ '&gsrsearch=' + term` is the bug that works in every test until somebody types
     * a `&` or a `#`, at which point the rest of the term silently becomes a parameter
     * of its own.
     */
    url.searchParams.set(key, value);
  }

  let lastDetail = 'unknown';

  /*
   * ONE RETRY, AND ONLY FOR FAILURES A RETRY CAN PLAUSIBLY FIX — a dropped connection
   * or a timeout. A 404 retried is a 404 twice, and retrying a 500 in a tight loop is
   * how a client becomes part of somebody else's outage.
   */
  for (let attempt = 0; attempt <= retries; attempt += 1) {
    /*
     * TWO REASONS TO STOP, ONE SIGNAL.
     *
     * `AbortSignal.timeout` fires a `TimeoutError`; the caller's signal fires an
     * `AbortError`; `AbortSignal.any` forwards whichever came first, with its reason
     * intact — which is exactly what the `catch` below needs in order to tell "it took
     * too long" apart from "you typed another letter".
     *
     * The long way round, which is what an assistant usually writes, is a
     * `new AbortController()` plus a `setTimeout` that calls `controller.abort()` plus
     * a listener that forwards the caller's signal plus a `clearTimeout` in a `finally`.
     * It is the same thing in eleven lines, and the `clearTimeout` is the line people
     * leave out — a stray six-second timer holding an AbortController aborts a request
     * that has already succeeded, on a fast connection, about once in twenty tries.
     */
    const combined = signal
      ? AbortSignal.any([signal, AbortSignal.timeout(TIMEOUT_MS)])
      : AbortSignal.timeout(TIMEOUT_MS);

    try {
      const res = await fetch(url, { signal: combined });

      /*
       * RULE 1, AND IT IS THE FIRST LINE AFTER THE AWAIT ON PURPOSE. A 404 or a 500
       * arrives here as a perfectly ordinary resolved response with a body — usually an
       * error document, sometimes valid JSON. Parse it without asking and the failure
       * turns into a data bug three files away.
       *
       * Not retried: a status is an answer, and asking the same question again gets the
       * same answer.
       */
      if (!res.ok) {
        throw new ApiError(
          'status',
          `הקטלוג החזיר שגיאה (${res.status}). זה לא קרה בגלל משהו שהקלדת.`,
          `HTTP ${res.status} ${res.statusText} for ${url}`,
        );
      }

      /*
       * RULE 4. A SECOND await, and a second thing that can fail: a 200 whose body is an
       * HTML error page — which is what a hotel wifi's login portal returns — throws
       * here and not above.
       */
      let payload;
      try {
        payload = await res.json();
      } catch (error) {
        throw new ApiError(
          'shape',
          'JSON לא היה בתשובת הקטלוג. ייתכן שרשת ה-Wi-Fi מפנה אותך לעמוד התחברות.',
          error instanceof Error ? error.message : String(error),
        );
      }

      return toSuggestions(payload);
    } catch (error) {
      /* An ApiError is a decision that has already been made. Do not retry it and do
         not re-wrap it. */
      if (error instanceof ApiError) throw error;

      /*
       * RULE 3. The caller aborted. Rethrow it UNCHANGED — it is not this layer's news,
       * and the caller is the only code that knows whether it still cares.
       */
      if (error.name === 'AbortError') throw error;

      const timedOut = error.name === 'TimeoutError';
      lastDetail = error instanceof Error ? `${error.name}: ${error.message}` : String(error);

      if (attempt === retries) {
        throw new ApiError(
          timedOut ? 'timeout' : 'offline',
          timedOut
            ? 'החיפוש לקח יותר מדי זמן ובוטל. אפשר לנסות שוב, או לחפש בקטלוג המקומי.'
            : 'לא הצלחנו להגיע לקטלוג. בדוק את החיבור לרשת, או חפש בקטלוג המקומי.',
          lastDetail,
        );
      }

      /*
       * BACKOFF, and the reason it is not a fixed delay: when a service is struggling,
       * every client retrying after exactly 300ms arrives at the same moment and
       * finishes the job. Doubling spreads them out. The `abortable` sleep matters as
       * much as the doubling — a user who types another letter during the wait must not
       * have to sit through it.
       */
      await sleep(300 * 2 ** attempt, signal);
    }
  }

  /* Unreachable: the loop either returns or throws. Here so the shape is obvious. */
  throw new ApiError('offline', 'לא הצלחנו להגיע לקטלוג.', lastDetail);
}

/**
 * Search the catalogue that ships with the application.
 *
 * @param {string} query
 * @returns {Promise<Array<{ title: string, note: string, url: string }>>}
 * @throws {ApiError} when the bundled file is missing or is not what it should be
 *
 * THIS IS STILL A `fetch`, AND IT IS STILL CHECKED. A local file is a request: it can
 * 404 because somebody renamed the folder, and it returns the whole of `index.html`
 * with a 200 under some dev servers. The one thing it cannot do is be slow, which is
 * why it has no timeout and no retry.
 *
 * It is also the reason the page must be opened through Live Server. Over `file://`
 * this fetch fails with an opaque CORS error and nothing else in the application does —
 * which is week 1's rule arriving with a consequence attached.
 */
export async function searchOffline(query) {
  const term = query.trim();

  let payload;
  try {
    const res = await fetch(CATALOGUE);
    if (!res.ok) {
      throw new ApiError(
        'status',
        'הקטלוג המקומי לא נטען. ודא שהעמוד מוגש דרך Live Server ולא נפתח בלחיצה כפולה.',
        `HTTP ${res.status} for ${CATALOGUE}`,
      );
    }
    payload = await res.json();
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new ApiError(
      'offline',
      'הקטלוג המקומי לא נטען. ודא שהעמוד מוגש דרך Live Server ולא נפתח בלחיצה כפולה.',
      error instanceof Error ? error.message : String(error),
    );
  }

  const all = toSuggestions(payload);
  if (term === '') return all;

  /*
   * The matching is deliberately dumb — a case-folded substring over the title and the
   * sentence. The live endpoint does something far cleverer, and writing a scoring
   * function here would make the local results LOOK like live ones while behaving
   * differently. The UI says which source it used instead.
   */
  const needle = term.toLowerCase();
  return all.filter(
    (suggestion) =>
      suggestion.title.toLowerCase().includes(needle) ||
      suggestion.note.toLowerCase().includes(needle),
  );
}
