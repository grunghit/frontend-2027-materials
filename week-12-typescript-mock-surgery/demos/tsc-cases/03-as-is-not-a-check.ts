interface Suggestion {
  title: string;
  url: string;
}

// `as` compiles. It checks nothing, and it is not a conversion.
function trustIt(payload: unknown): Suggestion {
  return payload as Suggestion; // compiles happily. `payload` may be a 404 document.
}

// The compiler DOES stop an assertion between unrelated types — which is why the
// "fix" people reach for next is `as unknown as T`, and why that is a smell.
function trustHarder(n: number): Suggestion {
  return n as Suggestion;
}

// INTENTIONALLY UNCOMPILABLE — this file is a teaching example. Its diagnostics are
// captured by demos/capture-tsc.mjs and shown on the slides; tools/gates.mjs inverts the
// compile gate for it and reports if it ever starts compiling cleanly.
