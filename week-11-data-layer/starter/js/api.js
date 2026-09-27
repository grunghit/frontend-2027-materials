/*
 * ============================================================================
 * api.js — LAYER 5, AND IT IS NEARLY EMPTY. This is the file you write today.
 *
 * ── WHAT THIS LAYER IS
 *
 * `storage.js` converts between ONE OBJECT and ONE STRING. This file converts between
 * ONE OBJECT and ONE HTTP RESPONSE. They are the same kind of file: both sit at a
 * boundary, both take something the outside world hands them and turn it into the shape
 * the rest of the application already believes in, and neither of them knows there is a
 * screen.
 *
 * ── THE PROHIBITIONS (a layer is defined by these, not by its contents)
 *
 *   · NO `document`. No element, no selector, no textContent. Same rule as state.js
 *     and storage.js.
 *   · NO `setState`. This file does not decide what is true — it answers a question.
 *   · NO `fetch` WITHOUT A CHECK OF `res.ok` ON THE NEXT LINE.
 *   · NO `fetch` WITHOUT A TIMEOUT.
 *   · NEVER RETURN A HALF-ANSWER. Either a real collection, or a thrown `ApiError`
 *     with a whole Hebrew sentence in it. A `return null` that means "something went
 *     wrong, work it out" cannot say whether it was a timeout or a 500 — and those two
 *     need two different sentences on the screen.
 *
 * ── THE FIVE FACTS THIS FILE IS BUILT FROM
 *
 *   1. `fetch` DOES NOT REJECT ON 404 OR 500. The promise RESOLVES and `res.ok` is
 *      false. It rejects for one reason only: the request never completed.
 *   2. THERE IS NO DEFAULT TIMEOUT. A request can hang for ever, and on a captive-
 *      portal wifi it does.
 *   3. AN ABORT IS NOT AN ERROR. Your caller cancels the previous search on every
 *      keystroke, and that cancellation arrives here as a rejection.
 *   4. A RESPONSE IS NOT DATA. `await res.json()` is a SECOND thing that can fail, and
 *      what comes out of it was written by somebody else's program.
 *   5. THE NETWORK IS ALLOWED TO BE ABSENT. Week 13's exam room has no internet.
 *
 * ── THE EXPORTS THIS FILE MUST HAVE, because the grader and your CI import them
 *
 *   ApiError                        an Error carrying `kind` and `messageHe`
 *   searchTitles(query, {signal})   the live search. Throws ApiError, or rethrows an
 *                                   AbortError UNCHANGED when the caller aborted.
 *   searchOffline(query)            the same search against the bundled catalogue.
 *
 * ── ABOUT `data/catalogue.json`
 *
 * IT IS A SAVED RESPONSE, BYTE FOR BYTE. Open it: it is exactly what the live endpoint
 * sent, twenty searches merged into one payload. That is deliberate, and it is what
 * the offline path (part ד) is built on: BOTH paths go through the SAME normaliser, so the offline path
 * exercises the same parser as the live one. A hand-written fixture in a nicer shape is
 * a second definition of the response — and the day it drifts from the real one, you
 * find out in the room with no wifi.
 *
 * When you swap in YOUR API, replace this file with one saved response from it. In
 * DevTools: Network tab, click the request, Response, copy, save.
 * ============================================================================
 */

/*
 * CODE HERE — the endpoint.
 *
 * The four questions to ask of any API before you build on it, and the vetted list in
 * the brief answers all four for a dozen of them:
 *
 *   no key?        A key in front-end JavaScript is a key you have published.
 *   CORS-open?     Does it answer with `access-control-allow-origin`? If not, NOTHING
 *                  you write in this file can fix it. See the brief, part ג.1.
 *   right data?    Does it actually know about your entity?
 *   one request?   Can you get everything you show in ONE round trip?
 */
const ENDPOINT = ''; // CODE HERE

/** The catalogue that ships with the application. GIVEN. */
const CATALOGUE = 'data/catalogue.json';

/**
 * How long to wait before giving up. GIVEN.
 *
 * FOUR SECONDS, AND THE NUMBER IS A TRADE-OFF RATHER THAN A FACT. Long enough for a
 * slow phone on a lecture-hall network; short enough that the user has not yet decided
 * the page is broken. With one retry the worst case a user waits is TWICE this plus the
 * backoff — which is the other half of the trade-off, and the reason the retry count is
 * 1 and not 3.
 */
const TIMEOUT_MS = 4000;

/**
 * Carries a sentence meant for a human, plus the machine detail for the console. GIVEN.
 *
 * `kind` exists so the caller can OFFER SOMETHING rather than only apologise: an
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
 * Turn ONE row of the response into one suggestion, or `null` if it cannot be used.
 *
 * Take only the fields you actually READ. Every field you copy into your own data is a
 * field you have promised to keep working, and this one is somebody else's schema.
 *
 * @param {unknown} row
 * @returns {{ title: string, note: string, url: string } | null}
 */
function toSuggestion(row) {
  // CODE HERE — guard the type, take the three fields, return null if unusable.
  return null;
}

/**
 * Turn a WHOLE payload — live or saved — into suggestions.
 *
 * ONE NORMALISER, TWO SOURCES: `searchTitles` and `searchOffline` both call this, and
 * that is the whole reason the bundled catalogue is a saved response.
 *
 * THE EMPTY CASE IS THE ONE THAT BITES. Find out what YOUR endpoint sends when nothing
 * matched — try it in the browser's address bar — and handle it here. Several APIs
 * (including the one in the brief's example) simply leave the results key OUT, so the
 * naive `payload.results.map(...)` throws a `TypeError` from inside a `try` that was
 * written for the network and does not cover it.
 *
 * "Nothing matched" is not an error and it is not a crash. It is an empty array.
 *
 * @param {unknown} payload
 * @returns {Array<{ title: string, note: string, url: string }>}
 * @throws {ApiError} only when the payload is not something this endpoint could produce
 */
function toSuggestions(payload) {
  // CODE HERE
  return [];
}

/**
 * Search the live catalogue.
 *
 * @param {string} query
 * @param {{ signal?: AbortSignal, retries?: number }} [options]
 * @returns {Promise<Array<{ title: string, note: string, url: string }>>}
 * @throws {ApiError} on timeout, network failure, an HTTP error status, or a body that
 *   is not the shape this endpoint documents.
 * @throws {DOMException} named `AbortError`, and ONLY when the CALLER aborted — see
 *   fact 3 in the header. Wrap that in an `ApiError` and your caller can no longer tell
 *   its own cancellation apart from a failure, which is a red panel per keystroke.
 *
 * ── THE FIVE STEPS
 *
 *   1. Build the URL with `new URL` and `searchParams.set`. NOT by concatenating
 *      strings: `'&q=' + term` works in every test until somebody types a `&`.
 *   2. One signal for two reasons to stop. `AbortSignal.timeout(TIMEOUT_MS)` gives you
 *      a `TimeoutError`; the caller's signal gives you an `AbortError`;
 *      `AbortSignal.any([a, b])` forwards whichever came first WITH ITS REASON — which
 *      is exactly what the `catch` needs to tell "too slow" from "you typed again".
 *   3. `await fetch`, then CHECK `res.ok` ON THE NEXT LINE.
 *   4. `await res.json()` — a second `await`, a second thing that can fail. A 200 whose
 *      body is an HTML login page throws HERE and not above.
 *   5. Normalise, and return.
 *
 * RESOLVING WITH AN EMPTY ARRAY AND THROWING ARE DIFFERENT OUTCOMES, and your caller
 * treats them differently: no results is the EMPTY state ("nothing matched"), a throw
 * is the ERROR state ("we could not ask"). Collapse them and you tell a user their
 * search found nothing when in fact the wifi is down.
 *
 * `retries` is part ז (the challenge). Ignore it until then — and when you get there, retry ONLY what a
 * retry could fix.
 */
export async function searchTitles(query, { signal, retries = 1 } = {}) {
  // CODE HERE
  return [];
}

/**
 * Search the catalogue that ships with the application.
 *
 * @param {string} query
 * @returns {Promise<Array<{ title: string, note: string, url: string }>>}
 * @throws {ApiError} when the bundled file is missing or is not what it should be
 *
 * THIS IS STILL A `fetch` AND IT IS STILL CHECKED. A local file is a request: it can
 * 404 because somebody renamed a folder, and under some dev servers a missing path
 * returns the whole of `index.html` with a 200. The one thing it cannot do is be slow,
 * so it needs no timeout and no retry.
 *
 * It is also the reason the page has to be opened through Live Server. Over `file://`
 * this one fails and nothing else in the application does.
 *
 * Match dumbly — a case-folded substring is right. Writing a scoring function here
 * would make the local results LOOK like live ones while behaving differently; the UI
 * says which source answered instead.
 */
export async function searchOffline(query) {
  // CODE HERE
  return [];
}
