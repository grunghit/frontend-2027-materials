# הפרומפטים — מחזור AI 4 · קודם מפרט, ואז קוד

שני פרומפטים, ממוספרים. **שניהם מתחילים ממפרט** — זה השבוע הראשון בשכבת "שותף למימוש", ובשכבה הזאת
אין קוד בלי מפרט. ההבדל ביניהם הוא לא המפרט. P1 הוא "יישם את המפרט" — מה שכמעט כל אחד שולח אחרי
שכתב מפרט טוב. P2 הוא אותה בקשה, ועוד **שני כללים של הקורס כתובים בגוף הפרומפט**, אף ששניהם כבר
כתובים במפרט עצמו.

המפרט בשניהם הוא `artifact/specs/filter-and-sort.md` — רשימת הקריאה של מחזורים 2 ו-3. במסלול החינמי
מדביקים אותו לצ'אט מתחת לפרומפט; ב-Claude Code מצביעים עליו בשם הקובץ. התשובות לשניהם נמצאות
ב-`transcript.md` וב-`artifact/claude-p1/` ו-`artifact/claude-p2/`.

## P1 — "יישם את המפרט"

**עברית (התמליל נכתב עם הנוסח הזה):**

```
יישם את specs/filter-and-sort.md כקובץ אחד, filter-and-sort.js,
שמייצא את filterAndSort(books, query, sortKey).
המפרט מודבק כאן למטה.

<כאן המפרט כולו>
```

**English:**

```
Implement specs/filter-and-sort.md as one file, filter-and-sort.js,
exporting filterAndSort(books, query, sortKey).
The spec is pasted below.

<the whole spec here>
```

## P2 — אותה בקשה, והכללים בגוף הפרומפט

כתוב אותו **בעצמך** לפני שאתה מסתכל כאן (זה ה-you-do של המחזור). מה שחשוב בו: כל כלל הוא משהו
שהספסל או חיפוש בקובץ יכולים לבדוק.

**עברית (התמליל נכתב עם הנוסח הזה):**

```
יישם את specs/filter-and-sort.md כקובץ אחד, filter-and-sort.js,
שמייצא את filterAndSort(books, query, sortKey). המפרט מודבק כאן למטה.

שני כללים מהקורס, ואני חוזר עליהם כי אלה בדיוק הכללים שהולכים לאיבוד:
1. המערך שהפונקציה מקבלת לעולם לא מסודר מחדש. העתק לפני כל sort,
   בכל מסלול — כולל חיפוש ריק, שבו אין filter שיעתיק בשבילך.
2. פונקציה טהורה במודול משלה: בלי DOM, בלי פונקציות עזר נוספות
   ובלי ייצוא נוסף. const ו-let בלבד.

<כאן המפרט כולו>
```

**English:**

```
Implement specs/filter-and-sort.md as one file, filter-and-sort.js,
exporting filterAndSort(books, query, sortKey). The spec is pasted below.

Two rules from the course, repeated because these are exactly the ones that get lost:
1. The array the function receives is never reordered. Copy before any sort,
   on every path — including the empty query, where there is no filter to copy for you.
2. A pure function in its own module: no DOM, no extra helpers, no extra exports.
   const and let only.

<the whole spec here>
```

## למה P2 עובד, ומאיפה הכלל הזה

זה לא כלל שהמצאנו השבוע. זו השורה האחרונה של רשומה 3 ב-`project/templates/examples/PROMPTS.md` —
היומן האמיתי של הפרויקט לדוגמה: **"יישם את המפרט" בלי לחזור על האילוצים לא עובד, גם כשהם כתובים
במפרט. מה שעזר בפועל: לצטט את הכלל בגוף הפרומפט.** P1 ו-P2 הם אותו ניסוי, על הפיצ'ר שלנו.
