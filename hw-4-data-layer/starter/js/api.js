/*
 * ============================================================================
 * api.js — the network layer, and the second of the two files you write today.
 *
 * One job: a city goes in, a reading comes out.
 *
 * It knows about HTTP and about this endpoint's field names. It does not know what a
 * city is beyond two numbers, it never touches the DOM, it never touches the cache, and
 * it never decides what the user sees — it throws an `ApiError` with a Hebrew sentence
 * and lets the caller put that sentence on the screen.
 *
 * ── THE FIVE THINGS THIS FILE EXISTS TO GET RIGHT (week 11, again, on purpose)
 *
 * 1. `fetch` DOES NOT REJECT ON 404 OR 500. The promise resolves; `res.ok` is false.
 * 2. THERE IS NO DEFAULT TIMEOUT. A captive-portal wifi accepts the connection and
 *    never answers.
 * 3. AN ABORT IS NOT AN ERROR. `refreshAll` cancels everything when you press it twice.
 * 4. A RESPONSE IS NOT DATA. `await res.json()` is a second, separately failing step,
 *    and this endpoint's shape is not this application's shape.
 * 5. THE NETWORK IS ALLOWED TO BE ABSENT, and here the fallback is not a bundled file —
 *    it is THE CACHE. Which is the whole point of the assignment: an application with a
 *    data layer is usable on a train.
 * ============================================================================
 */

/**
 * Open-Meteo. No key, no account, `access-control-allow-origin: *`, and it answers in
 * JSON. Verified from this machine on 19 Aug 2026.
 *
 * `current=` asks for exactly the three fields this application draws. Asking for the
 * hourly forecast as well would be forty kilobytes to display three numbers.
 */
const ENDPOINT = 'https://api.open-meteo.com/v1/forecast';

/** Four seconds. Long enough for a slow phone, short enough to feel like a failure. */
const TIMEOUT_MS = 4000;

/** Carries a sentence meant for a human, plus the machine detail for the console. */
export class ApiError extends Error {
  /**
   * @param {'offline' | 'timeout' | 'status' | 'shape'} kind
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
 * Turn the response into THIS application's shape.
 *
 * NORMALISE AT THE BOUNDARY, and take only the fields you read. The payload has a dozen
 * more — `elevation`, `generationtime_ms`, `current_units` — and every one you copy into
 * your own data is a field you have promised to keep working, in somebody else's schema.
 *
 * `fetchedAt` is stamped HERE rather than by the cache, and that is deliberate: it is a
 * fact about the READING ("this is what it was at that moment"), not a fact about the
 * storage. Move it into `writeOne` and an entry that is displayed but not saved has no
 * age at all.
 *
 * @returns {{ fetchedAt: number, temperature: number, wind: number, code: number }}
 * @throws {ApiError} when the body is not the shape this endpoint documents
 */
function toReading(payload) {
  // CODE HERE — check the shape, take the three fields you draw, and stamp `fetchedAt`.
  //
  // Stamp it HERE and not in the cache: it is a fact about the READING, not about the
  // storage. Put it in `writeOne` and an entry that is shown but not saved has no age.
  throw new ApiError('shape', 'השירות ענה, אבל לא במבנה המצופה.', 'not implemented');
}

/**
 * Fetch the current weather for one city.
 *
 * @param {{ lat: number, lon: number }} city
 * @param {{ signal?: AbortSignal }} [options]
 * @returns {Promise<{ fetchedAt: number, temperature: number, wind: number, code: number }>}
 * @throws {ApiError} on timeout, network failure, an HTTP status, or a wrong shape
 * @throws {DOMException} named `AbortError`, and ONLY when the CALLER aborted — see
 *   rule 3. Wrapping it takes away the caller's ability to tell its own cancellation
 *   apart from a failure.
 */
export async function fetchWeather(city, { signal } = {}) {
  // CODE HERE — five steps, and none of them is skippable:
  //
  //   1. build the URL with `new URL` + `searchParams.set` (never string concatenation)
  //   2. ONE signal for TWO reasons to stop:
  //        AbortSignal.any([signal, AbortSignal.timeout(TIMEOUT_MS)])
  //      the caller's gives an AbortError, the timeout gives a TimeoutError, and `any`
  //      forwards whichever fired first WITH ITS REASON
  //   3. `await fetch`, and check `res.ok` on the NEXT line
  //   4. `await res.json()` in its OWN try — a 200 whose body is a wifi login page
  //      fails here and not above
  //   5. `toReading(payload)`
  //
  // And rethrow an AbortError UNCHANGED. Wrap it and your caller can no longer tell
  // its own cancellation apart from a failure.
  throw new ApiError('offline', 'אין חיבור לשירות מזג האוויר.', 'not implemented');
}
