# מה חזר ל-P1 — כלשונו

<!-- The model's answer to P1, verbatim from transcript.md. One claim in it is wrong; find it before you read the transcript's note. -->

**`section` מול `article` — המבחן הוא "האם זה עומד לבד".**

- `<section>` הוא קבוצה נושאית של תוכן, בדרך כלל עם כותרת משלה. הוא חלק ממשהו גדול יותר:
  "שעות פתיחה" בתוך עמוד של בית קפה, "הערות קריאה" בתוך עמוד אישי.
- `<article>` הוא יחידה שלמה שעומדת בפני עצמה — פוסט, כתבה, ביקורת, תגובה. המבחן: אם תשלח
  רק את החלק הזה למישהו, בלי שאר העמוד, הוא עדיין הגיוני? אם כן — `article`.

בעמוד שלך, ה-`section` הפנימי ("What the validator catches, and what it does not") הוא
רשומת קריאה אחת: יש לה כותרת משלה, אפשר לפרסם אותה לבד, ומחר תוסיף עוד אחת כמוה. זה
`article`. ה-`section` החיצוני ("Reading notes") נשאר `section` — הוא הקבוצה שמכילה את
הרשומות:

```html
<section id="notes">
  <h2>Reading notes</h2>
  <article>
    <h3>What the validator catches, and what it does not</h3>
    <p>It catches a tag I forgot to close. It does not catch a div that should have been a nav.</p>
  </article>
</section>
```

**`b` ו-`i` — כאן צריך להחליף.** `<b>` ו-`<i>` הם אלמנטים מיושנים (deprecated) מ-HTML 4:
הם תיארו מראה — מודגש, נטוי — ולא משמעות, ו-HTML5 החליף אותם ב-`<strong>` (חשיבות) וב-`<em>`
(הדגשה). קורא מסך יכול לשנות טון עבור `strong` ו-`em`; עבור `b` ו-`i` הוא לא עושה כלום. אז:

```html
<p>Learning what the browser does with the text I send it. <strong>No CSS yet.</strong></p>
<p>It does not catch a <em>div</em> that should have been a <em>nav</em>.</p>
```

לסיכום: הפנימי הופך ל-`article`, החיצוני נשאר `section`, וכל `b` ו-`i` הופכים ל-`strong`
ו-`em`.
