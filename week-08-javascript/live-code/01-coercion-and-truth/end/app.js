import { print } from './print.js';

// Cycle 1 — coercion and truth.
// Everything a form field gives you is a string, or nothing at all. Type below this line.

// 1 · the triangle: two pairs that are "equal", and the pair between them that is not
print("'' == 0", '' == 0);
print("0 == '0'", 0 == '0');
print("'' == '0'", '' == '0');
print("'' === 0", '' === 0);

// 2 · a stock field, as the form hands it over — converted on purpose
print("Number('')", Number(''));

function stockLabel(raw) {
  const text = (raw ?? '').trim();
  if (text === '') return 'not entered';
  const count = Number(text);
  if (Number.isNaN(count)) return 'not a number';
  if (count === 0) return 'sold out';
  return `${count} in stock`;
}

for (const raw of ['3', '0', '', '   ', 'abc', null]) {
  print(`stockLabel(${JSON.stringify(raw)})`, stockLabel(raw));
}

// 3 · a zero is a value: || throws it away, ?? keeps it
const copies = 0;
print("copies || 'unknown'", copies || 'unknown');
print("copies ?? 'unknown'", copies ?? 'unknown');
print('null == undefined', null == undefined);
