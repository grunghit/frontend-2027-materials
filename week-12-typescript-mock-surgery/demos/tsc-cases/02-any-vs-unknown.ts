// `res.json()` is typed `Promise<any>` in the DOM lib. That is the whole problem.
async function withAny(res: Response) {
  const payload = await res.json();
  return payload.query.pages[0].title.toUpperCase(); // no complaint. On a 404 body.
}

async function withUnknown(res: Response) {
  const payload: unknown = await res.json();
  return payload.query.pages[0].title.toUpperCase(); // <- the compiler asks
}

// INTENTIONALLY UNCOMPILABLE — this file is a teaching example. Its diagnostics are
// captured by demos/capture-tsc.mjs and shown on the slides; tools/gates.mjs inverts the
// compile gate for it and reports if it ever starts compiling cleanly.
