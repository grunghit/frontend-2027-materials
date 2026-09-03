// `querySelector` returns `Element | null`, and both halves are in the way.
function readBox() {
  const box = document.querySelector('#query');
  return box.value; // two errors on one line
}

// One generic helper, one assertion, in a place you can find again.
function $<T extends Element = Element>(selector: string): T {
  const found = document.querySelector(selector);
  if (found === null) throw new Error(`no element matches ${selector}`);
  return found as T;
}

function readBoxProperly() {
  return $<HTMLInputElement>('#query').value; // compiles
}

// And the event half.
function wire(list: Element) {
  list.addEventListener('click', (event) => {
    const row = event.target.closest('li'); // `EventTarget | null` has no `closest`
    return row;
  });
}

// INTENTIONALLY UNCOMPILABLE — this file is a teaching example. Its diagnostics are
// captured by demos/capture-tsc.mjs and shown on the slides; tools/gates.mjs inverts the
// compile gate for it and reports if it ever starts compiling cleanly.
