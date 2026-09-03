interface Suggestion {
  title: string;
}

// THE SIGNATURE PEOPLE WRITE FIRST. It compiles, and it is a lie: there is no `T` at
// runtime, so nothing here checks anything. Every caller gets a fully-typed object that
// may be an error document.
async function getJson<T>(url: string): Promise<T> {
  const res = await fetch(url);
  return res.json();
}

// THE HONEST ONE. The caller supplies the type AND the proof.
async function getChecked<T>(url: string, guard: (v: unknown) => v is T): Promise<T> {
  const res = await fetch(url);
  const body: unknown = await res.json();
  if (!guard(body)) throw new Error('the response is not what we asked for');
  return body;
}

function isSuggestion(value: unknown): value is Suggestion {
  return typeof value === 'object' && value !== null && typeof (value as Suggestion).title === 'string';
}

async function demo() {
  const a = await getJson<Suggestion>('/x');
  a.title.toUpperCase(); // compiles. May be undefined at runtime.
  const b = await getChecked('/x', isSuggestion);
  b.title.toUpperCase(); // compiles, AND something checked it.
}

// INTENTIONALLY UNCOMPILABLE — this file is a teaching example. Its diagnostics are
// captured by demos/capture-tsc.mjs and shown on the slides; tools/gates.mjs inverts the
// compile gate for it and reports if it ever starts compiling cleanly.
