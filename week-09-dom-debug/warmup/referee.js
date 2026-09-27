/**
 * referee.js — GIVEN. Do not edit it, and you do not need to read it.
 *
 * It runs each of the five functions in a sandbox of its own and reports what it got
 * against what it expected. It deliberately does NOT say which line is wrong: finding
 * that is the exercise, and it is the same thing the Debug Challenge asks for after
 * the break, on five faults instead of four.
 */
import { makeRow, fillList, findRemoveButton, countRows, toggleDone } from './warmup.js';

/** A fresh, detached list with a couple of rows in it. */
function sandbox() {
  const list = document.createElement('ul');
  list.className = 'rows';
  document.querySelector('#sandbox').replaceChildren(list);
  return list;
}

/** Build a row that looks like the real ones: a button with a span inside it. */
function rowWithButton(text) {
  const li = document.createElement('li');
  const span = document.createElement('span');
  span.textContent = text;
  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'remove';
  const inner = document.createElement('span');
  inner.textContent = 'הסר';
  button.append(inner);
  li.append(span, button);
  return li;
}

const TESTS = [
  {
    name: 'makeRow',
    what: 'הטקסט של המשתמש מוצג כטקסט, ולא מתפרש כתגיות',
    run() {
      const li = makeRow('<b>מטלה</b> ראשונה');
      return {
        expected: 'אלמנט בלי אלמנטים בפנים, שהטקסט שלו כולל את התווים <b>',
        got: `${li.children.length} אלמנטים בפנים, הטקסט "${li.textContent}"`,
        pass: li.children.length === 0 && li.textContent.includes('<b>'),
      };
    },
  },
  {
    name: 'fillList',
    what: 'מילוי פעמיים משאיר את מספר השורות של פעם אחת',
    run() {
      const list = sandbox();
      fillList(list, ['אחת', 'שתיים', 'שלוש']);
      fillList(list, ['אחת', 'שתיים', 'שלוש']);
      return {
        expected: '3 שורות',
        got: `${list.querySelectorAll(':scope > li').length} שורות`,
        pass: list.querySelectorAll(':scope > li').length === 3,
      };
    },
  },
  {
    name: 'findRemoveButton',
    what: 'לחיצה על המילה שבתוך הכפתור מוצאת את הכפתור, ולחיצה על הטקסט מחזירה null',
    run() {
      const list = sandbox();
      list.append(rowWithButton('לקנות חלב'));
      const button = list.querySelector('button.remove');
      const inner = button.querySelector('span');
      const label = list.querySelector('li > span');

      let onInner = null;
      let onLabel = 'לא נבדק';
      button.addEventListener('click', (event) => {
        onInner = findRemoveButton(event);
      });
      inner.dispatchEvent(new MouseEvent('click', { bubbles: true }));

      list.addEventListener('click', (event) => {
        onLabel = findRemoveButton(event);
      });
      label.dispatchEvent(new MouseEvent('click', { bubbles: true }));

      const foundButton = onInner === button;
      const ignoredLabel = onLabel === null;
      return {
        expected: 'הכפתור בלחיצה על המילה שבתוכו, ו-null בלחיצה על שם המשימה',
        got: `${foundButton ? 'הכפתור' : String(onInner)} בלחיצה על המילה, ${ignoredLabel ? 'null' : String(onLabel && onLabel.className)} בלחיצה על השם`,
        pass: foundButton && ignoredLabel,
      };
    },
  },
  {
    name: 'countRows',
    what: 'סופר רק שורות ישירות, גם כשיש רשימה מקוננת',
    run() {
      const list = sandbox();
      fillList(list, ['אחת', 'שתיים']);
      /* Built here rather than through the functions under test, so this case is not
         at the mercy of another one being wrong. */
      const outer = document.createElement('li');
      const nested = document.createElement('ul');
      nested.append(document.createElement('li'), document.createElement('li'));
      outer.append(nested);
      list.append(outer);
      return {
        expected: '3',
        got: String(countRows(list)),
        pass: countRows(list) === 3,
      };
    },
  },
  {
    name: 'toggleDone',
    what: 'המצב נשמר במחלקה, כך שגיליון הסגנונות עדיין שולט בו',
    run() {
      const list = sandbox();
      list.append(rowWithButton('לקנות חלב'));
      const row = list.querySelector('li');
      toggleDone(row);
      const on = row.classList.contains('done');
      toggleDone(row);
      const off = row.classList.contains('done');
      return {
        expected: 'המחלקה done נוספת ואז מוסרת',
        got: `אחרי הראשונה: ${on ? 'יש done' : 'אין done'} · אחרי השנייה: ${off ? 'יש done' : 'אין done'}`,
        pass: on && !off,
      };
    },
  },
];

const out = document.querySelector('#report');
out.replaceChildren();
let broken = 0;

for (const test of TESTS) {
  let result;
  try {
    result = test.run();
  } catch (err) {
    result = { expected: 'שהפונקציה תרוץ', got: `${err.name}: ${err.message}`, pass: false };
  }
  if (!result.pass) broken += 1;

  const row = document.createElement('div');
  row.className = `line ${result.pass ? 'ok' : 'bad'}`;

  const name = document.createElement('code');
  name.textContent = test.name;

  const what = document.createElement('p');
  what.className = 'what';
  what.textContent = test.what;

  const detail = document.createElement('p');
  detail.className = 'detail';
  detail.textContent = result.pass
    ? 'עובד'
    : `ציפיתי ל: ${result.expected} · קיבלתי: ${result.got}`;

  row.append(name, what, detail);
  out.append(row);
}

const summary = document.querySelector('#summary');
summary.textContent =
  broken === 0
    ? 'כל החמש עובדות. סיימת.'
    : `${broken} מתוך 5 לא עושות את מה שכתוב עליהן. אחת מהחמש כבר תקינה — אל תשנה אותה.`;
summary.className = broken === 0 ? 'summary ok' : 'summary bad';
