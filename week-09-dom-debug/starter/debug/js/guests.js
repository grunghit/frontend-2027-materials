/**
 * The seed data. THIS FILE IS CORRECT — no fault is planted in it.
 *
 * Five guests. `seats` is a number in every one of them, which is worth remembering
 * when you look at what the form puts into a new guest.
 */
export const SEED_GUESTS = [
  { id: 'g1', name: 'דנה כהן', seats: 2, confirmed: true },
  { id: 'g2', name: 'יוסי לוי', seats: 1, confirmed: false },
  { id: 'g3', name: 'מיכל אברהם', seats: 3, confirmed: true },
  { id: 'g4', name: 'אורי שמש', seats: 2, confirmed: false },
  { id: 'g5', name: 'נועה בר', seats: 1, confirmed: false },
];

/** How many guests fit at the main table. Everyone after that is on the waiting list. */
export const MAX_SEATED = 3;
