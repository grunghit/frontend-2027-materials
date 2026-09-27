/**
 * warmup.js — five small functions, and four of them are wrong.
 *
 * TEN MINUTES. No git, no submission, no marks.
 *
 * All five are pieces of the network layer you are about to write, in miniature — and
 * all five are PURE: a value goes in, a value comes out, and not one of them touches
 * `fetch`, the DOM or the network. That is not a simplification for the exercise. It is
 * why a network layer is testable at all, and it is why `api.js` is a separate file.
 *
 * FOUR ARE WRONG AND ONE IS ALREADY CORRECT. "Change everything" is not a strategy.
 *
 * Read the JSDoc before you read the body. None of them is a syntax error, all five
 * run, and three of the four wrong ones do exactly what their comment says apart from
 * one word.
 */

/**
 * Given a response, say whether it is an answer or a refusal.
 *
 * @param {{ ok: boolean, status: number }} response
 * @returns {'ok' | 'error'}
 *
 * REMEMBER WHAT `fetch` DOES AND DOES NOT DO. It resolves for 404 and for 500 just as
 * happily as for 200 — the promise is about whether the request COMPLETED, not about
 * what the server said. So this is the check that has to exist, and `res.ok` is what it
 * is made of: true for 200-299, false for everything else.
 *
 * `status === 200` is NOT the same test. A 201 is a success, a 204 is a success, and
 * this course's own reference answer would reject both.
 */
export function classify(response) {
  return response.ok ? 'ok' : 'error';
}

/**
 * Turn a whole payload into the list of suggestions this application uses.
 *
 * @param {unknown} payload whatever came back from `res.json()`
 * @returns {Array<{ title: string }>}
 *
 * MUST NOT THROW, AND MUST NOT INVENT. Three cases and all three are normal:
 *
 *   { results: [ {...}, {...} ] }   ->  the two suggestions
 *   { results: [] }                 ->  an empty array
 *   {}                              ->  AN EMPTY ARRAY.
 *
 * The third one is the trap, and it is not hypothetical: a great many APIs answer a
 * search that matched nothing by leaving the results key OUT, rather than by sending it
 * empty. "Nothing matched" is not an error and it is not a crash.
 */
export function toSuggestions(payload) {
  return payload.results.map((row) => ({ title: row.title }));
}

/**
 * Did WE cancel this, or did it fail?
 *
 * @param {Error} error whatever the `catch` was given
 * @returns {boolean} true only when the caller aborted
 *
 * THREE THINGS CAN LAND IN THAT `catch` AND ONLY ONE OF THEM IS YOUR OWN DOING:
 *
 *   AbortError    you cancelled it — a newer search started. NOT a failure.
 *   TimeoutError  it took too long. A failure, and the user should be told.
 *   TypeError     the request never completed. A failure.
 *
 * The first two are BOTH `DOMException`s, so testing the class tells you nothing. Get
 * this wrong and your search panel goes red once per character typed, in a word that
 * works perfectly.
 */
export function isAbort(error) {
  return error instanceof DOMException;
}

/**
 * Wrap a function so that calling it many times quickly calls it ONCE, `ms` after the
 * last call, with the arguments of the LAST call.
 *
 * @param {Function} fn
 * @param {number} ms
 * @returns {Function}
 *
 * THIS IS WHAT STOPS ONE REQUEST PER KEYSTROKE. Typing a six-letter word should send
 * one request, not six, and the one it sends should be for the whole word.
 *
 * There is exactly one line missing below, and everything else is right.
 */
export function debounce(fn, ms) {
  let timer;
  return (...args) => {
    timer = setTimeout(() => fn(...args), ms);
  };
}

/**
 * Which of the five views the panel should be showing.
 *
 * @param {{ status: 'idle'|'loading'|'done'|'error', results: Array }} search
 * @returns {'idle' | 'loading' | 'error' | 'empty' | 'results'}
 *
 * FIVE, NOT FOUR. `idle` is "nobody has asked anything yet" and `empty` is "I asked and
 * there was nothing" — and they need different sentences on the screen, because one of
 * them sends the user to the search box and the other tells them the search box already
 * failed them.
 *
 * Collapse the two and every first-time visitor is greeted with "no results found" for
 * a search they never ran.
 */
export function viewOf(search) {
  if (search.status === 'loading') return 'loading';
  if (search.status === 'error') return 'error';
  return search.results.length === 0 ? 'empty' : 'results';
}
