/*
 * dom.ts — the casting you actually need, written once.
 */
/** One element, typed by the caller: `$<HTMLInputElement>('#q')`. */
export function $(selector, scope = document) {
    const found = scope.querySelector(selector);
    if (found === null)
        throw new Error(`nothing on the page matches ${selector}`);
    return found;
}
/** The text in an input, trimmed. `#q` and `.value` meet in one place. */
export function inputText(selector) {
    return $(selector).value.trim();
}
