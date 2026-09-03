/*
 * ============================================================================
 * api.js — the network layer. One job: turn a search term into an array of your items.
 *
 * It knows about HTTP and about your endpoint's field names. It does not know what
 * your collection is, it never touches the DOM, and it never decides what the user
 * sees — it throws an `ApiError` carrying a Hebrew sentence and lets events.js put
 * that sentence into state.
 *
 * ── THE FOUR THINGS THIS FILE EXISTS TO GET RIGHT (brief, requirements 17–21)
 *
 * 1. `fetch` DOES NOT REJECT ON 404 OR 500. The promise RESOLVES; `res.ok` is false.
 *    A 500 treated as success produces a page rendering an error document's JSON, and
 *    the bug looks like a data bug rather than a network one.
 * 2. A REQUEST WITH NO TIMEOUT CAN HANG FOREVER. A captive-portal wifi accepts the
 *    connection and never answers, and the spinner spins until someone reloads.
 * 3. A RESPONSE IS NOT DATA. `await res.json()` is a second, separately failing step,
 *    and the endpoint's shape is not your application's shape. Normalising at the
 *    boundary means every file downstream can trust its input.
 * 4. THE NETWORK IS ALLOWED TO BE ABSENT. Week 13's exam room has no internet, so
 *    "the API is unreachable" is a state you are REQUIRED to handle well. The local
 *    fallback below is a real feature, and it is OFFERED to the user rather than
 *    swapped in silently — a page that quietly shows local data while claiming to
 *    have searched is lying to its user.
 * ============================================================================
 */

/**
 * Your endpoint, from section 5 of PROJECT_PLAN.md.
 *
 * It must be keyless, return JSON, and allow CORS. Verify all three IN A BROWSER
 * before you commit to it — `curl` sends no `Origin` header, so a server that only
 * emits `access-control-allow-origin` in response to one looks like it has no CORS
 * at all. The verified shortlist is in project-topics-he.md.
 */
const ENDPOINT = ''; // CODE HERE

/** The local catalogue that ships with your app. See `searchOffline`. */
const FIXTURE = 'data/catalogue.json';

const TIMEOUT_MS = 8000;

/** Carries a sentence meant for a human, plus the machine detail for the console. */
export class ApiError extends Error {
  /**
   * @param {string} messageHe a complete Hebrew sentence, safe to render
   * @param {string} detail what actually happened — console only, never the screen
   */
  constructor(messageHe, detail) {
    super(detail);
    this.name = 'ApiError';
    this.messageHe = messageHe;
  }
}

/**
 * Normalise ONE row of the response into one of your items.
 *
 * This is the only place the outside world gets in, and it is where the mapping from
 * their field names to yours lives. Your endpoint returns a dozen fields you do not
 * need; take the six from your plan and drop the rest.
 *
 * Return `null` for a row you cannot use. Dropping one of twenty-four rows is a
 * better trade than failing the whole search because one row has no title.
 *
 * Three things worth doing here rather than later:
 *   · Convert an id to a STRING. It ends up in a URL and in an object key, and both
 *     are strings — one conversion here stops `item.id === params.get('id')` from
 *     being false for two things that are obviously the same.
 *   · Take the year, not a Date. A Date does not survive
 *     `JSON.stringify`/`parse` as a Date; it comes back a string, which is a classic
 *     source of "why did my sort break after a reload".
 *   · Normalise an empty string to `null`. `<img src="">` re-requests the PAGE in
 *     some browsers, which is a wonderfully confusing thing to find in the Network tab.
 */
function toItem(row) {
  if (typeof row !== 'object' || row === null) return null;
  // CODE HERE — map their fields onto yours, and return null for a row you cannot use
  return null;
}

/**
 * Search the live endpoint.
 *
 * @throws {ApiError} on timeout, network failure, an HTTP error status, or a body
 *   that is not the shape the endpoint documents.
 *
 * RESOLVING WITH AN EMPTY ARRAY AND THROWING ARE DIFFERENT OUTCOMES, and the caller
 * treats them differently: no results is the `empty` state ("nothing matched"), a
 * throw is the `error` state ("we could not ask"). Collapsing the two is how an
 * application tells a user their search found nothing when the wifi is down — and
 * sends them to fix their spelling instead of their connection.
 */
export async function searchCatalogue(term, { retries = 1, timeoutMs = TIMEOUT_MS } = {}) {
  const query = term.trim();
  if (query === '') return [];

  /*
   * Build the URL with `URLSearchParams`, not string concatenation: it escapes the
   * term for you, so a search for "rock & roll" does not silently become two
   * parameters.
   */
  const url = new URL(ENDPOINT);
  // CODE HERE — set your endpoint's query parameters

  /*
   * One retry, and only for failures a retry can plausibly fix — a dropped connection
   * or a timeout. A 404 retried is a 404 twice, and retrying a 500 in a tight loop is
   * how a client becomes part of somebody else's outage.
   */
  for (let attempt = 0; attempt <= retries; attempt++) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const res = await fetch(url, { signal: controller.signal });

      // CODE HERE — check res.ok and throw an ApiError with the status in it.
      //             This is requirement 19 and it is one line. Do not skip it.

      const payload = await res.json();

      // CODE HERE — check the payload is the shape you expect, then map and filter:
      //             return payload.<field>.map(toItem).filter((item) => item !== null);
      return [];
    } catch (err) {
      if (err instanceof ApiError) throw err;

      /*
       * An abort arrives here as an `AbortError`. It is the timeout, so it gets the
       * timeout's message: "it is taking too long" and "there is no connection" send
       * the user to different places.
       */
      const aborted = err instanceof Error && err.name === 'AbortError';

      if (attempt === retries) {
        throw new ApiError(
          aborted
            ? 'החיפוש לקח יותר מדי זמן ובוטל. אפשר לנסות שוב, או לחפש בקטלוג המקומי.'
            : 'לא הצלחנו להגיע לשירות. בדוק את החיבור לרשת, או חפש בקטלוג המקומי.',
          err instanceof Error ? `${err.name}: ${err.message}` : String(err),
        );
      }
    } finally {
      /*
       * In `finally`, so the timer is cleared on the SUCCESS path too. A stray
       * 8-second timer holding an AbortController is a small leak with a nasty
       * symptom: it aborts a request that already succeeded, on a fast connection,
       * about once in twenty tries.
       */
      clearTimeout(timer);
    }
  }

  throw new ApiError('לא הצלחנו להגיע לשירות.', 'unreachable');
}

/**
 * Search the catalogue that ships with your application.
 *
 * This is what makes the app usable in the exam room, on a train, and in a lab whose
 * firewall does not like your endpoint. It is a `fetch` of a local file, so it is
 * still async and can still fail — and it is still checked.
 *
 * Keep the matching deliberately dumb: substring, case-folded. The live endpoint does
 * something far cleverer, and writing a scoring function here would make the offline
 * results LOOK like live ones while behaving differently. Say which source was used
 * in the UI instead.
 */
export async function searchOffline(term) {
  const query = term.trim().toLowerCase();

  let rows;
  try {
    const res = await fetch(FIXTURE);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const payload = await res.json();
    rows = Array.isArray(payload?.results) ? payload.results : null;
  } catch (err) {
    throw new ApiError(
      'הקטלוג המקומי לא נטען. ודא שהעמוד מוגש דרך Live Server ולא נפתח בלחיצה כפולה.',
      err instanceof Error ? err.message : String(err),
    );
  }

  if (!rows) {
    throw new ApiError(
      'הקטלוג המקומי לא בפורמט הנכון.',
      'expected { results: [] } in data/catalogue.json',
    );
  }

  const items = rows.map(toItem).filter((item) => item !== null);
  if (query === '') return items;

  // CODE HERE — filter `items` by `query` over the one or two fields that make sense
  return items;
}
