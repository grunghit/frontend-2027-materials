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
/**
 * The row a click happened in, or null. `event.target` is `EventTarget | null` — an event
 * can come from something that is not an element — so ask at runtime, with `instanceof`:
 * the compiler narrows on the answer, and the answer is true. (Cycle 2's "you do".)
 */
export function rowOf(event) {
    if (!(event.target instanceof Element))
        return null;
    return event.target.closest('li[data-id]');
}
