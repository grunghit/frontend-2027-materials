# הפרומפטים — מחזור AI 4 · שלושה כרטיסים בשורה

שני פרומפטים, ממוספרים. P1 היא הבקשה התמימה; P2 היא אותה בקשה עם האילוצים כתובים בפנים.
את שניהם מדביקים **יחד עם `artifact/start/index.html` ו-`artifact/start/styles.css`** — הגליון הוא
ההקשר שמעצב את התשובה הראשונה, וזו כל הנקודה של התרגיל.

## P1 — הבקשה התמימה

**עברית (התמליל נלכד עם הנוסח הזה):**

```
הנה העמוד שלי ושני הקבצים. שלושת הכרטיסים ב-.cards ערומים אחד מתחת לשני.
שים אותם בשורה אחת, ברוחב שווה, שממלאת את הרוחב של .page. תן לי את styles.css המעודכן.
```

**English:**

```
Here is my page and its two files. The three cards in .cards are stacked one under the
other. Put them in a single row, equal widths, filling the width of .page. Give me the
updated styles.css.
```

## P2 — הבקשה המסויגת

**עברית:**

```
אותה בקשה, עם האילוצים שלי:
- Flexbox בלבד. בלי float, בלי clearfix, בלי inline-block.
- בלי אחוזים שצריכים להסתכם ל-100. הרווח בין הכרטיסים ב-gap.
- ברוחב 375 הכרטיסים נערמים לעמודה אחת — בלי שאילתת מדיה. הגלישה נעשית עם flex-wrap.
- הכרטיסים באותו גובה כשהם חולקים שורה.
- אל תיגע ב-.side ואל תשנה את ה-HTML.
```

**English:**

```
Same request, with my constraints:
- Flexbox only. No float, no clearfix, no inline-block.
- No percentages that have to add up to 100. Space between cards with gap.
- At 375px the cards stack into one column — with no media query. Wrapping is done with flex-wrap.
- Cards on the same row are equal height.
- Do not touch .side and do not change the HTML.
```

## מה מחפשים בכל תשובה

| | P1 | P2 |
|---|---|---|
| הכלי שהיא מושיטה אליו יד | מה שהגליון שהודבק כבר עושה | מה שהאילוץ שם |
| ב-1280 | שורה — נראה בסדר | שורה |
| ב-375 | שלוש עמודות צרות, מילים יוצאות מהכרטיסים | עמודה אחת |
| הגבהים | הכרטיס הגבוה גבוה יותר | שווים |
| החשבון | `31% + 3.5%` חייב להסתכם | `flex-basis` ו-`gap`, שום דבר לא מסתכם |

הסימן המסגיר אינו ש-P1 *שגויה* ב-1280 — אלא שהיא שגויה **ברוחב שצריך ללכת ולבדוק.**
