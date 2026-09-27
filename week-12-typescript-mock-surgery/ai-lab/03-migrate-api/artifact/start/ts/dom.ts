/*
 * dom.ts — the casting you actually need, written once.
 */

/** One element, typed by the caller: `$<HTMLInputElement>('#q')`. */
export function $<T extends Element = Element>(selector: string, scope: ParentNode = document): T {
  const found = scope.querySelector(selector);
  if (found === null) throw new Error(`nothing on the page matches ${selector}`);
  return found as T;
}

/** The text in an input, trimmed. `#q` and `.value` meet in one place. */
export function inputText(selector: string): string {
  return $<HTMLInputElement>(selector).value.trim();
}

/**
 * The row a click happened in, or null. `event.target` is `EventTarget | null` — an event
 * can come from something that is not an element — so ask at runtime, with `instanceof`:
 * the compiler narrows on the answer, and the answer is true. (Cycle 2's "you do".)
 */
export function rowOf(event: Event): HTMLElement | null {
  if (!(event.target instanceof Element)) return null;
  return event.target.closest<HTMLElement>('li[data-id]');
}
