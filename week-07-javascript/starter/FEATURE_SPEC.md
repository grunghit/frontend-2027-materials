<!--
  ============================================================================
  FEATURE_SPEC.md — PART ד. Your first one.

  This is `templates/FEATURE_SPEC.md` from the materials repository, copied here
  and SCOPED TO WEEK 7. Read the template's own header once — it explains the loop
  and it explains why the spec comes before the code.

  ── WHAT IS DIFFERENT ABOUT THIS ONE

  The template is written for a feature with BEHAVIOUR. Yours has none yet: this
  week the pages are static and there is no JavaScript in the project. So:

    §1 §2 §3 §5 §6   filled properly. §2 is the biggest section this week — it is
                     your data model, and the whole point of writing it now is
                     that week 9 builds `state` from exactly this.
    §4  (the events) write "אין עדיין — שבוע 8" and nothing else. Do not invent
                     events you cannot implement; a spec you cannot build against
                     is worse than an empty section, because it looks finished.
    §7  (the review) filled AFTER you have built the pages, in writing. It is the
                     part that is graded most heavily, here and in the project.

  ── THE FEATURE
  "The collection, on three pages" — the data model plus the static UI. One file,
  this file. In the project you will have four or five of these, one per feature.
  ============================================================================
-->

# מפרט פיצ'ר — האוסף על שלושה עמודים

| | |
|---|---|
| **הקובץ** | `week-07/FEATURE_SPEC.md` |
| **שבוע** | 7 |
| **סטטוס** | טיוטה · אושר · מיושם · נבדק |

| | |
|---|---|
| **שם הסטודנט** | <!-- --> |
| **מספר זהות** | <!-- --> |
| **נושא הפרויקט** | <!-- --> |

## 1. מה המשתמש יכול לעשות אחרי זה, ולא יכול לפניו

<!--
  משפט אחד, מנקודת המבט של המשתמש. אם הוא מכיל "וגם" — יש לך שני פיצ'רים.
  השבוע הוא סטטי, אז נסח את מה שהמשתמש יכול לראות ולהגיע אליו.
-->

CODE HERE

## 2. מה משתנה ב-state

<!--
  **הסעיף הגדול של השבוע.** זה מודל הנתונים שלך, וממנו נבנה `state.js` בשבוע 9.

  כתוב את הפריט: שם שדה באנגלית, טיפוס, ודוגמה. שדה שיכול להיות חסר הוא `| null` —
  ותחליט את זה עכשיו, כי בשבוע 11 ה-API יחזיר בדיוק אותו חסר.

  אם אתה צריך שלוש ישויות — עצור. אחת. זה הכישלון היקר ביותר בפרויקט והוא מתגלה
  בשבוע 9 כשאין זמן להחליף.
-->

```js
// the item
{
  // CODE HERE - id, then your fields: name, type, and an example
}

// the whole state, as it will look in week 9
{
  // CODE HERE
}
```

| השדה | הטיפוס | יכול להיות חסר? | דוגמה |
|---|---|---|---|
| `id` | `string` | לא | `'a1'` |
| CODE HERE | | | |
| CODE HERE | | | |
| CODE HERE | | | |

## 3. מה משתנה על המסך

<!--
  לפי אזור, ולפי עמוד. תאר את מה שנוצר, לא את ה-CSS.
  **ולכל אזור שמציג נתונים — מה כתוב בו כשאין מה להציג.** בטקסט שיופיע בפועל.
-->

| העמוד | האזור | מה מוצג | מה כתוב כשריק |
|---|---|---|---|
| `index.html` | CODE HERE | | |
| `item.html` | CODE HERE | | |
| `summary.html` | CODE HERE | | |

## 4. האירועים

**אין עדיין — שבוע 8.**

<!-- אל תמלא כאן. אין התנהגות השבוע, ומפרט שמתאר אירועים שלא ניתן לממש נראה גמור
     ואינו. הסעיף הזה נפתח בשבוע הבא. -->

## 5. מקרי קצה

<!--
  לפחות שלושה, וכל אחד עם ההתנהגות הנכונה. גם בעמוד סטטי יש מקרי קצה, והם בדיוק
  אלה שהמסמך הזה קיים בשבילם:
  אוסף ריק · פריט בלי שדה אופציונלי · כותרת ארוכה מאוד · `item.html` עם מזהה שלא קיים.
-->

| המקרה | ההתנהגות הנכונה |
|---|---|
| CODE HERE | |
| CODE HERE | |
| CODE HERE | |

## 6. איך אני יודע שזה עובד

<!--
  דברים **שאפשר לראות**, בלי לפתוח את הקוד. זו גם רשימת הבדיקות שתריץ לפני commit.
  לא: "העמוד בנוי נכון". כן: "בעמוד הסיכום כתוב 4, ובעמוד הרשימה יש ארבע שורות".
-->

- [ ] CODE HERE
- [ ] CODE HERE
- [ ] CODE HERE

## 7. הביקורת — נמלא **אחרי** שהעמודים קיימים

<!--
  זה החלק שנספר בציון, וזה החלק שאי אפשר לזייף.

  השבוע ביקשת מ-Claude עזרה בבניית העמודים. מה חזר, ומה היה בו שלא ביקשת? חמש
  הטעויות שחוזרות, לפי סדר התדירות:
    1. הוא עשה גם משהו שלא ביקשת — נגע בקובץ אחר, "שיפר" משהו קיים.
    2. הוא השתמש במשהו שלא למדנו, ולפעמים במשהו שאסור בקורס.
    3. הוא הוסיף JavaScript לעמוד שאמור להיות סטטי השבוע.
    4. הוא דילג על מקרה קצה מסעיף 5 — כמעט תמיד המצב הריק.
    5. הוא צדק פחות ממה שנראה.

  אל תכתוב "הכול היה תקין". אם באמת לא מצאת כלום, כתוב מה בדקת ואיפה חיפשת.
-->

**מה ביקשתי בפועל:**

CODE HERE

**מה חזר, בשורה אחת:**

CODE HERE

**מה היה שגוי או מיותר, ואיך תיקנתי:**

| מה מצאתי | למה זה שגוי | מה עשיתי |
|---|---|---|
| CODE HERE | | |

**מה קיבלתי כמו שהוא, ואני יכול להסביר כל שורה בו:**

CODE HERE
