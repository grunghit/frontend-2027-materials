---
title: ניבוי פלט
kicker: שבוע 7 · מטלת כיתה
footer: פיתוח צד לקוח 2027 · המרכז האקדמי רופין
---

<!-- Student-facing. Hebrew, masculine forms (CLAUDE_CODE_BRIEF.md §3).
     Fill it in. Do not delete the questions.
     Every `CODE HERE` is a place you write; the grader checks that none are left. -->

# חלק א — ניבוי פלט

| | |
|---|---|
| **שם הסטודנט** | <!-- --> |
| **מספר זהות** | <!-- --> |

> [!note]
> **הסדר כאן הוא הציון.** לכל שאלה: כתוב את הניחוש **לפני** שאתה מריץ, ואז הרץ, ואז כתוב
> למה. מי שמריץ קודם ומעתיק — מקבל את אותו טקסט ולומד כלום, ובשבוע 13 אין קונסולה.
>
> **אתה לא נבדק על צדק.** אתה נבדק על שלוש השורות: מה חשבת, מה קרה, ולמה. ניחוש שגוי
> עם הסבר נכון של הפער שווה יותר מניחוש נכון בלי הסבר.

**איפה מריצים:** פתח את `exercises.html` עם Live Server, ואת הקונסולה של הדפדפן
(F12 · לשונית Console). הדבק כל קטע לשם.

---

## 1. קואורסיה

```js
console.log('' == 0);
console.log('' == '0');
```

| | |
|---|---|
| **מה יודפס, לדעתי** | CODE HERE |
| **מה הודפס בפועל** | CODE HERE |
| **למה — במשפט אחד** | CODE HERE |

---

## 2. קואורסיה

```js
console.log([] + {});
console.log(typeof ([] + {}));
```

| | |
|---|---|
| **מה יודפס, לדעתי** | CODE HERE |
| **מה הודפס בפועל** | CODE HERE |
| **למה — במשפט אחד** | CODE HERE |

---

## 3. אמת ושקר

```js
if ([]) console.log('truthy');
console.log([] == false);
```

| | |
|---|---|
| **מה יודפס, לדעתי** | CODE HERE |
| **מה הודפס בפועל** | CODE HERE |
| **למה — במשפט אחד** | CODE HERE |

---

## 4. אמת ושקר

```js
const raw = '';            // an empty form field
console.log(Number(raw) === 0);
console.log(raw || 'ברירת מחדל');
console.log(raw ?? 'ברירת מחדל');
```

| | |
|---|---|
| **מה יודפס, לדעתי** | CODE HERE |
| **מה הודפס בפועל** | CODE HERE |
| **למה — במשפט אחד** | CODE HERE |

---

## 5. ערך והפניה

```js
const prices = [30, 20, 10];
function cheapest(list) {
  return list.sort((a, b) => a - b)[0];
}
console.log(cheapest(prices));
console.log(prices);
```

| | |
|---|---|
| **מה יודפס, לדעתי** | CODE HERE |
| **מה הודפס בפועל** | CODE HERE |
| **למה — במשפט אחד** | CODE HERE |

---

## 6. ערך והפניה

```js
const config = { size: 'M' };
const copy = config;
copy.size = 'L';
console.log(config.size);
```

| | |
|---|---|
| **מה יודפס, לדעתי** | CODE HERE |
| **מה הודפס בפועל** | CODE HERE |
| **למה — במשפט אחד** | CODE HERE |

---

## 7. הרמה

```js
function run() {
  console.log(total);
  var total = 10;
  console.log(total);
}
run();
```

| | |
|---|---|
| **מה יודפס, לדעתי** | CODE HERE |
| **מה הודפס בפועל** | CODE HERE |
| **למה — במשפט אחד** | CODE HERE |

---

## 8. אזור מת

```js
function run() {
  console.log(total);
  let total = 10;
}
run();
```

| | |
|---|---|
| **מה יודפס, לדעתי** | CODE HERE |
| **מה הודפס בפועל** | CODE HERE |
| **למה — במשפט אחד** | CODE HERE |

---

## 9. אזור מת

```js
console.log(typeof neverDeclaredAnywhere);
function run() {
  console.log(typeof total);
  let total = 10;
}
run();
```

| | |
|---|---|
| **מה יודפס, לדעתי** | CODE HERE |
| **מה הודפס בפועל** | CODE HERE |
| **למה — במשפט אחד** | CODE HERE |

---

## 10. this

```js
const shelf = {
  label: 'המדף',
  describe() {
    return this?.label ?? '(אין this)';
  },
};
console.log(shelf.describe());
const describe = shelf.describe;
console.log(describe());
```

| | |
|---|---|
| **מה יודפס, לדעתי** | CODE HERE |
| **מה הודפס בפועל** | CODE HERE |
| **למה — במשפט אחד** | CODE HERE |

---

## 11. this

```js
const shelf = {
  label: 'המדף',
  describe: () => this?.label ?? '(אין this)',
};
console.log(shelf.describe());
```

| | |
|---|---|
| **מה יודפס, לדעתי** | CODE HERE |
| **מה הודפס בפועל** | CODE HERE |
| **למה — במשפט אחד** | CODE HERE |

---

## 12. סגורים

```js
const jobs = [];
for (var i = 0; i < 3; i++) {
  jobs.push(() => i);
}
console.log(jobs.map((job) => job()));
```

| | |
|---|---|
| **מה יודפס, לדעתי** | CODE HERE |
| **מה הודפס בפועל** | CODE HERE |
| **למה — במשפט אחד** | CODE HERE |

---

## 13. חצים

```js
const double = (n) => { n * 2 };
console.log([1, 2, 3].map(double));
```

| | |
|---|---|
| **מה יודפס, לדעתי** | CODE HERE |
| **מה הודפס בפועל** | CODE HERE |
| **למה — במשפט אחד** | CODE HERE |

---

## 14. מיון

```js
const ratings = [10, 9, 1, 25, 3];
console.log(ratings.sort());
console.log(ratings);
```

| | |
|---|---|
| **מה יודפס, לדעתי** | CODE HERE |
| **מה הודפס בפועל** | CODE HERE |
| **למה — במשפט אחד** | CODE HERE |

---

## סיכום

| | |
|---|---|
| **בכמה מתוך 14 צדקתי** | CODE HERE |
| **השאלה שהכי הפתיעה אותי, ולמה** | CODE HERE |

<!-- שתי השורות האלה נבדקות. מספר בלי השאלה השנייה = חצי. -->
