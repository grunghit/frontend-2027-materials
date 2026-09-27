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
