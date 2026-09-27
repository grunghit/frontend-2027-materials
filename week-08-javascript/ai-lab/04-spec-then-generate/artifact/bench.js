/*
 * bench.js — GIVEN. Runs `filterAndSort` through the cases of specs/filter-and-sort.md.
 *
 * It builds the rows with document.createElement and textContent — week 9's material, and
 * nothing here is graded. What matters is WHAT it checks: for every case, the value the
 * function returned AND the order of the array it was handed, before and after the call.
 * A function can return the right list and still have reordered yours; that is a red row.
 */
const FILES = {
  mine: './filter-and-sort.js',
  'claude-p1': './claude-p1/filter-and-sort.js',
  'claude-p2': './claude-p2/filter-and-sort.js',
};
const asked = new URLSearchParams(location.search).get('impl') ?? 'mine';
const key = Object.hasOwn(FILES, asked) ? asked : 'mine';

/* A fresh list for every case, so one case cannot hide what another one did. */
const books = () => [
  { title: 'The Hobbit', year: 1937 },
  { title: 'מיכאל שלי', year: 1968 },
  { title: 'dune', year: 1965 },
  { title: 'Field notes', year: null },
  { title: 'Emma', year: 1815 },
];
const withNoTitle = () => [...books(), { title: null, year: 2001 }];

/* The line of the spec each case comes from — quoted, so a red row reads back to it. */
const SPEC = {
  s2: '§2 — books לעולם לא מסודר מחדש: הפונקציה קוראת אותו ומחזירה מערך חדש, בכל מסלול',
  s5a: '§5 — חיפוש ריק, או רווחים בלבד: כל הספרים, בסדר שבו הגיעו',
  s5b: '§5 — אותיות גדולות וקטנות, רווחים מסביב: לא משנים',
  s5c: '§5 — ספר בלי כותרת: לא מפיל את הרשימה, ולא נמצא בשום חיפוש',
  s5d: '§5 — מיון לפי שנה: ספר בלי שנה אחרון, לא כשנת 0',
  s5e: "§5 — מיון לפי שם, עברית ואנגלית יחד: localeCompare(…, 'he')",
  s5f: '§5 — מפתח מיון לא מוכר: הרשימה המסוננת, בסדר שבו הגיעה',
  s6: '§6 — מקליד the: נשאר The Hobbit',
};

const CASES = [
  { name: 'a search', query: 'the', sort: 'none', want: ['The Hobbit'], spec: 's6' },
  { name: 'the empty query', query: '', sort: 'none', want: 'all', spec: 's5a' },
  { name: 'only spaces', query: '   ', sort: 'none', want: 'all', spec: 's5a' },
  { name: 'capitals and spaces', query: ' DUNE ', sort: 'none', want: ['dune'], spec: 's5b' },
  {
    name: 'a book with no title',
    query: 'e',
    sort: 'none',
    list: withNoTitle,
    want: ['The Hobbit', 'dune', 'Field notes', 'Emma'],
    spec: 's5c',
  },
  {
    name: 'no query, sorted by year',
    query: '',
    sort: 'year',
    want: ['Emma', 'The Hobbit', 'dune', 'מיכאל שלי', 'Field notes'],
    spec: 's5d',
  },
  {
    name: 'no query, sorted by title',
    query: '',
    sort: 'title',
    want: ['מיכאל שלי', 'dune', 'Emma', 'Field notes', 'The Hobbit'],
    spec: 's5e',
  },
  {
    name: 'a search, sorted by year',
    query: 'e',
    sort: 'year',
    want: ['Emma', 'The Hobbit', 'dune', 'Field notes'],
    spec: 's5d',
  },
  { name: 'an unknown sort key', query: 'o', sort: 'rating', want: ['The Hobbit', 'Field notes'], spec: 's5f' },
];

const same = (a, b) => JSON.stringify(a) === JSON.stringify(b);
const list = (titles) => `[${titles.map((t) => (t === null ? 'null' : t)).join(', ')}]`;

function run(filterAndSort, c) {
  const handed = (c.list ?? books)();
  const before = handed.map((b) => b.title);
  let got = null;
  let error = null;
  try {
    got = filterAndSort(handed, c.query, c.sort);
  } catch (err) {
    error = `${err.name}: ${err.message}`;
  }
  const after = handed.map((b) => b.title);
  const want = c.want === 'all' ? before : c.want;
  const titles = Array.isArray(got) ? got.map((b) => b.title) : null;
  return {
    returned: error === null && titles !== null && same(titles, want),
    kept: same(before, after),
    error,
    titles,
    want,
    after,
  };
}

function line(text, className, lang) {
  const p = document.createElement('p');
  p.textContent = text;
  if (className) p.className = className;
  if (lang) {
    p.lang = lang;
    p.dir = 'rtl';
  }
  return p;
}

function paint(filterAndSort) {
  const mount = document.querySelector('#cases');
  let passed = 0;
  for (const c of CASES) {
    const r = run(filterAndSort, c);
    const ok = r.returned && r.kept;
    if (ok) passed += 1;

    const li = document.createElement('li');
    li.className = ok ? 'case' : 'case fail';
    li.dataset.case = c.name;
    const h = document.createElement('h2');
    h.textContent = c.name;
    li.append(h, line(`filterAndSort(books, ${JSON.stringify(c.query)}, ${JSON.stringify(c.sort)})`));

    if (r.error) li.append(line(`returned: nothing — it threw ${r.error}`, 'bad'));
    else if (r.returned) li.append(line(`returned: ${list(r.titles)} — as the spec says`));
    else li.append(line(`returned: ${list(r.titles ?? [])} — the spec says ${list(r.want)}`, 'bad'));

    if (r.kept) li.append(line('your list afterwards: in the order it came'));
    else li.append(line(`your list afterwards: REORDERED to ${list(r.after)}`, 'bad'));

    li.append(line(ok ? 'PASS' : 'FAIL', 'verdict'));
    if (!r.returned) li.append(line(SPEC[c.spec], 'spec', 'he'));
    if (!r.kept) li.append(line(SPEC.s2, 'spec', 'he'));
    mount.append(li);
  }
  document.querySelector('#score').textContent = `${passed} of ${CASES.length} cases pass.`;
}

try {
  const module = await import(FILES[key]);
  document.querySelector('#which').textContent = `File under test: ${FILES[key].slice(2)}`;
  paint(module.filterAndSort);
} catch (err) {
  document.querySelector('#which').textContent =
    `${FILES[key].slice(2)} did not load — ${err.name}: ${err.message}. Is it the whole file, pasted as it came back?`;
}
