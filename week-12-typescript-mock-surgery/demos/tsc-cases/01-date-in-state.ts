// THE BUG FROM WEEK 11, AND THE ONE LINE THAT WOULD HAVE STOPPED IT.
// Everything below is real: `npx tsc --noEmit` produces the message the demo shows.
interface Item {
  id: string;
  title: string;
  created: string; // ISO 8601. Not a Date — it has to survive JSON.stringify.
}

function addItem(title: string): Item {
  return {
    id: crypto.randomUUID(),
    title,
    created: new Date(), // <- the week-11 bug, caught here instead of after a reload
  };
}

// INTENTIONALLY UNCOMPILABLE — this file is a teaching example. Its diagnostics are
// captured by demos/capture-tsc.mjs and shown on the slides; tools/gates.mjs inverts the
// compile gate for it and reports if it ever starts compiling cleanly.
