/**
 * warmup.js — five small functions, and four of them are wrong.
 *
 * TEN MINUTES. No git, no submission, no marks.
 *
 * All five are pieces of the storage layer you are about to write, in miniature — and
 * all five are PURE: a value goes in, a value comes out, and not one of them touches
 * `localStorage` or the DOM. That is not a simplification for the exercise. It is why
 * a storage layer is testable at all.
 *
 * FOUR ARE WRONG AND ONE IS ALREADY CORRECT. "Change everything" is not a strategy.
 *
 * Read the JSDoc before you read the body. None of them is a syntax error, all five
 * run, and three of the four wrong ones do exactly what their comment says apart from
 * one word.
 */

/**
 * Parse a JSON string. Return the value it holds, or `null` if it is not JSON.
 *
 * MUST NOT THROW. Whatever is on disk was put there by an older version of this
 * application, by a different application that picked the same key, or by somebody
 * with the console open.
 *
 * @param {string} raw
 * @returns {unknown | null}
 */
export function parseSafely(raw) {
  return JSON.parse(raw);
}

/**
 * Given the raw string that came out of storage — or `null` if the key did not exist —
 * return the collection. ALWAYS AN ARRAY: the project's contract (week 11, cycle 2).
 *
 * FOUR ANSWERS, and one of them is easy to get wrong:
 *
 *   the key does not exist        -> [] — a first visit is an EMPTY collection
 *   the string is not JSON        -> []
 *   valid JSON, not an array      -> []  (null and {"not":"an array"} both parse)
 *   AN ARRAY WITH ONE BAD ROW     -> the GOOD rows. One old row costs that row, not
 *                                    the other forty.
 *
 * @param {string | null} raw
 * @returns {Array<object>}
 */
export function readCollection(raw) {
  if (raw === null) return null;
  const parsed = parseSafely(raw);
  if (!Array.isArray(parsed)) return [];
  return parsed.every(isItem) ? parsed : [];
}

/**
 * Turn a collection into the thing you hand to `localStorage.setItem`.
 *
 * REMEMBER WHAT setItem TAKES. Its second argument is coerced to a string, and there
 * is exactly one string every object in the world coerces to.
 *
 * The payload is THE ARRAY ITSELF — no envelope. The key (`<app>:v1`) carries the
 * version; the value is the collection.
 *
 * @param {Array<object>} items
 * @returns {string}
 */
export function toPayload(items) {
  return items;
}

/**
 * Is this thing an item we are willing to believe?
 *
 * Checks the fields the application actually reads, with the types it actually
 * assumes. Nothing more.
 *
 * @param {unknown} value
 * @returns {boolean}
 */
export function isItem(value) {
  return (
    value !== null &&
    typeof value === 'object' &&
    typeof value.id === 'string' &&
    value.id !== '' &&
    typeof value.title === 'string' &&
    Number.isFinite(value.number)
  );
}

/**
 * Return a NEW item with a creation timestamp on it. The original is not touched.
 *
 * THE TIMESTAMP HAS TO SURVIVE A ROUND TRIP THROUGH STORAGE. Whatever you put in this
 * field, `JSON.stringify` and `JSON.parse` will have their way with it — and what
 * comes back has to be the same KIND of thing that went in, or the code that reads it
 * tomorrow throws.
 *
 * @param {{id: string, title: string, number: number}} item
 * @returns {object} a new object
 */
export function stampCreated(item) {
  item.created = new Date();
  return item;
}
