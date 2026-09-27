# הפרומפטים — מחזור AI 4 · "הוסף פילטר"

שני פרומפטים, ממוספרים. P1 היא הבקשה התמימה — כמו שכמעט כל אחד מבקש: קובץ אחד מודבק, והבקשה
"שלא אצטרך לגעת בשאר הקבצים". P2 היא אותה בקשה אחרי שתפסת מה חזר: שלושת הקבצים, ושלושת החוקים
של השבוע כתובים בגוף הפרומפט, כל אחד כמשהו שאפשר לבדוק בתשובה.

היישום בשניהם הוא ספריית ההשאלה של מחזורים 1–3 (`artifact/start/`), עם תיבת סימון אחת חדשה —
`#multi`, "רק ספרים עם יותר מעותק אחד" — שאף אחד עוד לא מחובר אליה.

**ב-Claude Code** אותן מילים בדיוק, והקבצים כבר שם: לא מדביקים, מצביעים (`js/events.js`
ב-P1, התיקייה `js/` ב-P2). **בצ'אט** מדביקים את הקבצים. הסקירה זהה, והציון זהה.

## P1 — הבקשה התמימה

**עברית (התמליל נכתב עם הנוסח הזה):**

```
יש לי רשימת ספרים בעמוד, ותיבת סימון עם id="multi":
"רק ספרים עם יותר מעותק אחד".
תוסיף לה פילטר — כשהיא מסומנת, מוצגים רק ספרים שיש מהם יותר מעותק אחד.
הנה events.js שלי. עדיף שלא אצטרך לגעת בקבצים האחרים, הם עובדים.

<js/events.js — מודבק במלואו>
```

**English:**

```
I have a list of books on my page, and a checkbox with id="multi":
"only books with more than one copy".
Add a filter to it — when it is checked, only books with more than one copy are shown.
Here is my events.js. I'd rather not touch the other files, they work.

<js/events.js — pasted whole>
```

## P2 — הבקשה המסויגת

**עברית:**

```
הנה state.js, render.js ו-events.js של העמוד. תוסיף פילטר לתיבת הסימון #multi:
כשהיא מסומנת, מוצגים רק ספרים עם יותר מעותק אחד.

היישום בנוי במעגל חד-כיווני, ושלושה חוקים לא משתנים:
1. מקור אמת אחד: שום דבר שאפשר לחשב לא נשמר ב-state. התיבה היא שדה בוליאני אחד,
   ואין רשימה מסוננת שמורה.
2. צייר אחד: רק render(state) נוגע במסך. המטפל לא נוגע באף אלמנט ולא קורא את המסך.
3. כיוון אחד: המטפל הוא שורה אחת של setState.
הפילטר הוא עוד .filter אחד בתוך selectVisible. אל תשנה שום דבר אחר.
תחזיר רק את השורות שמשתנות, לפי קובץ.

<js/state.js · js/render.js · js/events.js — מודבקים>
```

**English:**

```
Here are the page's state.js, render.js and events.js. Add a filter for the #multi checkbox:
when it is checked, only books with more than one copy are shown.

The app is built as a one-way loop, and three rules do not change:
1. One truth: nothing that can be computed is stored in state. The checkbox is one boolean
   field, and there is no stored filtered list.
2. One painter: only render(state) touches the screen. The handler touches no element and
   reads nothing from the screen.
3. One direction: the handler is one line of setState.
The filter is one more .filter inside selectVisible. Change nothing else.
Return only the lines that change, per file.

<js/state.js · js/render.js · js/events.js — pasted>
```

## מה לבדוק בתשובה — לפני שמריצים

| החוק | מה מחפשים בתשובה | ואיך רואים בדפדפן |
|---|---|---|
| מקור אמת אחד | שדה ב-`setState` שהוא **רשימה** (`filtered`, `visible`) | בקונסול: `(await import('./js/state.js')).getState()` — יש מערך שני? |
| צייר אחד | `querySelectorAll`, `hidden`, `textContent` בתוך המטפל | סמן את התיבה, ואז לחץ +1 על ספר כלשהו — מה חוזר? |
| כיוון אחד | מטפל שאורכו יותר משורה, או שקורא ערך מהמסך (`textContent` של שורה) | הקלד בחיפוש כשהתיבה מסומנת — האם הפילטר שורד? |
