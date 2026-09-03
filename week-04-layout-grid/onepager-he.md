---
title: שבוע ארבע על דף אחד
kicker: שבוע 4 · פיתוח צד לקוח
week: 4
duration: קריאה — שלוש דקות
footer: פיתוח צד לקוח 2027 · המרכז האקדמי רופין
---

> [!goal]
> אם אתה קורא רק דבר אחד מהשבוע הזה, שיהיה הדף הזה.

## הקוד שכדאי לדעת בעל פה

```css
/* a page shell — the picture holds the layout, the items only ask for a name */
.page {
  display: grid;
  grid-template-areas:
    'head'
    'main'
    'side'
    'foot';
  grid-template-columns: minmax(0, 1fr);
  gap: 1rem;
}

.masthead {
  grid-area: head;
}

@media (min-width: 40em) {
  .page {
    grid-template-areas:
      'head head'
      'side main'
      'foot foot';
    grid-template-columns: minmax(0, 12rem) minmax(0, 1fr);
  }
}

/* a row of cards that needs no media query at all */
.cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(15rem, 1fr));
  gap: 1rem;
}

/* and one card is a component — which means Flexbox */
.card {
  display: flex;
  flex-direction: column;
}

.card p {
  flex: 1; /* swallows the space, and pushes what follows to the bottom */
}
```

## חמשת הכללים של השבוע

1. **המכל מחזיק את הפריסה.** ב-Flexbox כמעט הכול על הפריטים; ב-Grid המסלולים קיימים
   לפני שיש פריט אחד.
2. **סופרים קווים, לא תאים.** שלוש עמודות זה ארבעה קווים, והאחרון הוא גם `-1`.
3. **`fr` הוא לא אחוז.** אחוז נמדד מהמכל ומתעלם מה-`gap`; `fr` מתחלק על מה שנשאר
   **אחרי** שה-`gap` ירד.
4. **Grid לעמוד, Flex לרכיב.** שורות **וגם** עמודות שצריכות להתיישר — Grid. ציר אחד
   בתוך רכיב — Flex. ואפשר, ורצוי, לקנן.
5. **בונים מהקטן כלפי מעלה.** הבסיס בלי שאילתה בכלל, וכל `min-width` מוסיפה בלבד.

## המטלה, בשש נקודות

1. הציור — ארבע על ארבע, **ביחסים ולא בפיקסלים**, וריבועי בלי גובה.
2. הלוח — `repeat(8, 1fr)`, `aspect-ratio: 1`, וצבע ב-`:nth-child`.
3. השלד — חמישה אזורים בשמות, שלושה סידורים.
4. שורת הכרטיסים — `auto-fit` עם `minmax`, בלי שאילתה.
5. הרחבה — תמונות ביחס אחיד, טיפוגרפיה זורמת, מעברים זולים.
6. אתגר — כרטיס רחב עם `dense`, ו-`subgrid` תחת `@supports`.

**אסור השבוע:** `@media (max-width: …)` · גובה קבוע על אזור פריסה · `float` · `!important` ·
`transition` על רוחב, גובה, מיקום או שוליים.

## שש הטעויות שיעלו לך זמן

| הטעות | מה נכון |
|---|---|
| `display: grid` לבד ולא קורה כלום | קיבלת grid בעמודה אחת. חסרים מסלולים |
| `grid-column: 1 / 2` ומקבלים עמודה אחת | הקווים הם הקצוות. שתי עמודות זה `1 / 3` |
| `1fr` וגלישה החוצה | `1fr` הוא `minmax(auto, 1fr)`. השתמש ב-`minmax(0, 1fr)` |
| `auto-fill` במקום `auto-fit` בשורת כרטיסים | `fill` משאיר מסלולים ריקים עומדים |
| שורה ב-`areas` עם מספר תאים שונה | ההצהרה נזרקת **בשקט**. ספור תאים בכל שורה |
| `:nth-child(odd)` על לוח ברוחב זוגי | תקבל פסים אנכיים. התקופה היא 16, לא 2 |

## איך למצוא גלילה אופקית בשנייה

```js
document.querySelectorAll('*').forEach((el) => {
  if (el.getBoundingClientRect().right > document.documentElement.clientWidth + 1) console.log(el);
});
```

## הגשה

```bash
git log -1 --format=%H
```

## אם נתקעת

`hints-he.md` — שלוש רמות לכל קושי. `deck-reference.pdf` — כל הטבלאות במקום אחד.
`demos/02-tracks/` ו-`demos/04-auto-fit-fill/` הם **כלי עבודה**, לא תצוגה: תדביק בהם את
מה שאתה לא בטוח בו. ולתרגול נוסף, עשרים דקות — CSS Grid Garden.
