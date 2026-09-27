# הפרומפטים — מחזור AI 4 · "הוסף כפתור הסרה לכל פריט"

שני פרומפטים, ממוספרים. בשניהם מדביקים קודם את `artifact/start/js/app.js` כולו — העמוד Watch later,
שלוש הרצאות וטופס שמוסיף אחת. P1 היא הבקשה התמימה, כמו שכמעט כל אחד כותב אותה. P2 היא אותה בקשה עם
האילוצים של השבוע, כתובים כך שאפשר לבדוק כל אחד מהם בתשובה ובדפדפן.

## P1 — הבקשה התמימה

**עברית (התמליל נכתב עם הנוסח הזה):**

```
זה ה-app.js שלי:

[כאן מדביקים את artifact/start/js/app.js כולו]

תוסיף כפתור הסרה לכל פריט ברשימה.
```

**English:**

```
This is my app.js:

[paste the whole of artifact/start/js/app.js]

Add a remove button to each item in the list.
```

## P2 — הבקשה המסויגת

**עברית:**

```
זה ה-app.js שלי:

[כאן מדביקים את artifact/start/js/app.js כולו]

תוסיף כפתור הסרה לכל פריט ברשימה, עם האילוצים האלה:
- מאזין click אחד בלבד, על ה-<ul id="queue">, שנרשם פעם אחת מחוץ ל-render(). בלי מאזין על
  כל כפתור, ובלי addEventListener בתוך render().
- את הכפתור מוצאים עם event.target.closest(...), כי הלחיצה יכולה לנחות על משהו בתוך הכפתור.
- את השורות בונים עם createElement ו-textContent. בלי innerHTML בשום מקום בקובץ — הכותרות מגיעות
  מטופס, ממשתמש.
- המטפל משנה את talks וקורא ל-render(). הוא לא מסיר שורה מה-DOM בעצמו.
- לכל כפתור שם נגיש שאומר איזו הרצאה הוא מסיר.
תחזיר את הקובץ המלא.
```

**English:**

```
This is my app.js:

[paste the whole of artifact/start/js/app.js]

Add a remove button to each item in the list, with these constraints:
- Exactly one click listener, on <ul id="queue">, registered once, outside render(). No
  listener per button, and no addEventListener inside render().
- Find the button with event.target.closest(...), because the click can land on something
  inside the button.
- Build the rows with createElement and textContent. No innerHTML anywhere in the file:
  the titles come from a form, from a user.
- The handler changes talks and calls render(). It never removes a row from the DOM itself.
- Every button has an accessible name that says which talk it removes.
Return the whole file.
```

## מה ההבדל בין השניים, בשורה

P1 מבקשת **כפתור**; P2 מבקשת **את הכפתור הזה** — במקום שבו הקורס אומר שהמאזין יושב, בחומר שהקורס
אומר שבונים ממנו שורה. כל שורה ב-P2 היא משהו שאפשר לבדוק: לספור `addEventListener`, לחפש `innerHTML`,
להקליד כותרת עם `onerror`, ולפתוח את Event Listeners ב-Elements.
