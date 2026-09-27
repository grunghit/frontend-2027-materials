/**
 * The seed data. GIVEN — and the first thing you change.
 *
 * Replace these with items of YOUR entity, exactly as you did in week 9. The shape
 * grew by one field since then:
 *
 *   id        unique, never reused, and NEVER an array index (see the brief, part א)
 *   title     the thing's name
 *   number    whatever your entity counts — a year, a rating, a price, a quantity
 *   category  one word from a small set. It is what the filter control filters by,
 *             and the list of available values is DERIVED from this array rather
 *             than written down anywhere.
 *
 * Six items rather than three, because a search that narrows and a sort that reorders
 * are not observable on three rows.
 */
export const SEED_ITEMS = [
  { id: 'a1', title: 'קמח מלא', number: 2, category: 'יבשים' },
  { id: 'a2', title: 'שמן זית', number: 1, category: 'יבשים' },
  { id: 'a3', title: 'חלב שקדים', number: 4, category: 'קירור' },
  { id: 'a4', title: 'גבינה צהובה', number: 1, category: 'קירור' },
  { id: 'a5', title: 'פפריקה מעושנת', number: 3, category: 'תבלינים' },
  { id: 'a6', title: 'כמון טחון', number: 2, category: 'תבלינים' },
];
