# הפרומפטים — מחזור AI 4 · שאלה אחת על `section`, `article`, `b` ו-`i`

שני פרומפטים, ממוספרים. P1 היא השאלה התמימה — כמו שסטודנט שואל בדקה הראשונה. P2 היא אותה
שאלה עם אילוץ אחד שהופך את התשובה לניתנת לבדיקה. את שניהם מדביקים **יחד עם
`artifact/start/index.html`** — השאלה היא על הסימון הזה, לא על HTML באופן כללי.

## P1 — השאלה התמימה

**עברית (התמליל נכתב עם הנוסח הזה):**

```
הנה העמוד שלי. יש בו section בתוך section, ואני לא בטוח אם הפנימי צריך להיות article.
מה ההבדל בין section ל-article, ומתי בוחרים בכל אחד? ובאותה הזדמנות: השתמשתי ב-b וב-i.
זה בסדר, או שצריך strong ו-em? תן תשובה קצרה עם דוגמה.
```

**English:**

```
Here is my page. It has a section inside a section, and I am not sure the inner one
should be an article. What is the difference between section and article, and when do
you choose each? And while we are at it: I used b and i. Is that fine, or should it be
strong and em? Short answer with an example.
```

## P2 — השאלה המסויגת

**עברית:**

```
אותה שאלה, עם אילוץ: ענה רק לפי מה שכתוב ב-MDN או בתקן HTML Living Standard.
לכל טענה כתוב את שם העמוד ב-MDN שממנו היא באה. אל תכתוב שאלמנט "מיושן" או "deprecated"
אלא אם בעמוד שלו ב-MDN מופיע הסימון הזה. אם אינך בטוח — כתוב "לא בטוח".
```

**English:**

```
Same question, with one constraint: answer only from what MDN or the HTML Living
Standard says. For every claim, name the MDN page it comes from. Do not call an element
"obsolete" or "deprecated" unless its MDN page carries that badge. If you are not sure,
say "not sure".
```

## מה מחפשים בכל תשובה

| | P1 | P2 |
|---|---|---|
| `section` מול `article` | הסבר סביר, עם דוגמה | אותו הסבר, עם שם עמוד ב-MDN לכל טענה |
| `b` ו-`i` | טענה בטוחה ובלתי מסומנת | טענה עם מקור, או "לא בטוח" |
| מה בודקים | כל טענה שאפשר לבדוק ב-MDN תוך דקה | שהמקור שנכתב אומר את מה שנטען |

הסימן המסגיר אינו שהתשובה ל-P1 *שגויה* — רובה נכונה. הסימן הוא **טענה אחת בטוחה שאי אפשר
להבחין בה מהנכונות בלי לפתוח את MDN.** זו כל הנקודה של המחזור.
