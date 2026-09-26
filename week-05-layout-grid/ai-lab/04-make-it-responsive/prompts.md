# הפרומפטים — מחזור AI 4 · "תעשה את זה רספונסיבי"

שני פרומפטים, ממוספרים. P1 היא הבקשה התמימה; P2 היא אותה בקשה עם האילוצים כתובים בפנים.
את שניהם מדביקים **יחד עם `artifact/start/index.html` ו-`artifact/start/styles.css`** — ההערה
בראש הגליון היא חלק מההקשר, וזו כל הנקודה של התרגיל.

## P1 — הבקשה התמימה

**עברית (התמליל נכתב עם הנוסח הזה):**

```
הנה העמוד שלי ושני הקבצים. הוא נראה טוב על הלפטופ שלי.
תעשה אותו רספונסיבי. תן לי את styles.css המעודכן.
```

**English:**

```
Here is my page and its two files. It looks good on my laptop.
Make it responsive. Give me the updated styles.css.
```

## P2 — הבקשה המסויגת

**עברית:**

```
אותה בקשה, עם האילוצים שלי:
- mobile-first: הגליון בלי שום שאילתה הוא הפריסה של הטלפון.
- בלי שאילתות max-width בכלל. שאילתת רוחב אחת לכל היותר, min-width, ב-em —
  ותגיד לי מאיזה תוכן הגיע המספר.
- שורת .figures משנה מספר עמודות לבד, עם repeat(auto-fit, minmax(...)), בלי שאילתה.
- תבדוק את התוצאה ב-375, ב-768, ב-1100 וב-1280 — לא רק ברוחבים של המכשירים.
- אל תשנה את ה-HTML.
```

**English:**

```
Same request, with my constraints:
- Mobile-first: the stylesheet with no query at all is the phone layout.
- No max-width queries at all. At most ONE width query, min-width, in em —
  and tell me which content the number came from.
- The .figures row changes its column count by itself, with repeat(auto-fit, minmax(...)), no query.
- Check the result at 375, 768, 1100 and 1280 — not only at the device widths.
- Do not change the HTML.
```

## מה מחפשים בכל תשובה

| | P1 | P2 |
|---|---|---|
| מאיפה באו המספרים | מההערה בראש הקובץ: 480, 768, 1024 — טבלת מכשירים | מהתוכן: איפה עמודת התוכן מחזיקה שני כרטיסים |
| כיוון השאילתות | `max-width` × 3, מהגדול לקטן | `min-width` × 1, מהקטן לגדול |
| שורת המספרים | `repeat(4, 1fr)`, ובכל שאילתה מספר אחר | `repeat(auto-fit, minmax(10rem, 1fr))`, בלי שאילתה |
| ב-375, 768, 1280 | נראה נכון | נראה נכון |
| ב-1100 | **כרטיס Visitors נחתך מתחת ללוח ההודעות** | שני כרטיסים בשורה, שום דבר לא נחתך |

הסימן המסגיר אינו ש-P1 *שגויה* ברוחבים שבהם כולם בודקים — אלא שהיא שגויה **ברוחב שאף טבלת
מכשירים לא כוללת.**
