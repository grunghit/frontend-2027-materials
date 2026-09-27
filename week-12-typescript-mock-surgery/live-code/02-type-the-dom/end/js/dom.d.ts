/** One element, typed by the caller: `$<HTMLInputElement>('#q')`. */
export declare function $<T extends Element = Element>(selector: string, scope?: ParentNode): T;
/** The text in an input, trimmed. `#q` and `.value` meet in one place. */
export declare function inputText(selector: string): string;
