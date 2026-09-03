type ErrorKind = 'offline' | 'timeout' | 'status' | 'shape';

function sentence(kind: ErrorKind): string {
  if (kind === 'offline') return 'no route out';
  if (kind === 'timeout') return 'took too long';
  if (kind === 'status') return 'they answered, badly';
  if (kind === 'shape') return 'not what we expected';
  return kind; // `never` here: every arm is covered, so nothing reaches this line
}

function typo(kind: ErrorKind): string {
  if (kind === 'timout') return 'took too long'; // <- one letter
  return '';
}

// INTENTIONALLY UNCOMPILABLE — this file is a teaching example. Its diagnostics are
// captured by demos/capture-tsc.mjs and shown on the slides; tools/gates.mjs inverts the
// compile gate for it and reports if it ever starts compiling cleanly.
