/**
 * The six cities. GIVEN. Do not change this file.
 *
 * The grader imports it as it is, and every check below assumes these six ids in this
 * order. Adding a seventh is not a bonus; it is a failing test.
 *
 * `id` is a stable string and never an array index — week 9's rule, and here it earns
 * its keep twice more: it is the cache key inside the payload, and it is what a
 * `data-city` attribute carries.
 */
export const CITIES = [
  { id: 'jerusalem', name: 'ירושלים', lat: 31.7683, lon: 35.2137 },
  { id: 'tel-aviv', name: 'תל אביב', lat: 32.0853, lon: 34.7818 },
  { id: 'haifa', name: 'חיפה', lat: 32.794, lon: 34.9896 },
  { id: 'beer-sheva', name: 'באר שבע', lat: 31.2518, lon: 34.7913 },
  { id: 'eilat', name: 'אילת', lat: 29.5577, lon: 34.9519 },
  { id: 'netanya', name: 'נתניה', lat: 32.3215, lon: 34.853 },
];

/**
 * WMO weather codes, in Hebrew. GIVEN.
 *
 * The endpoint answers with a number and this is the lookup for it. Note the `??` at
 * the point of use rather than a complete table: the standard has about a hundred codes
 * and this application will never see most of them, so an unknown one is a sentence
 * rather than `undefined` on the screen.
 */
export const WEATHER_CODES = {
  0: 'שמיים בהירים',
  1: 'בהיר בעיקר',
  2: 'מעונן חלקית',
  3: 'מעונן',
  45: 'ערפל',
  48: 'ערפל מקפיא',
  51: 'טפטוף קל',
  53: 'טפטוף',
  55: 'טפטוף חזק',
  61: 'גשם קל',
  63: 'גשם',
  65: 'גשם חזק',
  71: 'שלג קל',
  73: 'שלג',
  75: 'שלג חזק',
  80: 'ממטרים',
  81: 'ממטרים חזקים',
  82: 'ממטרים עזים',
  95: 'סופת רעמים',
  96: 'סופת רעמים עם ברד',
};
