/** One element, typed by the caller: `$<HTMLInputElement>('#q')`. */
export declare function $<T extends Element = Element>(selector: string, scope?: ParentNode): T;
/** The text in an input, trimmed. `#q` and `.value` meet in one place. */
export declare function inputText(selector: string): string;
/**
 * The row a click happened in, or null. `event.target` is `EventTarget | null` — an event
 * can come from something that is not an element — so ask at runtime, with `instanceof`:
 * the compiler narrows on the answer, and the answer is true. (Cycle 2's "you do".)
 */
export declare function rowOf(event: Event): HTMLElement | null;
