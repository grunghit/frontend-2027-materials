# סקירה כתובה של קוד שנכתב על ידי AI — דוגמה טובה (JavaScript)

<!-- Student-facing exemplar for the written review of GENERATED CODE (class assignment 8,
     part ג, `review-he.md`).
     The CSS pair (ai-review-good.md / -bad.md) teaches the review of three layout VARIANTS;
     this pair teaches the review of three FUNCTIONS and their explanations, in the
     assignment's own six sections. Written on a trio of its OWN — byDecade, uniqueArtists,
     ratingLabel — so it shows the form without the answer to any graded assignment.
     Shown on screen in week 8, AI cycle 5, before the assignment starts.
     Every output quoted here was run (results/.walk/walk-week08.mjs). -->

מה הופך סקירה כזאת לטובה: **הטענה והמסקנה מופרדות** — חלק מההסבר שצורף לקוד נכון, והסקירה אומרת
איזה חלק — **וההוכחה היא קוד שרץ, עם מה שהוא הדפיס.** "קראתי והבנתי" אינו מופיע בה. שים לב גם
שהשתיים התקינות לא "שופרו": מי ששינה את שלושתן לא הראה שמצא את האחת.

---

## הרקע

ביקשתי שלוש פונקציות עזר לעמוד הסיכום של רשימת האלבומים: קיבוץ לפי עשור, רשימת אמנים בלי כפילויות,
ותווית לדירוג. חזרו שלוש, כל אחת עם הסבר:

```js
/* Claude: "Groups the titles by decade. Math.floor(year / 10) * 10 turns 1997 into 1990.
   Albums without a year are skipped by the undefined check, so they never land in a decade." */
export function byDecade(items) {
  const groups = {};
  for (const item of items) {
    if (item.year === undefined) continue;
    const decade = Math.floor(item.year / 10) * 10;
    (groups[decade] ??= []).push(item.title);
  }
  return groups;
}

/* Claude: "A Set keeps the first occurrence of each value, in insertion order, so the
   artists come back in the order they first appear." */
export function uniqueArtists(items) {
  return [...new Set(items.map((item) => item.artist))];
}

/* Claude: "0 means nobody has rated the album yet, so it says so instead of showing zero stars." */
export function ratingLabel(rating) {
  return rating === 0 ? 'not rated' : `${rating} / 5`;
}
```

## 1. איזו מהשלוש

| | |
|---|---|
| **שם הפונקציה** | `byDecade` |

## 2. מה ההסבר טוען, ומה קורה בפועל

| | |
|---|---|
| **מה ההסבר טוען** | שאלבום בלי שנה מדולג, ולכן לא נכנס לאף עשור |
| **מה קורה בפועל** | אלבום בלי שנה נכנס לעשור **0**. אצלנו "בלי שנה" הוא `year: null` — כך כתוב ב-`\| null` של המפרט — ו-`null === undefined` הוא `false`, אז הבדיקה לא עוצרת אותו. אז `null / 10` הוא `0` (בחשבון `null` הוא אפס), ו-`Math.floor(0) * 10` הוא `0` |
| **החלק בהסבר שהוא נכון כשלעצמו** | שני חלקים: `Math.floor(year / 10) * 10` באמת הופך 1997 ל-1990, ו-`=== undefined` באמת מדלג על שדה שלא קיים. המסקנה — "אלבום בלי שנה לא נכנס" — נכונה רק לאלבום שהשדה **חסר** בו, לא לאלבום שהשדה שלו `null` |

## 3. איך הוכחת את זה

```js
const shelf = [
  { title: 'Kid A', year: 2000 },
  { title: 'Debut', year: null },
];
console.log(JSON.stringify(byDecade(shelf)));
```

| | |
|---|---|
| **מה זה הדפיס** | `{"0":["Debut"],"2000":["Kid A"]}` — "Debut" בעשור 0 |

ובדקתי גם את הצד השני, כדי לדעת **איפה** ההסבר נכון: עם `{ title: 'Debut' }` (בלי השדה בכלל)
הודפס `{"2000":["Kid A"]}`. כלומר ההסבר נכון לחצי מהמקרים, והחצי שלנו הוא השני.

## 4. מה זה היה שובר, ומתי

בעמוד הסיכום תופיע שורה "0s" עם כל האלבומים שהשנה שלהם לא ידועה — **בעמוד אחר מזה שבו הקוד
נכתב**, ורק ביום שבו לאלבום הראשון אין שנה. עם הנתונים שהקלדתי ביד, שלכולם יש שנה, זה לא נראה
אף פעם; זה יופיע בשבוע 11, כשה-API יחזיר אלבום בלי תאריך.

## 5. התיקון

| | |
|---|---|
| **מה שיניתי, בדיוק** | `item.year === undefined` הפך ל-`item.year == null` — שינוי אחד, בשורה אחת |
| **למה זה מספיק** | זה החריג היחיד ל-`===` בקורס: `== null` תופס בדיוק `null` ו-`undefined` ושום דבר אחר. הרצתי שוב את ההוכחה מסעיף 3: `{"2000":["Kid A"]}` |

`uniqueArtists` ו-`ratingLabel` חזרו כמו שהגיעו. הרצתי גם אותן, כדי לא לנחש:
`uniqueArtists` על `['Radiohead', 'Björk', 'Radiohead']` החזירה `["Radiohead","Björk"]` — הסדר של
ההופעה הראשונה, כמו שנטען; `ratingLabel(0)` החזירה `"not rated"`.

## 6. מה זה אומר על הבדיקה

הבדיקות שלי היו כולן על אלבומים שיש להם שנה, ולכן הן הוכיחו את החשבון ולא את המקרה החסר: **בדיקה
מוכיחה רק את מה שהיא הריצה, וההסבר שצורף לקוד הוא טענה — לא אחת מהבדיקות.**
