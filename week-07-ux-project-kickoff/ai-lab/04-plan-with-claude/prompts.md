# הפרומפטים — מחזור AI 4 · תוכנית פרויקט עם Claude

שני פרומפטים, ממוספרים. P1 היא הבקשה התמימה — ארבע שורות על הנושא ורשימת הסעיפים, "תכתוב לי
תוכנית מלאה" — כמו שכמעט כל אחד פותח. P2 היא אותה בקשה עם **התבנית כולה, כולל ההנחיות שבה**, ועם
האילוצים של הפרויקט כפי שהבריף כותב אותם, כך שאפשר לבדוק מול הבריף אם התשובה עומדת בהם.

הנושא בשתיהן הוא `artifact/topic-brief-he.md` — **Plant Shelf**, נושא עצמאי שאינו במאגר, בכוונה:
אף אחד לא יכול לבחור אותו, ולכן מותר להראות עליו תוכנית שלמה.

## P1 — הבקשה התמימה

**עברית (התמליל נכתב עם הנוסח הזה):**

```
אני מתחיל פרויקט גמר בקורס פיתוח צד לקוח. זה הנושא:

אני רוצה לבנות אפליקציה למעקב אחרי צמחי הבית שלי.
לכל צמח יש שם, מין, איפה הוא עומד בבית, וכל כמה ימים משקים אותו.
אני רוצה לראות על מסך אחד מי צריך מים היום, ולסמן "השקיתי".
ואם אפשר — תקציר על המין מאיזה מקור ציבורי, כדי לזכור איך מטפלים בו.

תכתוב לי תוכנית פרויקט מלאה, עם הסעיפים האלה:
1. משפט אחד · 2. למי זה, ומה המסלול המרכזי · 3. האוסף · 4. שלושת העמודים ·
5. ה-API · 6. ארבעת המצבים · 7. צורת ה-state · 8. פיצ'רים — ליבה, ואחר כך ·
9. סיכונים · 10. לוח הזמנים
```

**English:**

```
I am starting the final project of a front-end course. This is the topic:

I want to build an app that tracks my house plants.
Each plant has a name, a species, where it stands in the flat, and how often it is watered.
I want one screen that shows which plants need water today, and a "watered" button.
And if possible, a short summary of the species from some public source.

Write me a complete project plan with these sections:
1. One sentence · 2. Who it is for, and the main path · 3. The collection ·
4. The three pages · 5. The API · 6. The four states · 7. The shape of the state ·
8. Features, core and later · 9. Risks · 10. Timeline
```

## P2 — הבקשה המסויגת

**עברית:**

```
הנה התבנית של PROJECT_PLAN.md, כולל ההנחיות שבתוכה — הן הנחיות גם לך:

[כאן מדביקים את PROJECT_PLAN.md מתיקיית week-07 כולו, מההערה הראשונה ועד סעיף 11]

הנושא:
[ארבע השורות מ-topic-brief-he.md]

האילוצים של הפרויקט, מהבריף שלו:
- ישות אחת.
- שלושה עמודים: רשימה, פריט אחד, ועמוד שלישי שכל הנתונים בו נגזרים.
- הנתונים נשמרים ב-localStorage בלבד. אין שרת, אין התחברות, אין משתמש שני.
- API ציבורי אחד, בלי מפתח.
- HTML, Tailwind ו-JavaScript, בלי ספריות.

מלא את סעיפים 1 עד 10. לכל היותר חמישה פיצ'רים בליבה, וסעיף "לא אבנה" שאומר מה
נשאר בחוץ ולמה. סעיף 6 בטקסט שיופיע על המסך, עם שני מצבים ריקים שונים. סעיף 7 עם
status כשדה אחד בעל ארבעה ערכים. סמן [ניחוש] בכל מקום שבו החלטת במקומי, ובכל API
שלא בדקת בעצמך. את סעיף 11 השאר ריק — אותו אני כותב.
לוח הזמנים לפי אבני הדרך: 7 תוכנית · 8 ממשק סטטי · 9 אירועים · 10 state ו-render ·
11 localStorage ו-API · 12 TypeScript והגשה.
```

**English:**

```
Here is the PROJECT_PLAN.md template, including the guidance inside it. The guidance
is for you as well:

[paste the whole PROJECT_PLAN.md from the week-07 folder, first comment to section 11]

The topic:
[the four lines of topic-brief-he.md]

The project's constraints, from its brief:
- One entity.
- Three pages: a list, one item, and a third page whose every number is derived.
- Data is kept in localStorage only. No server, no login, no second user.
- One public API, with no key.
- HTML, Tailwind and JavaScript, no libraries.

Fill sections 1 to 10. At most five core features, and a "will not build" section that
says what stays out and why. Section 6 in the words that will be on screen, with two
different empty states. Section 7 with status as one field with four values. Mark
[guess] wherever you decided for me, and on any API you did not check yourself. Leave
section 11 empty; I write that one.
Timeline by the milestones: 7 plan · 8 static UI · 9 events · 10 state and render ·
11 localStorage and the API · 12 TypeScript and submission.
```

## מה ההבדל בין השניים, בשורה

P1 מבקשת **תוכנית**; P2 מבקשת **את התוכנית הזאת** — עם הגבולות של הפרויקט, עם מקום שבו המודל
חייב להודות שניחש, ועם הסעיף שהוא לא כותב. כל שורה ב-P2 היא משהו שאפשר לבדוק בתשובה: לספור
פיצ'רים, לחפש שרת, לפתוח את ה-API בדפדפן.
