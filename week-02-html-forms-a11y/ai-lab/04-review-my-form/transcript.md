# תמליל — ביקורת נגישות על טופס: "aria-label מספיק?"

model: claude-opus-5 · captured: 2026-09-21 · how: סשן הכתיבה של הקורס ב-Claude Code — אותו מודל עונה על P1 ועל P2 כפי שצ'אט היה עונה, עם `artifact/start/index.html` מודבק כהקשר. **זה אינו צילום מהצ'אט בדפדפן:** התשובות למטה נכתבו בסשן הכתיבה עצמו, על ידי המודל שכתב את השבוע. לפני השיעור: הרץ את P1 פעם אחת בצ'אט, והדבק את התשובה במקום זו שלמטה, עם התאריך. תאריך הסשן: 2026-09-21. המדידות שבסוף כל תשובה נעשו על הקבצים ב-`artifact/` עם axe-core 4.13 (דרך `@axe-core/playwright`, התגיות `wcag2a` ו-`wcag2aa` — מה שהבודק מריץ), Lighthouse 12.8 (Chrome, קטגוריית Accessibility בלבד) ו-Chromium דרך Playwright.

> **למה הקובץ הזה קיים.** פלט של מודל אינו דטרמיניסטי, ומודלים מתחלפים. המחזור רץ חי אם
> התשובה של החדר ל-P1 מאשרת ש-`aria-label` מספיק ומבטיחה שהכלי יעבור; אם לא — פותחים את
> הקובץ הזה ומשווים. **ההשוואה בין מה שהחדר קיבל למה שכתוב כאן היא בעצמה השיעור:** אותה
> שאלה, שתי תשובות, ורק אחת מהן הופעלה בדפדפן. התשובות למטה הן של המודל, כלשונן; ההערות
> המסומנות `> **מכשול**` הן של המרצה.

## You

הנה טופס ההצטרפות של החוג לדיבייט. הרצתי עליו Lighthouse וקיבלתי שורה אדומה על שדה
בלי תווית. קראתי ש-aria-label נותן לשדה שם לקורא מסך. אם אוסיף aria-label לכל שדה — זה
מספיק כדי שקורא מסך יוכל למלא את הטופס, ושהוא יעבור axe ו-Lighthouse? הייתי מעדיף לא
לשנות את המבנה: המילים מעל השדה נשארות טקסט רגיל, והרמז נשאר בתוך השדה.

*(כאן הודבק `artifact/start/index.html`)*

## Claude

כן — `aria-label` על כל שדה יסגור את השורה האדומה, ועם עוד שלושה תיקונים קטנים הטופס
יעבור גם axe וגם Lighthouse בלי הערות.

**מה השורה האדומה אומרת.** הכלל `label` של axe (Lighthouse מריץ אותו) דורש שלכל פקד טופס
יהיה **שם נגיש** — משהו שקורא מסך יכול להקריא כשהמשתמש מגיע לשדה. שלושת ה-`input` שלך
כבר עוברים אותו: ה-`placeholder` משמש כשם כשאין שום דבר אחר. ה-`textarea` הוא היחיד בלי
`placeholder`, ולכן הוא היחיד שנתפס. `aria-label` נותן שם מפורש שגובר על ה-`placeholder`,
וזה עדיף — ה-`placeholder` נעלם כשמקלידים, והשם מ-`aria-label` נשאר.

**מה עוד חסר, בלי קשר לנגישות.** לאף שדה אין `name`, ולכן שליחה של הטופס לא שולחת כלום.
`type="email"` ו-`type="number"` יתנו ולידציה ומקלדת מתאימה בטלפון, ו-`required` ימנע
שליחה ריקה.

```html
<form method="get">
  <p><span>Full name</span> <input type="text" name="full-name" aria-label="Full name" placeholder="Full name" required /></p>
  <p><span>Email</span> <input type="email" name="email" aria-label="Email" placeholder="Email" required /></p>
  <p><span>Year of study</span> <input type="number" name="year" aria-label="Year of study" placeholder="1, 2 or 3" min="1" max="3" /></p>
  <p><span>Why do you want to join?</span> <textarea name="reason" aria-label="Why do you want to join?" rows="3"></textarea></p>
  <button type="submit">Send</button>
</form>
```

המבנה נשאר בדיוק כפי שרצית: המילים מעל השדה הן טקסט רגיל, הרמז בתוך השדה. לצורך
הדיוק: `<label for>` נחשב לפרקטיקה המועדפת, כי הוא גם מחבר את הטקסט הגלוי לשדה; אבל
מבחינת הדרישה — שם נגיש לכל פקד — `aria-label` עונה עליה במלואה, ו-axe ו-Lighthouse
יעברו.

> **מכשול.** כל טענה כאן נכונה מבחינת הכלי שהיא מצטטת — ובדיוק שם הבעיה. הופעל על
> `artifact/claude-p1/index.html` ונמדד: axe-core 4.13 (`wcag2a`, `wcag2aa`) — **0 ליקויים**;
> Lighthouse 12.8, Accessibility — **100** (ולפני התיקון, על `artifact/start/`: 91, שורה אחת
> אדומה, `label`, על ה-`textarea`). ועכשיו מה הכלי לא בדק: לחיצה על המילים Full name —
> `document.activeElement` נשאר `body`, הסמן לא זז; הקלדה של אות אחת — הרמז נעלם; בלשונית
> Accessibility השם של השדה הוא `"Full name"` מתוך `aria-label` — מחרוזת שנייה, נסתרת,
> שמישהו יצטרך לתחזק במקביל למילים שעל המסך (ולפני התיקון, שם השדה השלישי היה `"1, 2 or 3"`
> — ה-`placeholder`, כי הוא היה השם היחיד). והבדיקה האוטומטית של המטלה, `form-accessible`,
> סופרת `label` עם `for` שתואם ל-`id`: **0 מתוך 4**. איך רואים את זה בחדר: Lighthouse ירוק,
> ואז לוחצים על המילים. התשובה ענתה על השאלה כפי שנשאלה — "זה מספיק?" — ואמרה מה
> המועדף בחצי משפט. השאלה הובילה; התשובה הלכה. ירוק הוא רצפה.

## You

אותו טופס, עם אילוץ: לכל שדה תהיה תווית גלויה — label עם for שמצביע על ה-id של השדה —
כך שלחיצה על המילים שמעל השדה תזיז את הסמן לתוכו. בלי aria-label על שדות, ובלי
placeholder כתחליף לתווית (מותר placeholder רק כדוגמה לפורמט). אחרי הקוד, כתוב לי איך
לבדוק בדפדפן שהאילוץ מתקיים — בלי כלי אוטומטי.

## Claude

הנה הטופס עם תווית גלויה לכל שדה. ה-`span` הופך ל-`label`, כל שדה מקבל `id`, וה-`for`
מצביע עליו — זה מה שהופך את המילים למשהו שאפשר ללחוץ עליו. `aria-label` ירד מכל השדות:
כשיש `label` מקושר, הוא השם, ואין צורך במחרוזת שנייה. `placeholder` נשאר רק על המייל,
כדוגמה לפורמט. שלושת שדות הפרטים מקובצים ב-`fieldset` עם `legend`, כדי שקורא מסך יגיד
"About you" לפני השדה הראשון:

```html
<form method="get">
  <fieldset>
    <legend>About you</legend>
    <p><label for="full-name">Full name</label> <input type="text" id="full-name" name="full-name" required /></p>
    <p><label for="email">Email</label> <input type="email" id="email" name="email" placeholder="name@example.com" required /></p>
    <p><label for="year">Year of study</label> <input type="number" id="year" name="year" min="1" max="3" /></p>
  </fieldset>
  <p><label for="reason">Why do you want to join?</label> <textarea id="reason" name="reason" rows="3"></textarea></p>
  <button type="submit">Send</button>
</form>
```

**איך בודקים בדפדפן, בלי כלי:**

1. **לחיצה.** לחץ על המילים מעל כל שדה — ארבע פעמים. בכל פעם הסמן צריך להיות בתוך השדה
   שמתחת למילים. אם לחיצה אחת לא עושה כלום, ה-`for` שלה לא תואם ל-`id` של השדה (או שה-`id`
   כפול — ואז הסמן קופץ לשדה הלא נכון).
2. **הקלדה.** הקלד בכל שדה. המילים מעליו נשארות; רק הרמז במייל נעלם, וזה בסדר, כי הוא לא
   התווית.
3. **העץ.** Elements, לשונית Accessibility, על כל שדה: Name הוא בדיוק המילים שרואים על
   המסך, והמקור שלו הוא `label`, לא `aria-label`. על השדה הראשון גם Group "About you".
4. **Tab.** מהקישור הראשון בעמוד, Tab עד הטופס: השדות מגיעים לפי סדר המסמך, ו-Send
   אחרון.

> **מה השתנה בין התשובות.** לא הידע — האילוץ. כשהבקשה אמרה מה צריך להיות נכון בדפדפן,
> התשובה בנתה את זה, וגם הסבירה איך לבדוק את זה ביד. הופעל על `artifact/claude-p2/index.html`
> ונמדד: axe-core 4.13 — 0 ליקויים; Lighthouse 12.8 — 100; לחיצה על Full name —
> `document.activeElement` הוא ה-`input`; `form-accessible` — **4 מתוך 4**. שתי התשובות ירוקות
> בכלי. רק אחת מהן עומדת בתקן. זו השורה ביומן שלך: הטענה, איך בדקת, המסקנה.
