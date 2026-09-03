/*
 * `readonly` costs one word and turns a whole family of bug into a compile error.
 *
 * The family: two things that were supposed to be separate turn out to share one object,
 * and a handler CHANGES that object instead of replacing it. The change then shows up on
 * both — and it shows up silently, because nothing was thrown and nothing was logged.
 */
interface Slot {
  readonly taken: boolean;
  readonly holder: string | null;
}

interface Seat {
  id: string;
  slot: Slot;
}

/* Reaching in and changing the fields. This is the version that compiles in JavaScript. */
function claim(seat: Seat, who: string) {
  seat.slot.taken = true;
  seat.slot.holder = who;
}

/* Replacing instead of changing. No error, and an aliased object cannot hurt anybody. */
function claimProperly(seat: Seat, who: string): Seat {
  return { ...seat, slot: { taken: true, holder: who } };
}

// INTENTIONALLY UNCOMPILABLE — this file is a teaching example. Its diagnostics are
// captured by demos/capture-tsc.mjs and shown on the slides; tools/gates.mjs inverts the
// compile gate for it and reports if it ever starts compiling cleanly.
