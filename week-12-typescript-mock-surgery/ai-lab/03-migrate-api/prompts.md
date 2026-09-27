# הפרומפטים — מחזור AI 3 · "העבר את api.js ל-TypeScript"

שני פרומפטים, ממוספרים. P1 היא הבקשה התמימה — כמו שכמעט כל אחד מבקש: "תעביר, שיתקמפל". P2 היא
אותה בקשה אחרי שתפסת מה חזר: ארבעה חוקים כתובים בגוף הפרומפט, כל אחד משהו שאפשר לבדוק בתשובה —
ב-`grep`, ב-`npx tsc`, ובדפדפן.

היישום בשניהם הוא ספריית ההשאלה של מחזורים 1–2 (`artifact/start/`): `ts/types.ts` ו-`ts/storage.ts`
כבר הועברו בידיים, `ts/dom.ts` נכתב במחזור 2, ו-`js/api.js` הוא עדיין JavaScript — הוא טוען את
הקטלוג מ-`data/books.json`, ייצוא שבו **שורה אחת בלי שם**.

**ב-Claude Code** אותן מילים בדיוק, והקבצים כבר שם: לא מדביקים, מצביעים (`js/api.js`,
`ts/types.ts`, `tsconfig.json`). **בצ'אט** מדביקים את שלושתם. הסקירה זהה, והציון זהה.

## P1 — הבקשה התמימה

**עברית (התמליל נכתב עם הנוסח הזה):**

```
תעביר את js/api.js ל-TypeScript. הקובץ החדש: ts/api.ts.
הוא צריך להתקמפל עם npx tsc -p tsconfig.json — ה-tsconfig ו-ts/types.ts למטה.
תשאיר את ההתנהגות כמו שהיא.

<js/api.js · ts/types.ts · tsconfig.json — מודבקים במלואם>
```

**English:**

```
Move js/api.js to TypeScript. The new file: ts/api.ts.
It has to compile with npx tsc -p tsconfig.json — the tsconfig and ts/types.ts are below.
Keep the behaviour as it is.

<js/api.js · ts/types.ts · tsconfig.json — pasted whole>
```

## P2 — הבקשה המסויגת

**עברית:**

```
תעביר את js/api.js ל-ts/api.ts, תחת strict — ה-tsconfig ו-ts/types.ts למטה.
ארבעה חוקים:
1. אין any באף מקום, גם לא ב-catch.
2. מה שיוצא מ-res.json() מוקלד unknown, ומצומצם בשומרים שכבר יש ב-ts/types.ts
   (isRecord, isBook) — לעולם לא ב-as.
3. אין @ts-ignore ואין @ts-expect-error. שגיאה שהמהדר מצא — מתקנים אותה, לא משתיקים.
4. כל בדיקה שה-JavaScript עושה היום נשארת, וגם הספירה של השורות שלא נקראו.
   שדות של מחלקה מוצהרים עם טיפוס.
אחרי הקוד: רשימה של כל מקום שבו החלטת משהו שהחוקים לא אמרו.

<js/api.js · ts/types.ts · tsconfig.json — מודבקים>
```

**English:**

```
Move js/api.js to ts/api.ts, under strict — the tsconfig and ts/types.ts are below.
Four rules:
1. No any anywhere, not even in a catch.
2. What comes out of res.json() is typed unknown and narrowed by the guards that are
   already in ts/types.ts (isRecord, isBook) — never with as.
3. No @ts-ignore and no @ts-expect-error. An error the compiler found is fixed, not silenced.
4. Every check the JavaScript makes today stays, and so does the count of rows that could
   not be read. Class fields are declared with a type.
After the code: a list of every place where you decided something the rules did not say.

<js/api.js · ts/types.ts · tsconfig.json — pasted>
```

## מה לבדוק בתשובה — לפני שמריצים

| החוק | מה מחפשים בתשובה | ואיך בודקים |
|---|---|---|
| אין `any` | `: any`, `as any`, `any[]` — גם בתוך `catch (error: any)` | `grep -n "any" ts/api.ts` — אפס שורות |
| `unknown` בגבול | `res.json()` נכנס למשתנה `: unknown`; השורה הבאה היא `isRecord` / `Array.isArray` / `isBook` | בקובץ `data/books.json` יש שורה בלי שם: הסטטוס אומר **שישה** ספרים ו"שורה אחת לא נקראה" |
| אין השתקה | `@ts-ignore`, `@ts-expect-error`, `as unknown as` | `grep -n "ts-ignore\|ts-expect" ts/api.ts` — אפס שורות; `npx tsc -p tsconfig.json` — אפס שגיאות **בלי** ההשתקה |
| אותן בדיקות | `res.ok` לפני `res.json()`; שלושת סוגי ה-`LookupError`; `skipped` שמחושב ולא נכתב כמספר | `git diff` בין `js/api.js` שנוצר לבין הקובץ המקורי: סוגריים ורווחים — בסדר; תנאי שנעלם — לא |
