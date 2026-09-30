/*
 * ============================================================================
 * dom.ts — the two lines of casting you will actually need, written once.
 *
 * PART ד. This is the smallest useful generic in the course and it is the one you will
 * copy into every project you ever write.
 *
 * ── THE PROBLEM IT SOLVES
 *
 * `document.querySelector('#q')` has type `Element | null`. Two things are wrong with
 * that for the code you have already written:
 *
 *   · `Element` has no `.value`. `input.value` does not compile, even though the element
 *     really is an `<input>` and you really do know it.
 *   · `| null` is honest — the element may not be there — and it is honest on EVERY
 *     query, so an application with forty queries has forty `if (el === null)` branches
 *     nobody wants to write.
 *
 * The wrong fix is `as HTMLInputElement`, everywhere, which switches the compiler off at
 * exactly the boundary it was useful at. The right fix is one generic function that says
 * "I am asserting the type, once, in a place I can find again".
 * ============================================================================
 */

/**
 * Find one element, and say what it is.
 *
 * `<T extends Element>` reads: T is some element type, whichever the caller names.
 * `T = Element` is the default, so `$('main')` still works without a type argument.
 *
 *     const box = $<HTMLInputElement>('#query');
 *     box.value;                    // compiles, because T is HTMLInputElement
 *
 * @throws if the element is not there — because a missing element is a bug in the
 *         markup, not a value the caller should have to handle forty times.
 */
// CODE HERE {stretch} — the signature is above; the body is three lines
export function $<T extends Element = Element>(selector: string, root?: ParentNode): T {
  throw new Error('not implemented');
}

/**
 * Find every element, as a real array of a type you name.
 *
 * `querySelectorAll` returns a `NodeListOf<Element>`, which has `forEach` and nothing
 * else — no `map`, no `filter`. Spreading it once, here, is what lets the rest of the
 * application use the array methods from week 8 on the result.
 */
// CODE HERE {stretch}
export function $$<T extends Element = Element>(selector: string, root?: ParentNode): T[] {
  return [];
}

/**
 * The value of a text-like input, trimmed.
 *
 * One function, so `#query` is written once and `.value` is asserted once.
 */
// CODE HERE {stretch}
export function valueOf(selector: string): string {
  return '';
}

/*
 * ── ON TYPING THE EVENT, WHICH IS THE OTHER HALF OF THE CAST
 *
 * Inside a listener, `event.target` is `EventTarget | null`. Not an element, and
 * certainly not an input — because an event can be dispatched at things that are not
 * elements at all. So this does not compile:
 *
 *     list.addEventListener('click', (event) => {
 *       const row = event.target.closest('li');     // ✗ 'closest' does not exist
 *     });
 *
 * And this compiles and is a lie:
 *
 *     const row = (event.target as HTMLElement).closest('li');   // ✗ target may be null
 *
 * The honest version is a narrowing check, and it costs one line:
 *
 *     if (!(event.target instanceof Element)) return;
 *     const row = event.target.closest('li[data-id]');           // ✓ narrowed
 *
 * `instanceof` is a runtime test the compiler understands, which is the same trick as
 * `value is Item` in types.ts wearing a different hat. Use it in events.ts if you get
 * that far today; it is the stretch tier, not the core.
 */
