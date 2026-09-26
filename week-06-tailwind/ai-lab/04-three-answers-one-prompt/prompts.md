# הפרומפטים — מחזור AI 4 · "שלוש תשובות, פרומפט אחד"

שני פרומפטים, ממוספרים. P1 היא הבקשה התמימה — בדיוק כמו שהיא נכתבת בפעם הראשונה, ובדיוק כמו
שמדריך טיפוסי באינטרנט היה מנסח אותה: "Tailwind מ-CDN, רספונסיבי, בצבע המותג שלי". **את P1
שולחים שלוש פעמים, בשלוש שיחות נפרדות** — זה כל הרעיון של המחזור: אותה בקשה מחזירה שלוש
תשובות שונות, ואתה בוחר ביניהן. P2 היא אותה בקשה עם האילוצים של הקורס, כך שאפשר לבדוק כל אחד
מהם בדפדפן.

## P1 — הבקשה התמימה (שלוש שיחות)

**עברית:**

```
תבנה לי שורה של שלושה כרטיסים לדף של מועדון קולנוע, ב-Tailwind CSS שנטען מ-CDN.
בטלפון עמודה אחת, ובמסך רחב שלושה בשורה. בכל כרטיס כותרת, משפט אחד, וכפתור-קישור.
הכותרת הראשית והכפתורים בצבע המותג שלי: hsl(234 89% 52%). ושיהיה נגיש.
הכרטיסים: "Twelve films" · "Introduced by students" · "84 seats".
```

**English (the transcript was written with this wording):**

```
Build me a row of three cards for a film club's page, in Tailwind CSS loaded from a CDN.
One column on a phone, three across on a wide screen. Each card has a heading, one
sentence and a button-link. The main heading and the buttons in my brand colour,
hsl(234 89% 52%). Keep it accessible.
The cards: "Twelve films" · "Introduced by students" · "84 seats".
```

## P2 — הבקשה המסויגת

**עברית:**

```
אותה שורה, עם האילוצים של הפרויקט שלי:
1. Tailwind v4 מהקובץ vendor/tailwind.js שיושב ליד העמוד — בלי CDN. העמוד חייב לעבוד בלי רשת.
2. צבע המותג כטוקן ב-@theme, בתוך <style type="text/tailwindcss">. בלי tailwind.config,
   ובלי ערך צבע בסוגריים מרובעים.
3. mobile-first: בלי תחילית זה הטלפון, md: למסך רחב. בלי שום max-*.
4. טבעת פוקוס עם focus-visible: ו-outline-*, לא focus:, ולא outline-none.
5. כל מעבר רק תחת motion-safe:.
אחרי הקוד: מה יחס הניגודיות של טקסט הכפתור על הרקע שלו, ואיך אני בודק ב-375 וב-1280.
```

**English:**

```
The same row, with my project's constraints:
1. Tailwind v4 from vendor/tailwind.js, a file next to the page — no CDN. The page has to
   work with the network off.
2. The brand colour as a token in @theme, inside <style type="text/tailwindcss">. No
   tailwind.config, and no colour value in square brackets.
3. Mobile-first: no prefix is the phone, md: for a wide screen. No max-* at all.
4. A focus ring with focus-visible: and outline-*, not focus:, and not outline-none.
5. Every transition only under motion-safe:.
After the code: what is the contrast ratio of the button text on its background, and how
do I check it at 375 and at 1280?
```

## מה מחפשים בכל תשובה

כל תשובה **מופעלת כמו שהקורס מפעיל עמוד**: שורת ה-CDN מוחלפת ב-`vendor/tailwind.js` (זה
`artifact/start/`, וזה בדיוק שבוע 13 בלי רשת), ואז 375, 1280, Tab והקונסול. כך נמדדו הקבצים
ב-`artifact/`:

| | מה חזר | מה עובד כשמפעילים כמו בקורס | מה לא |
|---|---|---|---|
| **A** (שיחה 1) | CDN של v3 · הצבע ב-`tailwind.config` · `grid-cols-1 md:grid-cols-3` | הפריסה: עמודה ב-375, שלושה ב-1280 | **הצבע לא קיים.** `tailwind.config` הוא v3; הקובץ של הקורס הוא v4 ולא קורא אותו. הכפתורים לבן על כלום (1.00 : 1), הכותרת לא בצבע המותג, טבעת הפוקוס לבנה על לבן, ובקונסול: `tailwind is not defined` |
| **B** (שיחה 2) | CDN של v4 · הצבע ב-`@theme` · `flex flex-col md:flex-row` + `md:flex-1` | הכול: עמודה ב-375, שלושה שווים ב-1280 (357 × 3), הכפתור 7.79 : 1, טבעת `focus-visible` | — |
| **C** (שיחה 3) | CDN של v3 · בלי config · הצבע בסוגריים מרובעים, **שבע פעמים** · `grid-cols-1 md:grid-cols-3` | הכול עובד: אותה פריסה, 7.79 : 1 | עובד — והצבע כתוב שבע פעמים, בלי שם. `focus:` ולא `focus-visible:`: הטבעת מופיעה גם בלחיצת עכבר |
| **P2** | `vendor/tailwind.js` · `@theme` · `grid-cols-1 md:grid-cols-3` · `focus-visible:outline-*` · `motion-safe:` | הכול, וכל אילוץ ב-P2 נבדק ועומד | — |

**והמכשול עצמו:** התשובה A אינה "שגויה" במובן שרוב האנשים מחפשים. ברשת, בחדר, עם ה-CDN שהיא
ביקשה — היא נראית מושלמת. היא נשברת בתנאי אחד: כשמריצים אותה כמו שהפרויקט שלך רץ. ושתי
התשובות שנשארות עובדות — **ובחירה ביניהן היא הסעיף שאתה כותב.**
