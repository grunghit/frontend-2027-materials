# תמליל — כפתור הסרה לכל פריט: הכותרת שרצה, והמאזינים שנרשמים מחדש

model: claude-opus-5-5 · captured: 2026-09-26 · how: סשן הכתיבה של הקורס ב-Claude Code — אותו מודל עונה על P1 ועל P2 כפי שצ'אט היה עונה, עם `artifact/start/js/app.js` מודבק כהקשר. **זה אינו צילום מהצ'אט בדפדפן:** התשובות למטה נכתבו בסשן הכתיבה עצמו, על ידי המודל שכתב את השבוע. לפני השיעור: הרץ את P1 פעם אחת בצ'אט, והדבק את התשובה במקום זו שלמטה, עם התאריך. המדידות בהערות נעשו ב-Chromium על הקבצים ב-`artifact/` (`results/.walk/walk-week09.mjs` במאגר הקורס): כותרת עם `onerror` הוקלדה בטופס, ו-`addEventListener` נספר מרגע הטעינה.

> **למה הקובץ הזה קיים.** פלט של מודל אינו דטרמיניסטי, ומודלים מתחלפים. המחזור רץ חי אם התשובה של
> החדר ל-P1 ממשיכה לבנות עם `innerHTML` וקושרת מאזין לכל כפתור; אם החדר קיבל משהו אחר — פותחים את
> הקובץ הזה ואת `artifact/claude-p1/` ומשווים. **ההשוואה בין מה שהחדר קיבל למה שכתוב כאן היא בעצמה
> השיעור:** אותה בקשה, שתי תשובות, ורק מול הדפדפן אפשר לדעת איזו מהן בטוחה. התשובות למטה הן של
> המודל, כלשונן; ההערות המסומנות `> **מכשול**` הן של המרצה.

## You

זה ה-app.js שלי:

```js
// Watch later: a list of talks, and a form that adds one.
const queue = document.querySelector('#queue');
const form = document.querySelector('#add-talk');
const titleField = document.querySelector('#talk-title');
const minutesField = document.querySelector('#talk-minutes');

let talks = [
  { id: 1, title: 'How browsers paint a page', minutes: 18 },
  { id: 2, title: 'CSS Grid in twenty minutes', minutes: 20 },
  { id: 3, title: 'Events, bubbling and delegation', minutes: 25 },
];
let nextId = 4;

function render() {
  queue.innerHTML = talks
    .map((talk) => `<li>${talk.title} <span class="mins">${talk.minutes} min</span></li>`)
    .join('');
}

form.addEventListener('submit', (event) => {
  event.preventDefault();
  const title = titleField.value.trim();
  if (!title) return;
  talks.push({ id: nextId, title, minutes: Number(minutesField.value) || 0 });
  nextId += 1;
  form.reset();
  render();
});

render();
```

תוסיף כפתור הסרה לכל פריט ברשימה.

## Claude

בשמחה. צריך שני שינויים קטנים, שניהם בתוך `render()`: להוסיף את הכפתור לתבנית של כל פריט, ולחבר
לכל כפתור מאזין שמסיר את ההרצאה מהמערך ומרנדר מחדש. שמרתי את ה-`id` של כל הרצאה ב-`data-id` על
הכפתור, כדי שהמאזין יידע מה להסיר.

זה ה-`render()` המעודכן:

```js
function render() {
  queue.innerHTML = talks
    .map(
      (talk) => `
        <li>
          ${talk.title} <span class="mins">${talk.minutes} min</span>
          <button class="remove-btn" data-id="${talk.id}">Remove</button>
        </li>`,
    )
    .join('');

  // Attach a click handler to each remove button
  document.querySelectorAll('.remove-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      const id = Number(btn.dataset.id);
      talks = talks.filter((talk) => talk.id !== id);
      render();
    });
  });
}
```

שאר הקובץ נשאר בדיוק כמו שהוא. כמה הערות:

- מכיוון ש-`render()` בונה מחדש את כל ה-HTML של הרשימה בכל פעם, צריך לחבר את המאזינים מחדש אחרי כל
  רינדור — ולכן הם נמצאים בתוך `render()` ולא מחוצה לו.
- `Number(btn.dataset.id)` חשוב: ערכים ב-`dataset` הם תמיד מחרוזות, וה-`id` במערך הוא מספר. בלי ההמרה
  ההשוואה `!==` תמיד תהיה `true` ושום דבר לא יוסר.
- אם תרצה, אפשר להוסיף ל-`.remove-btn` קצת עיצוב ב-CSS, למשל `margin-inline-start: auto` כדי שהכפתור
  יישב בקצה השורה.

> **מכשול.** שני דברים, ואף אחד מהם לא צועק. **(1) הכותרת רצה.** התשובה שמרה את `innerHTML` עם תבנית
> מחרוזת, ו-`${talk.title}` הוא מה שמישהו הקליד בטופס — בלי מילה על זה. נמדד על `artifact/claude-p1/`:
> כותרת `<img src="data:," onerror="window.__ran = (window.__ran || 0) + 1">` רצה כשהיא נוספת
> (`window.__ran` = 1), **ורצה שוב** כשמסירים שורה אחרת (2), כי כל `render` מפרסר מחדש את כל הרשימה.
> העמוד המקורי כבר היה פגיע; התשובה הרחיבה את אותה צורה ולא ציינה אותה. **(2) מאזין לכל כפתור, בתוך
> `render`.** ההסרה עובדת (מ-4 שורות ל-3). אבל `addEventListener` נקרא 4 פעמים בטעינה, 8 אחרי הוספה, 11
> אחרי הסרה אחת — ושלושה כפתורים על המסך. ב-Elements, בלשונית Event Listeners: `click` על הכפתור, ואין אף אחד
> על ה-`ul`. ההערה הראשונה של התשובה מנמקת את זה ("צריך לחבר מחדש אחרי כל רינדור") — וזה נכון, בתוך
> העיצוב שהיא לא שאלה עליו. האיך נראה נכון; המכשול הוא שאף אחד לא בדק את השאלה עצמה.

## You

זה ה-app.js שלי:

[אותו `artifact/start/js/app.js`, מודבק שוב]

תוסיף כפתור הסרה לכל פריט ברשימה, עם האילוצים האלה:
- מאזין click אחד בלבד, על ה-`<ul id="queue">`, שנרשם פעם אחת מחוץ ל-`render()`. בלי מאזין על כל
  כפתור, ובלי `addEventListener` בתוך `render()`.
- את הכפתור מוצאים עם `event.target.closest(...)`, כי הלחיצה יכולה לנחות על משהו בתוך הכפתור.
- את השורות בונים עם `createElement` ו-`textContent`. בלי `innerHTML` בשום מקום בקובץ — הכותרות מגיעות
  מטופס, ממשתמש.
- המטפל משנה את `talks` וקורא ל-`render()`. הוא לא מסיר שורה מה-DOM בעצמו.
- לכל כפתור שם נגיש שאומר איזו הרצאה הוא מסיר.
תחזיר את הקובץ המלא.

## Claude

זה הקובץ המלא. שלושה דברים השתנו מעבר לכפתור עצמו, וכולם באים מהאילוצים שלך:

1. **`talkRow(talk)`** בונה שורה אחת עם `createElement`. הכותרת נכנסת רק דרך `textContent`, ולכן כותרת
   שמכילה סימון מוצגת כמו שהיא ואף פעם לא מפורסרת כ-HTML. זה גם מתקן בעיה שהייתה כבר בקוד המקורי: עם
   `innerHTML`, כותרת כמו `<img src=x onerror=...>` הייתה רצה.
2. **`render()`** מחליף את הילדים של הרשימה ב-`replaceChildren(...)` — הרשימה עצמה נשארת אותו אלמנט.
3. **מאזין אחד** על `#queue`, מחוץ ל-`render()`. הוא נרשם פעם אחת, ולכן הוא עובד גם על שורות שנוספו
   אחרי הטעינה וגם אחרי כל רינדור.

```js
// Watch later: a list of talks, and a form that adds one.
const queue = document.querySelector('#queue');
const form = document.querySelector('#add-talk');
const titleField = document.querySelector('#talk-title');
const minutesField = document.querySelector('#talk-minutes');

let talks = [
  { id: 1, title: 'How browsers paint a page', minutes: 18 },
  { id: 2, title: 'CSS Grid in twenty minutes', minutes: 20 },
  { id: 3, title: 'Events, bubbling and delegation', minutes: 25 },
];
let nextId = 4;

// Build one row. The title comes from the form, so it is only ever set as text.
function talkRow(talk) {
  const li = document.createElement('li');
  li.dataset.id = String(talk.id);

  const title = document.createElement('span');
  title.textContent = talk.title;

  const mins = document.createElement('span');
  mins.className = 'mins';
  mins.textContent = `${talk.minutes} min`;

  const remove = document.createElement('button');
  remove.type = 'button';
  remove.className = 'remove-btn';
  remove.textContent = 'Remove';
  remove.setAttribute('aria-label', `Remove ${talk.title}`);

  li.append(title, mins, remove);
  return li;
}

function render() {
  queue.replaceChildren(...talks.map(talkRow));
}

// One listener for every Remove button, registered once, on the list itself.
// render() replaces the list's children, never the list.
queue.addEventListener('click', (event) => {
  const button = event.target.closest('.remove-btn');
  if (!button) return;

  const id = Number(button.closest('li').dataset.id);
  talks = talks.filter((talk) => talk.id !== id);
  render();
});

form.addEventListener('submit', (event) => {
  event.preventDefault();
  const title = titleField.value.trim();
  if (!title) return;
  talks.push({ id: nextId, title, minutes: Number(minutesField.value) || 0 });
  nextId += 1;
  form.reset();
  render();
});

render();
```

> **נמדד על `artifact/claude-p2/`:** אותה כותרת מוצגת כטקסט, ו-`window.__ran` נשאר `undefined` גם אחרי
> הוספה והסרה. `addEventListener` נקרא פעמיים בטעינה (הטופס והרשימה) — ועדיין פעמיים אחרי הוספה והסרה.
> ב-Event Listeners: `click` אחד על ה-`ul`, אף אחד על הכפתורים. ההסרה עובדת, גם של שורה שנוספה עכשיו.
> שים לב מה קרה בתשובה הזאת: **היא הזכירה את `innerHTML` רק כשהאילוץ ביקש.** אותו מודל, אותו קובץ — מה
> שהשתנה הוא מה שהפרומפט אמר שחשוב.
