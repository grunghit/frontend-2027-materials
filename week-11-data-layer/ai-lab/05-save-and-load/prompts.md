# הפרומפטים — מחזור AI 5 · "שמור ב-localStorage, וחפש ב-Open Library"

שני פרומפטים, ממוספרים. P1 היא הבקשה התמימה — כמו שכמעט כל אחד מבקש: שתי משאלות, שלושה קבצים
מודבקים, ואף מילה על מה שיכול להשתבש. P2 היא אותה בקשה אחרי שתפסת מה חזר: שלושת הכללים שהקלדת היום
בידיים, ושני כללים מחוזה הפרויקט, כתובים בגוף הפרומפט, כל אחד כמשהו שאפשר לבדוק בתשובה.

היישום בשניהם הוא ספריית ההשאלה של שבוע 10 (`artifact/start/`): היא שוכחת הכול ברענון, ותיבת החיפוש
בקטלוג בתחתית העמוד (`#cat-q`, `#cat-msg`, `#cat-results`) לא מחוברת לכלום.

**ב-Claude Code** אותן מילים בדיוק, והקבצים כבר שם: לא מדביקים, מצביעים (`js/state.js`,
`js/events.js`, `js/app.js`). **בצ'אט** מדביקים את הקבצים. הסקירה זהה, והציון זהה.

## P1 — הבקשה התמימה

**עברית (התמליל נכתב עם הנוסח הזה):**

```
יש לי אפליקציה של ספריית השאלה. שני דברים:
1. שהספרים יישמרו ב-localStorage, כדי שיהיו שם גם אחרי רענון.
2. שתיבת החיפוש עם id="cat-q" תחפש ספרים ב-Open Library תוך כדי הקלדה,
   ותציג את התוצאות ב-#cat-results.
הנה state.js, events.js ו-app.js.

<js/state.js · js/events.js · js/app.js — מודבקים במלואם>
```

**English:**

```
I have a class-library app. Two things:
1. Save the books in localStorage, so they are still there after a reload.
2. Make the search box with id="cat-q" search Open Library as the user types,
   and show the results in #cat-results.
Here are state.js, events.js and app.js.

<js/state.js · js/events.js · js/app.js — pasted whole>
```

## P2 — הבקשה המסויגת

**עברית:**

```
אותה אפליקציה, אותן שתי בקשות — עם הכללים האלה, וכל אחד מהם הוא דרישה:

אחסון, בקובץ חדש js/storage.js שלא נוגע ב-DOM:
1. המפתח הוא library:v1, והערך הוא מערך הספרים עצמו — JSON.stringify(books), בלי מעטפה.
2. load() לא זורק לעולם ולא מחזיר null: try סביב localStorage.getItem וסביב JSON.parse,
   Array.isArray, והשמטה של שורה שאינה ספר. הוא מחזיר { books, reason } — reason הוא משפט
   בעברית כשמשהו לא היה בסדר. קריאה אחת בלבד ל-getItem.
3. מפתח שאינו קיים הוא ספרייה ריקה. בלי נתוני דוגמה ב-app.js.
4. persist(state) הוא מנוי אחד — subscribe(persist) ב-app.js, ואף מטפל לא שומר.
   הוא לא כותב כשהמערך הוא זה שנכתב בפעם הקודמת, ו-setState בתוכו רק כשהמשפט השתנה.
   setState עצמה לא משתנה.

רשת, בקובץ חדש js/api.js שלא נוגע ב-DOM ולא קורא ל-setState:
5. הכתובת נבנית עם new URL ו-searchParams.
6. אחרי ה-fetch, בשורה הבאה, בדיקת res.ok. res.json() ב-try משלו. פסק זמן עם AbortSignal.timeout.
7. כל כישלון נזרק כשגיאה שנושאת משפט בעברית למשתמש.

תחזיר את הקבצים המלאים שמשתנים.

<js/state.js · js/events.js · js/render.js · js/app.js — מודבקים>
```

**English:**

```
Same app, same two requests — with these rules, each of them a requirement:

Storage, in a new js/storage.js that never touches the DOM:
1. The key is library:v1, and the value is the books array itself — JSON.stringify(books),
   no envelope.
2. load() never throws and never returns null: try around localStorage.getItem and around
   JSON.parse, Array.isArray, and drop any row that is not a book. It returns
   { books, reason } — reason is a Hebrew sentence when something was wrong. Exactly one
   getItem call.
3. A key that is not there is an empty library. No sample data in app.js.
4. persist(state) is one subscriber — subscribe(persist) in app.js, and no handler saves.
   It does not write when the array is the one it wrote last time, and it calls setState
   only when the sentence changed. setState itself does not change.

Network, in a new js/api.js that never touches the DOM and never calls setState:
5. The URL is built with new URL and searchParams.
6. After the fetch, on the next line, check res.ok. res.json() in its own try. A timeout with
   AbortSignal.timeout.
7. Every failure is thrown as an error that carries a Hebrew sentence for the user.

Return the full files that change.

<js/state.js · js/events.js · js/render.js · js/app.js — pasted>
```

## מה לבדוק בתשובה — לפני שמריצים

| הכלל | מה מחפשים בתשובה | ואיך רואים בדפדפן |
|---|---|---|
| `persist` נעצר (מחזור 1) | `setState` שנקראת בתוך `persist` בלי תנאי — או `persist` שנקרא מתוך `setState` | הקונסול בטעינה, ואחרי הלחיצה הראשונה: `Maximum call stack size exceeded`? |
| parse ואז בדיקה (מחזור 2) | `JSON.parse` בלי `try`; אין `Array.isArray`; `load` שמחזיר `null` | Application: `{{{` במפתח, רענון — העמוד עולה, ויש משפט? |
| `res.ok` בשורה הבאה (מחזור 3) | `await res.json()` מיד אחרי `fetch`, בלי `res.ok` | Network: "ab" בקטלוג — 422 אדום; העמוד אומר "שגיאה", או "לא נמצאו ספרים"? |
| חוזה הפרויקט | מפתח שאינו `<app>:v1`; מעטפה סביב המערך; `load() ?? BOOKS` | Application: שם המפתח, והערך מתחיל ב-`[`? מחק אותו ורענן — ריק, או שש דוגמאות? |
