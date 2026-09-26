---
title: רמזים — טופס וטבלה והקורא שלא רואה
kicker: שבוע 2 · פיתוח צד לקוח
week: 2
duration: פתח רק כשנתקעת
footer: פיתוח צד לקוח 2027 · המרכז האקדמי רופין
---

> [!note] איך משתמשים בקובץ הזה
> אין מתרגל בקורס, ולכן זה מה שמחליף מישהו שעובר בין השולחנות.
> לכל קושי שלוש רמות: **רמז** (כיוון) · **אסטרטגיה** (איך ניגשים) · **כמעט-פתרון** (הקוד כמעט
> שלם). פתח את הרמה הבאה רק אחרי שניסית באמת חמש דקות. מי שקופץ ישר לרמה 3 לומד להעתיק.
>
> **לפני הרמזים:** כל קושי כאן הוקלד היום במחזור. הקוד שכתבת שם — `live-code/<מחזור>/end/` —
> הוא הרמז הראשון, והוא על מועדון הקולנוע, לא על האתר שלך, בכוונה.

| הקושי | השורה בניקוד | המחזור שבו הקלדת את זה | הקובץ |
|---|---|---|---|
| א · לוחצים על המילה ולא קורה כלום | טופס נגיש | מחזור 1, צעדים 1–3 | `live-code/01-form-that-fails-well/end/index.html` |
| ב · לוחצים על Email והסמן קופץ לשדה אחר | טופס נגיש · ולידציה | מחזור 1, צעד 2 (הטעות המכוונת) | אותו קובץ |
| ג · Send שולח כלום, או חצי | שמות לשדות | מחזור 1, צעדים 1 ו-6 | אותו קובץ |
| ד · איזה `type` לשים | סוגי קלט | מחזור 1, צעדים 3–4, והחימום | אותו קובץ, ו-`warmup/` |
| ה · הרמז מתחת לשדה | רמז לשדה | מחזור 1, צעד 5 | אותו קובץ |
| ו · הטבלה "נכונה" ובעץ יש רק `cell` | טבלה · כותרות שורה | מחזור 2, צעדים 1–2 | `live-code/02-table-describes-itself/end/index.html` |
| ז · איך כותבים `datetime` | תאריך למכונה | מחזור 2, צעדים 3–4 | אותו קובץ |
| ח · Lighthouse אדום על כותרת | סדר כותרות | מחזור 3, צעד 1 | `live-code/03-reader-who-cannot-see/end/index.html` |
| ט · קישור הדילוג "לא עושה כלום" | קישור דילוג | מחזור 3, צעד 2 | אותו קובץ |
| י · Tab נוחת במקום הלא נכון | סדר Tab | מחזור 3, צעדים 3–4 (הטעות המכוונת) | אותו קובץ |
| יא · `aria-current` — איפה ועל מה | העמוד הנוכחי · העמוד השני | מחזור 3, צעד 5 | אותו קובץ, ו-`about.html` שלך |
| יב · ה-`picture` מציג תמיד את הצר | תמונה שבוחרת מקור · התמונה נכנסת | מחזור 5, צעדים 2–3 (הטעות המכוונת) | `live-code/05-behaviour-without-javascript/end/index.html` |
| יג · `details` לא נפתח / תמיד פתוח | נפתח בלי JavaScript | מחזור 5, צעד 1 | אותו קובץ |
| יד · ה-radio נותנים לסמן את שניהם | קבוצת radio | מחזור 1, צעד 6 | `live-code/01-form-that-fails-well/end/index.html` |
| טו · "אז למה לא `aria-label`?" | תוויות גלויות · נגישות | מחזור 4 | `ai-lab/04-review-my-form/transcript.md` |

---

## א. "לוחצים על המילה ולא קורה כלום"

**רמז.** מילה מעל שדה היא לא תווית רק כי היא מעל השדה. תווית היא `label`, והחיבור שלה לשדה
הוא חוט אחד: `for`.

**אסטרטגיה.** לכל שדה שלושה דברים, ובסדר הזה: `id` על השדה; `label` עם `for` שמכיל **בדיוק** את
ה-`id` הזה; ואז לחיצה על המילים. אם הסמן זז — עברת. אם לא — פתח את Elements וקרא את ה-`for` ואת
ה-`id` אות-אות: `full-name` מול `fullname` זה לא אותו דבר.

**כמעט-פתרון.**

```html
<p><label for="visitor-name">Your name</label> <input type="text" id="visitor-name" name="visitor-name" required /></p>
```

---

## ב. "לוחצים על Email והסמן קופץ לשדה אחר"

**רמז.** העתקת שורה והדבקת אותה. מה נשאר זהה?

**אסטרטגיה.** הרץ `npx html-validate@9 index.html`. השורה `no-dup-id` מצביעה בדיוק על ה-`id` הכפול,
ו-`form-dup-name` על ה-`name` שנסע איתו. תקן את שניהם בשדה השני, ותקן גם את ה-`for` של התווית
שלו. הדפדפן לוקח תמיד את ה-`id` הראשון שהוא מוצא — לכן "Email" הוביל ל-"Full name".

**כמעט-פתרון.** שני השדות, שני `id` שונים, שני `name` שונים, שני `for` שונים:

```html
<p><label for="visitor-name">Your name</label> <input type="text" id="visitor-name" name="visitor-name" /></p>
<p><label for="visitor-email">Your email</label> <input type="email" id="visitor-email" name="visitor-email" /></p>
```

---

## ג. "Send שולח כלום, או חצי"

**רמז.** `id` הוא לעמוד. `name` הוא לשרת. שדה בלי `name` נראה על המסך ולא קיים בשליחה.

**אסטרטגיה.** `<form method="get">` שולח לאותו עמוד, ושורת הכתובת מראה לך בדיוק מה יצא:
`?visitor-name=Maya&visitor-email=...`. מלא הכול, לחץ Send, וספור מפתחות. חסר אחד? לשדה הזה אין
`name`. גם `select`, `textarea` ו-`radio` צריכים `name`.

**כמעט-פתרון.** ל-radio יש `name` **משותף** ו-`value` שונה — כך נשלח ערך אחד:

```html
<p><input type="radio" id="reply-email" name="reply-by" value="email" checked /> <label for="reply-email">Email</label></p>
<p><input type="radio" id="reply-phone" name="reply-by" value="phone" /> <label for="reply-phone">Phone</label></p>
```

---

## ד. "איזה `type` לשים"

**רמז.** `type` הוא ולידציה בחינם: `email` מסרב לטקסט בלי @, `number` מסרב לאותיות, `date` פותח
בוחר תאריכים. ומקלדת מתאימה בטלפון.

**אסטרטגיה.** עבור על השדות שלך ושאל על כל אחד: מה הערך הנכון כאן? מייל — `email`. טלפון —
`tel`. מספר — `number` עם `min` ו-`max`. תאריך — `date`. בחירה אחת מכמה — `radio`. כל השאר —
`text`, וזה בסדר. הבודק רוצה שניים לפחות שאינם `text`, ואחד מהם `email`.

**כמעט-פתרון.**

```html
<input type="email" id="visitor-email" name="visitor-email" required />
<input type="tel" id="visitor-phone" name="visitor-phone" />
```

---

## ה. "הרמז מתחת לשדה"

**רמז.** תווית היא **השם** של השדה. רמז הוא **התיאור** שלו. שניהם מוקראים, ושניהם מחוברים
לשדה — בשני חוטים שונים.

**אסטרטגיה.** פסקה עם `id` מתחת לשדה, ו-`aria-describedby` על השדה שמכיל את ה-`id` הזה. פתח את
לשונית Accessibility על השדה: Name הוא התווית, Description הוא הרמז.

**כמעט-פתרון.**

```html
<p>
  <label for="visitor-email">Your email</label>
  <input type="email" id="visitor-email" name="visitor-email" required aria-describedby="visitor-email-hint" />
</p>
<p id="visitor-email-hint">I reply from my student address, usually within two days.</p>
```

---

## ו. "הטבלה נכונה ובעץ יש רק `cell`"

**רמז.** `td` מודגש הוא תא. כותרת היא `th`, ו-`scope` אומר על מה היא חלה.

**אסטרטגיה.** שלושה חלקים: `caption` ראשון, `thead` עם שורה אחת שכל התאים בה `th scope="col"`,
`tbody` עם השורות. בכל שורה ב-`tbody` התא הראשון (שם הקורס, שם הסרט) הוא `th scope="row"`.
בדוק בלשונית Accessibility: `columnheader` ו-`rowheader`.

**כמעט-פתרון.**

```html
<table>
  <caption>My courses this semester</caption>
  <thead>
    <tr><th scope="col">Course</th><th scope="col">Day</th><th scope="col">Room</th></tr>
  </thead>
  <tbody>
    <tr><th scope="row">Databases</th><td>Wednesday</td><td>301</td></tr>
  </tbody>
</table>
```

---

## ז. "איך כותבים `datetime`"

**רמז.** שנה-חודש-יום, עם מקפים, ספרות בלבד. הטקסט בפנים — איך שתרצה.

**אסטרטגיה.** `2027-11-02` הוא תאריך. `2027-11` הוא חודש. `2027` היא שנה. `2027-11-02T19:30` הוא
תאריך ושעה. "2 Nov 2027" הוא לא כלום מבחינת מכונה — ואף אחד לא יתלונן, גם לא הוולידטור.

**כמעט-פתרון.**

```html
<p>Written on <time datetime="2027-11-02">2 November 2027</time>, after the second lab.</p>
```

---

## ח. "Lighthouse אדום על כותרת"

**רמז.** `h4` אחרי `h2` הוא דילוג. כותרת היא רמה, לא גודל.

**אסטרטגיה.** DevTools, Lighthouse, Accessibility, Analyze. השורה `Heading elements are not in a
sequentially-descending order` מראה איזו כותרת. שנה אותה לרמה שאחרי הקודמת. הרץ שוב. ואם
נשארה שורת `target-size` — היא על ריווח, מתוקנת ב-CSS בשבוע הבא, ולא נספרת.

**כמעט-פתרון.** אחרי `<h2>What I am learning</h2>` הכותרת הבאה בתוך המקטע היא `h3`, לא `h4`.

---

## ט. "קישור הדילוג לא עושה כלום"

**רמז.** שלושה חלקים: קישור, `id` על היעד, ו-`tabindex="-1"` על היעד.

**אסטרטגיה.** הקישור הוא האלמנט **הראשון** ב-`body`, לפני ה-`header`. `href="#main"` דורש `main`
עם `id="main"`. ובלי `tabindex="-1"` ה-`main` לא יכול לקבל פוקוס: אחרי הלחיצה `document.activeElement`
נשאר `body`. בדוק: לחץ בשורת הכתובת, Tab, Enter, ואז `document.activeElement` בקונסול.

**כמעט-פתרון.**

```html
<body>
  <a href="#main">Skip to content</a>
  <header>...</header>
  <nav>...</nav>
  <main id="main" tabindex="-1">...</main>
```

---

## י. "Tab נוחת במקום הלא נכון"

**רמז.** סדר ה-Tab הוא סדר המסמך. אם הוספת `tabindex` עם מספר חיובי — זה מה ששבר אותו.

**אסטרטגיה.** חפש `tabindex=` בקובץ. הערך היחיד שמותר השבוע הוא `-1`, על ה-`main`. כל מספר
חיובי — מחק. אם משהו באמת צריך להיות קודם, הזז אותו בקובץ.

**כמעט-פתרון.** `<button type="submit">Send</button>` — בלי `tabindex`, אחרון בטופס.

---

## יא. "`aria-current` — איפה ועל מה"

**רמז.** על **הקישור לעמוד שאתה נמצא בו**, ורק עליו. ב-`index.html` — Home. ב-`about.html` — הקישור
ל-`about.html`.

**אסטרטגיה.** בכל עמוד: `$$('nav a[aria-current="page"]').length` צריך להחזיר `1`, וה-`href` של
הקישור המסומן צריך להיות שם הקובץ שאתה בו. אם ב-`about.html` אין קישור ל-`about.html` — הוסף
אחד ("Longer version"), וסמן אותו.

**כמעט-פתרון.** ב-`index.html`:

```html
<li><a href="index.html" aria-current="page">Home</a></li>
```

וב-`about.html`:

```html
<li><a href="index.html">Home</a></li>
<li><a href="about.html" aria-current="page">Longer version</a></li>
```

---

## יב. "ה-`picture` מציג תמיד את הצר"

**רמז.** מה בא ראשון בתוך `picture` — ה-`source` או ה-`img`?

**אסטרטגיה.** ה-`img` הוא **תמיד אחרון**; `source` שבא אחריו לא נקרא. הוולידטור אומר את זה
בשורת `element-permitted-order`. ה-`alt`, ה-`width` וה-`height` הם על ה-`img`. בדוק בסרגל המכשירים
ב-375 וב-1280: שתי תמונות שונות, בלי פס גלילה.

**כמעט-פתרון.**

```html
<picture>
  <source media="(min-width: 700px)" srcset="images/banner-wide.svg" width="640" height="120" />
  <img src="images/banner-narrow.svg" alt="A banner with my name" width="320" height="120" />
</picture>
```

---

## יג. "`details` לא נפתח / תמיד פתוח"

**רמז.** `summary` הוא הילד הראשון של `details`. אם הוא לא שם, הדפדפן מציג "Details".

**אסטרטגיה.** `details` סגור כברירת מחדל; אם הוא פתוח מההתחלה, יש עליו תכונה `open` — מחק
אותה. אם הוא לא נפתח בכלל — בדוק שה-`summary` נמצא **בתוך** ה-`details`, ראשון.

**כמעט-פתרון.**

```html
<details>
  <summary>What I read this week</summary>
  <ul><li>...</li></ul>
</details>
```

---

## יד. "ה-radio נותנים לסמן את שניהם"

**רמז.** מה מחבר שני `radio` לקבוצה אחת? לא ה-`fieldset` — ה-`name`.

**אסטרטגיה.** אותו `name` על כל ה-`radio` בקבוצה, `value` שונה לכל אחד, `id` שונה לכל אחד
ו-`label for` משלו. ה-`fieldset` עם ה-`legend` הוא השאלה ("Reply by"); ה-`label` הוא התשובה.

**כמעט-פתרון.** ראה סעיף ג.

---

## טו. "אז למה לא `aria-label`?"

**רמז.** כי לחצת עליו במחזור 4 ולא קרה כלום.

**אסטרטגיה.** `aria-label` נותן לשדה שם שקורא מסך שומע — ולכן axe ו-Lighthouse עוברים. הוא לא
נותן מילים על המסך שאפשר ללחוץ עליהן, ומי שרואה את המילים ושומע שם אחר מקבל שני דברים
שלא תואמים. תווית גלויה עושה את שניהם, ולכן היא התקן. אותו דבר ל-`placeholder`: הוא רמז
לפורמט, נעלם כשמקלידים, ולעולם לא כל מה שיש לשדה.

**כמעט-פתרון.** חפש `aria-label` בקובץ; כל אחד שמצאת — הפוך את המילים שמעליו ל-`label for`,
ומחק אותו.
