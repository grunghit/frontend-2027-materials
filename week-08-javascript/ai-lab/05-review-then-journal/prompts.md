# הפרומפטים — מחזור AI 5 · הביקורת, ואז היומן

שני פרומפטים, ממוספרים בהמשך למחזור 4. P3 מבקש מ-Claude לבקר את הקובץ שהוא עצמו כתב ב-P1, מול המפרט —
מה שהרבה אנשים עושים כשאין להם זמן לבקר בעצמם. P4 מדביק לו את השורה האדומה מהספסל. הקבצים: הקוד
שנבדק ב-`artifact/claude-p1/`, המפרט ב-`artifact/specs/`, מה שהספסל אמר ב-`artifact/bench-p1.txt`, ומה
שחזר ל-P3 ב-`artifact/claude-p3/review.md`.

## P3 — "בקר את עצמך"

**עברית (התמליל נכתב עם הנוסח הזה):**

```
בקר את filter-and-sort.js מול המפרט. לכל שורה בסעיף 2 ובסעיף 5 כתוב
אם הקוד עומד בה, ובאיזו שורה בקוד.

<כאן filter-and-sort.js, כמו שחזר ב-P1>
<כאן המפרט כולו>
```

**English:**

```
Review filter-and-sort.js against the spec. For every line of §2 and §5, say
whether the code satisfies it, and which line of the code does.

<filter-and-sort.js, as it came back to P1>
<the whole spec>
```

## P4 — הראיה מהספסל

**עברית (התמליל נכתב עם הנוסח הזה):**

```
הספסל אומר, בשורה "no query, sorted by year":
filterAndSort(books, "", "year") החזירה את הרשימה הנכונה,
ואחריה המערך שלי הוא [Emma, The Hobbit, dune, מיכאל שלי, Field notes] — סודר מחדש.
איזו שורה בקוד עושה את זה, ומה היה שגוי בביקורת שלך על סעיף 2?
```

**English:**

```
The bench says, on the row "no query, sorted by year":
filterAndSort(books, "", "year") returned the right list,
and afterwards my array is [Emma, The Hobbit, dune, מיכאל שלי, Field notes] — reordered.
Which line does that, and what was wrong in your review of §2?
```

## מה P3 מלמד, ולמה אין P3 "מתוקן"

אין פרומפט שהופך את P3 לביקורת. **הביקורת היא שלך**, והיא נשענת על מה שרץ — הספסל, הקונסול, חיפוש
בקובץ — לא על מה שהכותב אומר על הקוד שלו. P4 לא "מתקן את הבקשה"; הוא מביא ראיה. ברגע שיש ראיה, הוא
מוצא את השורה במשפט אחד. בלי הראיה, הוא מאשר את עצמו באותו נימוק שכתב את הבאג.
