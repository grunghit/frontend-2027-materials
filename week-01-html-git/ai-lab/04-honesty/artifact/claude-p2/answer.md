# מה חזר ל-P2 — כלשונו

<!-- The model's answer to P2, verbatim from transcript.md: the same question, with the constraint that every claim names its MDN page. -->

**`section` מול `article`**

- `<section>` — "HTML generic section element" (MDN): קטע עצמאי מבחינה נושאית של מסמך, שאין לו
  אלמנט סמנטי ספציפי יותר שמתאים לו; כמעט תמיד עם כותרת.
- `<article>` — "HTML article contents element" (MDN): יחידה שלמה ועצמאית שנועדה להיות ניתנת
  להפצה או לשימוש חוזר בפני עצמה — פוסט, כתבה, תגובה, ווידג'ט.
- ההמלצה שלי לעמוד שלך זהה לקודם: הרשומה הפנימית עומדת לבד ועונה להגדרה של `article`;
  הקבוצה "Reading notes" נשארת `section`. **לא בטוח** אם MDN מכריע במקרה הזה — שני
  העמודים נותנים הגדרות, לא כלל הכרעה, והבחירה ביניהם היא שלך.

**`b` ו-`i`**

- `<b>` — "HTML bring attention to element" (MDN): מושך תשומת לב לטקסט בלי להעניק לו חשיבות
  מיוחדת. בעמוד אין סימון Deprecated. הטענה שכתבתי קודם, שהוא מיושן, **הייתה שגויה.**
- `<i>` — "HTML idiomatic text element" (MDN): טקסט שנבדל מהטקסט הרגיל מסיבה כלשהי — מונח
  טכני, מחשבה, שם מדעי. גם כאן אין סימון Deprecated.
- `<strong>` — "HTML strong importance element" (MDN): חשיבות, רצינות או דחיפות.
- `<em>` — "HTML emphasis element" (MDN): הדגשה שמשנה את משמעות המשפט.
- מה שכן מסומן Deprecated ב-MDN, לצורך ההשוואה: `<center>`, `<font>`, `<big>`, `<strike>`,
  `<tt>`.

לכן, לעמוד שלך: `<b>No CSS yet.</b>` — אם המשפט חשוב, `strong`; אם רק רצית שיבלוט,
`b` תקין. `<i>div</i>` ו-`<i>nav</i>` הם שמות של אלמנטים — "קול אחר" — ו-`i` הוא בחירה
לגיטימית; `code` היה מדויק עוד יותר. שני התיקונים הם עניין של משמעות, לא של תקינות.
