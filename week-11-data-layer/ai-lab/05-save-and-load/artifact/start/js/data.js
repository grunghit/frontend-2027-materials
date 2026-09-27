/**
 * The six sample books. From week 11 they are NOT the collection the page starts with:
 * a first visit is an empty library, and these arrive only when somebody presses
 * "טען ספרים לדוגמה" (events.js). Six rather than three, because a search that narrows
 * and an order that changes are not visible on three rows.
 *
 *   id      never reused, and never a position in an array
 *   title   the book's name
 *   copies  how many the class library owns
 *   genre   one word from a small set — the list of genres is DERIVED from this array
 */
export const BOOKS = [
  { id: 'b1', title: 'המפה והים', copies: 2, genre: 'מסע' },
  { id: 'b2', title: 'אור בחלון', copies: 1, genre: 'רומן' },
  { id: 'b3', title: 'שעון החול', copies: 3, genre: 'מדע' },
  { id: 'b4', title: 'גשר על הירקון', copies: 1, genre: 'רומן' },
  { id: 'b5', title: 'כוכבים בצהריים', copies: 4, genre: 'מדע' },
  { id: 'b6', title: 'שביל החלב', copies: 2, genre: 'מסע' },
];
