/**
 * The seed data. GIVEN — and the first thing you change.
 *
 * FROM THIS WEEK IT IS ONLY THE DEMO DATA. It is what a browser that has never been
 * here sees, once, and after the first change it is never read again. That is worth
 * saying because it changes what this file is for: it is no longer "the collection",
 * it is the empty-hands case.
 *
 * The shape grew by one field since week 10:
 *
 *   id        unique, never reused, never an array index — and now it must be unique
 *             across SESSIONS too, because yesterday's ids are still on disk.
 *   title     the thing's name
 *   number    whatever your entity counts
 *   category  one word from a small set, and the filter's option list is DERIVED
 *             from these rather than written anywhere
 *   created   AN ISO 8601 STRING. NOT a `Date`.
 *
 * ── WHY `created` IS A STRING, AND WHY THAT IS THE WHOLE LESSON IN ONE FIELD
 *
 * `JSON.stringify(new Date())` produces exactly this string, because `Date` has a
 * `toJSON` method. `JSON.parse` has no idea it was ever anything else and hands back
 * a string. So an application that keeps `Date` objects in state works perfectly —
 * until the first reload, and then `item.created.getFullYear is not a function` is
 * thrown from inside `render`, which is the last place anybody looks for a storage
 * bug.
 *
 * Store the string. Convert where you display it: `new Date(item.created)`, one line,
 * in render.js, and there is nowhere to forget it.
 */
export const SEED_ITEMS = [
  { id: 'a1', title: 'קמח מלא', number: 2, category: 'יבשים', created: '2026-09-01T08:00:00.000Z' },
  { id: 'a2', title: 'שמן זית', number: 1, category: 'יבשים', created: '2026-09-02T08:00:00.000Z' },
  {
    id: 'a3',
    title: 'חלב שקדים',
    number: 4,
    category: 'קירור',
    created: '2026-09-03T08:00:00.000Z',
  },
  {
    id: 'a4',
    title: 'גבינה צהובה',
    number: 1,
    category: 'קירור',
    created: '2026-09-04T08:00:00.000Z',
  },
  {
    id: 'a5',
    title: 'פפריקה מעושנת',
    number: 3,
    category: 'תבלינים',
    created: '2026-09-05T08:00:00.000Z',
  },
  {
    id: 'a6',
    title: 'כמון טחון',
    number: 2,
    category: 'תבלינים',
    created: '2026-09-06T08:00:00.000Z',
  },
];
